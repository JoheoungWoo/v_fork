import { Center, OrbitControls, Text } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { motion } from "framer-motion-3d";
import { useState } from "react";

// --- 3D 코일 배치 데이터 ---
const COIL_GEOMETRY = [0.15, 0.15, 1.4, 32];

// V결선 전환 시 3번째 코일이 자연스럽게 사라지도록 scale 속성 추가
const CONFIGS = {
  Y: [
    { pos: [0, 0.8, 0], rot: [0, 0, 0], scale: 1 },
    { pos: [-0.69, -0.4, 0], rot: [0, 0, (Math.PI * 2) / 3], scale: 1 },
    { pos: [0.69, -0.4, 0], rot: [0, 0, -(Math.PI * 2) / 3], scale: 1 },
  ],
  D: [
    { pos: [-0.6, 0.35, 0], rot: [0, 0, -Math.PI / 6], scale: 1 },
    { pos: [0.6, 0.35, 0], rot: [0, 0, Math.PI / 6], scale: 1 },
    { pos: [0, -0.7, 0], rot: [0, 0, Math.PI / 2], scale: 1 },
  ],
  V: [
    { pos: [-0.6, 0.35, 0], rot: [0, 0, -Math.PI / 6], scale: 1 },
    { pos: [0.6, 0.35, 0], rot: [0, 0, Math.PI / 6], scale: 1 },
    // V결선 시 3번째 코일은 하단으로 이동하며 크기가 0이 되어 사라짐
    { pos: [0, -0.7, 0], rot: [0, 0, Math.PI / 2], scale: 0 },
  ],
};

const MODES = [
  {
    id: "yy",
    label: "Y–Y 결선",
    p_type: "Y",
    s_type: "Y",
    desc: "1차, 2차 모두 Y결선입니다. 중성점을 접지할 수 있어 4선식 공급에 유리하며, 고전압에 적합합니다.",
  },
  {
    id: "dd",
    label: "Δ–Δ 결선",
    p_type: "D",
    s_type: "D",
    desc: "1차, 2차 모두 델타(Δ) 결선입니다. 제3고조파 전류가 결선 내부를 순환하여 외부로 나가지 않는 장점이 있습니다.",
  },
  {
    id: "yd",
    label: "Y–Δ 결선",
    p_type: "Y",
    s_type: "D",
    desc: "강압용으로 주로 쓰이며, 1차측(Y) 중성점 접지가 가능하고 2차측(Δ)은 고조파 장해를 방지합니다. 30도의 위상차가 발생합니다.",
  },
  {
    id: "v",
    label: "V 결선",
    p_type: "V",
    s_type: "V",
    desc: "단상 변압기 2대만으로 3상 전력을 공급하는 방식입니다. Δ결선 중 1대가 고장 났을 때 임시로 사용하며, 출력비는 약 57.7%입니다.",
  },
];

// 스프링 애니메이션 설정
const springTransition = {
  type: "spring",
  stiffness: 60,
  damping: 12,
  mass: 1,
};

function WindingGroup({ type, color, position, label }) {
  const coils = CONFIGS[type];

  return (
    <group position={position}>
      <Text
        position={[0, 2, 0]}
        fontSize={0.3}
        color="#334155"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>

      {/* Y결선의 중심 중성점 애니메이션 */}
      <motion.mesh
        position={[0, 0, 0]}
        animate={{ scale: type === "Y" ? 1 : 0 }}
        transition={springTransition}
      >
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color={color} />
      </motion.mesh>

      {/* 코일 애니메이션 적용 */}
      {coils.map((coil, idx) => (
        <motion.mesh
          key={idx}
          animate={{
            position: coil.pos,
            rotation: coil.rot,
            scale: coil.scale,
          }}
          transition={springTransition}
        >
          <cylinderGeometry args={COIL_GEOMETRY} />
          <meshStandardMaterial color={color} metalness={0.6} roughness={0.4} />

          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.16, 0.16, 1.3, 16, 10, true]} />
            <meshStandardMaterial color="#f59e0b" wireframe />
          </mesh>
        </motion.mesh>
      ))}
    </group>
  );
}

export default function AnimatedTransformer3D() {
  const [activeModeId, setActiveModeId] = useState("yy");
  const activeMode = MODES.find((m) => m.id === activeModeId);

  return (
    <div className="w-full max-w-4xl rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden shadow-lg font-sans">
      <div className="h-[400px] w-full bg-gradient-to-b from-slate-100 to-slate-200 cursor-grab active:cursor-grabbing relative">
        <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
          <pointLight position={[-5, -5, 5]} intensity={0.5} />

          <WindingGroup
            type={activeMode.p_type}
            color="#2563eb"
            position={[-2, -0.5, 0]}
            label="1차측 (고압, Primary)"
          />

          <Center position={[0, -0.5, 0]}>
            <Text fontSize={0.4} color="#94a3b8">
              ↔
            </Text>
          </Center>

          <WindingGroup
            type={activeMode.s_type}
            color="#0d9488"
            position={[2, -0.5, 0]}
            label="2차측 (저압, Secondary)"
          />

          <OrbitControls enablePan={false} minDistance={4} maxDistance={10} />
        </Canvas>

        <div className="absolute top-4 left-4 rounded bg-black/50 px-3 py-1 text-xs text-white backdrop-blur-sm">
          💡 마우스로 드래그하여 회전할 수 있습니다.
        </div>
      </div>

      <div className="p-6 bg-white">
        <div className="flex flex-wrap gap-2 mb-4 justify-center">
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => setActiveModeId(m.id)}
              className={`px-5 py-2.5 rounded-lg font-bold text-sm transition-all duration-200 ${
                activeModeId === m.id
                  ? "bg-blue-600 text-white shadow-md transform scale-105"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 mt-2">
          <h3 className="text-lg font-bold text-blue-900 mb-2">
            현재 모드: {activeMode.label}
          </h3>
          <p className="text-blue-800 leading-relaxed text-sm">
            {activeMode.desc}
          </p>
        </div>
      </div>
    </div>
  );
}
