const TYPES = [
  {
    id: "three_phase_cage",
    title: "3상 · 케이지형",
    parent: "3상 유도전동기",
    summary:
      "회전자 도체가 단락된 케이지(또는 이와 동등한 단락봉) 구조입니다. 구조가 단순하고 견고해 산업용에서 가장 많이 쓰입니다.",
    points: ["슬립에 의해 전기자에서 유도전류", "외부 회전자 저항 없음", "3상 회전자계 + 단락 회전자"],
  },
  {
    id: "three_phase_wound",
    title: "3상 · 권선형(슬립링)",
    parent: "3상 유도전동기",
    summary:
      "회전자 권선을 슬립링으로 인출해 외부 저항을 넣을 수 있습니다. 시동 토크·속도 조절에 유리하지만 구조가 복잡합니다.",
    points: ["R₂ 또는 외부 저항으로 특성 조절", "슬립링·브러시 유지보수", "등가회로에서 R₂/s 가변 해석"],
  },
  {
    id: "single_phase",
    title: "단상 유도전동기",
    parent: "단상 전원",
    summary:
      "단상 전원만으로는 회전자계가 원형이 되지 않아, 보조 권선·축콘덴서·저항분할 등으로 위상차를 만들어 기동합니다.",
    points: ["주권선 + 보조(또는 콘덴서)", "기동 후 원심 스위치 등으로 보조 분리 가능", "3상 대비 출력·효율 제한"],
  },
];

export default function InductionMotorTypeContent({ activeType, onSelectType }) {
  return (
    <section
      style={{
        margin: "0 20px 20px",
        padding: "20px",
        backgroundColor: "#1a2220",
        borderRadius: "12px",
        border: "1px solid #2d3f3c",
      }}
    >
      <h4
        style={{
          margin: "0 0 16px",
          color: "#81e6d9",
          fontSize: "20px",
        }}
      >
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
                backgroundColor: isActive ? "#1e3530" : "#243330",
                border: isActive ? "1px solid #4fd1c5" : "1px solid #354845",
                borderRadius: "10px",
                padding: "14px",
                color: "#e8f4f1",
                cursor: "pointer",
                boxShadow: isActive ? "0 0 0 1px rgba(79, 209, 197, 0.35)" : "none",
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
                <h5 style={{ margin: 0, color: "#fff", fontSize: "17px" }}>{item.title}</h5>
                <span
                  style={{
                    fontSize: "11px",
                    color: "#a8e8df",
                    border: "1px solid #3d8a7e",
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
                  color: "#c5ddd8",
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
                  backgroundColor: isActive ? "#2c7a7b" : "#276749",
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
