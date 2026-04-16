import { Canvas, useFrame } from "@react-three/fiber";
import { Bounds, OrbitControls, useGLTF } from "@react-three/drei";
import React, { Suspense, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

/** `public/models/` 정적 파일 — Vite가 루트로 서빙 */
export const FLEMINGS_LEFT_HAND_GLB = "/models/flemings_left_hand.glb";

/**
 * Blender에서 내보낸 F/B/I 도식 화살표 GLB (Pivot_F, Pivot_B, Pivot_I 자식 포함).
 * glTF Y-up 변환 후: I≈+X, B≈−Z(전방), F≈+Y(위) 기준으로 외적과 맞춤.
 */
function findNamed(root, name) {
  let found = root.getObjectByName(name);
  if (found) return found;
  root.traverse((c) => {
    if (!found && c.name === name) found = c;
  });
  return found;
}

function FlemingGlbModel({ flipCurrent, flipField }) {
  const { scene } = useGLTF(FLEMINGS_LEFT_HAND_GLB);
  const root = useMemo(() => scene.clone(true), [scene]);

  useLayoutEffect(() => {
    root.traverse((obj) => {
      if (obj.isMesh) {
        const m = obj.material;
        const mats = Array.isArray(m) ? m : [m];
        for (const mat of mats) {
          if (mat) mat.side = THREE.DoubleSide;
        }
      }
    });
  }, [root]);

  const pivotI = useMemo(() => findNamed(root, "Pivot_I"), [root]);
  const pivotB = useMemo(() => findNamed(root, "Pivot_B"), [root]);
  const pivotF = useMemo(() => findNamed(root, "Pivot_F"), [root]);

  const qFTarget = useRef(new THREE.Quaternion());
  const qIt = useRef(new THREE.Quaternion());
  const qBt = useRef(new THREE.Quaternion());

  useFrame((_, delta) => {
    const t = 1 - Math.exp(-10 * delta);
    qIt.current.setFromAxisAngle(new THREE.Vector3(0, 1, 0), flipCurrent ? Math.PI : 0);
    qBt.current.setFromAxisAngle(new THREE.Vector3(1, 0, 0), flipField ? Math.PI : 0);

    const iDir = new THREE.Vector3(1, 0, 0).applyQuaternion(qIt.current);
    const bDir = new THREE.Vector3(0, 0, -1).applyQuaternion(qBt.current);
    const fDir = new THREE.Vector3().crossVectors(iDir, bDir);
    if (fDir.lengthSq() < 1e-10) fDir.set(0, 1, 0);
    else fDir.normalize();

    qFTarget.current.setFromUnitVectors(new THREE.Vector3(0, 1, 0), fDir);

    if (pivotI) pivotI.quaternion.slerp(qIt.current, t);
    if (pivotB) pivotB.quaternion.slerp(qBt.current, t);
    if (pivotF) pivotF.quaternion.slerp(qFTarget.current, t);
  });

  return <primitive object={root} />;
}

function Scene({ flipCurrent, flipField }) {
  return (
    <>
      <color attach="background" args={["#0b1220"]} />
      <ambientLight intensity={0.55} />
      <hemisphereLight args={["#e2e8f0", "#0f172a", 0.45]} />
      <directionalLight castShadow position={[4, 6, 4]} intensity={1.2} />
      <directionalLight position={[-3, 2, -2]} intensity={0.4} color="#93c5fd" />

      <Suspense fallback={null}>
        <Bounds fit clip observe margin={1.35}>
          <group>
            <FlemingGlbModel flipCurrent={flipCurrent} flipField={flipField} />
          </group>
        </Bounds>
      </Suspense>

      <gridHelper args={[8, 16, 0x334155, 0x1e293b]} position={[0, -1.2, 0]} />

      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.08}
        minDistance={0.15}
        maxDistance={24}
        minPolarAngle={Math.PI * 0.12}
        maxPolarAngle={Math.PI * 0.88}
        minAzimuthAngle={-Math.PI * 0.65}
        maxAzimuthAngle={Math.PI * 0.65}
      />
    </>
  );
}

function LoadErrorFallback() {
  return (
    <div className="flex h-full min-h-[280px] flex-col items-center justify-center gap-2 bg-slate-950 px-6 text-center text-slate-300">
      <p className="text-lg font-semibold">모델을 불러오지 못했습니다</p>
      <p className="text-base text-slate-400">
        <code className="rounded bg-slate-800 px-2 py-1 text-emerald-300">public/models/flemings_left_hand.glb</code> 파일이
        있는지 확인하세요.
      </p>
    </div>
  );
}

class GlbErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <LoadErrorFallback />;
    }
    return this.props.children;
  }
}

/**
 * 플레밍 왼손 법칙 — `flemings_left_hand.glb` 도식 3D
 * @param {{ className?: string }} props — 카드·QnaCard 안에 넣을 때 `className`으로 폭 조절
 */
export default function FlemingLeftHandGlbWidget({ className = "" }) {
  const [flipCurrent, setFlipCurrent] = useState(false);
  const [flipField, setFlipField] = useState(false);

  const iText = flipCurrent ? "좌측(−X)" : "우측(+X)";
  const bText = flipField ? "후방(+Z)" : "전방(−Z, 화면 안쪽)";
  const fWord = useMemo(() => {
    const i = new THREE.Vector3(flipCurrent ? -1 : 1, 0, 0);
    const b = new THREE.Vector3(0, 0, flipField ? 1 : -1);
    const f = new THREE.Vector3().crossVectors(i, b);
    return f.y > 0 ? "위쪽(+Y)" : "아래쪽(−Y)";
  }, [flipCurrent, flipField]);

  return (
    <div
      className={`flex w-full flex-col overflow-hidden rounded-2xl border border-slate-700/80 bg-gradient-to-b from-slate-950 to-slate-900 font-sans shadow-lg md:flex-row ${className}`}
    >
      <div className="relative min-h-[320px] flex-1 md:min-h-[420px]">
        <GlbErrorBoundary>
          <Canvas
            camera={{ position: [4, 3, 5], fov: 40, near: 0.05, far: 200 }}
            gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
            className="h-full w-full touch-none"
            style={{ display: "block", minHeight: 280 }}
          >
            <Scene flipCurrent={flipCurrent} flipField={flipField} />
          </Canvas>
        </GlbErrorBoundary>
      </div>

      <div className="flex w-full max-w-full flex-col gap-4 border-t border-slate-700/80 p-5 md:w-[min(100%,380px)] md:border-l md:border-t-0 md:shrink-0">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white md:text-2xl">플레밍의 왼손 법칙</h2>
          <p className="mt-1 text-lg leading-snug text-slate-400">
            중지·검지·엄지 방향 (도식 화살표)
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => setFlipCurrent((v) => !v)}
            className="rounded-xl border-2 border-emerald-600/70 bg-emerald-950/50 px-4 py-3 text-lg font-semibold text-emerald-100 transition hover:bg-emerald-900/60"
          >
            전류 (I) 방향 반전
          </button>
          <button
            type="button"
            onClick={() => setFlipField((v) => !v)}
            className="rounded-xl border-2 border-blue-600/70 bg-blue-950/50 px-4 py-3 text-lg font-semibold text-blue-100 transition hover:bg-blue-900/60"
          >
            자계 (B) 방향 반전
          </button>
        </div>

        <div className="rounded-xl border border-slate-600/60 bg-slate-900/80 p-4 text-lg leading-relaxed text-slate-200">
          <p>
            전류가 <span className="font-semibold text-emerald-300">{iText}</span>, 자계가{" "}
            <span className="font-semibold text-blue-300">{bText}</span>을(를) 향할 때, 도선이 받는 힘{" "}
            <span className="font-semibold text-red-300">F</span>는{" "}
            <span className="font-semibold text-amber-200">{fWord}</span>입니다. (
            <span className="text-slate-400">F ∝ I × B</span>)
          </p>
        </div>

        <p className="text-base text-slate-500">드래그로 회전 · 스크롤로 확대/축소</p>
      </div>
    </div>
  );
}

useGLTF.preload(FLEMINGS_LEFT_HAND_GLB);
