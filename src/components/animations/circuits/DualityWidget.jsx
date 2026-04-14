import { Activity, ArrowRightLeft, Layers } from "lucide-react";
import { useState } from "react";

// Vite 빌드 에러를 방지하기 위한 안전한 분수(미분) 렌더링 컴포넌트
const MathFraction = ({ top, bottom }) => (
  <span className="inline-flex flex-col items-center justify-center align-middle mx-1 text-lg">
    <span className="border-b-2 border-slate-700 pb-[2px] px-1 leading-none">
      {top}
    </span>
    <span className="pt-[2px] px-1 leading-none">{bottom}</span>
  </span>
);

const DualityWidget = () => {
  // [왼쪽] 콘덴서 상태 관리
  const [capacitance, setCapacitance] = useState(50); // C (μF)
  const [dvdt, setDvdt] = useState(10); // 전압 변화율 (V/ms)

  // [오른쪽] 코일 상태 관리
  const [inductance, setInductance] = useState(50); // L (mH)
  const [didt, setDidt] = useState(10); // 전류 변화율 (A/ms)

  // 결과값 계산
  const currentI = (capacitance * dvdt).toFixed(0); // 생성되는 전류
  const voltageV = (inductance * didt).toFixed(0); // 유도되는 전압

  return (
    <div className="p-6 max-w-5xl mx-auto bg-slate-50 rounded-2xl shadow-xl font-sans">
      {/* 헤더 섹션 */}
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-slate-800 flex items-center justify-center gap-3">
          <ArrowRightLeft className="text-blue-600 w-8 h-8" />
          콘덴서(C)와 코일(L)의 미분 쌍대성
        </h2>
        <p className="text-slate-600 mt-3 text-lg">
          전압과 전류의 변화율($dt$)이 서로 반대되는 결과를 만들어내는 완벽한
          대칭성을 확인하세요.
        </p>
      </div>

      {/* 좌우 비교 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* ==================== 왼쪽: 콘덴서 (Capacitor) ==================== */}
        <div className="bg-white rounded-2xl border-2 border-emerald-500 overflow-hidden shadow-md flex flex-col">
          <div className="bg-emerald-500 text-white p-4 text-center">
            <h3 className="text-2xl font-bold flex justify-center items-center gap-2">
              <Layers className="w-6 h-6" />
              콘덴서 (Capacitor, C)
            </h3>
            <p className="opacity-90 mt-1">전압의 변화를 억제함</p>
          </div>

          <div className="p-6 flex-grow flex flex-col">
            {/* 수식 표시부 (안전한 컴포넌트 사용) */}
            <div className="bg-emerald-50 py-6 rounded-xl flex justify-center items-center font-serif text-slate-800 mb-6">
              <span className="text-3xl font-bold italic mr-2">i(t)</span>
              <span className="text-2xl font-bold mx-2">=</span>
              <span className="text-3xl font-bold italic text-emerald-600">
                C
              </span>
              <span className="text-3xl mx-2">·</span>
              <MathFraction top="dv(t)" bottom="dt" />
            </div>

            {/* 슬라이더 컨트롤 */}
            <div className="space-y-6 mb-6">
              <div>
                <label className="flex justify-between text-sm font-semibold text-slate-700 mb-2">
                  <span>커패시턴스 (C)</span>
                  <span className="text-emerald-600">{capacitance} μF</span>
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={capacitance}
                  onChange={(e) => setCapacitance(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>
              <div>
                <label className="flex justify-between text-sm font-semibold text-slate-700 mb-2">
                  <span>전압 변화율 (dv/dt)</span>
                  <span className="text-emerald-600">{dvdt} V/ms</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={dvdt}
                  onChange={(e) => setDvdt(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
                <p className="text-xs text-slate-500 mt-1">
                  전압이 1ms당 변하는 양
                </p>
              </div>
            </div>

            {/* 결과값 */}
            <div className="mt-auto bg-slate-100 p-4 rounded-xl border border-slate-200">
              <div className="text-sm font-bold text-slate-600 mb-1">
                결과: 흐르는 전류 (i)
              </div>
              <div className="text-4xl font-black text-emerald-600 text-right">
                {currentI} <span className="text-2xl font-medium">mA</span>
              </div>
            </div>
          </div>
        </div>

        {/* ==================== 오른쪽: 코일 (Inductor) ==================== */}
        <div className="bg-white rounded-2xl border-2 border-orange-500 overflow-hidden shadow-md flex flex-col">
          <div className="bg-orange-500 text-white p-4 text-center">
            <h3 className="text-2xl font-bold flex justify-center items-center gap-2">
              <Activity className="w-6 h-6" />
              코일 (Inductor, L)
            </h3>
            <p className="opacity-90 mt-1">전류의 변화를 억제함</p>
          </div>

          <div className="p-6 flex-grow flex flex-col">
            {/* 수식 표시부 (안전한 컴포넌트 사용) */}
            <div className="bg-orange-50 py-6 rounded-xl flex justify-center items-center font-serif text-slate-800 mb-6">
              <span className="text-3xl font-bold italic mr-2">v(t)</span>
              <span className="text-2xl font-bold mx-2">=</span>
              <span className="text-3xl font-bold italic text-orange-600">
                L
              </span>
              <span className="text-3xl mx-2">·</span>
              <MathFraction top="di(t)" bottom="dt" />
            </div>

            {/* 슬라이더 컨트롤 */}
            <div className="space-y-6 mb-6">
              <div>
                <label className="flex justify-between text-sm font-semibold text-slate-700 mb-2">
                  <span>인덕턴스 (L)</span>
                  <span className="text-orange-600">{inductance} mH</span>
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={inductance}
                  onChange={(e) => setInductance(Number(e.target.value))}
                  className="w-full accent-orange-500"
                />
              </div>
              <div>
                <label className="flex justify-between text-sm font-semibold text-slate-700 mb-2">
                  <span>전류 변화율 (di/dt)</span>
                  <span className="text-orange-600">{didt} A/ms</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={didt}
                  onChange={(e) => setDidt(Number(e.target.value))}
                  className="w-full accent-orange-500"
                />
                <p className="text-xs text-slate-500 mt-1">
                  전류가 1ms당 변하는 양
                </p>
              </div>
            </div>

            {/* 결과값 */}
            <div className="mt-auto bg-slate-100 p-4 rounded-xl border border-slate-200">
              <div className="text-sm font-bold text-slate-600 mb-1">
                결과: 유도되는 전압 (v)
              </div>
              <div className="text-4xl font-black text-orange-600 text-right">
                {voltageV} <span className="text-2xl font-medium">mV</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center text-slate-500 bg-blue-50 p-4 rounded-lg border border-blue-100">
        <p className="font-semibold text-blue-800">💡 학습 포인트</p>
        <p className="text-sm mt-1">
          콘덴서는{" "}
          <strong className="text-emerald-600">
            전압이 빠르게 변할수록($dv/dt$ 증가)
          </strong>{" "}
          더 큰 전류를 통과시키고, <br className="hidden md:block" /> 코일은{" "}
          <strong className="text-orange-600">
            전류가 빠르게 변할수록($di/dt$ 증가)
          </strong>{" "}
          그 변화를 막기 위해 더 큰 역기전력(전압)을 발생시킵니다.
        </p>
      </div>
    </div>
  );
};

export default DualityWidget;
