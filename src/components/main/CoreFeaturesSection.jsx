import { MdAutoAwesome, MdLoop, MdBalance, MdHub } from "react-icons/md";

export default function CoreFeaturesSection() {
  return (
    <section className="bg-surface-container-low py-32 px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-24 space-y-6">
          <span className="text-secondary font-black tracking-widest text-xl font-label uppercase">
            Volt Core Platform
          </span>
          <h2 className="text-5xl md:text-6xl font-black text-primary font-headline">
            AI 기반 시험 문제 생성 플랫폼의 혁신
          </h2>
          <p className="text-2xl text-on-surface-variant max-w-3xl mx-auto font-medium">
            기존의 문제 은행 방식과는 차원이 다른, 오직 당신만을 위한 맞춤형
            학습 경험을 선사합니다.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="bg-white p-12 rounded-3xl shadow-lg border-2 border-transparent hover:border-primary transition-all duration-300 group flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
              <MdAutoAwesome className="text-5xl" />
            </div>
            <h3 className="text-2xl font-black text-primary mb-6 font-headline">
              실시간 신규 문항
            </h3>
            <p className="text-on-surface text-lg leading-relaxed font-semibold">
              단순한 문제 은행이 아닙니다. AI가 최신 경향을 분석하여 실시간으로
              신규 문제를 자동 생성합니다.
            </p>
          </div>
          <div className="bg-white p-12 rounded-3xl shadow-lg border-2 border-transparent hover:border-primary transition-all duration-300 group flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
              <MdLoop className="text-5xl" />
            </div>
            <h3 className="text-2xl font-black text-primary mb-6 font-headline">
              오답 분석 반복 학습
            </h3>
            <p className="text-on-surface text-lg leading-relaxed font-semibold">
              오답 데이터를 정밀하게 분석하여 취약한 개념을 완벽하게 이해할
              때까지 유사 문항을 반복 제공합니다.
            </p>
          </div>
          <div className="bg-white p-12 rounded-3xl shadow-lg border-2 border-transparent hover:border-primary transition-all duration-300 group flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
              <MdBalance className="text-5xl" />
            </div>
            <h3 className="text-2xl font-black text-primary mb-6 font-headline">
              전 과목 균형 출제
            </h3>
            <p className="text-on-surface text-lg leading-relaxed font-semibold">
              전기기사 필기 5개 과목의 난이도와 비중을 AI가 황금 비율로 조절하여
              실전 감각을 극대화합니다.
            </p>
          </div>
          <div className="bg-white p-12 rounded-3xl shadow-lg border-2 border-transparent hover:border-primary transition-all duration-300 group flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
              <MdHub className="text-5xl" />
            </div>
            <h3 className="text-2xl font-black text-primary mb-6 font-headline">
              개념 그래프 기반 설계
            </h3>
            <p className="text-on-surface text-lg leading-relaxed font-semibold">
              단순 나열이 아닌, 기술 개념 간의 연결 관계를 분석한 그래프 기반
              설계를 통해 논리적 사고를 돕습니다.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
