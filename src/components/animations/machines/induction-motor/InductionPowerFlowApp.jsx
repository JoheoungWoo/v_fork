import { useState } from "react";

export default function InductionPowerFlowApp() {
  // 슬립(Slip) 상태 관리. 기본값은 0.5 (전동기 모드)
  const [slip, setSlip] = useState(0.5);

  // 공극 전력(P2)을 100으로 기준 잡음
  const P2 = 100;

  // 1. 전기적 전력
  const Pelec = slip > 0 ? P2 : -P2;

  // 2. 기계적 전력
  const Pmech = P2 * (1 - slip);

  // 3. 회전자 동손 (열 손실)
  const Ploss = Math.abs(slip * P2);

  // 모드 텍스트 로직
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
      "부하로부터 기계적 에너지를 받아 전기에너지로 변환 후 전원으로 역송(회생)합니다.";
  } else {
    modeTitle = "플러깅 / 역상 제동 (Plugging)";
    description =
      "전원과 기계부하 양쪽에서 에너지가 회전자로 밀려들어와 막대한 열로 소모되며 급격히 제동됩니다.";
  }

  // 선 굵기 계산 (시인성을 위해 가중치 대폭 증가)
  // 전력 100일 때 25px, 150일 때 35px 두께
  const getStrokeWidth = (val) => Math.max(8, (Math.abs(val) / 100) * 20 + 5);

  // 흐름 방향 클래스
  const getFlowClass = (val, isRightToLeft = false) => {
    if (val === 0) return "";
    const forward = isRightToLeft ? val < 0 : val > 0;
    return forward ? "flow-forward" : "flow-reverse";
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1000px",
        margin: "0 auto",
        fontFamily: "sans-serif",
        backgroundColor: "#1e1e1e",
        color: "white",
        padding: "20px",
        borderRadius: "12px",
      }}
    >
      <style>{`
        /* 애니메이션 이동 거리(대시 배열 크기)를 늘려 시원시원하게 움직이도록 수정 */
        @keyframes flowFwd { to { stroke-dashoffset: -40; } }
        @keyframes flowRev { to { stroke-dashoffset: 40; } }
        .flow-forward { animation: flowFwd 0.6s linear infinite; }
        .flow-reverse { animation: flowRev 0.6s linear infinite; }
        
        /* 대시(점선)의 길이와 간격을 키움 (20px 선, 20px 공백) */
        .power-line { 
          stroke: #4ade80; 
          stroke-dasharray: 20, 20; 
          stroke-linecap: round; 
          transition: stroke-width 0.3s ease;
        }
        .power-line.reverse { stroke: #3b82f6; }
        .power-line.heat { stroke: #ef4444; }
      `}</style>

      <h2
        style={{ textAlign: "center", margin: "0 0 20px 0", fontSize: "24px" }}
      >
        유도기 동작 모드별 전력 흐름
      </h2>

      {/* 컨트롤 패널 */}
      <div
        style={{
          backgroundColor: "#2d2d2d",
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <label style={{ fontWeight: "bold", fontSize: "20px" }}>
            슬립 (s): {slip.toFixed(2)}
          </label>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => setSlip(-0.5)}
              style={{
                padding: "10px 16px",
                fontSize: "16px",
                fontWeight: "bold",
                cursor: "pointer",
                backgroundColor: slip < 0 ? "#3b82f6" : "#444",
                color: "white",
                border: "none",
                borderRadius: "6px",
              }}
            >
              발전기 (-0.5)
            </button>
            <button
              onClick={() => setSlip(0.5)}
              style={{
                padding: "10px 16px",
                fontSize: "16px",
                fontWeight: "bold",
                cursor: "pointer",
                backgroundColor: slip > 0 && slip < 1 ? "#4ade80" : "#444",
                color: "white",
                border: "none",
                borderRadius: "6px",
              }}
            >
              전동기 (0.5)
            </button>
            <button
              onClick={() => setSlip(1.5)}
              style={{
                padding: "10px 16px",
                fontSize: "16px",
                fontWeight: "bold",
                cursor: "pointer",
                backgroundColor: slip > 1 ? "#ef4444" : "#444",
                color: "white",
                border: "none",
                borderRadius: "6px",
              }}
            >
              플러깅 (1.5)
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
          style={{ width: "100%", cursor: "pointer", height: "8px" }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "14px",
            color: "#aaa",
            marginTop: "10px",
            fontWeight: "bold",
          }}
        >
          <span>-1.0 (발전)</span>
          <span>0 (동기속도)</span>
          <span>1.0 (정지)</span>
          <span>2.0 (제동/역전)</span>
        </div>
      </div>

      {/* 모드 설명 패널 */}
      <div
        style={{
          textAlign: "center",
          marginBottom: "30px",
          padding: "20px",
          backgroundColor: "#333",
          borderRadius: "8px",
          minHeight: "90px",
        }}
      >
        <h3
          style={{ margin: "0 0 10px 0", color: "#facc15", fontSize: "22px" }}
        >
          {modeTitle}
        </h3>
        <p style={{ margin: 0, fontSize: "18px", lineHeight: "1.5" }}>
          {description}
        </p>
      </div>

      {/* 대폭 확대된 SVG 블록 다이어그램 */}
      <div
        style={{
          width: "100%",
          overflowX: "auto",
          backgroundColor: "#1a1a1a",
          padding: "20px 0",
          borderRadius: "12px",
        }}
      >
        <svg
          viewBox="0 0 1200 500"
          style={{ width: "100%", height: "auto", display: "block" }}
        >
          {/* 블록 정의 (크기 대폭 확대: 180x100) */}
          <g transform="translate(40, 100)">
            <rect
              width="180"
              height="100"
              rx="12"
              fill="#374151"
              stroke="#9ca3af"
              strokeWidth="3"
            />
            <text
              x="90"
              y="45"
              fill="white"
              textAnchor="middle"
              fontSize="22"
              fontWeight="bold"
            >
              전원
            </text>
            <text
              x="90"
              y="75"
              fill="#d1d5db"
              textAnchor="middle"
              fontSize="18"
            >
              (Grid)
            </text>
          </g>

          <g transform="translate(360, 100)">
            <rect
              width="180"
              height="100"
              rx="12"
              fill="#4b5563"
              stroke="#9ca3af"
              strokeWidth="3"
            />
            <text
              x="90"
              y="45"
              fill="white"
              textAnchor="middle"
              fontSize="22"
              fontWeight="bold"
            >
              고정자
            </text>
            <text
              x="90"
              y="75"
              fill="#d1d5db"
              textAnchor="middle"
              fontSize="18"
            >
              (Stator)
            </text>
          </g>

          <g transform="translate(680, 100)">
            <rect
              width="180"
              height="100"
              rx="12"
              fill="#4b5563"
              stroke="#9ca3af"
              strokeWidth="3"
            />
            <text
              x="90"
              y="45"
              fill="white"
              textAnchor="middle"
              fontSize="22"
              fontWeight="bold"
            >
              회전자
            </text>
            <text
              x="90"
              y="75"
              fill="#d1d5db"
              textAnchor="middle"
              fontSize="18"
            >
              (Rotor)
            </text>
          </g>

          <g transform="translate(1000, 100)">
            <rect
              width="180"
              height="100"
              rx="12"
              fill="#374151"
              stroke="#9ca3af"
              strokeWidth="3"
            />
            <text
              x="90"
              y="45"
              fill="white"
              textAnchor="middle"
              fontSize="22"
              fontWeight="bold"
            >
              기계 부하
            </text>
            <text
              x="90"
              y="75"
              fill="#d1d5db"
              textAnchor="middle"
              fontSize="18"
            >
              (Load)
            </text>
          </g>

          <g transform="translate(680, 360)">
            <rect
              width="180"
              height="80"
              rx="12"
              fill="#7f1d1d"
              stroke="#fca5a5"
              strokeWidth="3"
            />
            <text
              x="90"
              y="48"
              fill="white"
              textAnchor="middle"
              fontSize="24"
              fontWeight="bold"
            >
              열 손실
            </text>
          </g>

          {/* ============ 전력 흐름 선 & 텍스트 ============ */}
          {/* 선의 Y축 중심은 150 (블록의 세로 중앙) */}

          {/* 1. 전원 <-> 고정자 (P_elec) */}
          <line
            x1="220"
            y1="150"
            x2="360"
            y2="150"
            className={`power-line ${Pelec < 0 ? "reverse" : ""} ${getFlowClass(Pelec)}`}
            strokeWidth={getStrokeWidth(Pelec)}
          />
          <text
            x="290"
            y="110"
            fill="white"
            textAnchor="middle"
            fontSize="22"
            fontWeight="bold"
          >
            P_elec = {Math.abs(Pelec).toFixed(0)}
          </text>
          <text
            x="290"
            y="195"
            fill={Pelec > 0 ? "#4ade80" : "#3b82f6"}
            textAnchor="middle"
            fontSize="20"
            fontWeight="bold"
          >
            {Pelec > 0 ? "전력 공급 ➔" : "⬅ 회생 반환"}
          </text>

          {/* 2. 고정자 <-> 회전자 (P2) */}
          <line
            x1="540"
            y1="150"
            x2="680"
            y2="150"
            className={`power-line ${Pelec < 0 ? "reverse" : ""} ${getFlowClass(Pelec)}`}
            strokeWidth={getStrokeWidth(P2)}
          />
          <text
            x="610"
            y="110"
            fill="white"
            textAnchor="middle"
            fontSize="22"
            fontWeight="bold"
          >
            P2 = {Math.abs(P2).toFixed(0)}
          </text>
          <text
            x="610"
            y="195"
            fill={Pelec > 0 ? "#4ade80" : "#3b82f6"}
            textAnchor="middle"
            fontSize="20"
            fontWeight="bold"
          >
            {Pelec > 0 ? "공극 전력 ➔" : "⬅ 공극 전력"}
          </text>

          {/* 3. 회전자 <-> 부하 (P_mech) */}
          <line
            x1="860"
            y1="150"
            x2="1000"
            y2="150"
            className={`power-line ${Pmech < 0 ? "reverse" : ""} ${getFlowClass(Pmech)}`}
            strokeWidth={getStrokeWidth(Pmech)}
          />
          <text
            x="930"
            y="110"
            fill="white"
            textAnchor="middle"
            fontSize="22"
            fontWeight="bold"
          >
            P_mech = {Math.abs(Pmech).toFixed(0)}
          </text>
          <text
            x="930"
            y="195"
            fill={Pmech > 0 ? "#4ade80" : "#3b82f6"}
            textAnchor="middle"
            fontSize="20"
            fontWeight="bold"
          >
            {Pmech > 0 ? "동력 출력 ➔" : "⬅ 외부 동력"}
          </text>

          {/* 4. 회전자 -> 열 손실 (P_loss) */}
          <line
            x1="770"
            y1="200"
            x2="770"
            y2="360"
            className={`power-line heat flow-forward`}
            strokeWidth={getStrokeWidth(Ploss)}
          />
          <rect
            x="795"
            y="250"
            width="160"
            height="40"
            rx="8"
            fill="#1a1a1a"
            opacity="0.8"
          />
          <text
            x="875"
            y="278"
            fill="#ef4444"
            textAnchor="middle"
            fontSize="22"
            fontWeight="bold"
          >
            P_loss = {Ploss.toFixed(0)}
          </text>
          {/* 하단 화살표 기호 추가 */}
          <text
            x="730"
            y="285"
            fill="#ef4444"
            textAnchor="middle"
            fontSize="35"
          >
            ⬇
          </text>
        </svg>
      </div>
    </div>
  );
}
