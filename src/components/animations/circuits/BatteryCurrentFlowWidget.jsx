import {
  Line,
  OrbitControls,
  PerspectiveCamera,
  Text,
} from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { useRef, useState } from "react";

// 1. 배터리 컴포넌트 (3D)
const Battery = ({ position, label }) => (
  <group position={position}>
    {/* 배터리 본체 */}
    <mesh castShadow>
      <cylinderGeometry args={[0.4, 0.4, 1.2, 32]} />
      <meshStandardMaterial color="#333" metalness={0.8} roughness={0.2} />
    </mesh>
    {/* 플러스 단자 */}
    <mesh position={[0, 0.65, 0]}>
      <cylinderGeometry args={[0.15, 0.15, 0.1, 32]} />
      <meshStandardMaterial color="#d4af37" metalness={1} />
    </mesh>
    {/* 라벨 (+/-) */}
    <Text position={[0, 0, 0.45]} fontSize={0.2} color="white">
      +
    </Text>
  </group>
);

// 2. 전구 컴포넌트 (빛 발산)
const LightBulb = ({ intensity }) => {
  return (
    <group position={[3, 0, 0]}>
      {/* 전구 유리 */}
      <mesh>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial
          emissive="#ffaa00"
          emissiveIntensity={intensity * 2}
          transparent
          opacity={0.6}
          color={intensity > 0 ? "#fff" : "#444"}
        />
      </mesh>
      {/* 전구 소켓 */}
      <mesh position={[0, -0.6, 0]}>
        <cylinderGeometry args={[0.2, 0.25, 0.4, 32]} />
        <meshStandardMaterial color="#888" metalness={1} />
      </mesh>
      {/* 포인트 라이트 (실제 조명 효과) */}
      <pointLight intensity={intensity * 50} color="#ffcc00" distance={10} />
    </group>
  );
};

// 3. 전류 애니메이션 도선
const AnimatedCircuit = ({ points, active }) => {
  const lineRef = useRef();

  useFrame((state) => {
    if (active && lineRef.current) {
      // 대시 오프셋을 조절해 흐르는 효과 구현
      lineRef.current.lineDashOffset -= 0.02;
    }
  });

  return (
    <Line
      ref={lineRef}
      points={points}
      color={active ? "#00ff00" : "#444"}
      lineWidth={3}
      dashed
      dashSize={0.2}
      gapSize={0.1}
    />
  );
};

export default function BatteryCurrentFlowWidget() {
  const [mode, setMode] = useState("parallel"); // 'series' or 'parallel'
  const [count, setCount] = useState(2);

  const voltage = mode === "series" ? 1.5 * count : 1.5;
  const isGlowing = voltage > 0;

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        background: "#050a1f",
        position: "relative",
      }}
    >
      {/* UI 컨트롤러 */}
      <div
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          zIndex: 10,
          color: "white",
        }}
      >
        <h2>회로 시뮬레이터 (3D R3F)</h2>
        <button onClick={() => setMode("series")}>직렬 연결</button>
        <button onClick={() => setMode("parallel")} style={{ marginLeft: 10 }}>
          병렬 연결
        </button>
        <div style={{ marginTop: 10 }}>
          배터리 개수:
          <input
            type="range"
            min="1"
            max="4"
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
          />
          <span> {count}개</span>
        </div>
        <h3 style={{ color: "#00ff00" }}>
          Total Voltage: {voltage.toFixed(1)}V
        </h3>
      </div>

      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 2, 8]} />
        <OrbitControls />

        {/* 환경 광원 */}
        <ambientLight intensity={0.2} />
        <spotLight
          position={[10, 10, 10]}
          angle={0.15}
          penumbra={1}
          castShadow
        />

        {/* 배터리 배치 */}
        {Array.from({ length: count }).map((_, i) => (
          <Battery
            key={i}
            position={
              mode === "series"
                ? [0, 0, -i * 1.5]
                : [i * 1.2 - (count - 1) * 0.6, 0, 0]
            }
          />
        ))}

        {/* 전구 */}
        <LightBulb intensity={voltage / 6} />

        {/* 도선 (병렬 예시 경로) */}
        {mode === "parallel" && (
          <AnimatedCircuit
            active={isGlowing}
            points={[
              [-1, -0.6, 0],
              [1, -0.6, 0],
              [3, -0.6, 0],
              [3, -0.1, 0],
            ]}
          />
        )}

        {/* 포스트 프로세싱 (Bloom 효과 핵심) */}
        <EffectComposer>
          <Bloom
            intensity={1.5}
            luminanceThreshold={0.2}
            luminanceSmoothing={0.9}
            mipmapBlur
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
