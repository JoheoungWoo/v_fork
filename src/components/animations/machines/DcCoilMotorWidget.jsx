import { Line, OrbitControls, Text, useGLTF } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useEffect, useRef, useState } from "react";
import * as THREE from "three";

const C = {
  bg: "#0f1117",
  surface: "#1a1d27",
  border: "#2a2e3e",
  text: "#e2e0d8",
  muted: "#7a7872",
};

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

function RotatingCoil({ url, omegaRad, rotDir, showFlux, currentDir }) {
  const { scene } = useGLTF(url);
  const shaftRef = useRef(null);
  const angleRef = useRef(0);

  useFrame((_, dt) => {
    // 💡 회전축을 모터의 샤프트(Z축) 방향으로 고정
    angleRef.current -= omegaRad * rotDir * dt;
    if (shaftRef.current) {
      shaftRef.current.rotation.z = angleRef.current;
    }
  });

  return (
    <group ref={shaftRef}>
      {/* 💡 핵심: 원본 블렌더 모델(X-Y평면)을 X축 기준 90도 회전시켜 바닥(X-Z)으로 완벽히 눕힘 */}
      <group rotation={[Math.PI / 2, 0, 0]}>
        <primitive object={scene} />
        {/* 전류 효과를 코일과 같은 그룹 안에 넣어 완전히 동기화시킴 */}
        <CurrentFlux enabled={showFlux} direction={currentDir} />
      </group>
    </group>
  );
}

function PowerSupply({ powerOn }) {
  const wireColor = powerOn ? "#ffd84d" : "#5a5a5a";
  return (
    <group position={[0, -0.35, 2.5]}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.72, 0.3, 0.26]} />
        <meshStandardMaterial
          color={powerOn ? "#f1f1f1" : "#8e8e8e"}
          metalness={0.4}
          roughness={0.4}
        />
      </mesh>
      <mesh position={[-0.15, 0.09, 0.13]}>
        <boxGeometry args={[0.06, 0.06, 0.02]} />
        <meshStandardMaterial color="#2fa8ff" />
      </mesh>
      <mesh position={[0.15, 0.09, 0.13]}>
        <boxGeometry args={[0.06, 0.06, 0.02]} />
        <meshStandardMaterial color="#ff4a4a" />
      </mesh>
      <Line
        points={[
          [-0.15, 0.08, -0.12],
          [-0.15, 0.08, -1.5],
        ]}
        color={wireColor}
        lineWidth={2}
      />
      <Line
        points={[
          [0.15, 0.08, -0.12],
          [0.15, 0.08, -1.5],
        ]}
        color={wireColor}
        lineWidth={2}
      />
    </group>
  );
}

function CurrentFlux({ enabled, direction }) {
  // 💡 수정된 부분: 블렌더 파이썬 코드의 실린더 좌표(-1.2 ~ 1.2, -0.5 ~ 3.5)와 100% 일치시킴
  const path = [
    new THREE.Vector3(0.7, -0.5, 0), // 정류자 우측
    new THREE.Vector3(1.2, -0.5, 0), // 우측 코일 진입점
    new THREE.Vector3(1.2, 3.5, 0), // 우측 코일 끝점
    new THREE.Vector3(-1.2, 3.5, 0), // 좌측 코일 끝점
    new THREE.Vector3(-1.2, -0.5, 0), // 좌측 코일 진입점
    new THREE.Vector3(-0.7, -0.5, 0), // 정류자 좌측
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
    phase.current += dt * 0.8 * direction;
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

  const coilGlbUrl = apiData?.coil_model_url ?? "/models/dc_coil_only.glb";

  useEffect(() => {
    const t = setTimeout(async () => {
      try {
        const u = new URL(
          "/api/machine/dc_coil_motor/omega",
          window.location.origin,
        );
        u.searchParams.set("current_a", String(Math.abs(currentAmp)));
        u.searchParams.set("b_t", "0.8");
        const res = await fetch(u.toString());
        if (!res.ok) throw new Error("omega");
        setOmegaData(await res.json());
      } catch {
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

  const omega = powerOn ? Math.min(12, omegaData.omega_rad_s ?? 0) : 0;
  const rpm = omegaData.omega_rpm ?? 0;
  const torque = omegaData.torque_scale_n_m ?? 0;
  const currentDir = currentForward ? 1 : -1;
  const bDir = bForward ? 1 : -1;
  const rotDir = powerOn ? currentDir * bDir : 0;

  const magnetGap = 1.8;
  const nPosX = bDir >= 0 ? -magnetGap : magnetGap;
  const sPosX = -nPosX;
  const magnetZ = 1.5; // 코일 중심점 깊이 보정

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
        DC 모터 시뮬레이션 (동기화 완료)
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
            target={[0, 0, 1.5]}
            minDistance={3}
            maxDistance={20}
          />
          <Suspense fallback={null}>
            <RotatingCoil
              url={coilGlbUrl}
              omegaRad={omega}
              rotDir={rotDir}
              showFlux={powerOn}
              currentDir={currentDir}
            />
            <Magnet type="N" position={[nPosX, 0, magnetZ]} />
            <Magnet type="S" position={[sPosX, 0, magnetZ]} />
            <PowerSupply powerOn={powerOn} />
          </Suspense>
        </Canvas>
      </div>

      <div style={{ padding: 12, background: C.surface }}>
        <div style={{ marginBottom: 10, display: "flex", gap: 8 }}>
          <button type="button" onClick={() => setPowerOn((v) => !v)}>
            {powerOn ? "전원 OFF" : "전원 ON"}
          </button>
          <span style={{ fontSize: 12, color: powerOn ? "#9cffb5" : C.muted }}>
            {powerOn ? "전류 공급 중" : "전류 차단"}
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
