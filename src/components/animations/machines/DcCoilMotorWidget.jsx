/**
 * DcCoilMotorWidget.jsx  (수정판 v3)
 *
 * 수정사항:
 *  1. 회전 방향 → 백엔드 omegaData.rotation_direction (+1/-1) 으로 결정
 *     angleRef.current += omegaRad * rotation_direction * dt
 *  2. 자기장선(전기력선/전속) → 밝은 하늘색 #00d4ff, opacity 0.85, linewidth 증가
 *  3. 자기장 화살촉 추가 → N→S 방향을 시각적으로 명확히 표시
 */

import apiClient from "@/api/core/apiClient";
import { OrbitControls, Text, useGLTF } from "@react-three/drei";
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

// ─── 색상 상수 ────────────────────────────────────────────────────────────
const DARK = {
  bg: "#0f1117",
  surface: "#1a1d27",
  border: "#2a2e3e",
  text: "#e2e0d8",
  muted: "#7a7872",
  nRed: "#e84040",
  sBlue: "#3b8bd4",
  coil: "#d4900a",
  force: "#4caf50",
  // ★ 자기장선: 검정에서 밝은 하늘색으로
  field: "#00d4ff",
};

// ─── 자석 치수 ────────────────────────────────────────────────────────────
const MAGNET_X = 2.4;
const MAGNET_THICK = 0.7;
const INNER_X = MAGNET_X - MAGNET_THICK / 2; // ≈ 2.05

// ─── 코일 치수 ────────────────────────────────────────────────────────────
const W = 2.2;
const H = 1.8;
const R = 0.07;

// ─── 원통 전선 헬퍼 ───────────────────────────────────────────────────────
function Wire({ from, to, radius = R, color = DARK.coil }) {
  const f = new THREE.Vector3(...from);
  const t = new THREE.Vector3(...to);
  const dir = new THREE.Vector3().subVectors(t, f);
  const len = dir.length();
  const mid = f.clone().addScaledVector(dir.clone().normalize(), len / 2);
  const q = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    dir.clone().normalize(),
  );
  return (
    <mesh position={mid.toArray()} quaternion={q} castShadow>
      <cylinderGeometry args={[radius, radius, len, 12]} />
      <meshStandardMaterial color={color} metalness={0.95} roughness={0.1} />
    </mesh>
  );
}

// ─── 자기장선 1개 (선 + 화살촉) ──────────────────────────────────────────
/**
 * N극(+X) → S극(−X) 방향으로 그려지는 자기장선.
 * lineBasicMaterial은 linewidth가 WebGL에서 항상 1px이므로
 * 화살촉(cone)을 추가해 시각적 강조.
 */
function FieldLine({ y, z }) {
  // 선 포인트: N쪽 내면 → S쪽 내면
  const pts = new Float32Array([INNER_X, y, z, -INNER_X, y, z]);

  return (
    <group>
      {/* 선 */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={pts}
            itemSize={3}
            count={2}
          />
        </bufferGeometry>
        {/* ★ 밝은 하늘색, opacity 높임 */}
        <lineBasicMaterial color={DARK.field} transparent opacity={0.85} />
      </line>

      {/* 화살촉 — S쪽(−X) 방향 */}
      <mesh position={[-INNER_X * 0.4, y, z]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.055, 0.18, 8]} />
        <meshBasicMaterial color={DARK.field} transparent opacity={0.9} />
      </mesh>
    </group>
  );
}

// ─── 절차적 모터 씬 ───────────────────────────────────────────────────────
/**
 * rotationDirection: 백엔드가 준 +1(CCW) / -1(CW).
 * useFrame 내부에서 angleRef += omegaRad * rotationDirection * dt
 */
function ProceduralMotor({ omegaRad, rotationDirection, apiData }) {
  const coilRef = useRef();
  const angleRef = useRef(0);
  const rotAxis = apiData?.rotation_axis ?? "z";

  useFrame((_, dt) => {
    // ★ 회전 방향은 백엔드 rotation_direction 이 결정
    angleRef.current += omegaRad * rotationDirection * dt;
    if (!coilRef.current) return;
    if (rotAxis === "z") coilRef.current.rotation.z = angleRef.current;
    else if (rotAxis === "x") coilRef.current.rotation.x = angleRef.current;
    else coilRef.current.rotation.y = angleRef.current;
  });

  return (
    <group>
      {/* ══ N극 자석 (오른쪽 +X) ══ */}
      <group position={[MAGNET_X, 0, 0]}>
        <mesh castShadow>
          <boxGeometry args={[MAGNET_THICK, 2.4, 3.2]} />
          <meshStandardMaterial
            color={DARK.nRed}
            metalness={0.4}
            roughness={0.3}
          />
        </mesh>
        {/* 극면 발광 */}
        <mesh position={[-(MAGNET_THICK / 2 + 0.04), 0, 0]}>
          <boxGeometry args={[0.06, 2.2, 3.0]} />
          <meshStandardMaterial
            color="#ff6644"
            emissive="#ff2200"
            emissiveIntensity={0.55}
            metalness={0.6}
            roughness={0.1}
          />
        </mesh>
        <Text
          position={[MAGNET_THICK / 2 + 0.1, 0, 0]}
          rotation={[0, -Math.PI / 2, 0]}
          fontSize={0.75}
          color="#fff"
          anchorX="center"
          anchorY="middle"
        >
          N
        </Text>
      </group>

      {/* ══ S극 자석 (왼쪽 −X) ══ */}
      <group position={[-MAGNET_X, 0, 0]}>
        <mesh castShadow>
          <boxGeometry args={[MAGNET_THICK, 2.4, 3.2]} />
          <meshStandardMaterial
            color={DARK.sBlue}
            metalness={0.4}
            roughness={0.3}
          />
        </mesh>
        <mesh position={[MAGNET_THICK / 2 + 0.04, 0, 0]}>
          <boxGeometry args={[0.06, 2.2, 3.0]} />
          <meshStandardMaterial
            color="#5599ff"
            emissive="#1144cc"
            emissiveIntensity={0.55}
            metalness={0.6}
            roughness={0.1}
          />
        </mesh>
        <Text
          position={[-(MAGNET_THICK / 2 + 0.1), 0, 0]}
          rotation={[0, Math.PI / 2, 0]}
          fontSize={0.75}
          color="#fff"
          anchorX="center"
          anchorY="middle"
        >
          S
        </Text>
      </group>

      {/* ══ 자기장선 (N→S) — ★ 밝은 하늘색, 화살촉 포함 ══ */}
      {[-0.6, 0, 0.6].map((z) =>
        [-0.55, 0, 0.55].map((y) => (
          <FieldLine key={`fl-${z}-${y}`} y={y} z={z} />
        )),
      )}

      {/* ══ 사각형 코일 피벗 ══ */}
      <group ref={coilRef}>
        {/* 4변 전선 */}
        <Wire from={[-W / 2, H / 2, 0]} to={[W / 2, H / 2, 0]} />
        <Wire from={[-W / 2, -H / 2, 0]} to={[W / 2, -H / 2, 0]} />
        <Wire from={[-W / 2, -H / 2, 0]} to={[-W / 2, H / 2, 0]} />
        <Wire from={[W / 2, -H / 2, 0]} to={[W / 2, H / 2, 0]} />

        {/* 코너 구 */}
        {[
          [-W / 2, H / 2],
          [W / 2, H / 2],
          [-W / 2, -H / 2],
          [W / 2, -H / 2],
        ].map(([x, y], i) => (
          <mesh key={i} position={[x, y, 0]}>
            <sphereGeometry args={[R * 1.2, 10, 10]} />
            <meshStandardMaterial
              color={DARK.coil}
              metalness={0.95}
              roughness={0.1}
            />
          </mesh>
        ))}

        {/* 회전축 (Z 방향) */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.055, 0.055, 5.5, 12]} />
          <meshStandardMaterial color="#aaa" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* 정류자 반환 */}
        {[0, Math.PI].map((rot, i) => (
          <group key={i} position={[0, H / 2 + 0.25, 0]} rotation={[0, rot, 0]}>
            <mesh>
              <cylinderGeometry
                args={[0.22, 0.22, 0.28, 16, 1, false, 0, Math.PI]}
              />
              <meshStandardMaterial
                color="#d4a800"
                metalness={1.0}
                roughness={0.05}
              />
            </mesh>
          </group>
        ))}

        {/* 전류 방향 화살표 (상변) */}
        <mesh position={[W * 0.18, H / 2, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.09, 0.25, 8]} />
          <meshBasicMaterial color={DARK.force} />
        </mesh>
        {/* 전류 방향 화살표 (하변, 반대) */}
        <mesh position={[-W * 0.18, -H / 2, 0]} rotation={[0, 0, Math.PI / 2]}>
          <coneGeometry args={[0.09, 0.25, 8]} />
          <meshBasicMaterial color={DARK.force} />
        </mesh>
      </group>

      {/* ══ 브러시 ══ */}
      {[-0.27, 0.27].map((x, i) => (
        <mesh key={i} position={[x, H / 2 + 0.25, 0]}>
          <boxGeometry args={[0.1, 0.18, 0.14]} />
          <meshStandardMaterial color="#333" metalness={0.3} roughness={0.7} />
        </mesh>
      ))}

      {/* 바닥 그리드 */}
      <gridHelper
        args={[12, 24, "#1e2235", "#1a1d2a"]}
        position={[0, -2.0, 0]}
      />
    </group>
  );
}

// ─── GLB 모델 로더 ────────────────────────────────────────────────────────
function GlbMotorModel({
  modelUrl,
  omegaRad,
  rotationDirection,
  coilObjectName,
  rotationAxis = "z",
}) {
  const { scene } = useGLTF(modelUrl);
  const coilRef = useRef(null);
  const angleRef = useRef(0);

  useEffect(() => {
    if (!scene || !coilObjectName) return;
    coilRef.current = scene.getObjectByName(coilObjectName) ?? null;
  }, [scene, coilObjectName]);

  useFrame((_, dt) => {
    // ★ 백엔드 rotation_direction 적용
    angleRef.current += omegaRad * rotationDirection * dt;
    if (!coilRef.current) return;
    if (rotationAxis === "z") coilRef.current.rotation.z = angleRef.current;
    else if (rotationAxis === "x")
      coilRef.current.rotation.x = angleRef.current;
    else coilRef.current.rotation.y = angleRef.current;
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
    console.warn("GLB 로드 실패 → 절차적 폴백:", err?.message ?? err);
    this.props.onFail?.();
  }
  render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}

// ─── 씬 루트 ─────────────────────────────────────────────────────────────
function MotorScene({ omegaRad, rotationDirection, apiData }) {
  const [glbFailed, setGlbFailed] = useState(!apiData?.model_url);

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 6]} intensity={1.4} castShadow />
      <pointLight
        position={[MAGNET_X, 0, 0]}
        color={DARK.nRed}
        intensity={1.0}
        distance={10}
      />
      <pointLight
        position={[-MAGNET_X, 0, 0]}
        color={DARK.sBlue}
        intensity={1.0}
        distance={10}
      />

      <OrbitControls
        enablePan
        enableZoom
        enableRotate
        target={[0, 0, 0]}
        minDistance={4}
        maxDistance={18}
      />

      {apiData?.model_url && !glbFailed ? (
        <Suspense
          fallback={
            <ProceduralMotor
              omegaRad={omegaRad}
              rotationDirection={rotationDirection}
              apiData={apiData}
            />
          }
        >
          <GlbErrorBoundary onFail={() => setGlbFailed(true)}>
            <GlbMotorModel
              modelUrl={apiData.model_url}
              omegaRad={omegaRad}
              rotationDirection={rotationDirection}
              coilObjectName={apiData.coil_object_name}
              rotationAxis={apiData.rotation_axis}
            />
          </GlbErrorBoundary>
        </Suspense>
      ) : (
        <ProceduralMotor
          omegaRad={omegaRad}
          rotationDirection={rotationDirection}
          apiData={apiData}
        />
      )}
    </>
  );
}

// ─── UI: 슬라이더 ─────────────────────────────────────────────────────────
function SliderRow({
  label,
  unit,
  value,
  min,
  max,
  step = 0.05,
  onChange,
  color,
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 5,
          fontSize: 12,
          color: DARK.muted,
        }}
      >
        <span>{label}</span>
        <span
          style={{
            color: color ?? DARK.text,
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
          accentColor: color ?? DARK.text,
          cursor: "pointer",
        }}
      />
    </div>
  );
}

// ─── UI: 수치 카드 ────────────────────────────────────────────────────────
function MetricCard({ label, value, unit, color }) {
  return (
    <div
      style={{
        background: DARK.surface,
        border: `0.5px solid ${DARK.border}`,
        borderRadius: 8,
        padding: "10px 14px",
        flex: 1,
        minWidth: 90,
      }}
    >
      <div
        style={{
          fontSize: 10,
          color: DARK.muted,
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
          color: color ?? DARK.text,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
        <span style={{ fontSize: 11, marginLeft: 4, color: DARK.muted }}>
          {unit}
        </span>
      </div>
    </div>
  );
}

// ─── 메인 export ─────────────────────────────────────────────────────────
export default function DcCoilMotorWidget({ apiData }) {
  const def = apiData?.defaults ?? {};
  const phys = apiData?.physics_constants ?? {};
  const omegaApiPath =
    apiData?.omega_api_path ?? "/api/machine/dc_coil_motor/omega";

  const [currentA, setCurrentA] = useState(def.current_a ?? 2.0);
  const [bTesla, setBTesla] = useState(def.b_tesla ?? 0.35);
  const [omegaData, setOmegaData] = useState(null);
  const [fetching, setFetching] = useState(false);

  // 로컬 폴백 (네트워크 없을 때) — rotation_direction 포함
  const calcLocal = useCallback(
    (i, b) => {
      const gain = phys.motor_gain ?? 380.0;
      const nT = phys.n_turns ?? 12;
      const area = phys.area_m2 ?? 0.012;
      const damp = phys.damping ?? 0.18;
      const cap = phys.omega_cap_rad_s ?? 72.0;
      const iAbs = Math.abs(i);
      const raw =
        (gain * nT * area * iAbs * b) /
        (1 + damp * iAbs * b + 0.05 * iAbs * iAbs);
      const omega = Math.min(cap, Math.max(0, raw));
      return {
        omega_rad_s: omega,
        omega_rpm: (omega * 30) / Math.PI,
        torque_scale_n_m: nT * area * iAbs * b,
        // ★ 로컬에서도 방향 계산
        rotation_direction: i >= 0 ? 1 : -1,
      };
    },
    [phys],
  );

  const fetchOmega = useCallback(
    async (i, b) => {
      setFetching(true);
      try {
        const res = await apiClient.get(omegaApiPath, {
          params: {
            current_a: i,
            b_t: b,
            n_turns: phys.n_turns ?? 12,
            area_m2: phys.area_m2 ?? 0.012,
            motor_gain: phys.motor_gain ?? 380.0,
            damping: phys.damping ?? 0.18,
            omega_cap_rad_s: phys.omega_cap_rad_s ?? 72.0,
          },
        });
        setOmegaData(res.data);
      } catch {
        // 백엔드 연결 실패 → 로컬 계산
        setOmegaData(calcLocal(i, b));
      } finally {
        setFetching(false);
      }
    },
    [omegaApiPath, phys, calcLocal],
  );

  useEffect(() => {
    const t = setTimeout(() => fetchOmega(currentA, bTesla), 280);
    return () => clearTimeout(t);
  }, [currentA, bTesla, fetchOmega]);

  const omega = omegaData?.omega_rad_s ?? 0;
  const rpm = omegaData?.omega_rpm ?? 0;
  const torque = omegaData?.torque_scale_n_m ?? 0;
  // ★ 백엔드가 준 rotation_direction — 없으면 +1(기본 CCW)
  const rotDir = omegaData?.rotation_direction ?? 1;
  const dirLabel = rotDir >= 0 ? "CCW (반시계)" : "CW (시계)";

  return (
    <div
      style={{
        background: DARK.bg,
        borderRadius: 12,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        color: DARK.text,
        border: `0.5px solid ${DARK.border}`,
        fontFamily: "var(--font-sans, 'Pretendard', 'Segoe UI', sans-serif)",
      }}
    >
      {/* 헤더 */}
      <div
        style={{
          padding: "14px 18px",
          borderBottom: `0.5px solid ${DARK.border}`,
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
            <div style={{ fontSize: 12, color: DARK.muted, marginTop: 3 }}>
              {apiData.subtitle}
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {/* ★ 회전 방향 배지 */}
          {omegaData && (
            <div
              style={{
                fontSize: 11,
                color: rotDir >= 0 ? DARK.force : DARK.nRed,
                padding: "3px 10px",
                background: DARK.surface,
                borderRadius: 6,
                border: `0.5px solid ${DARK.border}`,
                fontWeight: 600,
              }}
            >
              {dirLabel}
            </div>
          )}
          {fetching && (
            <div
              style={{
                fontSize: 11,
                color: DARK.muted,
                padding: "3px 10px",
                background: DARK.surface,
                borderRadius: 6,
                border: `0.5px solid ${DARK.border}`,
              }}
            >
              연산 중…
            </div>
          )}
        </div>
      </div>

      {/* 3D 캔버스 */}
      <div style={{ height: 460, background: DARK.bg }}>
        <Canvas
          camera={{ position: [0, 2.5, 8], fov: 50 }}
          shadows
          style={{ height: "100%", width: "100%" }}
          gl={{ antialias: true }}
        >
          <MotorScene
            omegaRad={omega}
            rotationDirection={rotDir}
            apiData={apiData}
          />
        </Canvas>
      </div>

      {/* 하단 패널 */}
      <div
        style={{
          padding: "16px 18px",
          borderTop: `0.5px solid ${DARK.border}`,
          background: DARK.surface,
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
              color: DARK.muted,
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
            color={DARK.nRed}
          />
          <SliderRow
            label="자기장 B"
            unit="T"
            value={bTesla}
            min={def.b_min_t ?? 0}
            max={def.b_max_t ?? 1.2}
            step={0.01}
            onChange={setBTesla}
            color={DARK.sBlue}
          />
        </div>

        {/* 수치 카드 */}
        <div style={{ flex: "1 1 220px", minWidth: 200 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: DARK.muted,
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
              color={DARK.force}
            />
            <MetricCard
              label="RPM"
              value={Math.round(rpm)}
              unit="rpm"
              color={DARK.coil}
            />
            <MetricCard
              label="토크"
              value={torque.toFixed(3)}
              unit="N·m"
              color={DARK.field}
            />
          </div>
        </div>

        {/* 수식 패널 */}
        {apiData?.formula_panel && (
          <div style={{ flex: "0 0 auto", minWidth: 160 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: DARK.muted,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: 12,
              }}
            >
              {apiData.formula_panel.heading}
            </div>
            {apiData.formula_panel.items.map((item, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 8,
                  marginBottom: 6,
                  fontSize: 13,
                  alignItems: "baseline",
                }}
              >
                <span style={{ color: DARK.muted, minWidth: 44 }}>
                  {item.label}
                </span>
                <span style={{ fontFamily: "monospace", color: DARK.text }}>
                  {item.expr}
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
            borderTop: `0.5px solid ${DARK.border}`,
            fontSize: 11,
            color: DARK.muted,
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
