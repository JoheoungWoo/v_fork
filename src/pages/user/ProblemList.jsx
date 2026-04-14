import { useState, useEffect } from "react";
import useCustomMove from "@/hooks/useCustomMove";
import { getQuestionList } from "@/api/questionApi";

export default function ProblemList() {
  const { page, size, moveToList, moveToRead } =
    useCustomMove("/user/problems");

  // API에서 받아온 데이터를 저장할 상태
  const [questionData, setQuestionData] = useState({
    items: [],
    total: 0,
    total_pages: 0,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // API 호출을 통해 문제 목록 가져오기
  useEffect(() => {
    const fetchQuestions = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getQuestionList({ page, size });
        setQuestionData(data);
      } catch (err) {
        console.error("문제 목록 조회 실패:", err);
        setError("문제 목록을 불러오는 데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, [page, size]);

  // 페이지 이동 핸들러 (이전/다음 버튼용)
  const handlePrevPage = () => {
    if (page > 1) moveToList({ page: page - 1, size });
  };

  const handleNextPage = () => {
    if (page < questionData.total_pages) moveToList({ page: page + 1, size });
  };

  return (
    <main className="pt-32 pb-24 px-8 max-w-7xl mx-auto font-sans bg-[#f8fafc] min-h-screen text-slate-800">
      {/* Header Section */}
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#0052cc] to-[#0070f3] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#0052cc]/20">
              <span className="material-symbols-outlined text-2xl">quiz</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 font-['Manrope']">
              전기기사 예상 문제 목록
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-slate-400 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
          <span className="material-symbols-outlined text-base">
            filter_list
          </span>
          <span>Sorted by: Recent</span>
        </div>
      </header>

      {/* 로딩 및 에러 처리 */}
      {isLoading && (
        <div className="flex justify-center items-center py-20 text-slate-500 font-medium">
          <span className="material-symbols-outlined animate-spin text-3xl mr-3 text-[#0052cc]">
            autorenew
          </span>
          문제 목록을 불러오는 중입니다...
        </div>
      )}
      {error && (
        <div className="text-center py-20 text-red-500 font-bold bg-red-50 rounded-2xl border border-red-100">
          <span className="material-symbols-outlined text-4xl block mb-2">
            error
          </span>
          {error}
        </div>
      )}

      {/* Bento-style Question Grid */}
      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {questionData.items.map((p) => (
            <article
              key={p.id}
              onClick={() => moveToRead(p.id)}
              className="cursor-pointer bg-white rounded-2xl p-8 flex flex-col border border-slate-100 transition-all hover:shadow-xl hover:shadow-[#0052cc]/5 hover:-translate-y-1.5 group shadow-[0_4px_20px_rgba(0,82,204,0.04),0_1px_2px_rgba(0,0,0,0.02)]"
            >
              <div className="flex justify-between items-start mb-6">
                <span className="text-xs font-bold text-[#0052cc] px-3 py-1.5 bg-[#0052cc]/5 rounded-lg max-w-[60%] truncate">
                  #{p.id.split("-")[0] || p.id}{" "}
                  {/* ID가 너무 길면 잘라서 보여주거나 전체 표시 */}
                </span>
                <span
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                    p.is_verified
                      ? "bg-green-50 text-green-600 border border-green-100"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {p.is_verified ? "검증됨" : "미검증"}
                </span>
              </div>

              <div className="flex-grow mb-8">
                <h3 className="text-xl font-bold text-slate-800 leading-[1.6] mb-4 line-clamp-3 font-['Manrope'] group-hover:text-[#0052cc] transition-colors">
                  {p.title}
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <span className="material-symbols-outlined text-base">
                      calendar_today
                    </span>
                    <span className="font-medium">
                      {new Date(p.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <span className="material-symbols-outlined text-base">
                      local_library
                    </span>
                    <span className="font-medium">전기기사 예상문제</span>
                  </div>
                </div>
              </div>

              <button
                className="w-full bg-gradient-to-br from-[#0052cc] to-[#0070f3] text-white py-3.5 rounded-xl font-bold active:scale-95 transition-all shadow-md shadow-[#0052cc]/20 hover:brightness-110"
                onClick={(e) => {
                  e.stopPropagation();
                  moveToRead(p.id);
                }}
              >
                문제 풀기
              </button>
            </article>
          ))}

          {questionData.items.length === 0 && (
            <div className="col-span-full text-center py-20 text-slate-500 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <span className="material-symbols-outlined text-5xl mb-3 text-slate-300">
                inventory_2
              </span>
              <p className="text-lg font-medium">등록된 문제가 없습니다.</p>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && !error && questionData.total_pages > 0 && (
        <nav className="mt-20 flex justify-center items-center gap-3">
          {/* 이전 버튼 */}
          <button
            onClick={handlePrevPage}
            disabled={page === 1}
            className={`w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 transition-colors ${
              page === 1
                ? "opacity-50 cursor-not-allowed text-slate-300"
                : "hover:bg-slate-50 text-slate-500 hover:text-[#0052cc]"
            }`}
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>

          {/* 페이지 번호들 */}
          {Array.from({ length: questionData.total_pages }).map((_, i) => (
            <button
              key={i}
              onClick={() => moveToList({ page: i + 1, size })}
              className={`w-10 h-10 flex items-center justify-center rounded-xl font-semibold transition-all ${
                page === i + 1
                  ? "bg-gradient-to-br from-[#0052cc] to-[#0070f3] text-white shadow-lg shadow-[#0052cc]/20"
                  : "border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-[#0052cc]"
              }`}
            >
              {i + 1}
            </button>
          ))}

          {/* 다음 버튼 */}
          <button
            onClick={handleNextPage}
            disabled={page === questionData.total_pages}
            className={`w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 transition-colors ${
              page === questionData.total_pages
                ? "opacity-50 cursor-not-allowed text-slate-300"
                : "hover:bg-slate-50 text-slate-500 hover:text-[#0052cc]"
            }`}
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </nav>
      )}
    </main>
  );
}
