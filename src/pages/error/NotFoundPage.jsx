import { Link } from "react-router-dom"; // ✅ Link 사용

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-6xl font-bold text-gray-800">404</h1>
      <p className="text-xl text-gray-600 mt-4">페이지를 찾을 수 없어요 😢</p>

      {/* ✅ a 태그 대신 Link 사용 (SPA 최적화) */}
      <Link
        to="/"
        className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        메인으로 돌아가기
      </Link>
    </div>
  );
};

export default NotFoundPage;
