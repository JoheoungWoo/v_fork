import apiClient from "@/api/core/apiClient";
import useCustomMove from "@/hooks/useCustomMove";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

// ✅ 하위 컴포넌트 임포트 (파일을 분리했을 경우)
import VideoCard from "./VideoCard";

import VideoDetailModal from "./DetailModal";
import VideoHeroBanner from "./HeroBanner";
import VideoCategoryTabs from "./VideoCategoryTabs";

/**
 * AiVideoList 메인 페이지 컴포넌트
 */
export default function AiVideoList() {
  // 1. 커스텀 훅을 통한 페이지네이션 및 이동 로직
  const { page, size, moveToList, moveToRead } = useCustomMove("/user/videos");

  // 2. 상태 관리
  const [activeTab, setActiveTab] = useState("전체");
  const [allLectures, setAllLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);

  // 3. 백엔드 데이터 로드 (Supabase 기반 API)
  useEffect(() => {
    const fetchLectures = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get("/api/video/list/all");

        // 🌟 [보정] 콘솔 데이터 확인 결과: res.data.data 가 실제 배열임
        const lectureArray =
          res.data?.data || (Array.isArray(res.data) ? res.data : []);
        setAllLectures(lectureArray);

        console.log("✅ 강의 데이터 로드 완료:", lectureArray.length, "건");
      } catch (err) {
        console.error("❌ 강의 목록 로드 실패:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLectures();
  }, []);

  // 4. 카테고리 필터링 로직
  const filteredVideos = useMemo(() => {
    if (!allLectures) return [];
    let list = [...allLectures];

    if (activeTab !== "전체") {
      // 과목명에 카테고리 키워드가 포함되어 있는지 확인 (수학, 회로, 제어 등)
      list = list.filter((v) =>
        (v.subject || "").includes(
          activeTab.replace("공학", "").replace("이론", ""),
        ),
      );
    }

    // 시청 가능한 강의(video_url이 있는 것)를 상단으로 정렬
    return list.sort((a, b) => {
      const aPlayable = a.video_url ? 1 : 0;
      const bPlayable = b.video_url ? 1 : 0;
      return bPlayable - aPlayable;
    });
  }, [allLectures, activeTab]);

  // 5. 페이지네이션 계산
  const total = filteredVideos.length;
  const totalPages = Math.ceil(total / size) || 1;
  const currentList = filteredVideos.slice((page - 1) * size, page * size);

  // 로딩 중 화면
  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-[#0047a5]" size={48} />
      </div>
    );

  return (
    <main className="mx-auto px-8 py-12 max-w-7xl w-[85%] font-body relative">
      {/* 상단 히어로 배너 영역 */}
      <VideoHeroBanner category={activeTab} total={total} />

      {/* 카테고리 탭 영역 */}
      <VideoCategoryTabs
        activeTab={activeTab}
        onTabChange={(id) => {
          setActiveTab(id);
          moveToList({ page: 1, size }); // 탭 변경 시 1페이지로 리셋
        }}
      />

      {/* 강의 카드 그리드 영역 */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-16">
        {currentList.length > 0 ? (
          currentList.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              onRead={moveToRead}
              onOpenModal={setSelectedVideo}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-20 text-gray-400 text-lg">
            선택한 카테고리에 해당하는 강의가 아직 없습니다. 😢
          </div>
        )}
      </section>

      {/* 하단 페이지네이션 네비게이션 */}
      {total > 0 && (
        <nav className="flex justify-center items-center gap-2">
          <button
            onClick={() => moveToList({ page: page - 1, size })}
            disabled={page <= 1}
            className="p-2 text-gray-500 disabled:opacity-30 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={24} />
          </button>

          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i + 1}
              onClick={() => moveToList({ page: i + 1, size })}
              className={`w-10 h-10 rounded-xl font-bold transition-all ${
                page === i + 1
                  ? "bg-[#0047a5] text-white shadow-lg scale-110"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => moveToList({ page: page + 1, size })}
            disabled={page >= totalPages}
            className="p-2 text-gray-500 disabled:opacity-30 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight size={24} />
          </button>
        </nav>
      )}

      {/* 상세보기 모달 */}
      <VideoDetailModal
        video={selectedVideo}
        onClose={() => setSelectedVideo(null)}
        onRead={moveToRead}
      />
    </main>
  );
}
