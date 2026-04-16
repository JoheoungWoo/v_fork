import { useState } from "react";

export default function InductionPowerFlowApp() {
  // 슬립(Slip) 상태 관리. 기본값은 0.5 (전동기 모드)
  const [slip, setSlip] = useState(0.5);

  // 공극 전력(P2)을 100으로 기준 잡음
  const P2 = 100;

  // 1. 전기적 전력 (고정자와 전원 사이)
  // 전동기/플러깅(s > 0): 전원 -> 고정자 (양수)
  // 발전기(s < 0): 고정자 -> 전원 (음수)
  const Pelec = slip > 0 ? P2 : -P2;

  // 2. 기계적 전력 (회전자와 기계 부하 사이)
  // P_mech = P2 * (1 - s)
  // 양수: 회전자 -> 부하 (일을 함)
  // 음수: 부하 -> 회전자 (외부에서 동력 공급 받음, 또는 관성에 의한 제동 에너지)
  const Pmech = P2 * (1 - slip);

  // 3. 회전자 동손 (열 손실)
  // P_loss = s * P2 (항상 회전자에서 빠져나가는 열로 소모되므로 절대값 처리)
  const Ploss = Math.abs(slip * P2);

  // 상태 요약 텍스트 결정
  let modeTitle = "";
  let description = "";
  if (slip === 0) {
    modeTitle = "동기 속도 (무부하 상태)";
    description = "전력 변환이 일어나지 않는 이상적인 동기 속도 상태입니다.";
  } else if (slip > 0 && slip < 1) {
    modeTitle = "전동기 작용 (Motoring)";
    description =
      "전원에서 전기에너지를 공급받아 기계적 에너지로 변환하여 부하를 구동합니다.";
  } else if (slip < 0) {
    modeTitle = "발전기 작용 (Generating)";
    description =
      "부하(원동기)로부터 기계적 에너지를 받아 전기에너지로 변환 후 전원으로 역송(회생)합니다.";
  } else {
    modeTitle = "플러깅 / 역상 제동 (Plugging)";
    description =
      "회전계자의 방향이 반대로 되어, 전원과 기계부하 양쪽에서 에너지가 회전자로 밀려들어와 막대한 열(동손)로 소모되며 급격히 제동됩니다.";
  }

  // 선 굵기 계산 (최소 2px)
  const getStrokeWidth = (val) => Math.max(2, Math.abs(val) / 10);

  // 흐름 애니메이션 방향 클래스
  const getFlowClass = (val, isRightToLeft = false) => {
    if (val === 0) return "";
    const forward = isRightToLeft ? val < 0 : val > 0;
    return forward ? "flow-forward" : "flow-reverse";
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "900px",
        margin: "0 auto",
        fontFamily: "sans-serif",
        backgroundColor: "#1e1e1e",
        color: "white",
        padding: "20px",
        borderRadius: "12px",
      }}
    >
      <style>{`
        @keyframes flowFwd { to { stroke-dashoffset: -20; } }
        @keyframes flowRev { to { stroke-dashoffset: 20; } }
        .flow-forward { animation: flowFwd 0.5s linear infinite; }
        .flow-reverse { animation: flowRev 0.5s linear infinite; }
        .power-line { stroke: #4ade80; stroke-dasharray: 10, 5; stroke-linecap: round; }
        .power-line.reverse { stroke: #3b82f6; }
        .power-line.heat { stroke: #ef4444; }
      `}</style>

      <h2 style={{ textAlign: "center", margin: "0 0 20px 0" }}>
        유도기 동작 모드별 전력 흐름 다이어그램
      </h2>

      {/* 컨트롤 패널 */}
      <div
        style={{
          backgroundColor: "#2d2d2d",
          padding: "15px",
          borderRadius: "8px",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "15px",
          }}
        >
          <label style={{ fontWeight: "bold", fontSize: "18px" }}>
            슬립 (s): {slip.toFixed(2)}
          </label>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => setSlip(-0.5)}
              style={{
                padding: "8px 12px",
                cursor: "pointer",
                backgroundColor: slip < 0 ? "#3b82f6" : "#444",
                color: "white",
                border: "none",
                borderRadius: "4px",
              }}
            >
              발전기 (s = -0.5)
            </button>
            <button
              onClick={() => setSlip(0.5)}
              style={{
                padding: "8px 12px",
                cursor: "pointer",
                backgroundColor: slip > 0 && slip < 1 ? "#4ade80" : "#444",
                color: "white",
                border: "none",
                borderRadius: "4px",
              }}
            >
              전동기 (s = 0.5)
            </button>
            <button
              onClick={() => setSlip(1.5)}
              style={{
                padding: "8px 12px",
                cursor: "pointer",
                backgroundColor: slip > 1 ? "#ef4444" : "#444",
                color: "white",
                border: "none",
                borderRadius: "4px",
              }}
            >
              플러깅 (s = 1.5)
            </button>
          </div>
        </div>
        <input
          type="range"
          min="-1.0"
          max="2.0"
          step="0.1"
          value={slip}
          onChange={(e) => setSlip(parseFloat(e.target.value))}
          style={{ width: "100%", cursor: "pointer" }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "12px",
            color: "#aaa",
            marginTop: "5px",
          }}
        >
          <span>-1.0 (발전기)</span>
          <span>0 (동기속도)</span>
          <span>1.0 (정지)</span>
          <span>2.0 (플러깅/역전)</span>
        </div>
      </div>

      {/* 모드 설명 패널 */}
      <div
        style={{
          textAlign: "center",
          marginBottom: "30px",
          padding: "15px",
          backgroundColor: "#333",
          borderRadius: "8px",
          minHeight: "80px",
        }}
      >
        <h3 style={{ margin: "0 0 10px 0", color: "#facc15" }}>{modeTitle}</h3>
        <p style={{ margin: 0, fontSize: "15px", lineHeight: "1.5" }}>
          {description}
        </p>
      </div>

      {/* SVG 블록 다이어그램 */}
      <div style={{ width: "100%", overflowX: "auto" }}>
        <svg viewBox="0 0 800 350" style={{ width: "100%", height: "auto" }}>
          {/* 블록 정의 */}
          <g transform="translate(50, 100)">
            <rect
              width="120"
              height="80"
              rx="8"
              fill="#374151"
              stroke="#9ca3af"
              strokeWidth="2"
            />
            <text
              x="60"
              y="45"
              fill="white"
              textAnchor="middle"
              fontSize="16"
              fontWeight="bold"
            >
              전원 (Grid)
            </text>
          </g>

          <g transform="translate(260, 100)">
            <rect
              width="120"
              height="80"
              rx="8"
              fill="#4b5563"
              stroke="#9ca3af"
              strokeWidth="2"
            />
            <text
              x="60"
              y="35"
              fill="white"
              textAnchor="middle"
              fontSize="16"
              fontWeight="bold"
            >
              고정자
            </text>
            <text
              x="60"
              y="55"
              fill="#d1d5db"
              textAnchor="middle"
              fontSize="12"
            >
              (Stator)
            </text>
          </g>

          <g transform="translate(470, 100)">
            <rect
              width="120"
              height="80"
              rx="8"
              fill="#4b5563"
              stroke="#9ca3af"
              strokeWidth="2"
            />
            <text
              x="60"
              y="35"
              fill="white"
              textAnchor="middle"
              fontSize="16"
              fontWeight="bold"
            >
              회전자
            </text>
            <text
              x="60"
              y="55"
              fill="#d1d5db"
              textAnchor="middle"
              fontSize="12"
            >
              (Rotor)
            </text>
          </g>

          <g transform="translate(680, 100)">
            <rect
              width="120"
              height="80"
              rx="8"
              fill="#374151"
              stroke="#9ca3af"
              strokeWidth="2"
            />
            <text
              x="60"
              y="35"
              fill="white"
              textAnchor="middle"
              fontSize="16"
              fontWeight="bold"
            >
              기계 부하
            </text>
            <text
              x="60"
              y="55"
              fill="#d1d5db"
              textAnchor="middle"
              fontSize="12"
            >
              (Load)
            </text>
          </g>

          <g transform="translate(470, 260)">
            <rect
              width="120"
              height="60"
              rx="8"
              fill="#7f1d1d"
              stroke="#fca5a5"
              strokeWidth="2"
            />
            <text
              x="60"
              y="35"
              fill="white"
              textAnchor="middle"
              fontSize="16"
              fontWeight="bold"
            >
              열 손실 (Heat)
            </text>
          </g>

          {/* 연결선 및 전력 화살표 애니메이션 */}
          {/* 전원 <-> 고정자 (P_elec) */}
          <line
            x1="170"
            y1="140"
            x2="260"
            y2="140"
            className={`power-line ${Pelec < 0 ? "reverse" : ""} ${getFlowClass(Pelec)}`}
            strokeWidth={getStrokeWidth(Pelec)}
          />
          <text x="215" y="125" fill="white" textAnchor="middle" fontSize="14">
            P_elec = {Math.abs(Pelec).toFixed(0)}
          </text>
          <text x="215" y="165" fill="#aaa" textAnchor="middle" fontSize="12">
            {Pelec > 0 ? "전력 공급 ➔" : "역송(회생) ⬅"}
          </text>

          {/* 고정자 <-> 회전자 (P2, 공극 전력) */}
          <line
            x1="380"
            y1="140"
            x2="470"
            y2="140"
            className={`power-line ${Pelec < 0 ? "reverse" : ""} ${getFlowClass(Pelec)}`}
            strokeWidth={getStrokeWidth(P2)}
          />
          <text x="425" y="125" fill="white" textAnchor="middle" fontSize="14">
            P2 = {Math.abs(P2).toFixed(0)}
          </text>
          <text x="425" y="165" fill="#aaa" textAnchor="middle" fontSize="12">
            {Pelec > 0 ? "공극 전력 ➔" : "공극 전력 ⬅"}
          </text>

          {/* 회전자 <-> 부하 (P_mech) */}
          <line
            x1="590"
            y1="140"
            x2="680"
            y2="140"
            className={`power-line ${Pmech < 0 ? "reverse" : ""} ${getFlowClass(Pmech)}`}
            strokeWidth={getStrokeWidth(Pmech)}
          />
          <text x="635" y="125" fill="white" textAnchor="middle" fontSize="14">
            P_mech = {Math.abs(Pmech).toFixed(0)}
          </text>
          <text x="635" y="165" fill="#aaa" textAnchor="middle" fontSize="12">
            {Pmech > 0 ? "동력 출력 ➔" : "외부 동력 ⬅"}
          </text>

          {/* 회전자 -> 열 (P_loss) */}
          <line
            x1="530"
            y1="180"
            x2="530"
            y2="260"
            className={`power-line heat flow-forward`}
            strokeWidth={getStrokeWidth(Ploss)}
          />
          <text
            x="590"
            y="225"
            fill="#ef4444"
            textAnchor="middle"
            fontSize="14"
          >
            P_loss = {Ploss.toFixed(0)}
          </text>
          <text
            x="480"
            y="225"
            fill="#ef4444"
            textAnchor="middle"
            fontSize="18"
          >
            ⬇
          </text>
        </svg>
      </div>
    </div>
  );
}
