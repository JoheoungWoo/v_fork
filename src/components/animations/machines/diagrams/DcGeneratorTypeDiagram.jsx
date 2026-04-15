/**
 * DC발전기 분류도 — 교재 캡처가 아닌 UI 전용 계층 트리(직접 SVG 설계).
 */
export default function DcGeneratorTypeDiagram() {
  return (
    <section
      style={{
        margin: "16px 20px",
        padding: 0,
        borderRadius: "16px",
        overflow: "hidden",
        border: "1px solid rgba(106, 184, 255, 0.25)",
        boxShadow:
          "0 18px 40px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255,255,255,0.06)",
        background:
          "linear-gradient(145deg, #1a2332 0%, #121820 45%, #0f141c 100%)",
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
            color: "rgba(154, 216, 255, 0.85)",
            fontWeight: 700,
          }}
        >
          DC Machine · Classification
        </p>
        <h4
          style={{
            margin: "8px 0 0",
            fontSize: "clamp(22px, 3.2vw, 28px)",
            fontWeight: 800,
            color: "#f0f4fa",
            lineHeight: 1.25,
            letterSpacing: "-0.02em",
          }}
        >
          DC발전기의 종류
        </h4>
        <p
          style={{
            margin: "12px 0 0",
            fontSize: "14px",
            lineHeight: 1.65,
            color: "rgba(203, 214, 230, 0.92)",
            maxWidth: "52rem",
            wordBreak: "keep-all",
          }}
        >
          계자 권선과 전기자 권선의<strong style={{ color: "#9ad8ff" }}> 연결 방법</strong>
          에 따라 아래와 같이 구분합니다. 하단 카드에서 타입을 눌러 등가회로·실행 패널을
          확인하세요.
        </p>
      </div>

      <div style={{ padding: "12px 8px 20px", overflowX: "auto" }}>
        <svg
          width="100%"
          height="420"
          viewBox="0 0 920 420"
          role="img"
          aria-label="DC발전기 분류 계층도"
          style={{ display: "block", minWidth: "640px" }}
        >
          <defs>
            <linearGradient id="dcNodeRoot" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2b6cb0" />
              <stop offset="100%" stopColor="#1e4e8c" />
            </linearGradient>
            <linearGradient id="dcNodeSep" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4a5568" />
              <stop offset="100%" stopColor="#2d3748" />
            </linearGradient>
            <linearGradient id="dcNodeSelf" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#276749" />
              <stop offset="100%" stopColor="#1c4532" />
            </linearGradient>
            <linearGradient id="dcNodeChild" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3d4f6f" />
              <stop offset="100%" stopColor="#2a3548" />
            </linearGradient>
            <linearGradient id="dcNodeCompound" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#744210" />
              <stop offset="100%" stopColor="#5c370d" />
            </linearGradient>
            <filter id="dcSoftShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow
                dx="0"
                dy="4"
                stdDeviation="6"
                floodColor="#000"
                floodOpacity="0.35"
              />
            </filter>
            <filter id="dcGlowLine" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="1.2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="dcLineBlue" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#63b3ed" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#63b3ed" stopOpacity="0.95" />
            </linearGradient>
          </defs>

          {/* 배경 그리드 힌트 */}
          <g opacity="0.07">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
              <line
                key={`g-${i}`}
                x1={i * 100}
                y1={0}
                x2={i * 100}
                y2={420}
                stroke="#fff"
                strokeWidth="1"
              />
            ))}
          </g>

          {/* 연결선 — 곡선 + 라운드 조인 */}
          <g
            fill="none"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#dcGlowLine)"
          >
            <path
              d="M 118 118 C 200 118, 200 118, 248 152"
              stroke="url(#dcLineBlue)"
            />
            <path
              d="M 118 118 C 200 118, 200 118, 248 248"
              stroke="#63b3ed"
              opacity="0.9"
            />
            <path
              d="M 398 248 C 430 248, 430 248, 468 168"
              stroke="#68d391"
              opacity="0.85"
            />
            <path
              d="M 398 248 L 468 248"
              stroke="#68d391"
              opacity="0.85"
            />
            <path
              d="M 398 248 C 430 248, 430 248, 468 328"
              stroke="#68d391"
              opacity="0.85"
            />
            <path
              d="M 618 328 C 650 328, 650 328, 688 298"
              stroke="#f6ad55"
              opacity="0.9"
            />
            <path
              d="M 618 328 C 650 328, 650 328, 688 358"
              stroke="#fc8181"
              opacity="0.9"
            />
          </g>

          {/* 루트 */}
          <g filter="url(#dcSoftShadow)">
            <rect
              x="28"
              y="78"
              width="180"
              height="56"
              rx="14"
              fill="url(#dcNodeRoot)"
              stroke="rgba(255,255,255,0.22)"
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
              DC발전기
            </text>
            <text
              x="118"
              y="126"
              textAnchor="middle"
              fill="rgba(255,255,255,0.75)"
              fontSize="10"
              fontFamily="system-ui, sans-serif"
            >
              직류 발전기
            </text>
          </g>

          {/* 타여자 */}
          <g filter="url(#dcSoftShadow)">
            <rect
              x="248"
              y="124"
              width="132"
              height="52"
              rx="12"
              fill="url(#dcNodeSep)"
              stroke="rgba(160, 174, 192, 0.45)"
              strokeWidth="1.5"
            />
            <text
              x="314"
              y="156"
              textAnchor="middle"
              fill="#edf2f7"
              fontSize="15"
              fontWeight="700"
              fontFamily="system-ui, sans-serif"
            >
              타여자
            </text>
            <text
              x="314"
              y="170"
              textAnchor="middle"
              fill="rgba(226, 232, 240, 0.65)"
              fontSize="9.5"
              fontFamily="system-ui, sans-serif"
            >
              Separately excited
            </text>
          </g>

          {/* 자여자 */}
          <g filter="url(#dcSoftShadow)">
            <rect
              x="248"
              y="220"
              width="132"
              height="52"
              rx="12"
              fill="url(#dcNodeSelf)"
              stroke="rgba(104, 211, 145, 0.45)"
              strokeWidth="1.5"
            />
            <text
              x="314"
              y="252"
              textAnchor="middle"
              fill="#f0fff4"
              fontSize="15"
              fontWeight="700"
              fontFamily="system-ui, sans-serif"
            >
              자여자
            </text>
            <text
              x="314"
              y="266"
              textAnchor="middle"
              fill="rgba(230, 255, 237, 0.7)"
              fontSize="9.5"
              fontFamily="system-ui, sans-serif"
            >
              Self-excited
            </text>
          </g>

          {/* 분권 · 직권 · 복권 */}
          {[
            { x: 468, y: 140, label: "분권", sub: "Shunt", accent: "#63b3ed" },
            { x: 468, y: 220, label: "직권", sub: "Series", accent: "#68d391" },
            { x: 468, y: 300, label: "복권", sub: "Compound", accent: "#f6ad55" },
          ].map((n) => (
            <g key={n.label} filter="url(#dcSoftShadow)">
              <rect
                x={n.x}
                y={n.y}
                width="128"
                height="48"
                rx="12"
                fill="url(#dcNodeChild)"
                stroke={n.accent}
                strokeOpacity="0.55"
                strokeWidth="1.5"
              />
              <text
                x={n.x + 64}
                y={n.y + 28}
                textAnchor="middle"
                fill="#f7fafc"
                fontSize="14"
                fontWeight="700"
                fontFamily="system-ui, sans-serif"
              >
                {n.label}
              </text>
              <text
                x={n.x + 64}
                y={n.y + 42}
                textAnchor="middle"
                fill="rgba(226, 232, 240, 0.65)"
                fontSize="9.5"
                fontFamily="system-ui, sans-serif"
              >
                {n.sub}
              </text>
            </g>
          ))}

          {/* 내분권 · 외분권 */}
          <g filter="url(#dcSoftShadow)">
            <rect
              x="688"
              y="268"
              width="124"
              height="46"
              rx="12"
              fill="url(#dcNodeCompound)"
              stroke="rgba(246, 173, 85, 0.65)"
              strokeWidth="1.5"
            />
            <text
              x="750"
              y="294"
              textAnchor="middle"
              fill="#fffaf0"
              fontSize="13"
              fontWeight="700"
              fontFamily="system-ui, sans-serif"
            >
              내분권
            </text>
            <text
              x="750"
              y="308"
              textAnchor="middle"
              fill="rgba(254, 252, 232, 0.7)"
              fontSize="9"
              fontFamily="system-ui, sans-serif"
            >
              단권 · 가산
            </text>
          </g>

          <g filter="url(#dcSoftShadow)">
            <rect
              x="688"
              y="328"
              width="124"
              height="46"
              rx="12"
              fill="url(#dcNodeCompound)"
              stroke="rgba(252, 129, 129, 0.65)"
              strokeWidth="1.5"
            />
            <text
              x="750"
              y="354"
              textAnchor="middle"
              fill="#fff5f5"
              fontSize="13"
              fontWeight="700"
              fontFamily="system-ui, sans-serif"
            >
              외분권
            </text>
            <text
              x="750"
              y="368"
              textAnchor="middle"
              fill="rgba(254, 226, 226, 0.75)"
              fontSize="9"
              fontFamily="system-ui, sans-serif"
            >
              장권 · 감산
            </text>
          </g>

          {/* 범례 칩 */}
          <g transform="translate(28, 360)">
            {[
              { c: "#63b3ed", t: "독립 계자" },
              { c: "#68d391", t: "자기여자 가지" },
              { c: "#f6ad55", t: "복권 확장" },
            ].map((b, i) => (
              <g key={b.t} transform={`translate(${i * 118}, 0)`}>
                <rect
                  x="0"
                  y="0"
                  width="10"
                  height="10"
                  rx="3"
                  fill={b.c}
                  opacity="0.9"
                />
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
