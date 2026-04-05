import { ArrowLeft, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ChapterGraph from "@/components/presentation/ChapterGraph";
import apiClient from "@/api/core/apiClient"; // 실제 프로젝트 경로에 맞게 수정해주세요.

const ChapterGraphPage = () => {
  const { subject, chapter } = useParams();
  const navigate = useNavigate();

  // ✅ 배열로 초기화
  const [chapterData, setChapterData] = useState([]);
  const [chapterList, setChapterList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  const subjectMap = {
    mc: { title: "전기기기", color: "blue" },
    pw: { title: "전력공학", color: "purple" },
    ct: { title: "회로이론", color: "cyan" },
    cn: { title: "제어공학", color: "orange" },
    em: { title: "전기자기학", color: "red" },
    kec: { title: "설비기준", color: "gray" },
  };

  const currentSubject = subjectMap[subject?.toLowerCase()];

  useEffect(() => {
    fetchChapterList();
  }, [subject]);

  useEffect(() => {
    if (chapter) {
      fetchChapterData();
    }
  }, [chapter, subject]); // ✅ subject 추가

  useEffect(() => {
    if (chapterList.length > 0 && chapter) {
      const idx = chapterList.findIndex((ch) => ch.code === chapter);
      if (idx !== -1) setCurrentIndex(idx);
    }
  }, [chapter, chapterList]);

  const fetchChapterList = async () => {
    try {
      // ✅ 수정: /user/ 제거
      const res = await apiClient.get(`/api/presentation/chapters/list`, {
        params: { subject: subject.toUpperCase() },
      });
      const data = res.data; // axios는 data 속성에 응답을 담아줍니다.
      console.log("📋 챕터 목록:", data);
      setChapterList(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("❌ 챕터 목록 로드 실패:", e);
    }
  };

  const fetchChapterData = async () => {
    console.log("🔄 데이터 로드 시작:", { subject, chapter });

    setLoading(true);
    setChapterData([]); // 초기화

    try {
      // ✅ 수정: /user/ 제거
      const res = await apiClient.get(`/api/presentation/chapters/all`, {
        params: { subject: subject.toUpperCase() },
      });

      const allData = res.data;
      console.log("📦 전체 데이터:", {
        type: typeof allData,
        isArray: Array.isArray(allData),
        length: Array.isArray(allData) ? allData.length : "N/A",
        sample:
          Array.isArray(allData) && allData.length > 0 ? allData[0] : null,
      });

      if (!Array.isArray(allData)) {
        console.error("❌ 잘못된 데이터 형식:", allData);
        setChapterData([]);
        return;
      }

      // ✅ 현재 Chapter에 속한 Topic만 필터링
      const filteredData = allData.filter((item) => {
        const matches = item.code && item.code.startsWith(chapter);
        console.log(`  ${item.code} → ${matches ? "✓" : "✗"}`);
        return matches;
      });

      console.log(
        `✅ 필터링 완료: ${filteredData.length}개 토픽 (원본: ${allData.length})`,
      );

      setChapterData(filteredData);
    } catch (e) {
      console.error("❌ 데이터 로드 실패:", e);
      setChapterData([]);
    } finally {
      setLoading(false);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      const prevChapter = chapterList[currentIndex - 1];
      navigate(`/user/presentation/${subject}/${prevChapter.code}`);
    }
  };

  const goToNext = () => {
    if (currentIndex < chapterList.length - 1) {
      const nextChapter = chapterList[currentIndex + 1];
      navigate(`/user/presentation/${subject}/${nextChapter.code}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
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
                <div className="text-sm text-slate-500 font-bold">
                  {subject?.toUpperCase()} / {chapter}
                </div>
                <h1 className="text-2xl font-black text-slate-800">
                  {currentSubject?.title} -{" "}
                  {chapterList[currentIndex]?.title || "로딩 중..."}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
              <button
                onClick={goToPrevious}
                disabled={currentIndex === 0}
                className={`p-2 rounded-lg transition-all ${
                  currentIndex === 0
                    ? "text-slate-300 cursor-not-allowed"
                    : "text-slate-600 hover:bg-white"
                }`}
              >
                <ChevronLeft size={20} />
              </button>

              <div className="text-center min-w-[150px]">
                <div className="text-xs text-slate-400 font-bold">
                  Chapter {currentIndex + 1} / {chapterList.length}
                </div>
              </div>

              <button
                onClick={goToNext}
                disabled={currentIndex === chapterList.length - 1}
                className={`p-2 rounded-lg transition-all ${
                  currentIndex === chapterList.length - 1
                    ? "text-slate-300 cursor-not-allowed"
                    : "text-slate-600 hover:bg-white"
                }`}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Graph */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {loading ? (
          <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            <p className="text-slate-600 font-medium">데이터 로딩 중...</p>
          </div>
        ) : chapterData && chapterData.length > 0 ? (
          <div className="h-[80vh]">
            {/* ✅ props 명시적으로 전달 */}
            <ChapterGraph
              data={chapterData}
              chapterCode={chapter}
              subjectInfo={currentSubject}
            />
          </div>
        ) : (
          <div className="h-[80vh] flex flex-col items-center justify-center gap-2 text-slate-400">
            <span className="text-4xl">📭</span>
            <span className="text-lg font-medium">
              {chapter}에 해당하는 토픽이 없습니다.
            </span>
            <button
              onClick={() => navigate("/user/presentation/select")}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              챕터 목록으로 돌아가기
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChapterGraphPage;
