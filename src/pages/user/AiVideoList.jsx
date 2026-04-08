import apiClient from "@/api/core/apiClient";
import useCustomMove from "@/hooks/useCustomMove";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Lock,
  Play,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

// 🌟 [핵심] 이전 해시/영문 ID를 직관적인 새 ID로 변환하는 매핑 테이블 (하위 호환성 유지)
const ID_MAPPING = {
  "0439b5168355bedd244f2c4cbd79c82f": "8_time_constant",
  "1234qwer": "21_control_test",
  "1da7f54684d76e361736580a26e6917c": "207_cho_hw_cheer",
  "201092af306ff8cb381808e4c3f45e0c": "13_vector_dot_product",
  "30d2bd6d1675fb17fe237d8c9d930413": "14_vector_cross_product",
  "5f16ede4e7730bdbf86da518cfd232e9": "25_circuit_test_video",
  "605e4d59a8fdcfe8f914734370c726f4": "18_angular_velocity",
  "61b1ec56bcd7e87535d18c40bb9afb21": "8_parabola_line_intersection",
  "62069c25429c16e898888d5611eb67b4": "7_line_intersection",
  "8fc05f0f6c31f19deeb976cb2b1562cf": "11_trig_function_2",
  a778e615bf667e6db830b498baa5ec66: "16_partial_derivative",
  acf4500a94d8492cde7139e71760ff71: "25_control_test_video",
  c3d27bab5e1cf6ae9f07f70ae08c1e26: "10_trig_function_1",
  c44dc0cd81fbb02320299a7bff062e4d: "15_derivative",
  e935dc2d2e592a79688c5f40da5fbe23: "9_perfect_square",
};

const getCategory = (lecture) => {
  const subject = lecture.subject || "";
  if (subject.includes("수학")) return "기초 수학";
  if (subject.includes("회로")) return "회로이론";
  if (subject.includes("전자기")) return "전자기학";
  if (subject.includes("제어")) return "제어공학";
  if (subject.includes("AI") || subject.includes("Vision")) return "Vision";
  return "기타";
};

const CATEGORY_INFO = {
  전체: {
    title: "알기 쉬운 AI 영상 강의",
    desc: "전기 공학의 기초부터 실무 응용까지, 전문가가 직접 가르치는 커리큘럼입니다.",
    bgIcon: "A",
  },
  "기초 수학": {
    title: "기초 수학 마스터 클래스",
    desc: "전기 공학 계산의 뼈대가 되는 핵심 수학 이론을 쉽게 풀어드립니다.",
    bgIcon: "∑",
  },
  회로이론: {
    title: "회로이론 완벽 정복",
    desc: "전압, 전류, 저항의 관계부터 회로망 해석까지 한 번에 끝내는 코스입니다.",
    bgIcon: "Ω",
  },
  전자기학: {
    title: "전자기학 핵심 요약",
    desc: "전기장과 자기장의 원리를 시각화 자료를 통해 직관적으로 이해합니다.",
    bgIcon: "🧲",
  },
  제어공학: {
    title: "제어공학 기초와 실무",
    desc: "동적 특성 분석과 피드백 제어 시스템 설계 방법을 배웁니다.",
    bgIcon: "⚙️",
  },
  Vision: {
    title: "머신 비전 & AI",
    desc: "최신 AI 기술을 활용한 이미지 프로세싱의 기초를 다집니다.",
    bgIcon: "👁️",
  },
};

const CATEGORIES = [
  { id: "전체", label: "전체보기", icon: "🌟" },
  { id: "기초 수학", label: "기초 수학", icon: "📐" },
  { id: "회로이론", label: "회로이론", icon: "⚡" },
  { id: "전자기학", label: "전자기학", icon: "🧲" },
  { id: "제어공학", label: "제어공학", icon: "⚙️" },
  { id: "Vision", label: "Vision", icon: "🚀" },
];

// --- Sub Components ---
const HeroBanner = ({ category, total }) => {
  const info = CATEGORY_INFO[category] || CATEGORY_INFO["전체"];
  return (
    <div className="bg-[#0047a5] rounded-2xl p-10 md:p-14 mb-10 text-white relative overflow-hidden shadow-lg">
      <div className="absolute right-10 top-1/2 -translate-y-1/2 text-[180px] opacity-10 font-serif font-bold pointer-events-none select-none">
        {info.bgIcon}
      </div>
      <div className="relative z-10 max-w-2xl">
        <h1 className="text-4xl font-extrabold mb-4 tracking-tight">
          {info.title}
        </h1>
        <p className="text-blue-100 text-lg mb-8 leading-relaxed opacity-90">
          {info.desc}
        </p>
        <div className="flex items-center gap-3">
          <span className="bg-white/20 px-4 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm">
            총 {total}개의 강의
          </span>
        </div>
      </div>
    </div>
  );
};

const VideoCard = ({ video, onRead, onOpenModal }) => {
  // 🌟 백엔드 필드명(video_url)에 맞춰 잠금 로직 수정
  const isLocked = !video.video_url || video.video_url === "";

  // 🌟 lecture_id가 있으면 그것을, 없으면 id를 사용
  const targetId = video.lecture_id || video.id;
  const normalizedId = ID_MAPPING[targetId] || targetId;

  return (
    <article
      className={`flex flex-col bg-white rounded-xl overflow-hidden border border-gray-100 transition-all duration-300 ${isLocked ? "opacity-60" : "shadow-sm hover:shadow-xl group cursor-pointer"}`}
      onClick={() => !isLocked && onRead(normalizedId)}
    >
      <div
        className={`relative h-56 ${isLocked ? "bg-gray-200 flex items-center justify-center" : "overflow-hidden bg-gray-100"}`}
      >
        {isLocked ? (
          <Lock className="text-gray-400" size={48} />
        ) : (
          <>
            {/* 🌟 video.thumbnail이 올바르게 들어오는지 확인 */}
            <img
              src={
                video.thumbnail ||
                "https://placehold.co/400x300/e2e8f0/94a3b8?text=No+Image"
              }
              alt={video.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center shadow-2xl scale-75 group-hover:scale-100 transition-transform">
                <Play className="text-[#0047a5] fill-current ml-1" size={28} />
              </div>
            </div>
          </>
        )}
      </div>
      <div className="p-8 flex flex-col flex-grow">
        <span className="font-bold text-xs uppercase tracking-widest mb-2 block text-[#0047a5]">
          {video.subject || "영상 강의"}
        </span>
        <h2 className="text-2xl font-bold text-gray-900 mb-3 leading-tight line-clamp-2 min-h-[3.5rem]">
          {video.title}
        </h2>
        <p className="text-gray-500 text-base mb-8 font-medium line-clamp-2">
          {video.description}
        </p>
        <div className="mt-auto flex items-center justify-between">
          {isLocked ? (
            <button
              disabled
              className="w-full py-3 bg-gray-100 text-gray-400 text-lg font-bold rounded-xl cursor-not-allowed"
            >
              준비 중
            </button>
          ) : (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenModal(video);
                }}
                className="text-[#0047a5] font-bold text-lg hover:underline"
              >
                상세보기
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRead(normalizedId);
                }}
                className="bg-[#e5edff] text-[#0047a5] text-lg px-8 py-3 rounded-xl font-bold hover:bg-[#0047a5] hover:text-white transition-colors"
              >
                시청하기
              </button>
            </>
          )}
        </div>
      </div>
    </article>
  );
};

// --- Main Page Component ---
export default function VideoListPage() {
  const { page, size, moveToList, moveToRead } = useCustomMove("/user/videos");
  const [activeTab, setActiveTab] = useState("전체");
  const [allLectures, setAllLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);

  // 1. 백엔드에서 데이터 로드
  useEffect(() => {
    const fetchLectures = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get("/api/video/list/all");

        // 🌟 [수정 포인트] 콘솔 로그를 보면 실제 배열은 res.data.data 에 들어있습니다.
        // res.data 가 배열인지 확인 후 처리하는 방어 로직 추가
        const lectureArray = Array.isArray(res.data)
          ? res.data
          : res.data?.data || [];

        setAllLectures(lectureArray);
        console.log("강의 로드 완료:", lectureArray.length, "건");
      } catch (err) {
        console.error("강의 목록 로드 실패:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLectures();
  }, []);

  const filteredVideos = useMemo(() => {
    // 🌟 데이터가 없을 경우 빈 배열 반환
    if (!allLectures || allLectures.length === 0) return [];

    let list = allLectures.map((v) => ({
      ...v,
      category: getCategory(v),
    }));

    if (activeTab !== "전체") {
      list = list.filter((v) => v.category === activeTab);
    }

    // 🌟 정렬: 시청 가능한 것 먼저, 그 다음 제목순
    return list.sort((a, b) => {
      const aPlayable = a.video_url ? 1 : 0;
      const bPlayable = b.video_url ? 1 : 0;
      if (aPlayable !== bPlayable) return bPlayable - aPlayable;
      return (a.title || "").localeCompare(b.title || "");
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
      <HeroBanner category={activeTab} total={total} />

      <div className="flex flex-wrap items-center justify-start gap-4 mb-10">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setActiveTab(cat.id);
              moveToList({ page: 1, size });
            }}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all shadow-sm ${activeTab === cat.id ? "bg-[#0047a5] text-white scale-105" : "bg-[#f3f4f6] text-gray-700 hover:bg-gray-200"}`}
          >
            <span className="text-xl">{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-16">
        {currentList.map((video) => (
          <VideoCard
            key={video.id}
            video={video}
            onRead={moveToRead}
            onOpenModal={setSelectedVideo}
          />
        ))}
      </section>

      {total > 0 && (
        <nav className="flex justify-center items-center gap-2">
          <button
            onClick={() => moveToList({ page: page - 1, size })}
            disabled={page <= 1}
            className="p-2 text-gray-500 disabled:opacity-30"
          >
            <ChevronLeft />
          </button>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i + 1}
              onClick={() => moveToList({ page: i + 1, size })}
              className={`w-10 h-10 rounded-xl font-bold ${page === i + 1 ? "bg-[#0047a5] text-white shadow-lg" : "text-gray-600 hover:bg-gray-100"}`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => moveToList({ page: page + 1, size })}
            disabled={page >= totalPages}
            className="p-2 text-gray-500 disabled:opacity-30"
          >
            <ChevronRight />
          </button>
        </nav>
      )}

      {/* 모달 창 */}
      {selectedVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setSelectedVideo(null)}
        >
          <div
            className="bg-white rounded-2xl p-8 max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between mb-4">
              <h2 className="text-3xl font-extrabold">{selectedVideo.title}</h2>
              <button onClick={() => setSelectedVideo(null)}>
                <X size={32} />
              </button>
            </div>
            <p className="text-lg text-gray-600 mb-6">
              {selectedVideo.description}
            </p>
            <button
              onClick={() => {
                const id = selectedVideo.lecture_id || selectedVideo.id;
                moveToRead(ID_MAPPING[id] || id);
              }}
              className="w-full py-4 bg-[#0047a5] text-white font-bold rounded-xl"
            >
              학습 시작하기
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
