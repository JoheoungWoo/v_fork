import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

/** Fallback if API omits visualization (same math as Python). */
export function fallbackVisualization(frequencyHz, deltaOverRadius) {
  const sk =
    deltaOverRadius != null && Number.isFinite(deltaOverRadius)
      ? Math.max(0, Math.min(1, 1 - Math.min(1, deltaOverRadius / 2.8)))
      : frequencyHz < 0.5
        ? 0.12
        : Math.max(0.12, Math.min(1, frequencyHz / 200_000));
  const R = 1;
  const margin = 0.07;
  const tube = 0.042;
  const fluxRadii = [0, 1, 2, 3, 4].map((i) => R + margin + 0.028 * i);
  const fluxZ = [-0.68, -0.34, 0, 0.34, 0.68];
  const eddyR = R + margin + 0.11;
  const arrowR = R + margin + 0.03;
  const fluxI = 0.28 + 0.72 * sk;
  const eddyI = 0.18 + 0.82 * sk;
  const currentI = Math.max(0.35, Math.min(1, 0.95 - 0.45 * sk));
  let wf = 0.22 + 0.78 * sk;
  let we = 0.15 + 0.85 * sk;
  let wc = Math.max(0.15, 1.05 - 0.55 * sk);
  const ssum = wf + we + wc;
  wf /= ssum;
  we /= ssum;
  wc /= ssum;
  return {
    conductor_radius_norm: R,
    flux: {
      radii_norm: fluxRadii,
      z_norm: fluxZ,
      tube_radius_norm: tube,
      intensity: fluxI,
    },
    eddy: {
      loop_radius_norm: eddyR,
      tube_radius_norm: tube * 0.95,
      intensity: eddyI,
    },
    main_current: {
      radius_norm: arrowR,
      intensity: currentI,
    },
    surface: {
      shell_radius_norm: R + 0.018,
      flux_weight: wf,
      eddy_weight: we,
      current_weight: wc,
      emissive_scale: 0.32 + 0.68 * sk,
      opacity: 0.18 + 0.22 * sk,
    },
  };
}

function blendSurfaceColor(surf) {
  const wf = surf?.flux_weight ?? 0.33;
  const we = surf?.eddy_weight ?? 0.33;
  const wc = surf?.current_weight ?? 0.34;
  const c0 = new THREE.Color("#2563eb");
  const c1 = new THREE.Color("#dc2626");
  const c2 = new THREE.Color("#ca8a04");
  return new THREE.Color(
    c0.r * wf + c1.r * we + c2.r * wc,
    c0.g * wf + c1.g * we + c2.g * wc,
    c0.b * wf + c1.b * we + c2.b * wc,
  );
}

function FieldSurfaceShell({ viz }) {
  const surf = viz?.surface;
  if (!surf) return null;
  const rad = surf.shell_radius_norm ?? 1.02;
  const col = useMemo(
    () => blendSurfaceColor(surf),
    [surf.flux_weight, surf.eddy_weight, surf.current_weight],
  );
  const escale = surf.emissive_scale ?? 0.5;
  const op = Math.min(0.55, surf.opacity ?? 0.28);
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]} renderOrder={1}>
      <cylinderGeometry args={[rad, rad, 2.08, 64, 1, false]} />
      <meshPhysicalMaterial
        color={col}
        emissive={col}
        emissiveIntensity={0.2 + 0.65 * escale}
        metalness={0.15}
        roughness={0.42}
        transparent
        opacity={op}
        depthWrite={false}
        transmission={0.08}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function FluxToruses({ viz }) {
  const ref = useRef(null);
  const f = viz?.flux;
  const inten = f?.intensity ?? 0.5;
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.z += dt * (0.1 + 0.35 * inten);
  });
  if (!f?.radii_norm?.length) return null;
  const tube = f.tube_radius_norm ?? 0.042;
  const zs = f.z_norm ?? [0];
  const meshes = [];
  for (const z of zs) {
    for (const rad of f.radii_norm) {
      meshes.push(
        <mesh key={`${z}-${rad}`} position={[0, 0, z]} renderOrder={2}>
          <torusGeometry args={[rad, tube, 14, 80]} />
          <meshStandardMaterial
            color="#60a5fa"
            emissive="#2563eb"
            emissiveIntensity={0.55 + 0.95 * inten}
            metalness={0.12}
            roughness={0.32}
          />
        </mesh>,
      );
    }
  }
  return (
    <group ref={ref} name="flux_tori">
      {meshes}
    </group>
  );
}

function EddyVerticalTori({ viz }) {
  const e = viz?.eddy;
  if (!e?.loop_radius_norm) return null;
  const R = e.loop_radius_norm;
  const tube = e.tube_radius_norm ?? 0.04;
  const inten = e.intensity ?? 0.5;
  const em = 0.5 + 0.85 * inten;
  return (
    <group name="eddy_tori" renderOrder={2}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[R, tube, 12, 72]} />
        <meshStandardMaterial
          color="#f87171"
          emissive="#b91c1c"
          emissiveIntensity={em}
          metalness={0.08}
          roughness={0.38}
        />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, Math.PI / 2]}>
        <torusGeometry args={[R, tube, 12, 72]} />
        <meshStandardMaterial
          color="#ef4444"
          emissive="#dc2626"
          emissiveIntensity={em * 0.92}
          metalness={0.08}
          roughness={0.4}
        />
      </mesh>
    </group>
  );
}

function EddyDetailArrows({ viz }) {
  const s = Math.max(
    0.12,
    Math.min(1, viz?.eddy?.intensity ?? 0.35),
  );
  const xr = (viz?.eddy?.loop_radius_norm ?? 1.15) * 0.92;
  return (
    <group name="eddy_arrows" renderOrder={2}>
      <group position={[0, 0, -0.05]}>
        <mesh rotation={[Math.PI / 2, 0, Math.PI]}>
          <cylinderGeometry args={[0.03, 0.03, 0.45, 8]} />
          <meshStandardMaterial
            color="#ef4444"
            emissive="#991b1b"
            emissiveIntensity={0.35 + 0.6 * s}
          />
        </mesh>
        <mesh position={[0, 0, -0.35]} rotation={[Math.PI / 2, 0, Math.PI]}>
          <coneGeometry args={[0.07, 0.17, 8]} />
          <meshStandardMaterial
            color="#ef4444"
            emissive="#dc2626"
            emissiveIntensity={0.45 + 0.65 * s}
          />
        </mesh>
      </group>
      {[
        [xr, 0, 0.22],
        [-xr, 0, 0.22],
      ].map(([x, y, z], i) => (
        <group key={i} position={[x, y, z]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.2]}>
            <cylinderGeometry args={[0.024, 0.024, 0.38, 6]} />
            <meshStandardMaterial
              color="#f87171"
              emissive="#b91c1c"
              emissiveIntensity={0.25 + 0.55 * s}
            />
          </mesh>
          <mesh position={[0, 0, 0.42]} rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.056, 0.14, 8]} />
            <meshStandardMaterial
              color="#f87171"
              emissive="#ef4444"
              emissiveIntensity={0.35 + 0.6 * s}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function MainCurrentArrowsFromViz({ viz }) {
  const m = viz?.main_current ?? { radius_norm: 1.1, intensity: 0.85 };
  const r = m.radius_norm ?? 1.1;
  const s = Math.max(0.25, Math.min(1, m.intensity ?? 0.85));
  const n = 5;
  return (
    <group name="main_current_I" renderOrder={2}>
      {Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2;
        const x = Math.cos(a) * r;
        const y = Math.sin(a) * r;
        return (
          <group key={i} position={[x, y, 0]}>
            <mesh
              castShadow
              position={[0, 0, 0.55]}
              rotation={[Math.PI / 2, 0, 0]}
            >
              <cylinderGeometry args={[0.036, 0.036, 1.02, 8]} />
              <meshStandardMaterial
                color="#facc15"
                emissive="#ca8a04"
                emissiveIntensity={0.45 + 0.5 * s}
                metalness={0.18}
                roughness={0.42}
              />
            </mesh>
            <mesh position={[0, 0, 1.08]} rotation={[Math.PI / 2, 0, 0]}>
              <coneGeometry args={[0.08, 0.2, 10]} />
              <meshStandardMaterial
                color="#facc15"
                emissive="#eab308"
                emissiveIntensity={0.55 + 0.55 * s}
                metalness={0.12}
                roughness={0.38}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

export function ElectromagneticFieldMeshes({ visualization }) {
  if (!visualization) return null;
  return (
    <group>
      <FieldSurfaceShell viz={visualization} />
      <FluxToruses viz={visualization} />
      <MainCurrentArrowsFromViz viz={visualization} />
      <EddyVerticalTori viz={visualization} />
      <EddyDetailArrows viz={visualization} />
    </group>
  );
}
