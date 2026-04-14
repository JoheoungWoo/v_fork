/**
 * DcCoilMotorWidget.jsx  v5
 *
 * 핵심 수정:
 *  1. 자기력선 → drei <Line> 대신 TubeGeometry 사용
 *     (Vercel/WebGL 환경에서 lineWidth가 무시되는 문제 완전 해결)
 *     얇은 원통(tube)으로 만들어 색상 100% 표시
 *
 *  2. 코일 배치 + 회전축 수정
 *     - 이전: 코일이 XY 평면에 있고 Z축 회전 → 자석 방향과 맞지 않아 엉뚱하게 회전
 *     - 수정: 코일을 XZ 평면에 배치(실제 DC 모터처럼 자기장 B가 X축일 때)
 *             Y축 중심으로 회전(rotation_axis: "y")
 *             자석은 위아래(Y축), 코일은 가운데서 Y축 회전
 *
 *  3. 회전 방향: omegaData.rotation_direction(백엔드) × dt 그대로 적용
 */

import apiClient from "@/api/core/apiClient";
import { OrbitControls, Text, useGLTF } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Component,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as THREE from "three";
import MagneticFieldLines from "./MagneticFieldLines";

// ─── 색상 ─────────────────────────────────────────────────────────────────
const C = {
  bg: "#0f1117",
  surface: "#1a1d27",
  border: "#2a2e3e",
  text: "#e2e0d8",
  muted: "#7a7872",
  nRed: "#e84040",
  sBlue: "#3b8bd4",
  coil: "#d4900a",
  force: "#4caf50",
  field: "#00d4ff", // 밝은 하늘색
};

// ─── 자석 치수 ────────────────────────────────────────────────────────────
// 자석: 위(N, +Y) / 아래(S, -Y) 배치 — 실제 DC 모터 단면도 방향
// 코일은 XZ 평면에서 Y축 중심으로 회전
const MY = 2.2; // 자석 중심 Y 위치
const MW = 3.2; // 자석 X 방향 폭
const MD = 2.8; // 자석 Z 방향 깊이
const MT = 0.7; // 자석 Y 방향 두께
const INNER_Y = MY - MT / 2; // 자석 내면 Y ≈ 1.85

// ─── 코일 치수 (XZ 평면) ──────────────────────────────────────────────────
const CW = 1.8; // X 방향 폭 (active 변 — B와 수직)
const CD = 0.05; // Z 방향 깊이 (passive 변 — 얇게)
const CR = 0.07; // 전선 반지름

// ─── Tube 형태 자기력선 ───────────────────────────────────────────────────
/**
 * TubeGeometry로 만든 자기력선
 * WebGL lineWidth 제한을 우회 — 완전한 색상/굵기 표현
 * 방향: N(+Y) → S(-Y)
 */
function FieldTube({ x, z }) {
  const geo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(x, INNER_Y, z),
      new THREE.Vector3(x, 0, z),
      new THREE.Vector3(x, -INNER_Y, z),
    ]);
    return new THREE.TubeGeometry(curve, 12, 0.04, 8, false);
  }, [x, z]);

  return (
    <group>
      <mesh geometry={geo}>
        <meshBasicMaterial color={C.field} />
      </mesh>
      {/* 화살촉 — 중간(Y=0)에서 아래(-Y) 방향 */}
      <mesh position={[x, 0, z]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.09, 0.28, 8]} />
        <meshBasicMaterial color={C.field} />
      </mesh>
    </group>
  );
}

// ─── 원통 전선 헬퍼 ───────────────────────────────────────────────────────
function Wire({ from, to, r = CR, color = C.coil }) {
  const [fx, fy, fz] = from;
  const [tx, ty, tz] = to;
  const f = new THREE.Vector3(fx, fy, fz);
  const t = new THREE.Vector3(tx, ty, tz);
  const dir = new THREE.Vector3().subVectors(t, f);
  const len = dir.length();
  const mid = f.clone().addScaledVector(dir.clone().normalize(), len / 2);
  const q = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    dir.clone().normalize(),
  );
  return (
    <mesh position={[mid.x, mid.y, mid.z]} quaternion={q} castShadow>
      <cylinderGeometry args={[r, r, len, 12]} />
      <meshStandardMaterial color={color} metalness={0.9} roughness={0.12} />
    </mesh>
  );
}

// ─── 절차적 모터 씬 ───────────────────────────────────────────────────────
/**
 * 좌표계 정의 (플레밍의 왼손 법칙):
 *   B 방향: N(+Y) → S(-Y), 즉 -Y
 *   코일 active 변: X 방향 (전류 흐름)
 *   힘 F = I(+X) × B(-Y) = +Z 방향 → 코일이 Y축 중심으로 회전
 *
 * 코일은 XZ 평면에 배치, Y축 중심으로 회전
 */
function ProceduralMotor({ omegaRad, rotDir }) {
  const coilRef = useRef();
  const angleRef = useRef(0);

  useFrame((_, dt) => {
    angleRef.current += omegaRad * rotDir * dt;
    if (coilRef.current) {
      coilRef.current.rotation.y = angleRef.current;
    }
  });

  // 코일: XZ 평면 사각형
  // active 변: (-CW/2, 0, 0) ~ (CW/2, 0, 0) — X 방향 (B와 수직 → 힘 발생)
  // passive 변: 앞/뒤 Z 방향 (얇게 표현)
  const HALF = CW / 2;
  const DEPTH = 1.2; // Z 방향 깊이 (교육용으로 적당히)

  return (
    <group>
      {/* ── N극 자석 (위 +Y) ── */}
      <group position={[0, MY, 0]}>
        <mesh castShadow>
          <boxGeometry args={[MW, MT, MD]} />
          <meshStandardMaterial
            color={C.nRed}
            metalness={0.4}
            roughness={0.3}
          />
        </mesh>
        {/* 극면 발광 (아래쪽) */}
        <mesh position={[0, -(MT / 2 + 0.04), 0]}>
          <boxGeometry args={[MW - 0.2, 0.06, MD - 0.2]} />
          <meshStandardMaterial
            color="#ff6644"
            emissive="#ff2200"
            emissiveIntensity={0.6}
          />
        </mesh>
        <Text
          position={[0, MT / 2 + 0.1, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.7}
          color="#fff"
          anchorX="center"
          anchorY="middle"
        >
          N
        </Text>
      </group>

      {/* ── S극 자석 (아래 -Y) ── */}
      <group position={[0, -MY, 0]}>
        <mesh castShadow>
          <boxGeometry args={[MW, MT, MD]} />
          <meshStandardMaterial
            color={C.sBlue}
            metalness={0.4}
            roughness={0.3}
          />
        </mesh>
        <mesh position={[0, MT / 2 + 0.04, 0]}>
          <boxGeometry args={[MW - 0.2, 0.06, MD - 0.2]} />
          <meshStandardMaterial
            color="#5599ff"
            emissive="#1144cc"
            emissiveIntensity={0.6}
          />
        </mesh>
        <Text
          position={[0, -(MT / 2 + 0.1), 0]}
          rotation={[Math.PI / 2, 0, 0]}
          fontSize={0.7}
          color="#fff"
          anchorX="center"
          anchorY="middle"
        >
          S
        </Text>
      </group>

      {/* ── 자기력선 (N→S, Y축) — TubeGeometry 사용 ── */}
      {[-0.8, -0.3, 0, 0.3, 0.8].map((x) =>
        [-0.7, 0, 0.7].map((z) => (
          <FieldTube key={`f-${x}-${z}`} x={x} z={z} />
        )),
      )}

      {/* ── 사각형 코일 (XZ 평면, Y축 회전) ── */}
      <group ref={coilRef}>
        {/* active 변 — 앞(+Z) */}
        <Wire from={[-HALF, 0, DEPTH / 2]} to={[HALF, 0, DEPTH / 2]} />
        {/* active 변 — 뒤(-Z) */}
        <Wire from={[-HALF, 0, -DEPTH / 2]} to={[HALF, 0, -DEPTH / 2]} />
        {/* passive 변 — 오른쪽 */}
        <Wire from={[HALF, 0, -DEPTH / 2]} to={[HALF, 0, DEPTH / 2]} />
        {/* passive 변 — 왼쪽 */}
        <Wire from={[-HALF, 0, -DEPTH / 2]} to={[-HALF, 0, DEPTH / 2]} />

        {/* 코너 구 */}
        {[
          [-HALF, DEPTH / 2],
          [HALF, DEPTH / 2],
          [-HALF, -DEPTH / 2],
          [HALF, -DEPTH / 2],
        ].map(([x, z], i) => (
          <mesh key={i} position={[x, 0, z]}>
            <sphereGeometry args={[CR * 1.3, 10, 10]} />
            <meshStandardMaterial
              color={C.coil}
              metalness={0.95}
              roughness={0.1}
            />
          </mesh>
        ))}

        {/* 회전축 — Y 방향 */}
        <mesh>
          <cylinderGeometry args={[0.055, 0.055, MY * 2 + 0.6, 12]} />
          <meshStandardMaterial color="#aaa" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* 정류자 (Y+ 끝단) */}
        {[0, Math.PI].map((rot, i) => (
          <group key={i} position={[0, MY - 0.1, 0]} rotation={[0, rot, 0]}>
            <mesh>
              <cylinderGeometry
                args={[0.22, 0.22, 0.3, 16, 1, false, 0, Math.PI]}
              />
              <meshStandardMaterial
                color="#d4a800"
                metalness={1}
                roughness={0.05}
              />
            </mesh>
          </group>
        ))}

        {/* 전류 방향 화살표 (active 변, 앞) */}
        <mesh
          position={[HALF * 0.3, 0, DEPTH / 2]}
          rotation={[0, 0, Math.PI / 2]}
        >
          <coneGeometry args={[0.09, 0.25, 8]} />
          <meshBasicMaterial color={C.force} />
        </mesh>
        {/* 반대편 (뒤) */}
        <mesh
          position={[-HALF * 0.3, 0, -DEPTH / 2]}
          rotation={[0, 0, -Math.PI / 2]}
        >
          <coneGeometry args={[0.09, 0.25, 8]} />
          <meshBasicMaterial color={C.force} />
        </mesh>
      </group>

      {/* ── 브러시 (Y+ 방향) ── */}
      {[-0.27, 0.27].map((x, i) => (
        <mesh key={i} position={[x, MY - 0.05, 0]}>
          <boxGeometry args={[0.1, 0.18, 0.14]} />
          <meshStandardMaterial color="#444" metalness={0.3} roughness={0.7} />
        </mesh>
      ))}

      <gridHelper
        args={[12, 24, "#1e2235", "#1a1d2a"]}
        position={[0, -3.2, 0]}
      />
    </group>
  );
}

// ─── GLB 로더 ─────────────────────────────────────────────────────────────
function GlbMotorModel({
  modelUrl,
  omegaRad,
  rotDir,
  coilObjectName,
  rotAxis = "y",
}) {
  const { scene } = useGLTF(modelUrl);
  const coilRef = useRef(null);
  const angleRef = useRef(0);

  useEffect(() => {
    if (!scene || !coilObjectName) return;
    coilRef.current = scene.getObjectByName(coilObjectName) ?? null;
  }, [scene, coilObjectName]);

  // DcCoilMotorWidget.jsx 내부
  useFrame((state, delta) => {
    if (!coilRef.current || !apiData?.computed_reference) return;

    const speedRpm = apiData.computed_reference.at_2A_0p35T_rpm;
    const direction = apiData.computed_reference.at_2A_0p35T_direction || 1;
    const axis = apiData.rotation_axis || "y"; // 파이썬에서 넘겨준 "y" 축 사용

    // RPM을 초당 라디안(rad/s)으로 변환하여 delta(프레임 시간차)와 곱함
    const speedRadPerSec = (speedRpm * 2 * Math.PI) / 60;

    // 지정된 축을 기준으로 회전 (이전 프레임 회전값에 누적)
    coilRef.current.rotation[axis] += speedRadPerSec * direction * delta;
  });

  return <primitive object={scene} />;
}

// ─── GLB 오류 경계 ────────────────────────────────────────────────────────
class GlbErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(err) {
    console.warn("GLB 폴백:", err?.message);
    this.props.onFail?.();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

// ─── 씬 루트 ─────────────────────────────────────────────────────────────
function MotorScene({ omegaRad, rotDir, apiData }) {
  const [glbFailed, setGlbFailed] = useState(!apiData?.model_url);
  const fallback = <ProceduralMotor omegaRad={omegaRad} rotDir={rotDir} />;

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 6, 5]} intensity={1.4} castShadow />
      <pointLight
        position={[0, MY, 0]}
        color={C.nRed}
        intensity={0.9}
        distance={8}
      />
      <pointLight
        position={[0, -MY, 0]}
        color={C.sBlue}
        intensity={0.9}
        distance={8}
      />

      <OrbitControls
        enablePan
        enableZoom
        enableRotate
        target={[0, 0, 0]}
        minDistance={4}
        maxDistance={20}
      />

      {apiData?.model_url && !glbFailed ? (
        <Suspense fallback={fallback}>
          <GlbErrorBoundary onFail={() => setGlbFailed(true)}>
            <GlbMotorModel
              modelUrl={apiData.model_url}
              omegaRad={omegaRad}
              rotDir={rotDir}
              coilObjectName={apiData.coil_object_name}
              rotAxis={apiData.rotation_axis ?? "y"}
            />
          </GlbErrorBoundary>
        </Suspense>
      ) : (
        fallback
      )}
    </>
  );
}

// ─── UI ───────────────────────────────────────────────────────────────────
function SliderRow({ label, unit, value, min, max, step, onChange, color }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 5,
          fontSize: 12,
          color: C.muted,
        }}
      >
        <span>{label}</span>
        <span
          style={{
            color: color ?? C.text,
            fontWeight: 600,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {value.toFixed(2)} {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{
          width: "100%",
          accentColor: color ?? C.text,
          cursor: "pointer",
        }}
      />
    </div>
  );
}

function MetricCard({ label, value, unit, color }) {
  return (
    <div
      style={{
        background: C.surface,
        border: `0.5px solid ${C.border}`,
        borderRadius: 8,
        padding: "10px 14px",
        flex: 1,
        minWidth: 90,
      }}
    >
      <div
        style={{
          fontSize: 10,
          color: C.muted,
          marginBottom: 4,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 20,
          fontWeight: 500,
          color: color ?? C.text,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
        <span style={{ fontSize: 11, marginLeft: 4, color: C.muted }}>
          {unit}
        </span>
      </div>
    </div>
  );
}

// ─── 메인 ────────────────────────────────────────────────────────────────
export default function DcCoilMotorWidget({ apiData }) {
  const def = apiData?.defaults ?? {};
  const phys = apiData?.physics_constants ?? {};
  const path = apiData?.omega_api_path ?? "/api/machine/dc_coil_motor/omega";

  const [currentA, setCurrentA] = useState(def.current_a ?? 2.0);
  const [bTesla, setBTesla] = useState(def.b_tesla ?? 0.35);
  const [omegaData, setOmegaData] = useState(null);
  const [fetching, setFetching] = useState(false);

  const calcLocal = useCallback(
    (i, b) => {
      const n = phys.n_turns ?? 12,
        a = phys.area_m2 ?? 0.012;
      const g = phys.motor_gain ?? 380,
        d = phys.damping ?? 0.18;
      const cap = phys.omega_cap_rad_s ?? 72;
      const ia = Math.abs(i);
      const raw = (g * n * a * ia * b) / (1 + d * ia * b + 0.05 * ia * ia);
      const omega = Math.min(cap, Math.max(0, raw));
      return {
        omega_rad_s: omega,
        omega_rpm: (omega * 30) / Math.PI,
        torque_scale_n_m: n * a * ia * b,
        rotation_direction: i >= 0 ? 1 : -1,
      };
    },
    [phys],
  );

  const fetchOmega = useCallback(
    async (i, b) => {
      setFetching(true);
      try {
        const res = await apiClient.get(path, {
          params: {
            current_a: i,
            b_t: b,
            n_turns: phys.n_turns ?? 12,
            area_m2: phys.area_m2 ?? 0.012,
            motor_gain: phys.motor_gain ?? 380,
            damping: phys.damping ?? 0.18,
            omega_cap_rad_s: phys.omega_cap_rad_s ?? 72,
          },
        });
        setOmegaData(res.data);
      } catch {
        setOmegaData(calcLocal(i, b));
      } finally {
        setFetching(false);
      }
    },
    [path, phys, calcLocal],
  );

  useEffect(() => {
    const t = setTimeout(() => fetchOmega(currentA, bTesla), 280);
    return () => clearTimeout(t);
  }, [currentA, bTesla, fetchOmega]);

  const omega = omegaData?.omega_rad_s ?? 0;
  const rpm = omegaData?.omega_rpm ?? 0;
  const torque = omegaData?.torque_scale_n_m ?? 0;
  const rotDir = omegaData?.rotation_direction ?? 1;
  const dirLabel = rotDir >= 0 ? "↺ CCW (반시계)" : "↻ CW (시계)";

  return (
    <div
      style={{
        background: C.bg,
        borderRadius: 12,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        color: C.text,
        border: `0.5px solid ${C.border}`,
        fontFamily: "var(--font-sans, 'Pretendard', 'Segoe UI', sans-serif)",
      }}
    >
      {/* 헤더 */}
      <div
        style={{
          padding: "14px 18px",
          borderBottom: `0.5px solid ${C.border}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <div style={{ fontSize: 16, fontWeight: 600 }}>
            {apiData?.title ?? "DC 사각형 코일 모터"}
          </div>
          {apiData?.subtitle && (
            <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>
              {apiData.subtitle}
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {omegaData && (
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: rotDir >= 0 ? C.force : C.nRed,
                padding: "3px 10px",
                background: C.surface,
                borderRadius: 6,
                border: `0.5px solid ${C.border}`,
              }}
            >
              {dirLabel}
            </span>
          )}
          {fetching && (
            <span
              style={{
                fontSize: 11,
                color: C.muted,
                padding: "3px 10px",
                background: C.surface,
                borderRadius: 6,
                border: `0.5px solid ${C.border}`,
              }}
            >
              연산 중…
            </span>
          )}
        </div>
      </div>

      {/* 3D */}
      <div style={{ height: 480, background: C.bg }}>
        <Canvas
          camera={{ position: [5, 3, 7], fov: 48 }}
          shadows
          style={{ height: "100%", width: "100%" }}
          gl={{ antialias: true }}
        >
          <MotorScene omegaRad={omega} rotDir={rotDir} apiData={apiData} />
          <MagneticFieldLines b_tesla={apiData.defaults.b_tesla} />
        </Canvas>
      </div>

      {/* 하단 */}
      <div
        style={{
          padding: "16px 18px",
          borderTop: `0.5px solid ${C.border}`,
          background: C.surface,
          display: "flex",
          gap: 24,
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: "1 1 220px", minWidth: 200 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: C.muted,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: 12,
            }}
          >
            파라미터 제어
          </div>
          <SliderRow
            label="전류 I"
            unit="A"
            value={currentA}
            min={def.current_min_a ?? 0}
            max={def.current_max_a ?? 10}
            step={0.1}
            onChange={setCurrentA}
            color={C.nRed}
          />
          <SliderRow
            label="자기장 B"
            unit="T"
            value={bTesla}
            min={def.b_min_t ?? 0}
            max={def.b_max_t ?? 1.2}
            step={0.01}
            onChange={setBTesla}
            color={C.sBlue}
          />
        </div>

        <div style={{ flex: "1 1 220px", minWidth: 200 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: C.muted,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: 12,
            }}
          >
            연산 결과
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <MetricCard
              label="각속도"
              value={omega.toFixed(1)}
              unit="rad/s"
              color={C.force}
            />
            <MetricCard
              label="RPM"
              value={Math.round(rpm)}
              unit="rpm"
              color={C.coil}
            />
            <MetricCard
              label="토크"
              value={torque.toFixed(3)}
              unit="N·m"
              color={C.field}
            />
          </div>
        </div>

        {apiData?.formula_panel && (
          <div style={{ flex: "0 0 auto", minWidth: 160 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: C.muted,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: 12,
              }}
            >
              {apiData.formula_panel.heading}
            </div>
            {apiData.formula_panel.items.map((it, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 8,
                  marginBottom: 6,
                  fontSize: 13,
                }}
              >
                <span style={{ color: C.muted, minWidth: 44 }}>{it.label}</span>
                <span style={{ fontFamily: "monospace", color: C.text }}>
                  {it.expr}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {apiData?.notes?.length > 0 && (
        <div
          style={{
            padding: "10px 18px",
            borderTop: `0.5px solid ${C.border}`,
            fontSize: 11,
            color: C.muted,
            lineHeight: 1.7,
          }}
        >
          {apiData.notes.map((n, i) => (
            <div key={i}>• {n}</div>
          ))}
        </div>
      )}
    </div>
  );
}
