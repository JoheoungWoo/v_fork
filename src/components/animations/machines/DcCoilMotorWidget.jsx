import { Line, OrbitControls, useGLTF } from "@react-three/drei";
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

function GlbPart({ url, position = [0, 0, 0], visible = true }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} position={position} visible={visible} />;
}

function RotatingCoil({ url, omegaRad, rotDir, axis = "y", showFlux, currentDir }) {
  const { scene } = useGLTF(url);
  const groupRef = useRef(null);
  const angleRef = useRef(0);

  useFrame((_, dt) => {
    const ax = ["x", "y", "z"].includes(axis) ? axis : "y";
    angleRef.current -= omegaRad * rotDir * dt;
    if (!groupRef.current) return;
    groupRef.current.rotation.x = Math.PI / 2;
    groupRef.current.rotation[ax] = angleRef.current;
  });

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
      <CurrentFlux enabled={showFlux} direction={currentDir} />
    </group>
  );
}

function PowerSupply({ powerOn }) {
  const wireColor = powerOn ? "#ffd84d" : "#5a5a5a";
  return (
    <group position={[0, -0.35, 1.35]}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.72, 0.3, 0.26]} />
        <meshStandardMaterial color={powerOn ? "#f1f1f1" : "#8e8e8e"} metalness={0.4} roughness={0.4} />
      </mesh>
      <mesh position={[-0.15, 0.09, 0.13]}>
        <boxGeometry args={[0.06, 0.06, 0.02]} />
        <meshStandardMaterial color="#2fa8ff" />
      </mesh>
      <mesh position={[0.15, 0.09, 0.13]}>
        <boxGeometry args={[0.06, 0.06, 0.02]} />
        <meshStandardMaterial color="#ff4a4a" />
      </mesh>
      <Line points={[[-0.15, 0.08, -0.12], [0, 0.38, -0.82]]} color={wireColor} lineWidth={2} />
      <Line points={[[0.15, 0.08, -0.12], [0, -0.38, -0.82]]} color={wireColor} lineWidth={2} />
    </group>
  );
}

function CurrentFlux({ enabled, direction }) {
  const path = [
    new THREE.Vector3(0, 0.68, 0.52),
    new THREE.Vector3(0, 0.68, -0.52),
    new THREE.Vector3(0, -0.68, -0.52),
    new THREE.Vector3(0, -0.68, 0.52),
    new THREE.Vector3(0, 0.68, 0.52),
  ];
  const particles = 10;
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
    phase.current += dt * 0.35 * direction;
    for (let i = 0; i < particles; i += 1) {
      const r = refs.current[i];
      if (!r) continue;
      const p = sample(phase.current + i / particles);
      r.position.set(p.x, p.y, p.z);
    }
  });

  return (
    <group visible={enabled}>
      <Line points={path} color="#ffe66d" lineWidth={2} />
      {Array.from({ length: particles }).map((_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
        >
          <sphereGeometry args={[0.03, 12, 12]} />
          <meshBasicMaterial color="#fff4b3" />
        </mesh>
      ))}
    </group>
  );
}

export default function DcCoilMotorWidget({ apiData }) {
  const [powerOn, setPowerOn] = useState(false);
  const [currentA, setCurrentA] = useState(4);
  const [bTesla, setBTesla] = useState(0.35);
  const [omegaData, setOmegaData] = useState({
    omega_rad_s: 0,
    omega_rpm: 0,
    torque_scale_n_m: 0,
    rotation_direction: 1,
  });
  const coilGlbUrl = apiData?.coil_model_url ?? "/models/dc_coil_only.glb";
  const nGlbUrl = apiData?.n_model_url ?? "/models/dc_magnet_n.glb";
  const sGlbUrl = apiData?.s_model_url ?? "/models/dc_magnet_s.glb";
  const rotAxis = "y";

  useEffect(() => {
    const t = setTimeout(async () => {
      try {
        const u = new URL("/api/machine/dc_coil_motor/omega", window.location.origin);
        u.searchParams.set("current_a", String(Math.abs(currentA)));
        u.searchParams.set("b_t", String(Math.abs(bTesla)));
        const res = await fetch(u.toString());
        if (!res.ok) throw new Error("omega");
        setOmegaData(await res.json());
      } catch {
        const i = Math.abs(currentA);
        const b = Math.abs(bTesla);
        const omega = Math.min(72, (380 * 12 * 0.012 * i * b) / (1 + 0.18 * i * b + 0.05 * i * i));
        setOmegaData({
          omega_rad_s: omega,
          omega_rpm: (omega * 30) / Math.PI,
          torque_scale_n_m: 12 * 0.012 * i * b,
          rotation_direction: currentA >= 0 ? 1 : -1,
        });
      }
    }, 180);
    return () => clearTimeout(t);
  }, [currentA, bTesla]);

  const omega = powerOn ? omegaData.omega_rad_s ?? 0 : 0;
  const rpm = omegaData.omega_rpm ?? 0;
  const torque = omegaData.torque_scale_n_m ?? 0;
  const currentDir = currentA >= 0 ? 1 : -1;
  const bDir = bTesla >= 0 ? 1 : -1;
  const rotDir = powerOn ? currentDir * bDir : 0;
  const magnetGap = 1.45;
  const nPosX = bDir >= 0 ? -magnetGap : magnetGap;
  const sPosX = -nPosX;

  return (
    <div style={{ background: C.bg, color: C.text, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden", fontFamily: "Segoe UI,sans-serif" }}>
      <div style={{ padding: 12, borderBottom: `1px solid ${C.border}`, fontWeight: 600 }}>
        DC 모터 분리 GLB 제어 (코일/N/S 독립)
      </div>

      <div style={{ height: 480 }}>
        <Canvas camera={{ position: [5, 3, 7], fov: 48 }} shadows gl={{ antialias: true }}>
          <ambientLight intensity={0.75} />
          <directionalLight position={[4, 6, 5]} intensity={1.4} castShadow />
          <OrbitControls target={[0, 0, 0]} minDistance={3} maxDistance={20} />
          <Suspense fallback={null}>
            <RotatingCoil
              url={coilGlbUrl}
              omegaRad={omega}
              rotDir={rotDir}
              axis={rotAxis}
              showFlux={powerOn}
              currentDir={currentDir}
            />
            <GlbPart url={nGlbUrl} position={[nPosX, 0, 0]} />
            <GlbPart url={sGlbUrl} position={[sPosX, 0, 0]} />
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
        <div style={{ marginBottom: 8 }}>전류 I: {currentA.toFixed(2)} A</div>
        <input type="range" min={-10} max={10} step={0.1} value={currentA} onChange={(e) => setCurrentA(Number(e.target.value))} style={{ width: "100%", marginBottom: 10 }} />
        <div style={{ marginBottom: 8 }}>자기장 B: {bTesla.toFixed(2)} T</div>
        <input type="range" min={-2} max={2} step={0.01} value={bTesla} onChange={(e) => setBTesla(Number(e.target.value))} style={{ width: "100%", marginBottom: 10 }} />
        <div style={{ marginBottom: 8, fontSize: 12, color: "#9cb0c0" }}>
          자석 위치는 자기장 방향에 따라 자동 교대 (N/S 좌우 전환)
        </div>

        <div style={{ marginTop: 6, fontSize: 13, color: C.muted }}>
          omega: {omega.toFixed(2)} rad/s | rpm: {Math.round(rpm)} | torque: {torque.toFixed(3)} N·m
        </div>
        <div style={{ marginTop: 6, fontSize: 12, color: "#9cb0c0" }}>
          회전방향 판정 = sign(I) x sign(B) ({currentDir > 0 ? "+" : "-"} x {bDir > 0 ? "+" : "-"})
        </div>
        <div style={{ marginTop: 6, fontSize: 12, color: "#9cb0c0" }}>
          자석 배치: {nPosX < 0 ? "N-좌 / S-우" : "S-좌 / N-우"}
        </div>
        <div style={{ marginTop: 6, fontSize: 12, color: "#9cb0c0" }}>
          coil: {coilGlbUrl} / N: {nGlbUrl} / S: {sGlbUrl}
        </div>
      </div>
    </div>
  );
}
