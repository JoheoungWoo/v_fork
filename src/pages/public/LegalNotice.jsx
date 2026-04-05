import { COMPANY_NAME } from "@/constants/appConstants";
import { useEffect } from "react";

export default function LegalNotice() {
  useEffect(() => {});

  return (
    <main className="pt-32 pb-24 px-6 max-w-7xl mx-auto font-body">
      <section className="mb-16">
        <div className="inline-flex items-center px-4 py-1 rounded-full bg-tertiary-container text-on-tertiary-container mb-6">
          <span className="text-sm font-bold tracking-wider">
            EFFECTIVE DATE: 2024.01.01
          </span>
        </div>
        <h1 className="text-5xl font-extrabold tracking-tighter text-on-surface mb-6 leading-tight font-headline">
          저작권 및 법적 고지
          <br />
          <span className="text-primary">Copyright & Legal Notice</span>
        </h1>
        <p className="text-xl text-on-surface-variant max-w-3xl leading-relaxed">
          {COMPANY_NAME}는 지식의 가치를 존중하며, 본 플랫폼에서 제공되는 모든
          콘텐츠와 서비스의 법적 권리를 보호합니다. 본 고지는 서비스 이용 시
          준수해야 할 저작권 정책과 면책 조항을 규정합니다.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-4 p-8 rounded-xl bg-surface-container-low border-0 shadow-sm transition-all hover:bg-surface-container">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-primary text-3xl">
              gavel
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-on-surface">
              제 1조: 목적
            </h2>
          </div>
          <p className="text-on-surface-variant leading-relaxed mb-4">
            본 고지는 {COMPANY_NAME}(이하 '아카데미')가 제공하는 디지털 콘텐츠,
            교육 자료, 소프트웨어 및 관련 서비스의 이용에 관한 저작권 보호 및
            법적 책임 한계를 명확히 함을 목적으로 합니다.
          </p>
          <p className="text-on-surface-variant leading-relaxed">
            사용자는 본 서비스를 이용함으로써 본 고지의 내용을 숙지하고 동의한
            것으로 간주됩니다.
          </p>
        </div>

        <div className="md:col-span-8 p-8 rounded-xl bg-surface-container-lowest shadow-lg transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-primary text-3xl">
                copyright
              </span>
              <h2 className="text-2xl font-bold tracking-tight text-on-surface">
                제 2조: 지적재산권 및 소유권
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="font-bold text-primary">콘텐츠 소유권</h3>
                <p className="text-on-surface-variant leading-relaxed">
                  아카데미 사이트 내 게시된 모든 강의 영상, 텍스트, 이미지, 소스
                  코드 및 디자인 요소는 Azure Academica 및 해당 콘텐츠 공급자의
                  독점적 지적재산입니다.
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="font-bold text-primary">상표권 보호</h3>
                <p className="text-on-surface-variant leading-relaxed">
                  '{COMPANY_NAME}' 로고, 심볼 및 서비스 명칭은 등록된 상표이며,
                  사전 서면 승인 없이 상업적 목적으로 사용하는 행위는 법적으로
                  금지됩니다.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-5 h-[300px] rounded-xl overflow-hidden relative group">
          <img
            alt="Legal books and gavel"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAtw4aPpgeJDpkDnzeM3B5NgEdU_p2_xdHNyeLv14mMGLznG_d9dr1OOi98ki84Evb6gzpDCpFzOUqGJloMO0AYOugmHZYKLuxGxdwZfLLRowr0IzYwRsVJANg8eHKkTPiQHuuOGuSHLReR9zhAB81WogX10qTBbebsBVyVAEwjh0gihSdC8yuJTZDpAoQSv90QfP-Q8jKj195JACQuF73BWTOFYkg1H0D3TaZfU8tZaabfMlGCAbcdi7phzJFlqbomSXYjtxXz8i1O"
          />
          <div className="absolute inset-0 bg-primary/10 mix-blend-multiply"></div>
        </div>

        <div className="md:col-span-7 p-8 rounded-xl bg-surface-container-low transition-all hover:bg-surface-container">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-primary text-3xl">
              lock_open
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-on-surface">
              제 4조: 이용 권한 및 제한 사항
            </h2>
          </div>
          <ul className="space-y-4 text-on-surface-variant">
            <li className="flex gap-3">
              <span className="material-symbols-outlined text-secondary text-xl">
                check_circle
              </span>
              <span>
                사용자는 본인이 구매한 교육 콘텐츠에 한하여 비상업적 목적의
                개인적 학습 용도로만 이용할 수 있습니다.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="material-symbols-outlined text-error text-xl">
                cancel
              </span>
              <span>
                콘텐츠를 녹화, 복제, 배포, 전시 또는 제3자에게 공유하거나
                판매하는 행위는 엄격히 금지됩니다.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
