const SUBJECT_ICONS = {
  기초수학: "📐",
  "회로이론 및 제어공학": "⚡",
  전기자기학: "🧲",
  전기기기: "🔌",
  전력공학: "🗼",
};

export const CATEGORY_DATA = {
  전체: {
    title: "전체 강의",
    desc: "최신 업로드 강의부터 빠르게 둘러보고 학습을 시작하세요.",
    bgIcon: "🌟",
  },
  기초수학: {
    title: "기초수학",
    desc: "전기기사/전기공학 학습에 필요한 수학 기반을 빠르게 다집니다.",
    bgIcon: SUBJECT_ICONS["기초수학"],
  },
  "회로이론 및 제어공학": {
    title: "회로이론 및 제어공학",
    desc: "옴의 법칙부터 라플라스 변환까지, 회로와 제어의 핵심을 한 번에 정리합니다.",
    bgIcon: SUBJECT_ICONS["회로이론 및 제어공학"],
  },
  전기자기학: {
    title: "전기자기학",
    desc: "벡터 해석과 장(場)의 직관을 문제풀이에 연결합니다.",
    bgIcon: SUBJECT_ICONS["전기자기학"],
  },
  전기기기: {
    title: "전기기기",
    desc: "직류기·변압기·유도전동기 등 기기 파트를 시각적으로 이해합니다.",
    bgIcon: SUBJECT_ICONS["전기기기"],
  },
  전력공학: {
    title: "전력공학",
    desc: "발전·송전·배전 흐름을 시험 관점에서 빠르게 정리합니다.",
    bgIcon: SUBJECT_ICONS["전력공학"],
  },
  Vision: {
    title: "Vision",
    desc: "AI Company의 비전과 앞으로의 기능 확장 방향을 확인하세요.",
    bgIcon: "🚀",
  },
  기타: {
    title: "기타",
    desc: "분류되지 않은 강의들을 모아 확인할 수 있습니다.",
    bgIcon: "📚",
  },
};

/**
 * @param {string} activeTab - 현재 활성화된 카테고리 ID
 * @param {function} onTabChange - 탭 클릭 시 실행될 핸들러 함수
 * @param {Array<{id:string,label:string}>} categories - 동적 카테고리 목록
 */
export default function VideoCategoryTabs({
  activeTab,
  onTabChange,
  categories = [],
}) {
  const normalizedCategories =
    categories.length > 0
      ? categories
      : [{ id: "전체", label: "전체보기", icon: "🌟" }];

  return (
    <div className="flex flex-wrap items-center justify-start gap-4 mb-10">
      {normalizedCategories.map((cat) => {
        const isActive = activeTab === cat.id;
        const icon =
          cat.icon || SUBJECT_ICONS[cat.id] || SUBJECT_ICONS[cat.label] || "📘";

        return (
          <button
            key={cat.id}
            onClick={() => onTabChange(cat.id)}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all shadow-sm
              ${
                isActive
                  ? "bg-[#0047a5] text-white shadow-md scale-105"
                  : "bg-[#f3f4f6] text-gray-700 hover:bg-gray-200 active:scale-95"
              }
            `}
          >
            <span className="text-xl" role="img" aria-label={cat.label}>
              {icon}
            </span>
            <span className="text-sm md:text-base">{cat.label}</span>
          </button>
        );
      })}
    </div>
  );
}
