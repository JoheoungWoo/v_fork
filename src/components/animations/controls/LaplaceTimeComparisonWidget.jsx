import { useMemo, useState } from "react";

function toPath(points, width, height, xMin, xMax, yMin, yMax) {
  const sx = (x) => ((x - xMin) / (xMax - xMin)) * width;
  const sy = (y) => height - ((y - yMin) / (yMax - yMin)) * height;
  return points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${sx(p.x).toFixed(2)} ${sy(p.y).toFixed(2)}`)
    .join(" ");
}

export default function LaplaceTimeComparisonWidget() {
  const [signalType, setSignalType] = useState("damped_sine");
  const [sigma, setSigma] = useState(0.6);
  const [omega, setOmega] = useState(3.2);

  const { timePoints, yMin, yMax, poles, formulaTime, formulaLaplace, subtitle } = useMemo(() => {
    const tMax = 8;
    const n = 260;
    const pts = [];
    let minY = Infinity;
    let maxY = -Infinity;
    let outPoles = [];
    let fTime = "";
    let fLap = "";
    let desc = "";

    for (let i = 0; i < n; i++) {
      const t = (i / (n - 1)) * tMax;
      let y = 0;
      if (signalType === "step") {
        y = 1;
        outPoles = [{ re: 0, im: 0 }];
        fTime = "f(t) = u(t)";
        fLap = "F(s) = 1 / s";
        desc = "계단 입력은 s=0 단일 극점을 가집니다.";
      } else if (signalType === "exp") {
        y = Math.exp(-sigma * t);
        outPoles = [{ re: -sigma, im: 0 }];
        fTime = `f(t) = e^{-(${sigma.toFixed(2)})t} u(t)`;
        fLap = `F(s) = 1 / (s + ${sigma.toFixed(2)})`;
        desc = "감쇠가 커질수록 극점이 좌측으로 이동하고 시간응답이 빨리 0으로 수렴합니다.";
      } else {
        y = Math.exp(-sigma * t) * Math.sin(omega * t);
        outPoles = [
          { re: -sigma, im: omega },
          { re: -sigma, im: -omega },
        ];
        fTime = `f(t) = e^{-(${sigma.toFixed(2)})t} sin(${omega.toFixed(2)}t) u(t)`;
        fLap = `F(s) = ${omega.toFixed(2)} / ((s + ${sigma.toFixed(2)})^2 + ${omega.toFixed(2)}^2)`;
        desc = "복소켤레 극점의 허수부가 진동 주파수, 실수부가 감쇠 속도를 결정합니다.";
      }
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
      pts.push({ x: t, y });
    }

    return {
      timePoints: pts,
      yMin: Math.min(-1.2, minY - 0.15),
      yMax: Math.max(1.2, maxY + 0.15),
      poles: outPoles,
      formulaTime: fTime,
      formulaLaplace: fLap,
      subtitle: desc,
    };
  }, [signalType, sigma, omega]);

  const timePath = useMemo(
    () => toPath(timePoints, 520, 220, 0, 8, yMin, yMax),
    [timePoints, yMin, yMax],
  );

  return (
    <div className="mx-auto w-full max-w-5xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="mb-1 text-2xl font-extrabold text-slate-800">라플라스 변환: 시간축 vs s-평면</h3>
      <p className="mb-5 text-sm text-slate-600">
        시간영역 파형과 라플라스 영역 극점을 같은 파라미터로 동시에 확인합니다.
      </p>

      <div className="mb-4 flex flex-wrap gap-2">
        {[
          ["step", "계단함수"],
          ["exp", "지수감쇠"],
          ["damped_sine", "감쇠정현파"],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setSignalType(key)}
            className={`rounded-full px-4 py-2 text-sm font-bold transition ${
              signalType === key
                ? "bg-indigo-600 text-white"
                : "border border-slate-300 bg-white text-slate-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 rounded-xl bg-slate-50 p-4 md:grid-cols-2">
        <div>
          <div className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">시간영역</div>
          <div className="rounded-md bg-slate-900 px-3 py-2 font-mono text-sm text-emerald-300">{formulaTime}</div>
        </div>
        <div>
          <div className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">라플라스 영역</div>
          <div className="rounded-md bg-slate-900 px-3 py-2 font-mono text-sm text-cyan-300">{formulaLaplace}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 p-3">
          <div className="mb-2 text-sm font-bold text-slate-700">시간응답 f(t)</div>
          <svg viewBox="0 0 520 220" className="h-auto w-full rounded-md bg-slate-950">
            <line x1="0" y1="110" x2="520" y2="110" stroke="#334155" strokeWidth="1" />
            <line x1="0" y1="0" x2="0" y2="220" stroke="#334155" strokeWidth="1" />
            <path d={timePath} fill="none" stroke="#22d3ee" strokeWidth="2.2" />
            <text x="505" y="206" fill="#94a3b8" fontSize="11">
              t
            </text>
          </svg>
        </div>

        <div className="rounded-xl border border-slate-200 p-3">
          <div className="mb-2 text-sm font-bold text-slate-700">s-평면 극점</div>
          <svg viewBox="0 0 520 220" className="h-auto w-full rounded-md bg-slate-950">
            <line x1="260" y1="0" x2="260" y2="220" stroke="#334155" strokeWidth="1" />
            <line x1="0" y1="110" x2="520" y2="110" stroke="#334155" strokeWidth="1" />
            {poles.map((p, i) => {
              const x = 260 + p.re * 42;
              const y = 110 - p.im * 18;
              return (
                <g key={`${p.re}_${p.im}_${i}`}>
                  <line x1={x - 8} y1={y - 8} x2={x + 8} y2={y + 8} stroke="#f43f5e" strokeWidth="2.4" />
                  <line x1={x - 8} y1={y + 8} x2={x + 8} y2={y - 8} stroke="#f43f5e" strokeWidth="2.4" />
                </g>
              );
            })}
            <text x="495" y="126" fill="#94a3b8" fontSize="11">
              Re(s)
            </text>
            <text x="270" y="14" fill="#94a3b8" fontSize="11">
              Im(s)
            </text>
          </svg>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-900">
        {subtitle}
      </div>

      {signalType !== "step" && (
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="text-sm text-slate-700">
            감쇠 계수 σ: <strong>{sigma.toFixed(2)}</strong>
            <input
              type="range"
              min="0.1"
              max="2.5"
              step="0.1"
              value={sigma}
              onChange={(e) => setSigma(parseFloat(e.target.value))}
              className="mt-1 w-full"
            />
          </label>
          {signalType === "damped_sine" && (
            <label className="text-sm text-slate-700">
              각주파수 ω: <strong>{omega.toFixed(2)}</strong>
              <input
                type="range"
                min="0.5"
                max="8"
                step="0.1"
                value={omega}
                onChange={(e) => setOmega(parseFloat(e.target.value))}
                className="mt-1 w-full"
              />
            </label>
          )}
        </div>
      )}
    </div>
  );
}

