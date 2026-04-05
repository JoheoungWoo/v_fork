import katex from "katex";
import { useState } from "react";

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
const LocalQuizCard = ({ title, generateFunc }) => {
  const [quizData, setQuizData] = useState(null);
  const [showSolution, setShowSolution] = useState(false);

  const handleGenerate = () => {
    setQuizData(generateFunc());
    setShowSolution(false);
  };

  return (
    <div className="mt-8 p-8 bg-white border border-gray-100 rounded-xl shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <span className="material-symbols-outlined text-[#0047a5]">
          edit_square
        </span>
        <h3 className="text-2xl font-bold tracking-tight text-gray-900">
          실전! {title} 랜덤 퀴즈
        </h3>
      </div>

      {quizData ? (
        <div className="mb-6 text-2xl font-extrabold text-center bg-blue-50/50 p-8 rounded-xl text-gray-800 border border-blue-100/50">
          <span className="text-[#0047a5] text-lg block mb-4">문제</span>
          <InlineMath math={quizData.problem} />
        </div>
      ) : (
        <p className="text-center text-gray-500 mb-6 py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          버튼을 눌러 문제를 생성해보세요!
        </p>
      )}

      {showSolution && quizData && (
        <div className="mb-6 animate-fade-in p-6 bg-[#f7fafe] rounded-xl border border-[#d7e2ff]">
          <h4 className="text-lg font-bold mb-4 text-[#0047a5]">
            💡 단계별 해설
          </h4>
          <div className="space-y-4 mb-6">
            {quizData.steps.map((step, idx) => (
              <div
                key={idx}
                className="p-5 bg-white rounded-lg shadow-sm border border-gray-100"
              >
                <p className="font-semibold text-gray-700 mb-2">
                  Step {idx + 1}. {step.text}
                </p>
                {step.math && (
                  <div className="text-center text-lg mt-3 text-blue-600">
                    <BlockMath math={step.math} />
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="text-2xl font-bold text-center text-red-600 border-t pt-6">
            정답: <InlineMath math={quizData.answer} />
          </div>
        </div>
      )}

      <div className="flex gap-4">
        <button
          onClick={handleGenerate}
          className="flex-1 bg-[#0047a5] text-white font-bold py-4 rounded-xl shadow-md transition-all active:scale-[0.98]"
        >
          {quizData ? "새로운 문제 만들기" : "문제 생성하기"}
        </button>
        {quizData && (
          <button
            onClick={() => setShowSolution(!showSolution)}
            className="flex-1 bg-[#e5edff] text-[#0047a5] font-bold py-4 rounded-xl transition-colors"
          >
            {showSolution ? "해설 숨기기" : "정답 및 해설 보기"}
          </button>
        )}
      </div>
    </div>
  );
};

export default LocalQuizCard;
