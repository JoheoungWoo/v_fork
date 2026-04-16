import "katex/dist/katex.min.css";
import { InlineMath } from "react-katex";
import { useState } from "react";

const cx = (r, deg) => Math.cos((deg * Math.PI) / 180) * r;
const cy = (r, deg) => -Math.sin((deg * Math.PI) / 180) * r;

/** Y 결선: 중심 (bx,by), 반지름 r, 꼭짓점 각도 degU, degV, degW (도) */
function StarWindings({ bx, by, r, labels, neutralId, stroke = "#2563eb" }) {
  const pts = [
    { a: 90, L: labels[0] },
    { a: 210, L: labels[1] },
    { a: 330, L: labels[2] },
  ];
  const v = pts.map((p) => ({
    x: bx + cx(r, p.a),
    y: by + cy(r, p.a),
    L: p.L,
  }));
  return (
    <g>
      {v.map((p) => (
        <line
          key={p.L}
          x1={bx}
          y1={by}
          x2={p.x}
          y2={p.y}
          stroke={stroke}
          strokeWidth={2.5}
          strokeLinecap="round"
        />
      ))}
      <circle cx={bx} cy={by} r={5} fill={stroke} />
      <text x={bx} y={by + 22} textAnchor="middle" fill="#64748b" fontSize={11} fontWeight={600}>
        {neutralId}
      </text>
      {v.map((p) => (
        <text
          key={`t-${p.L}`}
          x={p.x + (p.x > bx ? 8 : p.x < bx ? -8 : 0)}
          y={p.y + (p.y < by ? -8 : 10)}
          textAnchor={p.x > bx ? "start" : p.x < bx ? "end" : "middle"}
          fill="#0f172a"
          fontSize={12}
          fontWeight={700}
        >
          {p.L}
        </text>
      ))}
    </g>
  );
}

function DeltaWindings({ bx, by, r, labels, stroke = "#059669" }) {
  const pts = [
    { a: 90, L: labels[0] },
    { a: 210, L: labels[1] },
    { a: 330, L: labels[2] },
  ];
  const v = pts.map((p) => ({
    x: bx + cx(r, p.a),
    y: by + cy(r, p.a),
    L: p.L,
  }));
  const d = `M ${v[0].x} ${v[0].y} L ${v[1].x} ${v[1].y} L ${v[2].x} ${v[2].y} Z`;
  return (
    <g>
      <path d={d} fill="none" stroke={stroke} strokeWidth={2.5} strokeLinejoin="round" />
      {v.map((p) => (
        <text
          key={p.L}
          x={p.x + (p.x > bx ? 10 : p.x < bx ? -10 : 0)}
          y={p.y + (p.y < by ? -10 : 12)}
          textAnchor={p.x > bx ? "start" : p.x < bx ? "end" : "middle"}
          fill="#0f172a"
          fontSize={12}
          fontWeight={700}
        >
          {p.L}
        </text>
      ))}
    </g>
  );
}

function DiagramYY() {
  return (
    <svg viewBox="0 0 560 300" className="h-auto w-full max-w-[560px]" aria-hidden>
      <text x={110} y={28} textAnchor="middle" fill="#475569" fontSize={13} fontWeight={700}>
        1차 (고압)
      </text>
      <text x={450} y={28} textAnchor="middle" fill="#475569" fontSize={13} fontWeight={700}>
        2차 (저압)
      </text>
      <StarWindings bx={110} by={160} r={62} labels={["U1", "V1", "W1"]} neutralId="N1" stroke="#1d4ed8" />
      <StarWindings bx={450} by={160} r={62} labels={["u1", "v1", "w1"]} neutralId="n1" stroke="#0d9488" />
      <line x1={175} y1={160} x2={385} y2={160} stroke="#94a3b8" strokeWidth={2} strokeDasharray="8 6" />
      <rect x={232} y={138} width={96} height={44} rx={8} fill="#f8fafc" stroke="#cbd5e1" />
      <text x={280} y={166} textAnchor="middle" fill="#334155" fontSize={12} fontWeight={700}>
        3상 변압기
      </text>
    </svg>
  );
}

function DiagramDD() {
  return (
    <svg viewBox="0 0 560 300" className="h-auto w-full max-w-[560px]" aria-hidden>
      <text x={110} y={28} textAnchor="middle" fill="#475569" fontSize={13} fontWeight={700}>
        1차 Δ
      </text>
      <text x={450} y={28} textAnchor="middle" fill="#475569" fontSize={13} fontWeight={700}>
        2차 Δ
      </text>
      <DeltaWindings bx={110} by={160} r={58} labels={["U1", "V1", "W1"]} stroke="#1d4ed8" />
      <DeltaWindings bx={450} by={160} r={58} labels={["u1", "v1", "w1"]} stroke="#0d9488" />
      <line x1={175} y1={160} x2={385} y2={160} stroke="#94a3b8" strokeWidth={2} strokeDasharray="8 6" />
      <rect x={232} y={138} width={96} height={44} rx={8} fill="#f8fafc" stroke="#cbd5e1" />
      <text x={280} y={166} textAnchor="middle" fill="#334155" fontSize={12} fontWeight={700}>
        3상 변압기
      </text>
    </svg>
  );
}

function DiagramYD() {
  return (
    <svg viewBox="0 0 560 300" className="h-auto w-full max-w-[560px]" aria-hidden>
      <text x={110} y={28} textAnchor="middle" fill="#475569" fontSize={13} fontWeight={700}>
        1차 Y
      </text>
      <text x={450} y={28} textAnchor="middle" fill="#475569" fontSize={13} fontWeight={700}>
        2차 Δ
      </text>
      <StarWindings bx={110} by={160} r={62} labels={["U1", "V1", "W1"]} neutralId="N1" stroke="#1d4ed8" />
      <DeltaWindings bx={450} by={160} r={58} labels={["u1", "v1", "w1"]} stroke="#0d9488" />
      <line x1={175} y1={160} x2={385} y2={160} stroke="#94a3b8" strokeWidth={2} strokeDasharray="8 6" />
      <rect x={232} y={138} width={96} height={44} rx={8} fill="#f8fafc" stroke="#cbd5e1" />
      <text x={280} y={166} textAnchor="middle" fill="#334155" fontSize={12} fontWeight={700}>
        3상 변압기
      </text>
      <text x={280} y={285} textAnchor="middle" fill="#b45309" fontSize={11} fontWeight={600}>
        선간·상전압 관계와 30° 위상차(절연·보호 결선에 유의)
      </text>
    </svg>
  );
}

/** V결선(개방 Δ): 2대로 3상 공급, 한 변 개방 */
function DiagramV() {
  const y = 150;
  const x1 = 80;
  const x2 = 200;
  const x3 = 320;
  const boxW = 44;
  const boxH = 70;
  return (
    <svg viewBox="0 0 560 320" className="h-auto w-full max-w-[560px]" aria-hidden>
      <text x={280} y={26} textAnchor="middle" fill="#475569" fontSize={13} fontWeight={700}>
        V결선 (개방 Δ) — 단상 변압기 2대
      </text>
      {/* 3개 단자 */}
      <line x1={x1} y1={60} x2={x1} y2={240} stroke="#334155" strokeWidth={3} />
      <line x1={x2} y1={60} x2={x2} y2={240} stroke="#334155" strokeWidth={3} />
      <line x1={x3} y1={60} x2={x3} y2={240} stroke="#334155" strokeWidth={3} />
      <text x={x1} y={52} textAnchor="middle" fontSize={12} fontWeight={700} fill="#0f172a">
        A
      </text>
      <text x={x2} y={52} textAnchor="middle" fontSize={12} fontWeight={700} fill="#0f172a">
        B
      </text>
      <text x={x3} y={52} textAnchor="middle" fontSize={12} fontWeight={700} fill="#0f172a">
        C
      </text>
      {/* 변압기 1: A-B */}
      <rect
        x={(x1 + x2) / 2 - boxW / 2}
        y={y - boxH / 2}
        width={boxW}
        height={boxH}
        rx={6}
        fill="#eff6ff"
        stroke="#2563eb"
        strokeWidth={2}
      />
      <text x={(x1 + x2) / 2} y={y + 4} textAnchor="middle" fontSize={11} fontWeight={700} fill="#1e40af">
        T1
      </text>
      <line x1={x1} y1={y} x2={(x1 + x2) / 2 - boxW / 2} y2={y} stroke="#2563eb" strokeWidth={2} />
      <line x1={(x1 + x2) / 2 + boxW / 2} y1={y} x2={x2} y2={y} stroke="#2563eb" strokeWidth={2} />
      {/* 변압기 2: B-C */}
      <rect
        x={(x2 + x3) / 2 - boxW / 2}
        y={y - boxH / 2}
        width={boxW}
        height={boxH}
        rx={6}
        fill="#ecfdf5"
        stroke="#059669"
        strokeWidth={2}
      />
      <text x={(x2 + x3) / 2} y={y + 4} textAnchor="middle" fontSize={11} fontWeight={700} fill="#047857">
        T2
      </text>
      <line x1={x2} y1={y} x2={(x2 + x3) / 2 - boxW / 2} y2={y} stroke="#059669" strokeWidth={2} />
      <line x1={(x2 + x3) / 2 + boxW / 2} y1={y} x2={x3} y2={y} stroke="#059669" strokeWidth={2} />
      {/* 개방변 C-A */}
      <path
        d={`M ${x3} ${y - 40} L ${x3 + 55} ${y - 40} L ${x1 - 55} ${y - 40} L ${x1} ${y - 40}`}
        fill="none"
        stroke="#f97316"
        strokeWidth={2}
        strokeDasharray="6 5"
      />
      <text x={280} y={y - 48} textAnchor="middle" fill="#c2410c" fontSize={11} fontWeight={700}>
        개방 (3번째 슬러그 없음)
      </text>
      <text x={280} y={288} textAnchor="middle" fill="#64748b" fontSize={11}>
        Δ결선 3대 대비 공급 가능 용량 약 57.7% — 부하 불평형·고조파에 취약할 수 있음
      </text>
    </svg>
  );
}

const MODES = [
  {
    id: "yy",
    label: "Y–Y",
    katex: "Y\\text{–}Y",
    Diagram: DiagramYY,
    body: (
      <>
        1·2차 모두 <strong>별(Y)</strong>로 묶은 결선입니다. 중성선을 끌어내면{" "}
        <strong>4선식</strong>으로 불평형 전류를 처리하기 쉽습니다. 3상 변압기(또는 은행)에서 대칭
        운전 시 중성점 전위가 안정됩니다.
      </>
    ),
  },
  {
    id: "dd",
    label: "Δ–Δ",
    katex: "\\Delta\\text{–}\\Delta",
    Diagram: DiagramDD,
    body: (
      <>
        1·2차 모두 <strong>델타(Δ)</strong>입니다. 제3고조파 환류(제3고조파 전류)가 Δ 내부에서만
        돌 수 있어 <strong>제3고조파 여자</strong>가 와전류에 영향을 주는 경우가 있습니다(설계·해석 시
        유의). 중성선은 없습니다.
      </>
    ),
  },
  {
    id: "yd",
    label: "Y–Δ",
    katex: "Y\\text{–}\\Delta",
    Diagram: DiagramYD,
    body: (
      <>
        고압측 <strong>Y</strong>, 저압측 <strong>Δ</strong> 조합이 흔합니다. 선간·상전압 비와{" "}
        <strong>30° 위상차</strong>가 생겨, 다중 결선 병렬·차단기 동기 시 각도를 맞춰야 합니다. 전기기사
        교재에서 변압기 극성·결선군(시계)과 함께 다룹니다.
      </>
    ),
  },
  {
    id: "v",
    label: "V결선",
    katex: "\\text{V}",
    Diagram: DiagramV,
    body: (
      <>
        <strong>개방 Δ</strong>로, 단상 변압기 <strong>2대</strong>만으로 3선 3상 전압을 만들 수
        있습니다. 3대 Δ에 비해 <strong>설비 용량은 약 57.7%</strong> 수준으로 보는 설명이 일반적입니다.
        임시·소용량 배전 등에서 쓰이며, 특성을 숙지해야 합니다.
      </>
    ),
  },
];

/**
 * 변압기 결선: Y–Y, Δ–Δ, Y–Δ, V결선 개요 및 결선도.
 * DB `lecture_id` 예: `transformer_connection_types`
 */
export default function TransformerConnectionWidget() {
  const [mode, setMode] = useState("yy");
  const active = MODES.find((m) => m.id === mode) ?? MODES[0];
  const D = active.Diagram;

  return (
    <div className="w-full rounded-[14px] border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 shadow-inner md:p-6">
      <div className="mb-4 border-b border-slate-200 pb-3">
        <h3 className="text-lg font-bold text-slate-800">변압기 결선 방식</h3>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">
          <InlineMath math="Y\text{–}Y" />, <InlineMath math="\Delta\text{–}\Delta" />,{" "}
          <InlineMath math="Y\text{–}\Delta" />, <InlineMath math="\text{V}" /> 결선의 형태를 비교합니다.
          (기호·각도는 교재·제조사 도면을 기준으로 하세요.)
        </p>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMode(m.id)}
            className={`rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
              mode === m.id
                ? "border-[#0047a5] bg-[#0047a5] text-white shadow-sm"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <InlineMath math={m.katex} />
          </button>
        ))}
      </div>

      <div className="mb-4 flex justify-center rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <D />
      </div>

      <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4 text-sm leading-relaxed text-slate-700">
        <div className="mb-2 flex flex-wrap items-center gap-2 text-base font-bold text-slate-800">
          <span>선택:</span>
          <InlineMath math={active.katex} />
        </div>
        <p>{active.body}</p>
      </div>
    </div>
  );
}
