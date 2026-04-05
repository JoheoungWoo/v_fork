import katex from "katex";

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
const ApiQuizCard = ({
  quizData,
  selectedIndex,
  isCorrect,
  showSolution,
  onSelect,
  onFetch,
}) => {
  if (!quizData) {
    return (
      <div className="mt-8 p-8 bg-white border border-gray-100 rounded-xl shadow-sm text-center">
        <p className="text-gray-500 mb-6">
          서버에서 무작위 심화 문제를 가져옵니다.
        </p>
        <button
          onClick={onFetch}
          className="bg-[#0047a5] text-white font-bold py-4 px-8 rounded-xl shadow-md transition-all active:scale-[0.98]"
        >
          🎯 랜덤 문제 가져오기
        </button>
      </div>
    );
  }

  return (
    <div className="mt-8 p-8 bg-white border border-gray-100 rounded-xl shadow-sm animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#0047a5]">
            psychology
          </span>{" "}
          심화 실전 퀴즈
        </h3>
        <button
          onClick={onFetch}
          className="text-sm font-bold text-[#0047a5] hover:underline flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-sm">refresh</span>{" "}
          다른 문제
        </button>
      </div>

      {quizData.circuit_image && (
        <div className="flex justify-center mb-6 bg-white p-4 rounded-xl border border-gray-100 shadow-inner">
          <img
            src={`data:image/svg+xml;base64,${quizData.circuit_image.replace(/\n/g, "")}`}
            alt="회로도"
            className="max-w-full h-auto"
          />
        </div>
      )}

      <div className="text-2xl text-center mb-8 p-8 bg-blue-50/50 border border-blue-100/50 rounded-xl text-gray-900">
        <BlockMath math={quizData.problem_latex.replace(/\$/g, "")} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {quizData.choices.map((choice, idx) => {
          let btnClass =
            "border-2 p-5 rounded-xl text-lg transition-all text-left flex items-center gap-3 ";
          if (selectedIndex === idx) {
            btnClass += isCorrect
              ? "border-green-500 bg-green-50"
              : "border-red-500 bg-red-50";
          } else if (showSolution && idx === quizData.correct_index) {
            btnClass += "border-green-500 bg-green-50";
          } else {
            btnClass += "border-gray-200 hover:border-blue-300";
          }

          return (
            <button
              key={idx}
              onClick={() => onSelect(idx)}
              className={btnClass}
              disabled={showSolution}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${selectedIndex === idx ? (isCorrect ? "bg-green-500 text-white" : "bg-red-500 text-white") : showSolution && idx === quizData.correct_index ? "bg-green-500 text-white" : "bg-gray-200 text-gray-600"}`}
              >
                {idx + 1}
              </div>
              <InlineMath math={choice.replace(/\$/g, "")} />
            </button>
          );
        })}
      </div>

      {showSolution && (
        <div className="mt-8 pt-8 border-t border-gray-100">
          <p
            className={`text-2xl font-bold text-center mb-8 ${isCorrect ? "text-green-600" : "text-red-500"}`}
          >
            {isCorrect ? "정답입니다! 🎉" : "아쉽네요, 해설을 확인해 보세요 😅"}
          </p>
          <div className="p-6 bg-[#f7fafe] rounded-xl border border-[#d7e2ff]">
            <h4 className="font-bold text-[#0047a5] mb-4">💡 단계별 해설</h4>
            <div className="space-y-4">
              {quizData.steps.map((step) => (
                <div
                  key={step.step_num}
                  className="p-5 bg-white rounded-lg shadow-sm"
                >
                  <p className="font-semibold text-gray-700 mb-2">
                    Step {step.step_num}. {step.description}
                  </p>
                  <BlockMath math={step.latex.replace(/\$/g, "")} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiQuizCard;
