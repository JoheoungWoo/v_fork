import { Billboard, OrbitControls, Text } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";

// --- [공통 물리 로직] ---
const useMotorState = (frequency, phaseA, phaseB, phaseC) => {
  const angles = useMemo(
    () => [
      Math.PI / 2,
      Math.PI / 2 - (2 * Math.PI) / 3,
      Math.PI / 2 - (4 * Math.PI) / 3,
    ],
    [],
  );
  const visualSpeed = frequency * 0.08;
  return { angles, visualSpeed };
};

// ==========================================
// [상단 뷰] 실제 권선 구조 (Detailed Winding)
// ==========================================

const WindingPole = ({ angle, color, intensity, label }) => {
  const radius = 2.7;
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;

  return (
    <group position={[x, y, 0]} rotation={[0, 0, angle]}>
      {/* 고정자 철심 슬롯 */}
      <mesh position={[-0.5, 0, 0]}>
        <boxGeometry args={[1.0, 0.7, 2.0]} />
        <meshStandardMaterial color="#3d444d" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* 촘촘한 코일 질감 (Torus 반복으로 권선 표현) */}
      <group position={[-0.4, 0, 0]}>
        {[...Array(6)].map((_, i) => (
          <mesh
            key={i}
            position={[0, 0, -0.75 + i * 0.3]}
            rotation={[0, Math.PI / 2, 0]}
          >
            <torusGeometry args={[0.35, 0.06, 8, 24]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={intensity * 1.2}
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>
        ))}
      </group>

      {/* 극성 표시 (N/S) */}
      <Billboard position={[0.2, 0, 0]}>
        <Text fontSize={0.3} color="white" fontWeight="bold">
          {intensity > 0.1 ? label : ""}
        </Text>
      </Billboard>
    </group>
  );
};

// 마주보는 코일을 연결하는 엔드 와인딩 (End Winding Link)
const EndWindingLink = ({ angle, color, intensity }) => {
  return (
    <group rotation={[0, 0, angle]}>
      {/* 전면 연결부 */}
      <mesh position={[0, 0, 1.05]} rotation={[0, 0, 0]}>
        <torusGeometry args={[2.7, 0.05, 8, 40, Math.PI]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={intensity * 0.5}
        />
      </mesh>
      {/* 후면 연결부 */}
      <mesh position={[0, 0, -1.05]} rotation={[0, 0, 0]}>
        <torusGeometry args={[2.7, 0.05, 8, 40, Math.PI]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={intensity * 0.5}
        />
      </mesh>
    </group>
  );
};

const PhysicalScene = ({ frequency, phaseA, phaseB, phaseC }) => {
  const rotorRef = useRef();
  const [intensities, setIntensities] = useState({ a: 0, b: 0, c: 0 });
  const [polarities, setPolarities] = useState({ a: "N", b: "N", c: "N" });
  const { angles, visualSpeed } = useMotorState(
    frequency,
    phaseA,
    phaseB,
    phaseC,
  );

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * visualSpeed;
    const iA = phaseA ? Math.sin(t) : 0;
    const iB = phaseB ? Math.sin(t - (2 * Math.PI) / 3) : 0;
    const iC = phaseC ? Math.sin(t - (4 * Math.PI) / 3) : 0;

    setIntensities({ a: Math.abs(iA), b: Math.abs(iB), c: Math.abs(iC) });
    setPolarities({
      a: iA > 0 ? "N" : "S",
      b: iB > 0 ? "N" : "S",
      c: iC > 0 ? "N" : "S",
    });

    // 회전자 회전 (슬립 적용)
    const totalMag = Math.sqrt(iA ** 2 + iB ** 2 + iC ** 2);
    if (rotorRef.current) {
      if (totalMag > 0.5)
        rotorRef.current.rotation.z -= visualSpeed * 0.02 * totalMag;
      else rotorRef.current.rotation.z += Math.sin(t * 10) * 0.005; // 결상 진동
    }
  });

  return (
    <group>
      {/* 고정자 프레임 */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <tubeGeometry
          args={[new THREE.EllipseCurve(0, 0, 3.5, 3.5), 64, 0.3, 16]}
        />
        <meshStandardMaterial color="#222" metalness={0.6} />
      </mesh>

      {/* 3상 권선 및 연결 */}
      {/* A상 (Red) */}
      <WindingPole
        angle={angles[0]}
        color="#ff4d4d"
        intensity={intensities.a}
        label={polarities.a}
      />
      <WindingPole
        angle={angles[0] + Math.PI}
        color="#ff4d4d"
        intensity={intensities.a}
        label={polarities.a === "N" ? "S" : "N"}
      />
      <EndWindingLink
        angle={angles[0] - Math.PI / 2}
        color="#ff4d4d"
        intensity={intensities.a}
      />

      {/* B상 (Green) */}
      <WindingPole
        angle={angles[1]}
        color="#44ff44"
        intensity={intensities.b}
        label={polarities.b}
      />
      <WindingPole
        angle={angles[1] + Math.PI}
        color="#44ff44"
        intensity={intensities.b}
        label={polarities.b === "N" ? "S" : "N"}
      />
      <EndWindingLink
        angle={angles[1] - Math.PI / 2}
        color="#44ff44"
        intensity={intensities.b}
      />

      {/* C상 (Blue) */}
      <WindingPole
        angle={angles[2]}
        color="#44aaff"
        intensity={intensities.c}
        label={polarities.c}
      />
      <WindingPole
        angle={angles[2] + Math.PI}
        color="#44aaff"
        intensity={intensities.c}
        label={polarities.c === "N" ? "S" : "N"}
      />
      <EndWindingLink
        angle={angles[2] - Math.PI / 2}
        color="#44aaff"
        intensity={intensities.c}
      />

      {/* 농형 회전자 */}
      <group ref={rotorRef}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[1.4, 1.4, 1.8, 32]} />
          <meshStandardMaterial color="#555" metalness={0.8} />
        </mesh>
        {[...Array(12)].map((_, i) => (
          <mesh
            key={i}
            position={[
              Math.cos((i / 12) * Math.PI * 2) * 1.3,
              Math.sin((i / 12) * Math.PI * 2) * 1.3,
              0,
            ]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <cylinderGeometry args={[0.05, 0.05, 2.0]} />
            <meshStandardMaterial color="#aaa" />
          </mesh>
        ))}
      </group>
    </group>
  );
};

// ==========================================
// [하단 뷰] 추상적 자기장 시각화 (Flux)
// ==========================================

const AbstractScene = ({ frequency, phaseA, phaseB, phaseC }) => {
  const groupRef = useRef();
  const { angles, visualSpeed } = useMotorState(
    frequency,
    phaseA,
    phaseB,
    phaseC,
  );

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * visualSpeed;
    const iA = phaseA ? Math.sin(t) : 0;
    const iB = phaseB ? Math.sin(t - (2 * Math.PI) / 3) : 0;
    const iC = phaseC ? Math.sin(t - (4 * Math.PI) / 3) : 0;

    const x =
      iA * Math.cos(angles[0]) +
      iB * Math.cos(angles[1]) +
      iC * Math.cos(angles[2]);
    const y =
      iA * Math.sin(angles[0]) +
      iB * Math.sin(angles[1]) +
      iC * Math.sin(angles[2]);

    if (groupRef.current) {
      const angle = Math.atan2(y, x);
      const mag = Math.sqrt(x * x + y * y);
      groupRef.current.rotation.z = angle;
      groupRef.current.scale.setScalar(0.5 + mag * 0.5);
      groupRef.current.visible = mag > 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      {/* N/S 구체 */}
      <mesh position={[2.5, 0, 0]}>
        <sphereGeometry args={[0.4]} />
        <meshBasicMaterial color="#3a86ff" />
      </mesh>
      <mesh position={[-2.5, 0, 0]}>
        <sphereGeometry args={[0.4]} />
        <meshBasicMaterial color="#ff006e" />
      </mesh>

      {/* 자기력선 */}
      {[1, 1.5, 2].map((r, i) => (
        <group key={i}>
          <mesh rotation={[0, 0, 0]}>
            <torusGeometry args={[r, 0.02, 8, 40, Math.PI]} />
            <meshBasicMaterial color="#00f5d4" transparent opacity={0.4} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI]}>
            <torusGeometry args={[r, 0.02, 8, 40, Math.PI]} />
            <meshBasicMaterial color="#00f5d4" transparent opacity={0.4} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

// ==========================================
// [메인 컴포넌트]
// ==========================================

export default function App() {
  const [freq, setFreq] = useState(60);
  const [pa, setPa] = useState(true);
  const [pb, setPb] = useState(true);
  const [pc, setPc] = useState(true);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#111",
        color: "white",
      }}
    >
      {/* 상단 컨트롤러 */}
      <div
        style={{
          padding: "20px",
          display: "flex",
          gap: "20px",
          alignItems: "center",
          borderBottom: "1px solid #444",
        }}
      >
        <h2 style={{ margin: 0 }}>3상 유도 전동기 권선 시뮬레이터</h2>
        <input
          type="range"
          min="0"
          max="120"
          value={freq}
          onChange={(e) => setFreq(Number(e.target.value))}
        />
        <span>{freq} Hz</span>
        <button
          onClick={() => setPa(!pa)}
          style={{ background: pa ? "#ff4d4d" : "#333" }}
        >
          A상
        </button>
        <button
          onClick={() => setPb(!pb)}
          style={{ background: pb ? "#44ff44" : "#333" }}
        >
          B상
        </button>
        <button
          onClick={() => setPc(!pc)}
          style={{ background: pc ? "#44aaff" : "#333" }}
        >
          C상
        </button>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* 상단: 물리적 권선 구조 */}
        <div style={{ flex: 1, position: "relative" }}>
          <div style={{ position: "absolute", top: 10, left: 10, zIndex: 1 }}>
            [1] 실제 권선 및 엔드 와인딩 구조
          </div>
          <Canvas camera={{ position: [0, -5, 8], fov: 45 }}>
            <color attach="background" args={["#151515"]} />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <PhysicalScene
              frequency={freq}
              phaseA={pa}
              phaseB={pb}
              phaseC={pc}
            />
            <OrbitControls />
          </Canvas>
        </div>

        {/* 하단: 추상적 자기장 */}
        <div
          style={{ flex: 1, position: "relative", borderTop: "2px solid #444" }}
        >
          <div style={{ position: "absolute", top: 10, left: 10, zIndex: 1 }}>
            [2] 회전 자기장 (추상 시각화)
          </div>
          <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
            <color attach="background" args={["#0a0a0a"]} />
            <AbstractScene
              frequency={freq}
              phaseA={pa}
              phaseB={pb}
              phaseC={pc}
            />
            <OrbitControls enableRotate={false} />
          </Canvas>
        </div>
      </div>
    </div>
  );
}
