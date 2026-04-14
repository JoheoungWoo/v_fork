import { Environment, OrbitControls, Text } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import "katex/dist/katex.min.css";
import {
  Suspense,
  forwardRef,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { InlineMath } from "react-katex";
import * as THREE from "three";

/**
 * 전기기기 - Y-Y 결선 3D 네온 시뮬레이터 (+ 페이저 전류 흐름도)
 * DB lecture_id: 'transformer_connection_types'
 */

const COL = {
  U: "#ec4899", // Pink
  V: "#06b6d4", // Cyan
  W: "#eab308", // Yellow
  N: "#f8fafc", // White
};

const R = 0.82;
const TIP_U = new THREE.Vector3(0, R, 0);
const TIP_V = new THREE.Vector3((-R * Math.sqrt(3)) / 2, -R * 0.5, 0);
const TIP_W = new THREE.Vector3((R * Math.sqrt(3)) / 2, -R * 0.5, 0);

const Y_UP = new THREE.Vector3(0, 1, 0);

const PRI_C = new THREE.Vector3(-1.38, 0, 0);
const SEC_C = new THREE.Vector3(1.38, 0, 0);
const PRI_TIPS = [TIP_U, TIP_V, TIP_W].map((t) => PRI_C.clone().add(t));
const SEC_TIPS = [TIP_U, TIP_V, TIP_W].map((t) => SEC_C.clone().add(t));
const I_NORM = 1.8;

function placeFlowOnLeg(mesh, from, to, iNorm) {
  if (!mesh) return;
  const s = THREE.MathUtils.clamp(0.5 + 0.44 * iNorm, 0.06, 0.94);
  mesh.position.lerpVectors(from, to, s);
  const sc = 0.11 + Math.min(1, Math.abs(iNorm)) * 0.16;
  mesh.scale.setScalar(sc);
  const m = mesh.material;
  if (m && "emissiveIntensity" in m) {
    m.emissiveIntensity = 0.9 + Math.abs(iNorm) * 1.4;
  }
}

function orientFlowCone(cone, from, to, currentVal) {
  if (!cone) return;
  const axis = new THREE.Vector3().subVectors(to, from);
  const len = axis.length();
  if (len < 1e-6) return;
  axis.normalize();
  if (currentVal < 0) axis.negate();
  const iNorm = currentVal / I_NORM;
  const s = THREE.MathUtils.clamp(0.5 + 0.44 * iNorm, 0.06, 0.94);
  cone.position.lerpVectors(from, to, s);
  const q = new THREE.Quaternion();
  q.setFromUnitVectors(Y_UP, axis);
  cone.quaternion.copy(q);
  const show = Math.abs(currentVal) > 0.04;
  cone.scale.setScalar(
    show ? 0.22 + Math.min(1, Math.abs(currentVal) / I_NORM) * 0.18 : 0.001,
  );
}

const NeonCylinder = forwardRef(function NeonCylinder(
  { from, to, color },
  ref,
) {
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
        <meshStandardMaterial
          color="#94a3b8"
          emissive="#475569"
          emissiveIntensity={0.3}
          roughness={0.45}
        />
      </mesh>
    </group>
  );
}

function YYScene3D({ timeRef, flagsRef, showNeutral }) {
  const pU = useRef(null),
    pV = useRef(null),
    pW = useRef(null);
  const sU = useRef(null),
    sV = useRef(null),
    sW = useRef(null);
  const nMesh = useRef(null);

  const fDotPU = useRef(null),
    fDotPV = useRef(null),
    fDotPW = useRef(null);
  const fDotSU = useRef(null),
    fDotSV = useRef(null),
    fDotSW = useRef(null);
  const fDotN = useRef(null);
  const fConePU = useRef(null),
    fConePV = useRef(null),
    fConePW = useRef(null);
  const fConeSU = useRef(null),
    fConeSV = useRef(null),
    fConeSW = useRef(null);
  const fConeN = useRef(null);

  useFrame(() => {
    const t = timeRef.current;
    const { isUnbalanced, showNeutral: neutralOn } = flagsRef.current;
    const ampU = isUnbalanced ? 1.8 : 1;
    const iU = ampU * Math.sin(t);
    const iV = Math.sin(t - (2 * Math.PI) / 3);
    const iW = Math.sin(t - (4 * Math.PI) / 3);
    const iN = iU + iV + iW;

    const nU = iU / I_NORM,
      nV = iV / I_NORM,
      nW = iW / I_NORM;

    const glow = (obj, i) => {
      if (obj?.material)
        obj.material.emissiveIntensity = 0.12 + Math.abs(i) * 0.95;
    };

    glow(pU.current, iU);
    glow(pV.current, iV);
    glow(pW.current, iW);
    glow(sU.current, iU);
    glow(sV.current, iV);
    glow(sW.current, iW);

    if (nMesh.current?.material) {
      nMesh.current.material.emissiveIntensity = neutralOn
        ? 0.08 + Math.abs(iN) * 1.1
        : 0.05;
    }

    placeFlowOnLeg(fDotPU.current, PRI_C, PRI_TIPS[0], nU);
    placeFlowOnLeg(fDotPV.current, PRI_C, PRI_TIPS[1], nV);
    placeFlowOnLeg(fDotPW.current, PRI_C, PRI_TIPS[2], nW);
    placeFlowOnLeg(fDotSU.current, SEC_C, SEC_TIPS[0], nU);
    placeFlowOnLeg(fDotSV.current, SEC_C, SEC_TIPS[1], nV);
    placeFlowOnLeg(fDotSW.current, SEC_C, SEC_TIPS[2], nW);

    orientFlowCone(fConePU.current, PRI_C, PRI_TIPS[0], iU);
    orientFlowCone(fConePV.current, PRI_C, PRI_TIPS[1], iV);
    orientFlowCone(fConePW.current, PRI_C, PRI_TIPS[2], iW);
    orientFlowCone(fConeSU.current, SEC_C, SEC_TIPS[0], iU);
    orientFlowCone(fConeSV.current, SEC_C, SEC_TIPS[1], iV);
    orientFlowCone(fConeSW.current, SEC_C, SEC_TIPS[2], iW);

    if (neutralOn && fDotN.current) {
      const nNorm = THREE.MathUtils.clamp(iN / I_NORM, -1, 1);
      placeFlowOnLeg(fDotN.current, PRI_C, SEC_C, nNorm);
      orientFlowCone(fConeN.current, PRI_C, SEC_C, iN);
    } else if (fDotN.current) {
      fDotN.current.scale.setScalar(0.001);
      if (fConeN.current) fConeN.current.scale.setScalar(0.001);
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
        {showNeutral && (
          <NeonCylinder ref={nMesh} from={fromN} to={toN} color={COL.N} />
        )}

        {/* 입자들 */}
        {[
          { rD: fDotPU, rC: fConePU, c: COL.U },
          { rD: fDotPV, rC: fConePV, c: COL.V },
          { rD: fDotPW, rC: fConePW, c: COL.W },
          { rD: fDotSU, rC: fConeSU, c: COL.U },
          { rD: fDotSV, rC: fConeSV, c: COL.V },
          { rD: fDotSW, rC: fConeSW, c: COL.W },
          { rD: fDotN, rC: fConeN, c: COL.N, big: true },
        ].map((item, idx) => (
          <group key={idx}>
            <mesh ref={item.rD}>
              <sphereGeometry args={[item.big ? 0.11 : 0.1, 14, 14]} />
              <meshStandardMaterial
                color={item.c}
                emissive={item.c}
                emissiveIntensity={1.2}
                toneMapped={false}
              />
            </mesh>
            <mesh ref={item.rC}>
              <coneGeometry
                args={[item.big ? 0.08 : 0.07, item.big ? 0.22 : 0.2, 10]}
              />
              <meshStandardMaterial
                color={item.c}
                emissive={item.c}
                emissiveIntensity={1}
                toneMapped={false}
              />
            </mesh>
          </group>
        ))}
      </group>
      <OrbitControls
        makeDefault
        enablePan
        minDistance={2.8}
        maxDistance={9}
        target={[0, 0, 0]}
      />
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

  // 파형 그리기 함수
  const generateWavePath = (phaseOffset, amplitude) => {
    let d = "";
    for (let i = 0; i <= 100; i++) {
      const x = (i / 100) * 400;
      const waveX = (i / 100) * 4 * Math.PI;
      const y = 60 - amplitude * Math.sin(waveX - time + phaseOffset) * 25;
      if (i === 0) d += `M ${x} ${y} `;
      else d += `L ${x} ${y} `;
    }
    return d;
  };

  // 페이저(벡터) 다이어그램 좌표 계산
  // 시간(time)에 따라 반시계 방향으로 회전하는 벡터를 X, Y 평면에 투영합니다.
  const rScale = 40; // 벡터 길이 스케일
  const uX = ampU * Math.cos(phaseU) * rScale;
  const uY = -ampU * Math.sin(phaseU) * rScale; // SVG는 Y축이 아래로 증가하므로 뒤집음
  const vX = ampV * Math.cos(phaseV) * rScale;
  const vY = -ampV * Math.sin(phaseV) * rScale;
  const wX = ampW * Math.cos(phaseW) * rScale;
  const wY = -ampW * Math.sin(phaseW) * rScale;
  const nX = uX + vX + wX;
  const nY = uY + vY + wY;

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
          <strong className="text-orange-400">불평형</strong>일 때 중성선 전류가
          커지는 것을 페이저(벡터) 흐름도로 직접 확인하세요.
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
            className={`rounded-lg px-4 py-2 text-sm font-bold transition-all ${showNeutral ? "bg-slate-700 text-white shadow-[0_0_10px_rgba(255,255,255,0.2)]" : "border border-slate-700 bg-transparent text-slate-500"}`}
          >
            중성선 {showNeutral ? "켜짐" : "꺼짐"}
          </button>
          <button
            type="button"
            onClick={() => setIsUnbalanced((v) => !v)}
            className={`rounded-lg px-4 py-2 text-sm font-bold transition-all ${isUnbalanced ? "border border-orange-500/50 bg-orange-500/20 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.3)]" : "border border-slate-700 bg-transparent text-slate-500 hover:text-slate-300"}`}
          >
            부하 불평형 {isUnbalanced ? "ON" : "OFF"}
          </button>
        </div>
      </div>

      <div className="relative z-10 mb-6 h-[min(45vh,360px)] min-h-[260px] w-full overflow-hidden rounded-2xl border border-slate-800 bg-[#0b1120]/90 shadow-inner backdrop-blur-xl">
        <Canvas
          shadows
          frameloop="always"
          gl={{ antialias: true, alpha: false }}
          className="h-full w-full touch-none"
        >
          <Suspense fallback={null}>
            <YYScene3D
              timeRef={timeRef}
              flagsRef={flagsRef}
              showNeutral={showNeutral}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* 하단 패널: 파형 + 벡터 페이저도 */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* 오실로스코프 (좌측) */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-950 p-4 shadow-inner">
          <div className="mb-2 flex items-center justify-between px-2">
            <span className="text-xs font-bold text-slate-400">
              LIVE OSCILLOSCOPE (Time Domain)
            </span>
            <div className="flex flex-wrap gap-3 text-xs font-bold">
              <span className="text-pink-500">■ U</span>{" "}
              <span className="text-cyan-500">■ V</span>{" "}
              <span className="text-yellow-500">■ W</span>
              {showNeutral && <span className="text-white">■ N</span>}
            </div>
          </div>
          <svg viewBox="0 0 400 120" className="h-auto w-full opacity-90">
            <defs>
              {neonFilterDef("scope-U")} {neonFilterDef("scope-V")}{" "}
              {neonFilterDef("scope-W")} {neonFilterDef("scope-N")}
            </defs>
            <line
              x1="0"
              y1="60"
              x2="400"
              y2="60"
              stroke="#334155"
              strokeWidth="1"
            />
            <path
              d={generateWavePath(0, ampU)}
              fill="none"
              stroke={colors.U}
              strokeWidth="2"
              filter="url(#scope-U)"
            />
            <path
              d={generateWavePath((2 * Math.PI) / 3, ampV)}
              fill="none"
              stroke={colors.V}
              strokeWidth="2"
              filter="url(#scope-V)"
            />
            <path
              d={generateWavePath((4 * Math.PI) / 3, ampW)}
              fill="none"
              stroke={colors.W}
              strokeWidth="2"
              filter="url(#scope-W)"
            />
            {showNeutral && (
              <path
                d={(() => {
                  let dPath = "";
                  for (let i = 0; i <= 100; i++) {
                    const x = (i / 100) * 400;
                    const waveX = (i / 100) * 4 * Math.PI;
                    const yVal =
                      ampU * Math.sin(waveX - time) +
                      ampV * Math.sin(waveX - time + (2 * Math.PI) / 3) +
                      ampW * Math.sin(waveX - time + (4 * Math.PI) / 3);
                    const y = 60 - yVal * 25;
                    if (i === 0) dPath += `M ${x} ${y} `;
                    else dPath += `L ${x} ${y} `;
                  }
                  return dPath;
                })()}
                fill="none"
                stroke={colors.N}
                strokeWidth="3"
                strokeDasharray="4 4"
                filter="url(#scope-N)"
              />
            )}
          </svg>
        </div>

        {/* 페이저 다이어그램 (우측) */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 shadow-inner flex flex-col">
          <div className="mb-2 px-2 text-center">
            <span className="text-xs font-bold text-slate-400">
              LIVE PHASOR (벡터 흐름도)
            </span>
          </div>
          <div className="flex-1 flex items-center justify-center relative">
            <svg
              viewBox="-100 -100 200 200"
              className="h-full w-full max-h-[160px] opacity-90 overflow-visible"
            >
              <defs>
                <marker
                  id="arrowU"
                  viewBox="0 0 10 10"
                  refX="7"
                  refY="5"
                  markerWidth="5"
                  markerHeight="5"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill={colors.U} />
                </marker>
                <marker
                  id="arrowV"
                  viewBox="0 0 10 10"
                  refX="7"
                  refY="5"
                  markerWidth="5"
                  markerHeight="5"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill={colors.V} />
                </marker>
                <marker
                  id="arrowW"
                  viewBox="0 0 10 10"
                  refX="7"
                  refY="5"
                  markerWidth="5"
                  markerHeight="5"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill={colors.W} />
                </marker>
                <marker
                  id="arrowN"
                  viewBox="0 0 10 10"
                  refX="7"
                  refY="5"
                  markerWidth="5"
                  markerHeight="5"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill={colors.N} />
                </marker>
              </defs>

              {/* 가이드라인 원 & 축 */}
              <circle
                cx="0"
                cy="0"
                r={rScale}
                fill="none"
                stroke="#1e293b"
                strokeWidth="1"
                strokeDasharray="2 4"
              />
              {isUnbalanced && (
                <circle
                  cx="0"
                  cy="0"
                  r={rScale * 1.8}
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="1"
                  strokeDasharray="2 4"
                />
              )}
              <line
                x1="-100"
                y1="0"
                x2="100"
                y2="0"
                stroke="#1e293b"
                strokeWidth="1"
              />
              <line
                x1="0"
                y1="-100"
                x2="0"
                y2="100"
                stroke="#1e293b"
                strokeWidth="1"
              />

              {/* 회전하는 전류 벡터들 */}
              <line
                x1="0"
                y1="0"
                x2={uX}
                y2={uY}
                stroke={colors.U}
                strokeWidth="3"
                markerEnd="url(#arrowU)"
                filter="url(#scope-U)"
              />
              <line
                x1="0"
                y1="0"
                x2={vX}
                y2={vY}
                stroke={colors.V}
                strokeWidth="3"
                markerEnd="url(#arrowV)"
                filter="url(#scope-V)"
              />
              <line
                x1="0"
                y1="0"
                x2={wX}
                y2={wY}
                stroke={colors.W}
                strokeWidth="3"
                markerEnd="url(#arrowW)"
                filter="url(#scope-W)"
              />

              {/* 중성선 전류 벡터 (3벡터의 합) */}
              {showNeutral && isUnbalanced && (
                <line
                  x1="0"
                  y1="0"
                  x2={nX}
                  y2={nY}
                  stroke={colors.N}
                  strokeWidth="4"
                  strokeDasharray="3 3"
                  markerEnd="url(#arrowN)"
                  filter="url(#scope-N)"
                />
              )}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
