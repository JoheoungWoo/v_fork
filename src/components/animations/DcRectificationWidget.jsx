import { Box, Line, OrbitControls, Text } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

const PATH_POSITIVE = [
  new THREE.Vector3(-4.8, 1.8, 0),
  new THREE.Vector3(-1.8, 1.8, 0),
  new THREE.Vector3(0, 3.4, 0),
  new THREE.Vector3(2.5, 1.8, 0),
  new THREE.Vector3(4.2, 1.8, 0),
  new THREE.Vector3(4.2, -1.8, 0),
  new THREE.Vector3(2.5, -1.8, 0),
  new THREE.Vector3(0, -3.4, 0),
  new THREE.Vector3(-1.8, -1.8, 0),
  new THREE.Vector3(-4.8, -1.8, 0),
];

const PATH_NEGATIVE = [
  new THREE.Vector3(-4.8, -1.8, 0),
  new THREE.Vector3(-1.8, -1.8, 0),
  new THREE.Vector3(0, 3.4, 0),
  new THREE.Vector3(2.5, 1.8, 0),
  new THREE.Vector3(4.2, 1.8, 0),
  new THREE.Vector3(4.2, -1.8, 0),
  new THREE.Vector3(2.5, -1.8, 0),
  new THREE.Vector3(0, -3.4, 0),
  new THREE.Vector3(-1.8, 1.8, 0),
  new THREE.Vector3(-4.8, 1.8, 0),
];

const BRIDGE_OUTLINE = [
  [-1.8, 1.8, 0],
  [0, 3.4, 0],
  [2.5, 1.8, 0],
  [0, -3.4, 0],
  [-1.8, 1.8, 0],
];

function CurrentParticles({ phase, amplitude }) {
  const meshRef = useRef();
  const count = 24;
  const positiveCurve = useMemo(() => new THREE.CatmullRomCurve3(PATH_POSITIVE), []);
  const negativeCurve = useMemo(() => new THREE.CatmullRomCurve3(PATH_NEGATIVE), []);
  const [progress] = useState(() =>
    Array.from({ length: count }, (_, idx) => idx / count),
  );
  const flowSpeed = 0.004 + amplitude * 0.018;
  const isPositiveHalf = Math.sin(phase) >= 0;

  useFrame(() => {
    if (!meshRef.current) return;
    const curve = isPositiveHalf ? positiveCurve : negativeCurve;
    const dummy = new THREE.Object3D();

    for (let i = 0; i < count; i += 1) {
      progress[i] += flowSpeed;
      if (progress[i] > 1) progress[i] = 0;
      dummy.position.copy(curve.getPointAt(progress[i]));
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, count]}>
      <sphereGeometry args={[0.11, 12, 12]} />
      <meshBasicMaterial color="#ffe84d" toneMapped={false} />
    </instancedMesh>
  );
}

function BridgeScene({ phase, amplitude }) {
  const isPositiveHalf = Math.sin(phase) >= 0;
  const activeColor = "#ff5c5c";
  const idleColor = "#5f6775";
  const loadGlow = 0.5 + amplitude * 0.9;

  return (
    <Canvas camera={{ position: [0, 0, 12], fov: 55 }} style={{ height: "520px" }}>
      <color attach="background" args={["#d8dee9"]} />
      <ambientLight intensity={1.1} />
      <directionalLight position={[8, 8, 5]} intensity={0.9} />
      <OrbitControls enablePan={false} maxDistance={15} minDistance={8} />

      <Line points={[[-5.6, 1.8, 0], [-1.8, 1.8, 0]]} color="#5e6878" lineWidth={2.2} />
      <Line points={[[-5.6, -1.8, 0], [-1.8, -1.8, 0]]} color="#5e6878" lineWidth={2.2} />
      <Line
        points={[
          [2.5, 1.8, 0],
          [4.2, 1.8, 0],
          [4.2, -1.8, 0],
          [2.5, -1.8, 0],
        ]}
        color="#5e6878"
        lineWidth={2.2}
      />
      <Line points={BRIDGE_OUTLINE} color="#7f8898" lineWidth={1.8} />

      <group position={[-6.25, 0, 0]}>
        <Box args={[1.1, 4.6, 0.6]}>
          <meshStandardMaterial color="#4a73d1" roughness={0.4} metalness={0.35} />
        </Box>
        <Text position={[0, 2.9, 0.4]} fontSize={0.38} color="#ffffff">
          AC
        </Text>
        <Text position={[0, 2.35, 0.4]} fontSize={0.25} color="#eaf0ff">
          source
        </Text>
      </group>

      <group position={[5.15, 0, 0]}>
        <Box args={[1.6, 4.5, 0.7]}>
          <meshStandardMaterial
            color="#d9974c"
            emissive="#ff9f42"
            emissiveIntensity={loadGlow}
            roughness={0.45}
          />
        </Box>
        <Text position={[0, 2.9, 0.4]} fontSize={0.34} color="#ffffff">
          Load
        </Text>
        <Text position={[0, 2.35, 0.4]} fontSize={0.22} color="#fff0d9">
          R
        </Text>
      </group>

      <group position={[0, 3.4, 0]}>
        <Box args={[1.15, 0.55, 0.55]} rotation={[0, 0, -Math.PI / 4]}>
          <meshStandardMaterial color={isPositiveHalf ? activeColor : idleColor} />
        </Box>
        <Text position={[0, 0.7, 0.35]} fontSize={0.26} color="#f8fbff">
          D1
        </Text>
      </group>
      <group position={[0, -3.4, 0]}>
        <Box args={[1.15, 0.55, 0.55]} rotation={[0, 0, Math.PI / 4]}>
          <meshStandardMaterial color={isPositiveHalf ? activeColor : idleColor} />
        </Box>
        <Text position={[0, -0.72, 0.35]} fontSize={0.26} color="#f8fbff">
          D4
        </Text>
      </group>
      <group position={[-1.8, -1.8, 0]}>
        <Box args={[1.15, 0.55, 0.55]} rotation={[0, 0, Math.PI / 4]}>
          <meshStandardMaterial color={isPositiveHalf ? idleColor : activeColor} />
        </Box>
        <Text position={[-0.06, -0.72, 0.35]} fontSize={0.26} color="#f8fbff">
          D2
        </Text>
      </group>
      <group position={[-1.8, 1.8, 0]}>
        <Box args={[1.15, 0.55, 0.55]} rotation={[0, 0, -Math.PI / 4]}>
          <meshStandardMaterial color={isPositiveHalf ? idleColor : activeColor} />
        </Box>
        <Text position={[-0.06, 0.72, 0.35]} fontSize={0.26} color="#f8fbff">
          D3
        </Text>
      </group>

      <Text position={[-5.2, 2.5, 0.35]} fontSize={0.26} color="#22324c">
        AC+
      </Text>
      <Text position={[-5.2, -2.5, 0.35]} fontSize={0.26} color="#22324c">
        AC-
      </Text>
      <Text position={[4.1, 2.55, 0.35]} fontSize={0.28} color="#22324c">
        DC+
      </Text>
      <Text position={[4.1, -2.55, 0.35]} fontSize={0.28} color="#22324c">
        DC-
      </Text>

      <CurrentParticles phase={phase} amplitude={amplitude} />
    </Canvas>
  );
}

function WaveformPanel({ phase, amplitude, frequency }) {
  const width = 980;
  const height = 220;
  const centerY = 110;
  const ampPx = 72 * amplitude;
  const points = 220;
  const inPoints = [];
  const outPoints = [];

  for (let i = 0; i < points; i += 1) {
    const t = i / (points - 1);
    const x = 20 + t * (width - 40);
    const angle = t * Math.PI * 4 + phase;
    const input = Math.sin(angle) * ampPx;
    const output = Math.abs(Math.sin(angle)) * ampPx;
    inPoints.push(`${x},${centerY - input}`);
    outPoints.push(`${x},${centerY - output}`);
  }

  const markerX =
    20 +
    ((((phase % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)) / (Math.PI * 2)) *
      (width - 40);
  const markerInputY = centerY - Math.sin(phase) * ampPx;
  const markerOutputY = centerY - Math.abs(Math.sin(phase)) * ampPx;

  return (
    <div
      style={{
        padding: "12px 18px 18px 18px",
        background: "#f5f7fb",
        borderTop: "1px solid #d8deea",
      }}
    >
      <div style={{ marginBottom: "8px", color: "#2a3550", fontWeight: 700 }}>
        파형 표시 (입력 AC / 출력 전파정류 DC) - f: {frequency.toFixed(1)} Hz
      </div>
      <svg
        width="100%"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="rectifier-waveforms"
      >
        <line
          x1="20"
          y1={centerY}
          x2={width - 20}
          y2={centerY}
          stroke="#96a0b5"
          strokeWidth="1.5"
        />
        <line
          x1="20"
          y1="20"
          x2="20"
          y2={height - 18}
          stroke="#96a0b5"
          strokeWidth="1.2"
        />
        <polyline
          fill="none"
          stroke="#3f7bff"
          strokeWidth="2.5"
          points={inPoints.join(" ")}
        />
        <polyline
          fill="none"
          stroke="#e25757"
          strokeWidth="2.5"
          points={outPoints.join(" ")}
        />

        <circle cx={markerX} cy={markerInputY} r="4.5" fill="#3f7bff" />
        <circle cx={markerX} cy={markerOutputY} r="4.5" fill="#e25757" />

        <text x="30" y="34" fill="#3f7bff" fontSize="14" fontWeight="700">
          Vin = sin(wt)
        </text>
        <text x="30" y="54" fill="#e25757" fontSize="14" fontWeight="700">
          Vout = |sin(wt)|
        </text>
      </svg>
    </div>
  );
}

export default function DcRectificationWidget() {
  const [frequency, setFrequency] = useState(1.2);
  const [amplitude, setAmplitude] = useState(0.85);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    let rafId = 0;
    let previousTime = performance.now();
    const tick = (now) => {
      const dt = (now - previousTime) / 1000;
      previousTime = now;
      setPhase((prev) => prev + dt * frequency * Math.PI * 2);
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [frequency]);

  return (
    <div
      style={{
        width: "100%",
        minHeight: "820px",
        background: "#e8edf5",
        border: "1px solid #d5dcea",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "26px",
          alignItems: "center",
          padding: "14px 18px",
          background: "#d4dced",
          color: "#202b42",
          fontWeight: 700,
          flexWrap: "wrap",
        }}
      >
        <div>브리지 다이오드 전파 정류</div>
        <label htmlFor="freqRange">주파수: {frequency.toFixed(1)} Hz</label>
        <input
          id="freqRange"
          type="range"
          min="0.5"
          max="3.0"
          step="0.1"
          value={frequency}
          onChange={(e) => setFrequency(Number(e.target.value))}
          style={{ width: "220px" }}
        />
        <label htmlFor="ampRange">입력 전압 크기: {amplitude.toFixed(2)}</label>
        <input
          id="ampRange"
          type="range"
          min="0.4"
          max="1.0"
          step="0.05"
          value={amplitude}
          onChange={(e) => setAmplitude(Number(e.target.value))}
          style={{ width: "220px" }}
        />
      </div>

      <BridgeScene phase={phase} amplitude={amplitude} />
      <WaveformPanel phase={phase} amplitude={amplitude} frequency={frequency} />
    </div>
  );
}
