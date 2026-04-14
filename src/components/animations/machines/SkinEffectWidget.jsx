import { Environment, OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas, useLayoutEffect } from "@react-three/fiber";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as THREE from "three";

import apiClient from "@/api/core/apiClient";

const CAM_POS = [2.35, 1.25, 2.15];
const DEBOUNCE_MS = 150;

/** GLB 2.0 magic at offset 0 */
function isBinaryGlb(buffer) {
  if (!buffer || buffer.byteLength < 12) return false;
  return new DataView(buffer).getUint32(0, true) === 0x46546c67;
}

function SkinWireGLB({ url }) {
  const { scene } = useGLTF(url);
  const root = useMemo(() => scene.clone(true), [scene]);
  return <primitive object={root} />;
}

function CarrierInstances({ particles }) {
  const ref = useRef(null);
  const tmp = useMemo(() => new THREE.Object3D(), []);

  useLayoutEffect(() => {
    const im = ref.current;
    if (!im || !particles?.length) return;
    const n = particles.length;
    for (let i = 0; i < n; i += 1) {
      const p = particles[i];
      tmp.position.set(Number(p.xn), Number(p.yn), Number(p.zn));
      tmp.updateMatrix();
      im.setMatrixAt(i, tmp.matrix);
    }
    im.count = n;
    im.instanceMatrix.needsUpdate = true;
  }, [particles, tmp]);

  if (!particles?.length) return null;

  return (
    <instancedMesh ref={ref} args={[null, null, particles.length]}>
      <sphereGeometry args={[0.048, 10, 10]} />
      <meshStandardMaterial
        color="#fcd34d"
        emissive="#f59e0b"
        emissiveIntensity={0.45}
        metalness={0.15}
        roughness={0.42}
      />
    </instancedMesh>
  );
}

function SceneRig({ modelUrl, particles, orbitRef }) {
  return (
    <>
      <color attach="background" args={["#0b1220"]} />
      <ambientLight intensity={0.35} />
      <directionalLight
        castShadow
        position={[5, 8, 4]}
        intensity={1.2}
        color="#ffffff"
      />
      <directionalLight
        position={[-4, 2, -3]}
        intensity={0.45}
        color="#93c5fd"
      />
      <Environment preset="city" />

      <group>
        {modelUrl ? (
          <Suspense fallback={null}>
            <SkinWireGLB url={modelUrl} />
          </Suspense>
        ) : (
          <FallbackWire />
        )}
        <CarrierInstances particles={particles} />
      </group>

      <OrbitControls
        ref={orbitRef}
        makeDefault
        minDistance={1.5}
        maxDistance={12}
        enablePan
        target={[0, 0, 0]}
      />
    </>
  );
}

/** Procedural copper + glass if GLB missing */
function FallbackWire() {
  return (
    <group>
      <mesh castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1, 1, 2, 48]} />
        <meshStandardMaterial
          color="#b87333"
          metalness={1}
          roughness={0.35}
        />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1.14, 1.14, 2.18, 40]} />
        <meshPhysicalMaterial
          color="#c5d4e0"
          metalness={0}
          roughness={0.1}
          transmission={0.85}
          thickness={0.3}
          transparent
          opacity={0.22}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/**
 * Skin effect: Python computes particle positions vs frequency; this file only renders.
 * Base config: GET /api/machine/widget/machine_skin_effect
 * Particles: GET /api/machine/skin_effect/particles
 */
export default function SkinEffectWidget({ apiData }) {
  const requestedModelUrl = apiData?.model_url ?? null;
  const particlesPath = apiData?.particles_api_path ?? "/api/machine/skin_effect/particles";
  const wireRadiusM = apiData?.wire_radius_m ?? 2e-3;
  const defaults = apiData?.defaults ?? {};
  const fMin = defaults.f_min_hz ?? 0;
  const fMax = defaults.f_max_hz ?? 500_000;
  const nParticles = defaults.particle_count ?? 900;

  const [frequency, setFrequency] = useState(defaults.frequency_hz ?? 0);
  const [validatedModelUrl, setValidatedModelUrl] = useState(null);
  const [particles, setParticles] = useState([]);
  const [computed, setComputed] = useState(null);
  const [particleError, setParticleError] = useState(null);
  const [loadingParticles, setLoadingParticles] = useState(false);
  const orbitRef = useRef(null);
  const debounceRef = useRef(null);

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

  const fetchParticles = useCallback(
    async (fHz) => {
      setLoadingParticles(true);
      setParticleError(null);
      try {
        const res = await apiClient.get(particlesPath, {
          params: {
            frequency_hz: fHz,
            n: nParticles,
            wire_radius_m: wireRadiusM,
          },
        });
        setParticles(res.data?.particles ?? []);
        setComputed(res.data?.computed ?? null);
      } catch (e) {
        setParticleError(
          e?.response?.data?.detail || e?.message || "particle request failed",
        );
        setParticles([]);
        setComputed(null);
      } finally {
        setLoadingParticles(false);
      }
    },
    [particlesPath, nParticles, wireRadiusM],
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchParticles(frequency);
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [frequency, fetchParticles]);

  const resetCamera = useCallback(() => {
    const c = orbitRef.current;
    if (!c) return;
    c.target.set(0, 0, 0);
    c.object.position.set(CAM_POS[0], CAM_POS[1], CAM_POS[2]);
    c.update();
  }, []);

  const formulaItems = apiData?.formula_panel?.items;

  const skinMm =
    computed?.skin_depth_mm != null
      ? computed.skin_depth_mm.toFixed(4)
      : "—";
  const deltaOverA =
    computed?.delta_over_radius != null
      ? computed.delta_over_radius.toFixed(3)
      : "—";

  const card = {
    padding: "12px 16px",
    borderRadius: 12,
    background: "rgba(15, 23, 42, 0.92)",
    border: "1px solid rgba(148, 163, 184, 0.35)",
    color: "#e2e8f0",
    fontFamily: "system-ui, sans-serif",
    fontSize: 13,
    lineHeight: 1.55,
  };

  const asideStyle = {
    flex: "0 0 auto",
    width: "min(280px, 100%)",
    boxSizing: "border-box",
    padding: "14px 14px 18px",
    background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)",
    borderLeft: "1px solid rgba(51, 65, 85, 0.65)",
    color: "#e2e8f0",
    fontFamily: "system-ui, sans-serif",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        minHeight: 520,
        borderRadius: 14,
        overflow: "hidden",
        background:
          "linear-gradient(165deg, #0f172a 0%, #1e293b 55%, #0f172a 100%)",
        border: "1px solid rgba(51, 65, 85, 0.6)",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          alignItems: "flex-start",
          flex: 1,
        }}
      >
        <div
          style={{
            flex: "1 1 300px",
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div
            style={{
              width: "100%",
              height: 400,
              minHeight: 320,
              flexShrink: 0,
              background: "#0b1220",
            }}
          >
            <Canvas
              shadows
              camera={{ position: CAM_POS, fov: 45 }}
              gl={{ antialias: true, alpha: false }}
              style={{ width: "100%", height: "100%", display: "block" }}
            >
              <Suspense fallback={null}>
                <SceneRig
                  modelUrl={validatedModelUrl}
                  particles={particles}
                  orbitRef={orbitRef}
                />
              </Suspense>
            </Canvas>
          </div>

          <div style={card}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.06em",
                color: "#94a3b8",
                marginBottom: 8,
              }}
            >
              계산 결과 (Python)
            </div>
            <div>
              Skin depth{" "}
              <span style={{ fontStyle: "italic" }}>&#948;</span>
              {": "}
              <strong style={{ color: "#f8fafc" }}>{skinMm}</strong> mm
            </div>
            <div>
              δ / a (a = 도체 반경):{" "}
              <strong style={{ color: "#f8fafc" }}>{deltaOverA}</strong>
            </div>
            <div style={{ marginTop: 8, fontSize: 11, color: "#64748b" }}>
              {loadingParticles
                ? "Recalculating…"
                : "Move the slider; the backend resamples the cross-section."}
            </div>
            {particleError ? (
              <div style={{ marginTop: 8, fontSize: 12, color: "#f87171" }}>
                {String(particleError)}
              </div>
            ) : null}
          </div>

          <div style={{ ...card, padding: "14px 16px" }}>
            <div style={{ marginBottom: 10, fontSize: 12, color: "#94a3b8" }}>
              {
                "\uad50\ub958 \uc8fc\ud30c\uc218 f (Hz) \u2014 0\uc5d0 \uac00\uae4c\uc6b8\uc218\ub85d (\uc9c1\ub958\uc5d0 \uac00\uae4c\uc6c0) \ub2e8\uba74\uc774 \uace0\ub974\uac8c \ubd84\ud3ec\ud569\ub2c8\ub2e4."
              }
            </div>
            <label
              style={{
                display: "block",
                fontSize: 12,
                fontWeight: 600,
                color: "#cbd5e1",
                marginBottom: 6,
              }}
            >
              주파수: {frequency.toLocaleString()} Hz
            </label>
            <input
              type="range"
              min={fMin}
              max={fMax}
              step={fMax > 200_000 ? 500 : 100}
              value={Math.min(fMax, Math.max(fMin, frequency))}
              onChange={(e) => setFrequency(Number(e.target.value))}
              style={{ width: "100%", accentColor: "#38bdf8" }}
            />
            <div
              style={{
                marginTop: 10,
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                onClick={() => setFrequency(0)}
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "1px solid rgba(148,163,184,0.4)",
                  background: "rgba(30,41,59,0.9)",
                  color: "#e2e8f0",
                  cursor: "pointer",
                  fontSize: 12,
                }}
              >
                DC (0 Hz)
              </button>
              <button
                type="button"
                onClick={() => setFrequency(60)}
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "1px solid rgba(148,163,184,0.4)",
                  background: "rgba(30,41,59,0.9)",
                  color: "#e2e8f0",
                  cursor: "pointer",
                  fontSize: 12,
                }}
              >
                60 Hz
              </button>
              <button
                type="button"
                onClick={() => setFrequency(10000)}
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "1px solid rgba(148,163,184,0.4)",
                  background: "rgba(30,41,59,0.9)",
                  color: "#e2e8f0",
                  cursor: "pointer",
                  fontSize: 12,
                }}
              >
                10 kHz
              </button>
              <button
                type="button"
                onClick={resetCamera}
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "1px solid rgba(148,163,184,0.4)",
                  background: "rgba(30,41,59,0.9)",
                  color: "#e2e8f0",
                  cursor: "pointer",
                  fontSize: 12,
                }}
              >
                시점 초기화
              </button>
            </div>
          </div>
        </div>

        <aside style={asideStyle}>
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "#f8fafc",
              marginBottom: 4,
            }}
          >
            {apiData?.title || "Skin effect"}
          </div>
          {apiData?.subtitle ? (
            <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>
              {apiData.subtitle}
            </p>
          ) : null}
          {apiData?.formula_panel?.heading ? (
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.05em",
                color: "#94a3b8",
                marginTop: 8,
              }}
            >
              {apiData.formula_panel.heading}
            </div>
          ) : null}
          {formulaItems?.length ? (
            <ul
              style={{
                margin: "4px 0 0 0",
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
          {apiData?.notes?.length ? (
            <div
              style={{
                marginTop: 8,
                paddingTop: 10,
                borderTop: "1px solid rgba(71, 85, 105, 0.5)",
                fontSize: 11,
                lineHeight: 1.5,
                color: "#64748b",
              }}
            >
              {apiData.notes.map((t) => (
                <p key={t.slice(0, 24)} style={{ margin: "0 0 6px 0" }}>
                  {t}
                </p>
              ))}
            </div>
          ) : null}
          <div style={{ fontSize: 11, color: "#64748b", marginTop: "auto" }}>
            GLB:{" "}
            {validatedModelUrl
              ? "\ub85c\ub4dc\ub428"
              : "\ud504\ub85c\uc2dc\uc800 \uba54\uc26c"}
          </div>
        </aside>
      </div>
    </div>
  );
}
