import { getErrorConfig } from "@/config/errorConfig";

/**
 * 운영 환경에서도 사용자에게 노출 가능한 상태 코드
 */
const PUBLIC_STATUS_CODES = [400, 401, 403, 404, 409, 422, 429];

export const errorHandler = (error) => {
  const isDev = import.meta.env.VITE_APP_ENV === "dev";
  const status = error?.status || error?.response?.status || null;

  const config = getErrorConfig(status);

  // 1️⃣ 개발 환경 → 전체 노출
  if (isDev) {
    console.error("[API ERROR]", status, error);
    return config;
  }

  // 2️⃣ 운영 환경 → 허용된 에러만 상세 노출
  if (PUBLIC_STATUS_CODES.includes(status)) {
    return config;
  }

  // 3️⃣ 그 외 → 마스킹 (500 등)
  return {
    ...config,
    desc: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
  };
};
