import { Environment, OrbitControls, Text } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useMemo, useRef, useState } from "react";
import * as THREE from "three";

const COL = {
  N: "#dc2626",
  S: "#2563eb",
  B: "#f472b6",
  V: "#f59e0b",
  I: "#22c55e",
  rod: "#94a3b8",
};

function Arrow3D({ origin = [0, 0, 0], dir = [0, 1, 0], length = 1, color = "#fff", label }) {
  const groupRef = useRef(null);
  const matRef = useRef(null);

  useFrame(() => {
    const g = groupRef.current;
    if (!g) return;
    const d = new THREE.Vector3(...dir);
    const len = d.length();
    if (len < 1e-6) {
      g.visible = false;
      return;
    }
    g.visible = true;
    const n = d.normalize();
    g.position.set(...origin);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), n);
    g.quaternion.copy(q);
    g.scale.set(1, length * len, 1);
    if (matRef.current) matRef.current.emissiveIntensity = 0.8 + Math.min(1.2, len) * 0.8;
  });

  return (
    <group ref={groupRef}>
      <mesh position={[0, 0.32, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.64, 12]} />
        <meshStandardMaterial
          ref={matRef}
          color={color}
          emissive={color}
          emissiveIntensity={1}
          metalness={0.25}
          roughness={0.45}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0, 0.7, 0]}>
        <coneGeometry args={[0.06, 0.2, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1} toneMapped={false} />
      </mesh>
      <Text position={[0.1, 0.88, 0]} fontSize={0.1} color={color} anchorX="left">
        {label}
      </Text>
    </group>
  );
}

function RightHandScene({ vMag, vDir, bDir }) {
  const pulseRef = useRef(null);
  const phaseRef = useRef(0);

  const vecB = useMemo(() => new THREE.Vector3(bDir, 0, 0), [bDir]);
  const vecV = useMemo(() => new THREE.Vector3(0, 0, vDir * vMag), [vDir, vMag]);
  const vecI = useMemo(() => new THREE.Vector3().crossVectors(vecV, vecB), [vecV, vecB]);
  const iNorm = vecI.length() > 1e-6 ? vecI.clone().normalize().multiplyScalar(Math.min(1, vMag)) : new THREE.Vector3();

  useFrame((_, delta) => {
    const pulse = pulseRef.current;
    if (!pulse) return;
    if (iNorm.length() < 1e-6) {
      pulse.visible = false;
      return;
    }
    pulse.visible = true;
    phaseRef.current = (phaseRef.current + delta * (0.8 + vMag * 1.6)) % 1;
    const y = -0.7 + phaseRef.current * 1.4;
    const dirSign = Math.sign(iNorm.y) || 1;
    pulse.position.set(0, y * dirSign, 0);
    pulse.scale.setScalar(0.08 + vMag * 0.08);
    pulse.material.emissiveIntensity = 1 + vMag * 1.2;
  });

  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 6, 4]} intensity={1.1} castShadow />
      <directionalLight position={[-3, 2, -2]} intensity={0.25} />
      <Environment preset="city" />

      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.05, 0]}>
        <planeGeometry args={[5, 3.4]} />
        <meshStandardMaterial color="#0f172a" metalness={0.08} roughness={0.92} />
      </mesh>

      <mesh castShadow position={[-1.3, 0, 0]}>
        <boxGeometry args={[0.42, 1.55, 0.72]} />
        <meshStandardMaterial color={COL.N} metalness={0.25} roughness={0.4} />
      </mesh>
      <Text position={[-1.52, 0.78, 0.42]} fontSize={0.15} color="#fecaca" anchorX="center">
        N
      </Text>
      <mesh castShadow position={[1.3, 0, 0]}>
        <boxGeometry args={[0.42, 1.55, 0.72]} />
        <meshStandardMaterial color={COL.S} metalness={0.25} roughness={0.4} />
      </mesh>
      <Text position={[1.52, 0.78, 0.42]} fontSize={0.15} color="#bfdbfe" anchorX="center">
        S
      </Text>

      {[0.25, 0, -0.25].map((y) => (
        <mesh key={y} position={[0, y, 0]}>
          <boxGeometry args={[2.2, 0.015, 0.03]} />
          <meshStandardMaterial color={COL.B} emissive={COL.B} emissiveIntensity={0.7} toneMapped={false} />
        </mesh>
      ))}

      <mesh castShadow position={[0, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 1.6, 20]} />
        <meshStandardMaterial color={COL.rod} metalness={0.65} roughness={0.32} />
      </mesh>
      <Text position={[0.17, 0.95, 0]} fontSize={0.08} color="#e2e8f0" anchorX="left">
        도체
      </Text>

      <mesh ref={pulseRef}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshStandardMaterial color={COL.I} emissive={COL.I} emissiveIntensity={1.1} toneMapped={false} />
      </mesh>

      <Arrow3D origin={[-0.05, 0.8, 0.62]} dir={[bDir, 0, 0]} length={0.95} color={COL.B} label="B" />
      <Arrow3D origin={[0, -0.75, 0]} dir={[0, 0, vDir * vMag]} length={0.9} color={COL.V} label="v" />
      <Arrow3D origin={[0.45, 0, 0]} dir={[0, iNorm.y, 0]} length={0.95} color={COL.I} label="I" />

      <OrbitControls enablePan={false} minDistance={2.5} maxDistance={6} target={[0, 0, 0]} />
    </>
  );
}

export default function FlemingRightHandWidget() {
  const [vMag, setVMag] = useState(0.8);
  const [vDir, setVDir] = useState(1);
  const [bDir, setBDir] = useState(1);
  const iDir = vMag < 0.01 ? 0 : vDir * bDir;

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-slate-800 bg-[#020617] p-5 font-sans shadow-2xl md:p-8">
      <div className="relative z-10 mb-6 border-b border-slate-800 pb-4">
        <h3 className="text-2xl font-black tracking-tight text-white">
          플레밍{" "}
          <span className="bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">
            오른손 법칙
          </span>{" "}
          3D
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">
          검지 = 자기장 <strong className="text-pink-300">B</strong>, 엄지 = 도체 운동{" "}
          <strong className="text-amber-300">v</strong>, 중지 = 유도전류{" "}
          <strong className="text-emerald-300">I</strong>. 여기서는{" "}
          <code className="rounded bg-slate-800 px-1 py-0.5">I ∝ v × B</code> 로 계산합니다.
        </p>
      </div>

      <div className="relative z-10 mb-4 flex flex-wrap items-end gap-4 rounded-xl border border-slate-700 bg-slate-900/60 p-4 backdrop-blur-md">
        <div className="min-w-[220px] flex-1">
          <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-300">
            도체 속도 크기 |v|
          </label>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={vMag}
            onChange={(e) => setVMag(parseFloat(e.target.value))}
            className="w-full accent-amber-500"
          />
        </div>
        <button
          type="button"
          onClick={() => setVDir((d) => -d)}
          className="rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-bold text-slate-200"
        >
          운동 방향 v: {vDir > 0 ? "+Z" : "-Z"}
        </button>
        <button
          type="button"
          onClick={() => setBDir((d) => -d)}
          className="rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-bold text-slate-200"
        >
          자기장 B: {bDir > 0 ? "N→S(+X)" : "S→N(-X)"}
        </button>
      </div>

      <div className="mb-4 text-xs text-slate-400">
        현재 유도전류 방향 I:{" "}
        <span className="font-mono text-emerald-300">
          {iDir === 0 ? "0" : iDir > 0 ? "+Y (위)" : "-Y (아래)"}
        </span>
      </div>

      <div className="relative z-10 h-[min(52vh,430px)] min-h-[280px] w-full overflow-hidden rounded-2xl border border-slate-800 bg-[#0b1120] shadow-inner md:min-h-[360px]">
        <Canvas
          shadows
          frameloop="always"
          camera={{ position: [0.5, 1.25, 3.3], fov: 42 }}
          gl={{ antialias: true, alpha: false }}
          className="h-full w-full touch-none"
        >
          <Suspense fallback={null}>
            <RightHandScene vMag={vMag} vDir={vDir} bDir={bDir} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}

