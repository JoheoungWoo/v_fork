import { COMPANY_NAME } from "@/constants/appConstants";

export default function CtaSection() {
  return (
    <section className="bg-primary/5 py-32 px-8">
      <div className="max-w-4xl mx-auto text-center space-y-12">
        <h2 className="text-5xl md:text-6xl font-black text-primary font-headline">
          대한민국 1% 전기 전문가를 위한 플랫폼
        </h2>
        <p className="text-3xl text-on-surface-variant font-bold">
          지금 {COMPANY_NAME}의 혁신적인 AI 학습 시스템을 직접 경험해보세요.
        </p>
        <div className="flex flex-col sm:flex-row gap-8 justify-center pt-8">
          <button className="bg-primary text-on-primary px-16 py-6 rounded-[1.5rem] font-black text-2xl hover:bg-primary-container transition-all shadow-[0_20px_40px_rgba(0,42,110,0.3)] hover:-translate-y-2">
            Beta 서비스 무료 체험
          </button>
          <button className="bg-white border-4 border-primary text-primary px-16 py-6 rounded-[1.5rem] font-black text-2xl hover:bg-surface-container-low transition-all shadow-xl hover:-translate-y-2">
            제휴 제안서 다운로드
          </button>
        </div>
      </div>
    </section>
  );
}
