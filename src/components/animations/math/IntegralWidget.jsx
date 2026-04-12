import apiClient from "@/api/core/apiClient";
import katex from "katex";
import "katex/dist/katex.min.css";
import { useCallback, useEffect, useMemo, useState } from "react";

// ─── 수식 렌더링 헬퍼 ───────────────────────────────────────────────────────
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

// ─── SVG 좌표 변환 상수 ─────────────────────────────────────────────────────
const SVG_W = 480;
const SVG_H = 260;
const PAD = { top: 20, right: 20, bottom: 40, left: 44 };
const PLOT_W = SVG_W - PAD.left - PAD.right;
const PLOT_H = SVG_H - PAD.top - PAD.bottom;

const X_MIN = 0;
const X_MAX = 5.2;
const Y_MIN = 0;
const Y_MAX = 11;

const toSvgX = (x) => PAD.left + ((x - X_MIN) / (X_MAX - X_MIN)) * PLOT_W;
const toSvgY = (y) =>
  PAD.top + PLOT_H - ((y - Y_MIN) / (Y_MAX - Y_MIN)) * PLOT_H;

// ─── 수학 함수 ───────────────────────────────────────────────────────────────
// f(x) = x² - 4x + 5  (꼭짓점 (2, 1), x∈[0,5] 에서 양수)
const f = (x) => x * x - 4 * x + 5;
// F(x) = x³/3 - 2x² + 5x  (부정적분)
const F = (x) => (x * x * x) / 3 - 2 * x * x + 5 * x;

// ─── 경로 생성 함수 ─────────────────────────────────────────────────────────
function buildCurvePath() {
  const steps = 200;
  const points = [];
  for (let i = 0; i <= steps; i++) {
    const x = X_MIN + (i / steps) * (X_MAX - X_MIN);
    points.push([toSvgX(x), toSvgY(f(x))]);
  }
  return points
    .map(
      (p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(2)},${p[1].toFixed(2)}`,
    )
    .join(" ");
}

function buildShadedPath(a, b) {
  const steps = 100;
  // 위쪽: a→b 곡선
  const top = [];
  for (let i = 0; i <= steps; i++) {
    const x = a + (i / steps) * (b - a);
    top.push([toSvgX(x), toSvgY(f(x))]);
  }
  // 닫기: b→a 바닥선
  const path = [
    `M${toSvgX(a).toFixed(2)},${toSvgY(0).toFixed(2)}`,
    ...top.map((p) => `L${p[0].toFixed(2)},${p[1].toFixed(2)}`),
    `L${toSvgX(b).toFixed(2)},${toSvgY(0).toFixed(2)}`,
    "Z",
  ];
  return path.join(" ");
}

// ─── X축 눈금 ────────────────────────────────────────────────────────────────
const X_TICKS = [0, 1, 2, 3, 4, 5];
const Y_TICKS = [0, 2, 4, 6, 8, 10];

// ─── 메인 위젯 ───────────────────────────────────────────────────────────────
// quizData prop: 외부에서 미리 주입할 때만 사용. 없으면 자체 fetch.
const IntegralWidget = ({ quizData: quizDataProp }) => {
  const [a, setA] = useState(1);
  const [b, setB] = useState(4);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState(null);
  const [showSolution, setShowSolution] = useState(false);

  // ── API 연동 state ──────────────────────────────────────────────────────
  const [quizData, setQuizData] = useState(quizDataProp ?? null);
  const [loading, setLoading] = useState(!quizDataProp);
  const [fetchError, setFetchError] = useState(null);

  const fetchQuiz = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    setSelectedOptionIdx(null);
    setShowSolution(false);
    try {
      const res = await apiClient.get("/api/math/random?type=10_integral");
      setQuizData(res.data);
    } catch (err) {
      console.error("[IntegralWidget] fetch 실패:", err);
      setFetchError("퀴즈를 불러오지 못했습니다. 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  }, []);

  // 마운트 시 prop이 없으면 자동 fetch
  useEffect(() => {
    if (!quizDataProp) fetchQuiz();
  }, [quizDataProp, fetchQuiz]);
  // ───────────────────────────────────────────────────────────────────────

  const area = useMemo(() => F(b) - F(a), [a, b]);
  const curvePath = useMemo(() => buildCurvePath(), []);
  const shadedPath = useMemo(() => buildShadedPath(a, b), [a, b]);

  const handleA = (e) => {
    const v = Math.min(Number(e.target.value), b - 0.2);
    setA(Math.max(0.1, v));
  };
  const handleB = (e) => {
    const v = Math.max(Number(e.target.value), a + 0.2);
    setB(Math.min(5, v));
  };

  // loading / error 대체 데이터
  const data = quizData ?? {
    problem_latex: loading
      ? "\\text{문제를 생성하는 중...}"
      : "\\text{데이터 없음}",
    choices: [],
    correct_index: -1,
    steps: [],
  };

  const handleAnswerClick = (idx) => {
    if (showSolution) return;
    setSelectedOptionIdx(idx);
    setShowSolution(true);
  };

  // 면적 표기 LaTeX
  const areaLatex = `\\int_{${a.toFixed(1)}}^{${b.toFixed(1)}} (x^2 - 4x + 5)\\,dx = ${area.toFixed(3)}`;

  return (
    <div style={styles.card}>
      {/* shimmer 애니메이션 */}
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
      {/* ── 상단 헤더 ── */}
      <div style={styles.header}>
        <div style={styles.headerTag}>적분의 기하학적 의미</div>
        <h2 style={styles.title}>곡선 아래의 넓이</h2>
        <p style={styles.subtitle}>
          슬라이더를 움직여 <InlineMath math="a" />, <InlineMath math="b" />{" "}
          구간을 바꾸고 넓이 변화를 확인하세요.
        </p>
      </div>

      {/* ── SVG 그래프 ── */}
      <div style={styles.graphWrapper}>
        <svg width="100%" viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={styles.svg}>
          {/* 격자 */}
          {Y_TICKS.map((y) => (
            <line
              key={`gy${y}`}
              x1={PAD.left}
              y1={toSvgY(y)}
              x2={SVG_W - PAD.right}
              y2={toSvgY(y)}
              stroke="#e2e8f0"
              strokeWidth="1"
            />
          ))}
          {X_TICKS.map((x) => (
            <line
              key={`gx${x}`}
              x1={toSvgX(x)}
              y1={PAD.top}
              x2={toSvgX(x)}
              y2={PAD.top + PLOT_H}
              stroke="#e2e8f0"
              strokeWidth="1"
            />
          ))}

          {/* 색칠된 넓이 */}
          <path
            d={shadedPath}
            fill="#6366f1"
            fillOpacity="0.18"
            stroke="none"
          />

          {/* 곡선 */}
          <path
            d={curvePath}
            fill="none"
            stroke="#6366f1"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* a, b 수직선 */}
          {[a, b].map((v, i) => (
            <line
              key={`vl${i}`}
              x1={toSvgX(v)}
              y1={toSvgY(0)}
              x2={toSvgX(v)}
              y2={toSvgY(f(v))}
              stroke={i === 0 ? "#f59e0b" : "#10b981"}
              strokeWidth="2"
              strokeDasharray="4 3"
            />
          ))}

          {/* a, b 레이블 */}
          <text
            x={toSvgX(a)}
            y={toSvgY(0) + 16}
            textAnchor="middle"
            fill="#f59e0b"
            fontSize="13"
            fontWeight="bold"
          >
            a={a.toFixed(1)}
          </text>
          <text
            x={toSvgX(b)}
            y={toSvgY(0) + 16}
            textAnchor="middle"
            fill="#10b981"
            fontSize="13"
            fontWeight="bold"
          >
            b={b.toFixed(1)}
          </text>

          {/* X축 */}
          <line
            x1={PAD.left}
            y1={toSvgY(0)}
            x2={SVG_W - PAD.right}
            y2={toSvgY(0)}
            stroke="#94a3b8"
            strokeWidth="1.5"
          />
          {X_TICKS.filter((x) => x !== 0).map((x) => (
            <text
              key={`xt${x}`}
              x={toSvgX(x)}
              y={toSvgY(0) + 16}
              textAnchor="middle"
              fill="#94a3b8"
              fontSize="11"
            >
              {x}
            </text>
          ))}

          {/* Y축 */}
          <line
            x1={PAD.left}
            y1={PAD.top}
            x2={PAD.left}
            y2={PAD.top + PLOT_H}
            stroke="#94a3b8"
            strokeWidth="1.5"
          />
          {Y_TICKS.filter((y) => y !== 0).map((y) => (
            <text
              key={`yt${y}`}
              x={PAD.left - 6}
              y={toSvgY(y) + 4}
              textAnchor="end"
              fill="#94a3b8"
              fontSize="11"
            >
              {y}
            </text>
          ))}

          {/* 함수 레이블 */}
          <text
            x={toSvgX(4.2)}
            y={toSvgY(f(4.2)) - 10}
            fill="#6366f1"
            fontSize="12"
            fontWeight="600"
          >
            f(x)=x²−4x+5
          </text>
        </svg>
      </div>

      {/* ── 슬라이더 ── */}
      <div style={styles.sliderSection}>
        <div style={styles.sliderRow}>
          <label style={{ ...styles.sliderLabel, color: "#f59e0b" }}>
            <span>
              하한 <InlineMath math="a" />
            </span>
            <span style={styles.sliderValue}>{a.toFixed(1)}</span>
          </label>
          <input
            type="range"
            min="0.1"
            max="4.8"
            step="0.1"
            value={a}
            onChange={handleA}
            style={{ ...styles.slider, accentColor: "#f59e0b" }}
          />
        </div>
        <div style={styles.sliderRow}>
          <label style={{ ...styles.sliderLabel, color: "#10b981" }}>
            <span>
              상한 <InlineMath math="b" />
            </span>
            <span style={styles.sliderValue}>{b.toFixed(1)}</span>
          </label>
          <input
            type="range"
            min="0.2"
            max="5.0"
            step="0.1"
            value={b}
            onChange={handleB}
            style={{ ...styles.slider, accentColor: "#10b981" }}
          />
        </div>

        {/* 면적 결과 박스 */}
        <div style={styles.areaBox}>
          <BlockMath math={areaLatex} />
        </div>
      </div>

      <hr style={styles.divider} />

      {/* ── 퀴즈 영역 ── */}
      <div>
        <div style={styles.quizHeader}>
          <h3 style={styles.quizTitle}>실전 확인 퀴즈</h3>
          <button
            onClick={fetchQuiz}
            disabled={loading}
            style={{ ...styles.retryBtn, opacity: loading ? 0.5 : 1 }}
          >
            {loading ? "생성 중…" : "🔄 다시 풀기"}
          </button>
        </div>

        {/* 에러 배너 */}
        {fetchError && <div style={styles.errorBanner}>⚠️ {fetchError}</div>}

        {/* 문제 박스 */}
        <div style={{ ...styles.problemBox, opacity: loading ? 0.5 : 1 }}>
          <div style={styles.problemLabel}>다음 부정적분을 구하시오.</div>
          {loading ? (
            <div style={styles.skeletonLine} />
          ) : (
            <BlockMath math={data.problem_latex.replace(/\$/g, "")} />
          )}
        </div>

        {/* 선택지 */}
        {loading ? (
          <div style={styles.choicesGrid}>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} style={styles.skeletonBtn} />
            ))}
          </div>
        ) : (
          <div style={styles.choicesGrid}>
            {data.choices.map((choice, idx) => {
              const isSelected = selectedOptionIdx === idx;
              const isCorrect = idx === data.correct_index;
              let border = "2px solid #e2e8f0";
              let bg = "#ffffff";
              if (isSelected) {
                border = isCorrect ? "2px solid #22c55e" : "2px solid #ef4444";
                bg = isCorrect ? "#dcfce7" : "#fee2e2";
              } else if (showSolution && isCorrect) {
                border = "2px solid #22c55e";
                bg = "#f0fdf4";
              }
              return (
                <button
                  key={idx}
                  onClick={() => handleAnswerClick(idx)}
                  style={{ ...styles.choiceBtn, border, background: bg }}
                >
                  <InlineMath math={choice.replace(/\$/g, "")} />
                </button>
              );
            })}
          </div>
        )}

        {/* 상세 풀이 */}
        {showSolution && !loading && (
          <div style={styles.solutionBox}>
            <div style={styles.solutionTitle}>💡 상세 풀이</div>
            {data.steps.map((step, idx) => (
              <div key={idx} style={styles.stepBox}>
                <div style={styles.stepLabel}>Step {idx + 1}</div>
                <BlockMath math={step.replace(/\$/g, "")} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── 스타일 객체 ─────────────────────────────────────────────────────────────
const styles = {
  card: {
    padding: "28px 24px",
    background: "#ffffff",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    maxWidth: "600px",
    margin: "0 auto",
    fontFamily: "'Pretendard', 'Noto Sans KR', sans-serif",
    boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
  },
  header: {
    marginBottom: "20px",
  },
  headerTag: {
    display: "inline-block",
    background: "#eef2ff",
    color: "#6366f1",
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    padding: "3px 10px",
    borderRadius: "100px",
    marginBottom: "8px",
  },
  title: {
    margin: "0 0 6px 0",
    fontSize: "22px",
    fontWeight: "700",
    color: "#0f172a",
  },
  subtitle: {
    margin: 0,
    fontSize: "13px",
    color: "#64748b",
    lineHeight: "1.6",
  },
  graphWrapper: {
    background: "#f8fafc",
    borderRadius: "12px",
    padding: "8px",
    marginBottom: "16px",
    border: "1px solid #f1f5f9",
  },
  svg: {
    display: "block",
    overflow: "visible",
  },
  sliderSection: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginBottom: "20px",
  },
  sliderRow: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  sliderLabel: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "13px",
    fontWeight: "600",
  },
  sliderValue: {
    background: "#f1f5f9",
    borderRadius: "6px",
    padding: "1px 8px",
    fontSize: "12px",
    fontFamily: "monospace",
    color: "#334155",
  },
  slider: {
    width: "100%",
    height: "6px",
    borderRadius: "4px",
    cursor: "pointer",
    appearance: "auto",
  },
  areaBox: {
    background: "#eef2ff",
    border: "1px solid #c7d2fe",
    borderRadius: "10px",
    padding: "12px 16px",
    marginTop: "6px",
    textAlign: "center",
  },
  divider: {
    border: "none",
    borderTop: "1px solid #e2e8f0",
    margin: "24px 0",
  },
  quizHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "14px",
  },
  quizTitle: {
    margin: 0,
    fontSize: "17px",
    fontWeight: "700",
    color: "#0f172a",
  },
  retryBtn: {
    padding: "6px 14px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    background: "#f8fafc",
    color: "#475569",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.15s",
  },
  errorBanner: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "8px",
    padding: "10px 14px",
    color: "#dc2626",
    fontSize: "13px",
    marginBottom: "12px",
  },
  skeletonLine: {
    height: "28px",
    borderRadius: "6px",
    background: "linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.4s infinite",
    margin: "8px auto",
    width: "70%",
  },
  skeletonBtn: {
    height: "48px",
    borderRadius: "8px",
    background: "linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.4s infinite",
    border: "2px solid #e2e8f0",
  },
  problemBox: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    padding: "16px",
    marginBottom: "14px",
    textAlign: "center",
  },
  problemLabel: {
    fontSize: "13px",
    color: "#64748b",
    marginBottom: "8px",
  },
  choicesGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
  },
  choiceBtn: {
    padding: "12px",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.15s",
    fontSize: "14px",
    textAlign: "center",
  },
  solutionBox: {
    marginTop: "20px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    padding: "16px",
  },
  solutionTitle: {
    fontWeight: "700",
    fontSize: "14px",
    color: "#0f172a",
    marginBottom: "12px",
  },
  stepBox: {
    background: "#ffffff",
    border: "1px solid #f1f5f9",
    borderRadius: "8px",
    padding: "12px",
    marginBottom: "8px",
  },
  stepLabel: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#6366f1",
    marginBottom: "4px",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
};

export default IntegralWidget;
