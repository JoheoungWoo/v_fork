export default function ShuntEquivalentCircuit({ isLoad }) {
  return (
    <div
      style={{
        flex: "1 1 400px",
        height: "350px",
        backgroundColor: "#1c1f26",
        position: "relative",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          zIndex: 1,
          color: "#fff",
          background: "#000a",
          padding: "5px 10px",
          borderRadius: "4px",
          fontSize: "12px",
        }}
      >
        [회로도] 분권 발전기 등가 회로
      </div>

      <style>
        {`
          @keyframes dash { to { stroke-dashoffset: -20; } }
          .flowing { stroke-dasharray: 5 5; animation: dash 0.5s linear infinite; }
        `}
      </style>

      <svg width="450" height="300" viewBox="0 0 450 300">
        <line x1="80" y1="50" x2="350" y2="50" stroke="#aaa" strokeWidth="2" />
        <line x1="80" y1="250" x2="350" y2="250" stroke="#aaa" strokeWidth="2" />

        <line x1="80" y1="50" x2="80" y2="100" stroke="#aaa" strokeWidth="2" />
        <path
          d="M 80 100 Q 100 110 80 120 Q 60 130 80 140 Q 100 150 80 160 Q 60 170 80 180"
          fill="none"
          stroke="#3498db"
          strokeWidth="3"
        />
        <line x1="80" y1="180" x2="80" y2="250" stroke="#aaa" strokeWidth="2" />
        <text x="35" y="145" fill="#3498db" fontSize="14" fontWeight="bold">
          Rf
        </text>

        <path d="M 75 70 L 80 80 L 85 70" fill="none" stroke="#3498db" strokeWidth="2" />
        <text x="50" y="75" fill="#3498db" fontSize="14" fontWeight="bold">
          If
        </text>

        <line x1="200" y1="50" x2="200" y2="80" stroke="#aaa" strokeWidth="2" />
        <path
          d="M 200 80 L 190 90 L 210 105 L 190 120 L 210 135 L 200 145"
          fill="none"
          stroke="#e74c3c"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <text x="220" y="115" fill="#e74c3c" fontSize="14" fontWeight="bold">
          Ra
        </text>

        <circle cx="200" cy="185" r="30" fill="#2c3e50" stroke="#f1c40f" strokeWidth="2" />
        <text
          x="200"
          y="190"
          fill="#f1c40f"
          fontSize="18"
          textAnchor="middle"
          fontWeight="bold"
        >
          E
        </text>
        <text x="240" y="170" fill="#fff" fontSize="16">
          +
        </text>
        <text x="240" y="210" fill="#fff" fontSize="16">
          -
        </text>
        <line x1="200" y1="215" x2="200" y2="250" stroke="#aaa" strokeWidth="2" />

        <path d="M 195 65 L 200 55 L 205 65" fill="none" stroke="#e74c3c" strokeWidth="2" />
        <text x="175" y="65" fill="#e74c3c" fontSize="14" fontWeight="bold">
          Ia
        </text>

        <line x1="350" y1="50" x2="350" y2="100" stroke="#aaa" strokeWidth="2" />
        {isLoad ? (
          <line x1="350" y1="100" x2="350" y2="130" stroke="#2ecc71" strokeWidth="3" />
        ) : (
          <line x1="350" y1="100" x2="320" y2="120" stroke="#e74c3c" strokeWidth="3" />
        )}

        <rect
          x="330"
          y="130"
          width="40"
          height="80"
          fill={isLoad ? "#2ecc71" : "#555"}
          stroke="#fff"
          strokeWidth="2"
        />
        <text
          x="350"
          y="175"
          fill="#fff"
          fontSize="14"
          textAnchor="middle"
          fontWeight="bold"
        >
          부하
        </text>
        <line x1="350" y1="210" x2="350" y2="250" stroke="#aaa" strokeWidth="2" />

        <path
          d="M 390 50 L 390 250"
          fill="none"
          stroke="#fff"
          strokeWidth="1"
          strokeDasharray="3 3"
        />
        <polygon points="387,60 393,60 390,50" fill="#fff" />
        <polygon points="387,240 393,240 390,250" fill="#fff" />
        <text x="405" y="155" fill="#fff" fontSize="16" fontWeight="bold">
          V
        </text>

        {isLoad && (
          <>
            <path d="M 345 80 L 350 90 L 355 80" fill="none" stroke="#2ecc71" strokeWidth="2" />
            <text x="365" y="85" fill="#2ecc71" fontSize="14" fontWeight="bold">
              I
            </text>
          </>
        )}

        <circle cx="80" cy="50" r="4" fill="#fff" />
        <circle cx="200" cy="50" r="4" fill="#fff" />
        <circle cx="350" cy="50" r="4" fill="#fff" />
        <circle cx="80" cy="250" r="4" fill="#fff" />
        <circle cx="200" cy="250" r="4" fill="#fff" />
        <circle cx="350" cy="250" r="4" fill="#fff" />

        <path
          d="M 200 45 L 80 45 L 80 100"
          fill="none"
          stroke="#3498db"
          strokeWidth="2"
          className="flowing"
        />
        {isLoad && (
          <path
            d="M 200 45 L 350 45 L 350 100"
            fill="none"
            stroke="#2ecc71"
            strokeWidth="2"
            className="flowing"
          />
        )}
      </svg>
    </div>
  );
}
