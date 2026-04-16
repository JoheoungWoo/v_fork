import "katex/dist/katex.min.css";
import { useEffect, useState } from "react";
import { InlineMath } from "react-katex";
import apiClient from "./apiClient";

// ※ 실제 프로젝트에서는 위에서 생성된 3D 위젯 컴포넌트를 임포트하여 사용합니다.
// import Coulomb3DWidget from './components/Coulomb3DWidget';

export default function CoulombQuiz() {
  const [quizData, setQuizData] = useState(null);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // 🔥 오답 처리를 위한 새로운 상태
  const [showRemedial, setShowRemedial] = useState(false);
  const [neo4jFeedback, setNeo4jFeedback] = useState("");

  const fetchQuiz = async () => {
    setLoading(true);
    setSelectedIdx(null);
    setShowRemedial(false);
    try {
      const response = await apiClient.get("/api/quiz/coulomb");
      setQuizData(response.data);
    } catch (error) {
      console.error("퀴즈를 불러오는 데 실패했습니다.", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuiz();
  }, []);

  const handleSelect = async (idx, choiceText) => {
    if (selectedIdx !== null || isSubmitting) return;

    setSelectedIdx(idx);
    const isCorrect = idx === quizData.correct_index;
    setIsSubmitting(true);

    try {
      // 1. 백엔드에 결과 전송
      const res = await apiClient.post("/api/quiz/record", {
        concept_name: "쿨롱의 법칙",
        is_correct: isCorrect,
        chosen_answer: choiceText,
        problem_latex: quizData.problem_latex,
      });

      // 2. 오답일 경우 Neo4j에서 분석된 취약점 피드백을 받아와서 시각화 위젯 오픈
      if (!isCorrect) {
        // 백엔드에서 내려준 맞춤형 피드백이라고 가정 (예: "거리의 제곱에 반비례하는 개념 약함")
        setNeo4jFeedback(
          "Neo4j 지식 그래프 분석 결과: 회원님은 쿨롱의 법칙에서 '거리의 제곱에 반비례(1/r²)'하는 역제곱 법칙 계산에서 자주 실수하는 패턴이 발견되었습니다.",
        );
        setShowRemedial(true);
      }
    } catch (error) {
      console.error("퀴즈 결과 저장 실패", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="p-8 text-center text-slate-500">
        퀴즈를 생성 중입니다...
      </div>
    );
  if (!quizData)
    return (
      <div className="p-8 text-center text-red-500">
        데이터를 불러오지 못했습니다.
      </div>
    );

  const isAnswered = selectedIdx !== null;
  const isCorrect = selectedIdx === quizData.correct_index;

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden font-sans">
      {/* --- 문제 영역 --- */}
      <div className="p-6 md:p-8 bg-slate-50 border-b border-slate-200">
        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full mb-4 inline-block">
          전자기학
        </span>
        <h3 className="text-lg md:text-xl font-medium text-slate-800 leading-relaxed">
          <InlineMath math={quizData.problem_latex} />
        </h3>
      </div>

      {/* --- 보기 영역 --- */}
      <div className="p-6 md:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {quizData.choices.map((choice, idx) => {
            let btnClass =
              "bg-white hover:bg-slate-50 border-slate-300 text-slate-700";
            if (isAnswered) {
              if (idx === quizData.correct_index) {
                btnClass =
                  "bg-green-100 border-green-500 text-green-800 font-bold";
              } else if (idx === selectedIdx) {
                btnClass = "bg-red-100 border-red-500 text-red-800 font-bold";
              } else {
                btnClass =
                  "bg-slate-50 border-slate-200 text-slate-400 opacity-50";
              }
            }
            return (
              <button
                key={idx}
                disabled={isAnswered}
                onClick={() => handleSelect(idx, choice)}
                className={`p-4 border-2 rounded-xl text-md transition-all text-left ${btnClass}`}
              >
                <InlineMath math={choice} />
              </button>
            );
          })}
        </div>

        {/* --- 정답 해설 (맞췄을 때만 렌더링) --- */}
        {isAnswered && isCorrect && (
          <div className="p-5 rounded-xl border bg-green-50 border-green-200 animate-in fade-in slide-in-from-bottom-2">
            <h4 className="font-bold mb-3 text-slate-800 flex items-center justify-between">
              🎉 정답입니다!
              <button
                onClick={fetchQuiz}
                className="text-sm px-3 py-1 bg-white border border-slate-300 rounded shadow-sm text-slate-600"
              >
                다음 문제 풀기 ➔
              </button>
            </h4>
            <div className="space-y-2">
              {quizData.steps.map((step, idx) => (
                <div
                  key={idx}
                  className="text-sm text-slate-700 bg-white p-3 rounded border border-slate-100"
                >
                  <span className="font-bold text-blue-500 mr-2">
                    Step {idx + 1}.
                  </span>
                  <InlineMath math={step.description} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 🔥 오답일 경우: Neo4j 피드백 & 3D 위젯 렌더링 영역 🔥 */}
      {showRemedial && (
        <div className="border-t-4 border-amber-400 bg-slate-900 animate-in slide-in-from-bottom-4 duration-500">
          <div className="p-6 md:p-8">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-amber-400 font-bold text-xl flex items-center gap-2 mb-2">
                  ⚠️ 오답 분석 리포트
                </h4>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {neo4jFeedback}
                </p>
              </div>
              <button
                onClick={fetchQuiz}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors whitespace-nowrap"
              >
                다시 도전하기
              </button>
            </div>

            <div className="bg-white rounded-xl overflow-hidden mt-6 shadow-2xl">
              {/* 여기에 위에서 생성된 3D 위젯 컴포넌트가 들어갑니다. */}
              {/* <Coulomb3DWidget initialQ1={quizData.meta.q1} initialQ2={quizData.meta.q2} initialR={quizData.meta.r} /> */}

              <div className="p-8 text-center bg-slate-100 border border-slate-300 border-dashed rounded-lg">
                <span className="text-slate-500 font-bold">
                  🛠️ [3D 쿨롱의 법칙 인터랙티브 시뮬레이터 렌더링 영역]
                </span>
                <p className="text-sm text-slate-400 mt-2">
                  사용자가 직접 거리를 조절하며 힘이 줄어드는 과정을 눈으로
                  확인합니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
