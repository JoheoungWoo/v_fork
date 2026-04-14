import { Environment, Line, OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import apiClient from "@/api/core/apiClient";

const CAM_POS = [6, 4.5, 7];
const DEBOUNCE_MS = 120;
const BASE_OMEGA = 1.2;

function isBinaryGlb(buffer) {
  if (!buffer || buffer.byteLength < 12) return false;
  return new DataView(buffer).getUint32(0, true) === 0x46546c67;
}

function computeOmegaLocal(currentA, bT, pc) {
  const i = Math.max(0, Math.abs(Number(currentA) || 0));
  const b = Math.max(0, Math.abs(Number(bT) || 0));
  const nTurns = pc?.n_turns ?? 12;
  const area = pc?.area_m2 ?? 0.012;
  const gain = pc?.motor_gain ?? 380;
  const damp = pc?.damping ?? 0.18;
  const cap = pc?.omega_cap_rad_s ?? 72;
  const raw = (gain * nTurns * area * i * b) / (1 + damp * i * b + 0.05 * i * i);
  return Math.min(cap, Math.max(0, raw));
}

function FluxFieldLines({ visible, fieldStrength }) {
  const strength = Math.max(0, Math.min(2, fieldStrength));
  const lines = useMemo(() => {
    const out = [];
    const zLevels = [-0.8, -0.4, 0, 0.4, 0.8];
    const yLevels = [-0.7, 0, 0.7];
    zLevels.forEach((z) => {
      yLevels.forEach((y) => {
        out.push([new THREE.Vector3(2.8, y, z), new THREE.Vector3(-2.8, y, z)]);
      });
    });
    return out;
  }, []);
  if (!visible) return null;
  return (
    <group>
      {lines.map((pts, i) => (
        <Line key={i} points={pts} color="#3b82f6" lineWidth={1.1} transparent opacity={0.16 + 0.15 * strength} />
      ))}
    </group>
  );
}

function ForceVectors({ angle, currentStrength, fieldStrength }) {
  const commutator = Math.sign(Math.sin(angle)) || 1;
  const mag = Math.abs(Math.sin(angle + 0.01)) * currentStrength * fieldStrength;
  const scale = 0.45 + mag * 0.8;
  const f1 = new THREE.Vector3(0, Math.cos(angle), -Math.sin(angle)).multiplyScalar(commutator).normalize();
  const f2 = f1.clone().multiplyScalar(-1);
  const p1 = new THREE.Vector3(-0.9, 1, 0).applyEuler(new THREE.Euler(0, angle, 0));
  const p2 = new THREE.Vector3(0.9, -1, 0).applyEuler(new THREE.Euler(0, angle, 0));
  const opacity = Math.max(0.2, Math.abs(Math.sin(angle)));
  return (
    <group>
      <group position={p1.toArray()} quaternion={new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), f1)}>
        <mesh position={[0, 0.35 * scale, 0]}>
          <cylinderGeometry args={[0.035, 0.035, 0.7 * scale, 8]} />
          <meshBasicMaterial color="#4caf50" transparent opacity={opacity} />
        </mesh>
        <mesh position={[0, 0.82 * scale, 0]}>
          <coneGeometry args={[0.1, 0.28, 8]} />
          <meshBasicMaterial color="#4caf50" transparent opacity={opacity} />
        </mesh>
      </group>
      <group position={p2.toArray()} quaternion={new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), f2)}>
        <mesh position={[0, 0.35 * scale, 0]}>
          <cylinderGeometry args={[0.035, 0.035, 0.7 * scale, 8]} />
          <meshBasicMaterial color="#4caf50" transparent opacity={opacity} />
        </mesh>
        <mesh position={[0, 0.82 * scale, 0]}>
          <coneGeometry args={[0.1, 0.28, 8]} />
          <meshBasicMaterial color="#4caf50" transparent opacity={opacity} />
        </mesh>
      </group>
    </group>
  );
}

function DcMotorGLB({ url, coilName, spinAxis, angle, currentStrength, fieldStrength, northPoleNames, southPoleNames }) {
  const { scene } = useGLTF(url);
  const root = useMemo(() => scene.clone(true), [scene]);
  const coilRef = useRef(null);

  useLayoutEffect(() => {
    coilRef.current = root.getObjectByName(coilName) ?? null;
  }, [root, coilName]);

  useFrame(() => {
    const c = coilRef.current;
    if (!c) return;
    if (spinAxis === "y") c.rotation.y = angle;
    else c.rotation.z = angle;
  });

  useEffect(() => {
    const northSet = new Set(northPoleNames);
    const southSet = new Set(southPoleNames);
    const bGain = Math.min(1.2, Math.max(0, fieldStrength / 1.2));
    const iGain = Math.min(1.2, Math.max(0, currentStrength / 1.6));
    root.traverse((o) => {
      if (!o.isMesh) return;
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      mats.forEach((m) => {
        if (!m || !m.emissive) return;
        if (!m.userData._dcBaseE) {
          m.userData._dcBaseE = m.emissive.clone();
          m.userData._dcBaseI = m.emissiveIntensity ?? 0;
        }
        let p = o;
        let underCoil = false;
        while (p) {
          if (p.name === coilName) underCoil = true;
          p = p.parent;
        }
        if (underCoil) {
          m.emissive.copy(m.userData._dcBaseE).lerp(new THREE.Color("#e8a623"), 0.25 + iGain * 0.55);
          m.emissiveIntensity = m.userData._dcBaseI + iGain * 0.6;
          return;
        }
        if (northSet.has(o.name)) {
          m.emissive.copy(m.userData._dcBaseE).lerp(new THREE.Color("#e8593c"), 0.25 + bGain * 0.45);
          m.emissiveIntensity = m.userData._dcBaseI + bGain * 0.45;
          return;
        }
        if (southSet.has(o.name)) {
          m.emissive.copy(m.userData._dcBaseE).lerp(new THREE.Color("#3b8bd4"), 0.25 + bGain * 0.45);
          m.emissiveIntensity = m.userData._dcBaseI + bGain * 0.45;
          return;
        }
        m.emissive.copy(m.userData._dcBaseE);
        m.emissiveIntensity = m.userData._dcBaseI;
      });
    });
  }, [root, coilName, currentStrength, fieldStrength, northPoleNames, southPoleNames]);

  return <primitive object={root} />;
}

function SceneRig(props) {
  const { modelUrl, showFieldLines, fieldStrength, orbitRef } = props;
  return (
    <>
      <color attach="background" args={["#0d0f14"]} />
      <ambientLight intensity={0.6} color="#404060" />
      <directionalLight castShadow position={[6, 8, 5]} intensity={1.3} color="#fff5e0" />
      <pointLight position={[-4, 2, 3]} intensity={0.8} color="#3b8bd4" distance={20} />
      <pointLight position={[3, 0, 0]} intensity={0.35 + fieldStrength * 0.35} color="#e8593c" distance={8} />
      <pointLight position={[-3, 0, 0]} intensity={0.35 + fieldStrength * 0.35} color="#3b8bd4" distance={8} />
      <Environment preset="city" />
      <FluxFieldLines visible={showFieldLines} fieldStrength={fieldStrength} />
      <Suspense fallback={null}>{modelUrl ? <DcMotorGLB {...props} /> : null}</Suspense>
      <ForceVectors angle={props.angle} currentStrength={props.currentStrength} fieldStrength={props.fieldStrength} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#111420" roughness={0.9} />
      </mesh>
      <OrbitControls ref={orbitRef} enableDamping dampingFactor={0.08} minDistance={4} maxDistance={20} />
    </>
  );
}

export default function DcCoilMotorWidget({ apiData }) {
  const defaults = apiData?.defaults ?? {};
  const pc = apiData?.physics_constants ?? {};
  const modelUrlRaw = apiData?.model_url ?? "/models/dc_coil_motor.glb";
  const coilName = apiData?.coil_object_name ?? "Motor_Coil_Root";
  const spinAxis = apiData?.rotation_axis ?? "z";
  const omegaPath = apiData?.omega_api_path ?? "/api/machine/dc_coil_motor/omega";
  const northPoleNames = apiData?.north_pole_names ?? ["N_Pole_Body", "N_Pole_Face", "Magnet_North"];
  const southPoleNames = apiData?.south_pole_names ?? ["S_Pole_Body", "S_Pole_Face", "Magnet_South"];
  const modelBuildCommand = apiData?.model_build_command ?? "blender --background --python scripts/dc_motor_blender.py";

  const [currentA, setCurrentA] = useState(defaults.current_a ?? 1);
  const [bT, setBT] = useState(defaults.b_tesla ?? 1);
  const [speedMult, setSpeedMult] = useState(1);
  const [playing, setPlaying] = useState(true);
  const [showFieldLines, setShowFieldLines] = useState(true);
  const [omegaRadS, setOmegaRadS] = useState(0);
  const [usedLocalOmega, setUsedLocalOmega] = useState(false);
  const [omegaError, setOmegaError] = useState(null);
  const [validatedModelUrl, setValidatedModelUrl] = useState(null);
  const [angle, setAngle] = useState(0);
  const orbitRef = useRef(null);
  const debounceRef = useRef(null);
  const clockRef = useRef(0);

  const imin = defaults.current_min_a ?? 0.2;
  const imax = defaults.current_max_a ?? 2;
  const bmin = defaults.b_min_t ?? 0.3;
  const bmax = defaults.b_max_t ?? 2;

  useEffect(() => {
    let cancelled = false;
    const base = modelUrlRaw.startsWith("http") ? modelUrlRaw : `${window.location.origin}${modelUrlRaw}`;
    (async () => {
      try {
        const res = await fetch(base);
        const buf = await res.arrayBuffer();
        if (!isBinaryGlb(buf)) throw new Error("not glb");
        if (!cancelled) setValidatedModelUrl(modelUrlRaw);
      } catch {
        if (!cancelled) setValidatedModelUrl(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [modelUrlRaw]);

  useEffect(() => {
    if (validatedModelUrl) useGLTF.preload(validatedModelUrl);
  }, [validatedModelUrl]);

  const fetchOmega = useCallback(async () => {
    setOmegaError(null);
    try {
      const res = await apiClient.get(omegaPath, {
        params: {
          current_a: currentA,
          b_t: bT,
          n_turns: pc.n_turns,
          area_m2: pc.area_m2,
          motor_gain: pc.motor_gain,
          damping: pc.damping,
          omega_cap_rad_s: pc.omega_cap_rad_s,
        },
      });
      setOmegaRadS(res.data?.omega_rad_s ?? 0);
      setUsedLocalOmega(false);
    } catch (e) {
      setOmegaRadS(computeOmegaLocal(currentA, bT, pc));
      setUsedLocalOmega(true);
      setOmegaError(e?.response?.data?.detail || e?.message || "omega API unavailable");
    }
  }, [omegaPath, currentA, bT, pc]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(fetchOmega, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [fetchOmega]);

  useEffect(() => {
    let rafId = 0;
    const loop = (t) => {
      if (!clockRef.current) clockRef.current = t;
      const dt = Math.min(0.05, (t - clockRef.current) / 1000);
      clockRef.current = t;
      if (playing) {
        const next = (angle + dt * BASE_OMEGA * speedMult * Math.sign(currentA || 1)) % (Math.PI * 2);
        setAngle(next < 0 ? next + Math.PI * 2 : next);
      }
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [playing, speedMult, currentA, angle]);

  const commutator = Math.sign(Math.sin(angle)) || 1;
  const flux = Math.abs(Math.cos(angle)) * Math.max(0.3, bT);
  const emf = Math.abs(Math.sin(angle)) * BASE_OMEGA * speedMult * bT * Math.abs(currentA);
  const torque = Math.abs(Math.sin(angle + 0.01)) * bT * Math.abs(currentA);
  const angleDeg = Math.round((angle * 180) / Math.PI) % 360;

  const resetView = () => {
    const c = orbitRef.current;
    if (!c) return;
    c.target.set(0, 0.2, 0);
    c.object.position.set(CAM_POS[0], CAM_POS[1], CAM_POS[2]);
    c.update();
  };

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-slate-700 bg-[#0d0f14]" style={{ height: "min(78vh, 640px)" }}>
      {!validatedModelUrl ? (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-slate-950/90 p-4 text-center text-sm text-amber-100">
          GLB load failed. <code className="mx-1 rounded bg-slate-800 px-1">public/models/dc_coil_motor.glb</code>
          <br />
          Build: <code className="mx-1 rounded bg-slate-800 px-1">{modelBuildCommand}</code>
        </div>
      ) : null}

      <div className="absolute left-4 top-4 z-20 rounded-lg border border-white/10 bg-slate-900/80 px-4 py-3 text-xs text-slate-300 backdrop-blur">
        Fleming left-hand law
        <div className="mt-1 text-base font-semibold text-white">DC motor - rectangular coil rotation</div>
      </div>

      <div className="absolute right-4 top-4 z-20 min-w-[220px] rounded-lg border border-white/10 bg-slate-900/80 px-4 py-3 text-xs text-slate-300 backdrop-blur">
        <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#3B8BD4]" />B <span className="ml-auto text-slate-100">N -&gt; S (-X)</span></div>
        <div className="mt-1 flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#E8A623]" />I <span className="ml-auto text-slate-100">{commutator > 0 ? "+Z: front-back" : "+Z: back-front"}</span></div>
        <div className="mt-1 flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#4CAF50]" />F <span className="ml-auto text-slate-100">{torque > 0.08 ? "torque on" : "dead zone"}</span></div>
        <div className="mt-2 border-t border-white/10 pt-2">
          <div className="flex justify-between"><span>Flux</span><span className="text-slate-100">{flux.toFixed(3)} Wb</span></div>
          <div className="mt-1 flex justify-between"><span>EMF</span><span className="text-slate-100">{emf.toFixed(2)} V</span></div>
          <div className="mt-1 flex justify-between"><span>Torque</span><span className="text-slate-100">{torque.toFixed(2)} N*m</span></div>
          <div className="mt-1 flex justify-between"><span>Omega</span><span className="text-slate-100">{(omegaRadS * speedMult).toFixed(2)} rad/s</span></div>
          {usedLocalOmega ? <div className="mt-1 text-amber-300">Local formula ({String(omegaError)})</div> : null}
        </div>
      </div>

      <div className="absolute bottom-4 right-4 z-20 text-right text-white">
        <div className="text-3xl font-light">{angleDeg}°</div>
        <div className="text-[10px] uppercase tracking-widest text-slate-400">rotation</div>
      </div>

      <div className="absolute left-4 top-1/2 z-20 flex -translate-y-1/2 items-center gap-2">
        <div className="relative h-52 w-3 overflow-hidden rounded-full border border-white/10 bg-gradient-to-b from-[#E8593C] to-[#3B8BD4]">
          <div className="absolute bottom-0 left-0 right-0 bg-black/55" style={{ height: `${(1 - Math.min(1, flux / Math.max(0.0001, bmax))) * 100}%` }} />
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-lg border border-white/10 bg-slate-900/80 px-4 py-3 text-xs text-slate-300 backdrop-blur">
        <button type="button" onClick={() => setPlaying((v) => !v)} className={`rounded border px-3 py-1 ${playing ? "border-orange-400 text-orange-300" : "border-white/20 text-slate-100"}`}>
          {playing ? "Pause" : "Play"}
        </button>
        <div className="mx-1 h-8 w-px bg-white/15" />
        <label className="flex flex-col items-center gap-1">Speed
          <input type="range" min={0.2} max={4} step={0.1} value={speedMult} onChange={(e) => setSpeedMult(Number(e.target.value))} className="w-28 accent-orange-500" />
        </label>
        <div className="mx-1 h-8 w-px bg-white/15" />
        <label className="flex flex-col items-center gap-1">Current
          <input type="range" min={Math.max(0.2, imin)} max={Math.max(2, imax)} step={0.05} value={currentA} onChange={(e) => setCurrentA(Number(e.target.value))} className="w-28 accent-orange-500" />
        </label>
        <div className="mx-1 h-8 w-px bg-white/15" />
        <label className="flex flex-col items-center gap-1">Field
          <input type="range" min={Math.max(0.3, bmin)} max={Math.max(2, bmax)} step={0.05} value={bT} onChange={(e) => setBT(Number(e.target.value))} className="w-28 accent-orange-500" />
        </label>
        <div className="mx-1 h-8 w-px bg-white/15" />
        <button type="button" onClick={() => setShowFieldLines((v) => !v)} className="rounded border border-white/20 px-3 py-1 text-slate-100">Field Lines</button>
        <button type="button" onClick={resetView} className="rounded border border-white/20 px-3 py-1 text-slate-100">Reset View</button>
      </div>

      <Canvas shadows camera={{ position: CAM_POS, fov: 45, near: 0.1, far: 100 }}>
        <SceneRig
          modelUrl={validatedModelUrl}
          coilName={coilName}
          spinAxis={spinAxis}
          angle={angle}
          currentStrength={Math.abs(currentA)}
          fieldStrength={bT}
          showFieldLines={showFieldLines}
          northPoleNames={northPoleNames}
          southPoleNames={southPoleNames}
          orbitRef={orbitRef}
        />
      </Canvas>
    </div>
  );
}
