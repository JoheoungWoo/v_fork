import { Billboard, OrbitControls, Text } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

const TOPOLOGY_LABEL = {
  separate: "[3D] 타여자 — 외부 계자전원 + 기기 본체",
  self: "[3D] 자여자 — 단자에서 계자 공급(대표)",
  shunt: "[3D] 분권 — 극 슈에 분권 계자 권선",
  series: "[3D] 직권 — 부하와 직렬인 저저항 계자(주황)",
  compound: "[3D] 복권 — 분권(청) + 직권(주황)",
  cumulative: "[3D] 내분권 가산 복권 — 이중 계자",
  differential: "[3D] 외분권 감산 복권 — 상쇄 자속(적색 표시)",
};

function ExternalFieldSupply() {
  return (
    <group position={[0, 2.2, 0]}>
      <mesh>
        <boxGeometry args={[1.1, 0.45, 0.55]} />
        <meshStandardMaterial color="#243447" emissive="#1a3a6e" emissiveIntensity={0.25} metalness={0.4} roughness={0.45} />
      </mesh>
      <Billboard position={[0, 0.55, 0]}>
        <Text fontSize={0.22} color="#79a9ff" fontWeight="bold">
          외부 Vf
        </Text>
      </Billboard>
    </group>
  );
}

function GeneratorBody({ speed, Ia, If, Ise, topology }) {
  const rotorRef = useRef();

  useFrame(() => {
    if (rotorRef.current) {
      rotorRef.current.rotation.z -= speed * 0.05;
    }
  });

  const isSeriesLike = topology === "series";
  const isCompoundLike =
    topology === "compound" || topology === "cumulative" || topology === "differential";
  const isSeparate = topology === "separate";

  const shuntIntensity = Math.min(1.2, If * 0.55);
  const seriesIntensity = Math.min(1.2, (Ise ?? Ia) * 0.45);

  const poleBlue = "#3498db";
  const poleOrange = "#e67e22";
  const poleRed = "#e74c3c";

  const leftPoleColor = isSeriesLike ? poleOrange : poleBlue;
  const rightPoleColor =
    topology === "differential" ? poleRed : isSeriesLike ? poleOrange : poleBlue;

  const leftEmissive = isSeriesLike ? poleOrange : poleBlue;
  const rightEmissive =
    topology === "differential" ? poleRed : isSeriesLike ? poleOrange : poleBlue;

  const leftEmissiveIntensity = isSeriesLike ? seriesIntensity : isCompoundLike ? shuntIntensity * 0.85 : shuntIntensity;
  const rightEmissiveIntensity = isSeriesLike
    ? seriesIntensity
    : topology === "differential"
      ? shuntIntensity * 0.4
      : isCompoundLike
        ? shuntIntensity * 0.85
        : shuntIntensity;

  return (
    <group position={[0, -0.5, 0]}>
      {isSeparate && <ExternalFieldSupply />}

      <mesh rotation={[0, 0, 0]}>
        <tubeGeometry args={[new THREE.EllipseCurve(0, 0, 2.5, 2.5), 64, 0.4, 16]} />
        <meshStandardMaterial color="#2c3e50" metalness={0.6} roughness={0.4} />
      </mesh>

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
              color={leftPoleColor}
              emissive={leftEmissive}
              emissiveIntensity={leftEmissiveIntensity}
            />
          </mesh>
        ))}
        {isCompoundLike && !isSeriesLike && (
          <mesh position={[0.15, 0, 0.85]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.12, 0.12, 0.55, 12]} />
            <meshStandardMaterial
              color={poleOrange}
              emissive={poleOrange}
              emissiveIntensity={seriesIntensity}
            />
          </mesh>
        )}
        <Billboard position={[1, 0, 0]}>
          <Text fontSize={0.4} color={topology === "differential" ? poleRed : poleBlue} fontWeight="bold">
            {topology === "differential" ? "N′" : "N"}
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
              color={rightPoleColor}
              emissive={rightEmissive}
              emissiveIntensity={rightEmissiveIntensity}
            />
          </mesh>
        ))}
        {isCompoundLike && !isSeriesLike && (
          <mesh position={[-0.15, 0, 0.85]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.12, 0.12, 0.55, 12]} />
            <meshStandardMaterial
              color={poleOrange}
              emissive={poleOrange}
              emissiveIntensity={seriesIntensity}
            />
          </mesh>
        )}
        <Billboard position={[-1, 0, 0]}>
          <Text fontSize={0.4} color={poleBlue} fontWeight="bold">
            S
          </Text>
        </Billboard>
      </group>

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

      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 1.2]}>
        <cylinderGeometry args={[0.5, 0.5, 0.8, 16]} />
        <meshStandardMaterial color="#f1c40f" metalness={0.9} />
      </mesh>
    </group>
  );
}

export default function ShuntGenerator3DModel({
  speed,
  Ia,
  If,
  Ise = 0,
  topology = "shunt",
}) {
  const label = TOPOLOGY_LABEL[topology] || TOPOLOGY_LABEL.shunt;

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
          fontSize: "11px",
          maxWidth: "92%",
          lineHeight: 1.35,
        }}
      >
        {label}
      </div>
      <Canvas camera={{ position: [0, -3, 6], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1.2} />
        <GeneratorBody speed={speed} Ia={Ia} If={If} Ise={Ise} topology={topology} />
        <OrbitControls enableZoom={false} />
      </Canvas>
    </div>
  );
}
