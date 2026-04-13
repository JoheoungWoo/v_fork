import { Environment, OrbitControls, Text } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import "katex/dist/katex.min.css";
import {
  forwardRef,
  Suspense,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { BlockMath, InlineMath } from "react-katex";
import * as THREE from "three";

/**
 * 전기기기 - Y-Y 결선 3D 네온 시뮬레이터 (@react-three/fiber)
 * DB lecture_id: 'transformer_connection_types'
 */

const COL = {
  U: "#ec4899",
  V: "#06b6d4",
  W: "#eab308",
  N: "#f8fafc",
};

const R = 0.82;
const TIP_U = new THREE.Vector3(0, R, 0);
const TIP_V = new THREE.Vector3((-R * Math.sqrt(3)) / 2, -R * 0.5, 0);
const TIP_W = new THREE.Vector3((R * Math.sqrt(3)) / 2, -R * 0.5, 0);

const Y_UP = new THREE.Vector3(0, 1, 0);

const NeonCylinder = forwardRef(function NeonCylinder({ from, to, color }, ref) {
  const groupRef = useRef(null);

  useLayoutEffect(() => {
    const g = groupRef.current;
    if (!g) return;
    const f = from.clone();
    const t = to.clone();
    const d = new THREE.Vector3().subVectors(t, f);
    const len = d.length();
    if (len < 1e-6) return;
    const dir = d.clone().normalize();
    g.position.copy(f).lerp(t, 0.5);
    g.quaternion.setFromUnitVectors(Y_UP, dir);
    g.scale.set(1, len, 1);
  }, [from, to]);

  return (
    <group ref={groupRef}>
      <mesh ref={ref}>
        <cylinderGeometry args={[0.055, 0.055, 1, 20]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.45}
          metalness={0.12}
          roughness={0.32}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
});

function YStar3D({ cx, suffix, refs }) {
  const c = new THREE.Vector3(cx, 0, 0);
  const tips = [TIP_U, TIP_V, TIP_W];
  const cols = [COL.U, COL.V, COL.W];
  const ids = ["U", "V", "W"];

  return (
    <group>
      {tips.map((tip, i) => (
        <NeonCylinder
          key={ids[i]}
          ref={refs[i]}
          from={c}
          to={c.clone().add(tip)}
          color={cols[i]}
        />
      ))}
      {tips.map((tip, i) => {
        const p = c.clone().add(tip);
        const ox = tip.x > 0.2 ? 0.2 : tip.x < -0.2 ? -0.2 : 0;
        const oy = tip.y > 0 ? 0.17 : -0.15;
        return (
          <Text
            key={`txt-${ids[i]}`}
            position={[p.x + ox, p.y + oy, p.z]}
            fontSize={0.15}
            color={cols[i]}
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.015}
            outlineColor="#0f172a"
          >
            {`${ids[i]}${suffix}`}
          </Text>
        );
      })}
      <mesh position={[cx, 0, 0]}>
        <sphereGeometry args={[0.09, 20, 20]} />
        <meshStandardMaterial color="#94a3b8" emissive="#475569" emissiveIntensity={0.3} roughness={0.45} />
      </mesh>
    </group>
  );
}

function YYScene3D({ timeRef, flagsRef, showNeutral }) {
  const pU = useRef(null);
  const pV = useRef(null);
  const pW = useRef(null);
  const sU = useRef(null);
  const sV = useRef(null);
  const sW = useRef(null);
  const nMesh = useRef(null);

  useFrame(() => {
    const t = timeRef.current;
    const { isUnbalanced, showNeutral } = flagsRef.current;
    const ampU = isUnbalanced ? 1.8 : 1;
    const iU = ampU * Math.sin(t);
    const iV = Math.sin(t - (2 * Math.PI) / 3);
    const iW = Math.sin(t - (4 * Math.PI) / 3);
    const iN = iU + iV + iW;

    const glow = (obj, i) => {
      const m = obj?.material;
      if (m) m.emissiveIntensity = 0.12 + Math.abs(i) * 0.95;
    };

    glow(pU.current, iU);
    glow(pV.current, iV);
    glow(pW.current, iW);
    glow(sU.current, iU);
    glow(sV.current, iV);
    glow(sW.current, iW);

    const nm = nMesh.current?.material;
    if (nm) {
      if (showNeutral) nm.emissiveIntensity = 0.08 + Math.abs(iN) * 1.1;
      else nm.emissiveIntensity = 0.05;
    }
  });

  const fromN = new THREE.Vector3(-1.38, 0, 0);
  const toN = new THREE.Vector3(1.38, 0, 0);

  return (
    <>
      <color attach="background" args={["#030712"]} />
      <ambientLight intensity={0.28} />
      <directionalLight position={[4, 6, 3]} intensity={0.4} color="#93c5fd" />
      <pointLight position={[0, 2.2, 2]} intensity={0.18} color="#a78bfa" />

      <Suspense fallback={null}>
        <Environment preset="city" />
      </Suspense>

      <group position={[0, 0.06, 0]}>
        <YStar3D cx={-1.38} suffix="1" refs={[pU, pV, pW]} />
        <YStar3D cx={1.38} suffix="2" refs={[sU, sV, sW]} />
        {showNeutral && <NeonCylinder ref={nMesh} from={fromN} to={toN} color={COL.N} />}
      </group>

      <OrbitControls makeDefault enablePan minDistance={2.8} maxDistance={9} target={[0, 0, 0]} />
      <CameraSetup />
    </>
  );
}

function CameraSetup() {
  const { camera } = useThree();
  useLayoutEffect(() => {
    camera.position.set(0, 2.35, 5.2);
    camera.lookAt(0, 0, 0);
  }, [camera]);
  return null;
}

export default function NeonYYTransformerWidget() {
  const [frequency, setFrequency] = useState(1);
  const [showNeutral, setShowNeutral] = useState(true);
  const [isUnbalanced, setIsUnbalanced] = useState(false);
  const [time, setTime] = useState(0);
  const timeRef = useRef(0);
  const flagsRef = useRef({ showNeutral, isUnbalanced });

  useLayoutEffect(() => {
    flagsRef.current = { showNeutral, isUnbalanced };
  }, [showNeutral, isUnbalanced]);

  useEffect(() => {
    let id;
    let n = 0;
    const loop = () => {
      id = requestAnimationFrame(loop);
      timeRef.current += frequency * 0.03;
      n++;
      if (n % 2 === 0) setTime(timeRef.current);
    };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, [frequency]);

  const phaseU = time;
  const phaseV = time - (2 * Math.PI) / 3;
  const phaseW = time - (4 * Math.PI) / 3;
  const ampU = isUnbalanced ? 1.8 : 1.0;
  const ampV = 1.0;
  const ampW = 1.0;
  const iU = ampU * Math.sin(phaseU);
  const iV = ampV * Math.sin(phaseV);
  const iW = ampW * Math.sin(phaseW);
  const iN = iU + iV + iW;

  const colors = COL;

  const generateWavePath = (phaseOffset, amplitude) => {
    let d = "";
    const steps = 100;
    const width = 600;
    const centerY = 50;
    for (let i = 0; i <= steps; i++) {
      const x = (i / steps) * width;
      const waveX = (i / steps) * 4 * Math.PI;
      const y = centerY - amplitude * Math.sin(waveX - time + phaseOffset) * 25;
      if (i === 0) d += `M ${x} ${y} `;
      else d += `L ${x} ${y} `;
    }
    return d;
  };

  const neonFilterDef = (id) => (
    <filter id={id} x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  );

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-slate-800 bg-[#020617] p-5 font-sans shadow-2xl md:p-8">
      <div className="pointer-events-none absolute left-1/4 top-0 h-96 w-96 rounded-full bg-blue-600/10 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-purple-600/10 blur-[120px]" />

      <div className="relative z-10 mb-6 border-b border-slate-800 pb-4">
        <h3 className="text-2xl font-black tracking-tight text-white drop-shadow-md">
          Y-Y 결선{" "}
          <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            3D 네온 시뮬레이터
          </span>
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">
          120° 위상차 3상(
          <InlineMath math="U, V, W" />
          )·중성선(
          <InlineMath math="N" />
          )를 <strong className="text-sky-400">3D</strong>로 보며,{" "}
          <strong className="text-orange-400">불평형</strong>일 때 중성선 전류가 커지는 것을 확인하세요.
        </p>
      </div>

      <div className="relative z-10 mb-6 flex flex-wrap items-center gap-4 rounded-xl border border-slate-700 bg-slate-900/60 p-4 backdrop-blur-md">
        <div className="min-w-[200px] flex-1">
          <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-300">
            교류 주파수 (Hz)
          </label>
          <input
            type="range"
            min={0.1}
            max={3}
            step={0.1}
            value={frequency}
            onChange={(e) => setFrequency(parseFloat(e.target.value))}
            className="w-full accent-blue-500"
          />
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setShowNeutral((v) => !v)}
            className={`rounded-lg px-4 py-2 text-sm font-bold transition-all ${
              showNeutral
                ? "bg-slate-700 text-white shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                : "border border-slate-700 bg-transparent text-slate-500"
            }`}
          >
            중성선 {showNeutral ? "켜짐" : "꺼짐"}
          </button>
          <button
            type="button"
            onClick={() => setIsUnbalanced((v) => !v)}
            className={`rounded-lg px-4 py-2 text-sm font-bold transition-all ${
              isUnbalanced
                ? "border border-orange-500/50 bg-orange-500/20 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.3)]"
                : "border border-slate-700 bg-transparent text-slate-500 hover:text-slate-300"
            }`}
          >
            부하 불평형 {isUnbalanced ? "ON" : "OFF"}
          </button>
        </div>
      </div>

      <div className="relative z-10 mb-6 h-[min(52vh,420px)] min-h-[280px] w-full overflow-hidden rounded-2xl border border-slate-800 bg-[#0b1120]/90 shadow-inner backdrop-blur-xl md:min-h-[360px]">
        <Canvas
          shadows
          frameloop="always"
          gl={{ antialias: true, alpha: false }}
          className="h-full w-full touch-none"
        >
          <Suspense fallback={null}>
            <YYScene3D timeRef={timeRef} flagsRef={flagsRef} showNeutral={showNeutral} />
          </Suspense>
        </Canvas>
        <p className="pointer-events-none absolute bottom-2 left-1/2 z-10 max-w-[90%] -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-center text-[10px] text-slate-400 backdrop-blur-sm">
          드래그로 회전 · 스크롤로 확대
        </p>
      </div>

      <div className="relative z-10 mb-6 rounded-2xl border border-slate-800 bg-slate-950 p-4 shadow-inner">
        <div className="mb-2 flex items-center justify-between px-2">
          <span className="text-xs font-bold text-slate-400">LIVE OSCILLOSCOPE (Current)</span>
          <div className="flex flex-wrap gap-3 text-xs font-bold">
            <span className="text-pink-500">■ U</span>
            <span className="text-cyan-500">■ V</span>
            <span className="text-yellow-500">■ W</span>
            {showNeutral && <span className="text-white">■ N</span>}
          </div>
        </div>
        <svg viewBox="0 0 600 100" className="h-auto w-full opacity-90">
          <defs>
            {neonFilterDef("scope-neon-U")}
            {neonFilterDef("scope-neon-V")}
            {neonFilterDef("scope-neon-W")}
            {neonFilterDef("scope-neon-N")}
          </defs>
          <line x1="0" y1="50" x2="600" y2="50" stroke="#334155" strokeWidth="1" />
          <path
            d={generateWavePath(0, ampU)}
            fill="none"
            stroke={colors.U}
            strokeWidth="2"
            filter="url(#scope-neon-U)"
          />
          <path
            d={generateWavePath((2 * Math.PI) / 3, ampV)}
            fill="none"
            stroke={colors.V}
            strokeWidth="2"
            filter="url(#scope-neon-V)"
          />
          <path
            d={generateWavePath((4 * Math.PI) / 3, ampW)}
            fill="none"
            stroke={colors.W}
            strokeWidth="2"
            filter="url(#scope-neon-W)"
          />
          {showNeutral && (
            <path
              d={(() => {
                let dPath = "";
                for (let i = 0; i <= 100; i++) {
                  const x = (i / 100) * 600;
                  const waveX = (i / 100) * 4 * Math.PI;
                  const yVal =
                    ampU * Math.sin(waveX - time) +
                    ampV * Math.sin(waveX - time + (2 * Math.PI) / 3) +
                    ampW * Math.sin(waveX - time + (4 * Math.PI) / 3);
                  const y = 50 - yVal * 25;
                  if (i === 0) dPath += `M ${x} ${y} `;
                  else dPath += `L ${x} ${y} `;
                }
                return dPath;
              })()}
              fill="none"
              stroke={colors.N}
              strokeWidth="3"
              strokeDasharray="4 4"
              filter="url(#scope-neon-N)"
            />
          )}
        </svg>
      </div>

      <div className="relative z-10 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-700 bg-white/5 p-4 backdrop-blur-md">
          <div className="mb-2 text-sm font-bold text-slate-400">3상 평형 상태 (기본)</div>
          <div className="text-sm text-slate-300">
            각 상의 크기가 같고 120° 위상차이면 벡터 합은 0에 가깝습니다.
            <div className="mt-2 text-base text-blue-400">
              <BlockMath math="I_U + I_V + I_W = 0" />
            </div>
            중성선 <InlineMath math="I_N" /> 는 평형이면 거의 0입니다.
          </div>
        </div>
        <div
          className={`rounded-xl border p-4 backdrop-blur-md transition-all ${
            isUnbalanced ? "border-orange-500/50 bg-orange-950/20" : "border-slate-700 bg-white/5"
          }`}
        >
          <div
            className={`mb-2 text-sm font-bold ${isUnbalanced ? "text-orange-400" : "text-slate-400"}`}
          >
            부하 불평형 (U상 진폭 ↑)
          </div>
          <div className="text-sm text-slate-300">
            한 상 전류가 달라지면 중성점 전류가 생깁니다.
            <div className="mt-2 text-base text-orange-400">
              <BlockMath math="I_N = I_U + I_V + I_W \neq 0" />
            </div>
            잔류 전류가 중성선·접지 경로로 흐를 수 있어 설계·보호가 중요합니다.
          </div>
        </div>
      </div>
    </div>
  );
}
