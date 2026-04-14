import { useEffect, useRef, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const SimulationPanel = ({
  vPeak,
  freq,
  activeR,
  valR,
  activeL,
  valL,
  activeC,
  valC,
}) => {
  const [results, setResults] = useState({
    zMag: 0,
    zPhaseDeg: 0,
    iMag: 0,
    iPhaseDeg: 0,
  });
  const [waveformData, setWaveformData] = useState([]);
  const canvasRef = useRef(null);

  // 1. 임피던스 및 전류 계산, 파형 데이터 생성
  useEffect(() => {
    // 아무 소자도 선택되지 않았거나 주파수가 0 이하인 경우 초기화
    if ((!activeR && !activeL && !activeC) || freq <= 0 || vPeak === 0) {
      setResults({ zMag: 0, zPhaseDeg: 0, iMag: 0, iPhaseDeg: 0 });
      setWaveformData([]);
      return;
    }

    const omega = 2 * Math.PI * freq;

    // 각 소자의 저항 및 리액턴스 계산
    const r = activeR ? valR : 0;
    const xl = activeL ? omega * valL * 1e-3 : 0; // mH -> H 변환

    let xc = 0;
    let isCircuitOpen = false;
    if (activeC) {
      if (valC > 0) {
        xc = 1 / (omega * valC * 1e-6); // μF -> F 변환
      } else {
        isCircuitOpen = true; // 커패시터 용량이 0이면 단선(Open) 상태
      }
    }

    const xTotal = xl - xc; // 전체 리액턴스

    let zMag = 0;
    let zPhaseDeg = 0;
    let iMag = 0;
    let iPhaseDeg = 0;

    if (isCircuitOpen) {
      zMag = Infinity;
    } else {
      // 복소 임피던스 크기 및 위상각 계산
      zMag = Math.sqrt(r * r + xTotal * xTotal);
      const zPhaseRad = Math.atan2(xTotal, r);
      zPhaseDeg = zPhaseRad * (180 / Math.PI);

      if (zMag > 0) {
        iMag = vPeak / zMag;
        iPhaseDeg = -zPhaseDeg; // 전압 위상을 0도로 기준 잡았을 때 전류 위상
      }
    }

    setResults({ zMag, zPhaseDeg, iMag, iPhaseDeg });

    // 파형 데이터 생성 (2주기 분량)
    const data = [];
    const points = 100;
    const period = 1 / freq;
    const timeLimit = period * 2;
    const iPhaseRad = iPhaseDeg * (Math.PI / 180);

    for (let i = 0; i <= points; i++) {
      const t = (i / points) * timeLimit;
      const v = vPeak * Math.sin(omega * t);
      const iVal = iMag * Math.sin(omega * t + iPhaseRad);
      data.push({ time: t, v: v, i: iVal });
    }
    setWaveformData(data);
  }, [vPeak, freq, activeR, valR, activeL, valL, activeC, valC]);

  // 2. 벡터도(Phasor Diagram) 그리기
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    // 캔버스 초기화
    ctx.clearRect(0, 0, width, height);

    // 아무것도 선택되지 않았거나 전류가 없으면 축만 그리고 종료
    if (results.zMag === 0 || results.zMag === Infinity) {
      drawAxes(ctx, width, height, centerX, centerY);
      return;
    }

    // 축 그리기
    drawAxes(ctx, width, height, centerX, centerY);

    const maxRadius = Math.min(centerX, centerY) - 20;

    // 화살표 그리는 함수
    const drawArrow = (angleDeg, color, label, isVoltage) => {
      const angleRad = angleDeg * (Math.PI / 180);
      // 전압은 최대 길이로, 전류는 전압보다 약간 짧게 (시각적 구분을 위해 고정 비율 사용)
      const length = isVoltage ? maxRadius : maxRadius * 0.7;

      // Canvas는 아래쪽이 y축 양의 방향이므로 각도 부호를 반대로 적용 (-angleRad)
      const endX = centerX + length * Math.cos(-angleRad);
      const endY = centerY + length * Math.sin(-angleRad);

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.stroke();

      // 화살표 머리
      const headlen = 10;
      const arrowAngle = Math.atan2(endY - centerY, endX - centerX);
      ctx.beginPath();
      ctx.moveTo(endX, endY);
      ctx.lineTo(
        endX - headlen * Math.cos(arrowAngle - Math.PI / 6),
        endY - headlen * Math.sin(arrowAngle - Math.PI / 6),
      );
      ctx.lineTo(
        endX - headlen * Math.cos(arrowAngle + Math.PI / 6),
        endY - headlen * Math.sin(arrowAngle + Math.PI / 6),
      );
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();

      // 라벨 텍스트
      ctx.fillStyle = color;
      ctx.font = "bold 14px sans-serif";
      ctx.fillText(label, endX + 5, endY - 5);
    };

    // 전압 벡터 그리기 (기준 위상 0도)
    drawArrow(0, "#3b82f6", "V", true);

    // 전류 벡터 그리기 (계산된 위상각)
    if (results.iMag > 0) {
      drawArrow(results.iPhaseDeg, "#f97316", "I", false);
    }
  }, [results]);

  const drawAxes = (ctx, width, height, centerX, centerY) => {
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, height);
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 1;
    ctx.stroke();
  };

  return (
    <div
      style={{
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        flex: 1,
      }}
    >
      <h3 style={{ marginTop: 0 }}>2. 결과 및 시뮬레이션</h3>

      {/* 계산 결과 텍스트 */}
      <div
        style={{
          display: "flex",
          gap: "30px",
          marginBottom: "20px",
          backgroundColor: "#f8fafc",
          padding: "15px",
          borderRadius: "5px",
        }}
      >
        <div>
          <strong>계산된 임피던스 (Z): </strong>
          {results.zMag === Infinity
            ? "∞ (단선)"
            : `${results.zMag.toFixed(2)} Ω`}
          {results.zMag !== Infinity &&
            results.zMag > 0 &&
            `, ${results.zPhaseDeg.toFixed(2)}°`}
        </div>
        <div>
          <strong>계산된 전류 (I): </strong>
          {results.iMag.toFixed(2)} A
          {results.iMag > 0 && `, ${results.iPhaseDeg.toFixed(2)}°`}
        </div>
      </div>

      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        {/* 파형 그래프 (Recharts) */}
        <div style={{ flex: "1 1 400px", height: "300px" }}>
          <h4 style={{ textAlign: "center", marginBottom: "10px" }}>
            전압 & 전류 파형
          </h4>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={waveformData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="time"
                tickFormatter={(tick) => tick.toFixed(4)}
                label={{
                  value: "Time (s)",
                  position: "insideBottomRight",
                  offset: -5,
                }}
              />
              <YAxis />
              <Tooltip
                formatter={(value, name) => [
                  value.toFixed(2),
                  name === "v" ? "Voltage (V)" : "Current (A)",
                ]}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="v"
                stroke="#3b82f6"
                name="Voltage (V)"
                dot={false}
                strokeWidth={2}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="i"
                stroke="#f97316"
                name="Current (A)"
                dot={false}
                strokeWidth={2}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 벡터도 (Canvas) */}
        <div
          style={{
            width: "250px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <h4 style={{ marginBottom: "10px" }}>벡터도 (Phasor Diagram)</h4>
          <canvas
            ref={canvasRef}
            width={250}
            height={250}
            style={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "5px",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default SimulationPanel;
