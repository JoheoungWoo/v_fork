import { Settings } from "lucide-react";

/**
 * 카테고리 설정 데이터
 */
const CATEGORIES = [
  { id: "전체", label: "전체보기", icon: "🌟" },
  { id: "기초 수학", label: "기초 수학", icon: "📐" },
  { id: "회로이론", label: "회로이론", icon: "⚡" },
  { id: "전자기학", label: "전자기학", icon: "🧲" },
  { id: "전기기기", label: "전기기기", icon: <Settings /> }, // 👈 이 줄을 추가!
  { id: "제어공학", label: "제어공학", icon: "⚙️" },
  { id: "Vision", label: "Vision", icon: "🚀" },
];

/**
 * @param {string} activeTab - 현재 활성화된 카테고리 ID
 * @param {function} onTabChange - 탭 클릭 시 실행될 핸들러 함수
 */
export default function VideoCategoryTabs({ activeTab, onTabChange }) {
  return (
    <div className="flex flex-wrap items-center justify-start gap-4 mb-10">
      {CATEGORIES.map((cat) => {
        const isActive = activeTab === cat.id;

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
              {cat.icon}
            </span>
            <span className="text-sm md:text-base">{cat.label}</span>
          </button>
        );
      })}
    </div>
  );
}
