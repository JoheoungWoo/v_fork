import { Environment, Line, OrbitControls, useGLTF } from "@react-three/drei";
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

import apiClient from "@/api/core/apiClient";

const CAM_POS = [2.15, 1.05, 2.0];
const DEBOUNCE_MS = 120;

function isBinaryGlb(buffer) {
  if (!buffer || buffer.byteLength < 12) return false;
  return new DataView(buffer).getUint32(0, true) === 0x46546c67;
}

function computeOmegaLocal(currentA, bT, pc) {
  if (!pc) return 0;
  const i = Math.max(0, Math.abs(Number(currentA) || 0));
  const b = Math.max(0, Math.abs(Number(bT) || 0));
  const nTurns = pc.n_turns ?? 12;
  const area = pc.area_m2 ?? 0.012;
  const gain = pc.motor_gain ?? 380;
  const damp = pc.damping ?? 0.18;
  const cap = pc.omega_cap_rad_s ?? 72;
  const raw =
    (gain * nTurns * area * i * b) / (1 + damp * i * b + 0.05 * i * i);
  return Math.min(cap, Math.max(0, raw));
}

function FluxFieldLines({ strength }) {
  const s = Math.max(0, Math.min(1, strength));
  const lines = useMemo(() => {
    const out = [];
    const rows = 6;
    const cols = 5;
    const x0 = -0.62;
    const x1 = 0.62;
    const ySpan = 0.75;
    const zSpan = 0.55;
    for (let iy = 0; iy < rows; iy += 1) {
      for (let iz = 0; iz < cols; iz += 1) {
        const y = -ySpan / 2 + (ySpan * iy) / (rows - 1);
        const z = -zSpan / 2 + (zSpan * iz) / (cols - 1);
        out.push([
          new THREE.Vector3(x0, y, z),
          new THREE.Vector3(x1, y, z),
        ]);
      }
    }
    return out;
  }, []);

  if (s < 0.02) return null;

  return (
    <group>
      {lines.map((pts, i) => (
        <Line
          key={i}
          points={pts}
          color="#93c5fd"
          lineWidth={1.2}
          transparent
          opacity={0.22 + s * 0.45}
        />
      ))}
    </group>
  );
}

function DcMotorGLB({
  url,
  coilName,
  spinAxis,
  omegaRadS,
  currentA,
  bTesla,
  northPoleNames,
  southPoleNames,
}) {
  const { scene } = useGLTF(url);
  const root = useMemo(() => scene.clone(true), [scene]);
  const coilRef = useRef(null);
  const sign = currentA >= 0 ? 1 : -1;

  useLayoutEffect(() => {
    coilRef.current = root.getObjectByName(coilName) ?? null;
  }, [root, coilName]);

  useFrame((_, dt) => {
    const c = coilRef.current;
    if (!c) return;
    const w = (Number.isFinite(omegaRadS) ? omegaRadS : 0) * sign * dt;
    if (spinAxis === "y") c.rotation.y += w;
    else c.rotation.z += w;
  });

  useEffect(() => {
    const bGain = Math.min(1, Math.max(0, Math.abs(bTesla) / 1.2));
    const northSet = new Set(northPoleNames);
    const southSet = new Set(southPoleNames);
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
          const g = Math.min(1.2, Math.abs(currentA) / 6);
          m.emissive.copy(m.userData._dcBaseE).lerp(new THREE.Color("#fbbf24"), g);
          m.emissiveIntensity = m.userData._dcBaseI + g * 0.5;
          return;
        }
        if (northSet.has(o.name)) {
          m.emissive
            .copy(m.userData._dcBaseE)
            .lerp(new THREE.Color("#fb7185"), 0.22 + bGain * 0.45);
          m.emissiveIntensity = m.userData._dcBaseI + bGain * 0.35;
          return;
        }
        if (southSet.has(o.name)) {
          m.emissive
            .copy(m.userData._dcBaseE)
            .lerp(new THREE.Color("#60a5fa"), 0.22 + bGain * 0.45);
          m.emissiveIntensity = m.userData._dcBaseI + bGain * 0.35;
          return;
        }
        m.emissive.copy(m.userData._dcBaseE);
        m.emissiveIntensity = m.userData._dcBaseI;
      });
    });
  }, [root, coilName, currentA, bTesla, northPoleNames, southPoleNames]);

  return <primitive object={root} />;
}

function SceneRig({
  modelUrl,
  coilName,
  spinAxis,
  omegaRadS,
  currentA,
  bTesla,
  northPoleNames,
  southPoleNames,
  orbitRef,
}) {
  const bNorm = Math.min(1, Math.max(0, bTesla / 1.2));
  return (
    <>
      <color attach="background" args={["#0b1220"]} />
      <ambientLight intensity={0.38} />
      <directionalLight
        castShadow
        position={[4.5, 6, 3.5]}
        intensity={1.15}
        color="#ffffff"
      />
      <directionalLight
        position={[-3.5, 1.5, -2.5]}
        intensity={0.4}
        color="#bfdbfe"
      />
      <Environment preset="city" />

      <FluxFieldLines strength={bNorm} />

      <group>
        {modelUrl ? (
          <Suspense fallback={null}>
            <DcMotorGLB
              url={modelUrl}
              coilName={coilName}
              spinAxis={spinAxis}
              omegaRadS={omegaRadS}
              currentA={currentA}
              bTesla={bTesla}
              northPoleNames={northPoleNames}
              southPoleNames={southPoleNames}
            />
          </Suspense>
        ) : null}
      </group>

      <OrbitControls
        ref={orbitRef}
        enableDamping
        dampingFactor={0.08}
        minDistance={1.2}
        maxDistance={12}
      />
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
  const northPoleNames = apiData?.north_pole_names ?? ["Magnet_North"];
  const southPoleNames = apiData?.south_pole_names ?? ["Magnet_South"];
  const modelSourceScript = apiData?.model_source_script ?? "scripts/dc_motor_blender.py";
  const modelBuildCommand =
    apiData?.model_build_command ??
    "blender --background --python scripts/dc_motor_blender.py";

  const [currentA, setCurrentA] = useState(defaults.current_a ?? 2);
  const [bT, setBT] = useState(defaults.b_tesla ?? 0.35);
  const [omegaRadS, setOmegaRadS] = useState(0);
  const [rpm, setRpm] = useState(0);
  const [torqueScale, setTorqueScale] = useState(0);
  const [omegaError, setOmegaError] = useState(null);
  const [usedLocalOmega, setUsedLocalOmega] = useState(false);
  const [validatedModelUrl, setValidatedModelUrl] = useState(null);
  const orbitRef = useRef(null);
  const debounceRef = useRef(null);

  const imin = defaults.current_min_a ?? 0;
  const imax = defaults.current_max_a ?? 10;
  const bmin = defaults.b_min_t ?? 0;
  const bmax = defaults.b_max_t ?? 1.2;

  useEffect(() => {
    let cancelled = false;
    const base = modelUrlRaw.startsWith("http")
      ? modelUrlRaw
      : `${window.location.origin}${modelUrlRaw}`;
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
      setRpm(res.data?.omega_rpm ?? 0);
      setTorqueScale(res.data?.torque_scale_n_m ?? 0);
      setUsedLocalOmega(false);
    } catch (e) {
      const local = computeOmegaLocal(currentA, bT, pc);
      setOmegaRadS(local);
      setRpm((local * 30) / Math.PI);
      setTorqueScale(
        (pc.n_turns ?? 12) * (pc.area_m2 ?? 0.012) * Math.abs(currentA) * bT,
      );
      setUsedLocalOmega(true);
      setOmegaError(
        e?.response?.data?.detail || e?.message || "omega API unavailable",
      );
    }
  }, [omegaPath, currentA, bT, pc]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchOmega();
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [fetchOmega]);

  const formulaItems = apiData?.formula_panel?.items;

  return (
    <div className="flex w-full flex-col gap-3 text-slate-800">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          {apiData?.title ?? "DC coil motor"}
        </h2>
        {apiData?.subtitle ? (
          <p className="mt-1 text-sm text-slate-600">{apiData.subtitle}</p>
        ) : null}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
          <label className="block text-xs font-medium text-slate-600">
            전류 I (A): {currentA.toFixed(2)}
          </label>
          <input
            type="range"
            min={imin}
            max={imax}
            step={0.05}
            value={currentA}
            onChange={(e) => setCurrentA(Number(e.target.value))}
            className="mt-1 w-full"
          />
          <label className="mt-3 block text-xs font-medium text-slate-600">
            자기장 B (T): {bT.toFixed(3)}
          </label>
          <input
            type="range"
            min={bmin}
            max={bmax}
            step={0.01}
            value={bT}
            onChange={(e) => setBT(Number(e.target.value))}
            className="mt-1 w-full"
          />
          <div className="mt-3 space-y-1 font-mono text-xs text-slate-700">
            <div>
              ω = {omegaRadS.toFixed(3)} rad/s · {rpm.toFixed(1)} rpm
            </div>
            <div>N I A B scale: {torqueScale.toExponential(3)}</div>
            {usedLocalOmega ? (
              <div className="text-amber-700">
                Local formula (API: {String(omegaError)})
              </div>
            ) : null}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
          {apiData?.formula_panel?.heading ? (
            <div className="font-medium text-slate-800">
              {apiData.formula_panel.heading}
            </div>
          ) : null}
          {formulaItems?.length ? (
            <ul className="mt-2 list-inside list-disc space-y-1 text-slate-700">
              {formulaItems.map((it, i) => (
                <li key={i}>
                  {it.label}: {it.expr}
                </li>
              ))}
            </ul>
          ) : null}
          {apiData?.notes?.length ? (
            <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-slate-600">
              {apiData.notes.map((n, i) => (
                <li key={i}>{n}</li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>

      <div
        className="relative w-full overflow-hidden rounded-xl border border-slate-200 bg-black"
        style={{ height: "min(72vh, 520px)" }}
      >
        {!validatedModelUrl ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900/85 p-4 text-center text-sm text-amber-100">
            GLB\ub97c \ubd88\ub7ec\uc62c \uc218 \uc5c6\uc2b5\ub2c8\ub2e4.{" "}
            <code className="mx-1 rounded bg-slate-800 px-1">public/models/dc_coil_motor.glb</code>{" "}
            생성:{" "}
            <code className="mx-1 rounded bg-slate-800 px-1">
              {modelBuildCommand}
            </code>
            <div className="mt-1 text-xs text-slate-300">source: {modelSourceScript}</div>
          </div>
        ) : null}
        <Canvas
          shadows
          camera={{ position: CAM_POS, fov: 45, near: 0.08, far: 80 }}
        >
          <SceneRig
            modelUrl={validatedModelUrl}
            coilName={coilName}
            spinAxis={spinAxis}
            omegaRadS={omegaRadS}
            currentA={currentA}
            bTesla={bT}
            northPoleNames={northPoleNames}
            southPoleNames={southPoleNames}
            orbitRef={orbitRef}
          />
        </Canvas>
      </div>
    </div>
  );
}
