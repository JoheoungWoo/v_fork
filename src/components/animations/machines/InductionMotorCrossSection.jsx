import { useEffect, useRef } from "react";

/**
 * InductionMotorCrossSection
 * Props:
 *   slip   {number}  - 슬립 (0~1)
 *   poles  {number}  - 극수 (2, 4, 6, 8)
 *   freq   {number}  - 주파수 Hz
 */
const InductionMotorCrossSection = ({ slip, poles, freq }) => {
  const rotorRef = useRef(null);
  const fieldRef = useRef(null);

  useEffect(() => {
    if (!rotorRef.current || !fieldRef.current) return;

    // 동기속도 기준 주기 계산 (초)
    const syncRpm = (120 * freq) / poles;
    const syncPeriodSec = 60 / syncRpm; // 1회전 주기(초)
    const rotorPeriodSec = slip < 0.999 ? syncPeriodSec / (1 - slip) : 9999;

    // CSS animation-duration 동적 적용
    fieldRef.current.style.animationDuration = syncPeriodSec.toFixed(3) + "s";
    rotorRef.current.style.animationDuration =
      Math.min(rotorPeriodSec, 120).toFixed(3) + "s";
  }, [slip, poles, freq]);

  // 고정자 코일: 3상(U/V/W) × 극수쌍 개수만큼 배치
  const coilColors = ["#ef4444", "#22c55e", "#3b82f6"];
  const poleCount = poles;
  const coilSlots = [];
  for (let i = 0; i < poleCount * 3; i++) {
    const angle = (360 / (poleCount * 3)) * i;
    const rad = (angle * Math.PI) / 180;
    const r = 148;
    const cx = 230 + r * Math.sin(rad);
    const cy = 230 - r * Math.cos(rad);
    coilSlots.push({
      cx,
      cy,
      color: coilColors[i % 3],
      opacity: i % 2 === 0 ? 0.85 : 0.4,
    });
  }

  // 회전자 바: 8개 고정
  const rotorBars = Array.from({ length: 8 }, (_, i) => ({
    angle: (360 / 8) * i,
  }));

  // NS 자극: 극수만큼 배치
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

          {/* ── 외부 프레임 ── */}
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

          {/* ── 고정자 코일 슬롯 ── */}
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

          {/* ── 자기장 회전 그룹 ── */}
          <g className="imcs-field" ref={fieldRef}>
            {/* 자속선: 극수 방향으로 */}
            {nsPoles.map((p, i) => {
              const rad = (p.angle * Math.PI) / 180;
              const x2 = 230 + 155 * Math.sin(rad);
              const y2 = 230 - 155 * Math.cos(rad);
              return (
                <line
                  key={i}
                  x1="230"
                  y1="230"
                  x2={x2.toFixed(1)}
                  y2={y2.toFixed(1)}
                  stroke="#3b82f6"
                  strokeWidth="2"
                  strokeDasharray="6 4"
                  opacity="0.3"
                />
              );
            })}
            {/* N/S 자극 표시 */}
            {nsPoles.map((p, i) => {
              const rad = (p.angle * Math.PI) / 180;
              const r = 170;
              const px = 230 + r * Math.sin(rad);
              const py = 230 - r * Math.cos(rad);
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
                    y={(+py + 5).toFixed(1)}
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

          {/* ── 에어갭 ── */}
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

          {/* ── 회전자 그룹 ── */}
          <g className="imcs-rotor" ref={rotorRef}>
            {/* 회전자 본체 */}
            <circle
              cx="230"
              cy="230"
              r="133"
              fill="url(#imcs-rotor-grad)"
              stroke="#94a3b8"
              strokeWidth="1.5"
              opacity="0.6"
            />

            {/* 엔드링 */}
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

            {/* 회전자 바 (농형) */}
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

            {/* 회전축 */}
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
            {/* 키 홈 */}
            <rect x="226" y="207" width="8" height="14" rx="2" fill="#475569" />
          </g>

          {/* ── 범례 레이블 ── */}
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
