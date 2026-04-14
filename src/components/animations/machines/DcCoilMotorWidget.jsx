import { OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useEffect, useRef, useState } from "react";

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

function RotatingCoil({ url, omegaRad, rotDir, axis = "y" }) {
  const { scene } = useGLTF(url);
  const angleRef = useRef(0);

  useFrame((_, dt) => {
    const ax = ["x", "y", "z"].includes(axis) ? axis : "y";
    angleRef.current += omegaRad * rotDir * dt;
    scene.rotation[ax] = angleRef.current;
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
  const [showN, setShowN] = useState(true);
  const [showS, setShowS] = useState(true);
  const [showCoil, setShowCoil] = useState(true);
  const [nX, setNX] = useState(0.72);
  const [sX, setSX] = useState(-0.72);

  const coilGlbUrl = apiData?.coil_model_url ?? "/models/dc_coil_only.glb";
  const nGlbUrl = apiData?.n_model_url ?? "/models/dc_magnet_n.glb";
  const sGlbUrl = apiData?.s_model_url ?? "/models/dc_magnet_s.glb";
  const rotAxis = apiData?.rotation_axis ?? "y";

  useEffect(() => {
    const t = setTimeout(async () => {
      try {
        const u = new URL("/api/machine/dc_coil_motor/omega", window.location.origin);
        u.searchParams.set("current_a", String(currentA));
        u.searchParams.set("b_t", String(bTesla));
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

  const omega = omegaData.omega_rad_s ?? 0;
  const rpm = omegaData.omega_rpm ?? 0;
  const torque = omegaData.torque_scale_n_m ?? 0;
  const rotDir = omegaData.rotation_direction ?? 1;

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
            {showCoil ? <RotatingCoil url={coilGlbUrl} omegaRad={omega} rotDir={rotDir} axis={rotAxis} /> : null}
            <GlbPart url={nGlbUrl} visible={showN} position={[nX, 0, 0]} />
            <GlbPart url={sGlbUrl} visible={showS} position={[sX, 0, 0]} />
          </Suspense>
        </Canvas>
      </div>

      <div style={{ padding: 12, background: C.surface }}>
        <div style={{ marginBottom: 8 }}>전류 I: {currentA.toFixed(2)} A</div>
        <input type="range" min={-10} max={10} step={0.1} value={currentA} onChange={(e) => setCurrentA(Number(e.target.value))} style={{ width: "100%", marginBottom: 10 }} />
        <div style={{ marginBottom: 8 }}>자기장 B: {bTesla.toFixed(2)} T</div>
        <input type="range" min={0} max={2} step={0.01} value={bTesla} onChange={(e) => setBTesla(Number(e.target.value))} style={{ width: "100%", marginBottom: 10 }} />
        <div style={{ marginBottom: 8 }}>N극 X 위치: {nX.toFixed(2)}</div>
        <input type="range" min={-2.5} max={2.5} step={0.01} value={nX} onChange={(e) => setNX(Number(e.target.value))} style={{ width: "100%", marginBottom: 10 }} />
        <div style={{ marginBottom: 8 }}>S극 X 위치: {sX.toFixed(2)}</div>
        <input type="range" min={-2.5} max={2.5} step={0.01} value={sX} onChange={(e) => setSX(Number(e.target.value))} style={{ width: "100%", marginBottom: 10 }} />

        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          <button type="button" onClick={() => setShowCoil((v) => !v)}>{showCoil ? "코일 숨김" : "코일 표시"}</button>
          <button type="button" onClick={() => setShowN((v) => !v)}>{showN ? "N 숨김" : "N 표시"}</button>
          <button type="button" onClick={() => setShowS((v) => !v)}>{showS ? "S 숨김" : "S 표시"}</button>
        </div>

        <div style={{ marginTop: 6, fontSize: 13, color: C.muted }}>
          omega: {omega.toFixed(2)} rad/s | rpm: {Math.round(rpm)} | torque: {torque.toFixed(3)} N·m
        </div>
        <div style={{ marginTop: 6, fontSize: 12, color: "#9cb0c0" }}>
          coil: {coilGlbUrl} / N: {nGlbUrl} / S: {sGlbUrl}
        </div>
      </div>
    </div>
  );
}
