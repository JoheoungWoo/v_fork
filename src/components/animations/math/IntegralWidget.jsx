import { useState } from "react";

const IntegralWidget = () => {
  // 정적분 구간 상태 (a: 하한값, b: 상한값)
  const [a, setA] = useState(1);
  const [b, setB] = useState(4);
  const [selectedOption, setSelectedOption] = useState(null);

  // 대상 함수: f(x) = x^2 - 4x + 5
  const f = (x) => x * x - 4 * x + 5;
  // 부정적분 함수: F(x) = x^3/3 - 2x^2 + 5x
  const F = (x) => Math.pow(x, 3) / 3 - 2 * Math.pow(x, 2) + 5 * x;

  // 면적 계산
  const area = F(b) - F(a);

  // SVG 그래프 설정
  const width = 400;
  const height = 250;
  const minX = 0;
  const maxX = 5;
  const maxY = 10;

  // 좌표 변환 헬퍼 함수
  const mapX = (x) => ((x - minX) / (maxX - minX)) * width;
  const mapY = (y) => height - (y / maxY) * height;

  // 함수 곡선 패스 생성
  const generateCurvePath = () => {
    let path = [];
    for (let x = minX; x <= maxX; x += 0.1) {
      path.push(`${x === minX ? "M" : "L"} ${mapX(x)},${mapY(f(x))}`);
    }
    return path.join(" ");
  };

  // 색칠된 면적 패스 생성
  const generateShadedPath = () => {
    if (a >= b) return "";
    let path = [`M ${mapX(a)},${mapY(0)}`];
    for (let x = a; x <= b; x += 0.1) {
      path.push(`L ${mapX(x)},${mapY(f(x))}`);
    }
    path.push(`L ${mapX(b)},${mapY(f(b))}`);
    path.push(`L ${mapX(b)},${mapY(0)}`);
    path.push("Z");
    return path.join(" ");
  };

  const handleSliderChange = (type, value) => {
    const numValue = Number(value);
    if (type === "a") {
      setA(Math.min(numValue, b - 0.1));
    } else {
      setB(Math.max(numValue, a + 0.1));
    }
  };

  // 퀴즈 데이터
  const quizProblem = "\\int (3x^2 + 2x) \\, dx";
  const options = [
    { id: 1, text: "x^3 + x^2 + C", isCorrect: true },
    { id: 2, text: "6x + 2 + C", isCorrect: false },
    { id: 3, text: "3x^3 + 2x^2 + C", isCorrect: false },
    { id: 4, text: "x^3 + x^2", isCorrect: false },
  ];

  return (
    <div
      style={{
        padding: "24px",
        background: "#ffffff",
        borderRadius: "12px",
        border: "1px solid #e5e7eb",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        maxWidth: "600px",
        margin: "0 auto",
        fontFamily: "sans-serif",
      }}
    >
      <h2 style={{ margin: "0 0 20px 0", color: "#1e293b", fontSize: "20px" }}>
        적분의 이해: 곡선 아래의 넓이
      </h2>

      {/* 시각화 영역 */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <svg
          width="100%"
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          style={{
            background: "#f8fafc",
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
          }}
        >
          {/* X축 */}
          <line
            x1="0"
            y1={mapY(0)}
            x2={width}
            y2={mapY(0)}
            stroke="#94a3b8"
            strokeWidth="2"
          />

          {/* 그리드 및 눈금 (X축) */}
          {[1, 2, 3, 4, 5].map((tick) => (
            <g key={`x-${tick}`}>
              <line
                x1={mapX(tick)}
                y1="0"
                x2={mapX(tick)}
                y2={height}
                stroke="#e2e8f0"
                strokeWidth="1"
                strokeDasharray="4"
              />
              <text
                x={mapX(tick)}
                y={mapY(0) + 15}
                fontSize="12"
                fill="#64748b"
                textAnchor="middle"
              >
                {tick}
              </text>
            </g>
          ))}

          {/* 색칠된 면적 */}
          <path d={generateShadedPath()} fill="#bfdbfe" opacity="0.6" />

          {/* a, b 경계선 */}
          <line
            x1={mapX(a)}
            y1={mapY(0)}
            x2={mapX(a)}
            y2={mapY(f(a))}
            stroke="#3b82f6"
            strokeWidth="2"
            strokeDasharray="4"
          />
          <line
            x1={mapX(b)}
            y1={mapY(0)}
            x2={mapX(b)}
            y2={mapY(f(b))}
            stroke="#3b82f6"
            strokeWidth="2"
            strokeDasharray="4"
          />

          {/* 함수 곡선 */}
          <path
            d={generateCurvePath()}
            fill="none"
            stroke="#1e293b"
            strokeWidth="3"
          />
        </svg>

        {/* 넓이 결과 출력 */}
        <div
          style={{
            marginTop: "16px",
            fontSize: "18px",
            fontWeight: "bold",
            color: "#2563eb",
          }}
        >
          계산된 넓이 = {area.toFixed(2)}
        </div>
      </div>

      {/* 컨트롤 패널 */}
      <div
        style={{
          marginTop: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <label
            style={{ width: "80px", fontWeight: "bold", color: "#475569" }}
          >
            하한 (a)
          </label>
          <input
            type="range"
            min="0"
            max="5"
            step="0.1"
            value={a}
            onChange={(e) => handleSliderChange("a", e.target.value)}
            style={{ flex: 1, cursor: "pointer" }}
          />
          <span style={{ width: "40px", textAlign: "right", color: "#64748b" }}>
            {a.toFixed(1)}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <label
            style={{ width: "80px", fontWeight: "bold", color: "#475569" }}
          >
            상한 (b)
          </label>
          <input
            type="range"
            min="0"
            max="5"
            step="0.1"
            value={b}
            onChange={(e) => handleSliderChange("b", e.target.value)}
            style={{ flex: 1, cursor: "pointer" }}
          />
          <span style={{ width: "40px", textAlign: "right", color: "#64748b" }}>
            {b.toFixed(1)}
          </span>
        </div>
      </div>

      <hr
        style={{
          margin: "32px 0",
          border: "none",
          borderTop: "1px solid #e2e8f0",
        }}
      />

      {/* 퀴즈 영역 */}
      <div>
        <h3
          style={{ margin: "0 0 16px 0", color: "#1e293b", fontSize: "18px" }}
        >
          실전 확인 퀴즈
        </h3>
        <div
          style={{
            background: "#f1f5f9",
            padding: "16px",
            borderRadius: "8px",
            marginBottom: "16px",
            textAlign: "center",
            fontSize: "18px",
          }}
        >
          다음 부정적분을 구하시오.
          <br />
          <strong>${quizProblem}$</strong>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
          }}
        >
          {options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSelectedOption(opt)}
              style={{
                padding: "12px",
                borderRadius: "8px",
                border: `2px solid ${selectedOption?.id === opt.id ? (opt.isCorrect ? "#22c55e" : "#ef4444") : "#cbd5e1"}`,
                background:
                  selectedOption?.id === opt.id
                    ? opt.isCorrect
                      ? "#dcfce7"
                      : "#fee2e2"
                    : "#ffffff",
                color: "#1e293b",
                fontSize: "16px",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              ${opt.text}$
            </button>
          ))}
        </div>
        {selectedOption && (
          <div
            style={{
              marginTop: "16px",
              padding: "12px",
              borderRadius: "8px",
              background: selectedOption.isCorrect ? "#dcfce7" : "#fee2e2",
              color: selectedOption.isCorrect ? "#166534" : "#991b1b",
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            {selectedOption.isCorrect
              ? "정답입니다! 적분 공식을 올바르게 적용했습니다."
              : "오답입니다. 차수를 올리고 새로운 차수로 나누는 과정을 다시 확인해 보세요."}
          </div>
        )}
      </div>
    </div>
  );
};

export default IntegralWidget;
