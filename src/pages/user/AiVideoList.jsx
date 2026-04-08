import apiClient from "@/api/core/apiClient";
import useCustomMove from "@/hooks/useCustomMove";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

// ✅ 하위 컴포넌트 불러오기 (반드시 같은 폴더에 해당 파일들이 있어야 합니다)
import DetailModal from "./DetailModal";
import HeroBanner from "./HeroBanner";
import VideoCard from "./VideoCard";
import VideoCategoryTabs from "./VideoCategoryTabs"; // 🌟 누락되었던 탭 컴포넌트 Import 추가

// 🌟 DB의 subject가 null이더라도 ID를 기반으로 카테고리를 유추하는 강력한 분류기
const getCategory = (video) => {
  const subject = video.subject || "";
  const idStr = String(video.lecture_id || video.id || "").toLowerCase();

  if (
    subject.includes("수학") ||
    idStr.includes("math") ||
    idStr.includes("derivative") ||
    idStr.includes("square") ||
    idStr.includes("trig") ||
    idStr.includes("vector") ||
    idStr.includes("parabola") ||
    idStr.includes("intersection")
  )
    return "기초 수학";

  if (
    subject.includes("회로") ||
    idStr.includes("circuit") ||
    idStr.includes("ohm") ||
    idStr.includes("voltage") ||
    idStr.includes("reactance")
  )
    return "회로이론";

  if (
    subject.includes("전자기") ||
    idStr.includes("em_") ||
    idStr.includes("coulomb") ||
    idStr.includes("ampere") ||
    idStr.includes("poten")
  )
    return "전자기학";

  if (
    subject.includes("제어") ||
    idStr.includes("control") ||
    idStr.includes("laplace") ||
    idStr.includes("time_constant") ||
    idStr.includes("angular_velocity")
  )
    return "제어공학";

  if (
    subject.includes("Vision") ||
    subject.includes("AI") ||
    idStr.includes("vision")
  )
    return "Vision";

  return "기타"; // 매칭되지 않는 잉여 영상
};

export default function AiVideoList() {
  const { page, size, moveToList, moveToRead } = useCustomMove("/user/videos");

  const [activeTab, setActiveTab] = useState("전체");
  const [allLectures, setAllLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);

  // 1. 데이터 페칭 및 카테고리 자동 분류
  useEffect(() => {
    const fetchLectures = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get("/api/video/list/all");

        const rawArray =
          res.data?.data || (Array.isArray(res.data) ? res.data : []);

        // 🌟 데이터가 들어올 때 모든 영상에 category 속성을 강제로 부여합니다.
        const categorizedArray = rawArray.map((video) => ({
          ...video,
          category: getCategory(video),
        }));

        setAllLectures(categorizedArray);
        console.log("✅ 카테고리 분류 완료 데이터:", categorizedArray);
      } catch (err) {
        console.error("❌ 강의 목록 로드 실패:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLectures();
  }, []);

  // 2. 선택된 탭에 맞게 목록 필터링
  const filteredVideos = useMemo(() => {
    if (!allLectures || allLectures.length === 0) return [];
    let list = [...allLectures];

    // 🌟 위에서 부여한 category 속성과 현재 누른 탭 이름이 일치하는지만 검사
    if (activeTab !== "전체") {
      list = list.filter((v) => v.category === activeTab);
    }

    // 영상이 있는(시청 가능한) 강의를 먼저 보여주도록 정렬
    return list.sort((a, b) => {
      const aPlayable = a.video_url ? 1 : 0;
      const bPlayable = b.video_url ? 1 : 0;
      return bPlayable - aPlayable;
    });
  }, [allLectures, activeTab]);

  // 3. 페이지네이션 계산
  const total = filteredVideos.length;
  const totalPages = Math.ceil(total / size) || 1;
  const currentList = filteredVideos.slice((page - 1) * size, page * size);

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-[#0047a5]" size={48} />
      </div>
    );

  return (
    <main className="mx-auto px-8 py-12 max-w-7xl w-[85%] font-body relative">
      {/* 상단 다이나믹 배너 */}
      <HeroBanner category={activeTab} total={total} />

      {/* 🌟 카테고리 탭 컴포넌트 렌더링 */}
      <VideoCategoryTabs
        activeTab={activeTab}
        onTabChange={(id) => {
          setActiveTab(id);
          moveToList({ page: 1, size }); // 탭을 바꾸면 1페이지로 돌아가도록 설정
        }}
      />

      {/* 비디오 카드 그리드 */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-16 mt-8">
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

      {/* 페이지네이션 네비게이션 */}
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

      {/* 상세 보기 모달창 */}
      <DetailModal
        video={selectedVideo}
        onClose={() => setSelectedVideo(null)}
        onRead={moveToRead}
      />
    </main>
  );
}
