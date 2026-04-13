import { Cylinder, Line, OrbitControls, Sphere, Text } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

// --- 전류 입자 애니메이션 컴포넌트 ---
const CurrentParticle = ({ path, speed, color, size }) => {
  const ref = useRef();

  useFrame((state) => {
    if (!path || path.length < 2) return;
    // 경로 진행률 계산 (0 ~ 1 반복)
    const t = (state.clock.elapsedTime * speed) % path.length;
    const index = Math.floor(t);
    const nextIndex = (index + 1) % path.length;
    const progress = t - index;

    const p1 = new THREE.Vector3(...path[index]);
    const p2 = new THREE.Vector3(...path[nextIndex]);

    // 점과 점 사이를 선형 보간(Lerp)하여 부드럽게 이동
    ref.current.position.lerpVectors(p1, p2, progress);
  });

  return (
    <Sphere ref={ref} args={[size, 16, 16]}>
      <meshBasicMaterial color={color} />
    </Sphere>
  );
};

// --- 코일(인덕터) 형태를 그리는 컴포넌트 ---
const InductorCoil = ({ top, bot, color }) => {
  // top과 bot의 중간 지점에 코일 모형(Cylinder) 배치
  const midY = (top[1] + bot[1]) / 2;
  return (
    <group>
      {/* 단순화를 위해 코일을 원통으로 표현. 원한다면 나선형 점 배열을 백엔드에서 받아와 Line으로 그려도 됨 */}
      <Cylinder
        position={[top[0], midY, 0]}
        args={[0.4, 0.4, Math.abs(top[1] - bot[1]), 16]}
        rotation={[0, 0, 0]}
      >
        <meshStandardMaterial color="#555" wireframe={true} />
      </Cylinder>
    </group>
  );
};

// --- 메인 뷰어 컴포넌트 ---
const Wiring3DViewer = ({ widgetData }) => {
  if (!widgetData) return <div>로딩 중... (백엔드 연산 대기)</div>;
  const { coils, wires, labels, animations } = widgetData.scene_data;

  return (
    <div style={{ width: "100%", height: "600px", backgroundColor: "#222" }}>
      <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
        <ambientLight intensity={0.8} />
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />

        {/* 1. 와이어(결선) 그리기 */}
        {wires.map((wire, idx) => (
          <Line
            key={`wire-${idx}`}
            points={wire.points}
            color="white"
            lineWidth={2}
          />
        ))}

        {/* 2. 1차측 / 2차측 코일 그리기 */}
        {coils.primary.map((coil, idx) => (
          <InductorCoil key={`p-coil-${idx}`} top={coil.top} bot={coil.bot} />
        ))}
        {coils.secondary.map((coil, idx) => (
          <InductorCoil key={`s-coil-${idx}`} top={coil.top} bot={coil.bot} />
        ))}

        {/* 3. 라벨 텍스트 렌더링 */}
        {labels.map((lbl, idx) => (
          <Text
            key={`lbl-${idx}`}
            position={lbl.pos}
            fontSize={0.6}
            color="#4da6ff"
          >
            {lbl.text}
          </Text>
        ))}

        {/* 4. 애니메이션 (순환 전류) 렌더링 */}
        {animations.map(
          (anim, idx) =>
            anim.active && (
              <CurrentParticle
                key={`anim-${idx}`}
                path={anim.path}
                speed={anim.speed}
                color={anim.color}
                size={anim.size}
              />
            ),
        )}
      </Canvas>
    </div>
  );
};

export default Wiring3DViewer;
