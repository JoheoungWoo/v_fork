const TYPES = [
  {
    id: "alternator_salient",
    title: "동기발전기 · 돌극형",
    parent: "발전기",
    summary:
      "저속 대형 수력/디젤 계통에서 주로 사용됩니다. 극수가 많고 회전자 돌극 구조가 명확합니다.",
    points: ["기전력 E_f와 무효전력 Q 제어", "전압조정기(AVR) 연동", "P는 기계입력, Q는 여자에 민감"],
  },
  {
    id: "alternator_cylindrical",
    title: "동기발전기 · 원통형",
    parent: "발전기",
    summary:
      "고속 터빈 계통에 적합한 원통형 회전자 구조입니다. 기계적 강성이 높고 고속 운전에 유리합니다.",
    points: ["고속·대용량", "X_d, X_q 차이 상대적으로 작음", "송전계통 기준 발전기 모델"],
  },
  {
    id: "synchronous_motor",
    title: "동기전동기",
    parent: "전동기",
    summary:
      "슬립 없이 동기속도로 회전합니다. 여자 조절로 역률 보상(진상 운전)이 가능하여 산업설비에 활용됩니다.",
    points: ["n = n_s = 120f/P", "기동 시 별도 장치 필요", "과여자로 진상 무효전력 공급 가능"],
  },
];

export default function SynchronousMachineTypeContent({
  activeType,
  onSelectType,
}) {
  return (
    <section
      style={{
        margin: "0 20px 20px",
        padding: "20px",
        backgroundColor: "#241a29",
        borderRadius: "12px",
        border: "1px solid #44304a",
      }}
    >
      <h4 style={{ margin: "0 0 16px", color: "#f687b3", fontSize: "20px" }}>
        유형별 상세 · 실행
      </h4>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "14px",
        }}
      >
        {TYPES.map((item) => {
          const isActive = activeType === item.id;
          return (
            <article
              key={item.id}
              onClick={() => onSelectType?.(item.id)}
              style={{
                backgroundColor: isActive ? "#3d2346" : "#32263a",
                border: isActive ? "1px solid #f687b3" : "1px solid #4a3a54",
                borderRadius: "10px",
                padding: "14px",
                color: "#f5ebfb",
                cursor: "pointer",
                boxShadow: isActive ? "0 0 0 1px rgba(246, 135, 179, 0.35)" : "none",
                transition: "all 0.2s ease",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h5 style={{ margin: 0, color: "#fff", fontSize: "17px" }}>
                  {item.title}
                </h5>
                <span
                  style={{
                    fontSize: "11px",
                    color: "#f6c4db",
                    border: "1px solid #90517a",
                    borderRadius: "999px",
                    padding: "2px 8px",
                  }}
                >
                  {item.parent}
                </span>
              </div>
              <p
                style={{
                  margin: "10px 0",
                  lineHeight: 1.6,
                  fontSize: "14px",
                  color: "#e6d8ef",
                }}
              >
                {item.summary}
              </p>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: "18px",
                  fontSize: "13px",
                  lineHeight: 1.5,
                }}
              >
                {item.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectType?.(item.id);
                }}
                style={{
                  marginTop: "10px",
                  border: "none",
                  borderRadius: "8px",
                  padding: "8px 12px",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#fff",
                  backgroundColor: isActive ? "#b83280" : "#6b46c1",
                  cursor: "pointer",
                }}
              >
                {isActive ? "실행 중" : "이 유형 실행"}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
