import { Billboard, OrbitControls, Text } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

function GeneratorBody({ speed, Ia, If }) {
  const rotorRef = useRef();

  useFrame(() => {
    if (rotorRef.current) {
      rotorRef.current.rotation.z -= speed * 0.05;
    }
  });

  return (
    <group position={[0, -0.5, 0]}>
      {/* 고정자 (Stator / Yoke) */}
      <mesh rotation={[0, 0, 0]}>
        <tubeGeometry
          args={[new THREE.EllipseCurve(0, 0, 2.5, 2.5), 64, 0.4, 16]}
        />
        <meshStandardMaterial color="#2c3e50" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* 계자 코일 (Field Winding - 분권) */}
      <group position={[2.5, 0, 0]}>
        <mesh>
          <boxGeometry args={[0.8, 1.2, 1.5]} />
          <meshStandardMaterial color="#5d6d7e" metalness={0.35} roughness={0.55} />
        </mesh>
        {[...Array(6)].map((_, i) => (
          <mesh
            key={`f1-${i}`}
            position={[0, -0.5 + i * 0.2, 0]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <torusGeometry args={[0.45, 0.05, 8, 24]} />
            <meshStandardMaterial
              color="#3498db"
              emissive="#3498db"
              emissiveIntensity={If * 0.5}
            />
          </mesh>
        ))}
        <Billboard position={[1, 0, 0]}>
          <Text fontSize={0.4} color="#3498db" fontWeight="bold">
            N
          </Text>
        </Billboard>
      </group>

      <group position={[-2.5, 0, 0]}>
        <mesh>
          <boxGeometry args={[0.8, 1.2, 1.5]} />
          <meshStandardMaterial color="#5d6d7e" metalness={0.35} roughness={0.55} />
        </mesh>
        {[...Array(6)].map((_, i) => (
          <mesh
            key={`f2-${i}`}
            position={[0, -0.5 + i * 0.2, 0]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <torusGeometry args={[0.45, 0.05, 8, 24]} />
            <meshStandardMaterial
              color="#3498db"
              emissive="#3498db"
              emissiveIntensity={If * 0.5}
            />
          </mesh>
        ))}
        <Billboard position={[-1, 0, 0]}>
          <Text fontSize={0.4} color="#3498db" fontWeight="bold">
            S
          </Text>
        </Billboard>
      </group>

      {/* 회전자 및 전기자 코일 (Rotor & Armature) */}
      <group ref={rotorRef}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[1.5, 1.5, 1.6, 32]} />
          <meshStandardMaterial
            color="#c0c7cf"
            emissive="#3a3f46"
            emissiveIntensity={0.35}
            metalness={0.75}
            roughness={0.28}
          />
        </mesh>
        {[...Array(12)].map((_, i) => (
          <mesh
            key={`a-${i}`}
            position={[
              Math.cos((i / 12) * Math.PI * 2) * 1.5,
              Math.sin((i / 12) * Math.PI * 2) * 1.5,
              0,
            ]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <cylinderGeometry args={[0.08, 0.08, 1.7]} />
            <meshStandardMaterial
              color="#e74c3c"
              emissive="#e74c3c"
              emissiveIntensity={Ia * 0.05}
            />
          </mesh>
        ))}
      </group>

      {/* 축과 정류자 (Commutator) */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 1.2]}>
        <cylinderGeometry args={[0.5, 0.5, 0.8, 16]} />
        <meshStandardMaterial color="#f1c40f" metalness={0.9} />
      </mesh>
    </group>
  );
}

export default function ShuntGenerator3DModel({ speed, Ia, If }) {
  return (
    <div
      style={{
        flex: "1 1 400px",
        height: "350px",
        position: "relative",
        backgroundColor: "#15171e",
        borderRight: "1px solid #3d424b",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          zIndex: 1,
          color: "#fff",
          background: "#000a",
          padding: "5px 10px",
          borderRadius: "4px",
          fontSize: "12px",
        }}
      >
        [3D] 분권 발전기 실제 물리 구조
      </div>
      <Canvas camera={{ position: [0, -3, 6], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1.2} />
        <GeneratorBody speed={speed} Ia={Ia} If={If} />
        <OrbitControls enableZoom={false} />
      </Canvas>
    </div>
  );
}
