import { Environment, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useCallback, useMemo, useRef, useState } from "react";

import MotorModel from "./MotorModel";

const POLES = 4;

const CAM_POS = [2.4, 1.35, 2.35];

/** 회전자 ref + Nr(RPM)으로 Z축 회전 (MotorModel 회전자 그룹) */
function AnimatedMotor({ nrRpm, highlight, onPartPick }) {
  const rotorRef = useRef(null);

  useFrame((_, delta) => {
    const mesh = rotorRef.current;
    if (!mesh) return;
    const rpm = Number.isFinite(nrRpm) ? nrRpm : 0;
    const radPerSec = (Math.PI * 2 * rpm) / 60;
    mesh.rotation.z += radPerSec * delta;
  });

  return (
    <MotorModel
      ref={rotorRef}
      highlight={highlight}
      onPartPick={onPartPick}
    />
  );
}

function SceneRig({ nr, highlight, onPartPick, orbitRef }) {
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
        <AnimatedMotor
          nrRpm={nr}
          highlight={highlight}
          onPartPick={onPartPick}
        />
      </group>

      <OrbitControls
        ref={orbitRef}
        makeDefault
        minDistance={1.4}
        maxDistance={10}
        enablePan
        target={[0, 0, 0]}
      />
    </>
  );
}

const btnBase = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid rgba(148, 163, 184, 0.35)",
  background: "rgba(30, 41, 59, 0.9)",
  color: "#e2e8f0",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  textAlign: "left",
  fontFamily: "system-ui, sans-serif",
};

/**
 * 3상 유도전동기: 슬립·동기속도·회전자 RPM 시각화 (4극 고정)
 * Canvas 옆 패널 + 3D 클릭으로 고정자/회전자 실린더를 연동 강조합니다.
 */
export default function InductionMotorWidget() {
  const [frequency, setFrequency] = useState(60);
  const [load, setLoad] = useState(0);
  const [highlight, setHighlight] = useState(/** @type {null | "stator" | "rotor"} */ (null));
  const orbitRef = useRef(null);

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

  const resetCamera = useCallback(() => {
    const c = orbitRef.current;
    if (!c) return;
    c.target.set(0, 0, 0);
    c.object.position.set(CAM_POS[0], CAM_POS[1], CAM_POS[2]);
    c.update();
  }, []);

  const onPartPick = useCallback((part) => {
    setHighlight((prev) => (prev === part ? null : part));
  }, []);

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

  const asideStyle = {
    flex: "0 0 auto",
    width: "min(240px, 100%)",
    boxSizing: "border-box",
    padding: "14px 14px 18px",
    background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)",
    borderLeft: "1px solid rgba(51, 65, 85, 0.65)",
    color: "#e2e8f0",
    fontFamily: "system-ui, sans-serif",
    display: "flex",
    flexDirection: "column",
    gap: 10,
    zIndex: 1,
  };

  const activeBtn = (key) =>
    highlight === key
      ? {
          ...btnBase,
          borderColor: "rgba(56, 189, 248, 0.55)",
          background: "rgba(14, 116, 144, 0.35)",
          boxShadow: "0 0 0 1px rgba(56, 189, 248, 0.2)",
        }
      : btnBase;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        minHeight: 520,
        borderRadius: 14,
        overflow: "hidden",
        background: "linear-gradient(165deg, #0f172a 0%, #1e293b 55%, #0f172a 100%)",
        border: "1px solid rgba(51, 65, 85, 0.6)",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          flex: 1,
          minHeight: 520,
        }}
      >
        <div
          style={{
            position: "relative",
            flex: "1 1 280px",
            minHeight: 480,
            minWidth: 0,
          }}
        >
          <Canvas
            shadows
            camera={{ position: CAM_POS, fov: 45 }}
            gl={{ antialias: true, alpha: false }}
            style={{ width: "100%", height: "100%", minHeight: 480 }}
          >
            <color attach="background" args={["#0b1220"]} />
            <Suspense fallback={null}>
              <SceneRig
                nr={nr}
                highlight={highlight}
                onPartPick={onPartPick}
                orbitRef={orbitRef}
              />
            </Suspense>
          </Canvas>

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

        <aside style={asideStyle}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.05em",
              color: "#94a3b8",
              marginBottom: 2,
            }}
          >
            실린더 연동
          </div>
          <p style={{ margin: 0, fontSize: 12, lineHeight: 1.5, color: "#94a3b8" }}>
            버튼 또는 3D에서 고정자·회전자를 눌러 강조합니다. 같은 부품을 다시 누르면 해제됩니다.
          </p>
          <button
            type="button"
            style={activeBtn("stator")}
            onClick={() => setHighlight((p) => (p === "stator" ? null : "stator"))}
          >
            고정자 (바깥 실린더·단부)
          </button>
          <button
            type="button"
            style={activeBtn("rotor")}
            onClick={() => setHighlight((p) => (p === "rotor" ? null : "rotor"))}
          >
            회전자 (안쪽 실린더·바)
          </button>
          <button
            type="button"
            style={{
              ...btnBase,
              opacity: highlight ? 1 : 0.55,
            }}
            disabled={!highlight}
            onClick={() => setHighlight(null)}
          >
            강조 해제
          </button>
          <button type="button" style={btnBase} onClick={resetCamera}>
            시점 초기화
          </button>
          <div
            style={{
              marginTop: 4,
              paddingTop: 10,
              borderTop: "1px solid rgba(71, 85, 105, 0.5)",
              fontSize: 11,
              lineHeight: 1.45,
              color: "#64748b",
            }}
          >
            Nₛ = 120f / P — 현재 P = {POLES}이면 주파수 슬라이더가 동기속도와 회전 속도에
            직접 반영됩니다.
          </div>
        </aside>
      </div>
    </div>
  );
}
