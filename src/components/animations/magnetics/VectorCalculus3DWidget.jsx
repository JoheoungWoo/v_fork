// src/components/animations/magnetics/VectorCalculus3DWidget.jsx
import { useVectorCalc } from "@/hooks/useVectorCalc";
import { Grid, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Loader2, Move3D, RotateCcw as RotateIcon, Waves } from "lucide-react";
import { Suspense, useCallback, useMemo, useRef } from "react";
import * as THREE from "three";
import VectorCalcQuiz from "./VectorCalcQuiz";

// ──────────────────────────────────────────────────────────────────────────────
// 3D 오브젝트
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
    v,
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

function FieldArrows({ samples }) {
  return (
    <>
      {samples.map((s, i) => (
        <Arrow key={i} start={s.pos} dir={s.vec} color="#64748b" scale={0.6} />
      ))}
    </>
  );
}

function ScalarSurface({ meshData }) {
  const geo = useMemo(() => {
    if (!meshData) return null;
    const { positions, segments } = meshData;
    const g = new THREE.BufferGeometry();
    g.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(positions.flat()), 3),
    );
    const idx = [];
    const N = segments;
    for (let row = 0; row < N - 1; row++)
      for (let col = 0; col < N - 1; col++) {
        const a = row * N + col;
        idx.push(a, a + N, a + 1, a + 1, a + N, a + N + 1);
      }
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  }, [meshData]);
  if (!geo) return null;
  return (
    <mesh geometry={geo}>
      <meshPhongMaterial
        color="#6366f1"
        transparent
        opacity={0.35}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

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
        <meshPhongMaterial color="#fff" />
      </mesh>
    </group>
  );
}

function Probe({ mode, probe, result }) {
  const { x, y, z } = probe;
  if (mode === "gradient" && result) {
    const fval = result.f_value ?? 0;
    const grad = result.gradient ?? [0, 0];
    return (
      <group>
        <mesh position={[x, fval, -y]}>
          <sphereGeometry args={[0.25, 24, 24]} />
          <meshPhongMaterial
            color="#f59e0b"
            emissive="#f59e0b"
            emissiveIntensity={0.3}
          />
        </mesh>
        <Arrow
          start={[x, fval, -y]}
          dir={[grad[0] * 0.7, 0, -grad[1] * 0.7]}
          color="#ef4444"
          scale={1.4}
        />
      </group>
    );
  }
  if (mode === "divergence" && result) {
    const div = result.divergence ?? 0;
    const color = div > 0.01 ? "#ef4444" : div < -0.01 ? "#3b82f6" : "#94a3b8";
    const dirs = [
      [1, 0, 0],
      [-1, 0, 0],
      [0, 1, 0],
      [0, -1, 0],
      [0, 0, 1],
      [0, 0, -1],
    ];
    return (
      <group>
        <mesh position={[x, y, z]}>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshPhongMaterial
            color={color}
            transparent
            opacity={0.3}
            emissive={color}
            emissiveIntensity={0.2}
          />
        </mesh>
        <mesh position={[x, y, z]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshPhongMaterial color="#fff" />
        </mesh>
        {dirs.map((d, i) => {
          const s = Math.abs(div) * 0.18;
          const start = [x + d[0] * 0.55, y + d[1] * 0.55, z + d[2] * 0.55];
          const dir =
            div >= 0 ? d.map((v) => v * s * 3) : d.map((v) => -v * s * 3);
          return (
            <Arrow key={i} start={start} dir={dir} color={color} scale={0.8} />
          );
        })}
      </group>
    );
  }
  if (mode === "curl" && result) {
    const curl = result.curl ?? [0, 0, 0];
    const curlMag = result.curl_mag ?? 0;
    const vec = result.vector ?? [0, 0, 0];
    return (
      <group>
        <Windmill position={[x, y, z]} curlVec={curl} curlMag={curlMag} />
        <Arrow
          start={[x, y, z]}
          dir={curl.map((v) => v * 0.5)}
          color="#10b981"
          scale={1.2}
        />
        <Arrow
          start={[x, y, z]}
          dir={vec.map((v) => v * 0.7)}
          color="#6366f1"
          scale={0.9}
        />
      </group>
    );
  }
  return (
    <mesh position={mode === "gradient" ? [x, 0, -y] : [x, y, z]}>
      <sphereGeometry args={[0.2, 16, 16]} />
      <meshPhongMaterial color="#f59e0b" transparent opacity={0.6} />
    </mesh>
  );
}

function Scene({ mode, probe, result, fieldSamples, surfaceMesh }) {
  return (
    <Canvas camera={{ position: [11, 9, 11], fov: 42 }}>
      <color attach="background" args={["#0f172a"]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 20, 10]} intensity={1.5} />
      <directionalLight
        position={[-8, -8, -8]}
        intensity={0.4}
        color="#6366f1"
      />
      <pointLight position={[0, 6, 0]} intensity={0.8} color="#3b82f6" />
      <Grid
        args={[12, 12]}
        cellColor="#1e3a5f"
        sectionColor="#2563eb"
        sectionThickness={1}
        fadeDistance={28}
        position={[0, -0.01, 0]}
      />
      <axesHelper args={[5]} />
      {fieldSamples.length > 0 && <FieldArrows samples={fieldSamples} />}
      {mode === "gradient" && surfaceMesh && (
        <ScalarSurface meshData={surfaceMesh} />
      )}
      <Probe mode={mode} probe={probe} result={result} />
      <OrbitControls makeDefault enableDamping dampingFactor={0.07} />
    </Canvas>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// 모드 설정
// ──────────────────────────────────────────────────────────────────────────────
const MODES = [
  {
    id: "gradient",
    label: "기울기",
    math: "∇f",
    icon: Move3D,
    desc: "스칼라장이 가장 빠르게 증가하는 방향",
    accent: "#f97316",
    bg: "from-orange-500 to-amber-500",
    light: "bg-orange-50 text-orange-700 border-orange-200",
    active:
      "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-200",
  },
  {
    id: "divergence",
    label: "발산",
    math: "∇·A",
    icon: Waves,
    desc: "벡터장의 퍼짐(원천) 또는 수렴(싱크) 정도",
    accent: "#3b82f6",
    bg: "from-blue-500 to-indigo-500",
    light: "bg-blue-50 text-blue-700 border-blue-200",
    active:
      "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-200",
  },
  {
    id: "curl",
    label: "회전",
    math: "∇×A",
    icon: RotateIcon,
    desc: "벡터장의 소용돌이 세기와 방향",
    accent: "#10b981",
    bg: "from-emerald-500 to-teal-500",
    light: "bg-emerald-50 text-emerald-700 border-emerald-200",
    active:
      "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-200",
  },
];

// ──────────────────────────────────────────────────────────────────────────────
// 수치 결과 패널
// ──────────────────────────────────────────────────────────────────────────────
function ResultPanel({ mode, result, loading }) {
  const modeConf = MODES.find((m) => m.id === mode);

  const NumRow = ({ label, value }) => (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-sm font-semibold text-gray-500">{label}</span>
      <span className="text-sm font-bold font-mono text-gray-800">
        {typeof value === "number" ? value.toFixed(4) : value}
      </span>
    </div>
  );

  const VecRow = ({ label, vec, color }) => (
    <div className="py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-sm font-semibold text-gray-500 block mb-1">
        {label}
      </span>
      <span className="text-base font-bold font-mono" style={{ color }}>
        ({vec.map((v) => v.toFixed(3)).join(",  ")})
      </span>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* 헤더 */}
      <div
        className={`px-5 py-3 bg-gradient-to-r ${modeConf?.bg} flex items-center gap-2`}
      >
        <span className="text-white text-sm font-bold">수치 결과</span>
        <span className="text-white/70 text-xs ml-auto">
          Python 중심차분법 h=1e-5
        </span>
      </div>
      <div className="px-5 py-2">
        {loading && (
          <div className="flex items-center gap-2 py-4 text-gray-400 text-sm">
            <Loader2 size={14} className="animate-spin" /> 계산 중...
          </div>
        )}
        {!loading && result && (
          <>
            {mode === "gradient" && (
              <>
                <NumRow label="f(x, y)" value={result.f_value} />
                <VecRow
                  label="∇f  기울기 벡터"
                  vec={result.gradient}
                  color={modeConf.accent}
                />
                <NumRow label="|∇f|  크기" value={result.gradient_mag} />
              </>
            )}
            {mode === "divergence" && (
              <>
                <VecRow
                  label="A  벡터값"
                  vec={result.vector}
                  color={modeConf.accent}
                />
                <NumRow label="∂Ax/∂x" value={result.partials?.dFx_dx} />
                <NumRow label="∂Ay/∂y" value={result.partials?.dFy_dy} />
                <NumRow label="∂Az/∂z" value={result.partials?.dFz_dz} />
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-sm font-semibold text-gray-500">
                    div A
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold font-mono text-gray-800">
                      {result.divergence?.toFixed(4)}
                    </span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        result.divergence > 0.01
                          ? "bg-red-100 text-red-600"
                          : result.divergence < -0.01
                            ? "bg-blue-100 text-blue-600"
                            : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {result.divergence > 0.01
                        ? "▲ 원천"
                        : result.divergence < -0.01
                          ? "▼ 싱크"
                          : "● 비압축"}
                    </span>
                  </div>
                </div>
              </>
            )}
            {mode === "curl" && (
              <>
                <VecRow label="A  벡터값" vec={result.vector} color="#6366f1" />
                <VecRow
                  label="∇×A  회전 벡터"
                  vec={result.curl}
                  color={modeConf.accent}
                />
                <NumRow label="|∇×A|  회전 세기" value={result.curl_mag} />
              </>
            )}
          </>
        )}
        {!loading && !result && (
          <p className="text-sm text-gray-400 py-4 text-center">
            슬라이더를 움직이면 계산됩니다
          </p>
        )}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// 슬라이더 커스텀 스타일
// ──────────────────────────────────────────────────────────────────────────────
const AXIS_COLOR = { x: "#ef4444", y: "#22c55e", z: "#3b82f6" };

function ProbeSlider({ axis, value, onChange }) {
  return (
    <div className="mb-5 last:mb-0">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ background: AXIS_COLOR[axis] }}
          />
          <span className="text-sm font-bold text-gray-700">
            {axis.toUpperCase()} 축
          </span>
        </div>
        <span
          className="text-base font-black font-mono"
          style={{ color: AXIS_COLOR[axis] }}
        >
          {value.toFixed(1)}
        </span>
      </div>
      <input
        type="range"
        min="-4"
        max="4"
        step="0.1"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer"
        style={{ accentColor: AXIS_COLOR[axis] }}
      />
      <div className="flex justify-between text-xs text-gray-300 mt-1 px-0.5">
        <span>-4</span>
        <span>0</span>
        <span>4</span>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// 메인 위젯
// ──────────────────────────────────────────────────────────────────────────────
export default function VectorCalculus3DWidget() {
  const calc = useVectorCalc();

  const handleQuizProbe = useCallback(
    (probe, field_id, topic) => {
      if (topic && topic !== calc.mode) calc.changeMode(topic);
      if (field_id && calc.fieldLists) {
        const list = calc.fieldLists[topic] ?? [];
        if (list.find((f) => f.id === field_id)) calc.changeField(field_id);
      }
      if (probe) {
        ["x", "y", "z"].forEach((axis) => {
          if (probe[axis] !== undefined) calc.updateProbe(axis, probe[axis]);
        });
      }
    },
    [calc],
  );

  if (!calc.fieldLists) {
    return (
      <div className="flex flex-1 items-center justify-center h-96">
        <Loader2 className="animate-spin text-[#0047a5]" size={48} />
      </div>
    );
  }

  const fields = calc.fieldLists[calc.mode] ?? [];
  const modeCfg = MODES.find((m) => m.id === calc.mode);

  return (
    <div className="w-full flex flex-col gap-8 font-body">
      {/* ══════════════════════════════════════════════════════════════════════
          모드 탭 — 크고 명확하게
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-3 gap-3">
        {MODES.map((m) => {
          const Icon = m.icon;
          const active = calc.mode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => calc.changeMode(m.id)}
              className={`
                relative flex flex-col items-center py-4 px-3 rounded-2xl
                font-bold text-base transition-all duration-200
                ${active ? m.active : "bg-white border-2 border-gray-100 text-gray-400 hover:border-gray-300 hover:text-gray-600"}
              `}
            >
              <Icon
                size={22}
                className="mb-1.5"
                strokeWidth={active ? 2.5 : 2}
              />
              <span className="text-lg font-black">{m.label}</span>
              <span
                className={`text-sm font-bold mt-0.5 ${active ? "text-white/80" : "text-gray-400"}`}
              >
                {m.math}
              </span>
              {active && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1.5 rounded-full bg-white/50" />
              )}
            </button>
          );
        })}
      </div>

      {/* 모드 설명 */}
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${modeCfg.light}`}
      >
        <div
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ background: modeCfg.accent }}
        />
        <p className="text-sm font-semibold">{modeCfg.desc}</p>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          3D 뷰어 + 컨트롤
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col xl:flex-row gap-5">
        {/* 왼쪽 컨트롤 패널 */}
        <div className="xl:w-72 flex-shrink-0 flex flex-col gap-4">
          {/* 모델 선택 */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-base font-black text-gray-700 mb-3">
              📐 수학적 모델
            </p>
            <select
              value={calc.selectedId ?? ""}
              onChange={(e) => calc.changeField(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-100
                         text-sm font-bold text-gray-700 bg-gray-50
                         focus:outline-none focus:border-[#0047a5] transition-colors"
            >
              {fields.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>

            {calc.currentFieldMeta && (
              <div className="mt-3 px-4 py-3 bg-gray-900 rounded-xl">
                <pre className="text-xs font-mono text-emerald-400 whitespace-pre-wrap leading-relaxed">
                  {calc.currentFieldMeta.formula}
                </pre>
              </div>
            )}

            {calc.samplesLoading && (
              <p className="mt-2 text-xs text-gray-400 flex items-center gap-1.5">
                <Loader2 size={11} className="animate-spin" /> 장 데이터 계산
                중...
              </p>
            )}
          </div>

          {/* 탐색점 슬라이더 */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-base font-black text-gray-700 mb-4">
              🎯 탐색점 좌표
            </p>
            {["x", "y", ...(calc.mode !== "gradient" ? ["z"] : [])].map(
              (axis) => (
                <ProbeSlider
                  key={axis}
                  axis={axis}
                  value={calc.probe[axis]}
                  onChange={(v) => calc.updateProbe(axis, v)}
                />
              ),
            )}
          </div>

          {/* 수치 결과 */}
          <ResultPanel
            mode={calc.mode}
            result={calc.result}
            loading={calc.loading}
          />
        </div>

        {/* 3D 뷰어 */}
        <div
          className="flex-1 rounded-2xl overflow-hidden relative shadow-xl min-h-[480px]"
          style={{ background: "#0f172a" }}
        >
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-full min-h-[480px]">
                <Loader2 className="animate-spin text-blue-400" size={40} />
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

          {/* 범례 */}
          <div className="absolute top-4 left-4 flex flex-col gap-1.5 pointer-events-none">
            {calc.mode === "gradient" && (
              <>
                <LegendDot color="#f59e0b" label="탐색점" />
                <LegendDot color="#ef4444" label="∇f  기울기" />
              </>
            )}
            {calc.mode === "divergence" && (
              <>
                <LegendDot color="#ef4444" label="원천 (div > 0)" />
                <LegendDot color="#3b82f6" label="싱크 (div < 0)" />
              </>
            )}
            {calc.mode === "curl" && (
              <>
                <LegendDot color="#10b981" label="∇×A  회전" />
                <LegendDot color="#6366f1" label="A  벡터" />
              </>
            )}
          </div>

          {/* 조작 힌트 */}
          <div className="absolute bottom-4 right-4 pointer-events-none">
            <div
              className="px-3 py-1.5 rounded-full text-xs font-bold text-white/60
                            bg-white/10 backdrop-blur-sm border border-white/10"
            >
              드래그 회전 &nbsp;·&nbsp; 휠 확대
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          퀴즈 구분선
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="relative flex items-center gap-4 py-2">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-200 shadow-sm">
          <span className="text-lg">🧩</span>
          <span className="text-base font-black text-gray-600">실전 퀴즈</span>
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
      </div>

      {/* 퀴즈 */}
      <VectorCalcQuiz onProbeUpdate={handleQuizProbe} />
    </div>
  );
}

// 범례 점
function LegendDot({ color, label }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-3 h-3 rounded-full flex-shrink-0"
        style={{ background: color }}
      />
      <span className="text-xs font-bold text-white/70">{label}</span>
    </div>
  );
}
