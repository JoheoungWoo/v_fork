import { COMPANY_NAME } from "@/constants/appConstants";
import { MdStar, MdCheckCircle, MdGroups, MdReport } from "react-icons/md";

export default function AboutSection() {
  return (
    <section className="bg-surface py-32 px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-20 items-start mb-32">
          <div className="lg:w-5/12 space-y-10">
            <div className="space-y-6">
              <h2 className="text-5xl md:text-6xl font-black text-primary font-headline leading-tight">
                기술적 공신력과
                <br />
                철저한 검증 구조
              </h2>
              <p className="text-2xl text-on-surface-variant font-medium leading-relaxed">
                {COMPANY_NAME}의 기술은 독자적인 기술력과 전문가의 손길이 만났을
                때 완성됩니다. 특허 출원 중인 생성 알고리즘은 타 플랫폼이 따라올
                수 없는 혁신입니다.
              </p>
            </div>
            <div className="bg-primary/5 p-10 rounded-3xl border-l-[12px] border-primary shadow-sm">
              <h4 className="text-2xl font-black text-primary mb-6 flex items-center gap-3">
                <MdStar className="text-3xl" /> 특허 출원 중인 핵심 기술
              </h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-4 text-xl font-bold text-on-surface">
                  <MdCheckCircle className="text-secondary text-2xl mt-1 shrink-0" />
                  AI 기반 시험 문제 자동 생성 기술
                </li>
                <li className="flex items-start gap-4 text-xl font-bold text-on-surface">
                  <MdCheckCircle className="text-secondary text-2xl mt-1 shrink-0" />
                  문제 생성 · 정답 검증 · 해설 구조화 통합 시스템
                </li>
              </ul>
            </div>
          </div>
          <div className="lg:w-7/12 w-full space-y-8">
            <div className="bg-surface-container-high p-10 md:p-14 rounded-[2.5rem] border-2 border-primary/10 shadow-inner">
              <div className="flex items-center gap-6 mb-10">
                <MdGroups className="text-6xl text-primary" />
                <h3 className="text-3xl font-black text-primary">
                  콘텐츠 제작 및 검수 프로세스
                </h3>
              </div>
              <p className="text-2xl text-on-surface mb-12 leading-relaxed font-semibold">
                본 플랫폼의 모든 문제는 AI가 생성하되,{" "}
                <span className="text-primary underline underline-offset-8 decoration-4">
                  전기 전문 지식을 보유한 전문가가 직접 검수
                </span>
                한 문항만 DB에 반영됩니다.
              </p>
              <div className="bg-white rounded-3xl p-8 border-2 border-error/30 flex gap-8 items-start shadow-sm">
                <MdReport className="text-error text-5xl shrink-0" />
                <div className="space-y-3">
                  <h5 className="font-black text-error text-2xl">중요 안내</h5>
                  <p className="text-on-surface-variant text-xl font-medium leading-snug">
                    본 기술은 시험 담당자의 직접 검수를 전제로 설계되었습니다.
                    교육업체, 학원, 출판사와의 협업을 통해 서비스가 완성됩니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-primary rounded-[3rem] p-12 md:p-20 shadow-2xl overflow-hidden relative">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <div className="mb-20 text-center">
              <h2 className="text-4xl md:text-6xl font-black text-on-primary font-headline mb-8">
                자격증 이후의 성공, <br className="md:hidden" />
                Career Roadmap
              </h2>
              <p className="text-primary-fixed text-2xl font-semibold max-w-4xl mx-auto">
                자격증 취득은 시작일 뿐입니다. {COMPANY_NAME}와 함께 그 이후의
                실무 역량 강화까지 설계하십시오.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
              <div className="bg-white/10 backdrop-blur-xl border-2 border-white/20 p-10 rounded-[2rem] relative flex flex-col justify-between min-h-[320px] transition-transform hover:-translate-y-2">
                <div className="text-8xl font-black text-white/10 absolute top-4 right-6 italic pointer-events-none">
                  01
                </div>
                <div>
                  <span className="inline-block px-4 py-1.5 bg-secondary text-white text-sm font-black rounded-lg mb-6">
                    BEGINNING
                  </span>
                  <h4 className="text-2xl font-black text-white mb-4">
                    전기 자격증 취득
                  </h4>
                </div>
                <p className="text-white/80 text-lg font-semibold leading-relaxed">
                  전기기능사/기사 필기 및 실기 자격 취득을 위한 최적의 AI 학습
                  제공 단계
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-xl border-2 border-white/20 p-10 rounded-[2rem] relative flex flex-col justify-between min-h-[320px] transition-transform hover:-translate-y-2">
                <div className="text-8xl font-black text-white/10 absolute top-4 right-6 italic pointer-events-none">
                  02
                </div>
                <div>
                  <span className="inline-block px-4 py-1.5 bg-secondary text-white text-sm font-black rounded-lg mb-6">
                    ADVANCED
                  </span>
                  <h4 className="text-2xl font-black text-white mb-4">
                    실무 기술 매칭
                  </h4>
                </div>
                <p className="text-white/80 text-lg font-semibold leading-relaxed">
                  현장 도면 분석 및 내선 공사 실무 등 자격증 지식을 현장 기술로
                  연결하는 과정
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-xl border-2 border-white/20 p-10 rounded-[2rem] relative flex flex-col justify-between min-h-[320px] transition-transform hover:-translate-y-2">
                <div className="text-8xl font-black text-white/10 absolute top-4 right-6 italic pointer-events-none">
                  03
                </div>
                <div>
                  <span className="inline-block px-4 py-1.5 bg-secondary text-white text-sm font-black rounded-lg mb-6">
                    SPECIALIST
                  </span>
                  <h4 className="text-2xl font-black text-white mb-4">
                    직무 특화 심화
                  </h4>
                </div>
                <p className="text-white/80 text-lg font-semibold leading-relaxed">
                  전기안전관리자, 신재생 에너지 전문가 등 세부 직무별 전문 지식
                  습득
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-xl border-2 border-white/20 p-10 rounded-[2rem] relative flex flex-col justify-between min-h-[320px] transition-transform hover:-translate-y-2">
                <div className="text-8xl font-black text-white/10 absolute top-4 right-6 italic pointer-events-none">
                  04
                </div>
                <div>
                  <span className="inline-block px-4 py-1.5 bg-secondary text-white text-sm font-black rounded-lg mb-6">
                    MANAGEMENT
                  </span>
                  <h4 className="text-2xl font-black text-white mb-4">
                    기술 경영 리더십
                  </h4>
                </div>
                <p className="text-white/80 text-lg font-semibold leading-relaxed">
                  공무 관리 및 프로젝트 매니징(PM)을 위한 현장 안전 관리 시스템
                  운용 역량
                </p>
              </div>
              <div className="bg-secondary p-10 rounded-[2rem] relative flex flex-col justify-between min-h-[320px] transition-transform hover:-translate-y-2 shadow-2xl shadow-secondary/50">
                <div className="text-8xl font-black text-white/20 absolute top-4 right-6 italic pointer-events-none">
                  05
                </div>
                <div>
                  <span className="inline-block px-4 py-1.5 bg-white text-secondary text-sm font-black rounded-lg mb-6">
                    EXPERT
                  </span>
                  <h4 className="text-2xl font-black text-white mb-4">
                    전기 기술 마스터
                  </h4>
                </div>
                <p className="text-white text-lg font-black leading-relaxed">
                  최고 권위 기술사 등극 및 독자적인 기술 자문을 제공하는 최종
                  전문가 단계
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
