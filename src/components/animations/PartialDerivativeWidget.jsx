import katex from "katex";
import "katex/dist/katex.min.css";
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

const PartialDerivativeWidget = () => {
  const [x, setX] = useState(2);
  const [y, setY] = useState(3);

  // f(x,y) = 3x^2y + 2xy^2
  const f_val = 3 * x ** 2 * y + 2 * x * y ** 2;
  // f_x (x로 편미분, y는 상수) = 6xy + 2y^2
  const df_dx = 6 * x * y + 2 * y ** 2;
  // f_y (y로 편미분, x는 상수) = 3x^2 + 4xy
  const df_dy = 3 * x ** 2 + 4 * x * y;

  return (
    <div className="flex flex-col items-center p-2 md:p-6 w-full animate-fade-in">
      <div className="mb-6 p-6 bg-slate-50 border border-slate-200 rounded-2xl w-full text-center shadow-sm">
        <h4 className="text-slate-500 font-bold mb-2">목표 다항함수</h4>
        <div className="text-xl md:text-2xl text-slate-800">
          <BlockMath math={`f(x, y) = 3x^2y + 2xy^2`} />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 w-full justify-center mb-8">
        {/* X 값 조절 패널 */}
        <div className="flex-1 bg-blue-50/50 p-6 rounded-2xl border-2 border-blue-100 hover:border-blue-300 transition-colors">
          <label className="block text-base font-bold text-blue-800 mb-4 flex justify-between">
            <span>x 변수 조절</span>
            <span className="bg-white px-3 py-1 rounded-lg shadow-sm">{x}</span>
          </label>
          <input
            type="range"
            min="-5"
            max="5"
            value={x}
            onChange={(e) => setX(Number(e.target.value))}
            className="w-full cursor-pointer accent-blue-600 h-2 bg-blue-200 rounded-lg appearance-none"
          />
        </div>

        {/* Y 값 조절 패널 */}
        <div className="flex-1 bg-red-50/50 p-6 rounded-2xl border-2 border-red-100 hover:border-red-300 transition-colors">
          <label className="block text-base font-bold text-red-800 mb-4 flex justify-between">
            <span>y 변수 조절 (상수 취급)</span>
            <span className="bg-white px-3 py-1 rounded-lg shadow-sm">{y}</span>
          </label>
          <input
            type="range"
            min="-5"
            max="5"
            value={y}
            onChange={(e) => setY(Number(e.target.value))}
            className="w-full cursor-pointer accent-red-500 h-2 bg-red-200 rounded-lg appearance-none"
          />
        </div>
      </div>

      {/* 결과 패널 */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 shadow-sm p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
          <h4 className="text-center font-extrabold text-slate-700 mb-4">
            x에 대한 편미분 계수{" "}
            <span className="text-sm font-normal text-slate-400">
              (y는 상수)
            </span>
          </h4>
          <BlockMath math={`f_x = 6xy + 2y^2`} />
          <div className="mt-4 pt-4 border-t border-slate-100 text-2xl font-black text-blue-600 text-center">
            = {df_dx}
          </div>
        </div>

        <div className="bg-white border border-slate-200 shadow-sm p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
          <h4 className="text-center font-extrabold text-slate-700 mb-4">
            y에 대한 편미분 계수{" "}
            <span className="text-sm font-normal text-slate-400">
              (x는 상수)
            </span>
          </h4>
          <BlockMath math={`f_y = 3x^2 + 4xy`} />
          <div className="mt-4 pt-4 border-t border-slate-100 text-2xl font-black text-red-500 text-center">
            = {df_dy}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartialDerivativeWidget;
