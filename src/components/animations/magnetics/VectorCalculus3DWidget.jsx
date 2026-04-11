import { Grid, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";

// ==========================================
// 1. 수학적 모델 정의
// ==========================================
const MODELS = {
  gradient: {
    name: "스칼라장 (Gradient)",
    funcStr: "f(x,y) = sin(x) + cos(y)",
    // 스칼라 함수 값 계산
    calcF: (x, y) => Math.sin(x) + Math.cos(y),
    // 그래디언트 벡터 [df/dx, df/dy, 0]
    calcGrad: (x, y) => [Math.cos(x), -Math.sin(y), 0],
  },
  divergence: {
    name: "발산장 (Divergence)",
    funcStr: "F(x,y,z) = [x, y, z]",
    // 벡터장 계산
    calcV: (x, y, z) => [x, y, z],
    // 발산 계산 (d/dx(x) + d/dy(y) + d/dz(z) = 1+1+1 = 3)
    calcDiv: () => 3,
  },
  curl: {
    name: "회전장 (Curl)",
    funcStr: "F(x,y,z) = [-y, x, 0]",
    // 벡터장 계산
    calcV: (x, y, z) => [-y, x, 0],
    // 회전 계산 (V_y를 x로 미분 - V_x를 y로 미분 = 1 - (-1) = 2)
    calcCurl: () => [0, 0, 2],
  },
};

// ==========================================
// 2. 3D 헬퍼 컴포넌트 (화살표)
// ==========================================
const Arrow3D = ({
  start,
  dir,
  length = 1,
  color = "#ff0000",
  thickness = 0.05,
}) => {
  const vecDir = new THREE.Vector3(...dir).normalize();
  const quaternion = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    vecDir,
  );

  return (
    <group position={start} quaternion={quaternion}>
      {/* 몸통 */}
      <mesh position={[0, length / 2, 0]}>
        <cylinderGeometry args={[thickness, thickness, length, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* 화살촉 */}
      <mesh position={[0, length + thickness * 2, 0]}>
        <coneGeometry args={[thickness * 3, thickness * 6, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
};

// ==========================================
// 3. 탐색기 (프로브) 시각화 컴포넌트
// ==========================================
const Probe = ({ mode, position }) => {
  const ref = useRef();
  const [x, y, z] = position;

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (mode === "divergence" && ref.current) {
      // 발산: 크기가 커졌다 작아지는 맥동(Pulsing) 효과
      const scale = 1 + Math.sin(t * 4) * 0.3;
      ref.current.scale.set(scale, scale, scale);
    } else if (mode === "curl" && ref.current) {
      // 회전: 패들휠(바람개비) 회전 효과
      ref.current.rotation.z = t * 2;
    }
  });

  if (mode === "gradient") {
    const grad = MODELS.gradient.calcGrad(x, y);
    const zPos = MODELS.gradient.calcF(x, y);
    return (
      <group position={[x, y, zPos]}>
        <mesh>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial color="yellow" />
        </mesh>
        <Arrow3D
          start={[0, 0, 0]}
          dir={grad}
          length={1.5}
          color="#ef4444"
          thickness={0.08}
        />
      </group>
    );
  }

  if (mode === "divergence") {
    return (
      <group position={position}>
        <mesh ref={ref}>
          <sphereGeometry args={[0.4, 32, 32]} />
          <meshStandardMaterial color="#3b82f6" transparent opacity={0.6} />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="white" />
        </mesh>
      </group>
    );
  }

  if (mode === "curl") {
    return (
      <group position={position} ref={ref}>
        {/* 바람개비 형태 조립 */}
        <mesh position={[0.5, 0, 0]}>
          <boxGeometry args={[1, 0.1, 0.1]} />
          <meshStandardMaterial color="#10b981" />
        </mesh>
        <mesh position={[-0.5, 0, 0]}>
          <boxGeometry args={[1, 0.1, 0.1]} />
          <meshStandardMaterial color="#10b981" />
        </mesh>
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[0.1, 1, 0.1]} />
          <meshStandardMaterial color="#10b981" />
        </mesh>
        <mesh position={[0, -0.5, 0]}>
          <boxGeometry args={[0.1, 1, 0.1]} />
          <meshStandardMaterial color="#10b981" />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color="white" />
        </mesh>
      </group>
    );
  }

  return null;
};

// ==========================================
// 4. 배경 장(Field) 시각화 컴포넌트
// ==========================================
const FieldVisualizer = ({ mode }) => {
  const arrows = useMemo(() => {
    const arr = [];
    const step = 1.5;
    if (mode === "divergence") {
      for (let x = -3; x <= 3; x += step) {
        for (let y = -3; y <= 3; y += step) {
          for (let z = -3; z <= 3; z += step) {
            if (x === 0 && y === 0 && z === 0) continue;
            const v = MODELS.divergence.calcV(x, y, z);
            arr.push(
              <Arrow3D
                key={`${x}${y}${z}`}
                start={[x, y, z]}
                dir={v}
                length={0.5}
                color="#94a3b8"
              />,
            );
          }
        }
      }
    } else if (mode === "curl") {
      for (let x = -4; x <= 4; x += step) {
        for (let y = -4; y <= 4; y += step) {
          const v = MODELS.curl.calcV(x, y, 0);
          if (v[0] !== 0 || v[1] !== 0) {
            arr.push(
              <Arrow3D
                key={`${x}${y}`}
                start={[x, y, 0]}
                dir={v}
                length={0.8}
                color="#94a3b8"
              />,
            );
          }
        }
      }
    }
    return arr;
  }, [mode]);

  if (mode === "gradient") {
    return (
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        {/* 평면을 굴곡진 표면으로 렌더링하기 위해 vertex shader 등 사용가능하나 단순 평면+그리드로 대체 */}
        <planeGeometry args={[10, 10, 32, 32]} />
        <meshStandardMaterial
          color="#e2e8f0"
          wireframe
          opacity={0.3}
          transparent
        />
      </mesh>
    );
  }

  return <>{arrows}</>;
};

// ==========================================
// 5. 메인 UI 컴포넌트
// ==========================================
export default function VectorCalculus3DWidget() {
  const [mode, setMode] = useState("gradient");
  const [posX, setPosX] = useState(1);
  const [posY, setPosY] = useState(1);
  const [posZ, setPosZ] = useState(0);

  const currentModel = MODELS[mode];

  return (
    <div className="w-full flex flex-col bg-white rounded-[2rem] border border-gray-200 shadow-xl overflow-hidden min-h-[700px] font-sans">
      {/* 상단 탭 */}
      <div className="flex border-b border-gray-100 bg-slate-50 p-4 gap-2">
        {Object.keys(MODELS).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all ${
              mode === m
                ? "bg-[#0047a5] text-white shadow-md scale-[1.02]"
                : "bg-white text-gray-500 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            {MODELS[m].name}
          </button>
        ))}
      </div>

      <div className="flex flex-col md:flex-row flex-1 p-6 gap-6">
        {/* 왼쪽: 제어 패널 */}
        <div className="w-full md:w-1/3 flex flex-col gap-6">
          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
            <h3 className="text-blue-800 font-black text-xl mb-2">
              수학적 모델
            </h3>
            <p className="text-xl font-mono bg-white p-3 rounded-lg text-center border border-blue-200 shadow-inner">
              {currentModel.funcStr}
            </p>
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex-1">
            <h3 className="text-slate-800 font-black text-lg mb-4">
              탐색점(Probe) 위치 제어
            </h3>

            <div className="space-y-4">
              <div>
                <label className="flex justify-between font-bold text-gray-600 mb-1">
                  <span>X 좌표</span> <span>{posX.toFixed(1)}</span>
                </label>
                <input
                  type="range"
                  min="-4"
                  max="4"
                  step="0.1"
                  value={posX}
                  onChange={(e) => setPosX(parseFloat(e.target.value))}
                  className="w-full accent-[#0047a5]"
                />
              </div>
              <div>
                <label className="flex justify-between font-bold text-gray-600 mb-1">
                  <span>Y 좌표</span> <span>{posY.toFixed(1)}</span>
                </label>
                <input
                  type="range"
                  min="-4"
                  max="4"
                  step="0.1"
                  value={posY}
                  onChange={(e) => setPosY(parseFloat(e.target.value))}
                  className="w-full accent-[#0047a5]"
                />
              </div>
              {mode !== "gradient" && (
                <div>
                  <label className="flex justify-between font-bold text-gray-600 mb-1">
                    <span>Z 좌표</span> <span>{posZ.toFixed(1)}</span>
                  </label>
                  <input
                    type="range"
                    min="-4"
                    max="4"
                    step="0.1"
                    value={posZ}
                    onChange={(e) => setPosZ(parseFloat(e.target.value))}
                    className="w-full accent-[#0047a5]"
                  />
                </div>
              )}
            </div>

            <div className="mt-8 p-4 bg-white rounded-xl border border-gray-200 text-sm text-gray-700 leading-relaxed shadow-sm">
              {mode === "gradient" &&
                "🔴 빨간색 화살표는 스칼라 값이 가장 가파르게 증가하는 방향(Gradient)을 가리킵니다."}
              {mode === "divergence" &&
                "🔵 파란색 구체가 맥동하는 것은 해당 지점에서 유량(Flux)이 뿜어져 나오고 있음(Divergence > 0)을 시각화한 것입니다."}
              {mode === "curl" &&
                "🟢 초록색 바람개비가 회전하는 것은 해당 지점에서 벡터장의 회전력(Curl)이 작용하고 있음을 의미합니다."}
            </div>
          </div>
        </div>

        {/* 오른쪽: 3D 캔버스 */}
        <div className="w-full md:w-2/3 bg-black rounded-3xl overflow-hidden relative shadow-inner border-[4px] border-slate-800 h-[400px] md:h-auto">
          <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 10]} intensity={1} />

            {/* 헬퍼 라인 */}
            <Grid
              args={[10, 10]}
              position={[0, -0.01, 0]}
              cellColor="#334155"
              sectionColor="#475569"
              fadeDistance={20}
            />
            <axesHelper args={[5]} />

            {/* 필드와 프로브 */}
            <FieldVisualizer mode={mode} />
            <Probe mode={mode} position={[posX, posY, posZ]} />

            <OrbitControls makeDefault enableDamping dampingFactor={0.1} />
          </Canvas>

          <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-white/70 text-xs border border-white/20">
            마우스로 드래그하여 시점을 회전하세요
          </div>
        </div>
      </div>
    </div>
  );
}
