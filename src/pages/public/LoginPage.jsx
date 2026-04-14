import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
// 경로를 프로젝트 환경에 맞게 수정해 주세요.
import { loginPostAsync, loginAdminAsync } from "@/slices/loginSlice";
import { COMPANY_NAME } from "@/constants/appConstants";

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false); // 관리자 로그인 여부 상태
  const [hasError, setHasError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setHasError(false);

    if (!email || !password) {
      setHasError(true);
      return;
    }

    try {
      // isAdmin 상태에 따라 호출할 액션을 분기 처리합니다.
      if (isAdmin) {
        await dispatch(loginAdminAsync({ email, password })).unwrap();
      } else {
        await dispatch(loginPostAsync({ email, password })).unwrap();
      }
      navigate("/"); // 로그인 성공 시 메인 페이지로 이동
    } catch (error) {
      console.error("로그인 실패:", error);
      setHasError(true);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="w-full flex items-center justify-center py-16 px-4">
      {/* Login Container Card */}
      <div className="max-w-2xl w-full bg-white border border-slate-200 shadow-[0_10px_30px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="p-10 md:p-16 bg-white flex flex-col justify-center">
          <div className="mb-12 text-center md:text-left">
            <h2 className="text-3xl font-black text-slate-900 mb-3">로그인</h2>
            <p className="text-slate-500 text-lg font-medium">
              {COMPANY_NAME}에 오신 것을 환영합니다.
            </p>
          </div>

          <form className="space-y-8" onSubmit={handleSubmit}>
            {/* 아이디 입력 */}
            <div>
              <label
                className="block text-base font-bold text-slate-800 mb-3"
                htmlFor="email"
              >
                아이디 (이메일 주소)
              </label>
              <input
                className="w-full px-5 py-4 bg-white border border-slate-300 text-lg font-medium focus:border-[#0059bb] focus:ring-1 focus:ring-[#0059bb] outline-none"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="아이디를 입력해 주세요"
                type="email"
              />
            </div>

            {/* 비밀번호 입력 및 에러 피드백 */}
            <div>
              <label
                className="block text-base font-bold text-slate-800 mb-3"
                htmlFor="password"
              >
                비밀번호
              </label>
              <div className="relative">
                <input
                  className={`w-full px-5 py-4 bg-white border text-lg font-medium outline-none focus:ring-1 ${
                    hasError
                      ? "border-[#ba1a1a] focus:border-[#ba1a1a] focus:ring-[#ba1a1a]"
                      : "border-slate-300 focus:border-[#0059bb] focus:ring-[#0059bb]"
                  }`}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호를 입력해 주세요"
                  type={showPassword ? "text" : "password"}
                />
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                  type="button"
                  onClick={togglePasswordVisibility}
                >
                  <span className="material-symbols-outlined text-2xl">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
              {/* 에러 메시지 */}
              {hasError && (
                <p className="text-[#ba1a1a] text-sm font-bold mt-2 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">
                    error
                  </span>
                  아이디 또는 비밀번호가 일치하지 않습니다. 다시 확인해 주세요.
                </p>
              )}
            </div>

            {/* 로그인 옵션 (상태 유지 및 관리자 로그인) */}
            <div className="flex items-center justify-between py-1">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  className="w-5 h-5 border-slate-300 text-[#0059bb] focus:ring-[#0059bb]"
                  type="checkbox"
                />
                <span className="text-base font-bold text-slate-600">
                  로그인 상태 유지
                </span>
              </label>

              {/* 관리자 로그인 체크박스 추가 */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  className="w-5 h-5 border-slate-300 text-[#0059bb] focus:ring-[#0059bb]"
                  type="checkbox"
                  checked={isAdmin}
                  onChange={(e) => setIsAdmin(e.target.checked)}
                />
                <span className="text-base font-bold text-slate-600">
                  관리자로 로그인
                </span>
              </label>
            </div>

            <button
              className="w-full py-5 bg-[#0059bb] text-white text-xl font-bold hover:bg-[#004a9e] transition-colors mt-4"
              type="submit"
            >
              {isAdmin ? "관리자 로그인 하기" : "로그인 하기"}
            </button>
          </form>

          {/* Links */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4 md:gap-6 text-base font-bold text-slate-600">
            <a className="hover:text-[#0059bb] hover:underline underline-offset-4 cursor-pointer">
              아이디 찾기
            </a>
            <span className="w-[1px] h-3 bg-slate-300 hidden md:block"></span>
            <a className="hover:text-[#0059bb] hover:underline underline-offset-4 cursor-pointer">
              비밀번호 찾기
            </a>
            <span className="w-[1px] h-3 bg-slate-300 hidden md:block"></span>
            <a
              className="text-[#0059bb] hover:underline underline-offset-4 font-black cursor-pointer"
              onClick={() => navigate("/register")}
            >
              회원가입 하기
            </a>
          </div>

          {/* Social Login */}
          <div className="mt-16">
            <div className="relative flex items-center mb-10">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="px-6 text-sm font-bold text-slate-400 bg-white">
                간편 SNS 로그인
              </span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <div className="flex flex-col gap-3 w-full">
              <button
                className="w-full h-14 bg-[#FEE500] flex items-center justify-center gap-3 hover:opacity-90 rounded-lg transition-opacity"
                title="카카오 로그인"
              >
                <span
                  className="material-symbols-outlined text-[#3C1E1E] text-2xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  chat_bubble
                </span>
                <span className="text-[#3C1E1E] font-bold text-lg">
                  카카오로 시작하기
                </span>
              </button>

              <button
                className="w-full h-14 bg-[#03C75A] flex items-center justify-center gap-3 hover:opacity-90 rounded-lg transition-opacity"
                title="네이버 로그인"
              >
                <span className="text-white font-black text-2xl">N</span>
                <span className="text-white font-bold text-lg">
                  네이버로 시작하기
                </span>
              </button>

              <button
                className="w-full h-14 bg-white border border-slate-300 flex items-center justify-center gap-3 hover:bg-slate-50 rounded-lg transition-colors"
                title="구글 로그인"
              >
                <img
                  alt="Google"
                  className="w-6 h-6"
                  src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg"
                />
                <span className="text-slate-700 font-bold text-lg">
                  Google로 시작하기
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
