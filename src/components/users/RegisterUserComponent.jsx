import React, { useState } from "react";
import { registerUser } from "@/api/core/authApi"; // 프로젝트 경로에 맞게 수정해 주세요.
import { COMPANY_NAME } from "@/constants/appConstants";

const RegisterUserComponent = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    passwordConfirm: "",
  });
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    // 유효성 검사
    if (!formData.name || !formData.email || !formData.password) {
      setErrorMessage("모든 항목을 입력해 주세요.");
      return;
    }

    if (formData.password !== formData.passwordConfirm) {
      setErrorMessage("비밀번호가 일치하지 않습니다. 다시 확인해 주세요.");
      return;
    }

    // API 호출
    try {
      await registerUser({
        email: formData.email,
        password: formData.password,
        name: formData.name,
      });
      alert("회원가입이 성공적으로 완료되었습니다.");
      // 성공 후 추가 작업이 필요하다면 이곳에 작성
    } catch (error) {
      console.error("회원가입 에러:", error);
      setErrorMessage("회원가입에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    }
  };

  return (
    <div className="w-full flex items-center justify-center py-16 px-4">
      <div className="max-w-2xl w-full bg-white border border-slate-200 shadow-[0_10px_30px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="p-10 md:p-16 bg-white flex flex-col justify-center">
          <div className="mb-12 text-center md:text-left">
            <h2 className="text-3xl font-black text-slate-900 mb-3">
              회원가입
            </h2>
            <p className="text-slate-500 text-lg font-medium">
              {COMPANY_NAME}에 오신 것을 환영합니다.
            </p>
          </div>

          <form className="space-y-8" onSubmit={handleSubmit}>
            {/* 이름 입력 */}
            <div>
              <label
                className="block text-base font-bold text-slate-800 mb-3"
                htmlFor="name"
              >
                이름
              </label>
              <input
                className="w-full px-5 py-4 bg-white border border-slate-300 text-lg font-medium focus:border-[#0059bb] focus:ring-1 focus:ring-[#0059bb] outline-none"
                id="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="이름을 입력해 주세요"
                type="text"
              />
            </div>

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
                value={formData.email}
                onChange={handleChange}
                placeholder="아이디를 입력해 주세요"
                type="email"
              />
            </div>

            {/* 비밀번호 입력 */}
            <div>
              <label
                className="block text-base font-bold text-slate-800 mb-3"
                htmlFor="password"
              >
                비밀번호
              </label>
              <div className="relative">
                <input
                  className="w-full px-5 py-4 bg-white border border-slate-300 text-lg font-medium focus:border-[#0059bb] focus:ring-1 focus:ring-[#0059bb] outline-none"
                  id="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="비밀번호를 입력해 주세요"
                  type="password"
                />
              </div>
            </div>

            {/* 비밀번호 확인 입력 */}
            <div>
              <label
                className="block text-base font-bold text-slate-800 mb-3"
                htmlFor="passwordConfirm"
              >
                비밀번호 확인
              </label>
              <div className="relative">
                <input
                  className={`w-full px-5 py-4 bg-white border text-lg font-medium outline-none ${
                    errorMessage &&
                    formData.password !== formData.passwordConfirm
                      ? "border-[#ba1a1a] focus:ring-[#ba1a1a]"
                      : "border-slate-300 focus:border-[#0059bb] focus:ring-[#0059bb]"
                  } focus:ring-1`}
                  id="passwordConfirm"
                  value={formData.passwordConfirm}
                  onChange={handleChange}
                  placeholder="비밀번호를 다시 한 번 입력해 주세요"
                  type="password"
                />
              </div>

              {/* 에러 메시지 표시 */}
              {errorMessage && (
                <p className="text-[#ba1a1a] text-sm font-bold mt-2 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">
                    error
                  </span>
                  {errorMessage}
                </p>
              )}
            </div>

            <button
              className="w-full py-5 bg-[#0059bb] text-white text-xl font-bold hover:bg-[#004a9e] transition-colors mt-4"
              type="submit"
            >
              회원가입 하기
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterUserComponent;
