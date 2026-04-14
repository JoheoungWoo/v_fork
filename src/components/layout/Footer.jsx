import { COMPANY_NAME } from "@/constants/appConstants";
import useMove from "@/hooks/useMove";

export default function Footer1() {
  const move = useMove();

  return (
    <footer className="w-full bg-[#f1f3f5] border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 items-start">
          {/* Left: Company Info */}
          <div className="lg:col-span-4 flex flex-col gap-5">
            <div>
              <h3 className="text-xl font-black text-slate-900 mb-3 md:mb-4 tracking-tighter">
                {COMPANY_NAME}
              </h3>
              <p className="text-[14px] md:text-[15px] font-medium leading-relaxed text-slate-700 break-keep">
                대한민국 국가기술자격증 합격의 파트너.{" "}
                <br className="hidden md:block" />
                체계적인 커리큘럼과 전문 강사진을 통해{" "}
                <br className="hidden md:block" />
                학습자 여러분의 합격을 지원합니다.
              </p>
            </div>
            <div className="text-[12px] md:text-[13px] font-medium text-slate-600 leading-relaxed space-y-1">
              <div className="space-y-1.5 md:space-y-2">
                <p>
                  상호명: (주)에이아이컴퍼니
                  <span className="mx-1 md:mx-2 text-slate-300">|</span> 대표자:
                  이재오
                </p>
                <p>주소: 수원시 권선구 구운중로 11번길 15, 103호</p>
                <div className="pt-1 flex flex-col md:flex-row md:gap-4 text-slate-500">
                  <p>사업자등록번호: 824-87-03549</p>
                </div>
              </div>
            </div>
          </div>

          {/* Center: Quick Links */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-6 md:gap-8">
            <div>
              <h4 className="font-bold text-slate-900 mb-4 md:mb-6 text-[15px] md:text-base">
                교육과정
              </h4>
              <ul className="space-y-3 md:space-y-4">
                <li>
                  <a className="text-[13px] md:text-[14px] font-bold text-slate-600 hover:text-[#0059bb] transition-colors cursor-pointer">
                    전기기사 필기
                  </a>
                </li>
                <li>
                  <a className="text-[13px] md:text-[14px] font-bold text-slate-600 hover:text-[#0059bb] transition-colors cursor-pointer">
                    전기기사 실기
                  </a>
                </li>
                <li>
                  <a className="text-[13px] md:text-[14px] font-bold text-slate-600 hover:text-[#0059bb] transition-colors cursor-pointer">
                    합격패키지 할인
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-4 md:mb-6 text-[15px] md:text-base">
                학습지원
              </h4>
              <ul className="space-y-3 md:space-y-4">
                <li>
                  <a className="text-[13px] md:text-[14px] font-bold text-slate-600 hover:text-[#0059bb] transition-colors cursor-pointer">
                    공지사항
                  </a>
                </li>
                <li>
                  <a className="text-[13px] md:text-[14px] font-bold text-slate-600 hover:text-[#0059bb] transition-colors cursor-pointer">
                    자주 묻는 질문
                  </a>
                </li>
                <li>
                  <a className="text-[13px] md:text-[14px] font-bold text-slate-600 hover:text-[#0059bb] transition-colors cursor-pointer">
                    1:1 문의하기
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Right: Customer Support */}
          <div className="lg:col-span-4 border-t border-slate-200 pt-6 md:border-none md:pt-0">
            <div className="flex flex-col gap-2">
              <h4 className="font-bold text-slate-900 text-[15px] md:text-lg flex items-center gap-2">
                고객감동센터
              </h4>
              <div className="flex items-center gap-3 mt-2 md:mt-4">
                <span className="text-4xl md:text-5xl font-black text-[#0059bb] tracking-tighter">
                  1588-0000
                </span>
              </div>
              <div className="mt-4 md:mt-6 flex flex-col gap-1">
                <p className="text-[13px] md:text-[14px] font-bold text-slate-700">
                  평일 09:00 - 18:00
                </p>
                <p className="text-[12px] md:text-[13px] font-medium text-slate-500">
                  토 / 일 / 공휴일 휴무
                </p>
                <p className="text-[12px] md:text-[13px] font-medium text-slate-500">
                  점심시간 12:00 - 13:00
                </p>
              </div>
              <button className="mt-4 md:mt-6 py-2 md:py-3 text-slate-700 font-bold text-[13px] md:text-sm transition-colors flex items-center gap-2 justify-start hover:underline cursor-pointer w-fit">
                원격지원 서비스{" "}
                <span className="material-symbols-outlined text-[16px] md:text-sm">
                  open_in_new
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Policy Bar */}
        <div className="mt-10 md:mt-16 pt-6 md:pt-8 border-t border-slate-300 flex flex-col lg:flex-row justify-between items-center gap-6">
          {/* 하단 좌측: 링크 */}
          <div className="flex flex-wrap justify-center lg:justify-start gap-x-4 gap-y-2 text-[13px] md:text-[14px] text-slate-700 lg:flex-1">
            <a
              href="https://www.aicompany.co.kr/"
              className="font-bold hover:text-[#0059bb] transition-colors cursor-pointer"
            >
              <img src="@/../public/icons/favicon.ico" />
            </a>
            <a
              className="font-bold hover:text-[#0059bb] transition-colors cursor-pointer"
              onClick={() => move("/terms")}
            >
              이용약관
            </a>
            <a
              className="font-bold text-[#0059bb] transition-colors cursor-pointer"
              onClick={() => move("/legal")}
            >
              개인정보처리방침
            </a>
            <a
              className="font-bold hover:text-[#0059bb] transition-colors cursor-pointer"
              onClick={() => move("/copyright")}
            >
              저작권정책
            </a>
            <a
              className="font-bold hover:text-[#0059bb] transition-colors cursor-pointer"
              onClick={() => move("/contact")}
            >
              제휴문의
            </a>
          </div>

          {/* 하단 중앙: 패밀리 사이트 */}
          <div className="flex justify-center lg:justify-center lg:flex-1 w-full lg:w-auto">
            <div className="relative w-full max-w-[200px] lg:max-w-none lg:w-48">
              <select
                className="w-full appearance-none bg-transparent border border-slate-300 text-slate-700 font-bold text-[13px] py-2 pl-4 pr-10 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0059bb] cursor-pointer"
                onChange={(e) => {
                  if (e.target.value) {
                    window.open(e.target.value, "_blank"); // 새 창으로 열기 (원하는 방식으로 수정 가능)
                    e.target.value = ""; // 선택 후 초기화
                  }
                }}
              >
                <option value="">패밀리 사이트</option>
                <option value="https://example1.com">에듀스파크 인강</option>
                <option value="https://example2.com">에듀스파크 출판</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none text-sm">
                expand_more
              </span>
            </div>
          </div>

          {/* 하단 우측: 카피라이트 */}
          <div className="flex justify-center lg:justify-end lg:flex-1">
            <p className="text-[12px] md:text-[13px] font-bold text-slate-500 md:text-slate-600 text-center">
              © 2026 {COMPANY_NAME} Corp. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
