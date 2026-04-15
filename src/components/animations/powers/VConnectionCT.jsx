import { useState } from "react";

export default function VConnectionCT() {
  // 상태 관리: CT 1차 정격 및 측정된 2차 전류
  const [ctPrimary, setCtPrimary] = useState(150);
  const [measuredCurrent, setMeasuredCurrent] = useState(3.0);

  // 계산 로직
  const ctRatio = ctPrimary / 5;
  const primaryCurrent = (ctRatio * measuredCurrent).toFixed(1);

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "800px",
        margin: "0 auto",
        backgroundColor: "#1e2128",
        color: "#fff",
        fontFamily: "sans-serif",
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
      }}
    >
      {/* 1. 상단 컨트롤 패널 */}
      <div
        style={{
          padding: "20px 30px",
          backgroundColor: "#282c34",
          borderBottom: "1px solid #3d424b",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "20px",
        }}
      >
        <h3 style={{ margin: 0, color: "#61dafb" }}>
          3상 V결선 CT 전류 측정 시뮬레이터
        </h3>
        <div style={{ display: "flex", gap: "20px" }}>
          <label
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: "14px",
              color: "#aaa",
            }}
          >
            <span style={{ marginBottom: "5px" }}>
              CT 비 (1차 정격) : <strong>{ctPrimary} / 5 [A]</strong>
            </span>
            <input
              type="range"
              min="50"
              max="300"
              step="50"
              value={ctPrimary}
              onChange={(e) => setCtPrimary(Number(e.target.value))}
            />
          </label>
          <label
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: "14px",
              color: "#aaa",
            }}
          >
            <span style={{ marginBottom: "5px" }}>
              전류계 지시값 : <strong>{measuredCurrent.toFixed(1)} [A]</strong>
            </span>
            <input
              type="range"
              min="1"
              max="5"
              step="0.5"
              value={measuredCurrent}
              onChange={(e) => setMeasuredCurrent(Number(e.target.value))}
            />
          </label>
        </div>
      </div>

      {/* 2. 회로도 영역 (SVG) */}
      <div
        style={{
          padding: "30px",
          display: "flex",
          justifyContent: "center",
          backgroundColor: "#15171e",
          position: "relative",
        }}
      >
        {/* 전류 흐름 애니메이션을 위한 CSS */}
        <style>
          {`
            @keyframes flow {
              from { stroke-dashoffset: 12; }
              to { stroke-dashoffset: 0; }
            }
            .current-flow {
              stroke-dasharray: 6 6;
              animation: flow 0.5s linear infinite;
            }
          `}
        </style>

        <svg
          width="600"
          height="400"
          viewBox="0 0 600 400"
          style={{ backgroundColor: "#15171e" }}
        >
          {/* 상단 라벨 */}
          <text
            x="100"
            y="30"
            fill="#fff"
            fontSize="18"
            textAnchor="middle"
            fontWeight="bold"
          >
            a
          </text>
          <text
            x="250"
            y="30"
            fill="#fff"
            fontSize="18"
            textAnchor="middle"
            fontWeight="bold"
          >
            b
          </text>
          <text
            x="400"
            y="30"
            fill="#fff"
            fontSize="18"
            textAnchor="middle"
            fontWeight="bold"
          >
            c
          </text>

          {/* 1차측 메인 전선 (a, b, c) */}
          <line
            x1="100"
            y1="50"
            x2="100"
            y2="150"
            stroke="#aaa"
            strokeWidth="3"
          />
          <line
            x1="100"
            y1="250"
            x2="100"
            y2="350"
            stroke="#aaa"
            strokeWidth="3"
          />

          <line
            x1="250"
            y1="50"
            x2="250"
            y2="350"
            stroke="#aaa"
            strokeWidth="3"
          />

          <line
            x1="400"
            y1="50"
            x2="400"
            y2="150"
            stroke="#aaa"
            strokeWidth="3"
          />
          <line
            x1="400"
            y1="250"
            x2="400"
            y2="350"
            stroke="#aaa"
            strokeWidth="3"
          />

          {/* 메인 전선 전류 화살표 및 라벨 */}
          <path
            d="M 85 80 L 100 100 L 115 80"
            fill="none"
            stroke="#61dafb"
            strokeWidth="2"
          />
          <text x="60" y="95" fill="#61dafb" fontSize="16" fontWeight="bold">
            Ia
          </text>
          <text x="60" y="115" fill="#61dafb" fontSize="14">
            ({primaryCurrent}A)
          </text>

          <path
            d="M 235 200 L 250 220 L 265 200"
            fill="none"
            stroke="#61dafb"
            strokeWidth="2"
          />
          <text x="210" y="215" fill="#61dafb" fontSize="16" fontWeight="bold">
            Ib
          </text>

          <path
            d="M 385 80 L 400 100 L 415 80"
            fill="none"
            stroke="#61dafb"
            strokeWidth="2"
          />
          <text x="425" y="95" fill="#61dafb" fontSize="16" fontWeight="bold">
            Ic
          </text>
          <text x="425" y="115" fill="#61dafb" fontSize="14">
            ({primaryCurrent}A)
          </text>

          {/* 지그재그 코일 (CT 1차측) - 사각형 대신 정교한 지그재그 패스 사용 */}
          {/* A상 지그재그 */}
          <path
            d="M 100 150 L 85 165 L 115 195 L 85 225 L 100 240 L 100 250"
            fill="none"
            stroke="#fff"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          {/* C상 지그재그 */}
          <path
            d="M 400 150 L 385 165 L 415 195 L 385 225 L 400 240 L 400 250"
            fill="none"
            stroke="#fff"
            strokeWidth="3"
            strokeLinejoin="round"
          />

          {/* 2차측 회로 전선 (오렌지색 계열) */}
          {/* A상 2차측 상단 선 */}
          <line
            x1="100"
            y1="110"
            x2="520"
            y2="110"
            stroke="#fca311"
            strokeWidth="2"
          />
          {/* C상 2차측 상단 선 */}
          <line
            x1="400"
            y1="170"
            x2="520"
            y2="170"
            stroke="#fca311"
            strokeWidth="2"
          />
          {/* 공통 귀환선 (하단 연결) */}
          <line
            x1="100"
            y1="280"
            x2="520"
            y2="280"
            stroke="#fca311"
            strokeWidth="2"
          />
          {/* 공통 수직 연결선 */}
          <line
            x1="520"
            y1="110"
            x2="520"
            y2="280"
            stroke="#fca311"
            strokeWidth="2"
          />

          {/* 연결점 (Dots) */}
          <circle cx="100" cy="110" r="4" fill="#fff" />
          <circle cx="400" cy="170" r="4" fill="#fff" />
          <circle cx="100" cy="280" r="4" fill="#fff" />
          <circle cx="400" cy="280" r="4" fill="#fff" />
          <circle cx="520" cy="110" r="4" fill="#fff" />
          <circle cx="520" cy="170" r="4" fill="#fff" />

          {/* 애니메이션 되는 전류 흐름 (점선) */}
          <path
            d="M 100 110 L 330 110"
            fill="none"
            stroke="#fff"
            strokeWidth="2"
            className="current-flow"
          />
          <path
            d="M 400 170 L 430 170"
            fill="none"
            stroke="#fff"
            strokeWidth="2"
            className="current-flow"
          />
          <path
            d="M 520 110 L 520 220"
            fill="none"
            stroke="#fff"
            strokeWidth="2"
            className="current-flow"
          />

          {/* 전류계 A1 */}
          <g transform="translate(360, 110)">
            <circle
              cx="0"
              cy="0"
              r="20"
              fill="#282c34"
              stroke="#fca311"
              strokeWidth="2"
            />
            <text
              x="0"
              y="2"
              fill="#fff"
              fontSize="16"
              textAnchor="middle"
              dominantBaseline="middle"
              fontWeight="bold"
            >
              A1
            </text>
            <text
              x="0"
              y="-30"
              fill="#fca311"
              fontSize="14"
              textAnchor="middle"
              fontWeight="bold"
            >
              {measuredCurrent.toFixed(1)}A
            </text>
          </g>

          {/* 전류계 A2 */}
          <g transform="translate(460, 170)">
            <circle
              cx="0"
              cy="0"
              r="20"
              fill="#282c34"
              stroke="#fca311"
              strokeWidth="2"
            />
            <text
              x="0"
              y="2"
              fill="#fff"
              fontSize="16"
              textAnchor="middle"
              dominantBaseline="middle"
              fontWeight="bold"
            >
              A2
            </text>
            <text
              x="0"
              y="-30"
              fill="#fca311"
              fontSize="14"
              textAnchor="middle"
              fontWeight="bold"
            >
              {measuredCurrent.toFixed(1)}A
            </text>
          </g>

          {/* 전류계 A3 (공통선) */}
          <g transform="translate(520, 240)">
            <circle
              cx="0"
              cy="0"
              r="20"
              fill="#282c34"
              stroke="#fca311"
              strokeWidth="2"
            />
            <text
              x="0"
              y="2"
              fill="#fff"
              fontSize="16"
              textAnchor="middle"
              dominantBaseline="middle"
              fontWeight="bold"
            >
              A3
            </text>
            <text x="35" y="5" fill="#fca311" fontSize="14" fontWeight="bold">
              {measuredCurrent.toFixed(1)}A
            </text>
          </g>
        </svg>
      </div>

      {/* 3. 하단 실시간 풀이 과정 영역 */}
      <div
        style={{
          padding: "30px",
          backgroundColor: "#21252b",
          borderTop: "1px solid #3d424b",
        }}
      >
        <h4
          style={{
            margin: "0 0 20px 0",
            color: "#98c379",
            fontSize: "18px",
            borderBottom: "1px solid #3d424b",
            paddingBottom: "10px",
          }}
        >
          📝 문제 풀이 및 계산 과정
        </h4>

        <div style={{ fontSize: "16px", lineHeight: "1.8", color: "#abb2bf" }}>
          <p style={{ margin: "10px 0" }}>
            <strong>[원리]</strong> 3상 평형 부하에서 2대의 CT를 V결선하면, 공통
            귀환선에 연결된 전류계(A3)는 나머지 두 상의 벡터 합을 지시합니다.{" "}
            <br />
            평형 상태이므로 크기는 모두 동일하게{" "}
            <strong>
              I<sub>a</sub>' = I<sub>c</sub>' = I<sub>b</sub>'
            </strong>{" "}
            가 됩니다.
          </p>

          <div
            style={{
              backgroundColor: "#1e2128",
              padding: "15px",
              borderRadius: "8px",
              borderLeft: "4px solid #61dafb",
              margin: "20px 0",
            }}
          >
            <p style={{ margin: "5px 0" }}>
              1. <strong>2차측 측정 전류</strong> : I<sub>a</sub>' = I
              <sub>c</sub>' = I ={" "}
              <span style={{ color: "#e5c07b", fontWeight: "bold" }}>
                {measuredCurrent.toFixed(1)} [A]
              </span>
            </p>
            <p style={{ margin: "15px 0" }}>
              2. <strong>CT 변류비 (a)</strong> :{" "}
              <span style={{ color: "#d19a66", fontWeight: "bold" }}>
                {ctPrimary} / 5
              </span>{" "}
              = <strong>{ctRatio}</strong>
            </p>
            <p style={{ margin: "5px 0", fontSize: "18px" }}>
              3.{" "}
              <strong>
                1차 선전류 (I<sub>a</sub>)
              </strong>{" "}
              : a × I<sub>a</sub>' = {ctRatio} × {measuredCurrent.toFixed(1)} ={" "}
              <span
                style={{
                  color: "#e06c75",
                  fontWeight: "bold",
                  fontSize: "22px",
                }}
              >
                {primaryCurrent} [A]
              </span>
            </p>
          </div>

          <h2 style={{ textAlign: "right", margin: "0", color: "#fff" }}>
            최종 답 :{" "}
            <span style={{ color: "#e06c75" }}>{primaryCurrent} [A]</span>
          </h2>
        </div>
      </div>
    </div>
  );
}
