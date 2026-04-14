import { ArrowRight } from "lucide-react";
import { useState } from "react";

export default function DerivativeWidget() {
  // h: x의 변화량 (델타 x)
  const [h, setH] = useState(2.0);

  // 함수: f(x) = x^2 (단순화를 위해)
  const f = (x) => x * x;

  // 고정점 A (x=1)
  const x1 = 1;
  const y1 = f(x1);

  // 이동점 B (x=1+h)
  const x2 = x1 + parseFloat(h);
  const y2 = f(x2);

  // 두 점을 지나는 할선의 기울기 (평균변화율)
  const slope = h === 0 ? 2 * x1 : (y2 - y1) / h;

  return (
    <div className="flex flex-col items-center justify-center w-full h-full font-body">
      <div className="text-center mb-8 space-y-3">
        <h2 className="text-3xl font-black text-[#0047a5]">
          순간변화율 (미분)의 시각화
        </h2>
        <p className="text-gray-600 font-medium">
          <span className="text-blue-600 font-bold">x의 변화량(h)</span>을 0에
          가깝게 줄여보세요. <br />두 점을 지나는 선(할선)이 한 점을 지나는 선(
          <strong className="text-red-500">접선</strong>)으로 바뀝니다!
        </p>
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-12 w-full max-w-4xl bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        {/* 조작 및 수식 패널 */}
        <div className="flex-1 w-full space-y-8">
          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
            <label className="flex justify-between font-black text-gray-800 mb-4 text-lg">
              <span>점 B의 이동 거리 (h)</span>
              <span className={h == 0 ? "text-red-500" : "text-blue-600"}>
                {h == 0 ? "h → 0 (접선!)" : `h = ${h}`}
              </span>
            </label>
            <input
              type="range"
              min="0"
              max="3"
              step="0.1"
              value={h}
              onChange={(e) => setH(Number(e.target.value))}
              className="w-full accent-blue-600 h-2 bg-gray-200 rounded-lg cursor-pointer"
            />
          </div>

          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 space-y-4 text-lg text-center">
            <div className="flex justify-center items-center gap-4 font-bold text-gray-700">
              <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
                점 A (1, 1)
              </div>
              <ArrowRight className="text-gray-400" />
              <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 text-blue-600">
                점 B ({x2.toFixed(1)}, {y2.toFixed(1)})
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <span className="text-gray-500 text-sm block mb-1">
                현재 선의 기울기 (평균변화율)
              </span>
              <span className="text-3xl font-black text-[#0047a5]">
                {slope.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* 그래프 렌더링 영역 (SVG) */}
        <div className="flex-1 w-full flex justify-center">
          <svg
            viewBox="0 0 200 200"
            className="w-full max-w-sm bg-gray-50 rounded-2xl border border-gray-200 overflow-visible"
          >
            {/* 그리드 */}
            <g stroke="#e2e8f0" strokeWidth="0.5">
              {[0, 50, 100, 150, 200].map((v) => (
                <line key={`h${v}`} x1="0" y1={v} x2="200" y2={v} />
              ))}
              {[0, 50, 100, 150, 200].map((v) => (
                <line key={`v${v}`} x1={v} y1="0" x2={v} y2="200" />
              ))}
            </g>

            {/* 좌표축 */}
            <line
              x1="20"
              y1="180"
              x2="190"
              y2="180"
              stroke="#64748b"
              strokeWidth="2"
              markerEnd="url(#arrow)"
            />
            <line
              x1="20"
              y1="180"
              x2="20"
              y2="10"
              stroke="#64748b"
              strokeWidth="2"
              markerEnd="url(#arrow)"
            />

            {/* 곡선 y = x^2 (대략적인 베지어 곡선으로 표현) */}
            <path
              d="M 20 180 Q 80 180 140 20"
              fill="none"
              stroke="#94a3b8"
              strokeWidth="3"
            />

            {/* 선 그리기 (할선 또는 접선) */}
            <line
              x1="20"
              y1={180 - slope * (0 - 1) * 20}
              x2="180"
              y2={180 - slope * (8 - 1) * 20}
              stroke={h == 0 ? "#ef4444" : "#3b82f6"}
              strokeWidth={h == 0 ? "3" : "2"}
              className="transition-all duration-300"
            />

            {/* 점 A */}
            <circle cx="50" cy="160" r="5" fill="#0f172a" />
            <text x="35" y="155" fontSize="10" fontWeight="bold">
              A
            </text>

            {/* 점 B */}
            {h > 0 && (
              <>
                <circle
                  cx={50 + h * 30}
                  cy={180 - y2 * 20}
                  r="5"
                  fill="#2563eb"
                  className="transition-all duration-300"
                />
                <text
                  x={60 + h * 30}
                  y={180 - y2 * 20}
                  fontSize="10"
                  fill="#2563eb"
                  fontWeight="bold"
                  className="transition-all duration-300"
                >
                  B
                </text>
              </>
            )}
          </svg>
        </div>
      </div>
    </div>
  );
}
