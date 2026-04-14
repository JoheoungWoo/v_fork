import { Environment, OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as THREE from "three";

import MotorModel from "./MotorModel";
import { CurrentWaveformChart } from "./Wiring3DViewer";

const CAM_POS = [2.4, 1.35, 2.35];

/** GLB 2.0 header: magic "glTF" at offset 0, version uint32 at offset 4. */
function isBinaryGlb(buffer) {
  if (!buffer || buffer.byteLength < 12) return false;
  return new DataView(buffer).getUint32(0, true) === 0x46546c67;
}

/** Same sampling as cloudflare_prj/generators/machines/induction_motor_widget._waveform_spec */
function buildStatorWaveformSpec(fHz, nSamples = 96) {
  const omega = 2 * Math.PI * fHz;
  const tMax = fHz > 1e-6 ? 2 / fHz : 0.04;
  const wt = [];
  for (let i = 0; i < nSamples; i += 1) {
    const t = (tMax * i) / (nSamples - 1);
    wt.push(omega * t);
  }
  const phaseSeries = (phase, label, color) => ({
    label,
    color,
    i: wt.map((w) => Math.round(Math.sin(w + phase) * 1e6) / 1e6),
  });
  return {
    title: "Stator 3-phase current (sinusoidal)",
    subtitle: `omega = 2*pi*f, f = ${fHz} Hz`,
    omega_t: wt.map((x) => Math.round(x * 1e6) / 1e6),
    series: [
      phaseSeries(0, "A", "#ef4444"),
      phaseSeries((2 * Math.PI) / 3, "B", "#22c55e"),
      phaseSeries((4 * Math.PI) / 3, "C", "#3b82f6"),
    ],
    x_label: "omega*t (rad)",
    y_label: "i (pu)",
    y_min: -1.15,
    y_max: 1.15,
  };
}

function meshPickPart(obj) {
  let p = obj;
  while (p) {
    if (p.name === "Motor_Rotor") return "rotor";
    if (p.name === "Motor_Stator") return "stator";
    p = p.parent;
  }
  return null;
}

function InductionMotorGLB({
  url,
  rotorName,
  spinAxis,
  nrRpm,
  highlight,
  onPartPick,
}) {
  const { scene } = useGLTF(url);
  const root = useMemo(() => scene.clone(true), [scene]);
  const rotorObj = useRef(null);

  useLayoutEffect(() => {
    rotorObj.current = root.getObjectByName(rotorName) ?? null;
  }, [root, rotorName]);

  useEffect(() => {
    root.traverse((o) => {
      if (!o.isMesh) return;
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      mats.forEach((m) => {
        if (!m || !m.emissive) return;
        if (!m.userData._imBaseE) {
          m.userData._imBaseE = m.emissive.clone();
          m.userData._imBaseI = m.emissiveIntensity ?? 0;
        }
        const isR = o.name.startsWith("Rotor_");
        const isS = o.name.startsWith("Stator_");
        const on =
          (highlight === "rotor" && isR) || (highlight === "stator" && isS);
        if (on) {
          m.emissive
            .copy(m.userData._imBaseE)
            .lerp(new THREE.Color("#38bdf8"), 0.55);
          m.emissiveIntensity = 0.4;
        } else {
          m.emissive.copy(m.userData._imBaseE);
          m.emissiveIntensity = m.userData._imBaseI;
        }
      });
    });
  }, [root, highlight]);

  useFrame((_, dt) => {
    const r = rotorObj.current;
    if (!r) return;
    const radPerSec = (Math.PI * 2 * (Number.isFinite(nrRpm) ? nrRpm : 0)) / 60;
    const w = radPerSec * dt;
    if (spinAxis === "y") r.rotation.y += w;
    else r.rotation.z += w;
  });

  return (
    <primitive
      object={root}
      onPointerDown={(e) => {
        e.stopPropagation();
        const part = meshPickPart(e.object);
        if (part) onPartPick?.(part);
      }}
    />
  );
}

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

function SceneRig({
  nr,
  highlight,
  onPartPick,
  orbitRef,
  modelUrl,
  rotorName,
  spinAxis,
}) {
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
        {modelUrl ? (
          <InductionMotorGLB
            url={modelUrl}
            rotorName={rotorName}
            spinAxis={spinAxis}
            nrRpm={nr}
            highlight={highlight}
            onPartPick={onPartPick}
          />
        ) : (
          <AnimatedMotor
            nrRpm={nr}
            highlight={highlight}
            onPartPick={onPartPick}
          />
        )}
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
 * 3-phase induction motor widget. Pass apiData from GET /api/machine/widget/machine_induction_motor for GLB URL and formula panel.
 */
export default function InductionMotorWidget({ apiData = null }) {
  const poles = apiData?.defaults?.poles ?? 4;
  const requestedModelUrl = apiData?.model_url ?? null;
  const rotorName = apiData?.rotor_object_name ?? "Motor_Rotor";
  const spinAxis = apiData?.spin_axis ?? "z";

  /** Only set after fetch proves the URL returns a GLB (avoids SPA404 HTML crashing useGLTF). */
  const [validatedModelUrl, setValidatedModelUrl] = useState(null);

  const [frequency, setFrequency] = useState(
    apiData?.defaults?.frequency_hz ?? 60,
  );
  const [load, setLoad] = useState(apiData?.defaults?.load_pct ?? 0);
  const [highlight, setHighlight] = useState(
    /** @type {null | "stator" | "rotor"} */ (null),
  );
  const orbitRef = useRef(null);

  useEffect(() => {
    if (!requestedModelUrl) {
      setValidatedModelUrl(null);
      return;
    }
    setValidatedModelUrl(null);
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(requestedModelUrl);
        if (!res.ok) throw new Error(String(res.status));
        const ct = (res.headers.get("content-type") || "").toLowerCase();
        if (ct.includes("text/html") || ct.includes("application/json")) {
          throw new Error("not a model");
        }
        const buf = await res.arrayBuffer();
        if (!isBinaryGlb(buf)) throw new Error("not glb");
        if (!cancelled) setValidatedModelUrl(requestedModelUrl);
      } catch {
        if (!cancelled) setValidatedModelUrl(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [requestedModelUrl]);

  useEffect(() => {
    if (validatedModelUrl) useGLTF.preload(validatedModelUrl);
  }, [validatedModelUrl]);

  const { ns, nr, slipPct } = useMemo(() => {
    const f = Math.max(0, Math.min(60, frequency));
    const l = Math.max(0, Math.min(100, load));
    const Ns = (120 * f) / poles;
    const s = (l / 100) * 0.1;
    const Nr = Ns * (1 - s);
    return {
      ns: Ns,
      slip: s,
      nr: Nr,
      slipPct: s * 100,
    };
  }, [frequency, load, poles]);

  const waveformSpec = useMemo(
    () => buildStatorWaveformSpec(Math.max(0, Math.min(60, frequency))),
    [frequency],
  );

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
    width: "min(260px, 100%)",
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

  const formulaItems = apiData?.formula_panel?.items;

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
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ flex: 1, position: "relative", minHeight: 400 }}>
            <Canvas
              shadows
              camera={{ position: CAM_POS, fov: 45 }}
              gl={{ antialias: true, alpha: false }}
              style={{ width: "100%", height: "100%", minHeight: 400 }}
            >
              <color attach="background" args={["#0b1220"]} />
              <Suspense fallback={null}>
                <SceneRig
                  nr={nr}
                  highlight={highlight}
                  onPartPick={onPartPick}
                  orbitRef={orbitRef}
                  modelUrl={validatedModelUrl}
                  rotorName={rotorName}
                  spinAxis={spinAxis}
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
                {"\uc6b4\uc804 \uc0c1\ud0dc"}
              </div>
              <div>
                {"\ub3d9\uae30 \uc18d\ub3c4 (N\u209b): "}
                <strong style={{ color: "#f8fafc" }}>{Math.round(ns)}</strong>
                {" RPM"}
              </div>
              <div>
                {"\ud68c\uc804\uc790 \uc18d\ub3c4 (N\u1d63): "}
                <strong style={{ color: "#f8fafc" }}>{Math.round(nr)}</strong>
                {" RPM"}
              </div>
              <div>
                {"\uc2ac\ub9bd (s): "}
                <strong style={{ color: "#f8fafc" }}>
                  {slipPct.toFixed(1)}
                </strong>
                {" %"}
              </div>
              <div style={{ marginTop: 8, fontSize: 11, color: "#64748b" }}>
                {"\uadf9\uc218 "}
                {poles}
                {"\uadf9 \xb7 \uc8fc\ud30c\uc218 "}
                {frequency.toFixed(0)}
                {" Hz \xb7 \ubd80\ud558 "}
                {load}
                {"%"}
                {validatedModelUrl ? " \xb7 GLB" : ""}
              </div>
            </div>

            <div style={panelStyle}>
              <div style={{ marginBottom: 12, fontSize: 12, color: "#94a3b8" }}>
                {
                  "\uc870\uc791 \ud328\ub110 \xb7 \uc2ac\ub9bd\uc740 \ubd80\ud558\uc5d0 \ub530\ub77c 0% ~ 10%\ub85c \uc99d\uac00\ud569\ub2c8\ub2e4."
                }
              </div>
              <label style={labelStyle}>
                {"\uacf5\uae09 \uc8fc\ud30c\uc218 (f): "}
                {frequency.toFixed(0)}
                {" Hz (0 ~ 60)"}
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
              <label style={labelStyle}>
                {"\ubd80\ud558 (load): "}
                {load}
                {"% (0 ~ 100)"}
              </label>
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

          <CurrentWaveformChart spec={waveformSpec} />
        </div>

        <aside style={asideStyle}>
          {apiData?.formula_panel?.heading ? (
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.05em",
                color: "#94a3b8",
                marginBottom: 4,
              }}
            >
              {apiData.formula_panel.heading}
            </div>
          ) : null}
          {formulaItems?.length ? (
            <ul
              style={{
                margin: "0 0 8px 0",
                paddingLeft: 16,
                fontSize: 11,
                color: "#94a3b8",
                lineHeight: 1.45,
              }}
            >
              {formulaItems.map((it) => (
                <li key={it.label + it.expr}>
                  <span style={{ color: "#e2e8f0" }}>{it.label}</span>:{" "}
                  {it.expr}
                </li>
              ))}
            </ul>
          ) : null}
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.05em",
              color: "#94a3b8",
              marginBottom: 2,
            }}
          >
            {"\uc2e4\ub9b0\ub354 \uc5f0\ub3d9"}
          </div>
          <p
            style={{
              margin: 0,
              fontSize: 12,
              lineHeight: 1.5,
              color: "#94a3b8",
            }}
          >
            {
              "\ubc84\ud2bc \ub610\ub294 3D\uc5d0\uc11c \uace0\uc815\uc790\xb7\ud68c\uc804\uc790\ub97c \ub20c\ub7ec \uac15\uc870\ud569\ub2c8\ub2e4. \uac19\uc740 \ubd80\ud488\uc744 \ub2e4\uc2dc \ub204\ub974\uba74 \ud574\uc81c\ub429\ub2c8\ub2e4."
            }
          </p>
          <button
            type="button"
            style={activeBtn("stator")}
            onClick={() =>
              setHighlight((p) => (p === "stator" ? null : "stator"))
            }
          >
            {"\uace0\uc815\uc790 (\ubc14\uae65 \uc2e4\ub9b0\ub354\xb7\ub2e8\ubd80)"}
          </button>
          <button
            type="button"
            style={activeBtn("rotor")}
            onClick={() => setHighlight((p) => (p === "rotor" ? null : "rotor"))}
          >
            {"\ud68c\uc804\uc790 (\uc548\ucabd \uc2e4\ub9b0\ub354\xb7\ubc14)"}
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
            {"\uac15\uc870 \ud574\uc81c"}
          </button>
          <button type="button" style={btnBase} onClick={resetCamera}>
            {"\uc2dc\uc810 \ucd08\uae30\ud654"}
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
            {"N\u209b = 120f / P \u2014 \ud604\uc7ac P = "}
            {poles}
            {
              "\uc774\uba74 \uc8fc\ud30c\uc218 \uc2ac\ub77c\uc774\ub354\uac00 \ub3d9\uae30\uc18d\ub3c4\uc640 \ud68c\uc804 \uc18d\ub3c4\uc5d0 \uc9c1\uc811 \ubc18\uc601\ub429\ub2c8\ub2e4."
            }
          </div>
        </aside>
      </div>
    </div>
  );
}
