import { useState } from "react";

const TimeConstantWidget = () => {
  const [mode, setMode] = useState("RC"); // 'RC' or 'RL'

  // RC 파라미터
  const [resistanceRC, setResistanceRC] = useState(5); // kOhm
  const [capacitance, setCapacitance] = useState(10); // uF

  // RL 파라미터
  const [resistanceRL, setResistanceRL] = useState(10); // Ohm
  const [inductance, setInductance] = useState(50); // mH

  // 시정수 계산 (ms 단위로 맞춰짐)
  const tau =
    mode === "RC"
      ? resistanceRC * capacitance // kOhm * uF = ms
      : inductance / resistanceRL; // mH / Ohm = ms

  // SVG 그리기용 설정
  const svgWidth = 700;
  const svgHeight = 350;
  const padding = 50;
  const chartWidth = svgWidth - padding * 2;
  const chartHeight = svgHeight - padding * 2;

  // X축: 0 부터 5 * tau 까지 표시
  const xMax = Math.max(5 * tau, 1);

  // 그래프 곡선 포인트 생성 (1 - e^(-t/tau))
  const points = [];
  const numPoints = 100;
  for (let i = 0; i <= numPoints; i++) {
    const t = (i / numPoints) * xMax;
    const y = 1 - Math.exp(-t / tau);

    const svgX = padding + (t / xMax) * chartWidth;
    const svgY = svgHeight - padding - y * chartHeight;
    points.push(`${svgX},${svgY}`);
  }
  const pathData = `M ${points.join(" L ")}`;

  // 시정수(tau) 1개일 때의 좌표 (63.2%)
  const tauSvgX = padding + (tau / xMax) * chartWidth;
  const tauSvgY = svgHeight - padding - 0.632 * chartHeight;
  const themeColor = mode === "RC" ? "#ef4444" : "#3b82f6"; // RC=Red, RL=Blue

  return (
    <div className="flex flex-col w-full bg-slate-900 text-white p-6 rounded-2xl border border-slate-700 shadow-xl font-sans">
      {/* 상단 탭 */}
      <div className="flex space-x-2 mb-6">
        <button
          className={`flex-1 py-3 rounded-lg font-black text-lg transition-colors ${mode === "RC" ? "bg-red-500 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}
          onClick={() => setMode("RC")}
        >
          RC 회로 (콘덴서 충전)
        </button>
        <button
          className={`flex-1 py-3 rounded-lg font-black text-lg transition-colors ${mode === "RL" ? "bg-blue-500 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}
          onClick={() => setMode("RL")}
        >
          RL 회로 (코일 전류 상승)
        </button>
      </div>

      {/* 컨트롤 패널 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-800 p-6 rounded-xl mb-6">
        {mode === "RC" ? (
          <>
            <div>
              <label className="flex justify-between text-slate-300 mb-2 font-bold">
                <span>저항 (R)</span>
                <span className="text-red-400">{resistanceRC} kΩ</span>
              </label>
              <input
                type="range"
                min="1"
                max="20"
                step="1"
                value={resistanceRC}
                onChange={(e) => setResistanceRC(Number(e.target.value))}
                className="w-full accent-red-500"
              />
            </div>
            <div>
              <label className="flex justify-between text-slate-300 mb-2 font-bold">
                <span>정전용량 (C)</span>
                <span className="text-red-400">{capacitance} μF</span>
              </label>
              <input
                type="range"
                min="10"
                max="200"
                step="10"
                value={capacitance}
                onChange={(e) => setCapacitance(Number(e.target.value))}
                className="w-full accent-red-500"
              />
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="flex justify-between text-slate-300 mb-2 font-bold">
                <span>저항 (R)</span>
                <span className="text-blue-400">{resistanceRL} Ω</span>
              </label>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={resistanceRL}
                onChange={(e) => setResistanceRL(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>
            <div>
              <label className="flex justify-between text-slate-300 mb-2 font-bold">
                <span>인덕턴스 (L)</span>
                <span className="text-blue-400">{inductance} mH</span>
              </label>
              <input
                type="range"
                min="10"
                max="200"
                step="10"
                value={inductance}
                onChange={(e) => setInductance(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>
          </>
        )}
      </div>

      {/* 결과 표시 보드 */}
      <div className="flex justify-center items-center gap-4 mb-6 bg-slate-950 py-4 rounded-xl border border-slate-800">
        <span className="text-slate-400 font-mono text-lg">시정수 (τ) = </span>
        {mode === "RC" ? (
          <span className="text-2xl font-black text-white">
            R × C = <span className="text-red-400">{tau.toFixed(1)} ms</span>
          </span>
        ) : (
          <span className="text-2xl font-black text-white">
            L ÷ R = <span className="text-blue-400">{tau.toFixed(1)} ms</span>
          </span>
        )}
      </div>

      {/* 실시간 그래프 (SVG) */}
      <div className="bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex justify-center">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full max-w-3xl h-auto"
        >
          {/* 그리드 선 */}
          <line
            x1={padding}
            y1={padding}
            x2={svgWidth - padding}
            y2={padding}
            stroke="#334155"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          <line
            x1={padding}
            y1={svgHeight / 2}
            x2={svgWidth - padding}
            y2={svgHeight / 2}
            stroke="#334155"
            strokeWidth="1"
            strokeDasharray="4 4"
          />

          {/* X/Y 축 */}
          <line
            x1={padding}
            y1={svgHeight - padding}
            x2={svgWidth - padding + 20}
            y2={svgHeight - padding}
            stroke="#94a3b8"
            strokeWidth="2"
          />
          <line
            x1={padding}
            y1={svgHeight - padding}
            x2={padding}
            y2={padding - 20}
            stroke="#94a3b8"
            strokeWidth="2"
          />

          {/* Y축 라벨 */}
          <text
            x={padding - 10}
            y={padding + 5}
            fill="#94a3b8"
            fontSize="12"
            textAnchor="end"
          >
            100% (최종값)
          </text>
          <text
            x={padding - 10}
            y={svgHeight - padding}
            fill="#94a3b8"
            fontSize="12"
            textAnchor="end"
          >
            0
          </text>
          <text
            x={padding - 10}
            y={svgHeight / 2 + 5}
            fill="#475569"
            fontSize="12"
            textAnchor="end"
          >
            50%
          </text>

          {/* 메인 응답 곡선 */}
          <path
            d={pathData}
            fill="none"
            stroke={themeColor}
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* 시정수(1 Tau) 마커 */}
          <line
            x1={tauSvgX}
            y1={svgHeight - padding}
            x2={tauSvgX}
            y2={tauSvgY}
            stroke="#cbd5e1"
            strokeWidth="2"
            strokeDasharray="5 5"
          />
          <line
            x1={padding}
            y1={tauSvgY}
            x2={tauSvgX}
            y2={tauSvgY}
            stroke="#cbd5e1"
            strokeWidth="2"
            strokeDasharray="5 5"
          />
          <circle
            cx={tauSvgX}
            cy={tauSvgY}
            r="6"
            fill="#fff"
            stroke={themeColor}
            strokeWidth="3"
          />

          {/* 63.2% 텍스트 */}
          <text
            x={tauSvgX + 15}
            y={tauSvgY + 5}
            fill="#fff"
            fontSize="16"
            fontWeight="bold"
          >
            63.2%
          </text>
          <text
            x={tauSvgX}
            y={svgHeight - padding + 20}
            fill="#fff"
            fontSize="14"
            fontWeight="bold"
            textAnchor="middle"
          >
            1τ ({tau.toFixed(1)}ms)
          </text>

          {/* 5 Tau (정상상태 도달) 마커 */}
          <text
            x={svgWidth - padding}
            y={svgHeight - padding + 20}
            fill="#94a3b8"
            fontSize="14"
            textAnchor="middle"
          >
            5τ (정상상태)
          </text>
        </svg>
      </div>
    </div>
  );
};

export default TimeConstantWidget;
