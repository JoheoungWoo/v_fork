import "katex/dist/katex.min.css";
import { useMemo, useState } from "react";
import { BlockMath } from "react-katex";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const RCCircuit = () => {
  const [r, setR] = useState(10); // 저항 (kΩ)
  const [c, setC] = useState(10); // 커패시터 (μF)
  const [isCharging, setIsCharging] = useState(true); // 충전/방전 모드
  const v0 = 5; // 초기/공급 전압 5V

  // 시정수 계산 (kΩ * μF = ms)
  const tau = useMemo(() => r * c, [r, c]);

  // 그래프 데이터 생성 (0부터 5*tau 까지)
  const chartData = useMemo(() => {
    const data = [];
    const maxTime = Math.max(500, tau * 5); // 최소 500ms 혹은 5tau까지 표시
    const step = maxTime / 100;

    for (let t = 0; t <= maxTime; t += step) {
      let v = 0;
      if (isCharging) {
        v = v0 * (1 - Math.exp(-t / tau));
      } else {
        v = v0 * Math.exp(-t / tau);
      }
      data.push({ time: Number(t.toFixed(1)), voltage: Number(v.toFixed(3)) });
    }
    return data;
  }, [tau, isCharging, v0]);

  // 시정수 도달 지점의 전압
  const tauVoltage = isCharging ? v0 * 0.632 : v0 * 0.368;

  // LaTeX 수식 문자열 생성
  const mathFormula = isCharging
    ? `V_c(t) = ${v0} \\left( 1 - e^{-\\frac{t}{${tau}}} \\right)`
    : `V_c(t) = ${v0} e^{-\\frac{t}{${tau}}}`;
  const activeColor = isCharging ? "#2563eb" : "#dc2626";
  const chargeWaveColor = "#22c55e";
  const dischargeWaveColor = "#ef4444";
  const bulbFill = isCharging ? "#fde047" : "#e5e7eb";
  const bulbStroke = isCharging ? "#f59e0b" : "#9ca3af";

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "0 auto",
        padding: "20px",
        fontFamily: "sans-serif",
      }}
    >
      <h2 style={{ textAlign: "center", color: "#333" }}>
        RC 회로 시정수 시뮬레이터
      </h2>

      {/* 기존 컨트롤 패널 */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          background: "#f5f7fa",
          padding: "20px",
          borderRadius: "12px",
          marginBottom: "20px",
        }}
      >
        {/* 저항 컨트롤 */}
        <div style={{ textAlign: "center" }}>
          <svg width="80" height="40" viewBox="0 0 80 40">
            <path
              d="M 0 20 L 15 20 L 20 5 L 30 35 L 40 5 L 50 35 L 60 5 L 65 20 L 80 20"
              stroke="#d35400"
              strokeWidth="3"
              fill="none"
              strokeLinejoin="round"
            />
          </svg>
          <div>
            <label>저항 (R): {r} kΩ</label>
            <br />
            <input
              type="range"
              min="1"
              max="100"
              value={r}
              onChange={(e) => setR(Number(e.target.value))}
            />
          </div>
        </div>

        {/* 기존 충전/방전 토글 */}
        <div style={{ textAlign: "center" }}>
          <button
            onClick={() => setIsCharging(!isCharging)}
            style={{
              padding: "10px 20px",
              fontSize: "16px",
              fontWeight: "bold",
              backgroundColor: isCharging ? "#3498db" : "#e74c3c",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "0.3s",
            }}
          >
            {isCharging ? "⚡ 충전 모드 (Charge)" : "🔋 방전 모드 (Discharge)"}
          </button>
          <div
            style={{ marginTop: "10px", fontSize: "18px", fontWeight: "bold" }}
          >
            시정수 (τ): <span style={{ color: "#27ae60" }}>{tau} ms</span>
          </div>
        </div>

        {/* 커패시터 컨트롤 */}
        <div style={{ textAlign: "center" }}>
          <svg width="80" height="40" viewBox="0 0 80 40">
            <path
              d="M 0 20 L 35 20 M 35 5 L 35 35 M 45 5 L 45 35 M 45 20 L 80 20"
              stroke="#2980b9"
              strokeWidth="3"
              fill="none"
            />
          </svg>
          <div>
            <label>커패시턴스 (C): {c} μF</label>
            <br />
            <input
              type="range"
              min="1"
              max="100"
              value={c}
              onChange={(e) => setC(Number(e.target.value))}
            />
          </div>
        </div>
      </div>

      {/* 추가 기능: A/B 접점 회로도 */}
      <div
        style={{
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          borderRadius: "12px",
          padding: "16px",
          marginBottom: "20px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "10px" }}>
          <button
            onClick={() => setIsCharging(true)}
            style={{
              padding: "8px 14px",
              fontSize: "14px",
              fontWeight: "bold",
              backgroundColor: isCharging ? "#2563eb" : "#cbd5e1",
              color: isCharging ? "white" : "#334155",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            A 접점 연결
          </button>
          <button
            onClick={() => setIsCharging(false)}
            style={{
              padding: "8px 14px",
              fontSize: "14px",
              fontWeight: "bold",
              backgroundColor: !isCharging ? "#dc2626" : "#cbd5e1",
              color: !isCharging ? "white" : "#334155",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            B 접점 연결
          </button>
        </div>
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "8px" }}>
          <svg viewBox="0 0 620 230" width="100%" height="220">
            <line x1="60" y1="185" x2="560" y2="185" stroke="#1f2937" strokeWidth="3" />
            <line x1="60" y1="185" x2="60" y2="60" stroke="#1f2937" strokeWidth="3" />
            <line x1="35" y1="110" x2="60" y2="110" stroke="#1f2937" strokeWidth="5" />
            <line x1="42" y1="126" x2="60" y2="126" stroke="#1f2937" strokeWidth="3" />
            <text x="28" y="96" fontSize="20" fontWeight="bold">+</text>
            <text x="30" y="146" fontSize="20" fontWeight="bold">-</text>
            <text x="16" y="170" fontSize="20">ε</text>
            <circle cx="165" cy="60" r="6" fill="#111827" />
            <circle cx="260" cy="60" r="6" fill="#111827" />
            <circle cx="195" cy="120" r="6" fill="#111827" />
            <text x="154" y="44" fontSize="20" fontStyle="italic">A</text>
            <text x="184" y="110" fontSize="20" fontStyle="italic">B</text>
            <line x1="60" y1="60" x2="165" y2="60" stroke={isCharging ? activeColor : "#1f2937"} strokeWidth="3" />
            <line
              x1="260"
              y1="60"
              x2={isCharging ? "165" : "195"}
              y2={isCharging ? "60" : "120"}
              stroke={activeColor}
              strokeWidth="4"
              strokeLinecap="round"
            />
            <line x1="195" y1="120" x2="195" y2="185" stroke={!isCharging ? activeColor : "#1f2937"} strokeWidth="3" />
            <line x1="260" y1="60" x2="295" y2="60" stroke="#1f2937" strokeWidth="3" />
            <path
              d="M 295 60 L 312 48 L 329 72 L 346 48 L 363 72 L 380 48 L 397 72 L 414 60"
              stroke="#1f2937"
              strokeWidth="3"
              fill="none"
              strokeLinejoin="round"
            />
            <text x="350" y="40" fontSize="30" fontStyle="italic">R</text>
            <line x1="414" y1="60" x2="525" y2="60" stroke="#1f2937" strokeWidth="3" />
            <line x1="525" y1="45" x2="525" y2="95" stroke="#1f2937" strokeWidth="4" />
            <line x1="545" y1="45" x2="545" y2="95" stroke="#1f2937" strokeWidth="4" />
            <line x1="545" y1="60" x2="560" y2="60" stroke="#1f2937" strokeWidth="3" />
            <line x1="560" y1="60" x2="560" y2="185" stroke="#1f2937" strokeWidth="3" />
            <text x="555" y="118" fontSize="32" fontStyle="italic">C</text>

            {/* 전구(다마): B 아래 세로선 직렬 위치 */}
            <line x1="195" y1="120" x2="195" y2="140" stroke={!isCharging ? activeColor : "#1f2937"} strokeWidth="3" />
            <line x1="195" y1="190" x2="195" y2="185" stroke={!isCharging ? activeColor : "#1f2937"} strokeWidth="3" />
            <circle cx="195" cy="165" r="24" fill={bulbFill} stroke={bulbStroke} strokeWidth="3" />
            <path d="M 181 165 L 190 173 L 200 157 L 210 165" stroke={bulbStroke} strokeWidth="3" fill="none" />

            {/* 전류 흐름(초록 물결): 접점 상태에 따라 경로 변경 */}
            {isCharging ? (
              <>
                <path
                  d="M 60 60 L 165 60 L 260 60 L 414 60 L 560 60 L 560 185 L 60 185 L 60 60"
                  fill="none"
                  stroke={chargeWaveColor}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray="4 10"
                  opacity="0.9"
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    from="0"
                    to="-70"
                    dur="1.2s"
                    repeatCount="indefinite"
                  />
                </path>
              </>
            ) : (
              <>
                <path
                  d="M 195 120 L 195 185 L 560 185 L 560 60 L 414 60 L 260 60"
                  fill="none"
                  stroke={dischargeWaveColor}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray="4 10"
                  opacity="0.9"
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    from="0"
                    to="-80"
                    dur="1.2s"
                    repeatCount="indefinite"
                  />
                </path>
              </>
            )}
          </svg>
          <div style={{ textAlign: "center", marginTop: "6px", color: activeColor, fontWeight: 700 }}>
            현재 연결: {isCharging ? "A 접점 (충전 곡선 상승)" : "B 접점 (방전 곡선 하강)"}
          </div>
          <div style={{ marginTop: "8px", textAlign: "center", fontWeight: 700, color: isCharging ? "#ca8a04" : "#6b7280" }}>
            전구(다마) {isCharging ? "ON" : "OFF"}
          </div>
        </div>
      </div>

      {/* 수식 표시 영역 */}
      <div
        style={{
          margin: "20px 0",
          padding: "15px",
          background: "#fff",
          border: "1px solid #e1e4e8",
          borderRadius: "8px",
          textAlign: "center",
        }}
      >
        <h3 style={{ margin: "0 0 10px 0", fontSize: "16px", color: "#555" }}>
          현재 전압 수식
        </h3>
        <BlockMath math={mathFormula} />
      </div>

      {/* 그래프 영역 */}
      <div style={{ height: "400px", width: "100%" }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.5} />
            <XAxis
              dataKey="time"
              label={{
                value: "시간 (ms)",
                position: "insideBottomRight",
                offset: -10,
              }}
            />
            <YAxis
              domain={[0, 5]}
              label={{ value: "전압 (V)", angle: -90, position: "insideLeft" }}
            />
            <Tooltip
              formatter={(value) => [`${value} V`, "전압"]}
              labelFormatter={(label) => `${label} ms`}
            />

            <Line
              type="monotone"
              dataKey="voltage"
              stroke={isCharging ? "#3498db" : "#e74c3c"}
              strokeWidth={3}
              dot={false}
              animationDuration={500}
            />

            {/* 시정수 (tau) 지점을 나타내는 보조선 및 점 */}
            <ReferenceLine
              x={tau}
              stroke="#27ae60"
              strokeDasharray="5 5"
              label={{
                position: "top",
                value: `τ = ${tau}ms`,
                fill: "#27ae60",
              }}
            />
            <ReferenceLine
              y={tauVoltage}
              stroke="#27ae60"
              strokeDasharray="5 5"
              label={{
                position: "right",
                value: `${tauVoltage.toFixed(2)}V`,
                fill: "#27ae60",
              }}
            />
            <ReferenceDot
              x={tau}
              y={tauVoltage}
              r={6}
              fill="#27ae60"
              stroke="white"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RCCircuit;
