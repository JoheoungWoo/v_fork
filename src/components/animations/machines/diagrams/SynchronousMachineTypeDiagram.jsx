export default function SynchronousMachineTypeDiagram() {
  return (
    <section
      style={{
        margin: "16px 20px",
        padding: 0,
        borderRadius: "16px",
        overflow: "hidden",
        border: "1px solid rgba(244, 114, 182, 0.22)",
        boxShadow:
          "0 18px 40px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255,255,255,0.06)",
        background:
          "linear-gradient(145deg, #2a1a2a 0%, #1b1420 45%, #120f17 100%)",
      }}
    >
      <div
        style={{
          padding: "22px 26px 8px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: "11px",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "rgba(244, 114, 182, 0.9)",
            fontWeight: 700,
          }}
        >
          Synchronous Machine · Classification
        </p>
        <h4
          style={{
            margin: "8px 0 0",
            fontSize: "clamp(22px, 3.2vw, 28px)",
            fontWeight: 800,
            color: "#fff4fb",
            lineHeight: 1.25,
            letterSpacing: "-0.02em",
          }}
        >
          동기기의 종류
        </h4>
        <p
          style={{
            margin: "12px 0 0",
            fontSize: "14px",
            lineHeight: 1.65,
            color: "rgba(238, 213, 236, 0.92)",
            maxWidth: "52rem",
            wordBreak: "keep-all",
          }}
        >
          에너지 흐름(발전/전동), 회전자 구조(돌극/원통), 여자 방식(직류/영구자석)으로
          분류합니다.
        </p>
      </div>

      <div style={{ padding: "12px 8px 20px", overflowX: "auto" }}>
        <svg
          width="100%"
          height="390"
          viewBox="0 0 900 390"
          role="img"
          aria-label="동기기 분류 계층도"
          style={{ display: "block", minWidth: "620px" }}
        >
          <defs>
            <linearGradient id="smRoot" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#b83280" />
              <stop offset="100%" stopColor="#97266d" />
            </linearGradient>
            <linearGradient id="smTop" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#553c9a" />
              <stop offset="100%" stopColor="#3c2a6f" />
            </linearGradient>
            <linearGradient id="smBottom" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7b341e" />
              <stop offset="100%" stopColor="#5f2a17" />
            </linearGradient>
            <linearGradient id="smChild" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4a3957" />
              <stop offset="100%" stopColor="#32283f" />
            </linearGradient>
            <filter id="smShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow
                dx="0"
                dy="4"
                stdDeviation="6"
                floodColor="#000"
                floodOpacity="0.35"
              />
            </filter>
          </defs>

          <g
            fill="none"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M 118 118 C 210 118, 210 118, 252 158" stroke="#f687b3" opacity="0.92" />
            <path d="M 118 118 C 210 118, 210 118, 252 248" stroke="#f6ad55" opacity="0.9" />
            <path d="M 402 158 C 445 158, 445 158, 486 128" stroke="#9f7aea" opacity="0.88" />
            <path d="M 402 158 C 445 158, 445 158, 486 188" stroke="#68d391" opacity="0.88" />
            <path d="M 402 248 C 445 248, 445 248, 486 248" stroke="#f6ad55" opacity="0.88" />
          </g>

          <g filter="url(#smShadow)">
            <rect x="28" y="78" width="180" height="56" rx="14" fill="url(#smRoot)" />
            <text x="118" y="108" textAnchor="middle" fill="#fff" fontSize="17" fontWeight="800">
              동기기
            </text>
            <text x="118" y="126" textAnchor="middle" fill="rgba(255,240,248,0.75)" fontSize="10">
              Synchronous machine
            </text>
          </g>

          <g filter="url(#smShadow)">
            <rect x="252" y="132" width="140" height="52" rx="12" fill="url(#smTop)" />
            <text x="322" y="164" textAnchor="middle" fill="#f7f2ff" fontSize="15" fontWeight="700">
              동기발전기
            </text>
            <text x="322" y="178" textAnchor="middle" fill="rgba(235,224,255,0.72)" fontSize="9.5">
              Alternator
            </text>
          </g>

          <g filter="url(#smShadow)">
            <rect x="252" y="222" width="140" height="52" rx="12" fill="url(#smBottom)" />
            <text x="322" y="254" textAnchor="middle" fill="#fff7ed" fontSize="15" fontWeight="700">
              동기전동기
            </text>
            <text x="322" y="268" textAnchor="middle" fill="rgba(254,243,226,0.74)" fontSize="9.5">
              Synchronous motor
            </text>
          </g>

          {[
            { x: 486, y: 104, k: "돌극형", e: "Salient pole", c: "#9f7aea" },
            { x: 486, y: 164, k: "원통형", e: "Cylindrical rotor", c: "#68d391" },
            { x: 486, y: 224, k: "영구자석형", e: "PMSM", c: "#f6ad55" },
          ].map((n) => (
            <g key={n.k} filter="url(#smShadow)">
              <rect
                x={n.x}
                y={n.y}
                width="146"
                height="48"
                rx="12"
                fill="url(#smChild)"
                stroke={n.c}
                strokeOpacity="0.6"
                strokeWidth="1.5"
              />
              <text
                x={n.x + 73}
                y={n.y + 28}
                textAnchor="middle"
                fill="#f7fafc"
                fontSize="14"
                fontWeight="700"
              >
                {n.k}
              </text>
              <text
                x={n.x + 73}
                y={n.y + 42}
                textAnchor="middle"
                fill="rgba(226, 232, 240, 0.65)"
                fontSize="9.5"
              >
                {n.e}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </section>
  );
}
