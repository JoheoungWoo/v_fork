import apiClient from "@/api/core/apiClient";
import katex from "katex";
import "katex/dist/katex.min.css";
import { CheckCircle2, Eye, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

// 💡 전역 맵핑 테이블 (예전 해시 ID를 직관적 ID로 변환)
const ID_MAPPING = {
  "0439b5168355bedd244f2c4cbd79c82f": "8_time_constant",
  "1234qwer": "21_control_test",
  "1da7f54684d76e361736580a26e6917c": "207_cho_hw_cheer",
  "201092af306ff8cb381808e4c3f45e0c": "13_vector_dot_product",
  "30d2bd6d1675fb17fe237d8c9d930413": "14_vector_cross_product",
  "5f16ede4e7730bdbf86da518cfd232e9": "25_circuit_test_video",
  "605e4d59a8fdcfe8f914734370c726f4": "18_angular_velocity",
  "61b1ec56bcd7e87535d18c40bb9afb21": "8_parabola_line_intersection",
  "62069c25429c16e898888d5611eb67b4": "7_line_intersection",
  "8fc05f0f6c31f19deeb976cb2b1562cf": "11_trig_function_2",
  a778e615bf667e6db830b498baa5ec66: "16_partial_derivative",
  acf4500a94d8492cde7139e71760ff71: "25_control_test_video",
  c3d27bab5e1cf6ae9f07f70ae08c1e26: "10_trig_function_1",
  c44dc0cd81fbb02320299a7bff062e4d: "15_derivative",
  e935dc2d2e592a79688c5f40da5fbe23: "9_perfect_square",
  circuit_ohm_law_equivalent: "6_ohms_law",
  circuit_power: "2_circuit_power",
  circuit_reactance_3d: "7_reactance_3d",
  circuit_resistance: "1_circuit_resistance",
  circuit_y_voltage: "4_circuit_y_voltage",
  circuit_ydelta: "3_circuit_ydelta",
  control_laplace_stability: "1_laplace_stability",
  em_ampere_law: "3_ampere_law",
  em_coulomb: "1_coulombs_law",
  lec_poten_3d: "2_equipotential_3d",
  math_exponent: "2_math_exponent",
  math_factorization: "4_math_factorization",
  math_fraction: "1_math_fraction",
  math_function: "5_math_function",
  math_integral_3d: "17_math_integral_3d",
  math_logarithm: "3_math_logarithm",
  math_polynomial: "6_math_polynomial",
  math_radian: "12_math_radian",
};

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

  // 🌟 [핵심 보완] 부모가 id, conceptId 등 어떤 이름으로 넘기든 안전하게 잡아내고 공백을 제거합니다.
  const rawId = String(
    props.id || props.conceptId || props.lecture_id || "",
  ).trim();
  const normalizedId = ID_MAPPING[rawId] || rawId;

  const handleFetchProblem = async () => {
    if (!normalizedId) return;
    setIsFetchingProblem(true);
    setSelectedIndex(null);
    setShowSolution(false);
    setIsCorrect(null);
    setFetchError(false);

    try {
      const circuitKeywords = [
        "circuit",
        "ohm",
        "reactance",
        "time_constant",
        "sequence",
        "ydelta",
      ];
      const isCircuit = circuitKeywords.some((keyword) =>
        normalizedId.includes(keyword),
      );
      const endpoint = isCircuit ? "/api/circuit/random" : "/api/math/random";

      const res = await apiClient.get(`${endpoint}?type=${normalizedId}`);

      // 백엔드에서 에러나 빈 값이 오면 예외 처리
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
  }, [normalizedId]);

  const handleChoiceClick = async (index) => {
    if (showSolution || !problemData) return;

    // 🌟 [핵심 보완] Optional Chaining(?.)을 추가하여 null 에러 방지!
    const correct =
      index === (problemData?.correct_index ?? problemData?.answer_index);
    setSelectedIndex(index);
    setIsCorrect(correct);
    setShowSolution(true);

    try {
      const circuitKeywords = [
        "circuit",
        "ohm",
        "reactance",
        "time_constant",
        "sequence",
        "ydelta",
      ];
      const isCircuit = circuitKeywords.some((keyword) =>
        normalizedId.includes(keyword),
      );
      const recordEndpoint = isCircuit
        ? "/api/circuit/record"
        : "/api/math/record";

      await apiClient.post(recordEndpoint, {
        concept_name: normalizedId,
        is_correct: correct,
        chosen_answer: index !== null ? index : -1,
        problem_latex: problemData?.problem_latex || problemData?.problem || "",
      });
    } catch (error) {
      console.error("결과 저장 실패", error);
    }
  };

  const resolveImageSrc = (imgSrc) => {
    const src = String(imgSrc || "").trim();
    if (!src || src === "null" || src === "None" || src.length < 20)
      return null;
    if (!src.startsWith("http") && !src.startsWith("data:")) {
      return src.startsWith("PHN2") || src.startsWith("PD94")
        ? `data:image/svg+xml;base64,${src}`
        : `data:image/png;base64,${src}`;
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

  if (fetchError) {
    return (
      <div className="p-8 text-center bg-red-50 rounded-xl border border-red-100 mt-8">
        <p className="text-red-500 font-bold mb-4">
          해당 강의에 대한 문제 데이터를 불러오지 못했습니다.
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

  const problemText = normalizeLatexText(
    problemData?.problem_latex || problemData?.problem || problemData?.question,
  );
  const choices = problemData?.choices || problemData?.options || [];
  const stepsList = problemData?.steps || problemData?.explanation || [];
  const answerText =
    problemData?.answer ||
    problemData?.correct_answer ||
    problemData?.answer_latex;
  const questionImage =
    problemData?.question_image ||
    problemData?.graph_image ||
    problemData?.circuit_image;

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
                (problemData?.correct_index ?? problemData?.answer_index);
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
            {renderImage(problemData?.solution_image, "해설 시각화")}

            {stepsList.length > 0 && (
              <div className="space-y-4">
                {stepsList.map((step, idx) => {
                  const stepText = normalizeLatexText(
                    step.description || step.text || "",
                  );
                  const stepMath =
                    step.latex || step.math || step.formula || "";
                  const stepImgSrc = resolveImageSrc(step.step_image);

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
                            <AutoMathRenderer text={stepText} isBlock={false} />
                          </div>
                        )}
                        {stepMath && (
                          <div className="bg-gray-50 py-4 px-6 rounded-xl border border-gray-100 overflow-x-auto">
                            <BlockMath math={stepMath} />
                          </div>
                        )}
                        {stepImgSrc && (
                          <div className="mt-6 flex justify-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <img
                              src={stepImgSrc}
                              alt={`Step ${idx + 1}`}
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
    </div>
  );
};

export default LocalQuizCard;
