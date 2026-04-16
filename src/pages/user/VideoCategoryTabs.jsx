const SUBJECT_ICONS = {
  기초수학: "📐",
  "회로이론 및 제어공학": "⚡",
  전기자기학: "🧲",
  전기기기: "🔌",
  전력공학: "🗼",
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
