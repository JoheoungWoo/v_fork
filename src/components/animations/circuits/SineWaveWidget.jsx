import { useEffect, useState } from "react";

const SineWaveWidget = () => {
  const [amp, setAmp] = useState(50); // 진폭 (A)
  const [freq, setFreq] = useState(1); // 주파수 (f)
  const [phase, setPhase] = useState(0); // 위상 (θ)
  const [time, setTime] = useState(0);

  // 애니메이션 루프
  useEffect(() => {
    let frameId;
    const animate = () => {
      setTime((prev) => prev + 0.02);
      frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, []);

  // 현재 시점의 각도 계산: ωt + θ
  const currentAngle = 2 * Math.PI * freq * time + (phase * Math.PI) / 180;
  const targetY = -Math.sin(currentAngle) * amp;
  const targetX = Math.cos(currentAngle) * amp;

  return (
    <div
      style={{ padding: "20px", background: "#f0f0f0", borderRadius: "10px" }}
    >
      <div
        style={{
          display: "flex",
          gap: "20px",
          alignItems: "center",
          height: "200px",
        }}
      >
        {/* 1. 회전하는 원 (Phasor) */}
        <svg width="150" height="150" viewBox="-100 -100 200 200">
          <circle cx="0" cy="0" r={amp} fill="none" stroke="#ccc" />
          <line
            x1="0"
            y1="0"
            x2={targetX}
            y2={targetY}
            stroke="blue"
            strokeWidth="2"
          />
          <circle cx={targetX} cy={targetY} r="4" fill="red" />
        </svg>

        {/* 2. 사인 파형 (Waveform) */}
        <svg width="400" height="150" viewBox="0 -100 400 200">
          <path
            d={`M ${Array.from({ length: 100 }, (_, i) => {
              const t = time - i * 0.05;
              const y =
                -Math.sin(2 * Math.PI * freq * t + (phase * Math.PI) / 180) *
                amp;
              return `${i * 4},${y}`;
            }).join(" L ")}`}
            fill="none"
            stroke="red"
            strokeWidth="2"
          />
          {/* 원과 파형을 잇는 가이드 라인 */}
          <line
            x1="0"
            y1={targetY}
            x2="400"
            y2={targetY}
            stroke="gray"
            strokeDasharray="4"
          />
        </svg>
      </div>

      {/* 3. 컨트롤 패널 */}
      <div style={{ marginTop: "20px" }}>
        <div>
          진폭 (A):{" "}
          <input
            type="range"
            min="10"
            max="80"
            value={amp}
            onChange={(e) => setAmp(+e.target.value)}
          />
        </div>
        <div>
          주파수 (f):{" "}
          <input
            type="range"
            min="0.5"
            max="5"
            step="0.1"
            value={freq}
            onChange={(e) => setFreq(+e.target.value)}
          />
        </div>
        <div>
          위상 (θ):{" "}
          <input
            type="range"
            min="0"
            max="360"
            value={phase}
            onChange={(e) => setPhase(+e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default SineWaveWidget;
