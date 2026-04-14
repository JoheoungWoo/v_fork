import { ArrowLeft, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ChapterFeedCard from "@/components/presentation/ChapterFeedCard";

const API_BASE = (
  import.meta.env.VITE_API_BASE || "http://localhost:8000"
).replace(/\/$/, "");

const PresentationListPage = () => {
  const { subject } = useParams();
  const navigate = useNavigate();

  // ✅ 1. subject가 없을 경우 기본값 "ct"를 할당하는 안전한 변수 생성
  const safeSubject = (subject || "ct").toLowerCase();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chapterList, setChapterList] = useState([]);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);

  const subjectMap = {
    mc: { title: "전기기기", color: "blue", icon: "⚡" },
    pw: { title: "전력공학", color: "purple", icon: "🔌" },
    ct: { title: "회로이론", color: "cyan", icon: "🔬" },
    cn: { title: "제어공학", color: "orange", icon: "🎛️" },
    em: { title: "전기자기학", color: "red", icon: "🧲" },
    kec: { title: "설비기준", color: "gray", icon: "📋" },
  };

  // ✅ 2. safeSubject를 기준으로 맵핑 객체 가져오기
  const currentSubject = subjectMap[safeSubject] || subjectMap.ct;

  // ✅ 챕터 목록 로드 (의존성 배열 및 쿼리 파라미터에 safeSubject 사용)
  useEffect(() => {
    fetchChapterList();
  }, [safeSubject]);

  const fetchChapterList = async () => {
    try {
      const res = await fetch(
        `${API_BASE}/api/presentation/chapters/list?subject=${safeSubject.toUpperCase()}`,
      );
      const data = await res.json();
      setChapterList(data);
      console.log(`✅ 챕터 목록: ${data.length}개`);
    } catch (e) {
      console.error("❌ 챕터 목록 로드 실패:", e);
    }
  };

  // ✅ 전체 토픽 로드 (의존성 배열 및 쿼리 파라미터에 safeSubject 사용)
  useEffect(() => {
    fetchAllData();
  }, [safeSubject]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/presentation/chapters/all?subject=${safeSubject.toUpperCase()}`,
      );
      const data = await res.json();
      setItems(data);
      console.log(`✅ 데이터 로드: ${data.length}개 토픽`);
    } catch (e) {
      console.error("❌ 데이터 로드 실패:", e);
    } finally {
      setLoading(false);
    }
  };

  // ✅ 챕터 이동
  const goToPreviousChapter = () => {
    if (currentChapterIndex > 0) {
      setCurrentChapterIndex((prev) => prev - 1);
      scrollToChapter(currentChapterIndex - 1);
    }
  };

  const goToNextChapter = () => {
    if (currentChapterIndex < chapterList.length - 1) {
      setCurrentChapterIndex((prev) => prev + 1);
      scrollToChapter(currentChapterIndex + 1);
    }
  };

  const scrollToChapter = (index) => {
    const chapterCode = chapterList[index]?.code;
    if (!chapterCode) return;

    const targetTopicIndex = items.findIndex((item) =>
      item.code.startsWith(chapterCode),
    );

    if (targetTopicIndex !== -1) {
      const element = document.getElementById(
        `topic-${items[targetTopicIndex].uid}`,
      );
      element?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // ✅ 스크롤 추적
  useEffect(() => {
    if (items.length === 0) return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 3;

      for (let i = items.length - 1; i >= 0; i--) {
        const element = document.getElementById(`topic-${items[i].uid}`);
        if (element && element.offsetTop <= scrollPosition) {
          const chapterCode = items[i].code.split("-").slice(0, 2).join("-");
          const chapterIndex = chapterList.findIndex(
            (ch) => ch.code === chapterCode,
          );
          if (chapterIndex !== -1 && chapterIndex !== currentChapterIndex) {
            setCurrentChapterIndex(chapterIndex);
          }
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [items, chapterList, currentChapterIndex]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ✅ 상단 네비게이션 */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/user/presentation/select")}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={24} className="text-slate-600" />
              </button>
              <div>
                {/* ✅ 화면 렌더링 시에도 safeSubject 사용 */}
                <div className="text-sm text-slate-500 font-bold">
                  {safeSubject.toUpperCase()}
                </div>
                <h1 className="text-2xl font-black text-slate-800">
                  {currentSubject.title} - 리스트 보기
                </h1>
              </div>
            </div>

            {/* ✅ 챕터 네비게이션 (기존 코드와 동일) */}
            {chapterList.length > 0 && (
              <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
                <button
                  onClick={goToPreviousChapter}
                  disabled={currentChapterIndex === 0}
                  className={`p-2 rounded-lg transition-all ${
                    currentChapterIndex === 0
                      ? "text-slate-300 cursor-not-allowed"
                      : "text-slate-600 hover:bg-white"
                  }`}
                >
                  <ChevronLeft size={20} />
                </button>

                <div className="text-center min-w-[200px]">
                  <div className="text-xs text-slate-400 font-bold">
                    Chapter {currentChapterIndex + 1} / {chapterList.length}
                  </div>
                  <div className="text-sm font-bold text-slate-700">
                    {chapterList[currentChapterIndex]?.title}
                  </div>
                </div>

                <button
                  onClick={goToNextChapter}
                  disabled={currentChapterIndex === chapterList.length - 1}
                  className={`p-2 rounded-lg transition-all ${
                    currentChapterIndex === chapterList.length - 1
                      ? "text-slate-300 cursor-not-allowed"
                      : "text-slate-600 hover:bg-white"
                  }`}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ✅ 리스트 컨텐츠 (기존 코드와 동일) */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
            <p className="text-slate-600 font-medium">데이터 로딩 중...</p>
          </div>
        ) : items.length > 0 ? (
          <div className="space-y-8">
            {items.map((item) => (
              <div key={`${item.code}-${item.uid}`} id={`topic-${item.uid}`}>
                <ChapterFeedCard item={item} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-slate-400 text-lg">
            등록된 토픽이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
};

export default PresentationListPage;
