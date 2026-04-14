export default function AdminDashboard() {
  return (
    <main className="flex-grow pt-24 pb-12 px-6 max-w-7xl mx-auto w-full font-body">
      <header className="mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight text-on-surface mb-2">
          컨트롤 센터
        </h1>
        <p className="text-on-surface-variant text-lg">
          VoltAcademy 시스템 현황 및 통합 관리 대시보드
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-surface-container-low p-8 rounded-xl shadow-lg relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-sm font-bold text-on-surface-variant mb-1">
              활성 사용자
            </p>
            <h3 className="text-4xl font-bold text-primary">12,842</h3>
            <div className="mt-4 flex items-center gap-2">
              <span className="bg-tertiary-container text-on-tertiary-container text-xs px-2 py-1 rounded-full">
                +12.5%
              </span>
              <span className="text-xs text-on-surface-variant">
                지난달 대비
              </span>
            </div>
          </div>
          <span
            className="material-symbols-outlined absolute -right-4 -bottom-4 text-9xl opacity-5 text-primary"
            data-icon="group"
          >
            group
          </span>
        </div>
        <div className="bg-surface-container-low p-8 rounded-xl shadow-lg relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-sm font-bold text-on-surface-variant mb-1">
              코스 수료율
            </p>
            <h3 className="text-4xl font-bold text-secondary">84.2%</h3>
            <div className="mt-4 flex items-center gap-2">
              <span className="bg-tertiary-container text-on-tertiary-container text-xs px-2 py-1 rounded-full">
                +3.2%
              </span>
              <span className="text-xs text-on-surface-variant">
                지난 분기 대비
              </span>
            </div>
          </div>
          <span
            className="material-symbols-outlined absolute -right-4 -bottom-4 text-9xl opacity-5 text-secondary"
            data-icon="school"
          >
            school
          </span>
        </div>
        <div className="bg-surface-container-low p-8 rounded-xl shadow-lg relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-sm font-bold text-on-surface-variant mb-1">
              시스템 가동 시간
            </p>
            <h3 className="text-4xl font-bold text-tertiary">99.99%</h3>
            <div className="mt-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></div>
              <span className="text-xs text-on-surface-variant">
                정상 운영 중
              </span>
            </div>
          </div>
          <span
            className="material-symbols-outlined absolute -right-4 -bottom-4 text-9xl opacity-5 text-tertiary"
            data-icon="speed"
          >
            speed
          </span>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="group cursor-pointer bg-surface-container-lowest p-6 rounded-xl border border-transparent hover:border-primary/20 transition-all hover:bg-white shadow-lg">
          <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
            <span
              className="material-symbols-outlined text-3xl"
              data-icon="manage_accounts"
            >
              manage_accounts
            </span>
          </div>
          <h4 className="text-xl font-bold mb-2">사용자 관리</h4>
          <p className="text-on-surface-variant text-sm mb-6 leading-relaxed">
            계정 생성, 권한 설정 및 학습자 활동 로그를 모니터링합니다.
          </p>
          <div className="flex justify-between items-center text-primary font-semibold text-sm">
            <span>1,204명의 신규 등록</span>
            <span
              className="material-symbols-outlined"
              data-icon="arrow_forward"
            >
              arrow_forward
            </span>
          </div>
        </div>
        {/* 반복되는 관리자 메뉴들 생략 (동일 구조) */}
        <div className="group cursor-pointer bg-surface-container-lowest p-6 rounded-xl border border-transparent hover:border-primary/20 transition-all hover:bg-white shadow-lg">
          <div className="w-14 h-14 bg-secondary/10 rounded-xl flex items-center justify-center mb-6 text-secondary group-hover:scale-110 transition-transform">
            <span
              className="material-symbols-outlined text-3xl"
              data-icon="edit_note"
            >
              edit_note
            </span>
          </div>
          <h4 className="text-xl font-bold mb-2">강의 에디터</h4>
          <p className="text-on-surface-variant text-sm mb-6 leading-relaxed">
            새로운 커리큘럼을 제작하고 멀티미디어 교육 자료를 관리합니다.
          </p>
          <div className="flex justify-between items-center text-secondary font-semibold text-sm">
            <span>12개의 임시 저장됨</span>
            <span
              className="material-symbols-outlined"
              data-icon="arrow_forward"
            >
              arrow_forward
            </span>
          </div>
        </div>
        <div className="group cursor-pointer bg-surface-container-lowest p-6 rounded-xl border border-transparent hover:border-primary/20 transition-all hover:bg-white shadow-lg">
          <div className="w-14 h-14 bg-error-container rounded-xl flex items-center justify-center mb-6 text-error group-hover:scale-110 transition-transform">
            <span
              className="material-symbols-outlined text-3xl"
              data-icon="support_agent"
            >
              support_agent
            </span>
          </div>
          <h4 className="text-xl font-bold mb-2">고객지원 티켓</h4>
          <p className="text-on-surface-variant text-sm mb-6 leading-relaxed">
            학습자 및 교수진의 기술 문의와 불편 사항을 처리합니다.
          </p>
          <div className="flex justify-between items-center text-error font-semibold text-sm">
            <span>3개의 미처리 긴급 티켓</span>
            <span
              className="material-symbols-outlined"
              data-icon="arrow_forward"
            >
              arrow_forward
            </span>
          </div>
        </div>
      </section>

      <section className="mt-12 grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 bg-surface-container-low rounded-xl p-8 flex flex-col justify-between">
          <div>
            <h3 className="text-2xl font-bold mb-4">플랫폼 성취도 개요</h3>
            <p className="text-on-surface-variant mb-8 max-w-md">
              지난 30일 동안의 사용자 참여도와 콘텐츠 소비 패턴을 분석한 결과,
              모바일 접속 비중이 15% 증가했습니다.
            </p>
            <div className="h-48 flex items-end gap-4">
              <div className="w-full bg-primary/20 rounded-t-lg h-1/2"></div>
              <div className="w-full bg-primary/20 rounded-t-lg h-3/4"></div>
              <div className="w-full bg-primary rounded-t-lg h-full"></div>
              <div className="w-full bg-primary/20 rounded-t-lg h-2/3"></div>
              <div className="w-full bg-primary/40 rounded-t-lg h-5/6"></div>
              <div className="w-full bg-primary/20 rounded-t-lg h-1/2"></div>
            </div>
          </div>
        </div>
        <div className="lg:col-span-2 relative min-h-[300px] rounded-xl overflow-hidden group">
          <img
            alt="Data Visualization"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDRoHqntHjg1Va5CdQhBVeCJBmXMmj6s71siJtBx27le6PCgkEsWKKrgG77cS8ix9bwhNSVHFiY1aZGpuARM0mNFchFXpusJgAKBkL7gwYgUGMoOyEIbiHMtdRFcSnQvgB0uFmrk8OAtMltBHNNcGxeEewpowjDEB75O_4-Q99XvsNeCDAlnffh-sg_AfT1qL3Ld31LKIKN7b5UFwcvb-69lBvbTM68mDVMWGL51hfBu2a62Sq0K5La2V9mDVLyOQ6q2WxWthkzeyXM"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent p-8 flex flex-col justify-end">
            <h4 className="text-white text-xl font-bold">글로벌 인사이트</h4>
            <p className="text-white/80 text-sm">
              해외 지부의 접속률이 사상 최고치를 기록했습니다. 서버 용량 증설을
              검토하십시오.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
