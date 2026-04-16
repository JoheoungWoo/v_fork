import { useEffect, useState } from "react";

function Battery({ x }) {
  return (
    <g transform={`translate(${x}, 0)`}>
      <rect x="0" y="0" width="60" height="130" rx="10" fill="#1f2937" />
      <rect x="0" y="0" width="60" height="38" rx="10" fill="#c58b4d" />
      <rect x="23" y="-8" width="14" height="10" rx="2" fill="#9ca3af" />
      <text x="30" y="27" textAnchor="middle" fill="#111827" fontSize="22" fontWeight="700">
        +
      </text>
    </g>
  );
}

export default function BatteryCurrentFlowWidget() {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    let raf = 0;
    let prev = performance.now();
    const tick = (now) => {
      const dt = (now - prev) / 1000;
      prev = now;
      setOffset((v) => (v + dt * 80) % 100);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-[#0f3a87] p-5 text-white shadow-sm">
      <h3 className="text-lg font-bold">Parallel Battery Current Flow</h3>
      <p className="mt-1 text-sm text-blue-100">
        병렬 연결에서는 전압은 유지되고, 전류 공급 능력이 증가합니다.
      </p>

      <div className="mt-4 rounded-xl bg-[#0b2f6e] p-3">
        <svg viewBox="0 0 920 360" className="w-full">
          <defs>
            <filter id="bulbGlow">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <rect x="0" y="0" width="920" height="360" fill="#0b2f6e" rx="16" />

          <Battery x={210} />
          <Battery x={290} />

          <path d="M240 18 L240 70 L510 70 L560 145" stroke="#ef4444" strokeWidth="10" fill="none" strokeLinecap="round" />
          <path d="M320 18 L320 70" stroke="#ef4444" strokeWidth="10" fill="none" strokeLinecap="round" />
          <path d="M240 132 L240 255 L560 255 L560 205" stroke="#22c55e" strokeWidth="10" fill="none" strokeLinecap="round" />
          <path d="M320 132 L320 255" stroke="#22c55e" strokeWidth="10" fill="none" strokeLinecap="round" />

          <path
            d="M240 18 L240 70 L510 70 L560 145"
            stroke="#facc15"
            strokeWidth="5"
            fill="none"
            strokeDasharray="14 10"
            strokeDashoffset={-offset}
            strokeLinecap="round"
          />
          <path
            d="M240 132 L240 255 L560 255 L560 205"
            stroke="#86efac"
            strokeWidth="5"
            fill="none"
            strokeDasharray="14 10"
            strokeDashoffset={offset}
            strokeLinecap="round"
          />

          <g filter="url(#bulbGlow)">
            <ellipse cx="650" cy="175" rx="62" ry="48" fill="#fde047" opacity="0.94" />
            <rect x="560" y="152" width="36" height="46" rx="10" fill="#a16207" />
            <line x1="572" y1="160" x2="595" y2="145" stroke="#fef08a" strokeWidth="4" />
            <line x1="572" y1="190" x2="595" y2="205" stroke="#fef08a" strokeWidth="4" />
          </g>

          <text x="70" y="56" fontSize="42" fontWeight="700" fill="#e2e8f0">
            Parallel
          </text>
          <text x="70" y="102" fontSize="28" fill="#fde047">
            Total Voltage = 1.5V
          </text>
          <text x="70" y="330" fontSize="30" fill="#dbeafe">
            Path Merges
          </text>
        </svg>
      </div>
    </div>
  );
}
