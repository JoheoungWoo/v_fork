export default function DcGeneratorTypeDiagram() {
  return (
    <section
      style={{
        margin: "20px",
        padding: "24px",
        backgroundColor: "#f5f6f8",
        borderRadius: "12px",
        border: "1px solid #d9dde3",
      }}
    >
      <h4
        style={{
          margin: 0,
          fontSize: "44px",
          fontWeight: 700,
          color: "#111",
          lineHeight: 1.25,
        }}
      >
        1. DC발전기의 종류
      </h4>

      <p
        style={{
          margin: "24px 0 16px",
          fontSize: "26px",
          color: "#111",
          lineHeight: 1.8,
          wordBreak: "keep-all",
        }}
      >
        DC발전기의 종류는 계자코일과 전기자 권선의 연결방법에 따라 다음과 같이
        나눠집니다.
      </p>

      <svg
        width="100%"
        viewBox="0 0 980 380"
        role="img"
        aria-label="DC발전기 종류 계통도"
      >
        <g fontFamily="sans-serif" fill="#222" fontSize="48" fontWeight="500">
          <text x="30" y="120">
            DC발전기
          </text>
          <text x="280" y="105">
            타여자
          </text>
          <text x="280" y="180">
            자여자
          </text>
          <text x="510" y="180">
            분권
          </text>
          <text x="510" y="235">
            직권
          </text>
          <text x="510" y="290">
            복권
          </text>
          <text x="700" y="290">
            내분권
          </text>
          <text x="700" y="345">
            외분권
          </text>
        </g>

        <g stroke="#67a6e8" strokeWidth="3" fill="none">
          {/* DC발전기 -> 타여자/자여자 */}
          <path d="M 240 80 L 240 165 M 240 80 L 260 80 M 240 165 L 260 165" />

          {/* 자여자 -> 분권/직권/복권 */}
          <path d="M 450 145 L 450 265 M 450 145 L 490 145 M 450 205 L 490 205 M 450 265 L 490 265" />

          {/* 복권 -> 내분권/외분권 */}
          <path d="M 620 265 L 620 335 M 620 265 L 665 265 M 620 335 L 665 335" />
        </g>
      </svg>
    </section>
  );
}
