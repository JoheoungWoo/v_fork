import { Line, OrbitControls, Sphere, Text } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";

/** Helix sampled between two 3D points (textbook-style winding along the segment). */
function buildHelixPoints(from, to, turns, radius, segments = 96) {
  const fx = from.x;
  const fy = from.y;
  const fz = from.z ?? 0;
  const tx = to.x;
  const ty = to.y;
  const tz = to.z ?? 0;
  const dx = tx - fx;
  const dy = ty - fy;
  const dz = tz - fz;
  const len = Math.hypot(dx, dy, dz);
  if (len < 1e-6) return [[fx, fy, fz]];

  const dir = [dx / len, dy / len, dz / len];
  let up = [0, 1, 0];
  if (Math.abs(dir[1]) > 0.92) up = [1, 0, 0];
  let uu = [
    up[1] * dir[2] - up[2] * dir[1],
    up[2] * dir[0] - up[0] * dir[2],
    up[0] * dir[1] - up[1] * dir[0],
  ];
  const uLen = Math.hypot(uu[0], uu[1], uu[2]) || 1;
  uu = [uu[0] / uLen, uu[1] / uLen, uu[2] / uLen];
  const vv = [
    dir[1] * uu[2] - dir[2] * uu[1],
    dir[2] * uu[0] - dir[0] * uu[2],
    dir[0] * uu[1] - dir[1] * uu[0],
  ];

  const pts = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const bx = fx + dir[0] * t * len;
    const by = fy + dir[1] * t * len;
    const bz = fz + dir[2] * t * len;
    const ang = 2 * Math.PI * turns * t;
    const c = Math.cos(ang);
    const s = Math.sin(ang);
    pts.push([
      bx + radius * (c * uu[0] + s * vv[0]),
      by + radius * (c * uu[1] + s * vv[1]),
      bz + radius * (c * uu[2] + s * vv[2]),
    ]);
  }
  return pts;
}

function WindingHelices({ list }) {
  if (!list?.length) return null;
  return (
    <>
      {list.map((c, i) => (
        <group key={i}>
          <Line
            points={buildHelixPoints(
              c.from,
              c.to,
              c.turns ?? 6,
              c.radius ?? 0.3,
            )}
            color={c.color ?? "#ffffff"}
            lineWidth={2}
          />
          {c.polarity_dot ? (
            <mesh position={[c.from.x, c.from.y, c.from.z ?? 0]}>
              <sphereGeometry args={[0.11, 12, 12]} />
              <meshStandardMaterial
                color="#ffec99"
                emissive="#ffec99"
                emissiveIntensity={0.55}
              />
            </mesh>
          ) : null}
        </group>
      ))}
    </>
  );
}

// 경로를 따라가는 입자 (phaseOffset으로 상별 출발 시각 분산)
const PathFlowParticle = ({
  path,
  active,
  speed,
  color,
  phaseOffset = 0,
}) => {
  const meshRef = useRef();

  useFrame((state) => {
    if (!active || !path || path.length < 2) return;

    const base = (state.clock.getElapsedTime() * speed) % 1;
    const loopTime = (base + phaseOffset) % 1;

    const segmentCount = path.length - 1;
    const segmentIndex = Math.floor(loopTime * segmentCount);
    const segmentProgress = (loopTime * segmentCount) % 1;

    const start = path[segmentIndex];
    const end = path[segmentIndex + 1];

    if (meshRef.current) {
      meshRef.current.position.x =
        start.x + (end.x - start.x) * segmentProgress;
      meshRef.current.position.y =
        start.y + (end.y - start.y) * segmentProgress;
      meshRef.current.position.z =
        start.z + (end.z - start.z) * segmentProgress;
    }
  });

  return active ? (
    <Sphere ref={meshRef} args={[0.15, 16, 16]}>
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={2}
      />
    </Sphere>
  ) : null;
};

/** Particles: primary terminal -> paired secondary terminal (e.g. A to a). */
const PrimaryToSecondaryFlow = ({ flow, speed = 2 }) => {
  if (!flow?.active || !Array.isArray(flow.paths) || flow.paths.length === 0)
    return null;
  const n = flow.paths.length;
  return (
    <>
      {flow.paths.map((path, i) => (
        <PathFlowParticle
          key={i}
          path={path}
          active
          speed={speed}
          color={flow.particle_color}
          phaseOffset={n > 1 ? i / n : 0}
        />
      ))}
    </>
  );
};

/** Legacy: single closed path when primary_to_secondary is not used. */
const HarmonicCirculator = ({ path, active, speed, color }) => (
  <PathFlowParticle
    path={path}
    active={active}
    speed={speed}
    color={color}
    phaseOffset={0}
  />
);

// Connection lines (Y or delta)
const ConnectionMesh = ({ terminals, center, type, color }) => {
  const points = useMemo(() => {
    if (type === "wye") {
      return terminals.flatMap((t) => [
        [center.x, center.y, center.z],
        [t.x, t.y, t.z],
      ]);
    } else {
      const p = terminals.map((t) => [t.x, t.y, t.z]);
      return [...p, p[0]];
    }
  }, [terminals, center, type]);

  return (
    <group>
      <Line points={points} color={color} lineWidth={3} />
      {terminals.map((t, i) => (
        <group key={i} position={[t.x, t.y, t.z]}>
          <Sphere args={[0.1, 16, 16]}>
            <meshBasicMaterial color={color} />
          </Sphere>
          <Text position={[0, 0.5, 0]} fontSize={0.3} color="white">
            {t.phase}
          </Text>
        </group>
      ))}
    </group>
  );
};

const Transformer3DWidget = ({ data }) => {
  const { primary_side, secondary_side, animations, coils } = data.scene_data;

  return (
    <div style={{ width: "100%", height: "500px", background: "#111" }}>
      <Canvas camera={{ position: [0, 0, 15], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <OrbitControls />

        <ConnectionMesh
          type="wye"
          center={primary_side.center}
          terminals={primary_side.terminals}
          color={primary_side.wire_color}
        />
        <WindingHelices list={coils?.primary} />
        <Text position={[primary_side.center.x, -4, 0]} fontSize={0.5}>
          {primary_side.label}
        </Text>

        <ConnectionMesh
          type={secondary_side.type || "delta"}
          center={secondary_side.center}
          terminals={secondary_side.terminals}
          color={secondary_side.wire_color}
        />
        <WindingHelices list={coils?.secondary} />
        <Text position={[secondary_side.center.x, -4, 0]} fontSize={0.5}>
          {secondary_side.label}
        </Text>

        {animations.primary_to_secondary?.active ? (
          <PrimaryToSecondaryFlow
            flow={animations.primary_to_secondary}
            speed={2}
          />
        ) : (
          <HarmonicCirculator
            path={animations.harmonic_circulation?.path}
            active={animations.harmonic_circulation?.active}
            speed={2}
            color={animations.harmonic_circulation?.particle_color}
          />
        )}
      </Canvas>
    </div>
  );
};

export default Transformer3DWidget;
