/**
 * DcCoilMotorWidget.jsx
 *
 * React Three Fiber(R3F) + drei로 DC 모터(코일·자석·전원)를 3D로 그리고,
 * apiClient(Axios)를 통해 백엔드 API에서 각속도·토크 등을 받아 애니메이션에 반영합니다.
 */

import { Line, OrbitControls, Text, useGLTF } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useEffect, useRef, useState } from "react";
import * as THREE from "three";

// 💡 프로젝트 경로에 맞게 apiClient를 불러옵니다.
import apiClient from "@/api/core/apiClient";

/** Vite public 폴더의 GLB — base URL(서브패스 배포)과 preload가 항상 동일 */
const DEFAULT_DC_MOTOR_GLB = `${import.meta.env.BASE_URL}models/dc_motor_full.glb`;

const C = {
  bg: "#0f1117",
  surface: "#1a1d27",
  border: "#2a2e3e",
  text: "#e2e0d8",
  muted: "#7a7872",
};

/** 💡 120이면 모니터 주사율 한계로 멈춰보입니다. 시각적 부드러움을 위해 15로 조정 */
const OMEGA_VIS_MAX = 15;

/**
 * 영구자석 (N극 / S극)
 */
function Magnet({ type, position }) {
  const isN = type === "N";
  const color = isN ? "#ff3b30" : "#007aff";

  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[0.6, 1.6, 4.5]} />
        <meshStandardMaterial color={color} metalness={0.3} roughness={0.5} />
      </mesh>
      <Text
        position={[isN ? 0.31 : -0.31, 0, 0]}
        rotation={[0, isN ? Math.PI / 2 : -Math.PI / 2, 0]}
        fontSize={0.8}
        color="white"
        fontWeight="bold"
      >
        {type}
      </Text>
    </group>
  );
}

/**
 * 모터 어셈블리 (Rotor + Stator)
 */
function MotorAssembly({
  url,
  omegaRad,
  rotDir,
  showFlux,
  currentDir,
  currentAmp,
  rotationResetKey,
}) {
  const { nodes } = useGLTF(url);
  const shaftRef = useRef(null);
  const angleRef = useRef(0);

  useEffect(() => {
    angleRef.current = 0;
    if (shaftRef.current) {
      shaftRef.current.rotation.z = 0;
    }
  }, [rotationResetKey]);

  useFrame((_, dt) => {
    angleRef.current -= omegaRad * rotDir * dt;
    if (shaftRef.current) {
      shaftRef.current.rotation.z = angleRef.current;
    }
  });

  return (
    <group>
      {nodes.Stator && <primitive object={nodes.Stator} />}

      {nodes.Rotor && (
        <group ref={shaftRef}>
          {/* 💡 primitive 자체를 shaftRef 안에 바로 넣어야 완벽히 일치합니다. */}
          <primitive object={nodes.Rotor} />

          {/* 💡 추가 래퍼 없이 같은 로컬 좌표계에서 전류 렌더링 */}
          <CurrentFlux
            enabled={showFlux}
            direction={currentDir}
            currentAmp={currentAmp}
          />
        </group>
      )}
    </group>
  );
}

/**
 * 코일 주변을 흐르는 전류(Flux) 시각화
 */
function CurrentFlux({ enabled, direction, currentAmp }) {
  // 💡 블렌더 모델과 소수점까지 일치하는 완벽한 궤적 좌표
  const path = [
    new THREE.Vector3(0.2, -1.5, 0), // 우측 브러시
    new THREE.Vector3(1.2, -1.0, 0), // 우측 하단
    new THREE.Vector3(1.2, 3.0, 0), // 우측 상단
    new THREE.Vector3(-1.2, 3.0, 0), // 좌측 상단
    new THREE.Vector3(-1.2, -1.0, 0), // 좌측 하단
    new THREE.Vector3(-0.2, -1.5, 0), // 좌측 브러시
  ];

  const particles = 24;
  const refs = useRef([]);
  const phase = useRef(0);

  const sample = (t) => {
    const segs = path.length - 1;
    const wrapped = ((t % 1) + 1) % 1;
    const s = wrapped * segs;
    const i = Math.floor(s);
    const f = s - i;
    const a = path[i];
    const b = path[i + 1];
    return a.clone().lerp(b, f);
  };

  useFrame((_, dt) => {
    if (!enabled) return;

    // 💡 전류 크기(currentAmp)에 비례해서 입자의 시각적 이동 속도도 증가!
    const visualSpeed = 0.5 + currentAmp * 0.15;
    phase.current += dt * visualSpeed * direction;

    for (let i = 0; i < particles; i += 1) {
      const r = refs.current[i];
      if (!r) continue;
      const p = sample(phase.current + i / particles);
      r.position.set(p.x, p.y, p.z);
    }
  });

  return (
    <group visible={enabled}>
      <Line
        points={path}
        color="#ffe66d"
        lineWidth={3}
        transparent
        opacity={0.6}
      />
      {Array.from({ length: particles }).map((_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
        >
          <sphereGeometry args={[0.04, 12, 12]} />
          <meshBasicMaterial color="#ffe34d" />
        </mesh>
      ))}
    </group>
  );
}

/**
 * 메인 위젯 컴포넌트
 */
export default function DcCoilMotorWidget({ apiData }) {
  const [powerOn, setPowerOn] = useState(false);
  const [rotationResetKey, setRotationResetKey] = useState(0);
  const [currentAmp, setCurrentAmp] = useState(4);
  const [currentForward, setCurrentForward] = useState(true);
  const [bForward, setBForward] = useState(true);
  const [omegaData, setOmegaData] = useState({
    omega_rad_s: 0,
    omega_rpm: 0,
    torque_scale_n_m: 0,
    rotation_direction: 1,
  });

  const motorGlbUrl = apiData?.coil_model_url ?? DEFAULT_DC_MOTOR_GLB;

  useEffect(() => {
    const t = setTimeout(async () => {
      try {
        const res = await apiClient.get("/api/machine/dc_coil_motor/omega", {
          params: {
            current_a: Math.abs(currentAmp),
            b_t: 0.8,
          },
        });
        setOmegaData(res.data);
      } catch (error) {
        console.error("Failed to fetch omega data:", error);
        const i = Math.abs(currentAmp);
        const b = 0.8;
        const omega = Math.min(
          72,
          (380 * 12 * 0.012 * i * b) / (1 + 0.18 * i * b + 0.05 * i * i),
        );
        setOmegaData({
          omega_rad_s: omega,
          omega_rpm: (omega * 30) / Math.PI,
          torque_scale_n_m: 12 * 0.012 * i * b,
          rotation_direction: 1,
        });
      }
    }, 180);
    return () => clearTimeout(t);
  }, [currentAmp]);

  const rawOmega = Math.max(0, omegaData.omega_rad_s ?? 0);
  const rawTorque = Math.max(0, omegaData.torque_scale_n_m ?? 0);

  // 💡 회전 속도를 OMEGA_VIS_MAX(15)로 제한하여 부드러운 애니메이션 확보
  const omega = powerOn ? Math.min(OMEGA_VIS_MAX, rawOmega) : 0;

  // 하단 수치는 제한 없이 실제 물리 값(rawOmega)을 기반으로 정확하게 표시
  const displayRpm = powerOn ? (rawOmega * 30) / Math.PI : 0;
  const displayTorque = powerOn ? rawTorque : 0;

  const currentDir = currentForward ? 1 : -1;
  const bDir = bForward ? 1 : -1;
  const rotDir = powerOn ? currentDir * bDir : 0;

  const magnetGap = 1.8;
  const nPosX = bDir >= 0 ? -magnetGap : magnetGap;
  const sPosX = -nPosX;
  const magnetZ = -1.0;

  return (
    <div
      style={{
        background: C.bg,
        color: C.text,
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        overflow: "hidden",
        fontFamily: "Segoe UI,sans-serif",
      }}
    >
      <div
        style={{
          padding: 12,
          borderBottom: `1px solid ${C.border}`,
          fontWeight: 600,
        }}
      >
        DC 모터 시뮬레이션 (동기화 및 동적 속도 반영)
      </div>

      <div style={{ height: 480 }}>
        <Canvas
          camera={{ position: [0, 4, 7], fov: 50 }}
          shadows
          gl={{ antialias: true }}
        >
          <ambientLight intensity={0.75} />
          <directionalLight position={[4, 6, 5]} intensity={1.4} castShadow />
          <OrbitControls
            target={[0, 0, -1.0]}
            minDistance={3}
            maxDistance={20}
          />
          <Suspense fallback={null}>
            <MotorAssembly
              url={motorGlbUrl}
              omegaRad={omega}
              rotDir={rotDir}
              showFlux={powerOn}
              currentDir={currentDir}
              currentAmp={currentAmp}
              rotationResetKey={rotationResetKey}
            />

            <Magnet type="N" position={[nPosX, 0, magnetZ]} />
            <Magnet type="S" position={[sPosX, 0, magnetZ]} />
          </Suspense>
        </Canvas>
      </div>

      <div style={{ padding: 12, background: C.surface }}>
        <div
          style={{
            marginBottom: 10,
            display: "flex",
            gap: 8,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <button type="button" onClick={() => setPowerOn((v) => !v)}>
            {powerOn ? "전원 끄기" : "전원 켜기"}
          </button>
          <button
            type="button"
            onClick={() => setRotationResetKey((k) => k + 1)}
            title="로터(코일) 회전 각도를 0으로 맞춥니다"
          >
            초기화
          </button>
          <span style={{ fontSize: 12, color: powerOn ? "#9cffb5" : C.muted }}>
            {powerOn ? "가동 중 (전류·토크 반영)" : "정지 (전원 대기)"}
          </span>
        </div>
        <div style={{ marginBottom: 8 }}>
          전류 크기 I: {currentAmp.toFixed(2)} A
        </div>
        <input
          type="range"
          min={0}
          max={10}
          step={0.1}
          value={currentAmp}
          onChange={(e) => setCurrentAmp(Number(e.target.value))}
          style={{ width: "100%", marginBottom: 10 }}
        />
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          <button type="button" onClick={() => setCurrentForward((v) => !v)}>
            전류 방향: {currentForward ? "정방향" : "역방향"}
          </button>
          <button type="button" onClick={() => setBForward((v) => !v)}>
            자기장 방향: {bForward ? "N→S" : "S→N"}
          </button>
        </div>

        <div style={{ marginTop: 6, fontSize: 13, color: C.muted }}>
          omega: {rawOmega.toFixed(2)} rad/s | rpm: {Math.round(displayRpm)} |
          torque: {displayTorque.toFixed(3)} N·m
        </div>
      </div>
    </div>
  );
}

useGLTF.preload(DEFAULT_DC_MOTOR_GLB);
