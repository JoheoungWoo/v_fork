import { useEffect, useRef, useState } from "react";

/**
 * InductionMotorCrossSection
 * Props (모두 선택적 — WIDGET_MAP에서 props 없이 단독 사용 가능):
 *   slip   {number}  - 슬립 (0~1), 기본 0.05
 *   poles  {number}  - 극수 (2,4,6,8), 기본 4
 *   freq   {number}  - 주파수 Hz, 기본 60
 *
 * props가 undefined면 내부 state로 자체 제어 UI를 표시합니다.
 */
const InductionMotorCrossSection = ({
  slip: slipProp,
  poles: polesProp,
  freq: freqProp,
}) => {
  // props가 undefined면 내부 state로 관리
  const isStandalone =
    slipProp === undefined || polesProp === undefined || freqProp === undefined;

  const [internalSlip, setInternalSlip] = useState(0.05);
  const [internalPoles, setInternalPoles] = useState(4);
  const [internalFreq, setInternalFreq] = useState(60);

  const slip = isStandalone ? internalSlip : Number(slipProp) || 0.05;
  const poles = isStandalone ? internalPoles : Number(polesProp) || 4;
  const freq = isStandalone ? internalFreq : Number(freqProp) || 60;

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

  // 고정자 코일 슬롯
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

  // 회전자 바 8개
  const rotorBars = Array.from({ length: 8 }, (_, i) => ({
    angle: (360 / 8) * i,
  }));

  // N/S 자극
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

      {/* ── 단독 사용 시: 내부 제어 UI ── */}
      {isStandalone && (
        <div
          style={{
            display: "flex",
            gap: "20px",
            flexWrap: "wrap",
            marginBottom: "16px",
            padding: "12px 16px",
            background: "#f8fafc",
            borderRadius: "6px",
            border: "1px solid #e2e8f0",
            fontSize: "13px",
          }}
        >
          <div style={{ flex: "1 1 200px" }}>
            <label
              style={{
                display: "block",
                fontWeight: "bold",
                marginBottom: "4px",
              }}
            >
              슬립 (s): {internalSlip.toFixed(3)}
            </label>
            <input
              type="range"
              min="0.001"
              max="1"
              step="0.001"
              value={internalSlip}
              onChange={(e) => setInternalSlip(Number(e.target.value))}
              style={{ width: "100%" }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "11px",
                color: "#94a3b8",
              }}
            >
              <span>동기속도 (s=0)</span>
              <span>정지 (s=1)</span>
            </div>
          </div>

          <div style={{ flex: "0 1 120px" }}>
            <label
              style={{
                display: "block",
                fontWeight: "bold",
                marginBottom: "4px",
              }}
            >
              극수 (P)
            </label>
            <select
              value={internalPoles}
              onChange={(e) => setInternalPoles(Number(e.target.value))}
              style={{ width: "100%", padding: "4px" }}
            >
              {[2, 4, 6, 8].map((p) => (
                <option key={p} value={p}>
                  {p}극
                </option>
              ))}
            </select>
          </div>

          <div style={{ flex: "0 1 120px" }}>
            <label
              style={{
                display: "block",
                fontWeight: "bold",
                marginBottom: "4px",
              }}
            >
              주파수 (f)
            </label>
            <select
              value={internalFreq}
              onChange={(e) => setInternalFreq(Number(e.target.value))}
              style={{ width: "100%", padding: "4px" }}
            >
              <option value={60}>60 Hz</option>
              <option value={50}>50 Hz</option>
            </select>
          </div>

          <div
            style={{
              flex: "0 1 160px",
              padding: "8px 12px",
              background: "#f0f9ff",
              borderRadius: "6px",
              color: "#0369a1",
              lineHeight: "1.8",
            }}
          >
            <div>
              동기속도: <strong>{syncRpm} RPM</strong>
            </div>
            <div>
              회전수: <strong>{rotorRpm} RPM</strong>
            </div>
            <div>
              슬립주파수: <strong>{(slip * freq).toFixed(2)} Hz</strong>
            </div>
          </div>
        </div>
      )}

      <div
        style={{
          display: "flex",
          gap: "20px",
          flexWrap: "wrap",
          alignItems: "flex-start",
        }}
      >
        {/* ── SVG 단면도 ── */}
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
              const bx = 230 + 122 * Math.sin(rad) - 6;
              const by = 230 - 122 * Math.cos(rad) - 18;
              return (
                <rect
                  key={i}
                  x={bx.toFixed(1)}
                  y={by.toFixed(1)}
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

export default InductionMotorCrossSection;
