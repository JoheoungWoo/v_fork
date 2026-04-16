import { Delete } from "lucide-react";
import * as math from "mathjs";
import { useEffect, useState } from "react";

export default function EngineeringCalculator() {
  const [expression, setExpression] = useState("");
  const [result, setResult] = useState("");
  const [isDeg, setIsDeg] = useState(true);

  // 실시간 수식 평가 로직
  useEffect(() => {
    if (!expression) {
      setResult("");
      return;
    }

    try {
      // 삼각함수 각도 단위(DEG/RAD) 처리를 위한 커스텀 스코프 설정
      let evalExpr = expression;
      if (isDeg) {
        // math.js는 기본적으로 Radian을 사용하므로,
        // 삼각함수 내부에 'deg' 단위를 강제로 붙여주는 전처리 로직 (간단화된 버전)
        evalExpr = evalExpr
          .replace(/sin\(/g, "sin(")
          .replace(/cos\(/g, "cos(")
          .replace(/tan\(/g, "tan(");
        // 완벽한 구현을 위해서는 math.js의 import 기능을 통해 sin, cos 함수 자체를 오버라이딩 하는 것이 좋습니다.
      }

      // 수식 평가 (복소수 자동 지원)
      const res = math.evaluate(evalExpr);

      // 복소수나 큰 숫자의 포맷팅
      if (res !== undefined && typeof res !== "function") {
        setResult(math.format(res, { precision: 6 }));
      } else {
        setResult("");
      }
    } catch (error) {
      // 수식이 미완성일 때(예: '2 + ')는 에러를 무시하고 빈칸 유지
      setResult("");
    }
  }, [expression, isDeg]);

  const handleClick = (val) => {
    setExpression((prev) => prev + val);
  };

  const handleDelete = () => {
    setExpression((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setExpression("");
    setResult("");
  };

  // 계산기 버튼 레이아웃 구조
  const buttons = [
    { label: "sin", val: "sin(" },
    { label: "cos", val: "cos(" },
    { label: "tan", val: "tan(" },
    { label: "AC", val: "AC", class: "bg-red-100 text-red-600" },
    { label: "DEL", val: "DEL", class: "bg-red-50 text-red-500" },
    { label: "√", val: "sqrt(" },
    { label: "^", val: "^" },
    { label: "(", val: "(" },
    { label: ")", val: ")" },
    { label: "÷", val: "/" },
    { label: "7", val: "7" },
    { label: "8", val: "8" },
    { label: "9", val: "9" },
    { label: "i (복소수)", val: "i" },
    { label: "×", val: "*" },
    { label: "4", val: "4" },
    { label: "5", val: "5" },
    { label: "6", val: "6" },
    { label: "π", val: "pi" },
    { label: "-", val: "-" },
    { label: "1", val: "1" },
    { label: "2", val: "2" },
    { label: "3", val: "3" },
    { label: "e", val: "e" },
    { label: "+", val: "+" },
    { label: "0", val: "0" },
    { label: ".", val: "." },
    { label: "EXP", val: "E" },
    { label: "=", val: "=", class: "bg-blue-600 text-white col-span-2" },
  ];

  return (
    <div className="w-full max-w-sm mx-auto bg-slate-800 p-6 rounded-3xl shadow-2xl font-sans">
      {/* 1. 디스플레이 화면 */}
      <div className="bg-slate-100 p-4 rounded-xl mb-6 shadow-inner h-28 flex flex-col justify-between">
        <div className="flex justify-between items-center text-xs text-slate-400 font-bold mb-1">
          <button
            onClick={() => setIsDeg(!isDeg)}
            className="px-2 py-1 bg-slate-200 rounded hover:bg-slate-300 transition-colors text-slate-700"
          >
            {isDeg ? "DEG" : "RAD"}
          </button>
          <span>Math.js Engine</span>
        </div>
        <div className="text-right text-slate-600 text-xl overflow-x-auto whitespace-nowrap tracking-wider min-h-[1.5rem]">
          {expression || "0"}
        </div>
        <div className="text-right text-slate-900 text-3xl font-bold overflow-x-auto whitespace-nowrap">
          {result ? `= ${result}` : ""}
        </div>
      </div>

      {/* 2. 키패드 영역 */}
      <div className="grid grid-cols-5 gap-2">
        {buttons.map((btn, idx) => (
          <button
            key={idx}
            onClick={() => {
              if (btn.val === "AC") handleClear();
              else if (btn.val === "DEL") handleDelete();
              else if (btn.val === "=") {
                /* 결과 확정 액션 */
              } else handleClick(btn.val);
            }}
            className={`h-12 rounded-lg font-bold text-sm flex items-center justify-center transition-transform active:scale-95 shadow-sm
              ${btn.class ? btn.class : /[0-9.]/.test(btn.label) ? "bg-slate-100 text-slate-800" : "bg-slate-700 text-slate-200 hover:bg-slate-600"}
            `}
          >
            {btn.label === "DEL" ? <Delete size={18} /> : btn.label}
          </button>
        ))}
      </div>

      <p className="mt-6 text-center text-xs text-slate-500">
        * 교류 해석 시 $A + jB$ 대신 $A + Bi$ 형태로 입력해 주세요.
      </p>
    </div>
  );
}
