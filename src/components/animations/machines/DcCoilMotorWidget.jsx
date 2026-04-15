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

/** Blender `dc_motor_blender.py` 사각 코일과 동일 비율 (회전축 = 로컬 Z, 루프는 XY 평면) */
const COIL_HALF_W = 0.6;
const COIL_HALF_H = 0.7;
const COIL_PATH_Z = 0;

/** API/폴백에서 나온 각속도 상한 (rad/s) — 시각화만 제한, 물리식과 무관 */
const OMEGA_VIS_MAX = 120;

/**
 * 영구자석 (N극 / S극)
 * - 자석은 자기장 방향 전환 시 좌우 위치가 바뀌어야 하므로 React에서 코드로 렌더링합니다.
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
 * 💡 새롭게 적용된 통합 모터 어셈블리 (Rotor + Stator)
 * 블렌더에서 만든 'dc_motor_full.glb' 파일의 구조를 분해하여 렌더링합니다.
 */
function MotorAssembly({ url, omegaRad, rotDir, showFlux, currentDir }) {
  // scene 전체가 아니라 내부 노드(nodes)를 가져옵니다.
  const { nodes } = useGLTF(url);
  const shaftRef = useRef(null);
  const angleRef = useRef(0);

  useFrame((_, dt) => {
    // rotDir이 0이면(전원 OFF) 회전 중지
    angleRef.current -= omegaRad * rotDir * dt;
    if (shaftRef.current) {
      // Z축(모터 샤프트 방향)을 기준으로 회전
      shaftRef.current.rotation.z = angleRef.current;
    }
  });

  return (
    <group>
      {/* 1. 고정부 (Stator: 배터리, 전선, 브러시) - 회전하지 않음 */}
      {nodes.Stator && <primitive object={nodes.Stator} />}

      {/* 2. 회전부 (Rotor: 축, 코일, 정류자) - shaftRef에 의해 동적으로 회전함 */}
      {nodes.Rotor && (
        <group ref={shaftRef}>
          <primitive object={nodes.Rotor} />
          {/* GLTF Rotor 루트의 로컬 변환과 동일하게 맞춰 코일 와이어와 겹침 */}
          <group
            position={nodes.Rotor.position}
            quaternion={nodes.Rotor.quaternion}
            scale={nodes.Rotor.scale}
          >
            <CurrentFlux enabled={showFlux} direction={currentDir} />
          </group>
        </group>
      )}
    </group>
  );
}

/**
 * 코일 주변을 흐르는 전류(Flux) 시각화
 * — Rotor와 같은 그룹·축(Z) 기준으로 직사각형 루프 (블렌더 코일 와이어와 동일 평면)
 */
function CurrentFlux({ enabled, direction }) {
  const hw = COIL_HALF_W;
  const hh = COIL_HALF_H;
  const z = COIL_PATH_Z;
  const path = [
    new THREE.Vector3(-hw, hh, z),
    new THREE.Vector3(hw, hh, z),
    new THREE.Vector3(hw, -hh, z),
    new THREE.Vector3(-hw, -hh, z),
    new THREE.Vector3(-hw, hh, z),
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
    phase.current += dt * 1.2 * direction;
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
  const [currentAmp, setCurrentAmp] = useState(4);
  const [currentForward, setCurrentForward] = useState(true);
  const [bForward, setBForward] = useState(true);
  const [omegaData, setOmegaData] = useState({
    omega_rad_s: 0,
    omega_rpm: 0,
    torque_scale_n_m: 0,
    rotation_direction: 1,
  });

  // 💡 주의: 새로 만든 통합 모델 파일의 이름으로 URL을 지정합니다.
  const motorGlbUrl = apiData?.coil_model_url ?? DEFAULT_DC_MOTOR_GLB;

  useEffect(() => {
    const t = setTimeout(async () => {
      try {
        // apiClient(Axios)를 사용하여 파라미터를 안전하게 전송
        const res = await apiClient.get("/api/machine/dc_coil_motor/omega", {
          params: {
            current_a: Math.abs(currentAmp),
            b_t: 0.8,
          },
        });

        // Axios는 응답 본문을 res.data에 담습니다.
        setOmegaData(res.data);
      } catch (error) {
        console.error("Failed to fetch omega data:", error);
        // API 실패 시 물리 경험식으로 임시 계산 (안정성을 위한 Fallback)
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

  // 전원 ON일 때만 회전·표시값 반영 (슬라이더 전류 → API/폴백 omega 가 그대로 반영되도록 상한만 둠)
  const omega = powerOn ? Math.min(OMEGA_VIS_MAX, rawOmega) : 0;
  const rpm = powerOn ? (omega * 30) / Math.PI : 0;
  const torque = powerOn ? rawTorque : 0;

  // 로렌츠 힘 방향 = 전류 방향 × 자기장 방향
  const currentDir = currentForward ? 1 : -1;
  const bDir = bForward ? 1 : -1;
  const rotDir = powerOn ? currentDir * bDir : 0;

  // 자석 배치 (bDir에 따라 좌우 위치 스왑)
  const magnetGap = 1.8;
  const nPosX = bDir >= 0 ? -magnetGap : magnetGap;
  const sPosX = -nPosX;
  const magnetZ = -1.0; // 코일 중심에 맞게 깊이 조정

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
        DC 모터 시뮬레이션 (통합 모델 제어)
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
            target={[0, 0, -1.0]} // 카메라가 모터 중심을 바라보게 조정
            minDistance={3}
            maxDistance={20}
          />
          <Suspense fallback={null}>
            {/* 💡 새로운 통합 모델 컴포넌트 호출 */}
            <MotorAssembly
              url={motorGlbUrl}
              omegaRad={omega}
              rotDir={rotDir}
              showFlux={powerOn}
              currentDir={currentDir}
            />

            {/* 자석 렌더링 (방향 토글 시 위치 변경) */}
            <Magnet type="N" position={[nPosX, 0, magnetZ]} />
            <Magnet type="S" position={[sPosX, 0, magnetZ]} />
          </Suspense>
        </Canvas>
      </div>

      <div style={{ padding: 12, background: C.surface }}>
        <div style={{ marginBottom: 10, display: "flex", gap: 8, alignItems: "center" }}>
          <button type="button" onClick={() => setPowerOn((v) => !v)}>
            {powerOn ? "전원 끄기" : "전원 켜기"}
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
          omega: {omega.toFixed(2)} rad/s | rpm: {Math.round(rpm)} | torque:{" "}
          {torque.toFixed(3)} N·m
        </div>
      </div>
    </div>
  );
}

// 💡 R3F 성능 최적화: 모델 미리 불러오기 (경로는 본인 프로젝트에 맞게 수정)
useGLTF.preload(DEFAULT_DC_MOTOR_GLB);
