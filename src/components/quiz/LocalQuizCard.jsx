import apiClient from "@/api/core/apiClient";
import katex from "katex";
import "katex/dist/katex.min.css";
import { CheckCircle2, Eye, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

// ==========================================
// 💡 수식 렌더링 헬퍼 컴포넌트
// ==========================================
const normalizeLatexText = (text) => {
  if (!text) return "";
  const strText = String(text);
  if (!/\$\$|\\\[|\\\(|\$/.test(strText) && strText.includes("\\text{")) {
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
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
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
  const cleanText = String(text).replace(/\\\$/g, "$");
  if (!/\$\$|\\\[|\\\(|\$/.test(cleanText)) {
    if (!cleanText.includes("\\")) return <span>{cleanText}</span>;
    return isBlock ? (
      <BlockMath math={cleanText} />
    ) : (
      <InlineMath math={cleanText} />
    );
  }
  const parts = cleanText.split(
    /(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\$[\s\S]*?\$|\\\([\s\S]*?\\\))/g,
  );
  return (
    <span className="whitespace-pre-wrap leading-relaxed">
      {parts.map((part, i) => {
        if (!part) return null;
        if (part.startsWith("$$") && part.endsWith("$$"))
          return <BlockMath key={i} math={part.slice(2, -2)} />;
        if (part.startsWith("\\[") && part.endsWith("\\]"))
          return <BlockMath key={i} math={part.slice(2, -2)} />;
        if (part.startsWith("\\(") && part.endsWith("\\)"))
          return <InlineMath key={i} math={part.slice(2, -2)} />;
        if (part.startsWith("$") && part.endsWith("$"))
          return <InlineMath key={i} math={part.slice(1, -1)} />;
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
};

// ==========================================
// 💡 메인 컴포넌트
// ==========================================
const LocalQuizCard = (props) => {
  const [problemData, setProblemData] = useState(null);
  const [isFetchingProblem, setIsFetchingProblem] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [showSolution, setShowSolution] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [fetchError, setFetchError] = useState(false);

  // 🌟 ID와 과목명 선언
  const targetId = String(
    props.id || props.conceptId || props.lecture_id || "",
  ).trim();
  const subjectName = String(props.subject || "").trim();

  // 🌟 [핵심] 컴포넌트 최상단에서 한 번만 판별! (Fetch와 Record 모두에서 사용)
  const isCircuitProblem = (() => {
    if (subjectName) {
      return (
        subjectName.includes("회로") ||
        subjectName.includes("전기") ||
        subjectName.includes("기기") ||
        subjectName.includes("전력") ||
        subjectName.includes("설비")
      );
    }
    const lowerId = targetId.toLowerCase();
    const hasKeyword = ["circuit", "ohm", "elec", "ch", "lec", "part"].some(
      (k) => lowerId.includes(k),
    );
    return hasKeyword || /^\d+$/.test(lowerId);
  })();

  // 🌟 데이터 정규화 로직 (렌더링 시 사용)
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
  if (Array.isArray(problemData?.steps)) {
    normalizedSteps = problemData.steps;
  } else if (Array.isArray(problemData?.explanation)) {
    normalizedSteps = problemData.explanation;
  } else if (typeof problemData?.explanation === "string") {
    normalizedSteps = [{ description: problemData.explanation }];
  }

  const problemText = normalizeLatexText(
    problemData?.problem_latex || problemData?.problem || problemData?.question,
  );

  const answerText =
    typeof problemData?.answer === "string"
      ? problemData.answer
      : problemData?.answer_latex || problemData?.correct_answer;

  const handleFetchProblem = async () => {
    if (!targetId) return;
    setIsFetchingProblem(true);
    setSelectedIndex(null);
    setShowSolution(false);
    setIsCorrect(null);
    setFetchError(false);

    try {
      // 🌟 공통 판별 변수 사용
      const endpoint = isCircuitProblem
        ? "/api/circuit/random"
        : "/api/math/random";
      const res = await apiClient.get(`${endpoint}?type=${targetId}`);

      if (!res.data || res.data.error || Object.keys(res.data).length === 0) {
        setFetchError(true);
        setProblemData(null);
      } else {
        setProblemData(res.data);
      }
    } catch (e) {
      console.error(e);
      setFetchError(true);
    } finally {
      setIsFetchingProblem(false);
    }
  };

  useEffect(() => {
    handleFetchProblem();
  }, [targetId]);

  const handleChoiceClick = async (index) => {
    if (showSolution || !problemData) return;

    const correct = index === correctIdx;
    setSelectedIndex(index);
    setIsCorrect(correct);
    setShowSolution(true);

    try {
      // 🌟 공통 판별 변수 사용 (기존에 있던 중복 로직 삭제)
      const recordEndpoint = isCircuitProblem
        ? "/api/circuit/record"
        : "/api/math/record";

      await apiClient.post(recordEndpoint, {
        concept_name: targetId,
        is_correct: correct,
        chosen_answer: index !== null ? index : -1,
        problem_latex: problemText,
      });
    } catch (error) {
      console.error("결과 저장 실패", error);
    }
  };

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
    } catch (e) {
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
          {isFetchingProblem
            ? "⏳ 문제를 만드는 중..."
            : "🎯 랜덤 문제 가져오기"}
        </button>
      </div>

      <div className="mt-8 p-8 bg-blue-50/30 border border-gray-100 rounded-3xl shadow-xl text-left animate-fade-in">
        <div className="flex items-center justify-between mb-8 border-b pb-4">
          <h3 className="text-2xl font-black text-[#0047a5] flex items-center gap-2">
            📝 실전 테스트
          </h3>
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

        {problemText && (
          <div className="mb-10 text-xl text-gray-900 font-bold px-4 py-6 bg-white rounded-2xl shadow-sm border border-gray-100 break-keep">
            <AutoMathRenderer text={problemText} isBlock={false} />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          {choices.map((choice, index) => {
            const isCorrectChoice = index === correctIdx;
            let btnClass =
              "p-6 text-left rounded-2xl border-2 transition-all flex items-center gap-4 group ";
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
                className={btnClass}
              >
                <span className={circleClass}>{index + 1}</span>
                <span className="text-lg font-bold text-gray-800">
                  <AutoMathRenderer text={choice} isBlock={false} />
                </span>
              </button>
            );
          })}
        </div>

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
              <div className="mt-12 p-10 bg-gradient-to-r from-[#0047a5] to-blue-700 text-white rounded-3xl text-center shadow-2xl tracking-tight">
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
