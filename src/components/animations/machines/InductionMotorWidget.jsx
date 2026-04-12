/**
 * InductionMotorWidget.jsx
 * ─────────────────────────────────────────────────────────────
 * 유도전동기 통합 위젯 (단일 파일)
 *
 * WIDGET_MAP 단독 등록 시 → 내부 state로 자체 제어 UI 표시
 * 외부 props 전달 시       → 부모 state 그대로 사용
 *
 * 통합 전 파일:
 *   InductionMotorConfiguration.jsx  (제어 패널)
 *   InductionMotorCrossSection.jsx   (단면 시각화)
 *   InductionMotorCircuit.jsx        (등가회로)
 *   InductionMotorSimulation.jsx     (토크-속도 특성)
 *   InductionMotorCombinedWidget.jsx (최상위 조립)
 * ─────────────────────────────────────────────────────────────
 */

import { useEffect, useMemo, useRef, useState } from "react";
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

// ─────────────────────────────────────────────────────────────
// 1. 제어 패널
// ─────────────────────────────────────────────────────────────
const Configuration = ({
  voltage,
  setVoltage,
  freq,
  setFreq,
  poles,
  setPoles,
  slip,
  setSlip,
}) => (
  <div
    style={{
      padding: "20px",
      border: "1px solid #ccc",
      borderRadius: "8px",
      backgroundColor: "#f9fafb",
    }}
  >
    <h3 style={{ marginTop: 0 }}>1. 전동기 제어 및 입력</h3>

    <div style={{ marginBottom: "15px" }}>
      <label style={{ display: "block", fontWeight: "bold" }}>
        상전압 (Vs): {voltage} V
      </label>
      <input
        type="range"
        min="100"
        max="440"
        step="10"
        value={voltage}
        onChange={(e) => setVoltage(Number(e.target.value))}
        style={{ width: "100%" }}
      />
    </div>

    <div style={{ marginBottom: "15px" }}>
      <label style={{ display: "block", fontWeight: "bold" }}>
        주파수 (f): {freq} Hz
      </label>
      <select
        value={freq}
        onChange={(e) => setFreq(Number(e.target.value))}
        style={{ width: "100%", padding: "5px" }}
      >
        <option value={50}>50 Hz</option>
        <option value={60}>60 Hz</option>
      </select>
    </div>

    <div style={{ marginBottom: "15px" }}>
      <label style={{ display: "block", fontWeight: "bold" }}>
        극수 (P): {poles} Poles
      </label>
      <select
        value={poles}
        onChange={(e) => setPoles(Number(e.target.value))}
        style={{ width: "100%", padding: "5px" }}
      >
        {[2, 4, 6, 8].map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>
    </div>

    <div
      style={{
        marginBottom: "15px",
        padding: "10px",
        backgroundColor: "#fff",
        borderRadius: "5px",
        border: "1px solid #ddd",
      }}
    >
      <label style={{ display: "block", fontWeight: "bold", color: "#2563eb" }}>
        슬립 (s): {slip.toFixed(3)}
      </label>
      <input
        type="range"
        min="0.001"
        max="1"
        step="0.001"
        value={slip}
        onChange={(e) => setSlip(Number(e.target.value))}
        style={{ width: "100%" }}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "12px",
          color: "#666",
        }}
      >
        <span>동기속도(s=0)</span>
        <span>정지(s=1)</span>
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────
// 2. 단면 시각화
// ─────────────────────────────────────────────────────────────
const CrossSection = ({ slip, poles, freq }) => {
  const rotorRef = useRef(null);
  const fieldRef = useRef(null);

  useEffect(() => {
    if (!rotorRef.current || !fieldRef.current) return;
    const syncRpm = (120 * freq) / poles;
    const syncPeriodSec = 60 / syncRpm;
    const rotorPeriodSec = slip < 0.999 ? syncPeriodSec / (1 - slip) : 9999;
    fieldRef.current.style.animationDuration = syncPeriodSec.toFixed(3) + "s";
    rotorRef.current.style.animationDuration =
      Math.min(rotorPeriodSec, 120).toFixed(3) + "s";
  }, [slip, poles, freq]);

  const syncRpm = (120 * freq) / poles;
  const rotorRpm = Math.round(syncRpm * (1 - slip));

  const coilColors = ["#ef4444", "#22c55e", "#3b82f6"];
  const coilSlots = [];
  for (let i = 0; i < poles * 3; i++) {
    const angle = (360 / (poles * 3)) * i;
    const rad = (angle * Math.PI) / 180;
    coilSlots.push({
      cx: 230 + 148 * Math.sin(rad),
      cy: 230 - 148 * Math.cos(rad),
      color: coilColors[i % 3],
      opacity: i % 2 === 0 ? 0.85 : 0.4,
    });
  }

  const rotorBars = Array.from({ length: 8 }, (_, i) => ({
    angle: (360 / 8) * i,
  }));

  const nsPoles = Array.from({ length: poles }, (_, i) => ({
    angle: (360 / poles) * i,
    isN: i % 2 === 0,
  }));

  return (
    <div
      style={{
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        backgroundColor: "#fff",
      }}
    >
      <style>{`
        @keyframes imcs-field-rotate {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes imcs-rotor-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .imcs-field {
          transform-origin: 230px 230px;
          animation: imcs-field-rotate linear infinite;
        }
        .imcs-rotor {
          transform-origin: 230px 230px;
          animation: imcs-rotor-spin linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .imcs-field, .imcs-rotor { animation: none; }
        }
      `}</style>

      <h3 style={{ marginTop: 0 }}>
        유도전동기 단면 구조 (Cross-section View)
      </h3>

      {/* 수치 요약 */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
          marginBottom: "14px",
          padding: "8px 12px",
          background: "#f0f9ff",
          borderRadius: "6px",
          fontSize: "13px",
          color: "#0369a1",
        }}
      >
        <span>
          동기속도: <strong>{syncRpm} RPM</strong>
        </span>
        <span>·</span>
        <span>
          회전수: <strong>{rotorRpm} RPM</strong>
        </span>
        <span>·</span>
        <span>
          슬립주파수: <strong>{(slip * freq).toFixed(2)} Hz</strong>
        </span>
        <span>·</span>
        <span>
          동기속도 대비: <strong>{((1 - slip) * 100).toFixed(1)}%</strong>
        </span>
      </div>

      <div
        style={{
          display: "flex",
          gap: "20px",
          flexWrap: "wrap",
          alignItems: "flex-start",
        }}
      >
        {/* SVG 단면도 */}
        <svg
          width="460"
          height="460"
          viewBox="0 0 460 460"
          xmlns="http://www.w3.org/2000/svg"
          style={{ flex: "0 0 auto", maxWidth: "100%" }}
        >
          <defs>
            <radialGradient id="imcs-stator-grad" cx="50%" cy="50%" r="50%">
              <stop offset="60%" stopColor="#94a3b8" stopOpacity="0.10" />
              <stop offset="100%" stopColor="#64748b" stopOpacity="0.35" />
            </radialGradient>
            <radialGradient id="imcs-rotor-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#e2e8f0" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.55" />
            </radialGradient>
          </defs>

          {/* 외부 프레임 */}
          <circle
            cx="230"
            cy="230"
            r="198"
            fill="none"
            stroke="#64748b"
            strokeWidth="12"
            opacity="0.2"
          />
          <circle
            cx="230"
            cy="230"
            r="192"
            fill="url(#imcs-stator-grad)"
            stroke="#94a3b8"
            strokeWidth="1"
            opacity="0.5"
          />

          {/* 고정자 코일 슬롯 */}
          {coilSlots.map((c, i) => (
            <circle
              key={i}
              cx={c.cx}
              cy={c.cy}
              r="11"
              fill={c.color}
              opacity={c.opacity}
            />
          ))}

          {/* 자기장 회전 그룹 */}
          <g className="imcs-field" ref={fieldRef}>
            {nsPoles.map((p, i) => {
              const rad = (p.angle * Math.PI) / 180;
              return (
                <line
                  key={i}
                  x1="230"
                  y1="230"
                  x2={(230 + 155 * Math.sin(rad)).toFixed(1)}
                  y2={(230 - 155 * Math.cos(rad)).toFixed(1)}
                  stroke="#3b82f6"
                  strokeWidth="2"
                  strokeDasharray="6 4"
                  opacity="0.3"
                />
              );
            })}
            {nsPoles.map((p, i) => {
              const rad = (p.angle * Math.PI) / 180;
              const px = 230 + 170 * Math.sin(rad);
              const py = 230 - 170 * Math.cos(rad);
              return (
                <g key={i}>
                  <circle
                    cx={px.toFixed(1)}
                    cy={py.toFixed(1)}
                    r="16"
                    fill={p.isN ? "#ef4444" : "#3b82f6"}
                    opacity="0.85"
                  />
                  <text
                    x={px.toFixed(1)}
                    y={(py + 5).toFixed(1)}
                    textAnchor="middle"
                    fontSize="13"
                    fontWeight="600"
                    fill="white"
                  >
                    {p.isN ? "N" : "S"}
                  </text>
                </g>
              );
            })}
          </g>

          {/* 에어갭 */}
          <circle
            cx="230"
            cy="230"
            r="150"
            fill="none"
            stroke="#60a5fa"
            strokeWidth="0.5"
            opacity="0.25"
            strokeDasharray="3 3"
          />

          {/* 회전자 그룹 */}
          <g className="imcs-rotor" ref={rotorRef}>
            <circle
              cx="230"
              cy="230"
              r="133"
              fill="url(#imcs-rotor-grad)"
              stroke="#94a3b8"
              strokeWidth="1.5"
              opacity="0.6"
            />
            <circle
              cx="230"
              cy="230"
              r="127"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="5"
              opacity="0.5"
            />
            <circle
              cx="230"
              cy="230"
              r="117"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="5"
              opacity="0.5"
            />
            {rotorBars.map((bar, i) => {
              const rad = (bar.angle * Math.PI) / 180;
              return (
                <rect
                  key={i}
                  x={(230 + 122 * Math.sin(rad) - 6).toFixed(1)}
                  y={(230 - 122 * Math.cos(rad) - 18).toFixed(1)}
                  width="12"
                  height="36"
                  rx="3"
                  fill="#f59e0b"
                  opacity="0.9"
                  transform={`rotate(${bar.angle}, 230, 230)`}
                />
              );
            })}
            <circle
              cx="230"
              cy="230"
              r="22"
              fill="#64748b"
              stroke="#475569"
              strokeWidth="2"
              opacity="0.85"
            />
            <circle cx="230" cy="230" r="9" fill="#94a3b8" />
            <rect x="226" y="207" width="8" height="14" rx="2" fill="#475569" />
          </g>

          {/* 범례 */}
          <text x="230" y="22" textAnchor="middle" fontSize="12" fill="#64748b">
            고정자 (Stator)
          </text>
          <circle cx="360" cy="340" r="8" fill="#ef4444" opacity="0.85" />
          <text x="374" y="345" fontSize="11" fill="#64748b">
            U상
          </text>
          <circle cx="360" cy="358" r="8" fill="#22c55e" opacity="0.85" />
          <text x="374" y="363" fontSize="11" fill="#64748b">
            V상
          </text>
          <circle cx="360" cy="376" r="8" fill="#3b82f6" opacity="0.85" />
          <text x="374" y="381" fontSize="11" fill="#64748b">
            W상
          </text>
          <rect
            x="354"
            y="392"
            width="12"
            height="10"
            rx="2"
            fill="#f59e0b"
            opacity="0.9"
          />
          <text x="374" y="401" fontSize="11" fill="#64748b">
            회전자 바
          </text>
        </svg>

        {/* 설명 패널 */}
        <div
          style={{
            flex: "1 1 180px",
            fontSize: "13px",
            color: "#64748b",
            lineHeight: "1.7",
          }}
        >
          <p>
            <strong>고정자 (Stator)</strong>
            <br />
            3상 코일(U/V/W)에 교류를 인가하면 <em>동기속도</em>로 회전하는
            자기장이 발생합니다.
          </p>
          <p>
            <strong>회전자 (Rotor, 농형)</strong>
            <br />
            회전 자기장이 알루미늄/구리 바를 가로지르며 전류를 유도, 그 힘으로
            회전합니다.
          </p>
          <p>
            <strong>슬립 (Slip)</strong>
            <br />
            회전자는 동기속도보다 <em>s</em>만큼 느리게 회전합니다. 슬립이
            클수록 토크가 크고 손실도 커집니다.
          </p>
          <p
            style={{
              marginTop: "14px",
              padding: "8px 10px",
              background: "#f0f9ff",
              borderRadius: "6px",
              color: "#0369a1",
            }}
          >
            <strong>s = {slip.toFixed(3)}</strong>
            {" · "}동기속도 대비 회전자:{" "}
            <strong>{((1 - slip) * 100).toFixed(1)}%</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// 3. 한 상당 등가회로
// ─────────────────────────────────────────────────────────────
const Circuit = ({ params, slip }) => {
  const { rs, xs, rr, xr, xm } = params;
  const dynamicRr = slip > 0 ? (rr / slip).toFixed(2) : "∞";

  return (
    <div
      style={{
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        backgroundColor: "#fff",
      }}
    >
      <h3 style={{ marginTop: 0 }}>
        2. 한 상당 등가회로 (Per-phase Equivalent Circuit)
      </h3>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          overflowX: "auto",
        }}
      >
        <svg
          width="550"
          height="220"
          viewBox="0 0 550 220"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g stroke="#334155" strokeWidth="2" fill="none">
            {/* 전압원 */}
            <circle cx="50" cy="110" r="15" />
            <path d="M 40 110 Q 45 100 50 110 T 60 110" strokeWidth="1.5" />
            <text
              x="35"
              y="145"
              fontSize="12"
              fill="#64748b"
              stroke="none"
              textAnchor="middle"
            >
              Vs
            </text>

            <line x1="50" y1="40" x2="50" y2="95" />
            <line x1="50" y1="125" x2="50" y2="180" />
            <line x1="50" y1="180" x2="500" y2="180" />
            <line x1="500" y1="40" x2="500" y2="180" />

            {/* Rs */}
            <path d="M 50 40 L 80 40 L 85 30 L 95 50 L 105 30 L 115 50 L 120 40 L 140 40" />
            <text
              x="100"
              y="25"
              textAnchor="middle"
              fontSize="12"
              fill="#d97706"
              stroke="none"
            >
              Rs = {rs}Ω
            </text>

            {/* jXs */}
            <path d="M 140 40 L 160 40 Q 165 20 170 40 Q 175 20 180 40 Q 185 20 190 40 L 210 40" />
            <text
              x="175"
              y="25"
              textAnchor="middle"
              fontSize="12"
              fill="#2563eb"
              stroke="none"
            >
              jXs = j{xs}Ω
            </text>

            {/* jXm 병렬 */}
            <line x1="240" y1="40" x2="240" y2="70" />
            <path d="M 240 70 Q 220 75 240 80 Q 220 85 240 90 Q 220 95 240 100 Q 220 105 240 110" />
            <line x1="240" y1="110" x2="240" y2="180" />
            <text
              x="205"
              y="95"
              textAnchor="middle"
              fontSize="12"
              fill="#6366f1"
              stroke="none"
            >
              jXm = j{xm}Ω
            </text>
            <line x1="210" y1="40" x2="300" y2="40" />

            {/* jXr' */}
            <path d="M 300 40 L 320 40 Q 325 20 330 40 Q 335 20 340 40 Q 345 20 350 40 L 370 40" />
            <text
              x="335"
              y="25"
              textAnchor="middle"
              fontSize="12"
              fill="#2563eb"
              stroke="none"
            >
              jXr' = j{xr}Ω
            </text>

            {/* Rr'/s */}
            <path
              d="M 370 40 L 410 40 L 415 30 L 425 50 L 435 30 L 445 50 L 450 40 L 500 40"
              stroke={slip < 0.1 ? "#ef4444" : "#334155"}
              strokeWidth={slip < 0.1 ? "3" : "2"}
            />
            <text
              x="435"
              y="25"
              textAnchor="middle"
              fontSize="13"
              fill="#ef4444"
              stroke="none"
              fontWeight="bold"
            >
              Rr'/s = {dynamicRr}Ω
            </text>
            <text
              x="435"
              y="65"
              textAnchor="middle"
              fontSize="11"
              fill="#94a3b8"
              stroke="none"
            >
              (s = {slip.toFixed(3)})
            </text>
          </g>
        </svg>
      </div>

      <div
        style={{
          marginTop: "10px",
          fontSize: "13px",
          color: "#64748b",
          lineHeight: "1.5",
        }}
      >
        <p>
          • <strong>Rr'/s</strong>: 슬립(s)이 작아질수록(속도가 빨라질수록)
          로터의 등가 저항이 커져 전류가 감소합니다.
        </p>
        <p>
          • <strong>동기 속도(s=0)</strong>에서는 저항이 무한대가 되어 로터로
          에너지가 전달되지 않습니다.
        </p>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// 4. 토크-속도 특성 분석
// ─────────────────────────────────────────────────────────────
const Simulation = ({ voltage, freq, poles, slip, params }) => {
  const syncSpeed = (120 * freq) / poles;
  const rotorSpeed = syncSpeed * (1 - slip);
  const omegaSync = (2 * Math.PI * syncSpeed) / 60;

  const calculateTorque = (s) => {
    if (s === 0) return 0;
    const { rs, xs, rr, xr } = params;
    const num = 3 * voltage ** 2 * (rr / s);
    const den = omegaSync * ((rs + rr / s) ** 2 + (xs + xr) ** 2);
    return num / den;
  };

  const currentTorque = calculateTorque(slip);

  const chartData = useMemo(() => {
    const data = [];
    for (let s = 1; s >= 0; s -= 0.02) {
      data.push({
        speed: Math.round(syncSpeed * (1 - s)),
        torque: calculateTorque(s === 0 ? 0.0001 : s),
      });
    }
    return data;
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          동기 속도 (Ns): <strong>{syncSpeed} RPM</strong>
        </div>
        <div>
          현재 회전수 (N): <strong>{rotorSpeed.toFixed(1)} RPM</strong>
        </div>
        <div>
          발생 토크 (T): <strong>{currentTorque.toFixed(2)} N·m</strong>
        </div>
        <div>
          슬립 주파수 (fs): <strong>{(slip * freq).toFixed(2)} Hz</strong>
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

// ─────────────────────────────────────────────────────────────
// 5. 최상위 통합 위젯 (default export)
//    WIDGET_MAP 단독 등록 시 props 없이도 동작
// ─────────────────────────────────────────────────────────────
const DEFAULT_PARAMS = {
  rs: 0.5,
  xs: 1.2,
  rr: 0.4,
  xr: 1.2,
  xm: 40,
};

export default function InductionMotorwidget({
  slip: slipProp,
  poles: polesProp,
  freq: freqProp,
  voltage: voltageProp,
}) {
  // props가 하나라도 undefined면 standalone 모드
  const isStandalone =
    slipProp === undefined ||
    polesProp === undefined ||
    freqProp === undefined ||
    voltageProp === undefined;

  const [internalVoltage, setInternalVoltage] = useState(220);
  const [internalFreq, setInternalFreq] = useState(60);
  const [internalPoles, setInternalPoles] = useState(4);
  const [internalSlip, setInternalSlip] = useState(0.05);

  const voltage = isStandalone ? internalVoltage : Number(voltageProp) || 220;
  const freq = isStandalone ? internalFreq : Number(freqProp) || 60;
  const poles = isStandalone ? internalPoles : Number(polesProp) || 4;
  const slip = isStandalone ? internalSlip : Number(slipProp) || 0.05;

  return (
    <div
      style={{
        width: "100%",
        fontFamily: "sans-serif",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        {/* 제어 패널 */}
        <div style={{ flex: "1 1 280px" }}>
          <Configuration
            voltage={voltage}
            setVoltage={isStandalone ? setInternalVoltage : undefined}
            freq={freq}
            setFreq={isStandalone ? setInternalFreq : undefined}
            poles={poles}
            setPoles={isStandalone ? setInternalPoles : undefined}
            slip={slip}
            setSlip={isStandalone ? setInternalSlip : undefined}
          />
        </div>

        {/* 단면 + 등가회로 + 특성 */}
        <div
          style={{
            flex: "2 1 500px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          <CrossSection slip={slip} poles={poles} freq={freq} />
          <Circuit params={DEFAULT_PARAMS} slip={slip} />
          <Simulation
            voltage={voltage}
            freq={freq}
            poles={poles}
            slip={slip}
            params={DEFAULT_PARAMS}
          />
        </div>
      </div>
    </div>
  );
}
