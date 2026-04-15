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

      {/* 컨트롤 패널 및 컴포넌트 SVG 영역 */}
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
            {/* 이쁜 저항(Resistor) SVG */}
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

        {/* 모드 전환 버튼 */}
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
            시정수 ($\tau$): <span style={{ color: "#27ae60" }}>{tau} ms</span>
          </div>
        </div>

        {/* 커패시터 컨트롤 */}
        <div style={{ textAlign: "center" }}>
          <svg width="80" height="40" viewBox="0 0 80 40">
            {/* 이쁜 커패시터(Capacitor) SVG */}
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
