export default function RoadmapSection() {
  return (
    <section className="bg-surface-container-low py-32 px-8 border-y border-outline-variant/20">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-5xl font-black text-primary font-headline mb-20 text-center">
          Service Roadmap
        </h2>
        <div className="space-y-16">
          <div className="flex gap-10 items-start relative pb-16">
            <div className="absolute left-5 top-10 bottom-0 w-1 bg-outline-variant/40"></div>
            <div className="z-10 w-10 h-10 rounded-full bg-surface-container-high border-8 border-outline flex items-center justify-center shrink-0"></div>
            <div className="space-y-3">
              <span className="text-primary font-black text-2xl">
                현재 : Beta 테스트 진행
              </span>
              <p className="text-on-surface text-xl font-medium">
                AI 문제 생성 엔진의 정확도 검증 및 사용자 피드백 수집 (무료
                제공)
              </p>
            </div>
          </div>
          <div className="flex gap-10 items-start relative pb-16">
            <div className="absolute left-5 top-10 bottom-0 w-1 bg-outline-variant/40"></div>
            <div className="z-10 w-10 h-10 rounded-full bg-primary-fixed border-8 border-primary flex items-center justify-center shrink-0"></div>
            <div className="space-y-3">
              <span className="text-primary font-black text-2xl">
                2026년 3월 : 이론 영상 콘텐츠 런칭
              </span>
              <p className="text-on-surface text-xl font-medium">
                전기수학, 공학수학 등 기초부터 단계별로 설명하는 이론 강의 제작
                및 서비스
              </p>
            </div>
          </div>
          <div className="flex gap-10 items-start">
            <div className="z-10 w-10 h-10 rounded-full bg-secondary border-8 border-secondary-fixed flex items-center justify-center shrink-0"></div>
            <div className="space-y-3">
              <span className="text-secondary font-black text-2xl">
                2026년 4월 : 정식 오픈 및 유료 구독 전환
              </span>
              <p className="text-on-surface text-xl font-medium">
                서버 성능 및 응답 속도가 향상된 정식 버전 출시 및 개인별 맞춤형
                구독 모델 도입
              </p>
            </div>
          </div>
        </div>
        <p className="mt-24 text-center text-on-surface-variant font-bold italic text-xl">
          * 본 사이트는 현재 Beta 버전이며, 정식 오픈 시 서버 성능 및 응답
          속도가 더욱 향상됩니다.
        </p>
      </div>
    </section>
  );
}
