import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { COMPANY_NAME } from "@/constants/appConstants";
import useMove from "@/hooks/useMove";
import { logout } from "@/slices/loginSlice";
import {
  CctvIcon,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Home,
} from "lucide-react";

// ✅ '과목별 학습노트' 제거됨
const MEGA_MENUS = [
  {
    id: "user",
    title: "나의 강의실",
    path: "/user",
    desc: "대시보드에서 나의 학습 현황을 확인하고 강의와 문제를 관리합니다.",
    categories: [
      {
        heading: "학습 대시보드",
        links: [{ name: "마이페이지 홈", path: "/user" }],
      },
      {
        heading: "학습 하기",
        links: [
          { name: "AI 동영상 강의", path: "/user/videos" },
          { name: "AI 실전 문제풀이", path: "/user/problems" },
        ],
      },
    ],
  },
  {
    id: "knowledge",
    title: "지식 탐험",
    path: "/user/subjectmap",
    desc: "단순 암기를 넘어, 전기기사 개념 간의 연결 고리를 시각적으로 탐색합니다.",
    categories: [
      {
        heading: "지식 네트워크",
        links: [
          { name: "전체 과목 지식 맵", path: "/user/subjectmap" },
          { name: "지식 창고 (목록)", path: "/user/knowledge" },
        ],
      },
      {
        heading: "단원별 그래프",
        links: [{ name: "그래프 탐색하기", path: "/user/presentation/select" }],
      },
    ],
  },
  {
    id: "support",
    title: "고객지원",
    path: "/support",
    desc: "공지사항 확인 및 서비스 이용 중 궁금한 점을 문의하고 해결할 수 있습니다.",
    categories: [
      {
        heading: "고객센터",
        links: [
          { name: "공지사항", path: "/support/notice" },
          { name: "자주 묻는 질문(FAQ)", path: "/support/faq" },
        ],
      },
      {
        heading: "문의/요청",
        links: [
          { name: "1:1 문의하기", path: "/support/inquiry" },
          { name: "자료실", path: "/support/reference" },
        ],
      },
    ],
  },
];

export default function Header() {
  const dispatch = useDispatch();
  const move = useMove();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const headerRef = useRef(null);

  const { isLogin, email, role } = useSelector((state) => state.login);

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState(null);

  // 현재 열려있는 메가 메뉴 데이터 가져오기
  const activeMenuData = MEGA_MENUS.find((m) => m.id === activeMegaMenu);

  // 외부 영역 클릭 시 메가 메뉴 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        setActiveMegaMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMove = (path) => {
    navigate(path);
    setIsMobileOpen(false);
    setActiveMegaMenu(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    handleMove("/");
  };

  const toggleMegaMenu = (id) => {
    setActiveMegaMenu((prev) => (prev === id ? null : id));
  };

  const userName = email ? email.split("@")[0] : "회원";
  const userInitial = userName.substring(0, 2).toUpperCase();

  return (
    <header
      ref={headerRef}
      // ✅ z-index를 최상단인 999로 수정하여 다른 페이지 요소들과 겹치지 않게 변경
      className="fixed top-0 w-full z-[999] bg-white border-b border-slate-200"
    >
      <div className="flex justify-between items-center w-full h-20 px-8 max-w-[1920px] mx-auto">
        {/* ================= 좌측 로고 ================= */}
        <div className="flex items-center gap-12 h-full">
          <a
            className="text-2xl font-extrabold text-[#0059bb] tracking-tight cursor-pointer flex items-center h-full gap-2"
            onClick={() => handleMove("/")}
          >
            {COMPANY_NAME}
          </a>

          {/* ================= 데스크탑 메인 메뉴 ================= */}
          <div className="hidden lg:flex gap-8 items-center h-full relative ml-4">
            {MEGA_MENUS.map((menu) => (
              <button
                key={menu.id}
                onClick={() => toggleMegaMenu(menu.id)}
                className={`font-bold text-[18px] cursor-pointer transition-all flex items-center gap-1 h-full select-none ${
                  pathname.startsWith(menu.path) || activeMegaMenu === menu.id
                    ? "text-[#0059bb]"
                    : "text-slate-700 hover:text-[#0059bb]"
                }`}
              >
                {menu.title}
                <ChevronDown
                  size={20}
                  className={`transition-transform duration-300 ${
                    activeMegaMenu === menu.id
                      ? "rotate-180 text-[#0059bb]"
                      : "text-slate-400"
                  }`}
                />
              </button>
            ))}

            <a
              onClick={() => handleMove("/realtime")}
              className={`font-bold text-[18px] cursor-pointer transition-all flex items-center h-full select-none ${
                pathname.startsWith("/realtime")
                  ? "text-[#0059bb]"
                  : "text-slate-700 hover:text-[#0059bb]"
              }`}
            >
              실시간정보
            </a>

            {role === "admin" && (
              <a
                onClick={() => handleMove("/admin")}
                className={`font-bold text-[18px] cursor-pointer transition-all flex items-center h-full select-none ${
                  pathname.startsWith("/admin")
                    ? "text-[#ba1a1a]"
                    : "text-red-500 hover:text-[#ba1a1a]"
                }`}
              >
                관리자 페이지
              </a>
            )}
          </div>
        </div>

        {/* ================= 데스크탑 우측 영역 ================= */}
        <div className="hidden lg:flex items-center h-full gap-5">
          {isLogin ? (
            <>
              <button className="text-slate-400 hover:text-[#0059bb] transition-colors flex items-center justify-center w-10 h-10">
                <CctvIcon size={28} />
              </button>
              <div className="text-right flex flex-col justify-center">
                <p className="text-[13px] font-bold text-slate-500 tracking-tight leading-tight mb-1">
                  {role === "admin" ? "관리자" : "전기기사 과정"}
                </p>
                <p className="text-[16px] font-bold text-slate-800 leading-tight">
                  {userName} 님
                </p>
              </div>
              <div
                className="w-11 h-11 rounded-full bg-[#0059bb] text-white flex items-center justify-center font-bold text-lg cursor-pointer shadow-sm hover:bg-[#004a9e] transition-colors"
                onClick={() => handleMove("/user")}
              >
                {userInitial}
              </div>
              <span className="w-[1px] h-5 bg-slate-300 mx-1"></span>
              <button
                onClick={handleLogout}
                className="font-bold text-[15px] text-slate-500 hover:text-[#ba1a1a] transition-colors flex items-center h-full"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <a
                onClick={() => handleMove("/login")}
                className="font-bold text-[16px] text-[#0059bb] cursor-pointer flex items-center h-full px-2"
              >
                로그인
              </a>
              <button
                onClick={() => handleMove("/register")}
                className="font-bold text-[16px] bg-[#0059bb] text-white px-6 py-2.5 rounded-lg hover:bg-[#004a9e] transition-all"
              >
                회원가입
              </button>
            </>
          )}
        </div>

        {/* ================= 모바일 햄버거 버튼 ================= */}
        <div className="lg:hidden flex items-center">
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="text-slate-700 hover:text-[#0059bb] transition-colors p-2"
          >
            {isMobileOpen ? <X size={32} /> : <Menu size={32} />}
          </button>
        </div>
      </div>

      {/* ================= 데스크탑 메가 메뉴 드롭다운 ================= */}
      <div
        className={`hidden lg:block absolute top-[80px] left-0 w-full bg-white shadow-xl border-t border-slate-200 transition-all duration-300 ease-in-out overflow-hidden z-[70] ${
          activeMegaMenu ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="max-w-[1920px] mx-auto flex min-h-[350px]">
          {/* 좌측 패널 */}
          <div className="w-[340px] bg-slate-50 p-10 border-r border-slate-200 flex flex-col justify-between shrink-0">
            <div>
              <h2 className="text-[26px] font-extrabold text-[#0059bb] mb-4 leading-tight">
                {activeMenuData?.title}
                <br />
                서비스 안내
              </h2>
              <p className="text-slate-600 text-[15px] leading-relaxed break-keep">
                {activeMenuData?.desc}
              </p>
            </div>
            {/* 대표 홈 이동 대형 버튼 */}
            <button
              onClick={() => handleMove(activeMenuData?.path)}
              className="mt-8 flex items-center justify-between gap-3 bg-[#0059bb] text-white font-bold px-6 py-5 rounded-xl hover:bg-[#004a9e] transition-all shadow-md group w-full"
            >
              <div className="flex items-center gap-3">
                <Home size={24} />
                <span className="text-[18px]">{activeMenuData?.title} 홈</span>
              </div>
              <ChevronRight
                size={24}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
          </div>

          {/* 우측 패널 */}
          <div className="flex-grow p-10 py-12">
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-x-12 gap-y-12">
              {activeMenuData?.categories.map((category, idx) => (
                <div key={idx} className="flex flex-col">
                  {/* 카테고리 헤더 */}
                  <h3 className="text-[20px] font-bold text-slate-800 mb-5 pb-3 border-b-2 border-[#0059bb]/20">
                    {category.heading}
                  </h3>
                  <ul className="flex flex-col gap-1">
                    {category.links.map((link, lIdx) => (
                      <li key={lIdx}>
                        <a
                          onClick={() => handleMove(link.path)}
                          className="flex items-center min-h-[48px] px-2 -mx-2 text-[17px] text-slate-600 font-medium hover:text-[#0059bb] hover:bg-slate-50 hover:font-bold rounded-lg cursor-pointer transition-all"
                        >
                          {link.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ================= 모바일 드롭다운 메뉴 ================= */}
      {isMobileOpen && (
        <div className="lg:hidden absolute top-[80px] left-0 w-full bg-white border-b-2 border-slate-200 shadow-xl flex flex-col max-h-[calc(100vh-80px)] overflow-y-auto z-40">
          <div className="flex flex-col px-6 py-4 gap-2 border-b border-slate-100">
            {MEGA_MENUS.map((menu) => (
              <div
                key={menu.id}
                className="flex flex-col border-b border-slate-100 last:border-0 py-2"
              >
                {/* 모바일 메인 카테고리 */}
                <div className="flex items-center justify-between py-2">
                  <span className="text-[20px] font-bold text-slate-800">
                    {menu.title}
                  </span>
                  <button
                    onClick={() => handleMove(menu.path)}
                    className="flex items-center gap-1 text-[14px] bg-[#0059bb]/10 text-[#0059bb] font-bold px-3 py-1.5 rounded-lg"
                  >
                    <Home size={16} /> 홈 가기
                  </button>
                </div>
                {/* 모바일 하위 메뉴 목록 나열 */}
                <div className="grid grid-cols-2 gap-2 mt-2 mb-4">
                  {menu.categories
                    .flatMap((c) => c.links)
                    .map((link, idx) => (
                      <a
                        key={idx}
                        onClick={() => handleMove(link.path)}
                        className="text-[15px] text-slate-600 hover:text-[#0059bb] bg-slate-50 rounded-lg p-3 font-medium"
                      >
                        {link.name}
                      </a>
                    ))}
                </div>
              </div>
            ))}
            <a
              onClick={() => handleMove("/realtime")}
              className="text-[20px] font-bold text-slate-800 hover:text-[#0059bb] py-4 border-b border-slate-100"
            >
              실시간정보
            </a>
            {role === "admin" && (
              <a
                onClick={() => handleMove("/admin")}
                className="text-[20px] font-bold text-red-500 hover:text-[#ba1a1a] py-4"
              >
                관리자 페이지
              </a>
            )}
          </div>

          <div className="px-6 py-8 bg-slate-50 mt-auto">
            {isLogin ? (
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-4">
                  <div
                    className="w-14 h-14 rounded-full bg-[#0059bb] text-white flex items-center justify-center font-bold text-xl cursor-pointer shadow-sm"
                    onClick={() => handleMove("/user")}
                  >
                    {userInitial}
                  </div>
                  <div className="flex flex-col">
                    <p className="text-[14px] font-bold text-slate-500 mb-1">
                      {role === "admin" ? "관리자" : "전기기사 과정"}
                    </p>
                    <p className="text-[18px] font-bold text-slate-800">
                      {userName} 님
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6 mt-2 pt-6 border-t border-slate-200">
                  <button className="text-slate-500 hover:text-[#0059bb] flex items-center gap-2 font-bold text-[16px]">
                    <CctvIcon size={24} />
                    <span>CCTV</span>
                  </button>
                  <span className="w-[2px] h-4 bg-slate-300"></span>
                  <button
                    onClick={handleLogout}
                    className="font-bold text-[16px] text-slate-500 hover:text-[#ba1a1a]"
                  >
                    로그아웃
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => handleMove("/login")}
                  className="font-bold text-[18px] text-[#0059bb] bg-[#0059bb]/10 rounded-xl py-4 w-full"
                >
                  로그인
                </button>
                <button
                  onClick={() => handleMove("/register")}
                  className="font-bold text-[18px] text-white bg-[#0059bb] rounded-xl py-4 w-full mt-2"
                >
                  회원가입
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
