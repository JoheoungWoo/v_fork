import { COMPANY_NAME } from "@/constants/appConstants";
import { MdVerified } from "react-icons/md";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-surface py-28 px-8 md:px-12 border-b border-outline-variant/10">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
        <div className="w-full lg:w-7/12 space-y-10">
          <div className="space-y-6">
            <span className="inline-block px-5 py-2 bg-primary/10 text-primary rounded-full text-base font-bold tracking-widest uppercase font-label">
              Next-Gen Learning Platform
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold text-primary font-headline leading-[1.15]">
              단순한 암기가 아닌
              <br />
              <span className="text-secondary">AI 기술</span>로 완성하는
              <br />
              전기 자격증의 새 시대
            </h1>
          </div>
          <p className="text-[1.125rem] leading-[1.75rem] md:text-[1.25rem] md:leading-[2rem] text-on-surface-variant font-medium">
            전기기사 필기 시험을 시작으로, 모든 시험 문항 생성을 목표로 합니다.{" "}
            <br className="hidden md:block" />
            {COMPANY_NAME}의 AI는 문제 은행을 돌려 쓰는 것이 아니라 실시간으로
            최적의 문제를 생성합니다.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <div className="flex items-center gap-2 bg-white px-5 py-3 rounded-xl border-2 border-primary/20 shadow-sm">
              <MdVerified className="text-secondary text-2xl" />
              <span className="font-bold text-primary text-xl">
                특허 출원 중인 핵심 기술
              </span>
            </div>
            <div className="flex items-center gap-2 bg-white px-5 py-3 rounded-xl border-2 border-primary/20 shadow-sm">
              <MdVerified className="text-secondary text-2xl" />
              <span className="font-bold text-primary text-xl">
                전기 전문 교수진 직접 검수
              </span>
            </div>
          </div>
        </div>
        <div className="w-full lg:w-5/12">
          <div className="relative rounded-3xl overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.25)] bg-primary p-8">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/30">
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-white/20 pb-4">
                  <span className="text-on-primary font-bold text-2xl font-headline tracking-tight">
                    AI 실시간 문제 생성
                  </span>
                  <span className="bg-secondary text-white text-sm font-black px-3 py-1 rounded">
                    LIVE
                  </span>
                </div>
                <div className="space-y-4">
                  <div className="bg-white/10 rounded-xl p-5 border border-white/20">
                    <p className="text-white/80 text-sm mb-1 italic">
                      분석 중...
                    </p>
                    <p className="text-white font-bold text-xl leading-snug">
                      오답 패턴에 기초한 전력공학 심화 문항 구성 완료
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-3 bg-white/20 rounded-full overflow-hidden">
                      <div className="w-3/4 h-full bg-secondary"></div>
                    </div>
                    <span className="text-white font-black text-lg">75%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
