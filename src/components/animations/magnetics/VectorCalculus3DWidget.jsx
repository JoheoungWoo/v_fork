import { Grid, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";

// ==========================================
// 1. 수학적 모델 정의 (여러 함수 선택 가능)
// ==========================================
const MODELS = {
  gradient: {
    name: "기울기 (Gradient)",
    functions: [
      {
        id: "saddle",
        name: "말안장 (Saddle)",
        funcStr: "f(x,y) = x² - y²",
        calcF: (x, y) => (x * x - y * y) * 0.2,
        calcGrad: (x, y) => [2 * x * 0.2, -2 * y * 0.2, 0],
      },
      {
        id: "hills",
        name: "언덕 (Hills)",
        funcStr: "f(x,y) = sin(x) + cos(y)",
        calcF: (x, y) => Math.sin(x) + Math.cos(y),
        calcGrad: (x, y) => [Math.cos(x), -Math.sin(y), 0],
      },
      {
        id: "bowl",
        name: "그릇 (Bowl)",
        funcStr: "f(x,y) = x² + y²",
        calcF: (x, y) => (x * x + y * y) * 0.1,
        calcGrad: (x, y) => [2 * x * 0.1, 2 * y * 0.1, 0],
      },
    ],
  },
  divergence: {
    name: "발산 (Divergence)",
    functions: [
      {
        id: "source",
        name: "원천 (Source/Sink)",
        funcStr: "A = [x, y, z]",
        calcV: (x, y, z) => [x * 0.5, y * 0.5, z * 0.5],
        calcDiv: (x, y, z) => 1.5, // 상수 발산
      },
      {
        id: "uniform",
        name: "균일 흐름 (Uniform)",
        funcStr: "A = [1, 0, 0]",
        calcV: (x, y, z) => [1, 0, 0],
        calcDiv: (x, y, z) => 0, // 발산 없음
      },
    ],
  },
  curl: {
    name: "회전 (Curl)",
    functions: [
      {
        id: "rotation",
        name: "강체 회전 (Solid Body)",
        funcStr: "A = [-y, x, 0]",
        calcV: (x, y, z) => [-y * 0.5, x * 0.5, 0],
        calcCurl: (x, y, z) => [0, 0, 1],
      },
      {
        id: "vortex",
        name: "소용돌이 (Vortex)",
        funcStr: "A = [-y/(x²+y²), x/(x²+y²), 0]",
        calcV: (x, y, z) => {
          const r2 = x * x + y * y;
          if (r2 < 0.1) return [0, 0, 0]; // 특이점 방지
          return [(-y / r2) * 2, (x / r2) * 2, 0];
        },
        calcCurl: (x, y, z) => [0, 0, 0], // 원점 제외하고 회전 없음
      },
    ],
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
  const vecDir = new THREE.Vector3(...dir);
  const len = vecDir.length();
  if (len < 0.01) return null; // 벡터가 너무 작으면 안 그림

  vecDir.normalize();
  const quaternion = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    vecDir,
  );
  const actualLength = length * Math.min(len, 2); // 길이에 비례하되 최대 길이 제한

  return (
    <group position={start} quaternion={quaternion}>
      <mesh position={[0, actualLength / 2, 0]}>
        <cylinderGeometry args={[thickness, thickness, actualLength, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, actualLength + thickness * 2, 0]}>
        <coneGeometry args={[thickness * 3, thickness * 6, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
};

// ==========================================
// 3. 동적 표면(Surface) 생성 컴포넌트 (Gradient 용)
// ==========================================
const ParametricSurface = ({ func }) => {
  const geometry = useMemo(() => {
    const size = 10;
    const segments = 50;
    const geo = new THREE.PlaneGeometry(size, size, segments, segments);
    const pos = geo.attributes.position;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = func(x, y); // f(x,y) 값으로 높이 설정
      pos.setZ(i, z);
    }
    geo.computeVertexNormals();
    return geo;
  }, [func]);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <primitive object={geometry} />
      <meshStandardMaterial
        color="#94a3b8"
        wireframe={false}
        opacity={0.6}
        transparent
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

// ==========================================
// 4. 탐색기 (프로브) 시각화 컴포넌트
// ==========================================
const Probe = ({ mode, position, activeFunc }) => {
  const ref = useRef();
  const [x, y, z] = position;

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (mode === "divergence" && ref.current) {
      const divVal = activeFunc.calcDiv(x, y, z);
      // 발산값에 따라 맥동의 크기와 속도 조절
      const scale = 1 + Math.sin(t * 5) * (divVal * 0.2);
      ref.current.scale.set(scale, scale, scale);
    } else if (mode === "curl" && ref.current) {
      const curlVal = activeFunc.calcCurl(x, y, z);
      // z축 회전값 기준으로 패들휠 회전
      ref.current.rotation.z += curlVal[2] * 0.05;
    }
  });

  if (mode === "gradient") {
    const grad = activeFunc.calcGrad(x, y);
    const zPos = activeFunc.calcF(x, y);
    return (
      <group position={[x, zPos, -y]}>
        {" "}
        {/* Threejs 좌표계 맞춤 */}
        <mesh>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial color="#fbbf24" />
        </mesh>
        <Arrow3D
          start={[0, 0, 0]}
          dir={[grad[0], grad[2], -grad[1]]}
          length={1.5}
          color="#ef4444"
          thickness={0.08}
        />
      </group>
    );
  }

  if (mode === "divergence") {
    const divVal = activeFunc.calcDiv(x, y, z);
    const color = divVal > 0 ? "#ef4444" : divVal < 0 ? "#3b82f6" : "#cbd5e1";
    return (
      <group position={position}>
        <mesh ref={ref}>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial color={color} transparent opacity={0.5} />
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
        <mesh position={[0.6, 0, 0]}>
          <boxGeometry args={[1.2, 0.1, 0.1]} />
          <meshStandardMaterial color="#10b981" />
        </mesh>
        <mesh position={[-0.6, 0, 0]}>
          <boxGeometry args={[1.2, 0.1, 0.1]} />
          <meshStandardMaterial color="#10b981" />
        </mesh>
        <mesh position={[0, 0.6, 0]}>
          <boxGeometry args={[0.1, 1.2, 0.1]} />
          <meshStandardMaterial color="#10b981" />
        </mesh>
        <mesh position={[0, -0.6, 0]}>
          <boxGeometry args={[0.1, 1.2, 0.1]} />
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
// 5. 배경 장(Field) 시각화 컴포넌트
// ==========================================
const FieldVisualizer = ({ mode, activeFunc }) => {
  const arrows = useMemo(() => {
    const arr = [];
    const step = 2;
    if (mode === "divergence" || mode === "curl") {
      for (let x = -4; x <= 4; x += step) {
        for (let y = -4; y <= 4; y += step) {
          for (
            let z = mode === "curl" ? 0 : -4;
            z <= (mode === "curl" ? 0 : 4);
            z += step
          ) {
            if (x === 0 && y === 0 && z === 0) continue;
            const v = activeFunc.calcV(x, y, z);
            arr.push(
              <Arrow3D
                key={`${x}${y}${z}`}
                start={[x, y, z]}
                dir={v}
                length={1}
                color="#cbd5e1"
                thickness={0.02}
              />,
            );
          }
        }
      }
    }
    return arr;
  }, [mode, activeFunc]);

  if (mode === "gradient") {
    return <ParametricSurface func={activeFunc.calcF} />;
  }

  return <>{arrows}</>;
};

// ==========================================
// 6. 메인 UI 컴포넌트
// ==========================================
export default function VectorCalculus3DWidget() {
  const [mode, setMode] = useState("gradient");
  // 각 모드별로 선택된 함수 인덱스 저장
  const [funcIndexes, setFuncIndexes] = useState({
    gradient: 0,
    divergence: 0,
    curl: 0,
  });

  const [posX, setPosX] = useState(1);
  const [posY, setPosY] = useState(1);
  const [posZ, setPosZ] = useState(0);

  const activeCategory = MODELS[mode];
  const activeFunc = activeCategory.functions[funcIndexes[mode]];

  const handleFuncChange = (e) => {
    setFuncIndexes({ ...funcIndexes, [mode]: Number(e.target.value) });
  };

  return (
    <div className="w-full flex flex-col bg-white rounded-[2rem] border border-gray-200 shadow-xl overflow-hidden min-h-[750px] font-sans">
      {/* 상단 탭 */}
      <div className="flex bg-slate-50 p-4 gap-2 border-b border-gray-200">
        {Object.keys(MODELS).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 py-4 px-4 rounded-xl font-black text-lg transition-all ${
              mode === m
                ? "bg-[#0047a5] text-white shadow-md"
                : "bg-white text-gray-500 hover:bg-blue-50 border border-gray-200"
            }`}
          >
            {MODELS[m].name}
          </button>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row flex-1 p-6 gap-6 bg-slate-50">
        {/* 왼쪽: 제어 패널 */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          {/* 함수 선택 드롭다운 */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="text-[#0047a5] font-black text-xl mb-4">
              수학적 모델 선택
            </h3>
            <select
              value={funcIndexes[mode]}
              onChange={handleFuncChange}
              className="w-full p-3 bg-slate-100 border border-slate-300 rounded-xl font-bold text-gray-700 outline-none focus:border-[#0047a5]"
            >
              {activeCategory.functions.map((f, idx) => (
                <option key={f.id} value={idx}>
                  {f.name}
                </option>
              ))}
            </select>
            <div className="mt-4 p-4 bg-blue-50 text-blue-900 font-mono text-center rounded-xl font-bold border border-blue-100">
              {activeFunc.funcStr}
            </div>
          </div>

          {/* 프로브 위치 제어 */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex-1">
            <h3 className="text-gray-800 font-black text-lg mb-6">
              탐색점(Probe) 좌표
            </h3>

            <div className="space-y-6">
              <div>
                <label className="flex justify-between font-bold text-gray-600 mb-2">
                  <span>X 축</span>{" "}
                  <span className="text-[#0047a5]">{posX.toFixed(1)}</span>
                </label>
                <input
                  type="range"
                  min="-4"
                  max="4"
                  step="0.1"
                  value={posX}
                  onChange={(e) => setPosX(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#0047a5]"
                />
              </div>
              <div>
                <label className="flex justify-between font-bold text-gray-600 mb-2">
                  <span>Y 축</span>{" "}
                  <span className="text-[#0047a5]">{posY.toFixed(1)}</span>
                </label>
                <input
                  type="range"
                  min="-4"
                  max="4"
                  step="0.1"
                  value={posY}
                  onChange={(e) => setPosY(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#0047a5]"
                />
              </div>
              {mode !== "gradient" && (
                <div>
                  <label className="flex justify-between font-bold text-gray-600 mb-2">
                    <span>Z 축</span>{" "}
                    <span className="text-[#0047a5]">{posZ.toFixed(1)}</span>
                  </label>
                  <input
                    type="range"
                    min="-4"
                    max="4"
                    step="0.1"
                    value={posZ}
                    onChange={(e) => setPosZ(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#0047a5]"
                  />
                </div>
              )}
            </div>

            <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm text-gray-600 font-medium leading-relaxed">
              {mode === "gradient" &&
                "🔴 그래디언트는 스칼라 함수(곡면)가 가장 가파르게 변하는 '방향'을 가리키는 벡터입니다. 산을 오를 때 가장 가파른 길을 찾는 것과 같습니다."}
              {mode === "divergence" &&
                "🔵 구체가 커졌다 작아지는 것은 발산(Divergence)을 의미합니다. 원천(Source, +)에서는 밖으로 뿜어내고, 싱크(Sink, -)에서는 빨아들입니다."}
              {mode === "curl" &&
                "🟢 초록색 바람개비는 벡터장의 회전(Curl)을 나타냅니다. 바람개비가 빨리 돌수록 그 지점의 소용돌이 치는 힘이 강함을 의미합니다."}
            </div>
          </div>
        </div>

        {/* 오른쪽: 3D 캔버스 (밝은 배경) */}
        <div className="w-full lg:w-2/3 bg-[#f8fafc] rounded-3xl overflow-hidden relative shadow-inner border border-gray-300 min-h-[400px]">
          <Canvas camera={{ position: [6, 6, 6], fov: 45 }}>
            <color attach="background" args={["#f8fafc"]} />
            <ambientLight intensity={0.7} />
            <directionalLight
              position={[10, 20, 10]}
              intensity={1.5}
              castShadow
            />
            <directionalLight position={[-10, -10, -10]} intensity={0.5} />

            {/* 헬퍼 라인 */}
            <Grid
              args={[10, 10]}
              position={[0, -0.01, 0]}
              cellColor="#cbd5e1"
              sectionColor="#94a3b8"
              fadeDistance={25}
            />
            <axesHelper args={[5]} />

            {/* 필드와 프로브 */}
            <FieldVisualizer mode={mode} activeFunc={activeFunc} />
            <Probe
              mode={mode}
              position={[posX, posY, posZ]}
              activeFunc={activeFunc}
            />

            <OrbitControls makeDefault enableDamping dampingFactor={0.1} />
          </Canvas>

          <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full text-gray-600 font-bold text-xs border border-gray-200 shadow-sm pointer-events-none">
            🖱️ 드래그하여 시점 회전 | 휠로 확대/축소
          </div>
        </div>
      </div>
    </div>
  );
}
