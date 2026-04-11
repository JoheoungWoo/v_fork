// src/components/animations/magnetics/VectorCalculus3DWidget.jsx
// widgetData.jsx → "4_vector_calculus" 키에 이미 등록되어 있습니다.
// React Three Fiber + 기존 apiClient 기반 FastAPI 연동

import { Suspense, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Grid } from "@react-three/drei";
import * as THREE from "three";
import { Loader2 } from "lucide-react";
import { useVectorCalc } from "@/hooks/useVectorCalc";

// ──────────────────────────────────────────────────────────────────────────────
// [1] 3D 프리미티브: 화살표
// ──────────────────────────────────────────────────────────────────────────────
function Arrow({ start, dir, color = "#e55a2b", scale = 1 }) {
  const v = new THREE.Vector3(...dir);
  const len = v.length();
  if (len < 0.001) return null;
  v.normalize();

  const shaftLen = Math.min(len, 2.0) * scale;
  const r = 0.04 * scale;
  const q = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    v
  );

  return (
    <group position={start} quaternion={q}>
      <mesh position={[0, shaftLen / 2, 0]}>
        <cylinderGeometry args={[r, r, shaftLen, 8]} />
        <meshPhongMaterial color={color} />
      </mesh>
      <mesh position={[0, shaftLen + r * 3, 0]}>
        <coneGeometry args={[r * 2.5, r * 6, 8]} />
        <meshPhongMaterial color={color} />
      </mesh>
    </group>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// [2] 배경 벡터장 화살표 전체
// ──────────────────────────────────────────────────────────────────────────────
function FieldArrows({ samples }) {
  return (
    <>
      {samples.map((s, i) => (
        <Arrow key={i} start={s.pos} dir={s.vec} color="#94a3b8" scale={0.6} />
      ))}
    </>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// [3] 스칼라 곡면 (Gradient 모드)
// ──────────────────────────────────────────────────────────────────────────────
function ScalarSurface({ meshData }) {
  const geo = useMemo(() => {
    if (!meshData) return null;
    const { positions, segments } = meshData;
    const g = new THREE.BufferGeometry();
    g.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(positions.flat()), 3)
    );
    const idx = [];
    const N = segments;
    for (let row = 0; row < N - 1; row++) {
      for (let col = 0; col < N - 1; col++) {
        const a = row * N + col;
        idx.push(a, a + N, a + 1, a + 1, a + N, a + N + 1);
      }
    }
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  }, [meshData]);

  if (!geo) return null;
  return (
    <mesh geometry={geo}>
      <meshPhongMaterial
        color="#94a3b8"
        transparent
        opacity={0.5}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// [4] 바람개비 (Curl 모드) — curl 벡터 방향을 회전축으로 사용
// ──────────────────────────────────────────────────────────────────────────────
function Windmill({ position, curlVec, curlMag }) {
  const ref = useRef();
  const axis = useMemo(() => {
    const v = new THREE.Vector3(...curlVec);
    return v.lengthSq() > 0.0001 ? v.normalize() : new THREE.Vector3(0, 0, 1);
  }, [curlVec]);

  useFrame(() => {
    if (ref.current) ref.current.rotateOnAxis(axis, curlMag * 0.025);
  });

  return (
    <group position={position} ref={ref}>
      {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((angle, i) => (
        <mesh key={i} rotation={[0, 0, angle]}>
          <boxGeometry args={[1.2, 0.08, 0.08]} />
          <meshPhongMaterial color="#10b981" side={THREE.DoubleSide} />
        </mesh>
      ))}
      <mesh>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshPhongMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// [5] 탐색 프로브 (모드별 렌더링)
// ──────────────────────────────────────────────────────────────────────────────
function Probe({ mode, probe, result }) {
  const { x, y, z } = probe;

  if (mode === "gradient" && result) {
    const fval = result.f_value ?? 0;
    const grad = result.gradient ?? [0, 0];
    return (
      <group>
        <mesh position={[x, fval, -y]}>
          <sphereGeometry args={[0.22, 16, 16]} />
          <meshPhongMaterial color="#fbbf24" />
        </mesh>
        <Arrow
          start={[x, fval, -y]}
          dir={[grad[0] * 0.7, 0, -grad[1] * 0.7]}
          color="#ef4444"
          scale={1.3}
        />
      </group>
    );
  }

  if (mode === "divergence" && result) {
    const div = result.divergence ?? 0;
    const color =
      div > 0.01 ? "#ef4444" : div < -0.01 ? "#3b82f6" : "#94a3b8";
    const dirs = [
      [1, 0, 0], [-1, 0, 0], [0, 1, 0],
      [0, -1, 0], [0, 0, 1], [0, 0, -1],
    ];
    return (
      <group>
        <mesh position={[x, y, z]}>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshPhongMaterial color={color} transparent opacity={0.35} />
        </mesh>
        <mesh position={[x, y, z]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshPhongMaterial color="#ffffff" />
        </mesh>
        {dirs.map((d, i) => {
          const s = Math.abs(div) * 0.18;
          const start = [x + d[0] * 0.55, y + d[1] * 0.55, z + d[2] * 0.55];
          const dir   = div >= 0 ? d.map((v) => v * s * 3) : d.map((v) => -v * s * 3);
          return <Arrow key={i} start={start} dir={dir} color={color} scale={0.8} />;
        })}
      </group>
    );
  }

  if (mode === "curl" && result) {
    const curl    = result.curl    ?? [0, 0, 0];
    const curlMag = result.curl_mag ?? 0;
    const vec     = result.vector  ?? [0, 0, 0];
    return (
      <group>
        <Windmill position={[x, y, z]} curlVec={curl} curlMag={curlMag} />
        {/* 초록: ∇×A 벡터, 보라: A 벡터 */}
        <Arrow start={[x, y, z]} dir={curl.map((v) => v * 0.5)} color="#10b981" scale={1.2} />
        <Arrow start={[x, y, z]} dir={vec.map((v) => v * 0.7)}  color="#6366f1" scale={0.9} />
      </group>
    );
  }

  // 결과 대기 중
  return (
    <mesh position={mode === "gradient" ? [x, 0, -y] : [x, y, z]}>
      <sphereGeometry args={[0.18, 16, 16]} />
      <meshPhongMaterial color="#fbbf24" transparent opacity={0.5} />
    </mesh>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// [6] Three.js 씬
// ──────────────────────────────────────────────────────────────────────────────
function Scene({ mode, probe, result, fieldSamples, surfaceMesh }) {
  return (
    <Canvas camera={{ position: [10, 8, 10], fov: 45 }}>
      <color attach="background" args={["#f8fafc"]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 20, 10]} intensity={1.2} />
      <directionalLight position={[-10, -10, -10]} intensity={0.3} />
      <Grid args={[10, 10]} cellColor="#cbd5e1" sectionColor="#94a3b8" fadeDistance={30} />
      <axesHelper args={[6]} />

      {fieldSamples.length > 0 && <FieldArrows samples={fieldSamples} />}
      {mode === "gradient" && surfaceMesh && <ScalarSurface meshData={surfaceMesh} />}
      <Probe mode={mode} probe={probe} result={result} />

      <OrbitControls makeDefault enableDamping dampingFactor={0.08} />
    </Canvas>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// [7] 수치 결과 패널
// ──────────────────────────────────────────────────────────────────────────────
const MODE_COLOR = { gradient: "#e55a2b", divergence: "#3b82f6", curl: "#10b981" };

function ResultPanel({ mode, result, loading, error }) {
  const color = MODE_COLOR[mode];

  const Badge = ({ label, value }) => (
    <div className="flex justify-between items-center px-3 py-2 bg-gray-50 rounded-lg text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-mono font-bold">
        {typeof value === "number" ? value.toFixed(4) : value}
      </span>
    </div>
  );

  const VecBadge = ({ label, vec, c }) => (
    <div className="px-3 py-2 bg-gray-50 rounded-lg text-sm">
      <div className="text-gray-500 mb-1">{label}</div>
      <div className="font-mono font-bold" style={{ color: c }}>
        ({vec.map((v) => v.toFixed(4)).join(", ")})
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="bg-white border border-gray-200 rounded-2xl p-4">
        <p className="text-xs text-gray-400 mb-3">
          수치 결과 <span className="text-gray-300">/ Python 중심차분법 h=1e-5</span>
        </p>

        {loading && (
          <div className="flex items-center gap-2 text-sm text-gray-400 py-2">
            <Loader2 size={14} className="animate-spin" /> 계산 중...
          </div>
        )}
        {error && (
          <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
        )}

        {!loading && !error && result && (
          <div className="flex flex-col gap-2">
            {mode === "gradient" && (
              <>
                <Badge label="f(x,y)" value={result.f_value} />
                <VecBadge label="∇f (기울기)" vec={result.gradient} c={color} />
                <Badge label="|∇f|" value={result.gradient_mag} />
              </>
            )}
            {mode === "divergence" && (
              <>
                <VecBadge label="A" vec={result.vector} c={color} />
                <Badge label="∂Ax/∂x" value={result.partials?.dFx_dx} />
                <Badge label="∂Ay/∂y" value={result.partials?.dFy_dy} />
                <Badge label="∂Az/∂z" value={result.partials?.dFz_dz} />
                <Badge
                  label="div A"
                  value={`${result.divergence?.toFixed(4)}  ${
                    result.divergence > 0.01 ? "▲ 원천" :
                    result.divergence < -0.01 ? "▼ 싱크" : "● 비압축"
                  }`}
                />
              </>
            )}
            {mode === "curl" && (
              <>
                <VecBadge label="A" vec={result.vector} c="#6366f1" />
                <VecBadge label="∇×A (curl)" vec={result.curl} c={color} />
                <Badge label="|∇×A|" value={result.curl_mag} />
              </>
            )}
            <pre className="text-xs font-mono text-gray-400 bg-gray-50 px-3 py-2 rounded-lg whitespace-pre-wrap leading-relaxed mt-1">
              {result.formula_detail}
            </pre>
          </div>
        )}

        {!loading && !error && !result && (
          <p className="text-sm text-gray-400 py-2">슬라이더를 움직이면 계산됩니다.</p>
        )}
      </div>

      {/* 개념 힌트 */}
      <div className="px-4 py-3 bg-blue-50 rounded-xl text-xs text-blue-700 leading-relaxed">
        {mode === "gradient" && "∇f : 스칼라 f(x,y)가 가장 빠르게 증가하는 방향. 빨간 화살표 방향으로 이동하면 f값 최대 증가."}
        {mode === "divergence" && "∇·A = ∂Ax/∂x + ∂Ay/∂y + ∂Az/∂z\ndiv>0: 원천  /  div<0: 싱크  /  div=0: 비압축성"}
        {mode === "curl" && "바람개비 회전축 = ∇×A 벡터 방향, 속도 ∝ 크기\n초록 화살표: ∇×A  /  보라 화살표: A 벡터"}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// [8] 메인 위젯 (widgetData.jsx "4_vector_calculus" 에서 lazy import)
// ──────────────────────────────────────────────────────────────────────────────
const MODES = [
  { id: "gradient",   label: "기울기 ∇f" },
  { id: "divergence", label: "발산 ∇·A" },
  { id: "curl",       label: "회전 ∇×A" },
];

export default function VectorCalculus3DWidget() {
  const calc = useVectorCalc();

  if (!calc.fieldLists) {
    return (
      <div className="flex flex-1 items-center justify-center h-96">
        <Loader2 className="animate-spin text-[#0047a5]" size={40} />
      </div>
    );
  }

  const fields = calc.fieldLists[calc.mode] ?? [];

  return (
    <div className="w-full flex flex-col gap-0 font-body">
      {/* 상단 모드 탭 */}
      <div className="flex gap-2 mb-4">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => calc.changeMode(m.id)}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-base transition-all ${
              calc.mode === m.id
                ? "bg-[#0047a5] text-white shadow"
                : "bg-gray-100 text-gray-500 hover:bg-blue-50 border border-gray-200"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* ── 왼쪽 패널 ─────────────────────────────────────────────────────── */}
        <div className="w-full lg:w-72 flex flex-col gap-4 flex-shrink-0">
          {/* 모델 선택 */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4">
            <p className="text-sm font-bold text-gray-500 mb-3">수학적 모델</p>
            <select
              value={calc.selectedId ?? ""}
              onChange={(e) => calc.changeField(e.target.value)}
              className="w-full p-2 border border-gray-200 rounded-xl text-sm bg-gray-50"
            >
              {fields.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
            {calc.currentFieldMeta && (
              <pre className="mt-3 text-xs font-mono text-gray-500 bg-gray-50 px-3 py-2 rounded-xl whitespace-pre-wrap leading-relaxed">
                {calc.currentFieldMeta.formula}
              </pre>
            )}
            {calc.samplesLoading && (
              <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                <Loader2 size={10} className="animate-spin" /> 장 데이터 로드 중...
              </p>
            )}
          </div>

          {/* 슬라이더 */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4">
            <p className="text-sm font-bold text-gray-500 mb-4">탐색점 (Probe)</p>
            {["x", "y", ...(calc.mode !== "gradient" ? ["z"] : [])].map((axis) => (
              <div key={axis} className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">{axis.toUpperCase()} 축</span>
                  <span className="font-mono font-bold text-[#0047a5]">
                    {calc.probe[axis].toFixed(1)}
                  </span>
                </div>
                <input
                  type="range" min="-4" max="4" step="0.1"
                  value={calc.probe[axis]}
                  onChange={(e) => calc.updateProbe(axis, parseFloat(e.target.value))}
                  className="w-full accent-[#0047a5]"
                />
              </div>
            ))}
          </div>

          {/* 수치 결과 */}
          <ResultPanel
            mode={calc.mode}
            result={calc.result}
            loading={calc.loading}
            error={calc.error}
          />
        </div>

        {/* ── 3D 뷰어 ──────────────────────────────────────────────────────── */}
        <div className="flex-1 rounded-3xl overflow-hidden relative border border-gray-200 shadow-inner min-h-[480px]">
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-full min-h-[480px]">
                <Loader2 className="animate-spin text-[#0047a5]" size={36} />
              </div>
            }
          >
            <Scene
              mode={calc.mode}
              probe={calc.probe}
              result={calc.result}
              fieldSamples={calc.fieldSamples}
              surfaceMesh={calc.surfaceMesh}
            />
          </Suspense>
          <div className="absolute top-3 right-4 text-xs text-gray-400 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full pointer-events-none">
            드래그: 회전 &nbsp;|&nbsp; 휠: 확대
          </div>
        </div>
      </div>
    </div>
  );
}
