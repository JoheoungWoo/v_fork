import { Info, Magnet } from "lucide-react";
import { useState } from "react";

// ==========================================
// 1. 대형 수식 렌더링 컴포넌트
// ==========================================
const BigMathFraction = ({ leftSide, numerator, denominator }) => (
  <div className="flex items-center text-xl lg:text-3xl font-serif text-gray-800 bg-white px-6 py-4 rounded-xl border border-gray-200 shadow-sm w-full justify-center">
    <span className="font-bold text-blue-700 mr-4 italic">{leftSide} = </span>

    <span className="text-xl lg:text-2xl mr-2 italic">
      k<sub>e</sub>
    </span>
    <span className="text-2xl mx-2">·</span>

    <div className="flex flex-col items-center justify-center mx-2">
      <span className="border-b-2 border-gray-500 px-4 pb-1 text-center whitespace-nowrap tracking-widest">
        {numerator}
      </span>
      <span className="px-4 pt-1 text-center whitespace-nowrap italic">
        {denominator}
      </span>
    </div>
  </div>
);

// ==========================================
// 2. 메인 위젯 컴포넌트
// ==========================================
const CoulombsLawWidget = () => {
  // 상태 관리 (초기값 설정)
  const [q1, setQ1] = useState(5); // 전하 1 (+5 µC)
  const [q2, setQ2] = useState(-3); // 전하 2 (-3 µC)
  const [r, setR] = useState(0.2); // 거리 (0.2 m)

  // 물리 상수 및 계산
  const KE = 8.98755; // x 10^9 N·m²/C²

  // F = k * (|q1 * q2| * 10^-12) / r^2
  // => F = (8.98755 * 10^9) * (|q1 * q2| * 10^-12) / r^2
  // => F = (8.98755 * 10^-3 * |q1 * q2|) / r^2
  const forceRaw = (KE * 0.001 * Math.abs(q1 * q2)) / Math.pow(r, 2);
  const force = forceRaw.toFixed(3);

  // 인력/척력 판별
  let forceType = "힘 없음";
  let forceColor = "text-gray-400";
  if (q1 * q2 < 0) {
    forceType = "인력 (서로 끌어당김)";
    forceColor = "text-pink-600";
  } else if (q1 * q2 > 0) {
    forceType = "척력 (서로 밀어냄)";
    forceColor = "text-purple-600";
  }

  // --- SVG 3D 렌더링 로직 ---
  const svgWidth = 400;
  const svgHeight = 250;
  const centerX = svgWidth / 2;
  const centerY = svgHeight / 2 - 20;

  // 시각적 거리 (r=0.1일때 60px, r=1.0일때 160px)
  const visualDistance = 60 + ((r - 0.1) / 0.9) * 120;
  const pos1X = centerX - visualDistance;
  const pos2X = centerX + visualDistance;

  // 시각적 전하 크기 (기본 15px + 전하량에 비례)
  const radius1 = 15 + Math.abs(q1) * 1.5;
  const radius2 = 15 + Math.abs(q2) * 1.5;

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-xl shadow-inner border border-gray-100 overflow-hidden font-sans">
      {/* 헤더 영역 */}
      <div className="bg-[#0f172a] text-white p-5 flex justify-between items-center shrink-0">
        <div>
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <Magnet className="text-blue-400" fill="currentColor" size={24} />
            쿨롱의 법칙 3D 시뮬레이터
          </h3>
          <p className="text-gray-400 mt-1 text-sm">
            두 점전하의 크기($Q$)와 거리($r$)를 조절하여 3차원 공간에서 작용하는
            전기력($F$)을 확인하세요.
          </p>
        </div>
      </div>

      {/* 🌟 2단 분할 레이아웃 🌟 */}
      <div className="flex flex-col xl:flex-row flex-grow p-6 gap-8 items-center justify-center bg-gray-50/50">
        {/* ========================================== */}
        {/* LEFT: 3D 시각화 & 컨트롤 패널 */}
        {/* ========================================== */}
        <div className="flex flex-col items-center w-full xl:w-1/2 max-w-lg space-y-6">
          {/* 3D SVG 시각화 영역 */}
          <div className="relative w-full bg-slate-800 rounded-2xl shadow-xl overflow-hidden border border-slate-700">
            <svg
              width="100%"
              height={svgHeight}
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            >
              <defs>
                {/* 3D 구체 그라데이션 (양전하: 붉은색, 음전하: 푸른색, 중성: 회색) */}
                <radialGradient id="posGradient" cx="30%" cy="30%" r="70%">
                  <stop offset="0%" stopColor="#fca5a5" />
                  <stop offset="100%" stopColor="#b91c1c" />
                </radialGradient>
                <radialGradient id="negGradient" cx="30%" cy="30%" r="70%">
                  <stop offset="0%" stopColor="#93c5fd" />
                  <stop offset="100%" stopColor="#1d4ed8" />
                </radialGradient>
                <radialGradient id="neuGradient" cx="30%" cy="30%" r="70%">
                  <stop offset="0%" stopColor="#d1d5db" />
                  <stop offset="100%" stopColor="#4b5563" />
                </radialGradient>
              </defs>

              {/* 3D 투시도 바닥 (그리드) */}
              <g transform="translate(0, 40)">
                <polygon
                  points="50,150 350,150 400,220 0,220"
                  fill="#1e293b"
                  opacity="0.5"
                />
                <path
                  d="M 100,150 L 50,220 M 150,150 L 125,220 M 200,150 L 200,220 M 250,150 L 275,220 M 300,150 L 350,220"
                  stroke="#334155"
                  strokeWidth="1"
                />
                <line
                  x1="25"
                  y1="185"
                  x2="375"
                  y2="185"
                  stroke="#334155"
                  strokeWidth="1"
                />
              </g>

              {/* 거리 선명 표시 (r) */}
              <line
                x1={pos1X}
                y1={centerY + Math.max(radius1, radius2) + 15}
                x2={pos2X}
                y2={centerY + Math.max(radius1, radius2) + 15}
                stroke="#cbd5e1"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
              <text
                x={centerX}
                y={centerY + Math.max(radius1, radius2) + 30}
                fill="#f8fafc"
                fontSize="12"
                textAnchor="middle"
              >
                거리 r = {r} m
              </text>

              {/* 전하 1 */}
              <circle
                cx={pos1X}
                cy={centerY}
                r={radius1}
                fill={
                  q1 > 0
                    ? "url(#posGradient)"
                    : q1 < 0
                      ? "url(#negGradient)"
                      : "url(#neuGradient)"
                }
                filter="drop-shadow(0px 10px 8px rgba(0,0,0,0.5))"
              />
              <text
                x={pos1X}
                y={centerY + 5}
                fill="white"
                fontSize="16"
                fontWeight="bold"
                textAnchor="middle"
              >
                {q1 > 0 ? "+" : q1 < 0 ? "-" : ""}
              </text>
              <text
                x={pos1X}
                y={centerY - radius1 - 10}
                fill="#cbd5e1"
                fontSize="12"
                textAnchor="middle"
              >
                Q₁: {q1} µC
              </text>

              {/* 전하 2 */}
              <circle
                cx={pos2X}
                cy={centerY}
                r={radius2}
                fill={
                  q2 > 0
                    ? "url(#posGradient)"
                    : q2 < 0
                      ? "url(#negGradient)"
                      : "url(#neuGradient)"
                }
                filter="drop-shadow(0px 10px 8px rgba(0,0,0,0.5))"
              />
              <text
                x={pos2X}
                y={centerY + 5}
                fill="white"
                fontSize="16"
                fontWeight="bold"
                textAnchor="middle"
              >
                {q2 > 0 ? "+" : q2 < 0 ? "-" : ""}
              </text>
              <text
                x={pos2X}
                y={centerY - radius2 - 10}
                fill="#cbd5e1"
                fontSize="12"
                textAnchor="middle"
              >
                Q₂: {q2} µC
              </text>

              {/* 힘(Force) 벡터 화살표 애니메이션/표시 */}
              {q1 !== 0 && q2 !== 0 && (
                <g opacity="0.8">
                  {q1 * q2 < 0 ? (
                    // 인력 (서로를 향함)
                    <>
                      <path
                        d={`M ${pos1X + radius1 + 5} ${centerY} L ${pos1X + radius1 + 30} ${centerY}`}
                        stroke="#ec4899"
                        strokeWidth="4"
                        markerEnd="url(#arrow-pink)"
                      />
                      <path
                        d={`M ${pos2X - radius2 - 5} ${centerY} L ${pos2X - radius2 - 30} ${centerY}`}
                        stroke="#ec4899"
                        strokeWidth="4"
                        markerEnd="url(#arrow-pink)"
                      />
                    </>
                  ) : (
                    // 척력 (바깥으로 향함)
                    <>
                      <path
                        d={`M ${pos1X - radius1 - 5} ${centerY} L ${pos1X - radius1 - 30} ${centerY}`}
                        stroke="#9333ea"
                        strokeWidth="4"
                        markerEnd="url(#arrow-purple)"
                      />
                      <path
                        d={`M ${pos2X + radius2 + 5} ${centerY} L ${pos2X + radius2 + 30} ${centerY}`}
                        stroke="#9333ea"
                        strokeWidth="4"
                        markerEnd="url(#arrow-purple)"
                      />
                    </>
                  )}
                </g>
              )}

              {/* 화살표 머리 정의 */}
              <defs>
                <marker
                  id="arrow-pink"
                  viewBox="0 0 10 10"
                  refX="5"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#ec4899" />
                </marker>
                <marker
                  id="arrow-purple"
                  viewBox="0 0 10 10"
                  refX="5"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#9333ea" />
                </marker>
              </defs>
            </svg>
          </div>

          {/* 슬라이더 컨트롤 패널 */}
          <div className="w-full bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            {/* Q1 슬라이더 */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-bold text-gray-700">
                  전하 1 크기 (Q₁)
                </span>
                <span className="text-sm font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  {q1} µC
                </span>
              </div>
              <input
                type="range"
                min="-10"
                max="10"
                step="1"
                value={q1}
                onChange={(e) => setQ1(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            {/* Q2 슬라이더 */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-bold text-gray-700">
                  전하 2 크기 (Q₂)
                </span>
                <span className="text-sm font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  {q2} µC
                </span>
              </div>
              <input
                type="range"
                min="-10"
                max="10"
                step="1"
                value={q2}
                onChange={(e) => setQ2(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            {/* 거리 r 슬라이더 */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-bold text-gray-700">
                  전하 간 거리 (r)
                </span>
                <span className="text-sm font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  {r} m
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.1"
                value={r}
                onChange={(e) => setR(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* ========================================== */}
        {/* RIGHT: 거대 공식 & 결과값 표시 영역 */}
        {/* ========================================== */}
        <div className="flex flex-col w-full xl:w-1/2 max-w-lg space-y-6">
          {/* 타이틀 */}
          <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex items-start gap-3">
            <Info className="text-indigo-600 shrink-0 mt-0.5" size={20} />
            <p className="text-sm text-indigo-900 leading-relaxed font-medium">
              쿨롱의 법칙에 따라 두 전하 사이에 작용하는{" "}
              <strong className="text-indigo-700">
                힘(F)은 전하량의 곱에 비례하고 거리의 제곱에 반비례
              </strong>
              합니다. 아래 공식을 통해 실시간 변화를 확인하세요.
            </p>
          </div>

          {/* 거대 공식 렌더링 */}
          <BigMathFraction
            leftSide="F"
            numerator="| Q₁ · Q₂ |"
            denominator="r²"
          />

          {/* 실시간 계산 결과 박스 */}
          <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-100 p-4">
              <h4 className="text-base font-bold text-gray-700 text-center">
                실시간 전기력 계산 결과
              </h4>
            </div>
            <div className="p-6 flex flex-col items-center justify-center space-y-4">
              {/* 계산 과정 수치 대입 */}
              <div className="text-gray-500 font-mono text-sm mb-2 bg-gray-50 px-4 py-2 rounded border border-gray-100">
                F = (8.99×10⁹) · |({q1}) · ({q2})|×10⁻¹² / ({r})²
              </div>

              {/* 최종 힘(F) 값 */}
              <div className="text-center">
                <span className="text-sm text-gray-500 font-bold block mb-1">
                  전기력 크기 (F)
                </span>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-5xl lg:text-6xl font-black text-gray-900 tracking-tight">
                    {force}
                  </span>
                  <span className="text-2xl font-bold text-gray-400">N</span>
                </div>
              </div>

              {/* 척력 / 인력 방향 */}
              <div className="mt-4 text-center">
                <span className="text-sm text-gray-500 font-bold block mb-2">
                  힘의 방향
                </span>
                <span
                  className={`text-xl lg:text-2xl font-black px-6 py-2 rounded-full border-2 ${q1 * q2 < 0 ? "bg-pink-50 border-pink-200 text-pink-600" : q1 * q2 > 0 ? "bg-purple-50 border-purple-200 text-purple-600" : "bg-gray-100 border-gray-200 text-gray-500"}`}
                >
                  {forceType}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoulombsLawWidget;
