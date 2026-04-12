import { Environment, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useMemo, useRef, useState } from "react";

import MotorModel from "./MotorModel";

const POLES = 4;

/** 회전자 ref + Nr(RPM)으로 Z축 회전 (MotorModel 회전자 그룹) */
function AnimatedMotor({ nrRpm }) {
  const rotorRef = useRef(null);

  useFrame((_, delta) => {
    const mesh = rotorRef.current;
    if (!mesh) return;
    const rpm = Number.isFinite(nrRpm) ? nrRpm : 0;
    const radPerSec = (Math.PI * 2 * rpm) / 60;
    mesh.rotation.z += radPerSec * delta;
  });

  return <MotorModel ref={rotorRef} />;
}

function SceneRig({ nr }) {
  return (
    <>
      <ambientLight intensity={0.32} />
      <directionalLight
        castShadow
        position={[6, 8, 4]}
        intensity={1.25}
        color="#ffffff"
      />
      <directionalLight
        position={[-5, 3, -3]}
        intensity={0.4}
        color="#bfdbfe"
      />
      <directionalLight
        position={[0, -4, -6]}
        intensity={0.28}
        color="#fde68a"
      />

      <Environment preset="warehouse" />

      <group position={[0, -0.2, 0]} scale={1.15}>
        <AnimatedMotor nrRpm={nr} />
      </group>

      <OrbitControls
        makeDefault
        minDistance={1.4}
        maxDistance={10}
        enablePan
        target={[0, 0, 0]}
      />
    </>
  );
}

/**
 * 3상 유도전동기: 슬립·동기속도·회전자 RPM 시각화 (4극 고정)
 */
export default function InductionMotorWidget() {
  const [frequency, setFrequency] = useState(60);
  const [load, setLoad] = useState(0);

  const { ns, slip, nr, slipPct } = useMemo(() => {
    const f = Math.max(0, Math.min(60, frequency));
    const l = Math.max(0, Math.min(100, load));
    const Ns = (120 * f) / POLES;
    const s = (l / 100) * 0.1;
    const Nr = Ns * (1 - s);
    return {
      ns: Ns,
      slip: s,
      nr: Nr,
      slipPct: s * 100,
    };
  }, [frequency, load]);

  const panelStyle = {
    position: "absolute",
    left: "50%",
    bottom: 16,
    transform: "translateX(-50%)",
    width: "min(420px, calc(100% - 24px))",
    padding: "14px 16px",
    borderRadius: 14,
    background: "rgba(15, 23, 42, 0.94)",
    border: "1px solid rgba(148, 163, 184, 0.35)",
    boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
    color: "#e2e8f0",
    fontFamily: "system-ui, -apple-system, sans-serif",
    zIndex: 2,
  };

  const labelStyle = {
    display: "block",
    fontSize: 12,
    fontWeight: 600,
    color: "#cbd5e1",
    marginBottom: 6,
  };

  const sliderStyle = {
    width: "100%",
    accentColor: "#38bdf8",
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: 520,
        borderRadius: 14,
        overflow: "hidden",
        background: "linear-gradient(165deg, #0f172a 0%, #1e293b 55%, #0f172a 100%)",
        border: "1px solid rgba(51, 65, 85, 0.6)",
      }}
    >
      {/* 좌측 상단: 화면 고정 계기판 (다크 카드) */}
      <div
        style={{
          position: "absolute",
          top: 14,
          left: 14,
          zIndex: 2,
          padding: "12px 14px",
          borderRadius: 12,
          background: "rgba(15, 23, 42, 0.92)",
          border: "1px solid rgba(148, 163, 184, 0.35)",
          boxShadow: "0 12px 40px rgba(0,0,0,0.45)",
          color: "#e2e8f0",
          fontFamily: "system-ui, sans-serif",
          fontSize: 13,
          lineHeight: 1.55,
          minWidth: 210,
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.06em",
            color: "#94a3b8",
            marginBottom: 8,
          }}
        >
          운전 상태
        </div>
        <div>
          동기 속도 (Nₛ): <strong style={{ color: "#f8fafc" }}>{Math.round(ns)}</strong>{" "}
          RPM
        </div>
        <div>
          회전자 속도 (Nᵣ):{" "}
          <strong style={{ color: "#f8fafc" }}>{Math.round(nr)}</strong> RPM
        </div>
        <div>
          슬립 (s): <strong style={{ color: "#f8fafc" }}>{slipPct.toFixed(1)}</strong>{" "}
          %
        </div>
        <div style={{ marginTop: 8, fontSize: 11, color: "#64748b" }}>
          극수 4극 · 주파수 {frequency.toFixed(0)} Hz · 부하 {load}%
        </div>
      </div>

      <Canvas
        shadows
        camera={{ position: [2.4, 1.35, 2.35], fov: 45 }}
        gl={{ antialias: true, alpha: false }}
        style={{ width: "100%", height: "100%" }}
      >
        <color attach="background" args={["#0b1220"]} />
        <Suspense fallback={null}>
          <SceneRig nr={nr} />
        </Suspense>
      </Canvas>

      <div style={panelStyle}>
        <div style={{ marginBottom: 12, fontSize: 12, color: "#94a3b8" }}>
          조작 패널 · 슬립은 부하에 따라 0% ~ 10%로 증가합니다.
        </div>
        <label style={labelStyle}>
          공급 주파수 (f): {frequency.toFixed(0)} Hz (0 ~ 60)
        </label>
        <input
          type="range"
          min={0}
          max={60}
          step={1}
          value={frequency}
          onChange={(e) => setFrequency(Number(e.target.value))}
          style={{ ...sliderStyle, marginBottom: 14 }}
        />
        <label style={labelStyle}>부하 (load): {load}% (0 ~ 100)</label>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={load}
          onChange={(e) => setLoad(Number(e.target.value))}
          style={sliderStyle}
        />
      </div>
    </div>
  );
}
