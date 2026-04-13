import { Environment, Line as DreiLine, OrbitControls, Text } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useRef, useState } from "react";
import * as THREE from "three";

/**
 * N·S 극 사이 간극에 사각 철심 + 권선.
 * 전류(직류 크기·부호 또는 교류)에 따라 철심이 자기장 방향으로 밀리듯 평행 이동하는 3D 시각화.
 * DB lecture_id 예: iron_core_magnetic_gap
 */

const GAP_HALF = 0.52;
const POLE_FACE_X = GAP_HALF + 0.08;
const CORE_W = 0.22;
const CORE_H = 0.38;
const CORE_D = 0.28;

function PoleBlock({ side, label, color }) {
  const x = side * POLE_FACE_X;
  return (
    <group position={[x, 0, 0]}>
      <mesh castShadow receiveShadow position={[side * -0.14, 0, 0]}>
        <boxGeometry args={[0.36, 0.95, 0.55]} />
        <meshStandardMaterial color={color} metalness={0.35} roughness={0.42} />
      </mesh>
      <mesh castShadow position={[side * -0.32, 0, 0]}>
        <boxGeometry args={[0.12, 0.55, 0.38]} />
        <meshStandardMaterial color="#475569" metalness={0.45} roughness={0.5} />
      </mesh>
      <Text
        position={[side * 0.42, 0.48, 0.28]}
        fontSize={0.09}
        color={side < 0 ? "#fecaca" : "#bfdbfe"}
        anchorX="center"
      >
        {label}
      </Text>
    </group>
  );
}

/** 철심 주변 권선 + 발광(전류) */
function CoreWithCoil({ currentRef, acPhaseRef, isAc }) {
  const groupRef = useRef(null);
  const wraps = 5;
  const matRefs = useRef([]);

  useFrame((_, delta) => {
    const g = groupRef.current;
    if (!g) return;
    let eff = currentRef.current;
    if (isAc) {
      eff = currentRef.current * Math.sin(acPhaseRef.current);
      acPhaseRef.current += delta * 4.2;
    }
    const clamped = THREE.MathUtils.clamp(eff, -1, 1);
    const travel = 0.34;
    g.position.x = travel * clamped;

    const glow = 0.15 + Math.abs(eff) * (isAc ? 0.85 + 0.35 * Math.sin(acPhaseRef.current * 2) : 1.1);
    matRefs.current.forEach((m) => {
      if (m) m.emissiveIntensity = glow;
    });
  });

  return (
    <group ref={groupRef}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[CORE_W, CORE_H, CORE_D]} />
        <meshStandardMaterial
          color="#78716c"
          metalness={0.65}
          roughness={0.35}
          envMapIntensity={0.9}
        />
      </mesh>
      {Array.from({ length: wraps }, (_, i) => {
        const y = -CORE_H * 0.38 + (i / (wraps - 1)) * CORE_H * 0.76;
        return (
          <mesh key={i} rotation={[Math.PI / 2, 0, 0]} position={[0, y, 0]}>
            <torusGeometry args={[CORE_D * 0.55, 0.028, 10, 24]} />
            <meshStandardMaterial
              ref={(el) => {
                matRefs.current[i] = el;
              }}
              color="#b45309"
              emissive="#f59e0b"
              emissiveIntensity={0.2}
              metalness={0.25}
              roughness={0.55}
            />
          </mesh>
        );
      })}
    </group>
  );
}

function FieldLines() {
  const curves = [-0.12, 0, 0.12];
  const nX = -GAP_HALF;
  const sX = GAP_HALF;
  return (
    <group>
      {curves.map((z, i) => (
        <DreiLine
          key={i}
          points={[
            new THREE.Vector3(nX + 0.06, 0, z),
            new THREE.Vector3(0, 0.08 + i * 0.02, z),
            new THREE.Vector3(sX - 0.06, 0, z),
          ]}
          color="#60a5fa"
          lineWidth={1.2}
          transparent
          opacity={0.35}
        />
      ))}
    </group>
  );
}

function SceneContent({ currentRef, acPhaseRef, isAc }) {
  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 6, 3]} intensity={1.15} castShadow />
      <directionalLight position={[-3, 2, -2]} intensity={0.25} />
      <Environment preset="city" />

      <PoleBlock side={-1} label="N극" color="#b91c1c" />
      <PoleBlock side={1} label="S극" color="#1d4ed8" />

      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.62, 0]}>
        <planeGeometry args={[4, 3]} />
        <meshStandardMaterial color="#0f172a" metalness={0.1} roughness={0.92} />
      </mesh>

      <FieldLines />
      <CoreWithCoil currentRef={currentRef} acPhaseRef={acPhaseRef} isAc={isAc} />

      <OrbitControls
        enablePan={false}
        minPolarAngle={0.35}
        maxPolarAngle={Math.PI / 2 + 0.2}
        minDistance={2.2}
        maxDistance={5.5}
        target={[0, 0.05, 0]}
      />
    </>
  );
}

export default function IronCoreMagneticGapWidget() {
  const [currentSlider, setCurrentSlider] = useState(0);
  const [isAc, setIsAc] = useState(false);
  const currentRef = useRef(0);
  const acPhaseRef = useRef(0);

  currentRef.current = currentSlider;

  const pct = Math.round(currentSlider * 100);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-slate-800 bg-[#020617] p-5 font-sans shadow-2xl md:p-8">
      <div className="pointer-events-none absolute left-1/4 top-0 h-80 w-80 rounded-full bg-red-900/15 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-blue-900/15 blur-[100px]" />

      <div className="relative z-10 mb-6 border-b border-slate-800 pb-4">
        <h3 className="text-2xl font-black tracking-tight text-white">
          자기 간극 속{" "}
          <span className="bg-gradient-to-r from-amber-300 to-slate-200 bg-clip-text text-transparent">
            사각 철심
          </span>
        </h3>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-400">
          N극과 S극 사이 공간에 네모 철심과 권선을 두었습니다. 전류가 흐르면 철심이 자기 회로 방향으로
          미끄러지듯 움직이는 모습을 단순화해 보여 줍니다(교류 모드에서는 크기와 위치가 함께 진동).
        </p>
      </div>

      <div className="relative z-10 mb-4 flex flex-wrap items-end gap-4 rounded-xl border border-slate-700 bg-slate-900/60 p-4 backdrop-blur-md">
        <div className="min-w-[220px] flex-1">
          <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-300">
            권선 전류 (정격 대비, −1 ~ +1)
          </label>
          <input
            type="range"
            min={-1}
            max={1}
            step={0.02}
            value={currentSlider}
            onChange={(e) => setCurrentSlider(parseFloat(e.target.value))}
            className="w-full accent-amber-500"
          />
          <div className="mt-1 text-xs text-slate-500">
            현재: <span className="font-mono text-amber-400">{pct > 0 ? "+" : ""}{pct}%</span>
            {" · "}
            부호에 따라 철심이 N쪽 또는 S쪽으로 이동
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsAc((v) => !v)}
          className={`rounded-lg px-4 py-2 text-sm font-bold transition-all ${
            isAc
              ? "border border-amber-500/50 bg-amber-500/15 text-amber-300"
              : "border border-slate-600 bg-slate-800 text-slate-400 hover:text-slate-200"
          }`}
        >
          교류 모드 {isAc ? "ON" : "OFF"}
        </button>
      </div>

      <div className="relative z-10 h-[min(50vh,400px)] min-h-[260px] w-full overflow-hidden rounded-2xl border border-slate-800 bg-[#0b1120] shadow-inner md:min-h-[340px]">
        <Canvas
          shadows
          frameloop="always"
          camera={{ position: [0, 1.35, 2.85], fov: 45 }}
          gl={{ antialias: true, alpha: false }}
          className="h-full w-full touch-none"
        >
          <Suspense fallback={null}>
            <SceneContent currentRef={currentRef} acPhaseRef={acPhaseRef} isAc={isAc} />
          </Suspense>
        </Canvas>
        <p className="pointer-events-none absolute bottom-2 left-1/2 z-10 max-w-[92%] -translate-x-1/2 rounded-full bg-black/45 px-3 py-1 text-center text-[10px] text-slate-400 backdrop-blur-sm">
          드래그로 회전 · 스크롤로 확대 · 청색 점선은 자기장(개략)
        </p>
      </div>
    </div>
  );
}
