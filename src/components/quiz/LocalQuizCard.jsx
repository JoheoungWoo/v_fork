import apiClient from "@/api/core/apiClient";
import katex from "katex";
import "katex/dist/katex.min.css";
import { CheckCircle2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

// ──────────────────────────────────────────────────────────────────────────────
// KaTeX 렌더러
// ──────────────────────────────────────────────────────────────────────────────
/**
 * LaTeX 인라인 구분자 \\( … \\) 를 $ … $ 로 바꿉니다 (AutoMathRenderer 분기와 호환).
 * 중첩 \\( … \\) 도 depth 로 처리합니다.
 */
const convertLatexParenDelimiters = (str) => {
  const s = String(str);
  let out = "";
  let i = 0;
  while (i < s.length) {
    if (s[i] === "\\" && s[i + 1] === "(") {
      let depth = 1;
      let j = i + 2;
      while (j < s.length && depth > 0) {
        if (s[j] === "\\" && j + 1 < s.length) {
          if (s[j + 1] === "(") {
            depth += 1;
            j += 2;
          } else if (s[j + 1] === ")") {
            depth -= 1;
            j += 2;
          } else {
            j += 1;
          }
        } else {
          j += 1;
        }
      }
      if (depth === 0) {
        const inner = s.slice(i + 2, j - 2);
        out += `$${inner}$`;
        i = j;
        continue;
      }
      // 닫는 \\) 없음 — 남은 문자열 그대로 붙이고 종료
      out += s.slice(i);
      break;
    }
    out += s[i];
    i += 1;
  }
  return out;
};

const normalizeLatexText = (text) => {
  if (!text) return "";
  const strText = String(text);
  // \( … \) 는 \text{…} 안에 자주 들어가므로 여기서 제외 (전체 문자열을 KaTeX에 넘김)
  if (!/\$\$|\\\[|\$/.test(strText) && strText.includes("\\text{")) {
    const parts = strText.split(/\\text{([^}]+)}/g);
    let result = "";
    for (let i = 0; i < parts.length; i++) {
      if (i % 2 === 0) {
        const mathPart = parts[i].trim();
        if (mathPart) result += ` $${mathPart}$ `;
      } else {
        result += parts[i];
      }
    }
    return result.replace(/\s+/g, " ").trim();
  }
  return strText;
};

const InlineMath = ({ math }) => {
  if (!math) return null;
  const html = katex.renderToString(String(math).replace(/\\\\/g, "\\"), {
    throwOnError: false,
    displayMode: false,
    strict: "ignore",
  });
  return (
    <span
      className="inline-block max-w-full align-middle [&_.katex]:whitespace-normal"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

const BlockMath = ({ math }) => {
  if (!math) return null;
  const html = katex.renderToString(String(math).replace(/\\\\/g, "\\"), {
    throwOnError: false,
    displayMode: true,
    strict: "ignore",
  });
  return (
    <div
      dangerouslySetInnerHTML={{ __html: html }}
      className="overflow-x-auto flex justify-center w-full"
    />
  );
};

const AutoMathRenderer = ({ text, isBlock = true }) => {
  if (!text) return null;
  const cleanText = convertLatexParenDelimiters(String(text).replace(/\\\$/g, "$"));

  const hasDollar = /\$/.test(cleanText);
  const hasDisplayFence = /(\$\$)|(\\\[)/.test(cleanText);

  // 달러/대괄호 디스플레이 구분자가 없고 LaTeX 명령만 있는 경우 → 통째로 KaTeX
  // (\text{...} 안에 \( \) 가 있을 때 이전 로직은 문자열을 잘못 쪼개 raw 백슬래시가 노출됨)
  if (!hasDollar && !hasDisplayFence) {
    if (!cleanText.includes("\\")) return <span>{cleanText}</span>;
    return isBlock ? (
      <BlockMath math={cleanText} />
    ) : (
      <InlineMath math={cleanText} />
    );
  }

  // $...$, $$...$$, \[...\] 분리 (\\( \\) 는 위에서 $ 로 정규화됨)
  const parts = cleanText.split(
    /(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\$[^$\n]*?\$)/g,
  );
  const wrapClass = isBlock
    ? "whitespace-pre-wrap leading-relaxed break-words"
    : "whitespace-normal leading-relaxed break-words max-w-full [word-break:break-word]";
  return (
    <span className={wrapClass}>
      {parts.map((part, i) => {
        if (!part) return null;
        if (part.startsWith("$$") && part.endsWith("$$"))
          return <BlockMath key={i} math={part.slice(2, -2)} />;
        if (part.startsWith("\\[") && part.endsWith("\\]"))
          return <BlockMath key={i} math={part.slice(2, -2)} />;
        if (part.startsWith("$") && part.endsWith("$"))
          return <InlineMath key={i} math={part.slice(1, -1)} />;
        if (!part.includes("$") && part.includes("\\")) {
          return isBlock ? (
            <BlockMath key={i} math={part} />
          ) : (
            <InlineMath key={i} math={part} />
          );
        }
        return (
          <span key={i} className="break-words">
            {part}
          </span>
        );
      })}
    </span>
  );
};

// ──────────────────────────────────────────────────────────────────────────────
// 🌟 라우팅 판별 (한 곳에서만 관리)
// ──────────────────────────────────────────────────────────────────────────────

/**
 * lecture_id → { endpoint, method, buildParams }
 *
 * 우선순위:
 *  1. EM 전용 ID (4_vector_calculus 등) → /api/em/vector-calc/quiz  (POST)
 *  2. 전자기학 일반               → /api/em/random               (GET)
 *  3. 회로/전기 관련              → /api/circuit/random          (GET)
 *  4. 나머지                      → /api/math/random             (GET)
 */
const EM_VECTOR_CALC_IDS = new Set(["4_vector_calculus"]);
const EM_GENERAL_IDS = new Set(["em_coulomb", "1_coulombs_law"]);
const EM_GENERAL_TYPE_ALIAS = {
  "1_coulombs_law": "em_coulomb",
};

// 전자기학 과목 중 벡터미적분 외 추가될 경우 여기에 추가
const EM_TOPIC_MAP = {
  "4_vector_calculus": "random", // → VectorCalcQuizService.generate("random")
};

function resolveEndpoint(targetId, subjectName) {
  // 0) 로렌츠 힘 전용(전기기기/전자기학 브릿지) → 새 퀴즈 엔드포인트 사용
  if (targetId === "lorentz_force") {
    return { type: "lecture_quiz" };
  }

  // 1) EM 벡터미적분 계열
  if (EM_VECTOR_CALC_IDS.has(targetId)) {
    return {
      type: "em_vector_calc",
      topic: EM_TOPIC_MAP[targetId] ?? "random",
    };
  }

  // 1-1) 전자기학 일반 퀴즈 (쿨롱 법칙 등)
  if (
    EM_GENERAL_IDS.has(targetId) ||
    subjectName.includes("전자기") ||
    targetId.toLowerCase().includes("coulomb")
  ) {
    return {
      type: "em_general",
      emType: EM_GENERAL_TYPE_ALIAS[targetId] || targetId,
    };
  }

  // 2) 회로/전기 계열
  const isCircuit = (() => {
    if (subjectName) {
      return ["회로", "전기", "기기", "전력", "설비"].some((k) =>
        subjectName.includes(k),
      );
    }
    const lower = targetId.toLowerCase();
    return (
      ["circuit", "ohm", "elec", "ch", "lec", "part"].some((k) =>
        lower.includes(k),
      ) || /^\d+$/.test(lower)
    );
  })();
  if (isCircuit) return { type: "circuit" };

  // 3) 수학 기본
  return { type: "math" };
}

// ──────────────────────────────────────────────────────────────────────────────
// 🌟 API 호출 (엔드포인트 분기)
// ──────────────────────────────────────────────────────────────────────────────
async function fetchProblem(targetId, subjectName) {
  const route = resolveEndpoint(targetId, subjectName);

  if (route.type === "lecture_quiz") {
    const res = await apiClient.get("/api/quiz/lecture", {
      params: { lecture_id: targetId },
    });
    return res.data.quiz || res.data;
  }

  if (route.type === "em_vector_calc") {
    // POST /api/em/vector-calc/quiz  { topic: "random" }
    const res = await apiClient.post("/api/em/vector-calc/quiz", {
      topic: route.topic,
    });
    return normalizeVectorCalcResponse(res.data);
  }

  if (route.type === "em_general") {
    const res = await apiClient.get(`/api/em/random?type=${route.emType}`);
    return res.data;
  }

  if (route.type === "circuit") {
    const res = await apiClient.get(`/api/circuit/random?type=${targetId}`);
    return res.data;
  }

  // math (기본)
  const res = await apiClient.get(`/api/math/random?type=${targetId}`);
  return res.data;
}

async function recordAnswer(
  targetId,
  subjectName,
  isCorrect,
  chosenIdx,
  problemText,
) {
  const route = resolveEndpoint(targetId, subjectName);

  if (route.type === "em_vector_calc") {
    // EM 퀴즈는 별도 record 엔드포인트 없으므로 math/record 재사용
    // (필요 시 /api/em/vector-calc/record 엔드포인트 추가)
    await apiClient.post("/api/math/record", {
      concept_name: targetId,
      is_correct: isCorrect,
      chosen_answer: chosenIdx ?? -1,
      problem_latex: problemText,
    });
    return;
  }

  if (route.type === "em_general") {
    await apiClient.post("/api/em/record", {
      user_id: "anonymous_user",
      concept_name: targetId,
      is_correct: isCorrect,
      chosen_answer: String(chosenIdx ?? -1),
      problem_latex: problemText,
    });
    return;
  }

  const endpoint =
    route.type === "circuit" ? "/api/circuit/record" : "/api/math/record";
  await apiClient.post(endpoint, {
    concept_name: targetId,
    is_correct: isCorrect,
    chosen_answer: chosenIdx ?? -1,
    problem_latex: problemText,
  });
}

// ──────────────────────────────────────────────────────────────────────────────
// 🌟 벡터미적분 응답 → LocalQuizCard 공통 형식으로 정규화
//
// VectorCalcQuizService 반환:
//   { topic, topic_label, formula_preview, question, options[4],
//     answer(int), explanation(str), probe, field_id }
//
// LocalQuizCard 기대:
//   { question / problem_latex,
//     choices / options,
//     correct_index / answer_index / answer(int),
//     steps / explanation }
// ──────────────────────────────────────────────────────────────────────────────
function normalizeVectorCalcResponse(data) {
  if (!data) return null;

  // LocalQuizCard 가 읽는 모든 키를 채워줌
  return {
    // 문제 텍스트 (AutoMathRenderer 가 $ $ 처리)
    question: data.question,
    problem_latex: data.question,

    // 보기 (기존 options 그대로 → choices 별칭도 추가)
    options: data.options,
    choices: data.options,

    // 정답 인덱스 (세 가지 키 모두 채워서 어떤 코드도 읽을 수 있게)
    answer: data.answer,
    answer_index: data.answer,
    correct_index: data.answer,

    // 해설 → steps 배열 형식으로 변환
    // explanation 이 개행 포함 문자열이면 단락별로 분리
    steps: String(data.explanation || "")
      .split("\n\n")
      .filter(Boolean)
      .map((para) => ({ description: para })),

    explanation: data.explanation,

    // 추가 메타 (렌더링에 선택적으로 활용)
    topic_label: data.topic_label,
    formula_preview: data.formula_preview,
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// 메인 컴포넌트
// ──────────────────────────────────────────────────────────────────────────────
const LocalQuizCard = (props) => {
  const [problemData, setProblemData] = useState(null);
  const [isFetchingProblem, setIsFetchingProblem] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [showSolution, setShowSolution] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [fetchError, setFetchError] = useState(false);

  const targetId = String(
    props.id || props.conceptId || props.lecture_id || "",
  ).trim();
  const subjectName = String(props.subject || "").trim();

  // 정규화된 필드 추출
  const correctIdx =
    problemData?.correct_index !== undefined
      ? problemData.correct_index
      : problemData?.answer_index !== undefined
        ? problemData.answer_index
        : typeof problemData?.answer === "number"
          ? problemData.answer
          : null;

  const choices = problemData?.choices || problemData?.options || [];

  let normalizedSteps = [];
  if (Array.isArray(problemData?.steps)) normalizedSteps = problemData.steps;
  else if (Array.isArray(problemData?.explanation))
    normalizedSteps = problemData.explanation;
  else if (typeof problemData?.explanation === "string")
    normalizedSteps = [{ description: problemData.explanation }];

  const problemText = normalizeLatexText(
    problemData?.problem_latex || problemData?.problem || problemData?.question,
  );

  const answerText =
    typeof problemData?.answer === "string"
      ? problemData.answer
      : problemData?.answer_latex || problemData?.correct_answer;

  // ── 문제 불러오기 ────────────────────────────────────────────────────────────
  const handleFetchProblem = async () => {
    if (!targetId) return;
    setIsFetchingProblem(true);
    setSelectedIndex(null);
    setShowSolution(false);
    setIsCorrect(null);
    setFetchError(false);

    try {
      const data = await fetchProblem(targetId, subjectName);
      if (!data || data.error || Object.keys(data).length === 0) {
        setFetchError(true);
        setProblemData(null);
      } else {
        setProblemData(data);
      }
    } catch (e) {
      console.error("문제 불러오기 실패:", e);
      setFetchError(true);
    } finally {
      setIsFetchingProblem(false);
    }
  };

  useEffect(() => {
    handleFetchProblem();
  }, [targetId]);

  // ── 보기 선택 ────────────────────────────────────────────────────────────────
  const handleChoiceClick = async (index) => {
    if (showSolution || !problemData) return;
    const correct = index === correctIdx;
    setSelectedIndex(index);
    setIsCorrect(correct);
    setShowSolution(true);

    // 오답 시 상위 화면(AiVideoWatch)에서 widget 탭으로 전환할 수 있도록 이벤트 전달
    if (!correct && typeof props.onWrongAnswer === "function") {
      props.onWrongAnswer({
        targetId,
        subject: subjectName,
        problemText,
      });
    }

    try {
      await recordAnswer(targetId, subjectName, correct, index, problemText);
    } catch (e) {
      console.error("결과 저장 실패:", e);
    }
  };

  // ── 이미지 헬퍼 ─────────────────────────────────────────────────────────────
  const resolveImageSrc = (imgSrc) => {
    const src = String(imgSrc || "").trim();
    if (!src || src === "null" || src === "None" || src.length < 20)
      return null;
    if (src.startsWith("http") || src.startsWith("data:")) return src;
    try {
      const decodedStart = atob(src.substring(0, 50)).trim();
      return decodedStart.startsWith("<svg") || decodedStart.startsWith("<?xml")
        ? `data:image/svg+xml;base64,${src}`
        : `data:image/png;base64,${src}`;
    } catch {
      return src.startsWith("PHN2") || src.startsWith("PD94")
        ? `data:image/svg+xml;base64,${src}`
        : `data:image/png;base64,${src}`;
    }
  };

  const renderImage = (imgSrc, altText) => {
    const finalSrc = resolveImageSrc(imgSrc);
    if (!finalSrc) return null;
    return (
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm mb-8 flex justify-center animate-fade-in">
        <img
          src={finalSrc}
          alt={altText}
          className="max-w-full h-auto rounded object-contain max-h-[400px]"
        />
      </div>
    );
  };

  // ── 렌더링 ──────────────────────────────────────────────────────────────────
  if (fetchError) {
    return (
      <div className="p-8 text-center bg-red-50 rounded-xl border border-red-100 mt-8">
        <p className="text-red-500 font-bold mb-4">
          문제를 불러오지 못했습니다. (ID: {targetId})
        </p>
        <button
          onClick={handleFetchProblem}
          className="px-6 py-2 bg-white rounded shadow text-red-600 font-bold hover:bg-red-50 transition"
        >
          다시 시도
        </button>
      </div>
    );
  }

  if (!problemData) {
    return (
      <div className="p-8 text-center text-slate-500 mt-8 bg-slate-50 rounded-xl border border-slate-100">
        문제를 불러오는 중입니다...
      </div>
    );
  }

  return (
    <div className="mt-8 text-center animate-fade-in">
      {/* ── 새 문제 버튼 ─────────────────────────────────────────────────────── */}
      <div className="mb-8">
        <button
          onClick={handleFetchProblem}
          disabled={isFetchingProblem}
          className={`font-bold text-lg py-4 px-10 rounded-xl shadow-md transition-all active:scale-[0.98] ${
            isFetchingProblem
              ? "bg-gray-400 text-white cursor-not-allowed animate-pulse"
              : "bg-[#0047a5] text-white hover:bg-blue-800"
          }`}
        >
          {isFetchingProblem ? "⏳ 문제를 만드는 중..." : "🎯 새로운 문제 도전"}
        </button>
      </div>

      {/* ── 문제 카드 ────────────────────────────────────────────────────────── */}
      <div className="mt-8 p-8 bg-blue-50/30 border border-gray-100 rounded-3xl shadow-xl text-left animate-fade-in">
        <div className="flex items-center justify-between mb-8 border-b pb-4">
          <div>
            <h3 className="text-2xl font-black text-[#0047a5] flex items-center gap-2">
              📝 실전 TEST
            </h3>
            {/* 🌟 벡터미적분 토픽 뱃지 */}
            {problemData.topic_label && (
              <span className="mt-1 inline-block text-xs font-bold px-3 py-1 rounded-full bg-blue-100 text-blue-700">
                {problemData.topic_label}
              </span>
            )}
          </div>
          {showSolution && choices.length > 0 && (
            <div
              className={`flex items-center gap-2 font-black text-xl ${isCorrect ? "text-green-600" : "text-red-600"}`}
            >
              {isCorrect ? (
                <>
                  <CheckCircle2 size={28} /> 정답입니다!
                </>
              ) : (
                <>
                  <XCircle size={28} /> 아쉬워요!
                </>
              )}
            </div>
          )}
        </div>

        {renderImage(
          problemData?.question_image ||
            problemData?.graph_image ||
            problemData?.circuit_image ||
            problemData?.math_image,
          "문제 이미지",
        )}

        {/* 수식 미리보기 (벡터미적분 전용) */}
        {problemData.formula_preview && (
          <div className="mb-4 px-4 py-2 bg-gray-50 rounded-xl border border-gray-100 text-sm font-mono text-gray-500 text-center">
            {problemData.formula_preview}
          </div>
        )}

        {problemText && (
          <div className="mb-10 text-xl text-gray-900 font-bold px-4 py-6 bg-white rounded-2xl shadow-sm border border-gray-100 break-words [overflow-wrap:anywhere]">
            <AutoMathRenderer text={problemText} isBlock />
          </div>
        )}

        {/* ── 보기 ──────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10 min-w-0">
          {choices.map((choice, index) => {
            const isCorrectChoice = index === correctIdx;
            let btnClass =
              "p-6 text-left rounded-2xl border-2 transition-all flex items-start gap-4 group ";
            let circleClass =
              "w-10 h-10 flex items-center justify-center rounded-full font-black shrink-0 transition-colors ";

            if (selectedIndex === index) {
              btnClass += isCorrect
                ? "border-green-500 bg-green-50"
                : "border-red-500 bg-red-50";
              circleClass += "bg-white text-gray-900";
            } else if (showSolution && isCorrectChoice) {
              btnClass += "border-green-500 bg-green-50";
              circleClass += "bg-white text-gray-900";
            } else {
              btnClass +=
                "border-gray-200 bg-white hover:border-[#0047a5] hover:shadow-md";
              circleClass +=
                "bg-gray-100 text-gray-500 group-hover:bg-[#0047a5] group-hover:text-white";
            }

            return (
              <button
                key={index}
                onClick={() => handleChoiceClick(index)}
                disabled={showSolution}
                className={`${btnClass} min-w-0`}
              >
                <span className={circleClass}>{index + 1}</span>
                <span className="text-lg font-bold text-gray-800 min-w-0 flex-1 text-left break-words [overflow-wrap:anywhere]">
                  <AutoMathRenderer text={choice} isBlock={false} />
                </span>
              </button>
            );
          })}
        </div>

        {/* ── 해설 ──────────────────────────────────────────────────────────── */}
        {showSolution && (
          <div className="mt-12 pt-10 border-t-2 border-dashed border-gray-300 animate-slide-up">
            <h4 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
              💡 전문가의 상세 풀이
            </h4>
            {normalizedSteps.length > 0 && (
              <div className="space-y-4">
                {normalizedSteps.map((step, idx) => (
                  <div
                    key={idx}
                    className="flex gap-5 items-start bg-white p-6 rounded-2xl border border-gray-200 shadow-sm"
                  >
                    <span className="bg-[#e5edff] text-[#0047a5] font-black w-10 h-10 flex items-center justify-center rounded-xl shrink-0 mt-1">
                      {idx + 1}
                    </span>
                    <div className="mt-1 w-full overflow-hidden">
                      <div className="text-gray-700 font-bold mb-4 text-lg leading-relaxed break-keep">
                        <AutoMathRenderer
                          text={step.description || step.text || ""}
                          isBlock={false}
                        />
                      </div>
                      {(step.latex || step.math) && (
                        <div className="bg-gray-50 py-4 px-6 rounded-xl border border-gray-100 overflow-x-auto">
                          <BlockMath math={step.latex || step.math} />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {answerText && (
              <div className="mt-12 p-10 bg-gradient-to-r from-[#0047a5] to-blue-700 text-white rounded-3xl text-center shadow-2xl">
                <p className="text-blue-200 text-sm font-black mb-3 uppercase tracking-widest opacity-90">
                  최종 정답
                </p>
                <div className="text-4xl font-black overflow-x-auto drop-shadow-md">
                  <AutoMathRenderer text={answerText} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LocalQuizCard;
