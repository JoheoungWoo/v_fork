import DcGeneratorEquivalentCircuitSvg from "./DcGeneratorEquivalentCircuitSvg";
import { calculateDcGeneratorOperatingPoint } from "./dcGeneratorCalculations";

const TYPE_META = {
  separate: {
    name: "타여자 발전기",
    equation: "V = E - I_a R_a,  I_f = V_f / R_f (외부 전원과 독립)",
    note: "계자 회로가 단자와 분리되어 있어 자속 제어가 부하와 독립적으로 가능합니다.",
    calcNote: "부하 시 I=V/R_L, I_a=I. 무부하 시 I=0, V≈E.",
  },
  self: {
    name: "자여자 발전기",
    equation: "잔류자속으로 기동 → V 발생 → I_f = V / R_f (대표: 분권)",
    note: "외부 계자전원 없이 발전기 출력으로 계자를 공급합니다. 하위 분류(분권·직권·복권)에서 연결이 갈립니다.",
    calcNote: "실행 수치는 대표적으로 분권 자여자 식을 사용합니다.",
  },
  shunt: {
    name: "분권 발전기",
    equation: "V = E / (1 + R_a/R_L + R_a/R_f),  I_a = I + I_f",
    note: "계자가 단자에 병렬이므로 I_f는 단자전압 V에 의해 결정됩니다.",
    calcNote: "정상 상태 근사(선형 등가) 식입니다.",
  },
  series: {
    name: "직권 발전기",
    equation: "I = E / (R_a + R_{se} + R_L),  V = I R_L,  I_{se} = I",
    note: "계자 권선이 부하와 직렬이라 부하전류가 곧 직권 전류입니다(실제 유기기전력은 자속·속도에 연동).",
    calcNote: "교육용: E를 일정 유기기전력으로 두고 직렬 합성저항으로 근사합니다.",
  },
  compound: {
    name: "복권 발전기",
    equation: "장권식: V = E / (1 + R_a/R_f + (R_a+R_{se})/R_L) 등",
    note: "분권과 직권을 함께 쓰므로, 내분권·외분권에 따라 분권이 걸리는 전압이 달라집니다.",
    calcNote: "아래 도식은 일반 구조, 수치는 장권(외분권) 누적형에 가까운 선형 모델입니다.",
  },
  cumulative: {
    name: "내분권(단권) 복권 — 가산",
    equation: "단권: I_f = (E - I_a R_a)/R_f 와 V = E - I_a R_a - I R_{se} 를 연립",
    note: "분권이 전기자 단자 쪽 전압에 걸리는 형태로, 직권은 부하 쪽에 직렬로 둔 단선도가 많습니다.",
    calcNote: "아래 해는 단권 가산 복권의 연립 1차 근사입니다.",
  },
  differential: {
    name: "외분권(장권) 복권 — 감산",
    equation: "장권: V = E / (1 + R_a/R_f + (R_a+α R_{se})/R_L) (α>1 로 자속 상쇄 반영)",
    note: "분권이 전체 단자에 걸리고 직권이 출력 측에 직렬인 형태가 흔합니다. 감산은 자속 상쇄로 강한 비선형입니다.",
    calcNote: "교육용 선형화: 직권 항에 α=1.35를 곱해 상쇄를 단순 반영했습니다.",
  },
};

export default function DcGeneratorTypeExecutionPanel({
  selectedType,
  E,
  Ra,
  Rf,
  RL,
  isLoad,
  showDiagram = true,
}) {
  const meta = TYPE_META[selectedType] || TYPE_META.self;
  const values = calculateDcGeneratorOperatingPoint(selectedType, {
    E,
    Ra,
    Rf,
    RL,
    isLoad,
  });

  return (
    <div style={{ padding: "20px 20px 26px", backgroundColor: "#21252b" }}>
      <h4 style={{ margin: "0 0 14px", color: "#9ad8ff", fontSize: "19px" }}>
        ▶ {meta.name} 실행 결과
      </h4>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.25fr 0.95fr",
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
          <p style={{ margin: "0 0 6px", color: "#c6d2e2", fontSize: "13px", lineHeight: 1.6 }}>
            {meta.note}
          </p>
          <p style={{ margin: "0 0 12px", color: "#8aa0b8", fontSize: "12px", lineHeight: 1.55 }}>
            {meta.calcNote}
          </p>
          {showDiagram && (
            <div
              style={{
                backgroundColor: "#171b21",
                border: "1px solid #353e4b",
                borderRadius: "8px",
                padding: "8px",
                overflow: "hidden",
              }}
            >
              <DcGeneratorEquivalentCircuitSvg type={selectedType} isLoad={isLoad} />
            </div>
          )}
        </div>

        <div
          style={{
            backgroundColor: "#1d222a",
            border: "1px solid #394352",
            borderRadius: "10px",
            padding: "14px",
            fontSize: "14px",
            lineHeight: 1.85,
            color: "#d5dfed",
          }}
        >
          <p style={{ margin: "0 0 8px", fontSize: "12px", color: "#9ad8ff" }}>
            연립 모드: <strong style={{ color: "#fff" }}>{values.mode}</strong>
          </p>
          <p style={{ margin: 0 }}>
            단자전압 V: <strong style={{ color: "#fff" }}>{values.V.toFixed(2)} V</strong>
          </p>
          <p style={{ margin: 0 }}>
            부하전류 I: <strong style={{ color: "#9ff0c0" }}>{values.I.toFixed(2)} A</strong>
          </p>
          <p style={{ margin: 0 }}>
            분권 계자 If: <strong style={{ color: "#9ad8ff" }}>{values.If.toFixed(2)} A</strong>
          </p>
          <p style={{ margin: 0 }}>
            전기자전류 I_a: <strong style={{ color: "#ffb0a3" }}>{values.Ia.toFixed(2)} A</strong>
          </p>
          {(selectedType === "series" ||
            selectedType === "compound" ||
            selectedType === "cumulative" ||
            selectedType === "differential") && (
            <p style={{ margin: 0 }}>
              직권 전류 I_se:{" "}
              <strong style={{ color: "#ffc68d" }}>{values.Ise.toFixed(2)} A</strong>
            </p>
          )}
          <p style={{ margin: "10px 0 0", fontSize: "12px", color: "#aebed0" }}>
            R_se = {values.Rse.toFixed(2)} Ω
            {selectedType === "separate" && (
              <>
                {" "}
                · 외부 V_f = {values.Vf.toFixed(1)} V (슬라이더 E와 별개 튜닝 가정)
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
