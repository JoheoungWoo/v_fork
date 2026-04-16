import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function BridgeRectifierSimulator() {
  // 상태 관리: 커패시터 용량(C), 부하 저항(R), 애니메이션 시간
  const [capacitance, setCapacitance] = useState(20); // 0 ~ 100 μF
  const [resistance, setResistance] = useState(1000); // 100 ~ 5000 Ω
  const [timeStep, setTimeStep] = useState(0);

  // 파형 데이터 생성 로직
  const chartData = useMemo(() => {
    const data = [];
    const f = 50; // 주파수 50Hz
    const w = 2 * Math.PI * f;
    const vPeak = 10; // 최대 전압 10V
    const dt = 0.0002; // 샘플링 간격

    // RC 시정수 (tau = R * C)
    const actualC = capacitance * 1e-6; // μF -> F
    const tau = resistance * actualC;

    let vCap = 0;

    for (let t = 0; t <= 0.06; t += dt) {
      const vIn = vPeak * Math.sin(w * t); // 교류 입력
      const vRect = Math.abs(vIn); // 전파 정류 (다이오드 전압 강하 무시, 이상적 모델)

      if (capacitance === 0) {
        vCap = vRect; // 평활 회로가 없을 때
      } else {
        if (vRect >= vCap) {
          vCap = vRect; // 커패시터 충전 구간
        } else {
          // 커패시터 방전 구간 (dv/dt = -v/RC 오일러 근사)
          vCap = vCap - (vCap / tau) * dt;
        }
      }

      data.push({
        time: (t * 1000).toFixed(1), // ms 단위
        vIn: Number(vIn.toFixed(2)),
        vOut: Number(vCap.toFixed(2)),
      });
    }
    return data;
  }, [capacitance, resistance]);

  // 애니메이션 루프 (다이오드 도통 상태 시각화용)
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeStep((prev) => (prev + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // 현재 위상 계산 (양의 주기인지 음의 주기인지)
  const isPositiveCycle = Math.sin(2 * Math.PI * 50 * (timeStep * 0.0002)) >= 0;

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-slate-900 rounded-xl shadow-2xl text-slate-100 font-sans">
      <h2 className="text-2xl font-bold mb-6 text-center text-blue-400">
        브리지 정류 회로 시뮬레이터
      </h2>

      {/* 컨트롤 패널 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 bg-slate-800 p-4 rounded-lg">
        <div>
          <label className="block text-sm font-medium mb-2">
            커패시터 용량 (C):{" "}
            <span className="text-emerald-400 font-bold">{capacitance} μF</span>
          </label>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={capacitance}
            onChange={(e) => setCapacitance(Number(e.target.value))}
            className="w-full accent-emerald-500"
          />
          <p className="text-xs text-slate-400 mt-1">
            0으로 설정하면 평활 효과가 사라집니다.
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">
            부하 저항 (R_L):{" "}
            <span className="text-emerald-400 font-bold">{resistance} Ω</span>
          </label>
          <input
            type="range"
            min="100"
            max="5000"
            step="100"
            value={resistance}
            onChange={(e) => setResistance(Number(e.target.value))}
            className="w-full accent-emerald-500"
          />
        </div>
      </div>

      {/* 회로도 시각화 (SVG) */}
      <div className="flex justify-center mb-8 bg-slate-800 p-6 rounded-lg">
        <svg
          width="400"
          height="200"
          viewBox="0 0 400 200"
          className="stroke-slate-300"
        >
          {/* 교류 입력 기호 */}
          <circle cx="50" cy="100" r="20" fill="none" strokeWidth="2" />
          <path
            d="M 35 100 Q 42.5 85, 50 100 T 65 100"
            fill="none"
            strokeWidth="2"
          />

          {/* 입력 도선 */}
          <line x1="70" y1="100" x2="120" y2="100" strokeWidth="2" />
          <line x1="120" y1="100" x2="120" y2="50" strokeWidth="2" />
          <line x1="120" y1="100" x2="120" y2="150" strokeWidth="2" />

          {/* 브리지 다이오드 (단순화된 마름모 형태) */}
          <path
            d="M 170 50 L 220 100 L 170 150 L 120 100 Z"
            fill="none"
            strokeWidth="2"
          />

          {/* 다이오드 기호 (하이라이트 적용) */}
          {/* D1 (상단 우측) */}
          <polygon
            points="185,65 205,85 195,95"
            fill={isPositiveCycle ? "#ef4444" : "#475569"}
          />
          {/* D2 (상단 좌측) */}
          <polygon
            points="155,65 135,85 145,95"
            fill={!isPositiveCycle ? "#ef4444" : "#475569"}
          />
          {/* D3 (하단 좌측) */}
          <polygon
            points="155,135 135,115 145,105"
            fill={isPositiveCycle ? "#ef4444" : "#475569"}
          />
          {/* D4 (하단 우측) */}
          <polygon
            points="185,135 205,115 195,105"
            fill={!isPositiveCycle ? "#ef4444" : "#475569"}
          />

          {/* 출력 평활 회로 (C & R) */}
          <line x1="220" y1="100" x2="270" y2="100" strokeWidth="2" />
          <line x1="170" y1="150" x2="330" y2="150" strokeWidth="2" />
          <line x1="170" y1="50" x2="330" y2="50" strokeWidth="2" />

          {/* 커패시터 C */}
          <line x1="270" y1="50" x2="270" y2="90" strokeWidth="2" />
          <line
            x1="260"
            y1="90"
            x2="280"
            y2="90"
            strokeWidth="3"
            className="stroke-emerald-400"
          />
          <line
            x1="260"
            y1="110"
            x2="280"
            y2="110"
            strokeWidth="3"
            className="stroke-emerald-400"
          />
          <line x1="270" y1="110" x2="270" y2="150" strokeWidth="2" />
          <text x="285" y="105" fill="#34d399" fontSize="14">
            C
          </text>

          {/* 저항 R */}
          <line x1="330" y1="50" x2="330" y2="70" strokeWidth="2" />
          <path
            d="M 330 70 L 320 75 L 340 85 L 320 95 L 340 105 L 320 115 L 340 125 L 330 130"
            fill="none"
            strokeWidth="2"
            className="stroke-orange-400"
          />
          <line x1="330" y1="130" x2="330" y2="150" strokeWidth="2" />
          <text x="345" y="105" fill="#fb923c" fontSize="14">
            R_L
          </text>
        </svg>
      </div>

      {/* 파형 차트 (Recharts) */}
      <div className="h-72 w-full bg-slate-800 p-4 rounded-lg">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="time"
              stroke="#94a3b8"
              label={{
                value: "Time (ms)",
                position: "insideBottomRight",
                offset: -5,
                fill: "#94a3b8",
              }}
            />
            <YAxis
              domain={[-12, 12]}
              stroke="#94a3b8"
              label={{
                value: "Voltage (V)",
                angle: -90,
                position: "insideLeft",
                fill: "#94a3b8",
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "none",
                borderRadius: "8px",
                color: "#f8fafc",
              }}
            />
            <Legend verticalAlign="top" height={36} />
            <Line
              type="monotone"
              dataKey="vIn"
              name="교류 입력 파형 (AC Input)"
              stroke="#3b82f6"
              dot={false}
              strokeWidth={2}
              opacity={0.5}
            />
            <Line
              type="monotone"
              dataKey="vOut"
              name="직류 출력 파형 (DC Output)"
              stroke="#10b981"
              dot={false}
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
