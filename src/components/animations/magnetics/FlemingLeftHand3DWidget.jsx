import { Center, Environment, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import React, { Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import * as THREE from "three";

import FlemingHandImageMesh from "@/components/leftHand/FlemingHandImageMesh.jsx";
import {
  FLEMING_HAND_IMAGE_BASE_HEIGHT,
  FLEMING_HAND_IMAGE_EULER,
  FLEMING_HAND_IMAGE_USE_BILLBOARD,
  FLEMING_LEFT_HAND_IMAGE_URL,
} from "@/components/leftHand/flemingHandAssets.js";
import FingerSliders from "@/components/leftHand/FingerSliders.jsx";
import { INITIAL_FINGER_VALUES } from "@/components/leftHand/leftHandBoneConfig.js";
import LeftHandModel from "@/components/leftHand/LeftHandModel.jsx";

const COL = { I: 0x3b82f6, B: 0x10b981, F: 0xef4444 };

/** I(+X), B(+Y), F(+Z) 로 직교 — 도체에 대해 F ∝ I × B 와 방향이 맞습니다. */
const DIR_I = new THREE.Vector3(1, 0, 0);
const DIR_B = new THREE.Vector3(0, 1, 0);
const DIR_F = new THREE.Vector3(0, 0, 1);

const ARROW_ORIGIN = Object.freeze([0.06, 0.02, 0]);

function AxisArrow({ direction, length, color, origin }) {
  const arrow = useMemo(() => {
    const o = new THREE.Vector3(...origin);
    const d = direction.clone().normalize();
    const a = new THREE.ArrowHelper(d, o, 1, color, 0.22, 0.11);
    a.line.material.transparent = true;
    a.line.material.opacity = 0.92;
    a.cone.material.transparent = true;
    a.cone.material.opacity = 0.95;
    return a;
  }, [direction, color, origin]);

  useLayoutEffect(() => {
    const headLen = Math.min(0.28, length * 0.22);
    const headW = headLen * 0.48;
    arrow.setLength(length, headLen, headW);
  }, [length, arrow]);

  useEffect(() => {
    return () => {
      arrow.line.geometry.dispose();
      arrow.cone.geometry.dispose();
      arrow.line.material.dispose();
      arrow.cone.material.dispose();
    };
  }, [arrow]);

  return <primitive object={arrow} dispose={null} />;
}

class GltfErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full items-center justify-center p-6 text-center text-sm text-slate-300">
          <p>
            <code className="rounded bg-slate-800 px-1">public/models/LeftHand.glb</code>를 불러오지
            못했습니다. Blender에서{" "}
            <code className="rounded bg-slate-800 px-1">scripts/blender_left_hand.py</code>를 실행해
            GLB를 만든 뒤 다시 시도하세요.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

function FlemingScene({ bField, current, length, fingerValues, handTexture }) {
  const base = 0.42;
  const lenI = base * (0.55 + current * 0.22);
  const lenB = base * (0.55 + bField * 0.22);
  const lenF = base * (0.45 + Math.min(bField * current * length * 0.08, 1.6));

  return (
    <>
      <color attach="background" args={["#0b1220"]} />
      <ambientLight intensity={0.38} />
      <directionalLight castShadow position={[2.2, 4.5, 2.8]} intensity={1.2} />
      <directionalLight position={[-3.5, 1.2, -2]} intensity={0.35} color="#93c5fd" />
      <directionalLight position={[0, -2, 1]} intensity={0.22} color="#fcd34d" />

      <Environment preset="city" />

      <group position={[0, -0.02, 0]}>
        <AxisArrow direction={DIR_I} length={lenI} color={COL.I} origin={ARROW_ORIGIN} />
        <AxisArrow direction={DIR_B} length={lenB} color={COL.B} origin={ARROW_ORIGIN} />
        <AxisArrow direction={DIR_F} length={lenF} color={COL.F} origin={ARROW_ORIGIN} />
      </group>

      <Center position={[0.02, 0.01, 0]}>
        <group rotation={[0.15, -0.85, 0.08]} scale={5.2}>
          {handTexture ? (
            <FlemingHandImageMesh
              map={handTexture}
              baseHeight={FLEMING_HAND_IMAGE_BASE_HEIGHT}
              euler={FLEMING_HAND_IMAGE_EULER}
              billboard={FLEMING_HAND_IMAGE_USE_BILLBOARD}
            />
          ) : (
            <LeftHandModel values={fingerValues} />
          )}
        </group>
      </Center>

      <gridHelper args={[3.2, 16, 0x334155, 0x1e293b]} position={[0, -0.28, 0]} />

      <OrbitControls
        makeDefault
        minDistance={0.55}
        maxDistance={5.5}
        target={[0, 0.04, 0]}
        enablePan
      />
    </>
  );
}

/**
 * 플레밍 왼손 법칙: 검지 B · 중지 I · 엄지 F.
 * `flemingHandAssets.js`에 손 이미지 URL이 있고 파일이 로드되면 GLB 대신 평면에 표시합니다.
 */
export default function FlemingLeftHand3DWidget() {
  const [bField, setBField] = useState(1.5);
  const [current, setCurrent] = useState(2.0);
  const [length, setLength] = useState(0.5);
  const [fingerValues, setFingerValues] = useState(() => ({ ...INITIAL_FINGER_VALUES }));
  const [handTexture, setHandTexture] = useState(null);

  const onFingerChange = useCallback((key, value) => {
    setFingerValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  useEffect(() => {
    const url = typeof FLEMING_LEFT_HAND_IMAGE_URL === "string" ? FLEMING_LEFT_HAND_IMAGE_URL.trim() : "";
    if (!url) {
      setHandTexture(null);
      return;
    }
    let cancelled = false;
    let loaded = null;
    const loader = new THREE.TextureLoader();
    loader.load(
      url,
      (tex) => {
        if (cancelled) {
          tex.dispose();
          return;
        }
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = 8;
        loaded = tex;
        setHandTexture(tex);
      },
      undefined,
      () => {
        if (!cancelled) setHandTexture(null);
      },
    );
    return () => {
      cancelled = true;
      if (loaded) loaded.dispose();
      setHandTexture(null);
    };
  }, []);

  const force = (bField * current * length).toFixed(2);

  const card =
    "rounded-xl border border-slate-600/50 bg-slate-900/92 backdrop-blur-sm text-slate-100 shadow-lg";

  return (
    <div
      className="flex h-[640px] w-full flex-col overflow-hidden rounded-[14px] border border-slate-700/80 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 font-sans"
    >
      <div className="relative min-h-0 flex-1">
        <GltfErrorBoundary>
          <Canvas
            shadows
            camera={{ position: [0.55, 0.38, 0.72], fov: 42, near: 0.02, far: 80 }}
            gl={{ antialias: true, alpha: false }}
            className="absolute inset-0 h-full w-full"
          >
            <Suspense fallback={null}>
              <FlemingScene
                bField={bField}
                current={current}
                length={length}
                fingerValues={fingerValues}
                handTexture={handTexture}
              />
            </Suspense>
          </Canvas>
        </GltfErrorBoundary>

        <div
          className={`pointer-events-none absolute left-3 top-3 z-10 max-w-[min(100%-24px,280px)] space-y-2 p-3 text-xs leading-relaxed ${card}`}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            플레밍의 왼손 법칙
          </div>
          <p className="text-slate-300">
            왼손을 펴서 <span className="font-semibold text-emerald-400">검지</span>는 자기장{" "}
            <span className="text-emerald-400">B</span>,{" "}
            <span className="font-semibold text-blue-400">중지</span>는 전류{" "}
            <span className="text-blue-400">I</span>,{" "}
            <span className="font-semibold text-red-400">엄지</span>는 전도체가 받는 힘{" "}
            <span className="text-red-400">F</span> 방향에 놓입니다. 세량은 서로 직각입니다.
          </p>
          <ul className="grid grid-cols-1 gap-1 text-[11px] text-slate-400">
            <li>
              <span className="text-blue-400">●</span> 파랑: 전류 I (+X)
            </li>
            <li>
              <span className="text-emerald-400">●</span> 초록: 자기장 B (+Y)
            </li>
            <li>
              <span className="text-red-400">●</span> 빨강: 힘 F (+Z), 길이는 F=BIℓ에 비례해 변함
            </li>
          </ul>
        </div>

        <div
          className={`pointer-events-auto absolute bottom-3 left-3 z-10 w-[min(calc(100%-24px),300px)] space-y-3 p-3 ${card}`}
        >
          <div className="text-[11px] font-semibold text-slate-400">
            도체 길이 방향과 자기장이 직각일 때
          </div>
          <label className="block text-[11px] font-semibold text-blue-300">
            전류 I (A): {current.toFixed(1)}
          </label>
          <input
            type="range"
            min={0.5}
            max={4}
            step={0.1}
            value={current}
            onChange={(e) => setCurrent(Number(e.target.value))}
            className="w-full accent-blue-500"
          />
          <label className="block text-[11px] font-semibold text-emerald-300">
            자속밀도 B (T): {bField.toFixed(1)}
          </label>
          <input
            type="range"
            min={0.5}
            max={4}
            step={0.1}
            value={bField}
            onChange={(e) => setBField(Number(e.target.value))}
            className="w-full accent-emerald-500"
          />
          <label className="block text-[11px] font-semibold text-slate-300">
            도체 길이 ℓ (m): {length.toFixed(1)}
          </label>
          <input
            type="range"
            min={0.1}
            max={2}
            step={0.1}
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="w-full accent-slate-400"
          />
        </div>

        <div
          className={`pointer-events-none absolute right-3 top-3 z-10 w-[min(calc(100%-24px),220px)] p-4 text-center ${card}`}
        >
          <div className="mb-2 border-b border-slate-600 pb-3 font-serif text-lg text-slate-100">
            <span className="font-bold text-red-400">F</span>
            <span className="mx-1">=</span>
            <span className="text-emerald-400">B</span>
            <span className="text-blue-400"> I</span>
            <span className="text-slate-300"> ℓ</span>
          </div>
          <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">힘 (N)</div>
          <div className="mt-1 text-4xl font-black tabular-nums text-white">{force}</div>
        </div>

        <div className="pointer-events-none absolute bottom-3 left-1/2 z-10 max-w-[90%] -translate-x-1/2 rounded-full bg-black/45 px-3 py-1 text-center text-[10px] text-slate-300 backdrop-blur-sm">
          {handTexture
            ? "드래그로 회전 · 손은 이미지(평면)로 표시됩니다"
            : "드래그로 회전 · 아래 슬라이더로 손가락 굽힘"}
        </div>
      </div>

      {handTexture ? (
        <div className="shrink-0 border-t border-slate-700/80 bg-slate-950/90 px-3 py-2 text-center text-[10px] text-slate-500">
          손 그림: <code className="text-slate-400">{FLEMING_LEFT_HAND_IMAGE_URL || "(미설정)"}</code>
          — 크기·방향은 <code className="text-slate-400">flemingHandAssets.js</code>에서 조정
        </div>
      ) : (
        <FingerSliders
          values={fingerValues}
          onChange={onFingerChange}
          variant="dark"
          layout="row"
          showFlemingHints
          className="shrink-0 border-slate-700/80"
        />
      )}
    </div>
  );
}
