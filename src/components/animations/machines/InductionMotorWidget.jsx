const ROWS = [
  { key: "thumb", label: "엄지" },
  { key: "index", label: "검지" },
  { key: "middle", label: "중지" },
  { key: "ring", label: "약지" },
  { key: "pinky", label: "소지" },
];

/**
 * @param {{ values: Record<string, number>, onChange: (key: string, value: number) => void }} props
 */
export default function FingerSliders({ values, onChange }) {
  return (
    <div className="border-t border-neutral-200 bg-neutral-50/90 px-4 py-3 dark:border-neutral-700 dark:bg-neutral-900/80">
      <div className="mx-auto flex max-w-3xl flex-col gap-3">
        {ROWS.map(({ key, label }) => (
          <label
            key={key}
            className="flex items-center gap-3 text-sm text-neutral-800 dark:text-neutral-100"
          >
            <span className="w-10 shrink-0 font-medium">{label}</span>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={values[key] ?? 0}
              onChange={(e) => onChange(key, Number(e.target.value))}
              className="h-2 flex-1 cursor-pointer accent-teal-600 dark:accent-teal-400"
            />
            <span className="w-8 shrink-0 tabular-nums text-neutral-500 dark:text-neutral-400">
              {values[key] ?? 0}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
