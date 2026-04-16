import apiClient from "@/api/core/apiClient";
import useCustomMove from "@/hooks/useCustomMove";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

// ✅ 하위 컴포넌트 불러오기
import DetailModal from "./DetailModal";
import HeroBanner from "./HeroBanner";
import VideoCard from "./VideoCard";
import VideoCategoryTabs from "./VideoCategoryTabs";

const LEGACY_SUBJECT_ALIAS = {
  전자기학: "전기자기학",
  회로이론: "회로이론 및 제어공학",
  제어공학: "회로이론 및 제어공학",
};

const normalizeSubject = (subjectRaw) => {
  const s = String(subjectRaw || "").trim();
  return LEGACY_SUBJECT_ALIAS[s] || s || "기타";
};

// 🌟 DB의 subject가 null이더라도 ID를 기반으로 카테고리를 유추하는 강력한 분류기
const getCategory = (video) => {
  // console.log("video:", video);
  // 🌟 [핵심 방어막] video 객체 자체가 없으면 에러 내지 말고 "기타" 반환!
  if (!video) return "기타";

  const subject = normalizeSubject(video.subject);
  if (subject && subject !== "기타") {
    return subject;
  }

  // 이제 안전하게 subject와 lecture_id를 추출할 수 있습니다.
  const idStr = String(video.lecture_id || video.id || "").toLowerCase();

  // 🌟 1. 전자기학 (우선순위 최상단으로 이동: vector_calculus 방어)
  if (
    subject.includes("전자기") ||
    idStr.includes("em_") ||
    idStr.includes("coulomb") ||
    idStr.includes("ampere") ||
    idStr.includes("poten") ||
    idStr.includes("flemming") ||
    idStr.includes("vector_calculus") // 전자기학 벡터 미적분
  )
    return "전기자기학";

  // 🌟 2. 전기기기
  if (
    subject.includes("기기") ||
    idStr.includes("motor") ||
    idStr.includes("homopolar") ||
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
    return "회로이론 및 제어공학";

  // 🌟 4. 전력공학
  if (
    subject.includes("전력") ||
    idStr.includes("power") ||
    idStr.includes("grid") ||
    idStr.includes("transmission") ||
    idStr.includes("distribution") ||
    idStr.includes("substation")
  )
    return "전력공학";

  // 🌟 5. 제어공학
  if (
    subject.includes("제어") ||
    idStr.includes("control") ||
    idStr.includes("laplace") ||
    idStr.includes("time_constant") ||
    idStr.includes("angular_velocity")
  )
    return "회로이론 및 제어공학";

  // 🌟 6. 기초 수학 (전자기학/회로 등에서 안 걸러진 나머지 일반 수학)
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
    return "기초수학";

  return "기타"; // 매칭되지 않는 영상
};

function sortVideosForList(list) {
  const getLectureOrder = (title) => {
    // 1) \b(단어 경계) 제거
    // 2) ^(시작점) 제거: "[기초수학] 1강" 처럼 앞에 글자가 있어도 번호를 찾도록 유연화
    const m = String(title || "").match(/(\d+)\s*강/);
    return m ? parseInt(m[1], 10) : null;
  };

  const getCreatedAtMs = (v) => new Date(v?.created_at || 0).getTime();
  const getSubjectKey = (v) => String(v?.subject || "").trim();
  const getTitleKey = (v) => String(v?.title || "").trim();

  return [...list].sort((a, b) => {
    // ✅ 기준1-1) subject
    const sa = getSubjectKey(a);
    const sb = getSubjectKey(b);
    if (sa !== sb) return sa.localeCompare(sb, "ko");

    // ✅ 기준1-2) title (N강 우선 정렬)
    const oa = getLectureOrder(a?.title);
    const ob = getLectureOrder(b?.title);

    // 1) 둘 다 'N강' 번호가 있는 경우 -> 강 번호 오름차순 (1강 -> 2강 -> 3강)
    if (oa !== null && ob !== null) {
      if (oa !== ob) return oa - ob;
      // 강 번호가 완전히 똑같다면 최신 업로드 순으로 타이브레이크
      return getCreatedAtMs(b) - getCreatedAtMs(a);
    }

    // 2) 한쪽만 'N강' 번호가 있는 경우 -> 번호가 있는 것을 무조건 앞으로 배치
    if (oa !== null && ob === null) return -1;
    if (oa === null && ob !== null) return 1;

    // 3) 둘 다 번호가 없는 경우 (예: OT, 공지사항) -> title 사전순, 같으면 최신 업로드 순
    const ta = getTitleKey(a);
    const tb = getTitleKey(b);
    if (ta !== tb) return ta.localeCompare(tb, "ko");
    return getCreatedAtMs(b) - getCreatedAtMs(a);
  });
}

function sortVideosByCreatedAtDesc(list) {
  const getCreatedAtMs = (v) => new Date(v?.created_at || 0).getTime();
  return [...list].sort((a, b) => getCreatedAtMs(b) - getCreatedAtMs(a));
}

export default function AiVideoList() {
  const { page, size, moveToList, moveToRead } = useCustomMove("/user/videos");

  const [activeTab, setActiveTab] = useState("전체");
  const [allLectures, setAllLectures] = useState([]);
  const [subjectTabs, setSubjectTabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);

  // 1. 과목 탭 로드 (신규 API)
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await apiClient.get("/api/lectures/subjects");
        const rows = Array.isArray(res.data) ? res.data : [];
        const normalized = rows
          .map((s) => normalizeSubject(s))
          .filter((s, idx, arr) => s && s !== "기타" && arr.indexOf(s) === idx);
        setSubjectTabs(normalized);
      } catch (err) {
        console.warn("과목 목록 로드 실패(기본 탭 사용):", err);
        setSubjectTabs([
          "기초수학",
          "회로이론 및 제어공학",
          "전기자기학",
          "전기기기",
          "전력공학",
        ]);
      }
    };
    fetchSubjects();
  }, []);

  // 2. 전체 목록 1회 로드 — 탭 전환은 클라이언트에서 필터
  useEffect(() => {
    const fetchLectures = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get("/api/video/list/all");

        const rawArray =
          res.data?.data || (Array.isArray(res.data) ? res.data : []);

        const categorizedArray = rawArray.map((video) => ({
          ...video,
          subject: normalizeSubject(video.subject),
          category: getCategory(video),
        }));
        setAllLectures(categorizedArray);
      } catch (err) {
        console.error("❌ 강의 목록 로드 실패:", err);
        setAllLectures([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLectures();
  }, []);

  // 3. 활성 탭 ↔ category 일치로만 목록 구성(연동 보장)
  const filteredVideos = useMemo(() => {
    if (!allLectures || allLectures.length === 0) return [];

    if (activeTab === "전체") {
      // ✅ 전체보기: 업로드(생성)일 최신순 정렬
      return sortVideosByCreatedAtDesc(allLectures);
    }

    const filtered = allLectures.filter((v) => v.category === activeTab);
    return sortVideosForList(filtered);
  }, [allLectures, activeTab]);

  // 4. 페이지네이션 범위 계산
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
        categories={[
          { id: "전체", label: "전체보기", icon: "🌟" },
          ...subjectTabs.map((s) => ({ id: s, label: s })),
        ]}
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
                key={video.lecture_id || video.id}
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
