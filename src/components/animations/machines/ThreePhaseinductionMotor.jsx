import { Billboard, OrbitControls, Text } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import * as THREE from "three";

// ==========================================
// [1] 전류 파형 그래프 컴포넌트 (SVG)
// ==========================================
const WaveformGraph = ({ time, phaseA, phaseB, phaseC }) => {
  const width = 320;
  const height = 120;
  const points = 100;

  const getPath = (offset, enabled) => {
    if (!enabled) return "";
    let d = `M 0 ${height / 2}`;
    for (let i = 0; i <= points; i++) {
      const x = (i / points) * width;
      const angle = (i / points) * Math.PI * 4; // 2주기 표시
      const y = height / 2 - Math.sin(angle - offset) * (height * 0.4);
      d += ` L ${x} ${y}`;
    }
    return d;
  };

  // 현재 시간(time)을 그래프 가로축 범위(0 ~ 4π)에 맞게 맵핑
  const currentX = ((time % (Math.PI * 4)) / (Math.PI * 4)) * width;

  return (
    <div
      style={{
        background: "#1a1a1a",
        padding: "10px",
        borderRadius: "8px",
        border: "1px solid #444",
      }}
    >
      <svg width={width} height={height} style={{ overflow: "visible" }}>
        <line
          x1="0"
          y1={height / 2}
          x2={width}
          y2={height / 2}
          stroke="#333"
          strokeDasharray="4"
        />
        <path
          d={getPath(0, phaseA)}
          fill="none"
          stroke="#ff4d4d"
          strokeWidth="2"
          opacity="0.8"
        />
        <path
          d={getPath((2 * Math.PI) / 3, phaseB)}
          fill="none"
          stroke="#44ff44"
          strokeWidth="2"
          opacity="0.8"
        />
        <path
          d={getPath((4 * Math.PI) / 3, phaseC)}
          fill="none"
          stroke="#44aaff"
          strokeWidth="2"
          opacity="0.8"
        />
        <line
          x1={currentX}
          y1="-5"
          x2={currentX}
          y2={height + 5}
          stroke="#ffff00"
          strokeWidth="2"
        />
        <circle
          cx={currentX}
          cy={height / 2 - Math.sin(time % (Math.PI * 4)) * (height * 0.4)}
          r="3"
          fill="#ff4d4d"
        />
      </svg>
      <div
        style={{
          fontSize: "11px",
          color: "#aaa",
          textAlign: "center",
          marginTop: "5px",
        }}
      >
        실시간 3상 전류 파형
      </div>
    </div>
  );
};

// ==========================================
// [2] 물리적 구조 컴포넌트 (권선 & 회전자)
// ==========================================

// 듬성듬성한 권선 뭉치
const SparseWindingPole = ({ angle, color, intensity, label }) => {
  return (
    <group
      position={[Math.cos(angle) * 2.7, Math.sin(angle) * 2.7, 0]}
      rotation={[0, 0, angle]}
    >
      <mesh position={[-0.5, 0, 0]}>
        <boxGeometry args={[1.0, 0.6, 2.2]} />
        <meshStandardMaterial color="#2c3e50" metalness={0.8} />
      </mesh>
      <group position={[-0.4, 0, 0]}>
        {[...Array(8)].map((_, i) => (
          <mesh
            key={i}
            position={[0, 0, -0.8 + i * 0.23]}
            rotation={[0, Math.PI / 2, 0]}
          >
            <torusGeometry args={[0.32, 0.02, 8, 32]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={intensity * 1.5}
              metalness={1}
            />
          </mesh>
        ))}
      </group>
      <Billboard position={[0.4, 0, 0]}>
        <Text fontSize={0.3} color="white" fontWeight="bold">
          {intensity > 0.1 ? label : ""}
        </Text>
      </Billboard>
    </group>
  );
};

// 상단/하단 연결부 (End Winding)
const EndWindingSparse = ({ angle, color, intensity }) => (
  <group rotation={[0, 0, angle]}>
    {[0.08, -0.08].map((z, i) => (
      <mesh key={i} position={[0, 0, 1.1 + z]}>
        <torusGeometry args={[2.7, 0.015, 8, 64, Math.PI]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={intensity}
        />
      </mesh>
    ))}
    {[0.08, -0.08].map((z, i) => (
      <mesh key={i} position={[0, 0, -1.1 - z]}>
        <torusGeometry args={[2.7, 0.015, 8, 64, Math.PI]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={intensity}
        />
      </mesh>
    ))}
  </group>
);

const PhysicalScene = ({ frequency, phaseA, phaseB, phaseC, setAppTime }) => {
  const rotorRef = useRef();
  const angles = [
    Math.PI / 2,
    Math.PI / 2 - (2 * Math.PI) / 3,
    Math.PI / 2 - (4 * Math.PI) / 3,
  ];
  const [data, setData] = useState({ iA: 0, iB: 0, iC: 0 });

  useFrame(({ clock }) => {
    const visualSpeed = frequency * 0.08;
    const t = clock.getElapsedTime() * visualSpeed;
    setAppTime(t); // 전역 시간 업데이트

    const iA = phaseA ? Math.sin(t) : 0;
    const iB = phaseB ? Math.sin(t - (2 * Math.PI) / 3) : 0;
    const iC = phaseC ? Math.sin(t - (4 * Math.PI) / 3) : 0;
    setData({ iA, iB, iC });

    const totalMag = Math.sqrt(iA ** 2 + iB ** 2 + iC ** 2);
    if (rotorRef.current) {
      if (totalMag > 0.4)
        rotorRef.current.rotation.z -= visualSpeed * 0.02 * totalMag;
      else rotorRef.current.rotation.z += Math.sin(t * 15) * 0.01;
    }
  });

  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <tubeGeometry
          args={[new THREE.EllipseCurve(0, 0, 3.8, 3.8), 64, 0.1, 16]}
        />
        <meshStandardMaterial color="#111" />
      </mesh>

      <SparseWindingPole
        angle={angles[0]}
        color="#ff4d4d"
        intensity={Math.abs(data.iA)}
        label={data.iA > 0 ? "N" : "S"}
      />
      <SparseWindingPole
        angle={angles[0] + Math.PI}
        color="#ff4d4d"
        intensity={Math.abs(data.iA)}
        label={data.iA > 0 ? "S" : "N"}
      />
      <EndWindingSparse
        angle={angles[0] - Math.PI / 2}
        color="#ff4d4d"
        intensity={Math.abs(data.iA)}
      />

      <SparseWindingPole
        angle={angles[1]}
        color="#44ff44"
        intensity={Math.abs(data.iB)}
        label={data.iB > 0 ? "N" : "S"}
      />
      <SparseWindingPole
        angle={angles[1] + Math.PI}
        color="#44ff44"
        intensity={Math.abs(data.iB)}
        label={data.iB > 0 ? "S" : "N"}
      />
      <EndWindingSparse
        angle={angles[1] - Math.PI / 2}
        color="#44ff44"
        intensity={Math.abs(data.iB)}
      />

      <SparseWindingPole
        angle={angles[2]}
        color="#44aaff"
        intensity={Math.abs(data.iC)}
        label={data.iC > 0 ? "N" : "S"}
      />
      <SparseWindingPole
        angle={angles[2] + Math.PI}
        color="#44aaff"
        intensity={Math.abs(data.iC)}
        label={data.iC > 0 ? "S" : "N"}
      />
      <EndWindingSparse
        angle={angles[2] - Math.PI / 2}
        color="#44aaff"
        intensity={Math.abs(data.iC)}
      />

      <group ref={rotorRef}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[1.3, 1.3, 2.0, 32]} />
          <meshStandardMaterial color="#444" metalness={0.9} />
        </mesh>
        {[...Array(16)].map((_, i) => (
          <mesh
            key={i}
            position={[
              Math.cos((i / 16) * Math.PI * 2) * 1.2,
              Math.sin((i / 16) * Math.PI * 2) * 1.2,
              0,
            ]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <cylinderGeometry args={[0.04, 0.04, 2.2]} />
            <meshStandardMaterial color="#888" />
          </mesh>
        ))}
      </group>
    </group>
  );
};

// ==========================================
// [3] 추상적 자기장 컴포넌트
// ==========================================

const AbstractScene = ({ time, phaseA, phaseB, phaseC }) => {
  const groupRef = useRef();
  const angles = [
    Math.PI / 2,
    Math.PI / 2 - (2 * Math.PI) / 3,
    Math.PI / 2 - (4 * Math.PI) / 3,
  ];

  useFrame(() => {
    const iA = phaseA ? Math.sin(time) : 0;
    const iB = phaseB ? Math.sin(time - (2 * Math.PI) / 3) : 0;
    const iC = phaseC ? Math.sin(time - (4 * Math.PI) / 3) : 0;

    const x =
      iA * Math.cos(angles[0]) +
      iB * Math.cos(angles[1]) +
      iC * Math.cos(angles[2]);
    const y =
      iA * Math.sin(angles[0]) +
      iB * Math.sin(angles[1]) +
      iC * Math.sin(angles[2]);

    if (groupRef.current) {
      const mag = Math.sqrt(x * x + y * y);
      groupRef.current.rotation.z = Math.atan2(y, x);
      groupRef.current.scale.setScalar(0.6 + mag * 0.5);
      groupRef.current.visible = mag > 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh position={[2.8, 0, 0]}>
        <sphereGeometry args={[0.4]} />
        <meshBasicMaterial color="#007bff" />
      </mesh>
      <Text
        position={[2.8, 0, 0.5]}
        fontSize={0.5}
        color="white"
        fontWeight="bold"
      >
        N
      </Text>
      <mesh position={[-2.8, 0, 0]}>
        <sphereGeometry args={[0.4]} />
        <meshBasicMaterial color="#dc3545" />
      </mesh>
      <Text
        position={[-2.8, 0, 0.5]}
        fontSize={0.5}
        color="white"
        fontWeight="bold"
      >
        S
      </Text>
      {[1.2, 1.8, 2.4].map((r, i) => (
        <group key={i}>
          <mesh>
            <torusGeometry args={[r, 0.02, 16, 100, Math.PI]} />
            <meshBasicMaterial color="#00ffcc" transparent opacity={0.3} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI]}>
            <torusGeometry args={[r, 0.02, 16, 100, Math.PI]} />
            <meshBasicMaterial color="#00ffcc" transparent opacity={0.3} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

// ==========================================
// [4] 메인 레이아웃 및 상태 관리
// ==========================================

export default function App() {
  const [freq, setFreq] = useState(60);
  const [pa, setPa] = useState(true);
  const [pb, setPb] = useState(true);
  const [pc, setPc] = useState(true);
  const [appTime, setAppTime] = useState(0);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#000",
        color: "#fff",
        overflow: "hidden",
      }}
    >
      {/* 헤더 컨트롤 패널 */}
      <div
        style={{
          padding: "10px 30px",
          background: "#111",
          borderBottom: "1px solid #333",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <h3 style={{ margin: 0, color: "#00ffcc" }}>
            3상 유도 전동기 통합 시뮬레이터
          </h3>
          <WaveformGraph time={appTime} phaseA={pa} phaseB={pb} phaseC={pc} />
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            alignItems: "flex-end",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "14px" }}>주파수 제어: </span>
            <input
              type="range"
              min="0"
              max="120"
              value={freq}
              onChange={(e) => setFreq(Number(e.target.value))}
              style={{ cursor: "pointer" }}
            />
            <span style={{ minWidth: "50px", fontWeight: "bold" }}>
              {freq} Hz
            </span>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => setPa(!pa)}
              style={{
                padding: "6px 12px",
                borderRadius: "4px",
                border: "none",
                background: pa ? "#ff4d4d" : "#333",
                color: "#fff",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Phase A
            </button>
            <button
              onClick={() => setPb(!pb)}
              style={{
                padding: "6px 12px",
                borderRadius: "4px",
                border: "none",
                background: pb ? "#44ff44" : "#333",
                color: "#fff",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Phase B
            </button>
            <button
              onClick={() => setPc(!pc)}
              style={{
                padding: "6px 12px",
                borderRadius: "4px",
                border: "none",
                background: pc ? "#44aaff" : "#333",
                color: "#fff",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Phase C
            </button>
          </div>
        </div>
      </div>

      {/* 메인 뷰포트 (상하 분할) */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, position: "relative" }}>
          <div
            style={{
              position: "absolute",
              top: 10,
              left: 10,
              zIndex: 1,
              background: "rgba(0,0,0,0.6)",
              padding: "4px 12px",
              borderRadius: "4px",
              fontSize: "13px",
            }}
          >
            [1] 물리적 권선 구조 (Sparse Winding & End Links)
          </div>
          <Canvas camera={{ position: [0, -6, 9], fov: 40 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1.2} />
            <PhysicalScene
              frequency={freq}
              phaseA={pa}
              phaseB={pb}
              phaseC={pc}
              setAppTime={setAppTime}
            />
            <OrbitControls />
          </Canvas>
        </div>

        <div
          style={{ flex: 1, position: "relative", borderTop: "2px solid #333" }}
        >
          <div
            style={{
              position: "absolute",
              top: 10,
              left: 10,
              zIndex: 1,
              background: "rgba(0,0,0,0.6)",
              padding: "4px 12px",
              borderRadius: "4px",
              fontSize: "13px",
            }}
          >
            [2] 회전 자기장 추상 시각화 (Magnetic Flux)
          </div>
          <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
            <AbstractScene time={appTime} phaseA={pa} phaseB={pb} phaseC={pc} />
            <OrbitControls enableRotate={false} />
          </Canvas>
        </div>
      </div>
    </div>
  );
}
