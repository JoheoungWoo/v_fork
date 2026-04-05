import { useState } from "react";

const InteractiveUnitCircle = () => {
  const [angle, setAngle] = useState(30);

  // 최대공약수(GCD) 구하는 헬퍼 함수
  const getGCD = (a, b) => (b === 0 ? a : getGCD(b, a % b));

  // 각도를 π가 포함된 호도법(분수) 문자열로 변환
  const getRadianString = (deg) => {
    if (deg === 0) return "0";
    if (deg === 360) return "2π";

    const gcd = getGCD(deg, 180);
    const num = deg / gcd;
    const den = 180 / gcd;

    let numStr = num === 1 ? "π" : `${num}π`;
    if (den === 1) return numStr;
    return `${numStr}/${den}`;
  };

  const radianStr = getRadianString(angle);

  // 수학 계산 (라디안 변환)
  const rad = (angle * Math.PI) / 180;
  const cosValue = Math.cos(rad);
  const sinValue = Math.sin(rad);

  // 제곱 값 계산 (피타고라스 항등식용)
  const cosSquared = Math.pow(cosValue, 2);
  const sinSquared = Math.pow(sinValue, 2);

  // SVG 좌표 설정 (중심 150, 150 / 반지름 100)
  const centerX = 150;
  const centerY = 150;
  const radius = 100;

  const targetX = centerX + radius * cosValue;
  const targetY = centerY - radius * sinValue;

  // 중심각 호(Arc)를 그리기 위한 좌표 계산 (반지름 25)
  const arcRadius = 25;
  const arcEndX = centerX + arcRadius * cosValue;
  const arcEndY = centerY - arcRadius * sinValue;
  const largeArcFlag = angle > 180 ? 1 : 0;

  // SVG Arc 명령어
  const arcPath =
    angle === 0 || angle === 360
      ? ""
      : `M ${centerX + arcRadius} ${centerY} A ${arcRadius} ${arcRadius} 0 ${largeArcFlag} 0 ${arcEndX} ${arcEndY}`;

  return (
    <div className="flex flex-col bg-white p-6 rounded-2xl border border-blue-50 shadow-inner font-sans w-full h-full">
      {/* 헤더 영역 */}
      <div className="text-center mb-6 shrink-0">
        <h5 className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
          단위원을 활용한 삼각비 & 위상각 이해
        </h5>
        <p className="text-sm text-gray-500 mt-1">
          슬라이더를 움직여 각도에 따른 삼각함수 값의 변화를 확인하세요.
        </p>
      </div>

      {/* 🌟 좌우 2단 분할 레이아웃 적용 🌟 */}
      <div className="flex flex-col lg:flex-row items-center justify-center gap-10 flex-grow">
        {/* ========================================== */}
        {/* LEFT COLUMN: 시각화(SVG) & 컨트롤(슬라이더) */}
        {/* ========================================== */}
        <div className="flex flex-col items-center w-full lg:w-1/2 max-w-sm">
          {/* 시각화 영역 (SVG) */}
          <svg
            width="300"
            height="300"
            className="bg-slate-50 rounded-full mb-6 border border-gray-100 shadow-sm overflow-visible"
          >
            <line
              x1="10"
              y1="150"
              x2="290"
              y2="150"
              stroke="#cbd5e1"
              strokeWidth="1"
            />
            <line
              x1="150"
              y1="10"
              x2="150"
              y2="290"
              stroke="#cbd5e1"
              strokeWidth="1"
            />

            {arcPath && (
              <path
                d={arcPath}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="3"
                opacity="0.8"
              />
            )}

            {angle > 0 && angle < 360 && (
              <text
                x={centerX + 35 * Math.cos(rad / 2)}
                y={centerY - 35 * Math.sin(rad / 2) + 4}
                textAnchor="middle"
                fill="#d97706"
                fontSize="12"
                fontWeight="bold"
              >
                {radianStr}
              </text>
            )}

            <circle
              cx={centerX}
              cy={centerY}
              r={radius}
              fill="none"
              stroke="#94a3b8"
              strokeWidth="2"
              strokeDasharray="4 2"
            />

            <line
              x1={centerX}
              y1={centerY}
              x2={targetX}
              y2={centerY}
              stroke="#ef4444"
              strokeWidth="3"
              opacity="0.8"
            />
            <line
              x1={targetX}
              y1={centerY}
              x2={targetX}
              y2={targetY}
              stroke="#10b981"
              strokeWidth="3"
              opacity="0.8"
            />
            <line
              x1={centerX}
              y1={centerY}
              x2={targetX}
              y2={targetY}
              stroke="#0047a5"
              strokeWidth="3"
            />
            <circle cx={targetX} cy={targetY} r="6" fill="#0047a5" />

            <text
              x={centerX + (radius * cosValue) / 2}
              y={centerY + 20}
              textAnchor="middle"
              fill="#ef4444"
              fontSize="13"
              fontWeight="bold"
            >
              cos
            </text>
            <text
              x={targetX + 15}
              y={centerY - (radius * sinValue) / 2}
              textAnchor="middle"
              fill="#10b981"
              fontSize="13"
              fontWeight="bold"
            >
              sin
            </text>
          </svg>

          {/* 컨트롤 영역 (슬라이더 및 실시간 듀얼 각도 표시) */}
          <div className="w-full bg-gray-50 p-4 rounded-xl border border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-bold text-gray-500">
                위상각 조절
              </span>
              <div className="flex items-baseline gap-2 bg-white px-3 py-1 rounded shadow-sm border border-gray-100">
                <span className="text-xl font-black text-[#0047a5]">
                  {angle}°
                </span>
                <span className="text-gray-300">|</span>
                <span className="text-lg font-bold text-[#d97706]">
                  {radianStr} rad
                </span>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="360"
              step="1"
              value={angle}
              onChange={(e) => setAngle(Number(e.target.value))}
              className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#0047a5]"
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-2 font-medium px-1">
              <span>0</span>
              <span>π/2</span>
              <span>π</span>
              <span>3π/2</span>
              <span>2π</span>
            </div>
          </div>
        </div>

        {/* ========================================== */}
        {/* RIGHT COLUMN: 값 출력 & 피타고라스 항등식 */}
        {/* ========================================== */}
        <div className="flex flex-col w-full lg:w-1/2 max-w-sm gap-6 justify-center">
          {/* 값 출력 영역 (cos, sin) */}
          <div className="grid grid-cols-2 gap-4 w-full">
            <div className="bg-red-50 p-5 rounded-xl border border-red-100 flex flex-col items-center justify-center shadow-sm">
              <p className="text-sm text-red-600 font-bold mb-2">
                $\cos({radianStr})$
              </p>
              <p className="text-3xl font-black text-red-700">
                {cosValue.toFixed(3).replace("-0.000", "0.000")}
              </p>
            </div>
            <div className="bg-green-50 p-5 rounded-xl border border-green-100 flex flex-col items-center justify-center shadow-sm">
              <p className="text-sm text-green-600 font-bold mb-2">
                $\sin({radianStr})$
              </p>
              <p className="text-3xl font-black text-green-700">
                {sinValue.toFixed(3).replace("-0.000", "0.000")}
              </p>
            </div>
          </div>

          {/* 피타고라스 항등식 테이블 */}
          <div className="w-full bg-blue-50/50 p-5 rounded-xl border border-blue-100 shadow-sm">
            <h6 className="text-base font-bold text-[#0047a5] mb-4 text-center flex items-center justify-center gap-2">
              💡 피타고라스 삼각 항등식
            </h6>
            <div className="flex flex-col gap-3 font-mono text-sm">
              {/* cos 제곱 */}
              <div className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                <span className="text-red-600 font-bold text-base">
                  cos²({angle}°)
                </span>
                <span className="text-gray-700 text-base">
                  {cosSquared.toFixed(4)}
                </span>
              </div>
              {/* sin 제곱 */}
              <div className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                <span className="text-green-600 font-bold text-base">
                  sin²({angle}°)
                </span>
                <span className="text-gray-700 text-base">
                  {sinSquared.toFixed(4)}
                </span>
              </div>
              {/* 합계 = 1 */}
              <div className="flex justify-between items-center bg-[#0047a5] text-white p-4 rounded-lg shadow-md font-bold text-lg mt-2 transition-all">
                <span>cos² + sin²</span>
                <span className="flex items-center gap-2">
                  = <span className="text-2xl text-yellow-300">1</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveUnitCircle;
