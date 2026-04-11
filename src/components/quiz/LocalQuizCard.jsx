import apiClient from "@/api/core/apiClient";
import katex from "katex";
import "katex/dist/katex.min.css";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

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
      className="overflow-x-auto flex justify-center w-full my-2"
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

  const targetId = String(
    props.id || props.conceptId || props.lecture_id || "",
  ).trim();
  const subjectName = String(props.subject || "").trim();

  // 🌟 과목 및 ID를 기반으로 전용 API 경로를 결정하는 로직
  const getBaseEndpoint = useCallback(() => {
    const lowerId = targetId.toLowerCase();
    const combinedStr = (subjectName + lowerId).toLowerCase();

    if (
      combinedStr.includes("기기") ||
      combinedStr.includes("motor") ||
      combinedStr.includes("machine") ||
      combinedStr.includes("induction")
    ) {
      return "/api/machine";
    }
    if (
      combinedStr.includes("회로") ||
      combinedStr.includes("전기") ||
      combinedStr.includes("전력") ||
      combinedStr.includes("설비") ||
      combinedStr.includes("circuit") ||
      combinedStr.includes("ohm")
    ) {
      return "/api/circuit";
    }
    return "/api/math";
  }, [subjectName, targetId]);

  // 데이터 정규화 변수들
  const choices = problemData?.choices || problemData?.options || [];
  const correctIdx =
    problemData?.correct_index ??
    problemData?.answer_index ??
    (typeof problemData?.answer === "number" ? problemData.answer : null);
  const problemText = normalizeLatexText(
    problemData?.problem_latex || problemData?.problem || problemData?.question,
  );
  const answerText =
    typeof problemData?.answer === "string"
      ? problemData.answer
      : problemData?.answer_latex || problemData?.correct_answer;

  let normalizedSteps = [];
  if (Array.isArray(problemData?.steps)) normalizedSteps = problemData.steps;
  else if (Array.isArray(problemData?.explanation))
    normalizedSteps = problemData.explanation;
  else if (typeof problemData?.explanation === "string")
    normalizedSteps = [{ description: problemData.explanation }];

  const handleFetchProblem = async () => {
    if (!targetId) return;
    setIsFetchingProblem(true);
    setSelectedIndex(null);
    setShowSolution(false);
    setIsCorrect(null);
    setFetchError(false);

    try {
      const baseApi = getBaseEndpoint();
      const res = await apiClient.get(`${baseApi}/random?type=${targetId}`);

      if (!res.data || Object.keys(res.data).length === 0) {
        setFetchError(true);
      } else {
        setProblemData(res.data);
      }
    } catch (e) {
      console.error("❌ 문제 로딩 실패:", e);
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
      const baseApi = getBaseEndpoint();
      await apiClient.post(`${baseApi}/record`, {
        concept_name: targetId,
        is_correct: correct,
        chosen_answer: index ?? -1,
        problem_latex: problemText,
      });
    } catch (error) {
      console.error("❌ 결과 저장 실패:", error);
    }
  };

  const resolveImageSrc = (imgSrc) => {
    const src = String(imgSrc || "").trim();
    if (!src || src === "null" || src === "None" || src.length < 10)
      return null;
    if (src.startsWith("http") || src.startsWith("data:")) return src;

    // Base64 데이터 처리
    if (src.startsWith("PHN2") || src.includes("<svg"))
      return `data:image/svg+xml;base64,${src}`;
    return `data:image/png;base64,${src}`;
  };

  if (fetchError) {
    return (
      <div className="p-10 text-center bg-red-50 rounded-2xl border border-red-100 mt-8">
        <p className="text-red-500 font-bold text-lg mb-6">
          문제를 생성할 수 없습니다. (ID: {targetId})
        </p>
        <button
          onClick={handleFetchProblem}
          className="px-8 py-3 bg-white text-red-600 font-black rounded-xl shadow-sm hover:bg-red-50 transition-all border border-red-200"
        >
          다시 시도하기
        </button>
      </div>
    );
  }

  if (!problemData && isFetchingProblem) {
    return (
      <div className="p-20 text-center flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-[#0047a5]" size={48} />
        <p className="text-slate-500 font-bold">
          인공지능이 문제를 구성하고 있습니다...
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 text-center max-w-4xl mx-auto">
      <div className="mb-10">
        <button
          onClick={handleFetchProblem}
          disabled={isFetchingProblem}
          className={`font-black text-xl py-5 px-12 rounded-2xl shadow-xl transition-all active:scale-95 ${
            isFetchingProblem
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-[#0047a5] text-white hover:bg-blue-800"
          }`}
        >
          {isFetchingProblem ? "⏳ 생성 중..." : "🎯 새로운 문제 도전"}
        </button>
      </div>

      <div className="p-8 md:p-12 bg-white border border-gray-200 rounded-[2.5rem] shadow-2xl text-left">
        <div className="flex items-center justify-between mb-10 border-b pb-6">
          <h3 className="text-3xl font-black text-[#0047a5] tracking-tighter">
            실전 TEST
          </h3>
          {showSolution && (
            <div
              className={`flex items-center gap-2 font-black text-2xl ${isCorrect ? "text-green-600" : "text-red-600"}`}
            >
              {isCorrect ? (
                <>
                  <CheckCircle2 size={32} /> 정답!
                </>
              ) : (
                <>
                  <XCircle size={32} /> 오답
                </>
              )}
            </div>
          )}
        </div>

        {/* 회로도 또는 그래프 이미지 출력 */}
        {(problemData?.circuit_image ||
          problemData?.question_image ||
          problemData?.graph_image) && (
          <div className="bg-slate-50 p-8 rounded-3xl border border-dashed border-slate-200 mb-10 flex justify-center">
            <img
              src={resolveImageSrc(
                problemData.circuit_image ||
                  problemData.question_image ||
                  problemData.graph_image,
              )}
              alt="문제 시각 자료"
              className="max-w-full h-auto object-contain max-h-[450px] drop-shadow-md"
            />
          </div>
        )}

        {problemText && (
          <div className="mb-12 text-2xl text-gray-800 font-bold leading-relaxed break-keep p-4 bg-blue-50/30 rounded-2xl">
            <AutoMathRenderer text={problemText} isBlock={false} />
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 mb-12">
          {choices.map((choice, index) => {
            const isCorrectChoice = index === correctIdx;
            const isSelected = selectedIndex === index;

            let cardStyle =
              "p-6 text-left rounded-3xl border-2 transition-all flex items-center gap-6 group relative ";
            let numStyle =
              "w-12 h-12 flex items-center justify-center rounded-2xl font-black text-xl shrink-0 transition-all ";

            if (isSelected) {
              cardStyle += isCorrect
                ? "border-green-500 bg-green-50 shadow-green-100"
                : "border-red-500 bg-red-50 shadow-red-100";
              numStyle +=
                "bg-white " + (isCorrect ? "text-green-600" : "text-red-600");
            } else if (showSolution && isCorrectChoice) {
              cardStyle += "border-green-500 bg-green-50 animate-pulse";
              numStyle += "bg-green-500 text-white";
            } else {
              cardStyle +=
                "border-gray-100 bg-gray-50 hover:border-[#0047a5] hover:bg-white hover:shadow-xl";
              numStyle +=
                "bg-white text-gray-400 group-hover:text-[#0047a5] group-hover:shadow-inner";
            }

            return (
              <button
                key={index}
                onClick={() => handleChoiceClick(index)}
                disabled={showSolution}
                className={cardStyle}
              >
                <span className={numStyle}>{index + 1}</span>
                <span className="text-xl font-bold text-gray-700">
                  <AutoMathRenderer text={choice} isBlock={false} />
                </span>
              </button>
            );
          })}
        </div>

        {showSolution && (
          <div className="mt-16 pt-12 border-t-4 border-double border-gray-200 animate-slide-up">
            <h4 className="text-3xl font-black text-gray-900 mb-8 tracking-tight">
              💡 상세 풀이 과정
            </h4>
            <div className="space-y-6">
              {normalizedSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="flex gap-6 items-start bg-slate-50 p-8 rounded-[2rem] border border-gray-100 transition-hover hover:shadow-md"
                >
                  <span className="bg-[#0047a5] text-white font-black w-12 h-12 flex items-center justify-center rounded-2xl shrink-0">
                    {idx + 1}
                  </span>
                  <div className="w-full">
                    <div className="text-gray-700 font-bold text-xl leading-relaxed mb-4 break-keep">
                      <AutoMathRenderer
                        text={step.description || step.text || ""}
                        isBlock={false}
                      />
                    </div>
                    {(step.latex || step.math) && (
                      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-inner">
                        <BlockMath math={step.latex || step.math} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {answerText && (
              <div className="mt-14 p-12 bg-[#0047a5] text-white rounded-[3rem] text-center shadow-[0_20px_50px_rgba(0,71,165,0.3)]">
                <p className="text-blue-300 text-lg font-black mb-4 tracking-widest uppercase">
                  Final Answer
                </p>
                <div className="text-5xl font-black">
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
