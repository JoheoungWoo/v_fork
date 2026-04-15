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

const panel = {
  borderRadius: 12,
  background: "rgba(15, 23, 42, 0.92)",
  border: "1px solid rgba(148, 163, 184, 0.32)",
  color: "#e2e8f0",
  fontFamily: "system-ui, sans-serif",
  boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
};

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
        <div
          style={{
            display: "flex",
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            textAlign: "center",
            fontSize: 13,
            color: "#cbd5e1",
          }}
        >
          <p>
            <code style={{ background: "#1e293b", padding: "2px 6px", borderRadius: 4 }}>
              public/models/left_finger.glb
            </code>
            를 불러오지 못했습니다. Blender에서{" "}
            <code style={{ background: "#1e293b", padding: "2px 6px", borderRadius: 4 }}>
              scripts/blender_left_hand.py
            </code>
            를 실행해 GLB를 만든 뒤 다시 시도하세요.
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

      <Suspense fallback={null}>
        <Environment preset="city" />
      </Suspense>

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

const labelStyle = { display: "block", fontSize: 11, fontWeight: 600, marginBottom: 6 };
const listStyle = { margin: 0, paddingLeft: 16, fontSize: 11, color: "#94a3b8", lineHeight: 1.5 };

/**
 * 플레밍 왼손 법칙 3D: 데스크톱은 캔버스 위 오버레이, 모바일은 캔버스·설명·조작 세로 분리.
 */
export default function FlemingLeftHand3DWidget() {
  const [layoutWide, setLayoutWide] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(min-width: 768px)").matches : true,
  );
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    setLayoutWide(mq.matches);
    const onChange = () => setLayoutWide(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

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

  const introInner = (
    <>
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.06em",
          color: "#94a3b8",
          marginBottom: 8,
        }}
      >
        플레밍의 왼손 법칙
      </div>
      <p style={{ margin: "0 0 10px", fontSize: 12, lineHeight: 1.55, color: "#cbd5e1" }}>
        왼손을 펴서 <strong style={{ color: "#4ade80" }}>검지</strong>는 자기장{" "}
        <span style={{ color: "#4ade80" }}>B</span>, <strong style={{ color: "#60a5fa" }}>중지</strong>
        는 전류 <span style={{ color: "#60a5fa" }}>I</span>,{" "}
        <strong style={{ color: "#f87171" }}>엄지</strong>는 도체가 받는 힘{" "}
        <span style={{ color: "#f87171" }}>F</span> 방향에 놓습니다. 세 방향은 서로 직각입니다.
      </p>
      <ul style={listStyle}>
        <li>
          <span style={{ color: "#60a5fa" }}>●</span> 파랑: 전류 I (+X)
        </li>
        <li>
          <span style={{ color: "#4ade80" }}>●</span> 초록: 자기장 B (+Y)
        </li>
        <li>
          <span style={{ color: "#f87171" }}>●</span> 빨강: 힘 F (+Z), 화살표 길이는 F = BIℓ에 비례
        </li>
      </ul>
    </>
  );

  const formulaInner = (
    <>
      <div
        style={{
          marginBottom: 10,
          paddingBottom: 10,
          borderBottom: "1px solid rgba(71, 85, 105, 0.6)",
          fontSize: 18,
          fontFamily: "Georgia, serif",
          color: "#f8fafc",
          textAlign: "center",
        }}
      >
        <span style={{ fontWeight: 700, color: "#f87171" }}>F</span>
        <span style={{ margin: "0 4px" }}>=</span>
        <span style={{ color: "#4ade80" }}>B</span>
        <span style={{ color: "#60a5fa" }}> I</span>
        <span style={{ color: "#cbd5e1" }}> ℓ</span>
      </div>
      <div
        style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: "0.08em",
          color: "#64748b",
          textAlign: "center",
        }}
      >
        힘 (N)
      </div>
      <div
        style={{
          marginTop: 6,
          fontSize: 36,
          fontWeight: 900,
          fontVariantNumeric: "tabular-nums",
          color: "#ffffff",
          textAlign: "center",
        }}
      >
        {force}
      </div>
    </>
  );

  const slidersInner = (
    <>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", marginBottom: 10 }}>
        도체 길이 방향과 자기장이 직각일 때
      </div>
      <label style={{ ...labelStyle, color: "#93c5fd" }}>
        전류 I (A): {current.toFixed(1)}
      </label>
      <input
        type="range"
        min={0.5}
        max={4}
        step={0.1}
        value={current}
        onChange={(e) => setCurrent(Number(e.target.value))}
        style={{ width: "100%", accentColor: "#3b82f6", marginBottom: 12 }}
      />
      <label style={{ ...labelStyle, color: "#6ee7b7" }}>
        자속밀도 B (T): {bField.toFixed(1)}
      </label>
      <input
        type="range"
        min={0.5}
        max={4}
        step={0.1}
        value={bField}
        onChange={(e) => setBField(Number(e.target.value))}
        style={{ width: "100%", accentColor: "#10b981", marginBottom: 12 }}
      />
      <label style={{ ...labelStyle, color: "#cbd5e1" }}>
        도체 길이 ℓ (m): {length.toFixed(1)}
      </label>
      <input
        type="range"
        min={0.1}
        max={2}
        step={0.1}
        value={length}
        onChange={(e) => setLength(Number(e.target.value))}
        style={{ width: "100%", accentColor: "#94a3b8" }}
      />
    </>
  );

  const hintText = handTexture
    ? "드래그로 회전 · 손은 이미지(평면)로 표시됩니다"
    : "드래그로 회전 · 아래에서 손가락 각도 조절";

  const overlayIntro = {
    ...panel,
    position: "absolute",
    top: 12,
    left: 12,
    zIndex: 2,
    maxWidth: "min(280px, calc(100% - 24px))",
    padding: "12px 14px",
    pointerEvents: "none",
  };

  const overlayFormula = {
    ...panel,
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 2,
    width: "min(220px, calc(100% - 24px))",
    padding: "14px 16px",
    pointerEvents: "none",
  };

  const overlaySliders = {
    ...panel,
    position: "absolute",
    bottom: 12,
    left: 12,
    zIndex: 2,
    width: "min(300px, calc(100% - 24px))",
    padding: "12px 14px",
    pointerEvents: "auto",
  };

  const overlayHint = {
    position: "absolute",
    bottom: 12,
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 2,
    maxWidth: "90%",
    padding: "6px 12px",
    borderRadius: 9999,
    background: "rgba(0,0,0,0.45)",
    backdropFilter: "blur(6px)",
    fontSize: 10,
    color: "#cbd5e1",
    pointerEvents: "none",
  };

  const stackedCard = {
    ...panel,
    position: "relative",
    width: "100%",
    maxWidth: "100%",
    padding: "12px 14px",
    boxSizing: "border-box",
    boxShadow: "none",
  };

  const mobileStack = {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    padding: 12,
    background: "rgba(2, 6, 23, 0.55)",
    borderTop: "1px solid rgba(51, 65, 85, 0.65)",
    flex: "0 0 auto",
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 14,
        overflow: "hidden",
        background: "linear-gradient(165deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
        border: "1px solid rgba(51, 65, 85, 0.55)",
        ...(layoutWide ? { height: "min(640px, 88vh)", minHeight: 560 } : { minHeight: 0 }),
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          flexShrink: 0,
          overflow: "hidden",
          ...(layoutWide
            ? { flex: 1, minHeight: 400, height: "100%" }
            : { height: "min(52vh, 420px)", minHeight: 280 }),
        }}
      >
        <GltfErrorBoundary>
          <Canvas
            shadows
            frameloop="always"
            camera={{ position: [0.55, 0.38, 0.72], fov: 42, near: 0.02, far: 80 }}
            gl={{ antialias: true, alpha: false }}
            style={{
              width: "100%",
              height: "100%",
              display: "block",
              touchAction: "none",
            }}
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

        {layoutWide && (
          <>
            <div style={overlayIntro}>{introInner}</div>
            <div style={overlayFormula}>{formulaInner}</div>
            <div style={overlaySliders}>{slidersInner}</div>
            <div style={overlayHint}>{hintText}</div>
          </>
        )}
      </div>

      {!layoutWide && (
        <div style={mobileStack}>
          <div style={stackedCard}>{introInner}</div>
          <div style={stackedCard}>{formulaInner}</div>
          <div style={{ ...stackedCard, pointerEvents: "auto" }}>{slidersInner}</div>
          <div style={{ textAlign: "center", fontSize: 10, color: "#94a3b8", lineHeight: 1.4 }}>
            {hintText}
          </div>
        </div>
      )}

      {handTexture ? (
        <div
          style={{
            flexShrink: 0,
            borderTop: "1px solid rgba(51, 65, 85, 0.6)",
            background: "rgba(15, 23, 42, 0.95)",
            padding: "8px 12px",
            textAlign: "center",
            fontSize: 10,
            color: "#64748b",
          }}
        >
          손 그림:{" "}
          <code style={{ color: "#94a3b8" }}>{FLEMING_LEFT_HAND_IMAGE_URL || "(미설정)"}</code> —{" "}
          <code style={{ color: "#94a3b8" }}>flemingHandAssets.js</code>에서 크기·방향 조정
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
