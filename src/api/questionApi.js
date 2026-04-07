// src/api/questionApi.js
import apiClient from "@/api/core/apiClient";

// Supabase 질문 목록
// 목록 (UI는 1페이지부터, 서버는 0페이지부터라고 가정하고 보정)
export const getQuestionList = async ({ page = 1, size = 20 } = {}) => {
  // 백엔드가 page=1부터 시작하는 로직이므로 그대로 보냅니다.
  const res = await apiClient.get(`/questions?page=${page}&size=${size}`);
  return res.data;
};

export const getQuestionById = async (id) => {
  const res = await apiClient.get(`/questions/${id}`);
  return res.data;
};
