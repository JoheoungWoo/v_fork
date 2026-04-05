// 페이지 이외의 것
import BasicLayout from "@/layouts/BasicLayout";
import ChapterGraphPage from "@/pages/public/ChapterGraphPage";
import GenericFlowPage from "@/pages/public/GenericFlowPage";
import PresentationIndexPage from "@/pages/public/PresentationIndexPage";
import PresentationListPage from "@/pages/public/PresentationListPage";
import PresentationPage from "@/pages/public/PresentationPage";
import SubjectMapPage from "@/pages/public/SubjectMapPage";

// 페이지
import AiVideoList from "@/pages/user/AiVideoList";
import AiVideoWatch from "@/pages/user/AiVideoWatch";
import KnowledgeRepository from "@/pages/user/KnowledgeRepository";
import ProblemList from "@/pages/user/ProblemList";
import ProblemSolving from "@/pages/user/ProblemSolving";
import UserDashboard from "@/pages/user/UserDashboard";

export const userRouter = [
  {
    path: "/user",
    element: <BasicLayout />,
    children: [
      // 나의 강의실 홈
      { index: true, element: <UserDashboard /> },

      // 🎥 강의
      { path: "videos", element: <AiVideoList /> }, // 목록
      { path: "videos/:id", element: <AiVideoWatch /> }, // 상세

      // 📝 문제
      { path: "problems", element: <ProblemList /> },
      { path: "problems/:id", element: <ProblemSolving /> },

      // 지식
      { path: "knowledge", element: <KnowledgeRepository /> },
      { path: "subjectmap", element: <SubjectMapPage /> },

      // 그래프
      {
        path: "presentation",
        children: [
          { index: true, element: <PresentationListPage /> }, // 강의 노트
          { path: "select", element: <PresentationIndexPage /> }, // ✅ 그래프만 표시
          { path: ":subject/:chapter", element: <ChapterGraphPage /> }, // ✅ 새로운 페이지

          // ✅ [수정] 모든 과목이 GenericFlowPage를 사용하도록 변경
          { path: "mc", element: <GenericFlowPage subject="mc" /> },
          { path: "pw", element: <GenericFlowPage subject="pw" /> },
          { path: "ct", element: <GenericFlowPage subject="ct" /> },
          { path: "em", element: <GenericFlowPage subject="em" /> },
          { path: "kec", element: <GenericFlowPage subject="kec" /> },

          // { path: "animation", element: <StudyCard /> },
        ],
      },
    ],
  },
];
