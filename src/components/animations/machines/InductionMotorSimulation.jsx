import { useMemo } from "react";
import {
    CartesianGrid,
    Line,
    LineChart,
    ReferenceDot,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

const InductionMotorSimulation = ({ voltage, freq, poles, slip, params }) => {
  const syncSpeed = (120 * freq) / poles;
  const rotorSpeed = syncSpeed * (1 - slip);
  const omegaSync = (2 * Math.PI * syncSpeed) / 60;

  // 토크 계산 (Simplified Kloss Equation base)
  const calculateTorque = (s) => {
    if (s === 0) return 0;
    const { rs, xs, rr, xr } = params;
    const ws = omegaSync;
    const v = voltage;
    const num = 3 * v ** 2 * (rr / s);
    const den = ws * ((rs + rr / s) ** 2 + (xs + xr) ** 2);
    return num / den;
  };

  const currentTorque = calculateTorque(slip);

  // 그래프 데이터 생성 (슬립 1에서 0까지)
  const chartData = useMemo(() => {
    const data = [];
    for (let s = 1; s >= 0; s -= 0.02) {
      const speed = syncSpeed * (1 - s);
      data.push({
        speed: Math.round(speed),
        torque: calculateTorque(s === 0 ? 0.0001 : s),
      });
    }
    return data;
  }, [voltage, freq, poles, params]);

  return (
    <div
      style={{ padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}
    >
      <h3>3. 운전 특성 분석</h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "10px",
          marginBottom: "20px",
          backgroundColor: "#f0fdf4",
          padding: "10px",
          borderRadius: "5px",
        }}
      >
        <div>
          동기 속도 ($N_s$): <strong>{syncSpeed} RPM</strong>
        </div>
        <div>
          현재 회전수 ($N$): <strong>{rotorSpeed.toFixed(1)} RPM</strong>
        </div>
        <div>
          발생 토크 ($T$): <strong>{currentTorque.toFixed(2)} N·m</strong>
        </div>
        <div>
          슬립 주파수 ($f_s$): <strong>{(slip * freq).toFixed(2)} Hz</strong>
        </div>
      </div>

      <div style={{ height: "300px", width: "100%" }}>
        <h4 style={{ textAlign: "center" }}>
          토크-속도 곡선 (Torque-Speed Curve)
        </h4>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="speed"
              label={{
                value: "Speed (RPM)",
                position: "insideBottomRight",
                offset: -5,
              }}
            />
            <YAxis
              label={{
                value: "Torque (Nm)",
                angle: -90,
                position: "insideLeft",
              }}
            />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="torque"
              stroke="#ef4444"
              dot={false}
              strokeWidth={3}
            />
            <ReferenceDot
              x={Math.round(rotorSpeed)}
              y={currentTorque}
              r={6}
              fill="#2563eb"
              stroke="white"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default InductionMotorSimulation;
