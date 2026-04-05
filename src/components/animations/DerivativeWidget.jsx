import { useState } from "react";

export default function DerivativeWidget({ data }) {
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);

  // 데이터가 로드되지 않았을 때의 예외 처리
  if (!data) {
    return (
      <div className="flex items-center justify-center w-full h-48 bg-slate-50 rounded-xl">
        <p className="text-slate-500 font-medium">
          문제를 불러오는 중입니다...
        </p>
      </div>
    );
  }

  const { problem_latex, graph_image, choices, correct_index, steps } = data;

  const handleChoiceClick = (idx) => {
    if (selectedIdx !== null) return; // 이미 풀었다면 클릭 방지

    setSelectedIdx(idx);
    setIsCorrect(idx === correct_index);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto p-4 md:p-6 bg-white rounded-2xl shadow-sm border border-slate-200">
      {/* 1. 문제 영역 */}
      <div className="w-full mb-6 text-center">
        <h3 className="text-[15px] md:text-[16px] font-bold text-slate-800 leading-relaxed break-keep">
          {/* 💡 실제 환경에서는 아래 텍스트 대신 LaTeX 렌더링 컴포넌트를 사용하세요 */}
          {/* <InlineMath math={problem_latex} /> */}
          {problem_latex}
        </h3>
      </div>

      {/* 2. 시각화 그래프 영역 (SVG) */}
      {graph_image && (
        <div className="w-full flex justify-center mb-8">
          {/* 백엔드에서 Base64로 인코딩된 SVG 데이터를 이미지로 렌더링합니다 */}
          <img
            src={`data:image/svg+xml;base64,${graph_image}`}
            alt="이차함수와 도함수 그래프"
            className="w-full max-w-sm h-auto object-contain pointer-events-none"
          />
        </div>
      )}

      {/* 3. 객관식 보기 영역 */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 w-full mb-6">
        {choices.map((choice, idx) => {
          // 버튼 상태에 따른 스타일링 로직
          let btnStyle =
            "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300";

          if (selectedIdx !== null) {
            if (idx === correct_index) {
              // 정답인 버튼 (내가 선택했든 안 했든 초록색으로 표시)
              btnStyle =
                "bg-green-50 border-green-500 text-green-700 ring-1 ring-green-500";
            } else if (idx === selectedIdx) {
              // 내가 선택했는데 오답인 버튼 (빨간색으로 표시)
              btnStyle =
                "bg-red-50 border-red-500 text-red-700 ring-1 ring-red-500";
            } else {
              // 선택받지 못한 나머지 오답 버튼
              btnStyle =
                "bg-slate-50 border-slate-200 text-slate-400 opacity-60";
            }
          }

          return (
            <button
              key={idx}
              onClick={() => handleChoiceClick(idx)}
              disabled={selectedIdx !== null}
              className={`py-3 px-4 rounded-xl border-2 transition-all duration-200 font-medium ${btnStyle}`}
            >
              {/* <InlineMath math={choice.replace(/\$/g, '')} /> */}
              {choice}
            </button>
          );
        })}
      </div>

      {/* 4. 해설 (단계별 풀이) 영역 - 문제를 푼 후에만 노출 */}
      {selectedIdx !== null && (
        <div className="w-full mt-4 p-5 bg-blue-50/50 rounded-xl border border-blue-100 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <h4 className="flex items-center gap-2 font-bold text-blue-800 mb-4">
            <span className="text-lg">💡</span> AI 단계별 풀이
          </h4>
          <div className="flex flex-col gap-4">
            {steps.map((step, i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <p className="text-[14px] font-medium text-slate-700 break-keep">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-200 text-blue-800 text-[11px] font-bold mr-2">
                    {step.step_num}
                  </span>
                  {step.description}
                </p>
                <div className="pl-7 text-blue-600 font-semibold text-[15px]">
                  {/* <BlockMath math={step.latex} /> */}
                  {step.latex}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
