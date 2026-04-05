import apiClient from "@/api/core/apiClient"; // 실제 프로젝트 경로에 맞게 수정해주세요.
import { ArrowRight, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const PresentationIndexPage = () => {
  const navigate = useNavigate();
  const [selectedSubject, setSelectedSubject] = useState("EM");
  const [chapterList, setChapterList] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ '제어공학(CN)' 추가 완료!
  const subjects = [
    { code: "MC", title: "전기기기", color: "blue", icon: "⚡" },
    { code: "PW", title: "전력공학", color: "purple", icon: "🔌" },
    { code: "CT", title: "회로이론", color: "cyan", icon: "🔬" },
    { code: "CN", title: "제어공학", color: "orange", icon: "🎛️" },
    { code: "EM", title: "전기자기학", color: "red", icon: "🧲" },
    { code: "KEC", title: "설비기준", color: "gray", icon: "📋" },
    { code: "KOR", title: "Korea", color: "green", icon: "🇰🇷" },
  ];

  const currentSubjectInfo = subjects.find((s) => s.code === selectedSubject);

  useEffect(() => {
    if (!selectedSubject) return;
    fetchChapterList();
  }, [selectedSubject]);

  const fetchChapterList = async () => {
    setLoading(true);
    try {
      // 💡 [핵심 수정] KOR로 고정되어 있던 부분을 selectedSubject 상태값으로 동적 변경!
      const response = await apiClient.get(
        `/api/presentation/chapters/list?subject=${selectedSubject}`,
      );
      setChapterList(response.data);
      console.log("📥 받아온 챕터 데이터:", response.data);
    } catch (e) {
      console.error("챕터 로드 실패:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleChapterClick = (chapter) => {
    navigate(
      `/user/presentation/${selectedSubject.toLowerCase()}/${chapter.code}`,
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-black text-slate-800 mb-4">
            <span className="text-blue-600">⚡</span> 전기기사 지식 그래프
          </h1>

          {/* 과목 선택 */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {subjects.map((s) => (
              <button
                key={s.code}
                onClick={() => setSelectedSubject(s.code)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all whitespace-nowrap ${
                  selectedSubject === s.code
                    ? "bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500"
                    : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                <span className="text-lg">{s.icon}</span>
                <span className="font-bold">{s.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chapter 목록 */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-800">
            {currentSubjectInfo?.title} - 챕터 선택
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            챕터를 선택하면 해당 지식 그래프를 확인할 수 있습니다.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
            <p className="text-slate-600 font-medium">로딩 중...</p>
          </div>
        ) : chapterList && chapterList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {chapterList.map((chapter, idx) => (
              <button
                key={chapter.code}
                onClick={() => handleChapterClick(chapter)}
                className="group bg-white p-6 rounded-2xl border-2 border-slate-200 hover:border-blue-500 hover:shadow-xl transition-all text-left"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg group-hover:bg-blue-500 group-hover:text-white transition-colors">
                    {idx + 1}
                  </div>
                  <ArrowRight
                    className="text-slate-400 group-hover:text-blue-500 transition-colors"
                    size={20}
                  />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">
                  {chapter.title}
                </h3>
                <div className="text-xs text-slate-400 font-mono">
                  {chapter.code}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
            <p className="text-slate-500 font-medium">
              해당 과목에 등록된 챕터가 없습니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PresentationIndexPage;
