const TYPE_META = {
  separate: {
    name: "타여자 발전기",
    equation: "If = Vf / Rf (외부 계자 전원), V = E - IaRa",
    note: "외부 계자 전원을 사용하므로 계자 제어가 독립적입니다.",
    circuitLabel: "외부 계자전원 + 발전기 본체",
  },
  self: {
    name: "자여자 발전기",
    equation: "If = V / Rf, 잔류자속 기반 자기여자",
    note: "자여자 계열의 공통 동작을 요약 실행합니다.",
    circuitLabel: "자기여자 공통 회로",
  },
  series: {
    name: "직권 발전기",
    equation: "Ia = I = Ise, V = E - Ia(Ra + Rse)",
    note: "부하 전류가 곧 계자 전류가 되어 부하 의존성이 큽니다.",
    circuitLabel: "직렬 계자 회로",
  },
  compound: {
    name: "복권 발전기",
    equation: "Φ = Φsh ± Φse, V = E - Ia(Ra + Rse)",
    note: "분권+직권 계자를 동시에 사용해 전압 보상 특성을 가집니다.",
    circuitLabel: "분권 + 직권 복합 회로",
  },
  cumulative: {
    name: "내분권 복권 발전기",
    equation: "Φ = Φsh + Φse (가산)",
    note: "부하 증가 시 직권 자속이 전압 강하를 보상합니다.",
    circuitLabel: "복권(가산) 회로",
  },
  differential: {
    name: "외분권 복권 발전기",
    equation: "Φ = Φsh - Φse (감산)",
    note: "부하 증가 시 단자전압 저하가 커지는 특성을 시연합니다.",
    circuitLabel: "복권(감산) 회로",
  },
};

function calculateByType(type, { E, Ra, Rf, RL, isLoad }) {
  const loadOn = isLoad ? 1 : 0;
  const safeRL = isLoad ? Math.max(1, RL) : 1e9;
  const safeRf = Math.max(1, Rf);
  const Rse = Math.max(0.05, safeRf * 0.02);
  const Vf = E * 0.9;

  if (type === "separate") {
    const If = Vf / safeRf;
    const I = loadOn ? E / (safeRL + Ra) : 0;
    const Ia = I;
    const V = E - Ia * Ra;
    return { V, I, If, Ia, Rse, Vf };
  }

  if (type === "series") {
    const I = loadOn ? E / (safeRL + Ra + Rse) : 0;
    const Ia = I;
    const If = I;
    const V = E - Ia * (Ra + Rse);
    return { V, I, If, Ia, Rse, Vf };
  }

  if (type === "compound" || type === "cumulative") {
    const loadConductance = loadOn ? 1 / safeRL : 0;
    const baseV = E / (1 + Ra * loadConductance + Ra / safeRf);
    const I = loadOn ? baseV / safeRL : 0;
    const If = baseV / safeRf;
    const Ia = I + If;
    const compensation = I * Rse * 0.35;
    const V = baseV + compensation;
    return { V, I, If, Ia, Rse, Vf };
  }

  if (type === "differential") {
    const loadConductance = loadOn ? 1 / safeRL : 0;
    const baseV = E / (1 + Ra * loadConductance + Ra / safeRf);
    const I = loadOn ? baseV / safeRL : 0;
    const If = baseV / safeRf;
    const Ia = I + If;
    const decompensation = I * Rse * 0.35;
    const V = Math.max(0, baseV - decompensation);
    return { V, I, If, Ia, Rse, Vf };
  }

  // self(자여자) 기본 실행: 분권 근사
  const loadConductance = loadOn ? 1 / safeRL : 0;
  const V = E / (1 + Ra * loadConductance + Ra / safeRf);
  const If = V / safeRf;
  const I = loadOn ? V / safeRL : 0;
  const Ia = I + If;
  return { V, I, If, Ia, Rse, Vf };
}

export default function DcGeneratorTypeExecutionPanel({
  selectedType,
  E,
  Ra,
  Rf,
  RL,
  isLoad,
}) {
  const meta = TYPE_META[selectedType] || TYPE_META.self;
  const values = calculateByType(selectedType, { E, Ra, Rf, RL, isLoad });

  return (
    <div style={{ padding: "20px 20px 26px", backgroundColor: "#21252b" }}>
      <h4 style={{ margin: "0 0 14px", color: "#9ad8ff", fontSize: "19px" }}>
        ▶ {meta.name} 실행 결과
      </h4>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 1fr",
          gap: "14px",
        }}
      >
        <div
          style={{
            backgroundColor: "#1d222a",
            border: "1px solid #394352",
            borderRadius: "10px",
            padding: "14px",
          }}
        >
          <p style={{ margin: "0 0 8px", color: "#ffd28b", fontSize: "14px" }}>
            모델식: {meta.equation}
          </p>
          <p style={{ margin: "0 0 10px", color: "#c6d2e2", fontSize: "13px", lineHeight: 1.6 }}>
            {meta.note}
          </p>
          <div
            style={{
              backgroundColor: "#171b21",
              border: "1px solid #353e4b",
              borderRadius: "8px",
              padding: "10px",
              marginBottom: "10px",
            }}
          >
            <p style={{ margin: "0 0 8px", color: "#8fd3ff", fontSize: "13px" }}>
              [{meta.circuitLabel}]
            </p>
            <svg width="100%" height="90" viewBox="0 0 320 90">
              <line x1="10" y1="20" x2="300" y2="20" stroke="#98a6b9" strokeWidth="2" />
              <line x1="10" y1="70" x2="300" y2="70" stroke="#98a6b9" strokeWidth="2" />
              <rect x="120" y="30" width="64" height="30" rx="6" fill="#2c3e50" stroke="#f1c40f" />
              <text x="152" y="49" textAnchor="middle" fill="#f1c40f" fontSize="12">
                E, Ra
              </text>
              <rect x="230" y="30" width="60" height="30" rx="6" fill="#34495e" stroke="#2ecc71" />
              <text x="260" y="49" textAnchor="middle" fill="#8ff5b8" fontSize="12">
                부하 RL
              </text>
              <line x1="184" y1="45" x2="230" y2="45" stroke="#98a6b9" strokeWidth="2" />
              {(selectedType === "series" ||
                selectedType === "compound" ||
                selectedType === "cumulative" ||
                selectedType === "differential") && (
                <>
                  <rect x="188" y="10" width="34" height="20" rx="4" fill="#3b4a5b" stroke="#e67e22" />
                  <text x="205" y="24" textAnchor="middle" fill="#ffc68d" fontSize="10">
                    직권
                  </text>
                </>
              )}
              {(selectedType !== "series") && (
                <>
                  <path d="M90 20 V50 H120" stroke="#98a6b9" strokeWidth="2" fill="none" />
                  <rect x="56" y="40" width="34" height="20" rx="4" fill="#3b4a5b" stroke="#3498db" />
                  <text x="73" y="54" textAnchor="middle" fill="#8cd7ff" fontSize="10">
                    분권
                  </text>
                </>
              )}
            </svg>
          </div>
        </div>

        <div
          style={{
            backgroundColor: "#1d222a",
            border: "1px solid #394352",
            borderRadius: "10px",
            padding: "14px",
            fontSize: "14px",
            lineHeight: 1.8,
            color: "#d5dfed",
          }}
        >
          <p style={{ margin: 0 }}>
            단자전압 V: <strong style={{ color: "#fff" }}>{values.V.toFixed(2)} V</strong>
          </p>
          <p style={{ margin: 0 }}>
            부하전류 I: <strong style={{ color: "#9ff0c0" }}>{values.I.toFixed(2)} A</strong>
          </p>
          <p style={{ margin: 0 }}>
            계자전류 If: <strong style={{ color: "#9ad8ff" }}>{values.If.toFixed(2)} A</strong>
          </p>
          <p style={{ margin: 0 }}>
            전기자전류 Ia: <strong style={{ color: "#ffb0a3" }}>{values.Ia.toFixed(2)} A</strong>
          </p>
          <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#aebed0" }}>
            (Rse={values.Rse.toFixed(2)}Ω, {selectedType === "separate" ? `Vf=${values.Vf.toFixed(1)}V` : "자기여자"})
          </p>
        </div>
      </div>
    </div>
  );
}
