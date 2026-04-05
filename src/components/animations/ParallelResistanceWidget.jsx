import "katex/dist/katex.min.css";
import { useMemo, useState } from "react";
// 교체할 내용 (각 파일 상단에 추가)
import katex from "katex";

const InlineMath = ({ math }) => {
  const html = katex.renderToString(math, {
    throwOnError: false,
    displayMode: false,
  });
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
};

const BlockMath = ({ math }) => {
  const html = katex.renderToString(math, {
    throwOnError: false,
    displayMode: true,
  });
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
};
const ParallelResistanceWidget = () => {
  const [resistorCount, setResistorCount] = useState(3);
  const [voltage, setVoltage] = useState(35);
  const [resistances, setResistances] = useState([10, 20, 30, 40]);

  const { totalReq, currents, totalCurrent, latexFormula } = useMemo(() => {
    const activeResistances = resistances.slice(0, resistorCount);

    const calculatedInvReq = activeResistances.reduce((acc, R) => {
      const val = Number(R) <= 0.1 ? 0.1 : Number(R);
      return acc + 1 / val;
    }, 0);

    const Req = calculatedInvReq > 0 ? 1 / calculatedInvReq : 0;

    const branchCurrents = activeResistances.map((R) => {
      const val = Number(R) <= 0.1 ? 0.1 : Number(R);
      return voltage / val;
    });

    const totalI = Req > 0 ? voltage / Req : 0;

    const symbolicPart = activeResistances
      .map((_, i) => `\\frac{1}{R_{${i + 1}}}`)
      .join(" + ");
    const numericPart = activeResistances
      .map((R) => `\\frac{1}{${R}}`)
      .join(" + ");
    const intermediateSum = calculatedInvReq.toFixed(4);

    const formula = [
      "\\begin{aligned}",
      "R_{eq} &= \\frac{1}{" + symbolicPart + "} \\\\",
      "&= \\frac{1}{" + numericPart + "} \\\\",
      "&= \\frac{1}{" + intermediateSum + "} \\\\",
      "&= " + Req.toFixed(2) + " \\, \\Omega",
      "\\end{aligned}",
    ].join("\n");

    return {
      totalReq: Req,
      currents: branchCurrents,
      totalCurrent: totalI,
      latexFormula: formula,
    };
  }, [resistorCount, voltage, resistances]);

  const handleResChange = (idx, value) => {
    const newRes = [...resistances];
    newRes[idx] = Number(value);
    setResistances(newRes);
  };

  return (
    <div className="w-full bg-white rounded-2xl p-2">
      <h5 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
        <span className="bg-yellow-400 p-1.5 rounded-lg text-white">⚡</span>{" "}
        병렬 회로 인터랙티브 실습
      </h5>

      <div className="flex flex-col lg:flex-row gap-6 items-stretch">
        {/* 왼쪽 영역: 회로 시각화 (전류 화살표 포함) */}
        <div className="flex-[5] flex flex-col bg-[#f8fafc] rounded-2xl border border-gray-200 shadow-inner relative p-6 min-h-[400px] justify-center items-center">
          <svg
            viewBox="-20 0 440 280"
            className="w-full h-auto max-h-[350px] overflow-visible drop-shadow-sm"
          >
            {/* 전압원 */}
            <g transform="translate(40, 120)">
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="40"
                stroke="#0047a5"
                strokeWidth="2"
              />
              <line
                x1="-15"
                y1="40"
                x2="15"
                y2="40"
                stroke="#0047a5"
                strokeWidth="4"
              />
              <line
                x1="-8"
                y1="50"
                x2="8"
                y2="50"
                stroke="#0047a5"
                strokeWidth="2"
              />
              <line
                x1="0"
                y1="50"
                x2="0"
                y2="90"
                stroke="#0047a5"
                strokeWidth="2"
              />
              <text
                x="-40"
                y="55"
                className="text-lg font-black text-[#0047a5]"
              >
                {voltage} V
              </text>
            </g>

            {/* 메인 회로선 */}
            <line
              x1="40"
              y1="120"
              x2="40"
              y2="40"
              stroke="#94a3b8"
              strokeWidth="2.5"
            />
            <line
              x1="40"
              y1="40"
              x2="350"
              y2="40"
              stroke="#94a3b8"
              strokeWidth="2.5"
            />
            <line
              x1="40"
              y1="210"
              x2="40"
              y2="250"
              stroke="#94a3b8"
              strokeWidth="2.5"
            />
            <line
              x1="40"
              y1="250"
              x2="350"
              y2="250"
              stroke="#94a3b8"
              strokeWidth="2.5"
            />

            {/* 전체 전류 화살표 */}
            <g transform="translate(80, 40)">
              <line
                x1="-10"
                y1="0"
                x2="15"
                y2="0"
                stroke="#eab308"
                strokeWidth="3"
              />
              <polygon points="15,-5 25,0 15,5" fill="#eab308" />
            </g>

            {/* 병렬 지로 및 저항 */}
            {resistances.slice(0, resistorCount).map((R, idx) => {
              const xPos = 130 + idx * 80;
              const currentRatio = Math.min(
                Math.max(currents[idx] / 2, 0.6),
                1.5,
              );

              return (
                <g key={idx} transform={`translate(${xPos}, 40)`}>
                  <line
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="70"
                    stroke="#cbd5e1"
                    strokeWidth="2.5"
                  />
                  <line
                    x1="0"
                    y1="140"
                    x2="0"
                    y2="210"
                    stroke="#cbd5e1"
                    strokeWidth="2.5"
                  />

                  {/* 개별 지로 전류 화살표 */}
                  <g transform={`translate(0, 20) scale(${currentRatio})`}>
                    <line
                      x1="0"
                      y1="-10"
                      x2="0"
                      y2="10"
                      stroke="#10b981"
                      strokeWidth="3"
                    />
                    <polygon points="-6,10 6,10 0,20" fill="#10b981" />
                  </g>

                  <text
                    x="12"
                    y="30"
                    className="text-[12px] font-bold text-emerald-600"
                  >
                    I{idx + 1}: {currents[idx]?.toFixed(2)}A
                  </text>

                  <polyline
                    points="0,70 12,75 -12,85 12,95 -12,105 12,115 -12,125 12,135 0,140"
                    fill="none"
                    stroke="#475569"
                    strokeWidth="3.5"
                  />
                  <text
                    x="18"
                    y="110"
                    className="text-[14px] font-black text-gray-800"
                  >
                    {R}Ω
                  </text>
                </g>
              );
            })}

            <line
              x1="350"
              y1="40"
              x2="350"
              y2="250"
              stroke="#94a3b8"
              strokeWidth="2.5"
            />

            {/* 총 전류 라벨 */}
            <g transform="translate(140, 5)">
              <rect
                x="0"
                y="0"
                width="160"
                height="28"
                rx="6"
                fill="#ffffff"
                stroke="#e2e8f0"
                strokeWidth="2"
              />
              <text
                x="15"
                y="19"
                className="text-[12px] font-bold text-gray-600"
              >
                Total Current:{" "}
                <tspan className="text-[14px] font-black text-yellow-600">
                  {totalCurrent.toFixed(2)}A
                </tspan>
              </text>
            </g>
          </svg>
        </div>

        {/* 오른쪽 영역: 조작부 & 수식 풀이 과정 */}
        <div className="flex-[4] flex flex-col gap-4">
          <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-2">
                  저항 개수
                </label>
                <div className="flex gap-2">
                  {[2, 3, 4].map((num) => (
                    <button
                      key={num}
                      onClick={() => setResistorCount(num)}
                      className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all border ${
                        resistorCount === num
                          ? "bg-[#0047a5] text-white border-[#0047a5]"
                          : "bg-white text-gray-600 border-gray-300 hover:bg-gray-100"
                      }`}
                    >
                      {num}개
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-2 flex justify-between">
                  전압 (V){" "}
                  <span className="text-[#0047a5] font-black">{voltage}V</span>
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={voltage}
                  onChange={(e) => setVoltage(e.target.value)}
                  className="w-full h-2 accent-[#0047a5]"
                />
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-gray-200">
              {resistances.slice(0, resistorCount).map((R, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="w-8 font-bold text-sm text-gray-600">
                    R{idx + 1}
                  </span>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={R}
                    onChange={(e) => handleResChange(idx, e.target.value)}
                    className="flex-1 h-1.5 accent-gray-500"
                  />
                  <span className="w-12 text-right font-black text-gray-800">
                    {R}Ω
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#f0f4ff] border border-blue-200 p-5 rounded-2xl shadow-sm flex-1 flex flex-col justify-center">
            <p className="text-sm font-bold text-[#0047a5] mb-4 flex items-center gap-2 border-b border-blue-200 pb-2">
              <span className="material-symbols-outlined">calculate</span>
              합성저항 상세 계산 과정
            </p>
            <div className="text-gray-900 pointer-events-none overflow-x-auto py-2 text-lg">
              <BlockMath math={latexFormula} />
            </div>
          </div>

          <div className="bg-[#0047a5] p-5 rounded-2xl text-white shadow-md grid grid-cols-2 gap-4">
            <div className="text-center border-r border-white/20 pr-2">
              <p className="text-[12px] font-bold opacity-80 uppercase mb-1">
                최종 합성저항 (<InlineMath math="R_{eq}" />)
              </p>
              {/* ✅ 여기서 eq 대신 totalReq를 사용합니다! */}
              <span className="text-3xl font-black">
                {totalReq.toFixed(2)}{" "}
                <span className="text-base opacity-60">Ω</span>
              </span>
            </div>
            <div className="text-center pl-2">
              <p className="text-[12px] font-bold opacity-80 uppercase mb-1">
                회로 전체 전류 (<InlineMath math="I_{total}" />)
              </p>
              <span className="text-3xl font-black text-yellow-300">
                {totalCurrent.toFixed(2)}{" "}
                <span className="text-base opacity-60">A</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParallelResistanceWidget;
