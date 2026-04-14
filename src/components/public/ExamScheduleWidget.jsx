import React from "react";

// 접수 기간 텍스트에서 '빈자리 접수' 등의 부가 설명을 제외하고 메인 날짜만 추출하는 헬퍼 함수
const extractMainDate = (str) => {
  if (!str) return "-";
  const match = str.match(/(\d{4}\.\d{2}\.\d{2}\s*~\s*\d{4}\.\d{2}\.\d{2})/);
  // 날짜 범위가 있으면 추출하고, 없으면(단일 날짜 등) 원본 문자열 반환
  return match ? match[1] : str;
};

export default function ExamScheduleWidget({ schedules, isLoading, error }) {
  return (
    <div className="bg-surface-container-lowest border-l-4 border-primary rounded-xl p-6 shadow-sm">
      <div className="flex items-start justify-between mb-6">
        <h3 className="font-extrabold text-xl text-primary flex items-center gap-2 font-headline">
          Q-Net 공식 일정
        </h3>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-10 gap-3 text-on-surface-variant">
          <span className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></span>
          <p className="text-sm font-bold">일정을 불러오는 중입니다...</p>
        </div>
      ) : error ? (
        <div className="bg-error-container text-on-error-container p-4 rounded-lg text-sm font-bold text-center">
          {error}
        </div>
      ) : schedules && schedules.length > 0 ? (
        <div className="space-y-6">
          {schedules.map((schedule, index) => (
            <div
              key={index}
              className="relative pl-4 border-l border-outline-variant pb-2"
            >
              <div className="absolute -left-1.5 top-0 w-3 h-3 bg-primary rounded-full"></div>
              <span className="text-sm font-bold text-primary block mb-2">
                {schedule.구분}
              </span>

              <div className="bg-surface-container-low p-3 rounded-lg space-y-2 text-sm text-on-surface">
                {/* 1. 필기 원서 접수 */}
                <div className="flex justify-between border-b border-outline-variant/20 pb-1">
                  <span className="font-semibold opacity-80">필기 접수</span>
                  <span className="font-bold text-primary">
                    {extractMainDate(schedule.필기원서접수)}
                  </span>
                </div>
                {/* 2. 필기 시험 */}
                <div className="flex justify-between border-b border-outline-variant/20 pb-1">
                  <span className="font-semibold opacity-80">필기 시험</span>
                  <span className="font-bold">
                    {extractMainDate(schedule.필기시험)}
                  </span>
                </div>
                {/* 3. 실기 원서 접수 */}
                <div className="flex justify-between border-b border-outline-variant/20 pb-1">
                  <span className="font-semibold opacity-80">실기 접수</span>
                  <span className="font-bold text-primary">
                    {extractMainDate(schedule.실기원서접수)}
                  </span>
                </div>
                {/* 4. 실기 시험 */}
                <div className="flex justify-between border-b border-outline-variant/20 pb-1">
                  <span className="font-semibold opacity-80">실기 시험</span>
                  <span className="font-bold">
                    {extractMainDate(schedule.실기시험)}
                  </span>
                </div>
                {/* 5. 최종 합격자 발표 */}
                <div className="flex justify-between">
                  <span className="font-semibold opacity-80">최종 합격자</span>
                  <span className="font-bold text-tertiary">
                    {schedule.최종합격자발표일}
                  </span>
                </div>
              </div>
            </div>
          ))}

          <button
            className="w-full mt-4 py-3 rounded-lg border border-outline-variant font-bold text-primary hover:bg-primary-fixed hover:border-primary transition-colors flex items-center justify-center gap-2"
            onClick={() =>
              window.open(
                "https://www.q-net.or.kr/crf005.do?id=crf00503&jmCd=1150",
                "_blank",
              )
            }
          >
            큐넷에서 자세히 보기
          </button>
        </div>
      ) : (
        <p className="text-sm text-on-surface-variant text-center py-4">
          예정된 시험 일정이 없습니다.
        </p>
      )}
    </div>
  );
}
