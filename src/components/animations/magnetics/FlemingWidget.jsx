import "katex/dist/katex.min.css";
import { BlockMath, InlineMath } from "react-katex";
import { useMemo, useState } from "react";

/** x=우/좌, y=지면 수직, z=상/하 — 백엔드 fleming_quiz.py 와 동일 축 */
const DIR_OPTIONS = [
  "우",
  "좌",
  "상",
  "하",
  "지면 수직 나옴",
  "지면 수직 들어감",
];

const VEC_BY_LABEL = {
  우: [1, 0, 0],
  좌: [-1, 0, 0],
  상: [0, 0, 1],
  하: [0, 0, -1],
  "지면 수직 나옴": [0, 1, 0],
  "지면 수직 들어감": [0, -1, 0],
};

function cross(a, b) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

function vecNorm2(v) {
  return v[0] * v[0] + v[1] * v[1] + v[2] * v[2];
}

function labelFromForceVec(f) {
  if (vecNorm2(f) < 1e-12) return null;
  for (const name of DIR_OPTIONS) {
    const u = VEC_BY_LABEL[name];
    if (f[0] === u[0] && f[1] === u[1] && f[2] === u[2]) return name;
  }
  return "?";
}

/** 등각 투영: 수평면(x,z) + 수직(y) */
function projectIso(v, scale) {
  const [x, y, z] = v;
  const isoX = (x - y) * (Math.sqrt(3) / 2);
  const isoY = (x + y) * 0.5 - z;
  return { x: isoX * scale, y: isoY * scale };
}

function ArrowDef({ id, color }) {
  return (
    <marker
      id={id}
      markerWidth="10"
      markerHeight="10"
      refX="9"
      refY="3"
      orient="auto"
      markerUnits="strokeWidth"
    >
      <path d="M0,0 L0,6 L9,3 z" fill={color} />
    </marker>
  );
}

function AxisArrow({ ox, oy, vx, vy, color, markerId, strokeWidth = 3 }) {
  const x1 = ox + vx;
  const y1 = oy - vy;
  return (
    <line
      x1={ox}
      y1={oy}
      x2={x1}
      y2={y1}
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      markerEnd={`url(#${markerId})`}
    />
  );
}

/**
 * 플레밍의 왼손 법칙: B(검지), I(중지), F(엄지).
 * 방향은 \\vec{F} \\propto \\vec{I} \\times \\vec{B} 로 계산합니다.
 */
const FlemingWidget = () => {
  const [bLabel, setBLabel] = useState("지면 수직 나옴");
  const [iLabel, setILabel] = useState("우");

  const { fVec, fLabel } = useMemo(() => {
    const b = VEC_BY_LABEL[bLabel];
    const i = VEC_BY_LABEL[iLabel];
    const f = cross(i, b);
    return { fVec: f, fLabel: labelFromForceVec(f) };
  }, [bLabel, iLabel]);

  const scale = 58;
  const ox = 230;
  const oy = 210;

  const bProj = projectIso(VEC_BY_LABEL[bLabel], scale);
  const iProj = projectIso(VEC_BY_LABEL[iLabel], scale);
  const fProj = fLabel ? projectIso(fVec, scale) : { x: 0, y: 0 };

  const lenB = 0.92;
  const lenI = 0.92;
  const lenF = fLabel ? 0.88 : 0;

  return (
    <div className="w-full max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 font-sans shadow-sm">
      <h2 className="mb-1 text-lg font-bold text-slate-800">
        플레밍의 왼손 법칙 (방향)
      </h2>
      <p className="mb-4 text-sm text-slate-600">
        자기장 <InlineMath math="\vec{B}" />(검지)와 전류{" "}
        <InlineMath math="\vec{I}" />(중지) 방향을 고르면, 자기력{" "}
        <InlineMath math="\vec{F}" />(엄지) 방향이{" "}
        <InlineMath math="\vec{F} \propto \vec{I} \times \vec{B}" />에 따라
        갱신됩니다. <InlineMath math="\vec{B} \parallel \vec{I}" />이면{" "}
        <InlineMath math="\vec{F} = \vec{0}" />입니다.
      </p>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch">
        <div className="lg:w-[280px] shrink-0 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-emerald-800">
              자기장 <InlineMath math="\vec{B}" /> 방향 (검지)
            </label>
            <select
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none ring-emerald-500/30 focus:ring-2"
              value={bLabel}
              onChange={(e) => setBLabel(e.target.value)}
            >
              {DIR_OPTIONS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-blue-800">
              전류 <InlineMath math="\vec{I}" /> 방향 (중지)
            </label>
            <select
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none ring-blue-500/30 focus:ring-2"
              value={iLabel}
              onChange={(e) => setILabel(e.target.value)}
            >
              {DIR_OPTIONS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100">
            <p className="text-xs font-semibold text-slate-600">결과 (엄지)</p>
            {fLabel ? (
              <p className="mt-1 text-sm font-medium text-red-800">
                <InlineMath math="\vec{F}" /> 방향: {fLabel}
              </p>
            ) : (
              <p className="mt-1 text-sm font-medium text-slate-600">
                힘 없음:{" "}
                <InlineMath math="\vec{B} \parallel \vec{I}" />
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2 text-[11px]">
            <span className="rounded-md bg-blue-50 px-2 py-1 font-medium text-blue-800">
              중지 → 전류 (I)
            </span>
            <span className="rounded-md bg-emerald-50 px-2 py-1 font-medium text-emerald-800">
              검지 → 자기장 (B)
            </span>
            <span className="rounded-md bg-red-50 px-2 py-1 font-medium text-red-800">
              엄지 → 힘 (F)
            </span>
          </div>
        </div>

        <div className="min-h-[320px] flex-1 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 p-4 ring-1 ring-slate-200/80">
          <p className="mb-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
            등각 투영 (화살표 길이는 방향만 나타냄)
          </p>
          <svg
            viewBox="0 0 460 340"
            className="mx-auto h-auto w-full max-w-md"
            role="img"
            aria-label="플레밍 법칙 B, I, F 방향 시각화"
          >
            <defs>
              <ArrowDef id="mk-b" color="#059669" />
              <ArrowDef id="mk-i" color="#2563eb" />
              <ArrowDef id="mk-f" color="#dc2626" />
            </defs>

            {/* 지면 격자 느낌 */}
            <g opacity="0.35" stroke="#94a3b8" strokeWidth="1">
              <line x1="60" y1="260" x2="400" y2="140" />
              <line x1="100" y1="280" x2="420" y2="170" />
              <line x1="140" y1="300" x2="440" y2="200" />
            </g>
            <text x="72" y="298" className="fill-slate-400 text-[10px]">
              지면(수평)
            </text>

            <AxisArrow
              ox={ox}
              oy={oy}
              vx={bProj.x * lenB}
              vy={bProj.y * lenB}
              color="#059669"
              markerId="mk-b"
            />
            <AxisArrow
              ox={ox}
              oy={oy}
              vx={iProj.x * lenI}
              vy={iProj.y * lenI}
              color="#2563eb"
              markerId="mk-i"
            />
            {fLabel ? (
              <AxisArrow
                ox={ox}
                oy={oy}
                vx={fProj.x * lenF}
                vy={fProj.y * lenF}
                color="#dc2626"
                markerId="mk-f"
                strokeWidth={4}
              />
            ) : (
              <circle cx={ox} cy={oy} r="6" fill="none" stroke="#64748b" strokeWidth="2" strokeDasharray="4 3" />
            )}

            <text x={ox + bProj.x * lenB + 8} y={oy - bProj.y * lenB - 4} className="fill-emerald-700 text-xs font-semibold">
              B
            </text>
            <text x={ox + iProj.x * lenI + 8} y={oy - iProj.y * lenI + 14} className="fill-blue-700 text-xs font-semibold">
              I
            </text>
            {fLabel ? (
              <text x={ox + fProj.x * lenF + 10} y={oy - fProj.y * lenF + 4} className="fill-red-700 text-xs font-semibold">
                F
              </text>
            ) : (
              <text x={ox + 14} y={oy + 22} className="fill-slate-500 text-[11px]">
                F = 0
              </text>
            )}
          </svg>
        </div>
      </div>

      <div className="mt-6 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100">
        <p className="mb-2 text-center text-xs font-semibold text-slate-500">
          벡터식
        </p>
        <BlockMath math={String.raw`\vec{F} = I\,\vec{\ell} \times \vec{B},\quad \vec{\ell} \parallel \vec{I}`} />
      </div>
    </div>
  );
};

export default FlemingWidget;
