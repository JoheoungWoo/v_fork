import apiClient from "@/api/core/apiClient";
import useCustomMove from "@/hooks/useCustomMove";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

// ✅ 하위 컴포넌트 불러오기
import DetailModal from "./DetailModal";
import HeroBanner from "./HeroBanner";
import VideoCard from "./VideoCard";
import VideoCategoryTabs from "./VideoCategoryTabs";

// 🌟 DB의 subject가 null이더라도 ID를 기반으로 카테고리를 유추하는 강력한 분류기
const getCategory = (video) => {
  // console.log("video:", video);
  // 🌟 [핵심 방어막] video 객체 자체가 없으면 에러 내지 말고 "기타" 반환!
  if (!video) return "기타";

  // 이제 안전하게 subject와 lecture_id를 추출할 수 있습니다.
  const subject = video.subject || "";
  const idStr = String(video.lecture_id || video.id || "").toLowerCase();

  // 🌟 1. 전자기학 (우선순위 최상단으로 이동: vector_calculus 방어)
  if (
    subject.includes("전자기") ||
    idStr.includes("em_") ||
    idStr.includes("coulomb") ||
    idStr.includes("ampere") ||
    idStr.includes("poten") ||
    idStr.includes("vector_calculus") // 전자기학 벡터 미적분
  )
    return "전자기학";

  // 🌟 2. 전기기기
  if (
    subject.includes("기기") ||
    idStr.includes("motor") ||
    idStr.includes("machine") ||
    idStr.includes("induction") ||
    idStr.includes("generator") ||
    idStr.includes("transformer")
  )
    return "전기기기";

  // 🌟 3. 회로이론
  if (
    subject.includes("회로") ||
    idStr.includes("circuit") ||
    idStr.includes("ohm") ||
    idStr.includes("voltage") ||
    idStr.includes("reactance")
  )
    return "회로이론";

  // 🌟 4. 제어공학
  if (
    subject.includes("제어") ||
    idStr.includes("control") ||
    idStr.includes("laplace") ||
    idStr.includes("time_constant") ||
    idStr.includes("angular_velocity")
  )
    return "제어공학";

  // 🌟 5. 기초 수학 (전자기학/회로 등에서 안 걸러진 나머지 일반 수학)
  if (
    subject.includes("수학") ||
    idStr.includes("math") ||
    idStr.includes("derivative") ||
    idStr.includes("square") ||
    idStr.includes("trig") ||
    idStr.includes("vector") || // 일반 수학용 벡터
    idStr.includes("parabola") ||
    idStr.includes("intersection") ||
    idStr.includes("calculus")
  )
    return "기초 수학";

  // 🌟 6. Vision
  if (
    subject.includes("Vision") ||
    subject.includes("AI") ||
    idStr.includes("vision")
  )
    return "Vision";

  return "기타"; // 매칭되지 않는 영상
};

export default function AiVideoList() {
  const { page, size, moveToList, moveToRead } = useCustomMove("/user/videos");

  const [activeTab, setActiveTab] = useState("전체");
  const [allLectures, setAllLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);

  // 1. 백엔드에서 데이터 페칭 및 카테고리 속성 부여
  useEffect(() => {
    const fetchLectures = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get("/api/video/list/all");

        // 백엔드 응답이 res.data.data 인지 res.data 인지 안전하게 파싱
        const rawArray =
          res.data?.data || (Array.isArray(res.data) ? res.data : []);

        const categorizedArray = rawArray.map((video) => ({
          ...video,
          category: getCategory(video),
        }));
        console.log("catotried data:", categorizedArray);
        setAllLectures(categorizedArray);
      } catch (err) {
        console.error("❌ 강의 목록 로드 실패:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLectures();
  }, []);

  // 2. 현재 활성화된 탭(activeTab)에 따라 필터링 및 정렬
  const filteredVideos = useMemo(() => {
    if (!allLectures || allLectures.length === 0) return [];

    if (activeTab === "전체") {
      // 🌟 전체 탭: 백엔드에서 넘겨준 순서(최신순) 그대로 반환
      return [...allLectures];
    }

    // 🌟 특정 카테고리 탭: 필터링 후 lecture_id의 숫자 기준으로 오름차순 정렬
    const filtered = allLectures.filter((v) => v.category === activeTab);

    return filtered.sort((a, b) => {
      const getOrder = (title) => {
        const match = title.match(/^(\d+)\s*강/);
        return match ? parseInt(match[1], 10) : 9999;
      };

      return getOrder(a.title) - getOrder(b.title);
    });
  }, [allLectures, activeTab]);

  // 3. 페이지네이션 범위 계산
  const total = filteredVideos.length;
  const totalPages = Math.ceil(total / size) || 1;
  const currentList = filteredVideos.slice((page - 1) * size, page * size);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-[#0047a5]" size={48} />
      </div>
    );
  }

  return (
    <main className="mx-auto px-8 py-12 max-w-7xl w-[85%] font-body relative">
      {/* 상단 다이나믹 배너 */}
      <HeroBanner category={activeTab} total={total} />

      {/* 카테고리 탭 컴포넌트 */}
      <VideoCategoryTabs
        activeTab={activeTab}
        onTabChange={(id) => {
          setActiveTab(id);
          moveToList({ page: 1, size }); // 탭 변경 시 무조건 1페이지로 강제 이동
        }}
      />

      {/* 비디오 카드 그리드 영역 */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-16 mt-8">
        {currentList.length > 0 ? (
          currentList.map((video) => {
            // console.log("video설명", video);
            return (
              <VideoCard
                key={video.lecture_id}
                video={video}
                onRead={moveToRead}
                onOpenModal={setSelectedVideo}
              />
            );
          })
        ) : (
          <div className="col-span-full text-center py-20 text-gray-400 text-lg bg-gray-50 rounded-2xl border border-gray-100">
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

      {/* 상세 보기 모달창 */}
      <DetailModal
        video={selectedVideo}
        onClose={() => setSelectedVideo(null)}
        onRead={moveToRead}
      />
    </main>
  );
}
