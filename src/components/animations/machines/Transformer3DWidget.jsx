import { Line, OrbitControls, Sphere, Text } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";

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
  const { primary_side, secondary_side, animations } = data.scene_data;

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
        <Text position={[primary_side.center.x, -4, 0]} fontSize={0.5}>
          {primary_side.label}
        </Text>

        <ConnectionMesh
          type={secondary_side.type || "delta"}
          center={secondary_side.center}
          terminals={secondary_side.terminals}
          color={secondary_side.wire_color}
        />
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
