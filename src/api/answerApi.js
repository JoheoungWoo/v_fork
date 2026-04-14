import apiClient from "@/api/core/apiClient";

// Supabase 답변요청
export const submitAnswer = async (payload, token) => {
  const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  console.log("config:", ",payload:", payload, config);
  // POST 요청 시 payload(body)와 config(headers) 순서 주의
  const res = await apiClient.post(`/answers/submit`, payload, config);
  return res.data;
};
