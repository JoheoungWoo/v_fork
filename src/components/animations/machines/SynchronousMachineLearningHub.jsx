import { useMemo, useState } from "react";
import SynchronousMachineTypeDiagram from "./diagrams/SynchronousMachineTypeDiagram";
import SynchronousMachineTypeContent from "./synchronous-machine/SynchronousMachineTypeContent";
import ExamPrepVoiceStrip from "./exam/ExamPrepVoiceStrip";

function SynchronousEquivalentPanel({
  mode,
  Vll,
  powerFactor,
  current,
  xs,
  fieldScale,
}) {
  const Vph = Vll / Math.sqrt(3);
  const phi = Math.acos(Math.min(1, Math.max(-1, powerFactor)));
  const jXsI = xs * current;
  const Ef = useMemo(() => {
    const real = Vph + jXsI * Math.sin(phi);
    const imag = jXsI * Math.cos(phi);
    return Math.sqrt(real * real + imag * imag) * fieldScale;
  }, [Vph, jXsI, phi, fieldScale]);

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
      <p style={{ margin: "0 0 10px", fontSize: "14px", color: "#f687b3" }}>
        {mode === "motor"
          ? "동기전동기 1상 등가(근사): V = E_f + jX_s I"
          : "동기발전기 1상 등가(근사): E_f = V + jX_s I"}
      </p>
      <svg width="100%" height="200" viewBox="0 0 440 200">
        <line x1="35" y1="40" x2="400" y2="40" stroke="#718096" strokeWidth="2" />
        <line x1="35" y1="160" x2="400" y2="160" stroke="#718096" strokeWidth="2" />
        <rect x="70" y="72" width="70" height="34" rx="4" fill="#2c3e50" stroke="#63b3ed" />
        <text x="105" y="93" textAnchor="middle" fill="#bee3f8" fontSize="12">
          V (단자)
        </text>
        <line x1="140" y1="89" x2="185" y2="89" stroke="#718096" strokeWidth="2" />
        <rect x="185" y="72" width="70" height="34" rx="4" fill="#2c3e50" stroke="#f6ad55" />
        <text x="220" y="93" textAnchor="middle" fill="#feebc8" fontSize="12">
          jX_s I
        </text>
        <line x1="255" y1="89" x2="295" y2="89" stroke="#718096" strokeWidth="2" />
        <rect x="295" y="72" width="80" height="34" rx="4" fill="#2c3e50" stroke="#f687b3" />
        <text x="335" y="93" textAnchor="middle" fill="#ffd6ec" fontSize="12">
          E_f
        </text>
      </svg>
      <div style={{ fontSize: "13px", lineHeight: 1.65, color: "#d7dfe8" }}>
        <div>V_line: {Vll.toFixed(1)} V</div>
        <div>V_phase: {Vph.toFixed(1)} V</div>
        <div>전류 I: {current.toFixed(2)} A</div>
        <div>역률 cosφ: {powerFactor.toFixed(2)}</div>
        <div>동기 리액턴스 X_s: {xs.toFixed(2)} Ω</div>
        <div>
          계산된 여자기전력 E_f(근사):{" "}
          <strong style={{ color: "#fff" }}>{Ef.toFixed(1)} V</strong>
        </div>
      </div>
    </div>
  );
}

function RotorPreview({ mode }) {
  const isSalient = mode === "alternator_salient";
  const isPmsm = mode === "synchronous_motor";
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
        {isSalient
          ? "돌극형 로터 개념 단면"
          : isPmsm
            ? "동기전동기(PMSM/여자형) 개념 단면"
            : "원통형 로터 개념 단면"}
      </p>
      <svg width="100%" height="220" viewBox="0 0 420 220">
        <circle cx="210" cy="110" r="90" fill="#223" stroke="#5a6b7e" strokeWidth="2" />
        <circle cx="210" cy="110" r="56" fill="#2b3440" stroke="#8796a8" strokeWidth="2" />
        {isSalient ? (
          <>
            <rect x="194" y="38" width="32" height="28" rx="4" fill="#f6ad55" />
            <rect x="194" y="154" width="32" height="28" rx="4" fill="#63b3ed" />
          </>
        ) : (
          <ellipse
            cx="210"
            cy="110"
            rx={isPmsm ? 38 : 44}
            ry={isPmsm ? 54 : 46}
            fill={isPmsm ? "#f687b3" : "#68d391"}
            opacity="0.75"
          />
        )}
        <text x="210" y="20" textAnchor="middle" fill="#a0aec0" fontSize="11">
          고정자
        </text>
        <text x="210" y="114" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold">
          회전자
        </text>
      </svg>
    </div>
  );
}

export default function SynchronousMachineLearningHub() {
  const [activeType, setActiveType] = useState("alternator_salient");
  const [Vll, setVll] = useState(6600);
  const [powerFactor, setPowerFactor] = useState(0.9);
  const [current, setCurrent] = useState(120);
  const [xs, setXs] = useState(3.2);
  const [fieldScale, setFieldScale] = useState(1.0);

  const isMotor = activeType === "synchronous_motor";

  return (
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
      <SynchronousMachineTypeDiagram />
      <SynchronousMachineTypeContent
        activeType={activeType}
        onSelectType={setActiveType}
      />
      <ExamPrepVoiceStrip area="sync" itemId={activeType} />

      <div style={{ padding: "0 20px 24px", display: "grid", gap: "16px" }}>
        <div
          style={{
            padding: "14px",
            borderRadius: "10px",
            border: "1px solid #3a2f43",
            background: "#251c2d",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "10px 14px",
          }}
        >
          <label style={{ fontSize: "12px", color: "#d5c4e0" }}>
            선간전압 V_ll: {Vll} V
            <input
              type="range"
              min="3300"
              max="13200"
              step="100"
              value={Vll}
              onChange={(e) => setVll(Number(e.target.value))}
              style={{ width: "100%" }}
            />
          </label>
          <label style={{ fontSize: "12px", color: "#d5c4e0" }}>
            역률 cosφ: {powerFactor.toFixed(2)}
            <input
              type="range"
              min="0.6"
              max="1"
              step="0.01"
              value={powerFactor}
              onChange={(e) => setPowerFactor(Number(e.target.value))}
              style={{ width: "100%" }}
            />
          </label>
          <label style={{ fontSize: "12px", color: "#d5c4e0" }}>
            전기자전류 I: {current.toFixed(0)} A
            <input
              type="range"
              min="20"
              max="600"
              step="5"
              value={current}
              onChange={(e) => setCurrent(Number(e.target.value))}
              style={{ width: "100%" }}
            />
          </label>
          <label style={{ fontSize: "12px", color: "#d5c4e0" }}>
            동기리액턴스 X_s: {xs.toFixed(2)} Ω
            <input
              type="range"
              min="0.5"
              max="8"
              step="0.1"
              value={xs}
              onChange={(e) => setXs(Number(e.target.value))}
              style={{ width: "100%" }}
            />
          </label>
          <label style={{ fontSize: "12px", color: "#d5c4e0" }}>
            여자 스케일 k_f: {fieldScale.toFixed(2)}
            <input
              type="range"
              min="0.6"
              max="1.4"
              step="0.01"
              value={fieldScale}
              onChange={(e) => setFieldScale(Number(e.target.value))}
              style={{ width: "100%" }}
            />
          </label>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <SynchronousEquivalentPanel
            mode={isMotor ? "motor" : "generator"}
            Vll={Vll}
            powerFactor={powerFactor}
            current={current}
            xs={xs}
            fieldScale={fieldScale}
          />
          <RotorPreview mode={activeType} />
        </div>
      </div>
    </div>
  );
}
