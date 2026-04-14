import { OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useEffect, useRef, useState } from "react";

const C = {
  bg: "#0f1117",
  surface: "#1a1d27",
  border: "#2a2e3e",
  text: "#e2e0d8",
  muted: "#7a7872",
  nRed: "#e84040",
};

function GlbMotor({
  glbUrl,
  omegaRad,
  rotDir,
  coilObjectName,
  rotAxis = "y",
}) {
  const { scene } = useGLTF(glbUrl);
  const targetRef = useRef(null);
  const angleRef = useRef(0);

  useEffect(() => {
    targetRef.current =
      (coilObjectName && scene.getObjectByName(coilObjectName)) || scene;
  }, [scene, coilObjectName]);

  useFrame((_, dt) => {
    if (!targetRef.current) return;
    const axis = ["x", "y", "z"].includes(rotAxis) ? rotAxis : "y";
    angleRef.current += omegaRad * rotDir * dt;
    targetRef.current.rotation[axis] = angleRef.current;
  });

  return <primitive object={scene} />;
}

export default function DcCoilMotorWidget({ apiData }) {
  const [currentA, setCurrentA] = useState(2);
  const [bTesla, setBTesla] = useState(0.35);
  const [omegaData, setOmegaData] = useState({
    omega_rad_s: 0,
    omega_rpm: 0,
    torque_scale_n_m: 0,
    rotation_direction: 1,
  });

  useEffect(() => {
    const t = setTimeout(async () => {
      try {
        const u = new URL(
          "/api/machine/dc_coil_motor/omega",
          window.location.origin,
        );
        u.searchParams.set("current_a", String(currentA));
        u.searchParams.set("b_t", String(bTesla));
        const res = await fetch(u.toString());
        if (!res.ok) throw new Error("omega");
        setOmegaData(await res.json());
      } catch {
        const i = Math.abs(currentA);
        const b = Math.abs(bTesla);
        const omega = Math.min(
          72,
          (380 * 12 * 0.012 * i * b) / (1 + 0.18 * i * b + 0.05 * i * i),
        );
        setOmegaData({
          omega_rad_s: omega,
          omega_rpm: (omega * 30) / Math.PI,
          torque_scale_n_m: 12 * 0.012 * i * b,
          rotation_direction: currentA >= 0 ? 1 : -1,
        });
      }
    }, 200);
    return () => clearTimeout(t);
  }, [currentA, bTesla]);

  const omega = omegaData.omega_rad_s ?? 0;
  const rpm = omegaData.omega_rpm ?? 0;
  const torque = omegaData.torque_scale_n_m ?? 0;
  const rotDir = omegaData.rotation_direction ?? 1;
  const glbUrl = apiData?.model_url;

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
        DC 사각형 코일 모터 (단일 확인용)
      </div>

      <div style={{ height: 460 }}>
        <Canvas
          camera={{ position: [5, 3, 7], fov: 48 }}
          shadows
          gl={{ antialias: true }}
        >
          <ambientLight intensity={0.7} />
          <directionalLight position={[4, 6, 5]} intensity={1.4} castShadow />
          <OrbitControls target={[0, 0, 0]} minDistance={4} maxDistance={20} />
          <Suspense fallback={null}>
            {glbUrl ? (
              <GlbMotor
                glbUrl={glbUrl}
                omegaRad={omega}
                rotDir={rotDir}
                coilObjectName={apiData?.coil_object_name}
                rotAxis={apiData?.rotation_axis ?? "y"}
              />
            ) : null}
          </Suspense>
        </Canvas>
      </div>

      <div style={{ padding: 12, background: C.surface }}>
        <div style={{ marginBottom: 8 }}>전류 I: {currentA.toFixed(2)} A</div>
        <input
          type="range"
          min={-10}
          max={10}
          step={0.1}
          value={currentA}
          onChange={(e) => setCurrentA(Number(e.target.value))}
          style={{ width: "100%", marginBottom: 10 }}
        />
        <div style={{ marginBottom: 8 }}>자기장 B: {bTesla.toFixed(2)} T</div>
        <input
          type="range"
          min={0}
          max={2}
          step={0.01}
          value={bTesla}
          onChange={(e) => setBTesla(Number(e.target.value))}
          style={{ width: "100%" }}
        />
        <div style={{ marginTop: 10, fontSize: 13, color: C.muted }}>
          omega: {omega.toFixed(2)} rad/s | rpm: {Math.round(rpm)} | torque:{" "}
          {torque.toFixed(3)} N·m
        </div>
      </div>
    </div>
  );
}
