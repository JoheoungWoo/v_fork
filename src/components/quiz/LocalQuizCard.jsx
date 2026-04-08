import "katex/dist/katex.min.css";
import { useEffect, useState } from "react";
import { BlockMath } from "react-katex";

// utils/quizUtils에서 필요한 함수들을 import 해옵니다.
import {
  generateBasicFunctionQuiz,
  generateCompositeFunctionQuiz,
  generateDerivativeQuiz,
  generateExponentQuiz,
  generateFactorizationQuiz,
  generateFractionQuiz,
  generateLogarithmQuiz,
  generateOhmQuiz,
  generatePerfectSquareQuiz,
} from "../../utils/quizUtils";

// 💡 ApiQuizCard와 동일한 매핑 테이블 (하위 호환성 유지)
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

const LocalQuizCard = ({ conceptId }) => {
  const [quizData, setQuizData] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);

  // 💡 매핑된 새로운 ID 적용
  const normalizedId = ID_MAPPING[conceptId] || conceptId;

  // 💡 Switch 문을 새 ID 구조에 맞게 업데이트
  const getQuizData = (id) => {
    switch (id) {
      case "1_math_fraction":
        return generateFractionQuiz();
      case "2_math_exponent":
        return generateExponentQuiz();
      case "3_math_logarithm":
        return generateLogarithmQuiz();
      case "4_math_factorization":
        return generateFactorizationQuiz();
      case "5_math_function":
        return generateBasicFunctionQuiz();
      case "6_math_composite_function":
        return generateCompositeFunctionQuiz();
      case "9_perfect_square":
        return generatePerfectSquareQuiz();
      case "6_ohms_law":
        return generateOhmQuiz();
      case "15_derivative":
        return generateDerivativeQuiz();
      // utils에 함수가 있다면 매핑 가능
      // case "7_line_intersection":
      //   return generateLineIntersectionQuiz();
      default:
        console.warn(
          `[LocalQuizCard] 매핑되지 않은 ID 또는 함수 미구현: ${id}`,
        );
        return null;
    }
  };

  const loadNewProblem = () => {
    setIsSubmitted(false);
    setSelectedOption(null);
    setIsCorrect(null);
    const data = getQuizData(normalizedId);
    setQuizData(data);
  };

  useEffect(() => {
    loadNewProblem();
  }, [normalizedId]);

  const handleSubmit = () => {
    if (selectedOption === null || !quizData) return;

    // 객관식 선택형인지, 단답형(직접 입력값 확인)인지에 따라 분기
    let correct = false;
    if (quizData.choices) {
      correct = selectedOption === quizData.correct_index;
    } else {
      // 로컬 퀴즈가 보기가 없는 경우, 문자열 정답 매칭 (예외 처리)
      correct = String(selectedOption) === String(quizData.answer);
    }

    setIsCorrect(correct);
    setIsSubmitted(true);
  };

  if (!quizData) {
    return (
      <div className="p-4 text-center text-slate-500">
        해당 개념에 대한 로컬 퀴즈가 아직 준비되지 않았습니다.
      </div>
    );
  }

  // 보기 배열이 없다면 기본 4지 선다 형태로 오답 보기 생성 (LocalUtils 보호)
  const choices = quizData.choices || [
    quizData.answer,
    "오답 1",
    "오답 2",
    "오답 3",
  ];
  const correctIdx =
    quizData.correct_index !== undefined ? quizData.correct_index : 0;

  return (
    <div className="w-full max-w-xl p-4 md:p-6 mx-auto bg-white rounded-xl shadow-lg border border-slate-100">
      <h3 className="text-lg md:text-xl font-bold mb-4 text-slate-800">
        💡 개념 퀴즈 (Local)
      </h3>

      <div className="mb-6 p-4 bg-slate-50 rounded-lg text-slate-900 overflow-x-auto flex justify-center text-lg">
        <BlockMath math={quizData.problem_latex || quizData.problem} />
      </div>

      <div className="space-y-3 mb-6">
        {choices.map((choice, index) => {
          let btnClass =
            "w-full text-left p-3 md:p-4 rounded-lg border transition-all ";

          if (!isSubmitted) {
            btnClass +=
              selectedOption === index
                ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                : "border-slate-200 hover:border-blue-300 hover:bg-slate-50";
          } else {
            if (index === correctIdx) {
              btnClass += "border-green-500 bg-green-50 font-bold";
            } else if (selectedOption === index) {
              btnClass += "border-red-500 bg-red-50";
            } else {
              btnClass += "border-slate-200 opacity-50";
            }
          }

          return (
            <button
              key={index}
              onClick={() => !isSubmitted && setSelectedOption(index)}
              disabled={isSubmitted}
              className={btnClass}
            >
              <span className="inline-block mr-2 text-slate-500 font-medium">
                {index + 1}.
              </span>
              <BlockMath math={choice.replace(/^\$|\$$/g, "")} />
            </button>
          );
        })}
      </div>

      {!isSubmitted ? (
        <button
          onClick={handleSubmit}
          disabled={selectedOption === null}
          className={`w-full py-3 rounded-lg font-bold text-white transition-colors ${
            selectedOption !== null
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-slate-300 cursor-not-allowed"
          }`}
        >
          정답 확인하기
        </button>
      ) : (
        <div className="space-y-4 animate-fadeIn">
          <div
            className={`p-4 rounded-lg flex items-center justify-between ${
              isCorrect
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            <span className="font-bold text-lg">
              {isCorrect ? "🎉 정답입니다!" : "💡 아쉽네요, 다시 도전해보세요!"}
            </span>
            <button
              onClick={loadNewProblem}
              className="px-4 py-2 bg-white rounded shadow text-sm font-bold hover:bg-slate-50"
            >
              새로운 문제
            </button>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-5">
            <h4 className="font-bold text-slate-800 mb-4 border-b pb-2">
              📝 상세 풀이
            </h4>
            <div className="space-y-4">
              {quizData.steps.map((step, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
                    {step.step_num || idx + 1}
                  </div>
                  <div className="flex-1 overflow-x-auto">
                    <p className="text-slate-700 mb-2">
                      {step.description || step.text}
                    </p>
                    {step.latex || step.math ? (
                      <div className="bg-white p-2 rounded border border-slate-100">
                        <BlockMath math={step.latex || step.math} />
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocalQuizCard;
