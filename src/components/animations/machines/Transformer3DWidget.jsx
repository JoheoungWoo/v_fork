import { Line, OrbitControls, Sphere, Text } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";

/** Straight + helix on [span0,span1] + straight; turns apply only to helix section. */
function buildHelixPoints(from, to, turns, radius, options = {}) {
  const segments = options.segments ?? 80;
  const span = options.span ?? [0.36, 0.64];
  const [u0, u1] = span;
  const leadSteps = 4;

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

  const atU = (u) => [
    fx + dir[0] * u * len,
    fy + dir[1] * u * len,
    fz + dir[2] * u * len,
  ];

  const pts = [];
  for (let k = 0; k <= leadSteps; k++) {
    const u = (k / leadSteps) * u0;
    pts.push(atU(u));
  }
  for (let i = 1; i <= segments; i++) {
    const local = i / segments;
    const u = u0 + (u1 - u0) * local;
    const [bx, by, bz] = atU(u);
    const ang = 2 * Math.PI * turns * local;
    const c = Math.cos(ang);
    const s = Math.sin(ang);
    pts.push([
      bx + radius * (c * uu[0] + s * vv[0]),
      by + radius * (c * uu[1] + s * vv[1]),
      bz + radius * (c * uu[2] + s * vv[2]),
    ]);
  }
  for (let k = 1; k <= leadSteps; k++) {
    const u = u1 + (1 - u1) * (k / leadSteps);
    pts.push(atU(u));
  }
  return pts;
}

function WindingHelices({ list }) {
  if (!list?.length) return null;
  return (
    <>
      {list.map((c, i) => {
        const span =
          c.helix_span?.length === 2 ? c.helix_span : [0.36, 0.64];
        return (
          <group key={i}>
            <Line
              points={buildHelixPoints(
                c.from,
                c.to,
                c.turns ?? 6,
                c.radius ?? 0.3,
                { segments: 90, span },
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
        );
      })}
    </>
  );
}

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
        (start.z ?? 0) + ((end.z ?? 0) - (start.z ?? 0)) * segmentProgress;
    }
  });

  return active ? (
    <Sphere ref={meshRef} args={[0.14, 16, 16]}>
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={2}
      />
    </Sphere>
  ) : null;
};

const PrimaryToSecondaryFlow = ({ flow }) => {
  if (!flow?.active || !Array.isArray(flow.paths) || flow.paths.length === 0)
    return null;
  const n = flow.paths.length;
  const speed = flow.flow_speed ?? 0.38;
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

const HarmonicCirculator = ({ path, active, speed, color }) => (
  <PathFlowParticle
    path={path}
    active={active}
    speed={speed}
    color={color}
    phaseOffset={0}
  />
);

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

function SceneContent({
  primary_side,
  secondary_side,
  animations,
  coils,
  scene_rotation,
}) {
  const rot = scene_rotation
    ? [
        scene_rotation.x ?? 0.4,
        scene_rotation.y ?? 0.35,
        scene_rotation.z ?? 0.12,
      ]
    : [0.4, 0.35, 0.12];

  return (
    <group rotation={rot} position={[0, 0.15, 0]}>
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
        <PrimaryToSecondaryFlow flow={animations.primary_to_secondary} />
      ) : (
        <HarmonicCirculator
          path={animations.harmonic_circulation?.path}
          active={animations.harmonic_circulation?.active}
          speed={animations.harmonic_circulation?.flow_speed ?? 0.38}
          color={animations.harmonic_circulation?.particle_color}
        />
      )}
    </group>
  );
}

const Transformer3DWidget = ({ data }) => {
  const scene = data.scene_data;
  const {
    primary_side,
    secondary_side,
    animations,
    coils,
    formula_panel,
    camera_init,
    scene_rotation,
  } = scene;

  const camPos = camera_init
    ? [camera_init.x ?? 12, camera_init.y ?? 7.5, camera_init.z ?? 12]
    : [12, 7.5, 12];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        width: "100%",
        minHeight: 528,
        background: "#0c0c10",
        color: "#e6e6eb",
        alignItems: "stretch",
      }}
    >
      <div
        style={{
          flex: "1 1 56%",
          minWidth: 280,
          borderRight: "1px solid #2a2a34",
        }}
      >
        <Canvas
          camera={{ position: camPos, fov: 46 }}
          style={{ height: 520, width: "100%", display: "block" }}
        >
          <ambientLight intensity={0.55} />
          <pointLight position={[10, 12, 10]} intensity={1.1} />
          <OrbitControls enableDamping />
          <SceneContent
            primary_side={primary_side}
            secondary_side={secondary_side}
            animations={animations}
            coils={coils}
            scene_rotation={scene_rotation}
          />
        </Canvas>
      </div>
      <aside
        style={{
          flex: "0 1 44%",
          maxWidth: 420,
          padding: "16px 18px",
          fontSize: 14,
          lineHeight: 1.55,
          overflowY: "auto",
          boxSizing: "border-box",
        }}
      >
        {data.title ? (
          <h2 style={{ margin: "0 0 12px", fontSize: 17, fontWeight: 600 }}>
            {data.title}
          </h2>
        ) : null}
        {formula_panel ? (
          <>
            <h3
              style={{
                margin: "0 0 12px",
                fontSize: 15,
                fontWeight: 600,
                color: "#b8c5ff",
              }}
            >
              {formula_panel.heading}
            </h3>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {(formula_panel.items ?? []).map((row, idx) => (
                <li key={idx} style={{ marginBottom: 12 }}>
                  <div style={{ opacity: 0.88, marginBottom: 4 }}>{row.label}</div>
                  <code
                    style={{
                      display: "block",
                      fontSize: 13,
                      fontFamily:
                        "ui-monospace, SFMono-Regular, Menlo, monospace",
                      background: "#16161c",
                      padding: "6px 8px",
                      borderRadius: 6,
                      color: "#f5d494",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}
                  >
                    {row.expr}
                  </code>
                </li>
              ))}
            </ul>
          </>
        ) : null}
        {data.concept_text ? (
          <p
            style={{
              marginTop: 16,
              fontSize: 13,
              opacity: 0.82,
              lineHeight: 1.5,
            }}
          >
            {data.concept_text}
          </p>
        ) : null}
      </aside>
    </div>
  );
};

export default Transformer3DWidget;
