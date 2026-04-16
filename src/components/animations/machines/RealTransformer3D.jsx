import { animated, useSpring } from "@react-spring/three";
import { OrbitControls, PerspectiveCamera, Text } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";

// framer-motion-3d spring stiffness ~50 근사
const layoutSpring = { tension: 50, friction: 18, mass: 1 };

// 1. 나선형 코일 경로 생성을 위한 커스텀 곡선 클래스
class HelixCurve extends THREE.Curve {
  constructor(radius, height, turns) {
    super();
    this.radius = radius;
    this.height = height;
    this.turns = turns;
  }
  getPoint(t) {
    const angle = t * Math.PI * 2 * this.turns;
    const x = Math.cos(angle) * this.radius;
    const y = (t - 0.5) * this.height;
    const z = Math.sin(angle) * this.radius;
    return new THREE.Vector3(x, y, z);
  }
}

// 2. 전류 입자 애니메이션 컴포넌트
function CurrentParticles({ curve, color, speed = 0.2, count = 5 }) {
  const groupRef = useRef(null);
  const progressRef = useRef(null);
  if (!progressRef.current || progressRef.current.length !== count) {
    progressRef.current = Array.from({ length: count }, () => Math.random());
  }

  useFrame((_, delta) => {
    const g = groupRef.current;
    const prog = progressRef.current;
    if (!g || !prog) return;
    g.children.forEach((child, i) => {
      if (i >= prog.length) return;
      prog[i] = (prog[i] + delta * speed) % 1;
      const pos = curve.getPoint(prog[i]);
      child.position.set(pos.x, pos.y, pos.z);
    });
  });

  return (
    <group ref={groupRef}>
      {Array.from({ length: count }, (_, i) => (
        <mesh key={i}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshBasicMaterial color={color} />
        </mesh>
      ))}
    </group>
  );
}

// 3. 개별 코일 유닛 (철심 + 나선형 도선 + 전류) — 변환은 부모 group이 담당
function CoilUnit({ color = "#b45309", label }) {
  const helixRadius = 0.25;
  const helixHeight = 1.2;
  const turns = 8;

  const curve = useMemo(
    () => new HelixCurve(helixRadius, helixHeight, turns),
    [],
  );

  return (
    <group>
      <mesh>
        <cylinderGeometry args={[0.18, 0.18, 1.4, 32]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.2} />
      </mesh>

      <mesh>
        <tubeGeometry args={[curve, 100, 0.02, 8, false]} />
        <meshStandardMaterial color={color} metalness={0.9} roughness={0.1} />
      </mesh>

      <CurrentParticles curve={curve} color="#fbbf24" />

      <Text position={[0, 0.9, 0]} fontSize={0.15} color="#1e293b">
        {label}
      </Text>
    </group>
  );
}

function AnimatedCoilSlot({ item, color }) {
  const { position, rotation } = useSpring({
    position: item.pos,
    rotation: item.rot,
    config: layoutSpring,
  });

  return (
    <animated.group position={position} rotation={rotation}>
      <CoilUnit color={color} label={item.label} />
    </animated.group>
  );
}

// 4. 결선 방식별 레이아웃 정의
const LAYOUTS = {
  Y: [
    { pos: [0, 0, 0.7], rot: [0, 0, 0], label: "A상" },
    { pos: [-0.6, 0, -0.35], rot: [0, (Math.PI * 2) / 3, 0], label: "B상" },
    { pos: [0.6, 0, -0.35], rot: [0, -(Math.PI * 2) / 3, 0], label: "C상" },
  ],
  Delta: [
    { pos: [-0.5, 0, 0.3], rot: [0, 0, 0], label: "A상" },
    { pos: [0.5, 0, 0.3], rot: [0, 0, 0], label: "B상" },
    { pos: [0, 0, -0.5], rot: [0, 0, 0], label: "C상" },
  ],
};

function TransformerScene({ type, color, sideLabel, offset }) {
  const config = type === "Y" ? LAYOUTS.Y : LAYOUTS.Delta;

  return (
    <group position={[offset, 0, 0]}>
      <Text
        position={[0, 2.2, 0]}
        fontSize={0.3}
        color="#0f172a"
        fontWeight="bold"
      >
        {sideLabel} ({type})
      </Text>

      {config.map((item, idx) => (
        <AnimatedCoilSlot
          key={`${type}-${item.label}-${idx}`}
          item={item}
          color={color}
        />
      ))}

      <mesh position={[0, -0.8, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.2, 32]} />
        <meshStandardMaterial color="#e2e8f0" transparent opacity={0.5} />
      </mesh>
    </group>
  );
}

// 5. 메인 컴포넌트
export default function RealTransformer3D() {
  const [mode, setMode] = useState("Y-D");

  const pType = mode.split("-")[0] === "Y" ? "Y" : "Delta";
  const sType = mode.split("-")[1] === "Y" ? "Y" : "Delta";

  return (
    <div className="w-full flex flex-col items-center bg-white p-4 rounded-xl shadow-2xl">
      <div className="w-full h-[500px] bg-slate-50 rounded-lg overflow-hidden border border-slate-200">
        <Canvas shadows>
          <PerspectiveCamera makeDefault position={[0, 3, 7]} />
          <OrbitControls makeDefault />

          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <spotLight
            position={[-10, 10, 10]}
            angle={0.15}
            penumbra={1}
            castShadow
          />

          <TransformerScene
            type={pType}
            color="#2563eb"
            sideLabel="1차측 (Primary)"
            offset={-2.5}
          />
          <TransformerScene
            type={sType}
            color="#0d9488"
            sideLabel="2차측 (Secondary)"
            offset={2.5}
          />

          <Text position={[0, 0, 0]} fontSize={0.5} color="#94a3b8">
            자기 결합
          </Text>
        </Canvas>
      </div>

      <div className="mt-6 flex gap-4">
        {["Y-Y", "D-D", "Y-D"].map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`px-6 py-2 rounded-full font-bold transition-all ${
              mode === m
                ? "bg-blue-600 text-white"
                : "bg-slate-200 text-slate-700 hover:bg-slate-300"
            }`}
          >
            {m} 결선
          </button>
        ))}
      </div>

      <p className="mt-4 text-slate-500 text-sm italic">
        * 노란 입자는 전류의 흐름을 나타내며, 각 상(Phase)별로 나선형 코일을
        따라 흐릅니다.
      </p>
    </div>
  );
}
