import { useState } from "react";

export default function MobileCoilAndCapacitorWidget() {
  // 역률 상태값 (0.5 ~ 1.0)
  const [powerFactor, setPowerFactor] = useState(0.8);

  // 직관적인 계산 로직 (가정: 우리가 필요한 진짜 에너지 '유효전력(맥주)'은 100으로 고정)
  const activePower = 100; // 맥주 (kW)
  const apparentPower = activePower / powerFactor; // 전체 컵 크기 (kVA)

  // 전체 컵에서 맥주와 거품이 차지하는 비율(%) 계산
  const beerPercent = (activePower / apparentPower) * 100;
  const foamPercent = 100 - beerPercent;

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 w-full max-w-sm mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-extrabold text-xl text-gray-800">
            💡 역률 시각화
          </h3>
          <p className="text-xs text-gray-500 mt-1">슬라이더를 움직여보세요!</p>
        </div>
        <span className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-bold">
          맥주 비유 🍻
        </span>
      </div>

      {/* 비주얼 영역 (맥주잔) */}
      <div className="relative w-32 h-48 mx-auto border-4 border-gray-200 rounded-b-2xl overflow-hidden bg-white mb-8 shadow-inner">
        {/* 거품 영역 (무효전력) */}
        <div
          className="w-full bg-gray-50 transition-all duration-300 ease-in-out flex flex-col items-center justify-end pb-2"
          style={{ height: `${foamPercent}%` }}
        >
          <span className="text-gray-400 text-xs font-bold">거품</span>
          <span className="text-gray-300 text-[10px]">(무효전력)</span>
        </div>

        {/* 맥주 영역 (유효전력) */}
        <div
          className="w-full bg-yellow-400 transition-all duration-300 ease-in-out flex flex-col items-center justify-center relative overflow-hidden"
          style={{ height: `${beerPercent}%` }}
        >
          {/* 맥주 그라데이션 효과 */}
          <div className="absolute inset-0 bg-gradient-to-t from-yellow-500 to-transparent opacity-60"></div>
          <span className="text-white text-sm font-bold z-10 drop-shadow-md">
            맥주
          </span>
          <span className="text-white/80 text-[10px] font-bold z-10">
            (유효전력)
          </span>
        </div>
      </div>

      {/* 슬라이더 컨트롤 영역 */}
      <div className="mb-6">
        <div className="flex justify-between text-sm font-bold mb-3">
          <span className="text-gray-600">현재 역률(cosθ)</span>
          <span className="text-blue-600 text-lg">
            {(powerFactor * 100).toFixed(0)}%
          </span>
        </div>
        <input
          type="range"
          min="0.5"
          max="1"
          step="0.01"
          value={powerFactor}
          onChange={(e) => setPowerFactor(parseFloat(e.target.value))}
          className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-2 font-medium">
          <span>나쁨 (50%)</span>
          <span>완벽 (100%)</span>
        </div>
      </div>

      {/* 상태에 따른 동적 피드백 메시지 */}
      <div className="bg-blue-50/50 p-4 rounded-xl text-sm leading-relaxed min-h-[90px] flex items-center border border-blue-100">
        {powerFactor < 0.7 ? (
          <p className="text-red-600">
            🚨 <b>거품이 너무 많아요!</b>
            <br />
            실제 쓸 수 있는 전기보다 컵 크기만 비정상적으로 커졌습니다. 역률
            개선을 위해 <b>전력용 콘덴서</b>를 꼭 설치해야 합니다!
          </p>
        ) : powerFactor < 0.95 ? (
          <p className="text-blue-800">
            ⚠️ <b>조금 아쉽습니다.</b>
            <br />
            거품(무효전력)을 조금만 더 줄이면, 같은 컵 크기로도 훨씬 더 많은
            맥주를 담을 수 있습니다.
          </p>
        ) : (
          <p className="text-green-700">
            ✅ <b>아주 훌륭해요!</b>
            <br />
            거품이 거의 없이 꽉 찬 맥주! 전력 손실이 최소화된 가장 이상적인
            상태입니다.
          </p>
        )}
      </div>
    </div>
  );
}
