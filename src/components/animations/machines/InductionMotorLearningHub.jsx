import { Loader2 } from "lucide-react";
import { Suspense, useState } from "react";
import InductionMotorTypeDiagram from "./diagrams/InductionMotorTypeDiagram";
import InductionMotorTypeContent from "./induction-motor/InductionMotorTypeContent";
import InductionMotorCombinedWidget from "./InductionMotorCombinedWidget";
import ThreePhaseinductionMotor from "./ThreePhaseinductionMotor";

function WoundRotorEquivalentSvg() {
  return (
    <div
      style={{
        background: "#171b21",
        border: "1px solid #353e4b",
        borderRadius: "10px",
        padding: "16px",
        color: "#cbd5e0",
      }}
    >
      <p style={{ margin: "0 0 10px", fontSize: "14px", color: "#9ad8ff" }}>
        권선형 회전자 — 슬립링으로 인출된 회전자에 외부 저항 R_ext (시동·특성 조절)
      </p>
      <svg width="100%" height="200" viewBox="0 0 440 200">
        <line x1="40" y1="40" x2="400" y2="40" stroke="#718096" strokeWidth="2" />
        <line x1="40" y1="160" x2="400" y2="160" stroke="#718096" strokeWidth="2" />
        <text x="50" y="30" fill="#a0aec0" fontSize="11">
          정자 한 상 등가(개념)
        </text>
        <rect x="60" y="70" width="50" height="36" rx="4" fill="#2c3e50" stroke="#f1c40f" />
        <text x="85" y="92" textAnchor="middle" fill="#f1c40f" fontSize="12">
          R₁
        </text>
        <line x1="110" y1="88" x2="140" y2="88" stroke="#718096" strokeWidth="2" />
        <rect x="140" y="70" width="50" height="36" rx="4" fill="#2c3e50" stroke="#e74c3c" />
        <text x="165" y="92" textAnchor="middle" fill="#fca5a5" fontSize="12">
          jX₁
        </text>
        <line x1="190" y1="88" x2="220" y2="88" stroke="#718096" strokeWidth="2" />
        <rect x="220" y="70" width="50" height="36" rx="4" fill="#2c3e50" stroke="#68d391" />
        <text x="245" y="92" textAnchor="middle" fill="#9ae6b4" fontSize="12">
          jX_m
        </text>
        <line x1="270" y1="88" x2="300" y2="88" stroke="#718096" strokeWidth="2" />
        <text x="310" y="92" fill="#f6ad55" fontSize="11">
          회전자 측 R₂′/s + R_ext′
        </text>
        <path
          d="M300 88 L340 88 L340 130 L380 130 L380 160"
          fill="none"
          stroke="#f6ad55"
          strokeWidth="2"
        />
        <rect x="330" y="108" width="36" height="22" rx="3" fill="#744210" stroke="#f6ad55" />
        <text x="348" y="124" textAnchor="middle" fill="#feebc8" fontSize="10">
          R_ext
        </text>
      </svg>
    </div>
  );
}

function SinglePhaseSchematicSvg() {
  return (
    <div
      style={{
        background: "#171b21",
        border: "1px solid #353e4b",
        borderRadius: "10px",
        padding: "16px",
        color: "#cbd5e0",
      }}
    >
      <p style={{ margin: "0 0 10px", fontSize: "14px", color: "#f6ad55" }}>
        단상 — 주권선(Main) + 위상을 만든 보조 권선 또는 축콘덴서(개념도)
      </p>
      <svg width="100%" height="180" viewBox="0 0 420 180">
        <line x1="50" y1="90" x2="370" y2="90" stroke="#718096" strokeWidth="2" />
        <rect x="80" y="70" width="70" height="36" rx="4" fill="#2c3e50" stroke="#63b3ed" />
        <text x="115" y="92" textAnchor="middle" fill="#bee3f8" fontSize="12">
          주권선
        </text>
        <rect x="200" y="55" width="56" height="28" rx="4" fill="#2c3e50" stroke="#f6ad55" />
        <text x="228" y="73" textAnchor="middle" fill="#feebc8" fontSize="10">
          보조
        </text>
        <path d="M228 83 L228 110" stroke="#f6ad55" strokeWidth="2" />
        <text x="238" y="125" fill="#a0aec0" fontSize="10">
          또는 C_start
        </text>
        <circle cx="320" cy="90" r="22" fill="#2c3e50" stroke="#f1c40f" strokeWidth="2" />
        <text x="320" y="95" textAnchor="middle" fill="#f1c40f" fontSize="11">
          IM
        </text>
      </svg>
    </div>
  );
}

export default function InductionMotorLearningHub() {
  const [activeType, setActiveType] = useState("three_phase_cage");
  const [subTab, setSubTab] = useState("equivalent");

  return (
    <>
      <style>{`@keyframes imHubSpin { to { transform: rotate(360deg); } }`}</style>
      <div
      style={{
        width: "100%",
        maxWidth: "1100px",
        margin: "0 auto",
        backgroundColor: "#1e2128",
        color: "#fff",
        fontFamily: "sans-serif",
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
      }}
    >
      <InductionMotorTypeDiagram />
      <InductionMotorTypeContent activeType={activeType} onSelectType={setActiveType} />

      <div style={{ padding: "0 20px 24px" }}>
        {activeType === "three_phase_cage" && (
          <>
            <div
              style={{
                display: "flex",
                gap: "8px",
                marginBottom: "16px",
                flexWrap: "wrap",
              }}
            >
              {[
                { id: "equivalent", label: "등가회로 · 단면 · 특성" },
                { id: "wave", label: "3상 회전자계 · 공간 파형" },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSubTab(t.id)}
                  style={{
                    padding: "10px 16px",
                    borderRadius: "8px",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: 700,
                    fontSize: "13px",
                    backgroundColor: subTab === t.id ? "#2c7a7b" : "#2d3748",
                    color: "#fff",
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <Suspense
              fallback={
                <div style={{ display: "flex", justifyContent: "center", padding: "48px 0" }}>
                  <Loader2
                    size={40}
                    color="#4fd1c5"
                    style={{ animation: "imHubSpin 1s linear infinite" }}
                  />
                </div>
              }
            >
              {subTab === "equivalent" ? (
                <InductionMotorCombinedWidget />
              ) : (
                <ThreePhaseinductionMotor />
              )}
            </Suspense>
          </>
        )}

        {activeType === "three_phase_wound" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <WoundRotorEquivalentSvg />
            <p style={{ margin: 0, fontSize: "14px", lineHeight: 1.65, color: "#a0aec0" }}>
              권선형은 등가적으로 회전자 저항 항에 <strong style={{ color: "#f6ad55" }}>R_ext</strong>
              가 더해지며, 슬립 s에 따라 <strong style={{ color: "#9ad8ff" }}>R₂′/s</strong> 해석이
              핵심입니다. 상세 수치 시뮬은 3상 케이지 탭의 등가 패널과 같은 형태로 확장할 수
              있습니다.
            </p>
            <Suspense
              fallback={
                <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
                  <Loader2
                    size={40}
                    color="#4fd1c5"
                    style={{ animation: "imHubSpin 1s linear infinite" }}
                  />
                </div>
              }
            >
              <InductionMotorCombinedWidget />
            </Suspense>
          </div>
        )}

        {activeType === "single_phase" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <SinglePhaseSchematicSvg />
            <p style={{ margin: 0, fontSize: "14px", lineHeight: 1.65, color: "#a0aec0" }}>
              단상 기동은 <strong style={{ color: "#f6ad55" }}>위상차</strong>를 만드는 쪽이
              핵심입니다. 실제 기기별로 저항분할·축콘덴서·쉐이드 폴 등 회로가 달라지며, 여기서는
              대표적인 주/보조 개념도만 제시합니다.
            </p>
          </div>
        )}
      </div>
      </div>
    </>
  );
}
