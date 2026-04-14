/**
 * DcCoilMotorWidget.jsx
 *
 * DC 사각형 코일 모터 — 플레밍의 왼손 법칙 3D 시뮬레이터
 *
 * 아키텍처:
 *  - MachineWidgetPage → apiData (type: "dc_coil_motor_3d") → DcCoilMotorWidget
 *  - 슬라이더(I, B) 변경 → GET /api/machine/dc_coil_motor/omega → omega_rad_s → Three.js 코일 회전
 *  - GLB 모델(model_url) 우선 로드, 실패 시 절차적 Three.js 폴백(fallback) 렌더
 *
 * 의존: @react-three/fiber, @react-three/drei, three, axios(apiClient)
 */

import apiClient from "@/api/core/apiClient";
import { OrbitControls, Text, useGLTF } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";

// ─── 상수 ─────────────────────────────────────────────────────────────────
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
  field: "#4488cc",
};

// ─── 절차적 코일 모터 씬 (GLB 폴백) ───────────────────────────────────────
/**
 * 사각형 코일: 상/하 변(active) + 좌/우 변(passive)
 * pivot(coilRoot) 이 Y축 회전 → coilObjectName 이 있으면 GLB 오브젝트만 회전
 */
function ProceduralMotor({ omegaRad, apiData }) {
  const coilRef = useRef();
  const arrow1Ref = useRef();
  const arrow2Ref = useRef();
  const angleRef = useRef(0);

  const rotationAxis = apiData?.rotation_axis ?? "z";
  const W = 1.8,
    H = 2.0,
    R = 0.07;

  useFrame((_, dt) => {
    angleRef.current += omegaRad * dt;
    if (coilRef.current) {
      if (rotationAxis === "z") coilRef.current.rotation.z = angleRef.current;
      else if (rotationAxis === "x")
        coilRef.current.rotation.x = angleRef.current;
      else coilRef.current.rotation.y = angleRef.current;
    }

    // 힘 벡터 화살표: sin(θ)에 비례하는 크기
    const s = Math.abs(Math.sin(angleRef.current));
    [arrow1Ref, arrow2Ref].forEach((r) => {
      if (r.current) r.current.scale.setScalar(0.3 + s * 0.9);
    });
  });

  // 원통 wire 헬퍼
  const Wire = ({ from, to, r = R }) => {
    const dir = new THREE.Vector3(...to).sub(new THREE.Vector3(...from));
    const len = dir.length();
    const mid = new THREE.Vector3(...from).addScaledVector(
      dir.normalize(),
      len / 2,
    );
    const q = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      dir.clone().normalize(),
    );
    return (
      <mesh position={mid.toArray()} quaternion={q} castShadow>
        <cylinderGeometry args={[r, r, len, 12]} />
        <meshStandardMaterial
          color={DARK.coil}
          metalness={0.95}
          roughness={0.1}
        />
      </mesh>
    );
  };

  return (
    <group>
      {/* ── N극 자석 (오른쪽 +X) ── */}
      <group position={[3.4, 0, 0]}>
        <mesh castShadow>
          <boxGeometry args={[1.2, 2.2, 3.0]} />
          <meshStandardMaterial
            color={DARK.nRed}
            metalness={0.4}
            roughness={0.3}
          />
        </mesh>
        {/* 극면 발광 */}
        <mesh position={[-0.62, 0, 0]}>
          <boxGeometry args={[0.08, 2.0, 2.8]} />
          <meshStandardMaterial
            color="#ff6644"
            emissive="#ff2200"
            emissiveIntensity={0.45}
            metalness={0.6}
            roughness={0.15}
          />
        </mesh>
        <Text
          position={[0.7, 0, 0]}
          rotation={[0, -Math.PI / 2, 0]}
          fontSize={0.7}
          color="#fff"
        >
          N
        </Text>
      </group>

      {/* ── S극 자석 (왼쪽 −X) ── */}
      <group position={[-3.4, 0, 0]}>
        <mesh castShadow>
          <boxGeometry args={[1.2, 2.2, 3.0]} />
          <meshStandardMaterial
            color={DARK.sBlue}
            metalness={0.4}
            roughness={0.3}
          />
        </mesh>
        <mesh position={[0.62, 0, 0]}>
          <boxGeometry args={[0.08, 2.0, 2.8]} />
          <meshStandardMaterial
            color="#5599ff"
            emissive="#1144cc"
            emissiveIntensity={0.45}
            metalness={0.6}
            roughness={0.15}
          />
        </mesh>
        <Text
          position={[-0.7, 0, 0]}
          rotation={[0, Math.PI / 2, 0]}
          fontSize={0.7}
          color="#fff"
        >
          S
        </Text>
      </group>

      {/* ── 자기장선 (N→S, X축) ── */}
      {[-0.7, 0, 0.7].map((z) =>
        [-0.6, 0, 0.6].map((y) => (
          <line key={`fl-${z}-${y}`}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                array={new Float32Array([2.78, y, z, -2.78, y, z])}
                itemSize={3}
                count={2}
              />
            </bufferGeometry>
            <lineBasicMaterial color={DARK.field} transparent opacity={0.35} />
          </line>
        )),
      )}

      {/* ── 사각형 코일 (회전 피벗) ── */}
      <group ref={coilRef}>
        {/* 4변 */}
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
            <sphereGeometry args={[R * 1.15, 10, 10]} />
            <meshStandardMaterial
              color={DARK.coil}
              metalness={0.95}
              roughness={0.1}
            />
          </mesh>
        ))}

        {/* 회전축 */}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.055, 0.055, 5.0, 12]} />
          <meshStandardMaterial color="#888" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* 정류자 반환 */}
        {[0, Math.PI].map((rot, i) => (
          <group key={i} position={[0, H / 2 + 0.28, 0]} rotation={[0, rot, 0]}>
            <mesh>
              <cylinderGeometry
                args={[0.22, 0.22, 0.3, 16, 1, false, 0, Math.PI]}
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
        <group ref={arrow1Ref} position={[(W / 2) * 0.3, H / 2, 0]}>
          <mesh rotation={[0, 0, -Math.PI / 2]}>
            <coneGeometry args={[0.1, 0.28, 8]} />
            <meshBasicMaterial color={DARK.force} />
          </mesh>
        </group>
        {/* 전류 방향 화살표 (하변) */}
        <group ref={arrow2Ref} position={[(-W / 2) * 0.3, -H / 2, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <coneGeometry args={[0.1, 0.28, 8]} />
            <meshBasicMaterial color={DARK.force} />
          </mesh>
        </group>
      </group>

      {/* ── 브러시 ── */}
      {[-0.26, 0.26].map((x, i) => (
        <mesh key={i} position={[x, H / 2 + 0.28, 0]}>
          <boxGeometry args={[0.1, 0.18, 0.14]} />
          <meshStandardMaterial color="#333" metalness={0.3} roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

// ─── GLB 모델 로더 (model_url 있을 때) ─────────────────────────────────────
function GlbMotorModel({
  modelUrl,
  omegaRad,
  coilObjectName,
  rotationAxis = "z",
}) {
  const { scene } = useGLTF(modelUrl);
  const coilRef = useRef();
  const angleRef = useRef(0);

  // coilObjectName 에 해당하는 오브젝트 찾기
  useEffect(() => {
    if (!scene || !coilObjectName) return;
    const obj = scene.getObjectByName(coilObjectName);
    coilRef.current = obj ?? null;
  }, [scene, coilObjectName]);

  useFrame((_, dt) => {
    angleRef.current += omegaRad * dt;
    if (coilRef.current) {
      if (rotationAxis === "z") coilRef.current.rotation.z = angleRef.current;
      else if (rotationAxis === "x")
        coilRef.current.rotation.x = angleRef.current;
      else coilRef.current.rotation.y = angleRef.current;
    }
  });

  return <primitive object={scene} />;
}

// ─── 씬 루트 (GLB 우선, 오류 시 절차적) ───────────────────────────────────
function MotorScene({ omegaRad, apiData }) {
  const [glbFailed, setGlbFailed] = useState(!apiData?.model_url);

  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[6, 8, 5]} intensity={1.4} castShadow />
      <pointLight
        position={[3, 0, 0]}
        color={DARK.nRed}
        intensity={0.9}
        distance={10}
      />
      <pointLight
        position={[-3, 0, 0]}
        color={DARK.sBlue}
        intensity={0.9}
        distance={10}
      />

      <OrbitControls enablePan enableZoom enableRotate />

      {apiData?.model_url && !glbFailed ? (
        <Suspense
          fallback={<ProceduralMotor omegaRad={omegaRad} apiData={apiData} />}
        >
          <GlbErrorBoundary onFail={() => setGlbFailed(true)}>
            <GlbMotorModel
              modelUrl={apiData.model_url}
              omegaRad={omegaRad}
              coilObjectName={apiData.coil_object_name}
              rotationAxis={apiData.rotation_axis}
            />
          </GlbErrorBoundary>
        </Suspense>
      ) : (
        <ProceduralMotor omegaRad={omegaRad} apiData={apiData} />
      )}
    </>
  );
}

// ─── GLB 오류 경계 (클래스 컴포넌트) ──────────────────────────────────────
import { Component } from "react";
class GlbErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFail?.();
  }
  render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}

// ─── 슬라이더 + 수치 패널 ──────────────────────────────────────────────────
function SliderRow({
  label,
  unit,
  value,
  min,
  max,
  step = 0.05,
  onChange,
  color = DARK.text,
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
          style={{ color, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}
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
          accentColor: color,
          cursor: "pointer",
          height: 4,
        }}
      />
    </div>
  );
}

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

// ─── 메인 컴포넌트 ─────────────────────────────────────────────────────────
/**
 * @param {{ apiData: import("./types").DcCoilMotorApiData }} props
 */
export default function DcCoilMotorWidget({ apiData }) {
  const def = apiData?.defaults ?? {};
  const phys = apiData?.physics_constants ?? {};
  const omegaApiPath =
    apiData?.omega_api_path ?? "/api/machine/dc_coil_motor/omega";

  const [currentA, setCurrentA] = useState(def.current_a ?? 2.0);
  const [bTesla, setBTesla] = useState(def.b_tesla ?? 0.35);
  const [omegaData, setOmegaData] = useState(null);
  const [fetching, setFetching] = useState(false);

  // 백엔드 omega 요청
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
      } catch (e) {
        console.error("dc_coil omega fetch failed:", e);
        // 폴백: 간단 계산
        const raw =
          (380.0 * (phys.n_turns ?? 12) * (phys.area_m2 ?? 0.012) * i * b) /
          (1 + 0.18 * i * b + 0.05 * i * i);
        const omega = Math.min(phys.omega_cap_rad_s ?? 72, Math.max(0, raw));
        setOmegaData({
          omega_rad_s: omega,
          omega_rpm: (omega * 30) / Math.PI,
          torque_scale_n_m:
            (phys.n_turns ?? 12) * (phys.area_m2 ?? 0.012) * i * b,
        });
      } finally {
        setFetching(false);
      }
    },
    [omegaApiPath, phys],
  );

  // 슬라이더 변경 시 디바운스 요청
  useEffect(() => {
    const t = setTimeout(() => fetchOmega(currentA, bTesla), 280);
    return () => clearTimeout(t);
  }, [currentA, bTesla, fetchOmega]);

  const omega = omegaData?.omega_rad_s ?? 0;
  const rpm = omegaData?.omega_rpm ?? 0;
  const torque = omegaData?.torque_scale_n_m ?? 0;

  return (
    <div
      style={{
        background: DARK.bg,
        borderRadius: 12,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        fontFamily: "var(--font-sans, 'Segoe UI', sans-serif)",
        color: DARK.text,
        border: `0.5px solid ${DARK.border}`,
      }}
    >
      {/* ── 헤더 ── */}
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
        {fetching && (
          <div
            style={{
              fontSize: 11,
              color: DARK.muted,
              padding: "3px 8px",
              background: DARK.surface,
              borderRadius: 6,
              border: `0.5px solid ${DARK.border}`,
            }}
          >
            연산 중…
          </div>
        )}
      </div>

      {/* ── 3D 캔버스 ── */}
      <div style={{ height: 460, background: DARK.bg }}>
        <Canvas
          camera={{ position: [5.5, 3.5, 7], fov: 45 }}
          shadows
          style={{ height: "100%", width: "100%" }}
          gl={{ antialias: true }}
        >
          <MotorScene omegaRad={omega} apiData={apiData} />
        </Canvas>
      </div>

      {/* ── 하단 패널 ── */}
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

      {/* ── 노트 ── */}
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
