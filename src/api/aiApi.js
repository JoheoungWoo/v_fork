// src/api/ai.js (또는 해당 API 파일 위치)
import apiClient from "@/api/core/apiClient";

export const aiChatGraph = async (payload, token) => {
  console.log("payload:", payload, ",token:", token);
  const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

  // ✅ [수정] 백엔드가 POST 방식이므로 .get() -> .post()로 변경해야 합니다.
  // post(url, data, config) 순서입니다.
  const res = await apiClient.post(`/api/graph-chat/query`, payload, config);

  return res.data;
};
