const ROWS = [
  { key: "thumb", label: "엄지", flemingRole: "F" },
  { key: "index", label: "검지", flemingRole: "B" },
  { key: "middle", label: "중지", flemingRole: "I" },
  { key: "ring", label: "약지", flemingRole: null },
  { key: "pinky", label: "소지", flemingRole: null },
];

const FLEMING_ACCENT = {
  thumb: "accent-red-500",
  index: "accent-emerald-500",
  middle: "accent-blue-500",
  ring: "accent-slate-400",
  pinky: "accent-slate-400",
};

/**
 * @param {{
 *   values: Record<string, number>,
 *   onChange: (key: string, value: number) => void,
 *   variant?: "light" | "dark",
 *   layout?: "column" | "row",
 *   showFlemingHints?: boolean,
 *   className?: string,
 * }} props
 */
export default function FingerSliders({
  values,
  onChange,
  variant = "light",
  layout = "column",
  showFlemingHints = false,
  className = "",
}) {
  const isDark = variant === "dark";
  const wrap =
    layout === "row"
      ? "flex flex-wrap items-end justify-center gap-x-3 gap-y-2"
      : "mx-auto flex max-w-3xl flex-col gap-3";

  const shell = isDark
    ? "border-t border-slate-600/60 bg-slate-950/90 px-3 py-2"
    : "border-t border-neutral-200 bg-neutral-50/90 px-4 py-3 dark:border-neutral-700 dark:bg-neutral-900/80";

  const labelCls = isDark
    ? "text-slate-200"
    : "text-neutral-800 dark:text-neutral-100";

  return (
    <div className={`${shell} ${className}`}>
      {showFlemingHints && (
        <div
          className={
            isDark
              ? "mb-2 text-center text-[10px] text-slate-500"
              : "mb-2 text-center text-[10px] text-neutral-500 dark:text-neutral-400"
          }
        >
          슬라이더로 손가락을 굽혀 플레밍 자세(검지 B · 중지 I · 엄지 F)를 맞춰 보세요
        </div>
      )}
      <div className={wrap}>
        {ROWS.map(({ key, label, flemingRole }) => (
          <label
            key={key}
            className={
              layout === "row"
                ? `flex w-[min(104px,28vw)] flex-col gap-1 text-xs ${labelCls}`
                : `flex items-center gap-3 text-sm ${labelCls}`
            }
          >
            <span className="shrink-0 font-medium">
              {label}
              {showFlemingHints && flemingRole ? (
                <span
                  className={
                    isDark
                      ? ` ml-1 font-bold ${
                          flemingRole === "B"
                            ? "text-emerald-400"
                            : flemingRole === "I"
                              ? "text-blue-400"
                              : "text-red-400"
                        }`
                      : ` ml-1 font-bold ${
                          flemingRole === "B"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : flemingRole === "I"
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-red-600 dark:text-red-400"
                        }`
                  }
                >
                  ({flemingRole})
                </span>
              ) : null}
            </span>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={values[key] ?? 0}
              onChange={(e) => onChange(key, Number(e.target.value))}
              className={
                showFlemingHints
                  ? `h-2 w-full cursor-pointer ${FLEMING_ACCENT[key] ?? "accent-teal-600"} dark:${FLEMING_ACCENT[key] ?? "accent-teal-400"}`
                  : "h-2 flex-1 cursor-pointer accent-teal-600 dark:accent-teal-400"
              }
            />
            <span
              className={
                isDark
                  ? "w-8 shrink-0 tabular-nums text-slate-400"
                  : "w-8 shrink-0 tabular-nums text-neutral-500 dark:text-neutral-400"
              }
            >
              {values[key] ?? 0}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
