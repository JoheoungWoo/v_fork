import { createBrowserRouter } from "react-router-dom";
import NotFoundPage from "@/pages/error/NotFoundPage";

import { mainRouter } from "./mainRouter";
import { userRouter } from "./userRouter";

// 값 누락시, prod 즉 운영용으로 설정
const currentEnv = import.meta.env.VITE_APP_ENV || "prod";
const isDev = currentEnv === "dev";

const root = createBrowserRouter([
  // 1. 운영용 라우터
  ...mainRouter,

  // 2. 멤버 라우터
  ...userRouter,

  // 3. 어드민 라우터
  // ...adminRouter,

  // 98. 개발 전용 라우터
  // ...devRouter,

  // 99. 404 에러 페이지
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

export default root;
