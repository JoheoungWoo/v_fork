/**
 * 유도전동기 분류도 — DC 분류도와 동일한 UI 언어(직접 설계 SVG).
 */
export default function InductionMotorTypeDiagram() {
  return (
    <section
      style={{
        margin: "16px 20px",
        padding: 0,
        borderRadius: "16px",
        overflow: "hidden",
        border: "1px solid rgba(129, 230, 217, 0.22)",
        boxShadow:
          "0 18px 40px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255,255,255,0.06)",
        background:
          "linear-gradient(145deg, #1a2a28 0%, #121c1f 45%, #0f1818 100%)",
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
            color: "rgba(129, 230, 217, 0.9)",
            fontWeight: 700,
          }}
        >
          Induction Machine · Classification
        </p>
        <h4
          style={{
            margin: "8px 0 0",
            fontSize: "clamp(22px, 3.2vw, 28px)",
            fontWeight: 800,
            color: "#f0faf8",
            lineHeight: 1.25,
            letterSpacing: "-0.02em",
          }}
        >
          유도전동기의 종류
        </h4>
        <p
          style={{
            margin: "12px 0 0",
            fontSize: "14px",
            lineHeight: 1.65,
            color: "rgba(203, 230, 224, 0.92)",
            maxWidth: "52rem",
            wordBreak: "keep-all",
          }}
        >
          상수·<strong style={{ color: "#81e6d9" }}>회전자 구조</strong>·
          <strong style={{ color: "#81e6d9" }}>전원(3상/단상)</strong>에 따라
          대표적으로 아래와 같이 나눕니다. 하단 카드에서 세부 유형을 선택하세요.
        </p>
      </div>

      <div style={{ padding: "12px 8px 20px", overflowX: "auto" }}>
        <svg
          width="100%"
          height="400"
          viewBox="0 0 900 400"
          role="img"
          aria-label="유도전동기 분류 계층도"
          style={{ display: "block", minWidth: "620px" }}
        >
          <defs>
            <linearGradient id="imRoot" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2c7a7b" />
              <stop offset="100%" stopColor="#234e52" />
            </linearGradient>
            <linearGradient id="im3ph" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#276749" />
              <stop offset="100%" stopColor="#1c4532" />
            </linearGradient>
            <linearGradient id="im1ph" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#744210" />
              <stop offset="100%" stopColor="#5c370d" />
            </linearGradient>
            <linearGradient id="imChild" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3d5a5e" />
              <stop offset="100%" stopColor="#2a3f42" />
            </linearGradient>
            <filter id="imShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow
                dx="0"
                dy="4"
                stdDeviation="6"
                floodColor="#000"
                floodOpacity="0.35"
              />
            </filter>
          </defs>

          <g opacity="0.06">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <line
                key={`g-${i}`}
                x1={i * 110}
                y1={0}
                x2={i * 110}
                y2={400}
                stroke="#fff"
                strokeWidth="1"
              />
            ))}
          </g>

          <g
            fill="none"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path
              d="M 118 118 C 210 118, 210 118, 252 168"
              stroke="#4fd1c5"
              opacity="0.9"
            />
            <path
              d="M 118 118 C 210 118, 210 118, 252 268"
              stroke="#f6ad55"
              opacity="0.9"
            />
            <path
              d="M 402 168 C 440 168, 440 168, 478 138"
              stroke="#68d391"
              opacity="0.88"
            />
            <path
              d="M 402 168 C 440 168, 440 168, 478 198"
              stroke="#63b3ed"
              opacity="0.88"
            />
          </g>

          {/* 루트 */}
          <g filter="url(#imShadow)">
            <rect
              x="28"
              y="78"
              width="180"
              height="56"
              rx="14"
              fill="url(#imRoot)"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="1.5"
            />
            <text
              x="118"
              y="108"
              textAnchor="middle"
              fill="#fff"
              fontSize="17"
              fontWeight="800"
              fontFamily="system-ui, sans-serif"
            >
              유도전동기
            </text>
            <text
              x="118"
              y="126"
              textAnchor="middle"
              fill="rgba(230,255,251,0.75)"
              fontSize="10"
              fontFamily="system-ui, sans-serif"
            >
              Induction motor
            </text>
          </g>

          {/* 3상 */}
          <g filter="url(#imShadow)">
            <rect
              x="252"
              y="142"
              width="140"
              height="52"
              rx="12"
              fill="url(#im3ph)"
              stroke="rgba(104, 211, 145, 0.45)"
              strokeWidth="1.5"
            />
            <text
              x="322"
              y="174"
              textAnchor="middle"
              fill="#f0fff4"
              fontSize="15"
              fontWeight="700"
              fontFamily="system-ui, sans-serif"
            >
              3상 유도전동기
            </text>
            <text
              x="322"
              y="188"
              textAnchor="middle"
              fill="rgba(230,255,237,0.7)"
              fontSize="9.5"
              fontFamily="system-ui, sans-serif"
            >
              Three-phase
            </text>
          </g>

          {/* 단상 */}
          <g filter="url(#imShadow)">
            <rect
              x="252"
              y="242"
              width="140"
              height="52"
              rx="12"
              fill="url(#im1ph)"
              stroke="rgba(246, 173, 85, 0.5)"
              strokeWidth="1.5"
            />
            <text
              x="322"
              y="274"
              textAnchor="middle"
              fill="#fffaf0"
              fontSize="15"
              fontWeight="700"
              fontFamily="system-ui, sans-serif"
            >
              단상 유도전동기
            </text>
            <text
              x="322"
              y="288"
              textAnchor="middle"
              fill="rgba(254, 252, 232, 0.72)"
              fontSize="9.5"
              fontFamily="system-ui, sans-serif"
            >
              Single-phase
            </text>
          </g>

          {/* 케이지 / 권선 */}
          {[
            { x: 478, y: 114, k: "케이지형", e: "Squirrel cage", c: "#68d391" },
            { x: 478, y: 174, k: "권선형", e: "Wound rotor", c: "#63b3ed" },
          ].map((n) => (
            <g key={n.k} filter="url(#imShadow)">
              <rect
                x={n.x}
                y={n.y}
                width="132"
                height="48"
                rx="12"
                fill="url(#imChild)"
                stroke={n.c}
                strokeOpacity="0.55"
                strokeWidth="1.5"
              />
              <text
                x={n.x + 66}
                y={n.y + 28}
                textAnchor="middle"
                fill="#f7fafc"
                fontSize="14"
                fontWeight="700"
                fontFamily="system-ui, sans-serif"
              >
                {n.k}
              </text>
              <text
                x={n.x + 66}
                y={n.y + 42}
                textAnchor="middle"
                fill="rgba(226, 232, 240, 0.65)"
                fontSize="9.5"
                fontFamily="system-ui, sans-serif"
              >
                {n.e}
              </text>
            </g>
          ))}

          {/* 단상 하위 */}
          <g filter="url(#imShadow)">
            <rect
              x="478"
              y="244"
              width="132"
              height="44"
              rx="12"
              fill="url(#imChild)"
              stroke="rgba(246, 173, 85, 0.55)"
              strokeWidth="1.5"
            />
            <text
              x="544"
              y="268"
              textAnchor="middle"
              fill="#fffaf0"
              fontSize="13"
              fontWeight="700"
              fontFamily="system-ui, sans-serif"
            >
              분권·축콘덴서
            </text>
            <text
              x="544"
              y="282"
              textAnchor="middle"
              fill="rgba(254, 252, 232, 0.7)"
              fontSize="9"
              fontFamily="system-ui, sans-serif"
            >
              저항·콘덴서 시동
            </text>
          </g>

          <g transform="translate(28, 348)">
            {[
              { c: "#4fd1c5", t: "3상 회전자계" },
              { c: "#68d391", t: "케이지 = 단락봉" },
              { c: "#63b3ed", t: "권선 = 슬립·외부 R" },
            ].map((b, i) => (
              <g key={b.t} transform={`translate(${i * 132}, 0)`}>
                <rect x="0" y="0" width="10" height="10" rx="3" fill={b.c} opacity="0.95" />
                <text
                  x="16"
                  y="9"
                  fill="rgba(226, 232, 240, 0.85)"
                  fontSize="10"
                  fontFamily="system-ui, sans-serif"
                >
                  {b.t}
                </text>
              </g>
            ))}
          </g>
        </svg>
      </div>
    </section>
  );
}
