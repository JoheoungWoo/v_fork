import "katex/dist/katex.min.css";
import { InlineMath } from "react-katex";
import { useMemo, useState } from "react";

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/**
 * 전기기사·전기공사 난점: P, Q, S, 역률, 콘덴서 무효 보상.
 * 페이저 회전·삼각형·수치가 슬라이더에 연동됩니다.
 */
export default function PowerTrianglePowerFactorWidget() {
  const [pKw, setPKw] = useState(60);
  const [qL_kvar, setQL_kvar] = useState(48);
  const [qC_kvar, setQC_kvar] = useState(24);

  const { qNet, sKva, cosPhi, phiDeg } = useMemo(() => {
    const q = qL_kvar - qC_kvar;
    const s = Math.sqrt(pKw * pKw + q * q) || 1e-9;
    const cos = clamp(pKw / s, -1, 1);
    const phi = (Math.acos(cos) * 180) / Math.PI;
    return {
      qNet: q,
      sKva: s,
      cosPhi: cos,
      phiDeg: q >= 0 ? phi : -phi,
    };
  }, [pKw, qL_kvar, qC_kvar]);

  const scale = 2.05;
  const ox = 40;
  const oy = 220;
  const px = ox + pKw * scale;
  const py = oy - qNet * scale;

  return (
    <div className="w-full max-w-4xl rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-6 font-sans shadow-sm">
      <h2 className="mb-1 text-xl font-bold text-slate-800">
        전기기사 핵심 · 전력 삼각형과 역률(콘덴서 보상)
      </h2>
      <p className="mb-4 text-sm leading-relaxed text-slate-600">
        <InlineMath math="S^2=P^2+Q^2" />, <InlineMath math="\cos\varphi=P/S" />. 유도성 부하의{" "}
        <InlineMath math="Q_L" />에 콘덴서 <InlineMath math="Q_C" />를 더하면 합성{" "}
        <InlineMath math="Q=Q_L-Q_C" />가 줄어 피상전력 <InlineMath math="S" />와 전류가
        감소합니다(유효전력 <InlineMath math="P" /> 동일).
      </p>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-inner">
          <div className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">
            페이저 (V 기준, I의 위상차 φ)
          </div>
          <div className="relative mx-auto aspect-square max-w-[280px]">
            <svg viewBox="0 0 200 200" className="h-full w-full">
              <g
                style={{
                  transformOrigin: "100px 100px",
                  animation: "pf-spin 40s linear infinite",
                }}
              >
                <circle
                  cx="100"
                  cy="100"
                  r="76"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="1"
                  strokeDasharray="5 9"
                />
              </g>
              <line
                x1="100"
                y1="100"
                x2="100"
                y2="38"
                stroke="#0ea5e9"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <text x="104" y="34" className="fill-sky-600 text-[11px] font-bold">
                V
              </text>
              <g
                style={{
                  transform: `rotate(${-phiDeg}deg)`,
                  transformOrigin: "100px 100px",
                  transition: "transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)",
                }}
              >
                <line
                  x1="100"
                  y1="100"
                  x2="100"
                  y2="162"
                  stroke="#f97316"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <text x="104" y="170" className="fill-orange-600 text-[11px] font-bold">
                  I
                </text>
              </g>
              <text x="100" y="198" className="fill-slate-500 text-[10px]" textAnchor="middle">
                {qNet >= 0 ? "지상(유도성): I가 V보다 뒤짐" : "선행(용성): I가 V보다 앞섬"}
              </text>
            </svg>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-inner">
          <div className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">
            전력 삼각형 (kW / kvar 스케일)
          </div>
          <svg width="100%" height="240" viewBox="0 0 320 260" className="overflow-visible">
            <defs>
              <marker id="pf-arrow-g" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8 Z" fill="#16a34a" />
              </marker>
              <marker id="pf-arrow-b" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8 Z" fill="#2563eb" />
              </marker>
              <marker id="pf-arrow-o" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8 Z" fill="#ea580c" />
              </marker>
            </defs>
            <line x1={ox} y1={oy} x2={300} y2={oy} stroke="#e2e8f0" strokeWidth="1" />
            <line x1={ox} y1={oy} x2={ox} y2={25} stroke="#e2e8f0" strokeWidth="1" />

            <polygon
              points={`${ox},${oy} ${px},${oy} ${px},${py}`}
              fill="rgba(234,88,12,0.1)"
              stroke="#ea580c"
              strokeWidth="2.5"
              style={{ transition: "all 0.45s cubic-bezier(0.22, 1, 0.36, 1)" }}
            />
            <line
              x1={ox}
              y1={oy}
              x2={px}
              y2={oy}
              stroke="#16a34a"
              strokeWidth="3"
              markerEnd="url(#pf-arrow-g)"
              style={{ transition: "all 0.45s cubic-bezier(0.22, 1, 0.36, 1)" }}
            />
            <line
              x1={px}
              y1={oy}
              x2={px}
              y2={py}
              stroke="#2563eb"
              strokeWidth="3"
              markerEnd="url(#pf-arrow-b)"
              style={{ transition: "all 0.45s cubic-bezier(0.22, 1, 0.36, 1)" }}
            />
            <line
              x1={ox}
              y1={oy}
              x2={px}
              y2={py}
              stroke="#ea580c"
              strokeWidth="3"
              markerEnd="url(#pf-arrow-o)"
              style={{ transition: "all 0.45s cubic-bezier(0.22, 1, 0.36, 1)" }}
            />
            <text x={ox + (px - ox) / 2 - 6} y={oy + 20} className="fill-green-700 text-[12px] font-bold">
              P
            </text>
            <text x={px + 5} y={(oy + py) / 2} className="fill-blue-700 text-[12px] font-bold">
              Q
            </text>
            <text x={(ox + px) / 2 - 10} y={py - 10} className="fill-orange-700 text-[12px] font-bold">
              S
            </text>
          </svg>
        </div>
      </div>

      <div className="mt-6 space-y-4 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
        <label className="block text-sm font-semibold text-slate-700">
          유효전력 P = {pKw.toFixed(0)} kW
        </label>
        <input
          type="range"
          min={20}
          max={100}
          step={1}
          value={pKw}
          onChange={(e) => setPKw(Number(e.target.value))}
          className="w-full accent-green-600"
        />
        <label className="block text-sm font-semibold text-slate-700">
          부하 무효 Q<sub>L</sub> (유도) = {qL_kvar.toFixed(0)} kvar
        </label>
        <input
          type="range"
          min={5}
          max={90}
          step={1}
          value={qL_kvar}
          onChange={(e) => {
            const v = Number(e.target.value);
            setQL_kvar(v);
            setQC_kvar((c) => clamp(c, 0, v + 35));
          }}
          className="w-full accent-blue-600"
        />
        <label className="block text-sm font-semibold text-slate-700">
          콘덴서 Q<sub>C</sub> = {qC_kvar.toFixed(0)} kvar
        </label>
        <input
          type="range"
          min={0}
          max={Math.max(qL_kvar + 35, 40)}
          step={1}
          value={qC_kvar}
          onChange={(e) => setQC_kvar(Number(e.target.value))}
          className="w-full accent-violet-600"
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg bg-slate-100 px-3 py-2 text-center">
          <div className="text-[10px] font-bold text-slate-500">합성 Q</div>
          <div className="text-lg font-black text-slate-800">{qNet.toFixed(1)} kvar</div>
        </div>
        <div className="rounded-lg bg-slate-100 px-3 py-2 text-center">
          <div className="text-[10px] font-bold text-slate-500">피상 S</div>
          <div className="text-lg font-black text-slate-800">{sKva.toFixed(1)} kVA</div>
        </div>
        <div className="rounded-lg bg-emerald-100 px-3 py-2 text-center">
          <div className="text-[10px] font-bold text-emerald-700">역률 cosφ</div>
          <div className="text-lg font-black text-emerald-900">{cosPhi.toFixed(3)}</div>
        </div>
        <div className="rounded-lg bg-violet-100 px-3 py-2 text-center">
          <div className="text-[10px] font-bold text-violet-700">|φ|</div>
          <div className="text-lg font-black text-violet-900">
            {Math.abs(phiDeg).toFixed(1)}°
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pf-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
