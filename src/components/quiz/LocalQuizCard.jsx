import apiClient from "@/api/core/apiClient";
import katex from "katex";
import "katex/dist/katex.min.css";
import { CheckCircle2, Eye, XCircle } from "lucide-react";
import { useState } from "react";

// ==========================================
// 💡 수식 렌더링용 헬퍼 함수
// ==========================================
// 백엔드에서 온 통짜 \text{} 문자열을 분해하여 자연스럽게 줄바꿈되도록 변환
const normalizeLatexText = (text) => {
  if (!text) return "";
  const strText = String(text);

  // $ 기호가 없으면서 \text{ } 패턴이 있는 경우 (주로 문제 텍스트)
  if (!/\$\$|\\\[|\\\(|\$/.test(strText) && strText.includes("\\text{")) {
    const parts = strText.split(/\\text{([^}]+)}/g);
    let result = "";
    for (let i = 0; i < parts.length; i++) {
      if (i % 2 === 0) {
        // 수학 수식 부분
        const mathPart = parts[i].trim();
        if (mathPart) result += ` $${mathPart}$ `;
      } else {
        // 일반 텍스트 부분
        result += parts[i];
      }
    }
    return result.replace(/\s+/g, " ").trim();
  }
  return strText;
};

// ==========================================
// 💡 수식 렌더링용 내부 컴포넌트
// ==========================================
const InlineMath = ({ math }) => {
  if (!math) return null;
  const cleanMath = String(math).replace(/\\\\/g, "\\");
  const html = katex.renderToString(cleanMath, {
    throwOnError: false,
    displayMode: false,
    strict: "ignore",
  });
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
};

const BlockMath = ({ math }) => {
  if (!math) return null;
  const cleanMath = String(math).replace(/\\\\/g, "\\");
  const html = katex.renderToString(cleanMath, {
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

  const hasMathDelimiters = /\$\$|\\\[|\\\(|\$/.test(cleanText);

  if (!hasMathDelimiters) {
    // 역슬래시(\)가 없는 순수 텍스트인 경우 KaTeX 렌더링 방지 (띄어쓰기 증발 해결)
    if (!cleanText.includes("\\")) {
      return <span>{cleanText}</span>;
    }

    return isBlock ? (
      <BlockMath math={cleanText} />
    ) : (
      <InlineMath math={cleanText} />
    );
  }

  const regex =
    /(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\$[\s\S]*?\$|\\\([\s\S]*?\\\))/g;
  const parts = cleanText.split(regex);

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
// 💡 퀴즈 메인 컴포넌트
// ==========================================
const LocalQuizCard = ({ id, subject = "general" }) => {
  const [problemData, setProblemData] = useState(null);
  const [isFetchingProblem, setIsFetchingProblem] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [showSolution, setShowSolution] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);

  const handleFetchProblem = async () => {
    setIsFetchingProblem(true);
    setSelectedIndex(null);
    setShowSolution(false);
    setIsCorrect(null);

    try {
      const endpoint = id.includes("circuit")
        ? "/api/circuit/random"
        : "/api/math/random";
      const res = await apiClient.get(`${endpoint}?type=${id}`);
      setProblemData(res.data);
    } catch (e) {
      alert("백엔드 서버에서 문제를 가져오는데 실패했습니다.");
    } finally {
      setIsFetchingProblem(false);
    }
  };

  const handleChoiceClick = async (index) => {
    if (showSolution) return;
    const correct =
      index === (problemData.correct_index ?? problemData.answer_index);
    setSelectedIndex(index);
    setIsCorrect(correct);
    setShowSolution(true);

    const recordEndpoint = id.includes("circuit")
      ? "/api/circuit/record"
      : "/api/math/record";

    try {
      await apiClient.post(recordEndpoint, {
        concept_name: id,
        is_correct: correct,
        chosen_answer: index !== null ? index : -1,
        problem_latex: problemData?.problem_latex || problemData?.problem || "",
        quiz_data: problemData,
      });
    } catch (error) {
      console.error("퀴즈 결과를 저장하지 못했습니다:", error);
    }
  };

  // 이미지 렌더링 헬퍼 (Base64 등 처리)
  const resolveImageSrc = (imgSrc) => {
    const src = String(imgSrc).trim();
    if (src === "null" || src === "None" || src.length < 20) return null;

    if (!src.startsWith("http") && !src.startsWith("data:")) {
      if (src.startsWith("PHN2") || src.startsWith("PD94")) {
        return `data:image/svg+xml;base64,${src}`;
      } else {
        return `data:image/png;base64,${src}`;
      }
    }
    return src;
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

  // 💡 데이터 파싱 및 정규화
  const rawProblemText =
    problemData?.problem_latex ||
    problemData?.problem ||
    problemData?.question ||
    "";
  const problemText = normalizeLatexText(rawProblemText);
  const choices = problemData?.choices || problemData?.options || [];
  const stepsList = problemData?.steps || problemData?.explanation || [];
  const answerText =
    problemData?.answer ||
    problemData?.correct_answer ||
    problemData?.answer_latex ||
    "";

  const questionImage = problemData?.question_image || problemData?.graph_image;
  const solutionImage = problemData?.solution_image;

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

      {problemData && (
        <div className="mt-8 p-8 bg-blue-50/30 border border-gray-100 rounded-3xl shadow-xl text-left animate-fade-in">
          <div className="flex items-center justify-between mb-8 border-b pb-4">
            <h3 className="text-2xl font-black text-[#0047a5] flex items-center gap-2">
              📝 실전 테스트
            </h3>
            {showSolution && choices.length > 0 && (
              <div
                className={`flex items-center gap-2 font-black text-xl ${
                  isCorrect ? "text-green-600" : "text-red-600"
                }`}
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

          {renderImage(questionImage, "문제 이미지")}

          {problemText && (
            <div className="mb-10 text-xl text-gray-900 font-bold px-4 py-6 bg-white rounded-2xl shadow-sm border border-gray-100 break-keep">
              <AutoMathRenderer text={problemText} isBlock={false} />
            </div>
          )}

          {choices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
              {choices.map((choice, index) => {
                const isCorrectChoice =
                  index ===
                  (problemData.correct_index ?? problemData.answer_index);

                let btnClass =
                  "p-6 text-left rounded-2xl border-2 transition-all flex items-center gap-4 group ";
                let circleClass =
                  "w-10 h-10 flex items-center justify-center rounded-full font-black shrink-0 transition-colors ";

                if (selectedIndex === index) {
                  if (isCorrect) {
                    btnClass += "border-green-500 bg-green-50";
                    circleClass += "bg-white text-gray-900";
                  } else {
                    btnClass += "border-red-500 bg-red-50";
                    circleClass += "bg-white text-gray-900";
                  }
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
          ) : (
            !showSolution && (
              <div className="text-center mb-10">
                <button
                  onClick={() => handleChoiceClick(null)}
                  className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold text-lg hover:bg-green-700 shadow-md transition-all flex items-center justify-center gap-2 mx-auto"
                >
                  <Eye size={20} /> 정답 및 해설 바로보기
                </button>
              </div>
            )
          )}

          {showSolution && (
            <div className="mt-12 pt-10 border-t-2 border-dashed border-gray-300 animate-slide-up">
              <h4 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
                💡 전문가의 상세 풀이
              </h4>

              {renderImage(solutionImage, "해설 시각화")}

              {stepsList.length > 0 && (
                <div className="space-y-4">
                  {stepsList.map((step, idx) => {
                    const rawStepText = step.description || step.text || "";
                    const stepText = normalizeLatexText(rawStepText);
                    const stepMath =
                      step.latex || step.math || step.formula || "";
                    const stepImgSrc = step.step_image
                      ? resolveImageSrc(step.step_image)
                      : null;

                    return (
                      <div
                        key={idx}
                        className="flex gap-5 items-start bg-white p-6 rounded-2xl border border-gray-200 shadow-sm"
                      >
                        <span className="bg-[#e5edff] text-[#0047a5] font-black w-10 h-10 flex items-center justify-center rounded-xl shrink-0 mt-1">
                          {idx + 1}
                        </span>
                        <div className="mt-1 w-full overflow-hidden">
                          {stepText && (
                            <div className="text-gray-700 font-bold mb-4 text-lg leading-relaxed break-keep">
                              <AutoMathRenderer
                                text={stepText}
                                isBlock={false}
                              />
                            </div>
                          )}

                          {stepMath && (
                            <div className="bg-gray-50 py-4 px-6 rounded-xl border border-gray-100 overflow-x-auto">
                              <BlockMath math={stepMath} />
                            </div>
                          )}

                          {/* 🌟 풀이 과정(Step) 내부 이미지 렌더링 영역 */}
                          {stepImgSrc && (
                            <div className="mt-6 flex justify-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                              <img
                                src={stepImgSrc}
                                alt={`Step ${idx + 1} 시각화 자료`}
                                className="max-w-full h-auto rounded object-contain max-h-[350px]"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
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
      )}
    </div>
  );
};

export default LocalQuizCard;
