import { Line, OrbitControls, Sphere, Text } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";

// 1. 제3고조파 순환 전류(3Io) 애니메이션 컴포넌트
const HarmonicCirculator = ({ path, active, speed, color }) => {
  const meshRef = useRef();

  // 파이썬이 계산해준 경로(path)를 따라 입자를 이동시킴
  useFrame((state) => {
    if (!active || !path || path.length < 2) return;

    const time = state.clock.getElapsedTime() * speed;
    const loopTime = time % 1; // 0에서 1 사이 반복

    // 경로상의 현재 위치 계산 (단순 선형 보간)
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

// 2. 결선 선로 렌더링 컴포넌트 (Y 또는 Delta)
const ConnectionMesh = ({ terminals, center, type, color }) => {
  const points = useMemo(() => {
    if (type === "wye") {
      // Y결선: 중심점에서 각 단자로 뻗어나가는 선로
      return terminals.flatMap((t) => [
        [center.x, center.y, center.z],
        [t.x, t.y, t.z],
      ]);
    } else {
      // Delta결선: 단자끼리 이어지는 폐루프
      const p = terminals.map((t) => [t.x, t.y, t.z]);
      return [...p, p[0]]; // 마지막 점을 첫 점과 연결
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

// 3. 메인 위젯 컴포넌트
const Transformer3DWidget = ({ data }) => {
  // 백엔드(Python)에서 받은 scene_data 구조 분해
  const { primary_side, secondary_side, animations } = data.scene_data;

  return (
    <div style={{ width: "100%", height: "500px", background: "#111" }}>
      <Canvas camera={{ position: [0, 0, 15], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <OrbitControls />

        {/* 1차측 Y결선 */}
        <ConnectionMesh
          type="wye"
          center={primary_side.center}
          terminals={primary_side.terminals}
          color={primary_side.wire_color}
        />
        <Text position={[primary_side.center.x, -4, 0]} fontSize={0.5}>
          {primary_side.label}
        </Text>

        {/* 2차측 Delta결선 */}
        <ConnectionMesh
          type="delta"
          center={secondary_side.center}
          terminals={secondary_side.terminals}
          color={secondary_side.wire_color}
        />
        <Text position={[secondary_side.center.x, -4, 0]} fontSize={0.5}>
          {secondary_side.label}
        </Text>

        {/* 제3고조파 순환 애니메이션 */}
        <HarmonicCirculator
          path={animations.harmonic_circulation.path}
          active={animations.harmonic_circulation.active}
          speed={2} // 필요시 슬라이더 값과 연동
          color={animations.harmonic_circulation.particle_color}
        />
      </Canvas>
    </div>
  );
};

export default Transformer3DWidget;
