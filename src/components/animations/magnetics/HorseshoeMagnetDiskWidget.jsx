import { Environment, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useRef, useState } from "react";

/** 말굽 자석: 양극 원주 + 상부 연결대 */
function HorseshoeMagnet() {
  return (
    <group>
      <mesh position={[-0.38, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.12, 0.52, 24]} />
        <meshStandardMaterial color="#b91c1c" metalness={0.38} roughness={0.42} />
      </mesh>
      <mesh position={[0.38, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.12, 0.52, 24]} />
        <meshStandardMaterial color="#1d4ed8" metalness={0.38} roughness={0.42} />
      </mesh>
      <mesh position={[0, 0.56, 0]} castShadow>
        <boxGeometry args={[0.84, 0.11, 0.14]} />
        <meshStandardMaterial color="#64748b" metalness={0.48} roughness={0.48} />
      </mesh>
    </group>
  );
}

function AnimatedRig({ diskRpm, magnetRpm }) {
  const diskRef = useRef(null);
  const magnetRef = useRef(null);

  useFrame((_, delta) => {
    const diskRad = ((Math.PI * 2) / 60) * (Number.isFinite(diskRpm) ? diskRpm : 0);
    const magRad = ((Math.PI * 2) / 60) * (Number.isFinite(magnetRpm) ? magnetRpm : 0);
    if (diskRef.current) diskRef.current.rotation.y += diskRad * delta;
    if (magnetRef.current) magnetRef.current.rotation.y += magRad * delta;
  });

  return (
    <>
      <ambientLight intensity={0.28} />
      <directionalLight castShadow position={[4, 6, 3]} intensity={1.15} />
      <directionalLight position={[-4, 2, -2]} intensity={0.35} color="#bfdbfe" />

      <Environment preset="city" />

      <group ref={magnetRef} position={[0, 0, 0]}>
        <HorseshoeMagnet />
      </group>

      <group ref={diskRef} position={[0, 0.045, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.46, 0.46, 0.07, 56]} />
          <meshStandardMaterial color="#9ca3af" metalness={0.72} roughness={0.32} />
        </mesh>
      </group>

      <gridHelper args={[2.8, 14, 0x475569, 0x1e293b]} position={[0, 0.001, 0]} />

      <OrbitControls makeDefault minDistance={1.2} maxDistance={8} target={[0, 0.22, 0]} enablePan />
    </>
  );
}

/**
 * 말굽 자석 + 금속 원판 3D 시각화. 각각 Y축 회전 RPM을 슬라이더로 조절합니다.
 */
export default function HorseshoeMagnetDiskWidget() {
  const [diskRpm, setDiskRpm] = useState(120);
  const [magnetRpm, setMagnetRpm] = useState(8);

  const panel = {
    position: "absolute",
    left: "50%",
    bottom: 14,
    transform: "translateX(-50%)",
    width: "min(400px, calc(100% - 24px))",
    padding: "12px 14px",
    borderRadius: 12,
    background: "rgba(15, 23, 42, 0.94)",
    border: "1px solid rgba(148, 163, 184, 0.35)",
    color: "#e2e8f0",
    fontFamily: "system-ui, sans-serif",
    fontSize: 12,
    zIndex: 2,
  };

  const label = { display: "block", fontWeight: 600, color: "#cbd5e1", marginBottom: 6 };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: 500,
        borderRadius: 14,
        overflow: "hidden",
        background: "linear-gradient(165deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
        border: "1px solid rgba(51, 65, 85, 0.55)",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 12,
          left: 12,
          zIndex: 2,
          maxWidth: "min(280px, calc(100% - 24px))",
          padding: "10px 12px",
          borderRadius: 10,
          background: "rgba(15, 23, 42, 0.9)",
          border: "1px solid rgba(148, 163, 184, 0.3)",
          color: "#cbd5e1",
          fontSize: 11,
          lineHeight: 1.5,
        }}
      >
        <div style={{ fontWeight: 700, color: "#94a3b8", marginBottom: 6, fontSize: 10 }}>
          말굽 자석 · 원판
        </div>
        붉은 원주: N 극, 파란 원주: S 극. 원판은 도체·동판 등을 상상할 수 있는 단순 모델입니다. 자석과
        원판의 회전은 서로 독립입니다(와전류·브레이크 등은 별도 모델에서 다룰 수 있습니다).
      </div>

      <Canvas
        shadows
        camera={{ position: [1.55, 0.95, 1.55], fov: 42 }}
        gl={{ antialias: true, alpha: false }}
        style={{ width: "100%", height: "100%" }}
      >
        <color attach="background" args={["#0b1220"]} />
        <Suspense fallback={null}>
          <AnimatedRig diskRpm={diskRpm} magnetRpm={magnetRpm} />
        </Suspense>
      </Canvas>

      <div style={panel}>
        <label style={label}>원판 RPM: {Math.round(diskRpm)} (−300 ~ 300)</label>
        <input
          type="range"
          min={-300}
          max={300}
          step={5}
          value={diskRpm}
          onChange={(e) => setDiskRpm(Number(e.target.value))}
          style={{ width: "100%", accentColor: "#94a3b8", marginBottom: 12 }}
        />
        <label style={label}>말굽 자석 RPM: {Math.round(magnetRpm)} (−60 ~ 60)</label>
        <input
          type="range"
          min={-60}
          max={60}
          step={1}
          value={magnetRpm}
          onChange={(e) => setMagnetRpm(Number(e.target.value))}
          style={{ width: "100%", accentColor: "#a78bfa" }}
        />
      </div>
    </div>
  );
}
