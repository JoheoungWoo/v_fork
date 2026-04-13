import "katex/dist/katex.min.css";
import { useEffect, useState } from "react";
import { BlockMath, InlineMath } from "react-katex";

/**
 * 전기기기 - Y-Y 결선 3D 네온 시뮬레이터
 * DB lecture_id: 'transformer_connection_types'
 * 3상 교류의 120도 위상차, 평형/불평형 시 중성선(N) 전류 흐름 시각화
 */
export default function NeonYYTransformerWidget() {
  const [frequency, setFrequency] = useState(1);
  const [showNeutral, setShowNeutral] = useState(true);
  const [isUnbalanced, setIsUnbalanced] = useState(false);
  const [time, setTime] = useState(0);

  // 실시간 애니메이션 루프 (requestAnimationFrame)
  useEffect(() => {
    let animationFrameId;
    const animate = () => {
      // 주파수에 따라 시간이 흐르는 속도 조절
      setTime((prevTime) => prevTime + frequency * 0.03);
      animationFrameId = requestAnimationFrame(animate);
    };
    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [frequency]);

  // 3상 교류 위상각 (라디안)
  const phaseU = time;
  const phaseV = time - (2 * Math.PI) / 3; // -120도
  const phaseW = time - (4 * Math.PI) / 3; // -240도

  // 진폭 (불평형 시 U상의 진폭을 1.8배로 키움)
  const ampU = isUnbalanced ? 1.8 : 1.0;
  const ampV = 1.0;
  const ampW = 1.0;

  // 실시간 전류값 계산
  const iU = ampU * Math.sin(phaseU);
  const iV = ampV * Math.sin(phaseV);
  const iW = ampW * Math.sin(phaseW);
  // 중성선 전류 (키르히호프의 전류 법칙: In = Iu + Iv + Iw)
  const iN = iU + iV + iW;

  // 색상 정의 (네온)
  const colors = {
    U: "#ec4899", // Pink
    V: "#06b6d4", // Cyan
    W: "#eab308", // Yellow
    N: "#f8fafc", // White
  };

  // 실시간 오실로스코프 파형 생성기
  const generateWavePath = (phaseOffset, amplitude) => {
    let d = "";
    const steps = 100;
    const width = 600;
    const centerY = 50;
    for (let i = 0; i <= steps; i++) {
      const x = (i / steps) * width;
      // 그래프의 x축을 따라 파동이 흐르도록 계산
      const waveX = (i / steps) * 4 * Math.PI;
      const y = centerY - amplitude * Math.sin(waveX - time + phaseOffset) * 25;
      if (i === 0) d += `M ${x} ${y} `;
      else d += `L ${x} ${y} `;
    }
    return d;
  };

  // 투명도(Opacity) 계산: 전류 크기에 따라 빛의 밝기가 변함
  const getGlowOpacity = (currentVal) => 0.2 + Math.abs(currentVal) * 0.8;

  return (
    <div className="w-full rounded-2xl border border-slate-800 bg-[#020617] p-5 shadow-2xl md:p-8 font-sans relative overflow-hidden">
      {/* 배경 장식 (Glow effect) */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 blur-[120px] rounded-full pointer-events-none"></div>

      {/* 헤더 */}
      <div className="relative z-10 mb-6 border-b border-slate-800 pb-4">
        <h3 className="text-2xl font-black tracking-tight text-white drop-shadow-md">
          Y-Y 결선{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
            다이내믹 시뮬레이터
          </span>
        </h3>
        <p className="mt-2 text-sm text-slate-400 leading-relaxed">
          120도의 위상차를 가진 3상 교류(
          <InlineMath math="U, V, W" />
          )의 흐름과 중성선(
          <InlineMath math="N" />
          )의 역할을 확인하세요.
          <strong className="text-orange-400 ml-1">불평형 모드</strong>를 켜면
          중성선의 빛이 살아납니다.
        </p>
      </div>

      {/* 컨트롤 패널 */}
      <div className="relative z-10 flex flex-wrap items-center gap-4 mb-6 p-4 rounded-xl bg-slate-900/60 border border-slate-700 backdrop-blur-md">
        <div className="flex-1 min-w-[200px]">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
            교류 주파수 (Hz)
          </label>
          <input
            type="range"
            min="0.1"
            max="3"
            step="0.1"
            value={frequency}
            onChange={(e) => setFrequency(parseFloat(e.target.value))}
            className="w-full accent-blue-500"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowNeutral(!showNeutral)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              showNeutral
                ? "bg-slate-700 text-white shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                : "bg-transparent text-slate-500 border border-slate-700"
            }`}
          >
            중성선 {showNeutral ? "켜짐" : "꺼짐"}
          </button>
          <button
            onClick={() => setIsUnbalanced(!isUnbalanced)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              isUnbalanced
                ? "bg-orange-500/20 text-orange-400 border border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.3)]"
                : "bg-transparent text-slate-500 border border-slate-700 hover:text-slate-300"
            }`}
          >
            부하 불평형 {isUnbalanced ? "ON" : "OFF"}
          </button>
        </div>
      </div>

      {/* 메인 결선도 (SVG) */}
      <div className="relative z-10 mb-6 rounded-2xl border border-slate-800 bg-[#0b1120]/80 p-4 shadow-inner backdrop-blur-xl">
        <svg
          viewBox="0 0 600 280"
          className="w-full h-auto max-w-[800px] mx-auto"
        >
          <defs>
            {/* 네온 필터 정의 */}
            {Object.entries(colors).map(([key, color]) => (
              <filter
                id={`neon-${key}`}
                key={key}
                x="-50%"
                y="-50%"
                width="200%"
                height="200%"
              >
                <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            ))}
          </defs>

          {/* 중앙 점선 가이드 */}
          <line
            x1="300"
            y1="20"
            x2="300"
            y2="260"
            stroke="#1e293b"
            strokeWidth="2"
            strokeDasharray="5 5"
          />
          <text
            x="150"
            y="30"
            fill="#64748b"
            fontSize="14"
            fontWeight="bold"
            textAnchor="middle"
          >
            1차측 (Primary Y)
          </text>
          <text
            x="450"
            y="30"
            fill="#64748b"
            fontSize="14"
            fontWeight="bold"
            textAnchor="middle"
          >
            2차측 (Secondary Y)
          </text>

          {/* --- 코일 및 와이어 그리기 함수 --- */}
          {(() => {
            const drawY = (cx, cy, isPrimary) => {
              const r = 60; // Y결선 중심에서 뻗어나가는 길이
              const coords = {
                U: { x: cx, y: cy - r },
                V: { x: cx - r * 0.866, y: cy + r * 0.5 },
                W: { x: cx + r * 0.866, y: cy + r * 0.5 },
              };

              const lines = [
                { id: "U", ...coords.U, current: iU },
                { id: "V", ...coords.V, current: iV },
                { id: "W", ...coords.W, current: iW },
              ];

              return (
                <g>
                  {lines.map((line) => (
                    <g key={line.id}>
                      {/* 코일 선 */}
                      <line
                        x1={cx}
                        y1={cy}
                        x2={line.x}
                        y2={line.y}
                        stroke={colors[line.id]}
                        strokeWidth="5"
                        strokeLinecap="round"
                        filter={`url(#neon-${line.id})`}
                        opacity={getGlowOpacity(line.current)}
                      />
                      {/* 상호 라벨 (U,V,W) */}
                      <text
                        x={line.x + (line.x > cx ? 15 : line.x < cx ? -15 : 0)}
                        y={line.y + (line.y < cy ? -10 : 20)}
                        fill={colors[line.id]}
                        fontSize="14"
                        fontWeight="bold"
                        textAnchor="middle"
                        filter={`url(#neon-${line.id})`}
                      >
                        {line.id}
                        {isPrimary ? "1" : "2"}
                      </text>
                      {/* 외부 인입/인출선 (은은하게 연결) */}
                      <line
                        x1={line.x}
                        y1={line.y}
                        x2={isPrimary ? line.x - 30 : line.x + 30}
                        y2={line.y}
                        stroke={colors[line.id]}
                        strokeWidth="2"
                        opacity="0.3"
                      />
                    </g>
                  ))}
                  {/* 중성점 */}
                  <circle cx={cx} cy={cy} r="6" fill="#cbd5e1" />
                </g>
              );
            };

            return (
              <>
                {drawY(150, 150, true)}
                {drawY(450, 150, false)}

                {/* 중성선 (N) */}
                {showNeutral && (
                  <g>
                    <line
                      x1="150"
                      y1="150"
                      x2="450"
                      y2="150"
                      stroke={colors.N}
                      strokeWidth="4"
                      strokeDasharray="10 5"
                      filter={`url(#neon-N)`}
                      opacity={getGlowOpacity(iN)}
                    />
                    <text
                      x="300"
                      y="140"
                      fill={colors.N}
                      fontSize="14"
                      fontWeight="bold"
                      textAnchor="middle"
                      opacity={Math.max(0.3, getGlowOpacity(iN))}
                    >
                      Neutral (N)
                    </text>
                  </g>
                )}
              </>
            );
          })()}
        </svg>
      </div>

      {/* 실시간 오실로스코프 (전류 파형) */}
      <div className="relative z-10 rounded-2xl border border-slate-800 bg-slate-950 p-4 shadow-inner">
        <div className="flex justify-between items-center mb-2 px-2">
          <span className="text-xs font-bold text-slate-400">
            LIVE OSCILLOSCOPE (Current)
          </span>
          <div className="flex gap-3 text-xs font-bold">
            <span className="text-pink-500">■ U상</span>
            <span className="text-cyan-500">■ V상</span>
            <span className="text-yellow-500">■ W상</span>
            {showNeutral && <span className="text-white">■ N상</span>}
          </div>
        </div>
        <svg viewBox="0 0 600 100" className="w-full h-auto opacity-90">
          {/* 영점 기준선 */}
          <line
            x1="0"
            y1="50"
            x2="600"
            y2="50"
            stroke="#334155"
            strokeWidth="1"
          />

          {/* U, V, W 파형 */}
          <path
            d={generateWavePath(0, ampU)}
            fill="none"
            stroke={colors.U}
            strokeWidth="2"
            filter="url(#neon-U)"
          />
          <path
            d={generateWavePath((2 * Math.PI) / 3, ampV)}
            fill="none"
            stroke={colors.V}
            strokeWidth="2"
            filter="url(#neon-V)"
          />
          <path
            d={generateWavePath((4 * Math.PI) / 3, ampW)}
            fill="none"
            stroke={colors.W}
            strokeWidth="2"
            filter="url(#neon-W)"
          />

          {/* N선 파형 (합성 전류) */}
          {showNeutral && (
            <path
              d={generateWavePath(0, 0)}
              fill="none"
              stroke="transparent"
            /> /* Placeholder */
          )}
          {showNeutral && (
            <path
              d={(() => {
                let d = "";
                for (let i = 0; i <= 100; i++) {
                  const x = (i / 100) * 600;
                  const waveX = (i / 100) * 4 * Math.PI;
                  // I_n = I_u + I_v + I_w
                  const yVal =
                    ampU * Math.sin(waveX - time) +
                    ampV * Math.sin(waveX - time + (2 * Math.PI) / 3) +
                    ampW * Math.sin(waveX - time + (4 * Math.PI) / 3);
                  const y = 50 - yVal * 25;
                  if (i === 0) d += `M ${x} ${y} `;
                  else d += `L ${x} ${y} `;
                }
                return d;
              })()}
              fill="none"
              stroke={colors.N}
              strokeWidth="3"
              strokeDasharray="4 4"
              filter="url(#neon-N)"
            />
          )}
        </svg>
      </div>

      {/* 수식 해설 영역 */}
      <div className="relative z-10 mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-700 bg-white/5 p-4 backdrop-blur-md">
          <div className="mb-2 text-sm text-slate-400 font-bold">
            3상 평형 상태 (기본)
          </div>
          <div className="text-slate-300 text-sm">
            각 상의 크기가 같고 120도의 위상차를 가지면, 벡터 합은 항상 0이
            됩니다.
            <div className="mt-2 text-blue-400 text-base">
              <BlockMath math="I_U + I_V + I_W = 0" />
            </div>
            따라서 중성선(
            <InlineMath math="I_N" />
            )에는 전류가 흐르지 않아 빛나지 않습니다.
          </div>
        </div>
        <div
          className={`rounded-xl border p-4 backdrop-blur-md transition-all ${isUnbalanced ? "border-orange-500/50 bg-orange-950/20" : "border-slate-700 bg-white/5"}`}
        >
          <div
            className={`mb-2 text-sm font-bold ${isUnbalanced ? "text-orange-400" : "text-slate-400"}`}
          >
            부하 불평형 상태 (토글 ON)
          </div>
          <div className="text-slate-300 text-sm">
            특정 상(이 시뮬레이터에서는 U상)의 전류가 급증하면 평형이 깨져 잔류
            전류가 발생합니다.
            <div className="mt-2 text-orange-400 text-base">
              <BlockMath math="I_N = I_U + I_V + I_W \neq 0" />
            </div>
            안전을 위해 이 잔류 전류가 중성선을 타고 대지(Ground)로 흘러가게
            됩니다.
          </div>
        </div>
      </div>
    </div>
  );
}
