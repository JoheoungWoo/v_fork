import { Box, Cylinder, Line, OrbitControls, Text } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";

// --- [1] 모터 컴포넌트 ---
const Motor = ({ direction, speed }) => {
  const motorRef = useRef();

  useFrame(() => {
    if (direction === "forward") {
      motorRef.current.rotation.x += speed * 0.05;
    } else if (direction === "reverse") {
      motorRef.current.rotation.x -= speed * 0.05;
    }
  });

  return (
    <group>
      <Cylinder
        ref={motorRef}
        args={[1.2, 1.2, 3, 32]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <meshStandardMaterial color="#0055ff" metalness={0.8} roughness={0.2} />
      </Cylinder>
      <Text
        position={[0, 0, 1.5]}
        fontSize={0.5}
        color="white"
        outlineWidth={0.05}
        outlineColor="black"
      >
        DC Motor
      </Text>
    </group>
  );
};

// --- [2] 전류 파티클 시스템 컴포넌트 ---
const CurrentParticles = ({ direction, speed }) => {
  const particlesRef = useRef();
  const particleCount = 20;

  // 정방향(Q1 -> Motor -> Q4) 및 역방향(Q3 -> Motor -> Q2) 경로 곡선 생성
  const forwardCurve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-3, 4, 0), // Vcc
        new THREE.Vector3(-3, 3, 0), // Q1
        new THREE.Vector3(-1.5, 0, 0), // Motor Left
        new THREE.Vector3(1.5, 0, 0), // Motor Right
        new THREE.Vector3(3, -3, 0), // Q4
        new THREE.Vector3(3, -4, 0), // GND
      ]),
    [],
  );

  const reverseCurve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(3, 4, 0), // Vcc
        new THREE.Vector3(3, 3, 0), // Q3
        new THREE.Vector3(1.5, 0, 0), // Motor Right
        new THREE.Vector3(-1.5, 0, 0), // Motor Left
        new THREE.Vector3(-3, -3, 0), // Q2
        new THREE.Vector3(-3, -4, 0), // GND
      ]),
    [],
  );

  // 파티클 초기 위치 진행도(t) 배열
  const [progresses] = useState(() =>
    Array.from({ length: particleCount }, (_, i) => i / particleCount),
  );

  useFrame(() => {
    if (direction === "stop" || !particlesRef.current) return;

    const curve = direction === "forward" ? forwardCurve : reverseCurve;
    const dummy = new THREE.Object3D();

    progresses.forEach((t, i) => {
      // 속도에 따라 진행도 업데이트
      progresses[i] += speed * 0.005;
      if (progresses[i] > 1) progresses[i] = 0;

      // 곡선 상의 위치 계산
      const position = curve.getPointAt(progresses[i]);
      dummy.position.copy(position);
      dummy.updateMatrix();

      // InstancedMesh의 해당 인스턴스 위치 업데이트
      particlesRef.current.setMatrixAt(i, dummy.matrix);
    });
    particlesRef.current.instanceMatrix.needsUpdate = true;
  });

  if (direction === "stop") return null;

  return (
    <instancedMesh ref={particlesRef} args={[null, null, particleCount]}>
      <sphereGeometry args={[0.15, 16, 16]} />
      <meshBasicMaterial color="#ffff00" toneMapped={false} />
    </instancedMesh>
  );
};

// --- [3] 메인 시뮬레이션 UI 및 씬 ---
export default function HBridgeSimulation() {
  const [direction, setDirection] = useState("stop"); // 'forward', 'reverse', 'stop'
  const [speed, setSpeed] = useState(5);

  const switchStyle = { color: "#555", metalness: 0.5, roughness: 0.5 };
  const activeColor = "#ff3333";

  return (
    <div
      style={{
        width: "100%",
        height: "800px",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#111",
      }}
    >
      {/* 컨트롤 패널 */}
      <div
        style={{
          padding: "20px",
          backgroundColor: "#222",
          color: "white",
          display: "flex",
          gap: "20px",
          alignItems: "center",
        }}
      >
        <div>
          <strong>방향 제어:</strong>
          <button
            onClick={() => setDirection("forward")}
            style={{
              marginLeft: "10px",
              padding: "8px 16px",
              background: direction === "forward" ? "#007bff" : "#444",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
          >
            정방향 (Q1, Q4)
          </button>
          <button
            onClick={() => setDirection("stop")}
            style={{
              marginLeft: "10px",
              padding: "8px 16px",
              background: direction === "stop" ? "#dc3545" : "#444",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
          >
            정지
          </button>
          <button
            onClick={() => setDirection("reverse")}
            style={{
              marginLeft: "10px",
              padding: "8px 16px",
              background: direction === "reverse" ? "#007bff" : "#444",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
          >
            역방향 (Q3, Q2)
          </button>
        </div>
        <div style={{ flexGrow: 1 }}>
          <strong>전류 세기 (속도): {speed}</strong>
          <input
            type="range"
            min="1"
            max="10"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            style={{ width: "100%", marginLeft: "10px" }}
          />
        </div>
      </div>

      {/* 3D 캔버스 */}
      <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <OrbitControls enablePan={true} enableZoom={true} />

        {/* Q1 Switch */}
        <group position={[-3, 3, 0]}>
          <Box args={[1.5, 1.5, 1.5]}>
            <meshStandardMaterial
              {...switchStyle}
              color={direction === "forward" ? activeColor : switchStyle.color}
            />
          </Box>
          <Text position={[0, 0, 1]} fontSize={0.6} color="white">
            Q1
          </Text>
        </group>

        {/* Q2 Switch */}
        <group position={[-3, -3, 0]}>
          <Box args={[1.5, 1.5, 1.5]}>
            <meshStandardMaterial
              {...switchStyle}
              color={direction === "reverse" ? activeColor : switchStyle.color}
            />
          </Box>
          <Text position={[0, 0, 1]} fontSize={0.6} color="white">
            Q2
          </Text>
        </group>

        {/* Q3 Switch */}
        <group position={[3, 3, 0]}>
          <Box args={[1.5, 1.5, 1.5]}>
            <meshStandardMaterial
              {...switchStyle}
              color={direction === "reverse" ? activeColor : switchStyle.color}
            />
          </Box>
          <Text position={[0, 0, 1]} fontSize={0.6} color="white">
            Q3
          </Text>
        </group>

        {/* Q4 Switch */}
        <group position={[3, -3, 0]}>
          <Box args={[1.5, 1.5, 1.5]}>
            <meshStandardMaterial
              {...switchStyle}
              color={direction === "forward" ? activeColor : switchStyle.color}
            />
          </Box>
          <Text position={[0, 0, 1]} fontSize={0.6} color="white">
            Q4
          </Text>
        </group>

        {/* 중앙 모터 */}
        <Motor direction={direction} speed={speed} />

        {/* 전류 흐름 파티클 */}
        <CurrentParticles direction={direction} speed={speed} />

        {/* 회로 연결 선 (시각적 가이드) */}
        <Line
          points={[
            [-3, 4, 0],
            [-3, 3, 0],
            [-1.5, 0, 0],
          ]}
          color="gray"
          lineWidth={2}
        />
        <Line
          points={[
            [3, 4, 0],
            [3, 3, 0],
            [1.5, 0, 0],
          ]}
          color="gray"
          lineWidth={2}
        />
        <Line
          points={[
            [-1.5, 0, 0],
            [-3, -3, 0],
            [-3, -4, 0],
          ]}
          color="gray"
          lineWidth={2}
        />
        <Line
          points={[
            [1.5, 0, 0],
            [3, -3, 0],
            [3, -4, 0],
          ]}
          color="gray"
          lineWidth={2}
        />
      </Canvas>
    </div>
  );
}
