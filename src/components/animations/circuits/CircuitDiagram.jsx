const CircuitDiagram = ({
  activeR,
  valR,
  activeL,
  valL,
  activeC,
  valC,
  vPeak,
  freq,
}) => {
  return (
    <div
      style={{
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        marginBottom: "20px",
        backgroundColor: "#fff",
        textAlign: "center",
      }}
    >
      <h3 style={{ marginTop: 0, textAlign: "left" }}>2. 구성된 직렬 회로도</h3>

      {/* SVG를 이용한 동적 회로도 렌더링 */}
      <svg
        width="400"
        height="200"
        viewBox="0 0 400 200"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g stroke="#334155" strokeWidth="2" fill="none">
          {/* 교류 전압원 (AC Source) */}
          <circle cx="50" cy="100" r="20" />
          <path d="M 35 100 Q 42.5 85 50 100 T 65 100" strokeWidth="1.5" />
          <text x="80" y="95" fontSize="12" fill="#64748b" stroke="none">
            교류 전원
          </text>
          <text
            x="80"
            y="115"
            fontSize="14"
            fontWeight="bold"
            fill="#0f172a"
            stroke="none"
          >
            {vPeak}V, {freq}Hz
          </text>

          {/* 왼쪽 전선 */}
          <line x1="50" y1="40" x2="50" y2="80" />
          <line x1="50" y1="120" x2="50" y2="160" />

          {/* 아래쪽 전선 */}
          <line x1="50" y1="160" x2="350" y2="160" />

          {/* 오른쪽 전선 */}
          <line x1="350" y1="40" x2="350" y2="160" />

          {/* 위쪽 전선 및 소자들 (x: 50 ~ 350) */}

          {/* 전원 ~ 저항 사이 전선 */}
          <line x1="50" y1="40" x2="90" y2="40" />

          {/* 1. 저항 (R) 그리기 */}
          {activeR ? (
            <g>
              <path
                d="M 90 40 L 95 30 L 105 50 L 115 30 L 125 50 L 130 40"
                stroke="#f59e0b"
              />
              <text
                x="110"
                y="20"
                textAnchor="middle"
                fontSize="14"
                fill="#d97706"
                stroke="none"
                fontWeight="bold"
              >
                R = {valR}Ω
              </text>
            </g>
          ) : (
            <line x1="90" y1="40" x2="130" y2="40" />
          )}

          {/* 저항 ~ 코일 사이 전선 */}
          <line x1="130" y1="40" x2="170" y2="40" />

          {/* 2. 코일 (L) 그리기 */}
          {activeL ? (
            <g>
              {/* 코일의 꼬불꼬불한 모양 (베지에 곡선) */}
              <path
                d="M 170 40 Q 175 20 180 40 Q 185 20 190 40 Q 195 20 200 40 Q 205 20 210 40"
                stroke="#3b82f6"
              />
              <text
                x="190"
                y="20"
                textAnchor="middle"
                fontSize="14"
                fill="#2563eb"
                stroke="none"
                fontWeight="bold"
              >
                L = {valL}mH
              </text>
            </g>
          ) : (
            <line x1="170" y1="40" x2="210" y2="40" />
          )}

          {/* 코일 ~ 콘덴서 사이 전선 */}
          <line x1="210" y1="40" x2="250" y2="40" />

          {/* 3. 콘덴서 (C) 그리기 */}
          {activeC ? (
            <g>
              <line x1="250" y1="40" x2="265" y2="40" />
              <line
                x1="265"
                y1="25"
                x2="265"
                y2="55"
                stroke="#10b981"
                strokeWidth="3"
              />
              <line
                x1="275"
                y1="25"
                x2="275"
                y2="55"
                stroke="#10b981"
                strokeWidth="3"
              />
              <line x1="275" y1="40" x2="290" y2="40" />
              <text
                x="270"
                y="20"
                textAnchor="middle"
                fontSize="14"
                fill="#059669"
                stroke="none"
                fontWeight="bold"
              >
                C = {valC}μF
              </text>
            </g>
          ) : (
            <line x1="250" y1="40" x2="290" y2="40" />
          )}

          {/* 콘덴서 ~ 우측 끝 전선 */}
          <line x1="290" y1="40" x2="350" y2="40" />
        </g>
      </svg>
    </div>
  );
};

export default CircuitDiagram;
