import { Center, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import React, { Suspense, useCallback, useState } from "react";
import FingerSliders from "./FingerSliders.jsx";
import LeftHandModel from "./LeftHandModel.jsx";
import { INITIAL_FINGER_VALUES } from "./leftHandBoneConfig.js";

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
        <div className="flex h-full items-center justify-center p-6 text-center text-sm text-neutral-600 dark:text-neutral-400">
          <p>
            <code className="rounded bg-neutral-100 px-1 dark:bg-neutral-800">
              public/models/left_hand.glb
            </code>
            를 불러오지 못했습니다. Blender에서{" "}
            <code className="rounded bg-neutral-100 px-1 dark:bg-neutral-800">
              scripts/blender_left_hand.py
            </code>
            를 실행해 GLB를 생성한 뒤 다시 시도하세요.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

function HandScene({ values }) {
  return (
    <>
      <ambientLight intensity={0.55} />
      {/* 🟢 테스트용 상자: 이 상자가 화면에 보인다면 Canvas는 정상입니다! */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.1, 0.1, 0.1]} />
        <meshStandardMaterial color="orange" />
      </mesh>
      <directionalLight
        castShadow
        position={[1.2, 2.5, 1.8]}
        intensity={1.35}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight position={[-2, 0.5, -1]} intensity={0.35} />
      <Center position={[0, 0.02, 0]}>
        <group scale={5.5}>
          <LeftHandModel values={values} />
        </group>
      </Center>
      <OrbitControls
        enablePan
        minDistance={0.35}
        maxDistance={6}
        target={[0, 0.05, 0]}
      />
    </>
  );
}

/**
 * 왼손 GLB + 손가락 슬라이더(0–100) 연동 뷰어.
 * GLB는 `frontend/public/models/left_hand.glb`에 두고,
 * `scripts/blender_left_hand.py`로 Blender에서 생성한다.
 */
export default function LeftHandViewer({ className = "" }) {
  const [values, setValues] = useState(() => ({ ...INITIAL_FINGER_VALUES }));

  const onSliderChange = useCallback((key, value) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  return (
    <div
      className={`flex w-full flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-950 ${className}`}
    >
      <div className="h-[min(420px,55vh)] w-full min-h-[280px]">
        {/* 💡 수정 포인트: ErrorBoundary가 Canvas를 감싸도록 밖으로 이동! */}
        <GltfErrorBoundary>
          <Canvas
            shadows
            camera={{
              position: [0.35, 0.42, 0.55],
              fov: 42,
              near: 0.02,
              far: 50,
            }}
            gl={{ antialias: true }}
          >
            <color attach="background" args={["#f4f4f5"]} />
            {/* 내부에는 순수한 3D 요소만 남깁니다 */}
            <Suspense fallback={null}>
              <HandScene values={values} />
            </Suspense>
          </Canvas>
        </GltfErrorBoundary>
      </div>

      <FingerSliders values={values} onChange={onSliderChange} />
    </div>
  );
}
