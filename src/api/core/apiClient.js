// apiClient.js
import { STORAGE_KEY } from "@/utils/storageKey";
import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
});

// ====================================================
// 🚀 요청(Request) 인터셉터: 토큰 안전하게 추출 및 포함
// ====================================================
apiClient.interceptors.request.use(
  (config) => {
    // 💡 1. LocalStorage에서 로그인 정보(토큰) 가져오기
    // 현재 프로젝트에서 저장하는 실제 Key 이름으로 반드시 변경하세요!
    // (예: "user", "auth-storage", "sb-qklgjbqx...-auth-token" 등)
    const rawData = localStorage.getItem(STORAGE_KEY);

    let token = null;

    if (rawData) {
      try {
        // 만약 저장된 값이 JSON 객체 형태라면 (Zustand, Redux 등 사용 시)
        const parsedData = JSON.parse(rawData);

        // 데이터 구조에 맞게 토큰만 쏙 빼냅니다.
        // (예: parsedData.state.user.access_token 등 상황에 맞게 수정)
        token = parsedData.access_token || parsedData.token || parsedData;
      } catch (error) {
        // JSON 파싱 에러가 난다면 단순 문자열로 저장되어 있다는 뜻이므로 그대로 사용
        token = rawData;
      }
    }

    // 💡 2. "null"이나 "undefined" 같은 문자열이 들어가는 것을 완벽 차단
    if (token && token !== "null" && token !== "undefined") {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 응답 인터셉터 (기존 코드 유지)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const customError = new Error();
    customError.status = status;
    throw customError;
  },
);

export default apiClient;
