import { OrbitControls, Sphere, Text } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";

const CurrentParticle = ({ path, speed, color, size = 0.2 }) => {
  const meshRef = useRef();

  const vectorPath = useMemo(() => {
    return path.map((p) => new THREE.Vector3(p[0], p[1], p[2]));
  }, [path]);

  useFrame((state) => {
    if (!vectorPath || vectorPath.length < 2) return;

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
    <Sphere ref={meshRef} args={[size, 16, 16]}>
      <meshBasicMaterial color={color} toneMapped={false} />
    </Sphere>
  );
};

const VoltageTerrain = ({
  gridWidth,
  gridDepth,
  vertices,
  wireColor,
  emissiveIntensity = 0.2,
}) => {
  const geometryRef = useRef();

  useMemo(() => {
    if (!geometryRef.current || !vertices) return;
    const positions = geometryRef.current.attributes.position.array;

    for (let i = 0; i < vertices.length; i++) {
      positions[i * 3 + 2] = vertices[i];
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
        emissiveIntensity={emissiveIntensity}
        wireframe={true}
      />
    </mesh>
  );
};

/**
 * slopeTilt: 0 = 거의 평지·느린 전류, 1 = 비스듬한 경사·빠른 전류 (−∇φ 비유)
 */
function ManifoldScene({ terrain, particles, labels, slopeTilt }) {
  const tiltX = slopeTilt * 0.62;
  const tiltZ = slopeTilt * 0.42;
  const flowScale = 0.06 + slopeTilt * 0.94;
  const emissiveBoost = 0.08 + slopeTilt * 0.38;
  const particleSize = 0.14 + slopeTilt * 0.12;

  return (
    <group rotation={[tiltX, 0, tiltZ]}>
      <VoltageTerrain
        gridWidth={terrain.width}
        gridDepth={terrain.depth}
        vertices={terrain.z_values}
        wireColor="#00ffcc"
        emissiveIntensity={emissiveBoost}
      />

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

      {particles &&
        particles.map((p, idx) => (
          <CurrentParticle
            key={idx}
            path={p.path}
            speed={(p.speed ?? 2) * flowScale}
            color={p.color}
            size={particleSize}
          />
        ))}
    </group>
  );
}

const VoltageLandscapeViewer = ({ widgetData }) => {
  const [slopeTilt, setSlopeTilt] = useState(0.5);

  if (!widgetData || !widgetData.scene_data) {
    return <div style={{ color: "white" }}>전위차 지형 및 벡터 연산 중...</div>;
  }

  const { terrain, particles, labels } = widgetData.scene_data;

  return (
    <div
      style={{
        width: "100%",
        backgroundColor: "#050505",
        borderRadius: "8px",
        overflow: "hidden",
      }}
    >
      <div style={{ height: 520, width: "100%" }}>
        <Canvas camera={{ position: [10, 8, 15], fov: 50 }}>
          <ambientLight intensity={0.55} />
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
          />
          <ManifoldScene
            terrain={terrain}
            particles={particles}
            labels={labels}
            slopeTilt={slopeTilt}
          />
        </Canvas>
      </div>

      <div
        style={{
          padding: "14px 18px 18px",
          borderTop: "1px solid #222",
          color: "#ddd",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 600 }}>
            전위 기울기 (−∇φ 비유)
          </span>
          <span style={{ fontSize: 13, color: "#8cf0c8", minWidth: 120 }}>
            전류(입자) 속도:{" "}
            <strong>{(slopeTilt * 100).toFixed(0)}%</strong>
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(slopeTilt * 100)}
          onChange={(e) => setSlopeTilt(Number(e.target.value) / 100)}
          style={{ width: "100%", accentColor: "#00ffcc" }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 11,
            color: "#777",
            marginTop: 6,
          }}
        >
          <span>완만 (전류 약함)</span>
          <span>비스듬한 경사 (전류 강함)</span>
        </div>
        <p style={{ margin: "10px 0 0", fontSize: 12, color: "#888" }}>
          슬라이더를 오른쪽으로 올릴수록 지형이 더 기울어지고, 같은 전위차에 대해
          경사가 가파를수록 전류가 잘 흐른다는 직관을 입자 속도로 표현합니다.
        </p>
      </div>
    </div>
  );
};

export default VoltageLandscapeViewer;
