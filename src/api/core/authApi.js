import apiClient from "@/api/core/apiClient";

// 1) 일반 로그인
export const loginUser = async ({ email, password }) => {
  const res = await apiClient.post(`/member/login`, { email, password });
  // 서버가 보내준 role이 없으면 안전하게 user로 설정
  return { ...res.data, role: res.data.role || "user" };
};

// 2) 관리자 로그인
export const loginAdmin = async ({ email, password }) => {
  const res = await apiClient.post(`/admin/login`, { email, password });
  // 서버가 보내준 role이 없으면 안전하게 admin으로 설정
  return { ...res.data, role: res.data.role || "admin" };
};

// 3) 일반 회원가입
export const registerUser = async ({ email, password, name }) => {
  const res = await apiClient.post(`/member/register`, {
    email,
    password,
    name,
  });
  return res.data;
};

// 4) ✅ [수정] 관리자 회원가입 (이름 추가)
export const registerAdmin = async ({ email, password, name }) => {
  const res = await apiClient.post(`/admin/register`, {
    email,
    password,
    name, // 👈 서버로 이름 전송
  });
  return res.data;
};
