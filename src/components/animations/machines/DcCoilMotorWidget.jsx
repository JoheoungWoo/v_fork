/**
 * DcCoilMotorWidget.jsx  v4
 *
 * 핵심 수정:
 *  1. 자기력선: <line> primitive → @react-three/drei <Line> 컴포넌트
 *     (lineBasicMaterial은 WebGL에서 두께/색상이 무시되는 경우 있음)
 *     → Line color="#00d4ff" lineWidth={2} 로 밝은 하늘색 확실히 표시
 *  2. Wire 컴포넌트: THREE.Vector3 생성 방식 수정
 *     (스프레드 연산자 대신 명시적 인자)
 *  3. 회전 방향: omegaData.rotation_direction (백엔드) 적용
 *  4. 화살촉: 자기력선 중간에 cone으로 N→S 방향 표시
 */

import apiClient from "@/api/core/apiClient";
import { Line, OrbitControls, Text, useGLTF } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Component,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import * as THREE from "three";

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
  field: "#00d4ff", // ★ 밝은 하늘색
};

// ─── 자석·코일 치수 ───────────────────────────────────────────────────────
const MX = 2.4; // 자석 중심 X
const MT = 0.7; // 자석 두께
const IX = MX - MT / 2; // 자석 내면 X ≈ 2.05
const CW = 2.2; // 코일 폭 (X)
const CH = 1.8; // 코일 높이 (Y)
const CR = 0.07; // 전선 반지름

// ─── 원통 전선 ────────────────────────────────────────────────────────────
function Wire({ x1, y1, z1, x2, y2, z2, r = CR, color = C.coil }) {
  const from = new THREE.Vector3(x1, y1, z1);
  const to = new THREE.Vector3(x2, y2, z2);
  const dir = new THREE.Vector3().subVectors(to, from);
  const len = dir.length();
  const mid = from.clone().addScaledVector(dir.clone().normalize(), len / 2);
  const quat = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    dir.clone().normalize(),
  );
  return (
    <mesh position={[mid.x, mid.y, mid.z]} quaternion={quat} castShadow>
      <cylinderGeometry args={[r, r, len, 12]} />
      <meshStandardMaterial color={color} metalness={0.9} roughness={0.12} />
    </mesh>
  );
}

// ─── 자기력선 1행 ─────────────────────────────────────────────────────────
/**
 * drei <Line> 사용 → color/lineWidth 100% 반영됨
 * N극(+IX) → S극(−IX) 방향
 */
function FieldLine({ y, z }) {
  // N→S 방향으로 3단계 포인트 (화살촉 위치 계산용)
  const pts = [
    new THREE.Vector3(IX, y, z),
    new THREE.Vector3(IX * 0.5, y, z),
    new THREE.Vector3(0, y, z),
    new THREE.Vector3(-IX * 0.5, y, z),
    new THREE.Vector3(-IX, y, z),
  ];

  return (
    <group>
      {/* ★ drei Line — color/lineWidth 확실히 동작 */}
      <Line
        points={pts}
        color={C.field}
        lineWidth={2}
        transparent
        opacity={0.9}
      />
      {/* 화살촉 — 중간 지점에서 −X 방향 */}
      <mesh position={[0, y, z]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.06, 0.2, 8]} />
        <meshBasicMaterial color={C.field} />
      </mesh>
    </group>
  );
}

// ─── 절차적 모터 씬 ───────────────────────────────────────────────────────
function ProceduralMotor({ omegaRad, rotDir, rotAxis }) {
  const coilRef = useRef();
  const angleRef = useRef(0);

  useFrame((_, dt) => {
    // ★ 백엔드 rotation_direction 반영
    angleRef.current += omegaRad * rotDir * dt;
    if (!coilRef.current) return;
    if (rotAxis === "x") coilRef.current.rotation.x = angleRef.current;
    else if (rotAxis === "y") coilRef.current.rotation.y = angleRef.current;
    else coilRef.current.rotation.z = angleRef.current;
  });

  return (
    <group>
      {/* ── N극 (오른쪽 +X) ── */}
      <group position={[MX, 0, 0]}>
        <mesh castShadow>
          <boxGeometry args={[MT, 2.4, 3.2]} />
          <meshStandardMaterial
            color={C.nRed}
            metalness={0.4}
            roughness={0.3}
          />
        </mesh>
        {/* 극면 발광 */}
        <mesh position={[-(MT / 2 + 0.04), 0, 0]}>
          <boxGeometry args={[0.06, 2.2, 3.0]} />
          <meshStandardMaterial
            color="#ff6644"
            emissive="#ff2200"
            emissiveIntensity={0.6}
          />
        </mesh>
        <Text
          position={[MT / 2 + 0.12, 0, 0]}
          rotation={[0, -Math.PI / 2, 0]}
          fontSize={0.75}
          color="#fff"
          anchorX="center"
          anchorY="middle"
        >
          N
        </Text>
      </group>

      {/* ── S극 (왼쪽 −X) ── */}
      <group position={[-MX, 0, 0]}>
        <mesh castShadow>
          <boxGeometry args={[MT, 2.4, 3.2]} />
          <meshStandardMaterial
            color={C.sBlue}
            metalness={0.4}
            roughness={0.3}
          />
        </mesh>
        <mesh position={[MT / 2 + 0.04, 0, 0]}>
          <boxGeometry args={[0.06, 2.2, 3.0]} />
          <meshStandardMaterial
            color="#5599ff"
            emissive="#1144cc"
            emissiveIntensity={0.6}
          />
        </mesh>
        <Text
          position={[-(MT / 2 + 0.12), 0, 0]}
          rotation={[0, Math.PI / 2, 0]}
          fontSize={0.75}
          color="#fff"
          anchorX="center"
          anchorY="middle"
        >
          S
        </Text>
      </group>

      {/* ── 자기력선 — ★ drei <Line> 사용, 밝은 하늘색 ── */}
      {[-0.65, 0, 0.65].map((z) =>
        [-0.6, 0, 0.6].map((y) => (
          <FieldLine key={`f-${z}-${y}`} y={y} z={z} />
        )),
      )}

      {/* ── 사각형 코일 (Z축 회전 피벗) ── */}
      <group ref={coilRef}>
        {/* 상변 */}
        <Wire x1={-CW / 2} y1={CH / 2} z1={0} x2={CW / 2} y2={CH / 2} z2={0} />
        {/* 하변 */}
        <Wire
          x1={-CW / 2}
          y1={-CH / 2}
          z1={0}
          x2={CW / 2}
          y2={-CH / 2}
          z2={0}
        />
        {/* 좌변 */}
        <Wire
          x1={-CW / 2}
          y1={-CH / 2}
          z1={0}
          x2={-CW / 2}
          y2={CH / 2}
          z2={0}
        />
        {/* 우변 */}
        <Wire x1={CW / 2} y1={-CH / 2} z1={0} x2={CW / 2} y2={CH / 2} z2={0} />

        {/* 코너 구 */}
        {[
          [-CW / 2, CH / 2],
          [CW / 2, CH / 2],
          [-CW / 2, -CH / 2],
          [CW / 2, -CH / 2],
        ].map(([x, y], i) => (
          <mesh key={i} position={[x, y, 0]}>
            <sphereGeometry args={[CR * 1.3, 10, 10]} />
            <meshStandardMaterial
              color={C.coil}
              metalness={0.95}
              roughness={0.1}
            />
          </mesh>
        ))}

        {/* 회전축 — Z 방향 */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.055, 0.055, 5.5, 12]} />
          <meshStandardMaterial color="#aaa" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* 정류자 반환 */}
        {[0, Math.PI].map((rot, i) => (
          <group
            key={i}
            position={[0, CH / 2 + 0.25, 0]}
            rotation={[0, rot, 0]}
          >
            <mesh>
              <cylinderGeometry
                args={[0.22, 0.22, 0.28, 16, 1, false, 0, Math.PI]}
              />
              <meshStandardMaterial
                color="#d4a800"
                metalness={1}
                roughness={0.05}
              />
            </mesh>
          </group>
        ))}

        {/* 전류 방향 화살표 */}
        <mesh position={[CW * 0.18, CH / 2, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.09, 0.25, 8]} />
          <meshBasicMaterial color={C.force} />
        </mesh>
        <mesh
          position={[-CW * 0.18, -CH / 2, 0]}
          rotation={[0, 0, Math.PI / 2]}
        >
          <coneGeometry args={[0.09, 0.25, 8]} />
          <meshBasicMaterial color={C.force} />
        </mesh>
      </group>

      {/* ── 브러시 ── */}
      {[-0.27, 0.27].map((x, i) => (
        <mesh key={i} position={[x, CH / 2 + 0.25, 0]}>
          <boxGeometry args={[0.1, 0.18, 0.14]} />
          <meshStandardMaterial color="#444" metalness={0.3} roughness={0.7} />
        </mesh>
      ))}

      <gridHelper args={[12, 24, "#1e2235", "#1a1d2a"]} position={[0, -2, 0]} />
    </group>
  );
}

// ─── GLB 모델 로더 ────────────────────────────────────────────────────────
function GlbMotorModel({
  modelUrl,
  omegaRad,
  rotDir,
  coilObjectName,
  rotAxis = "z",
}) {
  const { scene } = useGLTF(modelUrl);
  const coilRef = useRef(null);
  const angleRef = useRef(0);

  useEffect(() => {
    if (!scene || !coilObjectName) return;
    coilRef.current = scene.getObjectByName(coilObjectName) ?? null;
  }, [scene, coilObjectName]);

  useFrame((_, dt) => {
    angleRef.current += omegaRad * rotDir * dt;
    if (!coilRef.current) return;
    if (rotAxis === "x") coilRef.current.rotation.x = angleRef.current;
    else if (rotAxis === "y") coilRef.current.rotation.y = angleRef.current;
    else coilRef.current.rotation.z = angleRef.current;
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
    if (this.state.failed) return null;
    return this.props.children;
  }
}

// ─── 씬 루트 ─────────────────────────────────────────────────────────────
function MotorScene({ omegaRad, rotDir, apiData }) {
  const [glbFailed, setGlbFailed] = useState(!apiData?.model_url);
  const rotAxis = apiData?.rotation_axis ?? "z";

  const fallback = (
    <ProceduralMotor omegaRad={omegaRad} rotDir={rotDir} rotAxis={rotAxis} />
  );

  return (
    <>
      <ambientLight intensity={0.65} />
      <directionalLight position={[5, 8, 6]} intensity={1.4} castShadow />
      <pointLight
        position={[MX, 0, 0]}
        color={C.nRed}
        intensity={1.1}
        distance={10}
      />
      <pointLight
        position={[-MX, 0, 0]}
        color={C.sBlue}
        intensity={1.1}
        distance={10}
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
              rotAxis={rotAxis}
            />
          </GlbErrorBoundary>
        </Suspense>
      ) : (
        fallback
      )}
    </>
  );
}

// ─── UI helpers ───────────────────────────────────────────────────────────
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
  const rotDir = omegaData?.rotation_direction ?? 1; // ★ 백엔드가 결정
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

      {/* 3D 캔버스 */}
      <div style={{ height: 460, background: C.bg }}>
        <Canvas
          camera={{ position: [0, 2.5, 8], fov: 50 }}
          shadows
          style={{ height: "100%", width: "100%" }}
          gl={{ antialias: true }}
        >
          <MotorScene omegaRad={omega} rotDir={rotDir} apiData={apiData} />
        </Canvas>
      </div>

      {/* 하단 패널 */}
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
        {/* 슬라이더 */}
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

        {/* 수치 카드 */}
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

        {/* 수식 */}
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

      {/* 노트 */}
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
