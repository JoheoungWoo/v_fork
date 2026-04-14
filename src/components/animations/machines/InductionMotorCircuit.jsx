const InductionMotorCircuit = ({ params, slip }) => {
  const { rs, xs, rr, xr, xm } = params;

  // 슬립에 따른 유효 로터 저항 계산 (Rr / s)
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
          {/* 기본 회로선 */}
          <g stroke="#334155" strokeWidth="2" fill="none">
            {/* 입력 전압원 부분 */}
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

            {/* 고정자 저항 Rs */}
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

            {/* 고정자 리액턴스 Xs */}
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

            {/* 자화 리액턴스 Xm (병렬) */}
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

            {/* 회전자 리액턴스 Xr' */}
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

            {/* 회전자 저항 Rr'/s (동적 변화) */}
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
          • <strong>Rr'/s</strong>: 슬립($s$)이 작아질수록(속도가 빨라질수록)
          로터의 등가 저항이 커져 전류가 감소합니다.
        </p>
        <p>
          • <strong>동기 속도($s=0$)</strong>에서는 저항이 무한대가 되어 로터로
          에너지가 전달되지 않습니다.
        </p>
      </div>
    </div>
  );
};

export default InductionMotorCircuit;
