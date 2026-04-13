import { OrbitControls, Sphere, Text } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

// --- 전류 입자(전자) 애니메이션 ---
const CurrentParticle = ({ path, speed, color }) => {
  const meshRef = useRef();

  const vectorPath = useMemo(() => {
    return path.map((p) => new THREE.Vector3(p[0], p[1], p[2]));
  }, [path]);

  useFrame((state) => {
    if (!vectorPath || vectorPath.length < 2) return;

    // 경사면을 따라 내려가는 애니메이션 (시간에 따라 경로 이동)
    const time = (state.clock.elapsedTime * speed) % vectorPath.length;
    const index = Math.floor(time);
    const nextIndex = (index + 1) % vectorPath.length;
    const progress = time - index;

    const p1 = vectorPath[index];
    const p2 = vectorPath[nextIndex];

    if (meshRef.current) {
      meshRef.current.position.lerpVectors(p1, p2, progress);
    }
  });

  return (
    <Sphere ref={meshRef} args={[0.2, 16, 16]}>
      <meshBasicMaterial color={color} toneMapped={false} />
    </Sphere>
  );
};

// --- 전위(Voltage) 3D 지형(Manifold) 렌더링 ---
const VoltageTerrain = ({ gridWidth, gridDepth, vertices, wireColor }) => {
  const geometryRef = useRef();

  useMemo(() => {
    if (!geometryRef.current || !vertices) return;
    const positions = geometryRef.current.attributes.position.array;

    // 파이썬에서 계산해준 Z축(높이=전위) 데이터를 PlaneGeometry에 매핑
    for (let i = 0; i < vertices.length; i++) {
      positions[i * 3 + 2] = vertices[i]; // Z값을 높이로 설정
    }
    geometryRef.current.computeVertexNormals();
    geometryRef.current.attributes.position.needsUpdate = true;
  }, [vertices]);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
      <planeGeometry
        ref={geometryRef}
        args={[15, 15, gridWidth - 1, gridDepth - 1]}
      />
      <meshStandardMaterial
        color="#1a1a1a"
        emissive={wireColor}
        emissiveIntensity={0.2}
        wireframe={true}
      />
    </mesh>
  );
};

// --- 메인 뷰어 컴포넌트 ---
const VoltageLandscapeViewer = ({ widgetData }) => {
  if (!widgetData || !widgetData.scene_data) {
    return <div style={{ color: "white" }}>전위차 지형 및 벡터 연산 중...</div>;
  }

  const { terrain, particles, labels } = widgetData.scene_data;

  return (
    <div
      style={{
        width: "100%",
        height: "600px",
        backgroundColor: "#050505",
        borderRadius: "8px",
      }}
    >
      <Canvas camera={{ position: [10, 8, 15], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />

        {/* 1. 전위 지형 (산과 평야) */}
        <VoltageTerrain
          gridWidth={terrain.width}
          gridDepth={terrain.depth}
          vertices={terrain.z_values}
          wireColor="#00ffcc"
        />

        {/* 2. 라벨 (고전위 / 저전위) */}
        {labels &&
          labels.map((lbl, idx) => (
            <Text
              key={idx}
              position={lbl.pos}
              fontSize={0.8}
              color={lbl.color}
              anchorX="center"
            >
              {lbl.text}
            </Text>
          ))}

        {/* 3. 전류 입자 (경사를 따라 흐르는 물) */}
        {particles &&
          particles.map((p, idx) => (
            <CurrentParticle
              key={idx}
              path={p.path}
              speed={p.speed}
              color={p.color}
            />
          ))}
      </Canvas>
    </div>
  );
};

export default VoltageLandscapeViewer;
