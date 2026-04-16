import { useEffect, useMemo, useState } from "react";

function buildWavePoints({ width, height, cycles, amplitude, mode, phase }) {
  const centerY = height / 2;
  const points = [];
  const n = 220;
  for (let i = 0; i <= n; i += 1) {
    const x = (i / n) * width;
    const t = (i / n) * cycles * Math.PI * 2 + phase;
    const input = Math.sin(t) * amplitude;
    const y =
      mode === "ac" ? centerY - input : centerY - Math.abs(input) * 0.95;
    points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return points.join(" ");
}

export default function BridgeRectifierFlowCompareWidget() {
  const [freq, setFreq] = useState(1.2);
  const [amp, setAmp] = useState(52);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    let raf = 0;
    let prev = performance.now();
    const loop = (now) => {
      const dt = (now - prev) / 1000;
      prev = now;
      setPhase((p) => p + dt * freq * Math.PI * 2);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [freq]);

  const isPositiveHalf = Math.sin(phase) >= 0;

  const acPoints = useMemo(
    () =>
      buildWavePoints({
        width: 640,
        height: 170,
        cycles: 2.3,
        amplitude: amp,
        mode: "ac",
        phase,
      }),
    [amp, phase],
  );

  const dcPoints = useMemo(
    () =>
      buildWavePoints({
        width: 640,
        height: 170,
        cycles: 2.3,
        amplitude: amp,
        mode: "dc",
        phase,
      }),
    [amp, phase],
  );

  const diodeState = isPositiveHalf
    ? { on: ["D1", "D3"], off: ["D2", "D4"] }
    : { on: ["D2", "D4"], off: ["D1", "D3"] };

  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-bold text-slate-800">
        Bridge Rectifier 2D Flow Compare
      </h3>
      <p className="mt-1 text-sm text-slate-500">
        반주기마다 통전 다이오드 쌍이 바뀌며, 출력은 절대값 형태의 맥류 DC가 됩니다.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 p-3">
          <div className="mb-2 text-sm font-semibold text-slate-700">AC Input</div>
          <svg viewBox="0 0 640 170" className="w-full rounded bg-slate-50">
            <line x1="0" y1="85" x2="640" y2="85" stroke="#cbd5e1" strokeDasharray="4 4" />
            <polyline fill="none" stroke="#0ea5e9" strokeWidth="3" points={acPoints} />
          </svg>
        </div>

        <div className="rounded-xl border border-slate-200 p-3">
          <div className="mb-2 text-sm font-semibold text-slate-700">
            DC Output (Full-wave)
          </div>
          <svg viewBox="0 0 640 170" className="w-full rounded bg-slate-50">
            <line x1="0" y1="85" x2="640" y2="85" stroke="#cbd5e1" strokeDasharray="4 4" />
            <polyline fill="none" stroke="#ef4444" strokeWidth="3" points={dcPoints} />
          </svg>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="mb-2 text-sm font-semibold text-slate-700">Diode Conduction</div>
        <div className="flex flex-wrap gap-2 text-sm">
          {["D1", "D2", "D3", "D4"].map((d) => {
            const active = diodeState.on.includes(d);
            return (
              <span
                key={d}
                className={`rounded-full px-3 py-1 font-semibold ${
                  active
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-200 text-slate-500"
                }`}
              >
                {d} {active ? "ON" : "OFF"}
              </span>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-slate-500">
          현재 반주기: {isPositiveHalf ? "양(+) 반주기" : "음(-) 반주기"}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="text-sm text-slate-700">
          주파수: <span className="font-semibold">{freq.toFixed(1)} Hz</span>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.1"
            value={freq}
            onChange={(e) => setFreq(Number(e.target.value))}
            className="mt-2 w-full"
          />
        </label>
        <label className="text-sm text-slate-700">
          입력 진폭: <span className="font-semibold">{amp}</span>
          <input
            type="range"
            min="20"
            max="70"
            step="1"
            value={amp}
            onChange={(e) => setAmp(Number(e.target.value))}
            className="mt-2 w-full"
          />
        </label>
      </div>
    </div>
  );
}
