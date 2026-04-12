import katex from "katex";
import "katex/dist/katex.min.css";
import { useState } from "react";

// 수식 렌더링 헬퍼 컴포넌트
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

// 위젯 메인 컴포넌트
const IntegralWidget = ({ quizData }) => {
  const [a, setA] = useState(1);
  const [b, setB] = useState(4);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState(null);
  const [showSolution, setShowSolution] = useState(false);

  // 그래프 렌더링용 고정/시뮬레이션 로직 (이 부분은 UI 인터랙션을 위해 프론트엔드에 존재)
  const f = (x) => x * x - 4 * x + 5;
  const F = (x) => Math.pow(x, 3) / 3 - 2 * Math.pow(x, 2) + 5 * x;
  const area = F(b) - F(a);

  // SVG 패스 생성 함수들 (생략)
  const width = 400,
    height = 250,
    minX = 0,
    maxX = 5,
    maxY = 10;
  const mapX = (x) => ((x - minX) / (maxX - minX)) * width;
  const mapY = (y) => height - (y / maxY) * height;
  const generateCurvePath = () => {
    /* ... */
  };
  const generateShadedPath = () => {
    /* ... */
  };

  const handleSliderChange = (type, value) => {
    const numValue = Number(value);
    if (type === "a") setA(Math.min(numValue, b - 0.1));
    else setB(Math.max(numValue, a + 0.1));
  };

  // 💡 백엔드 연동: 백엔드 API에서 받아온 quizData를 사용합니다.
  // 데이터를 받아오기 전 로딩 상태이거나 에러가 났을 때를 대비한 최소한의 기본값만 남깁니다.
  const data = quizData || {
    problem_latex: "\\text{데이터를 불러오는 중입니다...}",
    choices: [],
    correct_index: -1,
    steps: [],
  };

  const handleAnswerClick = (idx) => {
    setSelectedOptionIdx(idx);
    setShowSolution(true);
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
      {/* 1. 상단: 프론트엔드 전용 시각화 (면적 그래프) 영역 */}
      <h2 style={{ margin: "0 0 20px 0", color: "#1e293b", fontSize: "20px" }}>
        적분의 이해: 곡선 아래의 넓이
      </h2>

      {/* SVG 그래프 영역 및 슬라이더 (기존 코드와 동일) */}
      {/* ... */}

      <hr
        style={{
          margin: "32px 0",
          border: "none",
          borderTop: "1px solid #e2e8f0",
        }}
      />

      {/* 2. 하단: 백엔드 데이터 연동 퀴즈 영역 */}
      <div>
        <h3
          style={{ margin: "0 0 16px 0", color: "#1e293b", fontSize: "18px" }}
        >
          실전 확인 퀴즈
        </h3>

        {/* 문제 렌더링 */}
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
          <BlockMath math={data.problem_latex.replace(/\$/g, "")} />
        </div>

        {/* 선택지 버튼들 */}
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

            let borderColor = "#cbd5e1";
            let bgColor = "#ffffff";
            if (isSelected) {
              borderColor = isCorrect ? "#22c55e" : "#ef4444";
              bgColor = isCorrect ? "#dcfce7" : "#fee2e2";
            } else if (showSolution && isCorrect) {
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
                <InlineMath math={choice.replace(/\$/g, "")} />
              </button>
            );
          })}
        </div>

        {/* 상세 풀이 표시 */}
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
