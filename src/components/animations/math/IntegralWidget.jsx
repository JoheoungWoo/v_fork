import { useState } from "react";
// 💡 플랫폼 환경에 맞게 수식 렌더러를 임포트하세요.
// (예시로 에듀테크에서 가장 많이 쓰는 react-katex를 사용했습니다)
import katex from "katex";
import "katex/dist/katex.min.css";
const InlineMath = ({ math }) => {
  const html = katex.renderToString(math, {
    throwOnError: false,
    displayMode: false,
  });
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
};

const BlockMath = ({ math }) => {
  const html = katex.renderToString(math, {
    throwOnError: false,
    displayMode: true,
  });
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
};
const IntegralWidget = ({ quizData }) => {
  const [a, setA] = useState(1);
  const [b, setB] = useState(4);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState(null);
  const [showSolution, setShowSolution] = useState(false);

  // 대상 함수: f(x) = x^2 - 4x + 5
  const f = (x) => x * x - 4 * x + 5;
  const F = (x) => Math.pow(x, 3) / 3 - 2 * Math.pow(x, 2) + 5 * x;
  const area = F(b) - F(a);

  // SVG 관련 설정 및 패스 생성 로직 (기존과 동일)
  const width = 400,
    height = 250,
    minX = 0,
    maxX = 5,
    maxY = 10;
  const mapX = (x) => ((x - minX) / (maxX - minX)) * width;
  const mapY = (y) => height - (y / maxY) * height;

  const generateCurvePath = () => {
    /* ... 생략 (기존 코드와 동일) ... */
    let path = [];
    for (let x = minX; x <= maxX; x += 0.1)
      path.push(`${x === minX ? "M" : "L"} ${mapX(x)},${mapY(f(x))}`);
    return path.join(" ");
  };

  const generateShadedPath = () => {
    /* ... 생략 (기존 코드와 동일) ... */
    if (a >= b) return "";
    let path = [`M ${mapX(a)},${mapY(0)}`];
    for (let x = a; x <= b; x += 0.1) path.push(`L ${mapX(x)},${mapY(f(x))}`);
    path.push(`L ${mapX(b)},${mapY(f(b))}`, `L ${mapX(b)},${mapY(0)}`, "Z");
    return path.join(" ");
  };

  const handleSliderChange = (type, value) => {
    const numValue = Number(value);
    if (type === "a") setA(Math.min(numValue, b - 0.1));
    else setB(Math.max(numValue, a + 0.1));
  };

  // 백엔드 데이터 연동 방어 로직 (Props가 없을 때의 기본값)
  const data = quizData || {
    problem_latex: "\\int (3x^2 + 2x) \\, dx",
    choices: ["x^3 + x^2 + C", "6x + 2 + C", "3x^3 + 2x^2 + C", "x^3 + x^2"],
    correct_index: 0,
    steps: ["\\int x^n \\, dx = \\frac{1}{n+1}x^{n+1} + C", "x^3 + x^2 + C"],
  };

  const handleAnswerClick = (idx) => {
    setSelectedOptionIdx(idx);
    setShowSolution(true); // 답을 고르면 해설을 표시합니다.
  };

  return (
    <div
      style={{
        padding: "24px",
        background: "#ffffff",
        borderRadius: "12px",
        border: "1px solid #e5e7eb",
        maxWidth: "600px",
        margin: "0 auto",
        fontFamily: "sans-serif",
      }}
    >
      {/* --- 상단 시각화 및 슬라이더 영역 (기존과 동일하여 생략) --- */}
      <h2 style={{ margin: "0 0 20px 0", color: "#1e293b", fontSize: "20px" }}>
        적분의 이해: 곡선 아래의 넓이
      </h2>

      {/* SVG 그래프 영역 */}
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
          {/* 축, 면적, 곡선 그리기 */}
          <line
            x1="0"
            y1={mapY(0)}
            x2={width}
            y2={mapY(0)}
            stroke="#94a3b8"
            strokeWidth="2"
          />
          <path d={generateShadedPath()} fill="#bfdbfe" opacity="0.6" />
          <path
            d={generateCurvePath()}
            fill="none"
            stroke="#1e293b"
            strokeWidth="3"
          />
        </svg>
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

      <div
        style={{
          marginTop: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        {/* 슬라이더 컨트롤 a, b */}
        <input
          type="range"
          min="0"
          max="5"
          step="0.1"
          value={a}
          onChange={(e) => handleSliderChange("a", e.target.value)}
        />
        <input
          type="range"
          min="0"
          max="5"
          step="0.1"
          value={b}
          onChange={(e) => handleSliderChange("b", e.target.value)}
        />
      </div>

      <hr
        style={{
          margin: "32px 0",
          border: "none",
          borderTop: "1px solid #e2e8f0",
        }}
      />

      {/* --- 퀴즈 및 상세 풀이 영역 --- */}
      <div>
        <h3
          style={{ margin: "0 0 16px 0", color: "#1e293b", fontSize: "18px" }}
        >
          실전 확인 퀴즈
        </h3>

        {/* 문제 렌더링 (BlockMath 사용) */}
        <div
          style={{
            background: "#f1f5f9",
            padding: "16px",
            borderRadius: "8px",
            marginBottom: "16px",
            textAlign: "center",
          }}
        >
          <div
            style={{ marginBottom: "8px", fontSize: "16px", color: "#475569" }}
          >
            다음 부정적분을 구하시오.
          </div>
          <BlockMath math={data.problem_latex} />
        </div>

        {/* 선택지 렌더링 (InlineMath 사용) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
          }}
        >
          {data.choices.map((choice, idx) => {
            const isSelected = selectedOptionIdx === idx;
            const isCorrect = idx === data.correct_index;

            // 스타일 결정 로직
            let borderColor = "#cbd5e1";
            let bgColor = "#ffffff";
            if (isSelected) {
              borderColor = isCorrect ? "#22c55e" : "#ef4444";
              bgColor = isCorrect ? "#dcfce7" : "#fee2e2";
            } else if (showSolution && isCorrect) {
              // 오답을 골랐더라도 정답은 초록색으로 표시
              borderColor = "#22c55e";
              bgColor = "#f0fdf4";
            }

            return (
              <button
                key={idx}
                onClick={() => handleAnswerClick(idx)}
                style={{
                  padding: "12px",
                  borderRadius: "8px",
                  border: `2px solid ${borderColor}`,
                  background: bgColor,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                {/* 문자열에 포함된 $ 기호를 제거하고 렌더링 (백엔드에서 $를 붙여 보냈을 경우 대비) */}
                <InlineMath math={choice.replace(/\$/g, "")} />
              </button>
            );
          })}
        </div>

        {/* 전문가의 상세 풀이 (정답을 고르거나 오답을 고른 후 노출) */}
        {showSolution && (
          <div
            style={{
              marginTop: "24px",
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              padding: "16px",
            }}
          >
            <h4
              style={{
                margin: "0 0 12px 0",
                color: "#0f172a",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              💡 전문가의 상세 풀이
            </h4>
            {data.steps.map((step, idx) => (
              <div
                key={idx}
                style={{
                  background: "#ffffff",
                  padding: "12px",
                  borderRadius: "6px",
                  marginBottom: "8px",
                  border: "1px solid #f1f5f9",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    color: "#3b82f6",
                    fontWeight: "bold",
                    marginBottom: "4px",
                  }}
                >
                  Step {idx + 1}
                </div>
                <BlockMath math={step.replace(/\$/g, "")} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default IntegralWidget;
