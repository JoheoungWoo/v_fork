// 페이지 이외의 것
import BasicLayout from "@/layouts/BasicLayout";

// 페이지
import MainPage from "@/pages/public/MainPage";
import LegalNotice from "@/pages/public/LegalNotice";
import LoginPage from "@/pages/public/LoginPage";
import RegisterPage from "@/pages/public/RegisterPage";
import RealTimeInfoPage from "@/pages/public/RealTimeInfoPage";

export const mainRouter = [
  {
    path: "/",
    element: <BasicLayout />,
    children: [
      { index: true, element: <MainPage /> },
      { path: "legal", element: <LegalNotice /> },
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
      { path: "realtime", element: <RealTimeInfoPage /> },
    ],
  },
];
