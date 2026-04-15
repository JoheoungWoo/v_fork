export const TYPE_CONTENTS = [
  {
    id: "separate",
    title: "타여자 발전기",
    parent: "DC발전기",
    summary:
      "계자 권선이 외부 직류 전원에서 전류를 공급받는 구조입니다. 출력 전압 제어가 쉽고 실험/제어 목적에 유리합니다.",
    keyFormula: "V = E - I_a R_a,  I_f = V_f / R_f (외부 전원)",
    points: ["전압 조정 범위가 넓음", "기동 시 자기 확립이 안정적", "별도 계자 전원 필요"],
  },
  {
    id: "self",
    title: "자여자 발전기",
    parent: "DC발전기",
    summary:
      "자기 잔류 자속을 이용해 발전기 자체 출력으로 계자 전류를 만드는 구조입니다. 실용 발전기의 기본 분류입니다.",
    keyFormula: "I_f = V / R_f (자기여자),  V = E - I_a R_a",
    points: ["별도 계자 전원 불필요", "자속-전압 자기여자 조건 필요", "분권/직권/복권으로 세분"],
  },
  {
    id: "shunt",
    title: "분권 발전기",
    parent: "자여자",
    summary:
      "계자 권선이 단자 전압과 병렬(분권)로 연결됩니다. 부하 변동 시 전압 변동이 비교적 작아 일반 직류 전원에 적합합니다.",
    keyFormula: "I_a = I + I_f,  I_f = V / R_f",
    points: ["전압 특성이 비교적 안정", "고저항 계자 권선 사용", "조명/일반 DC 공급에 적합"],
  },
  {
    id: "series",
    title: "직권 발전기",
    parent: "자여자",
    summary:
      "계자 권선이 부하와 직렬로 연결되어 부하 전류와 동일 전류가 계자에 흐릅니다. 부하가 커질수록 자속이 증가하는 특성이 있습니다.",
    keyFormula: "I_a = I = I_se,  V = E - I_a(R_a + R_se)",
    points: ["저저항 직권 계자 사용", "부하에 따라 전압 변동 큼", "특수 목적(부스터 등)에 사용"],
  },
  {
    id: "compound",
    title: "복권 발전기",
    parent: "자여자",
    summary:
      "분권 계자와 직권 계자를 모두 사용하는 구조로, 전압 조정 능력과 부하 대응을 함께 확보합니다.",
    keyFormula: "자속 = 분권 계자 자속 ± 직권 계자 자속",
    points: ["분권 + 직권의 장점 결합", "부하 대응 성능 우수", "내분권/외분권으로 구분"],
  },
  {
    id: "cumulative",
    title: "내분권 복권 발전기",
    parent: "복권",
    summary:
      "직권 계자 자속이 분권 계자 자속을 돕는(가산) 방식입니다. 부하 증가 시 전압 강하를 보상해 실무에서 가장 널리 사용됩니다.",
    keyFormula: "Φ_total = Φ_sh + Φ_se (가산)",
    points: ["전압 변동률 개선", "송전/배전용 DC 공급에 유리", "실사용 빈도가 높음"],
  },
  {
    id: "differential",
    title: "외분권 복권 발전기",
    parent: "복권",
    summary:
      "직권 계자 자속이 분권 계자 자속을 상쇄(감산)하는 방식입니다. 부하 증가 시 단자 전압이 빠르게 낮아져 특수 용도에 한정됩니다.",
    keyFormula: "Φ_total = Φ_sh - Φ_se (감산)",
    points: ["부하 증가 시 전압 급강하", "과전류 억제 성질 활용 가능", "일반 전원용으로는 비권장"],
  },
];

function MiniConnection({ kind }) {
  if (kind === "separate") {
    return (
      <svg width="220" height="110" viewBox="0 0 220 110">
        <rect x="8" y="20" width="62" height="28" rx="4" fill="#243447" stroke="#79a9ff" />
        <text x="39" y="39" textAnchor="middle" fill="#d7e6ff" fontSize="12">
          외부전원
        </text>
        <path d="M70 34 H100 V82 H180" stroke="#95a5a6" strokeWidth="2" fill="none" />
        <rect x="100" y="68" width="80" height="28" rx="4" fill="#2c3e50" stroke="#f1c40f" />
        <text x="140" y="86" textAnchor="middle" fill="#f1c40f" fontSize="12">
          발전기 단자
        </text>
        <path d="M30 48 V90 H80" stroke="#79a9ff" strokeWidth="2" fill="none" />
        <text x="82" y="94" fill="#79a9ff" fontSize="11">
          계자 회로
        </text>
      </svg>
    );
  }

  if (kind === "series") {
    return (
      <svg width="220" height="110" viewBox="0 0 220 110">
        <rect x="20" y="42" width="52" height="24" rx="4" fill="#2c3e50" stroke="#f1c40f" />
        <text x="46" y="58" textAnchor="middle" fill="#f1c40f" fontSize="12">
          E,Ra
        </text>
        <path d="M72 54 H110" stroke="#95a5a6" strokeWidth="2" />
        <rect x="110" y="42" width="45" height="24" rx="4" fill="#34495e" stroke="#e67e22" />
        <text x="132" y="58" textAnchor="middle" fill="#ffcf99" fontSize="12">
          직권
        </text>
        <path d="M155 54 H195" stroke="#95a5a6" strokeWidth="2" />
        <text x="60" y="88" fill="#e67e22" fontSize="11">
          부하전류 = 계자전류
        </text>
      </svg>
    );
  }

  if (kind === "compound" || kind === "cumulative" || kind === "differential") {
    const sign = kind === "differential" ? "감산(-)" : "가산(+)";
    return (
      <svg width="220" height="110" viewBox="0 0 220 110">
        <rect x="20" y="40" width="50" height="24" rx="4" fill="#2c3e50" stroke="#f1c40f" />
        <text x="45" y="56" textAnchor="middle" fill="#f1c40f" fontSize="12">
          E,Ra
        </text>
        <path d="M70 52 H105 V24 H160" stroke="#95a5a6" strokeWidth="2" fill="none" />
        <rect x="160" y="12" width="44" height="22" rx="4" fill="#34495e" stroke="#3498db" />
        <text x="182" y="27" textAnchor="middle" fill="#7fd3ff" fontSize="11">
          분권
        </text>
        <path d="M105 52 H145" stroke="#95a5a6" strokeWidth="2" />
        <rect x="145" y="40" width="44" height="24" rx="4" fill="#34495e" stroke="#e67e22" />
        <text x="167" y="56" textAnchor="middle" fill="#ffcf99" fontSize="11">
          직권
        </text>
        <path d="M189 52 H206" stroke="#95a5a6" strokeWidth="2" />
        <text x="88" y="94" fill={kind === "differential" ? "#ff8d8d" : "#7ff2a5"} fontSize="11">
          자속 합성: {sign}
        </text>
      </svg>
    );
  }

  return (
    <svg width="220" height="110" viewBox="0 0 220 110">
      <rect x="20" y="42" width="54" height="24" rx="4" fill="#2c3e50" stroke="#f1c40f" />
      <text x="47" y="58" textAnchor="middle" fill="#f1c40f" fontSize="12">
        E,Ra
      </text>
      <path d="M74 54 H114 V20 H180 V54" stroke="#95a5a6" strokeWidth="2" fill="none" />
      <rect x="118" y="8" width="58" height="22" rx="4" fill="#34495e" stroke="#3498db" />
      <text x="147" y="23" textAnchor="middle" fill="#7fd3ff" fontSize="11">
        분권계자
      </text>
      <text x="80" y="92" fill="#7fd3ff" fontSize="11">
        병렬(분권) 연결
      </text>
    </svg>
  );
}

export default function DcGeneratorTypeContent({
  activeType = "shunt",
  onSelectType,
}) {
  return (
    <section
      style={{
        margin: "0 20px 20px",
        padding: "20px",
        backgroundColor: "#1f232b",
        borderRadius: "12px",
        border: "1px solid #343b47",
      }}
    >
      <h4 style={{ margin: "0 0 16px", color: "#8ad4ff", fontSize: "20px" }}>
        DC발전기 분류별 상세 구현
      </h4>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "14px",
        }}
      >
        {TYPE_CONTENTS.map((item) => {
          const isActive = activeType === item.id;
          return (
          <article
            key={item.id}
            onClick={() => onSelectType?.(item.id)}
            style={{
              backgroundColor: isActive ? "#213047" : "#262c36",
              border: isActive ? "1px solid #6ab8ff" : "1px solid #3d4655",
              borderRadius: "10px",
              padding: "14px",
              color: "#e5ecf6",
              cursor: "pointer",
              boxShadow: isActive ? "0 0 0 1px rgba(106,184,255,0.35)" : "none",
              transition: "all 0.2s ease",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h5 style={{ margin: 0, color: "#fff", fontSize: "18px" }}>{item.title}</h5>
              <span
                style={{
                  fontSize: "11px",
                  color: "#b8d8ff",
                  border: "1px solid #4d79aa",
                  borderRadius: "999px",
                  padding: "2px 8px",
                }}
              >
                상위: {item.parent}
              </span>
            </div>

            <p style={{ margin: "10px 0", lineHeight: 1.6, fontSize: "14px", color: "#ced8e6" }}>
              {item.summary}
            </p>

            <div
              style={{
                backgroundColor: "#1d222a",
                border: "1px solid #3d4655",
                borderRadius: "8px",
                display: "flex",
                justifyContent: "center",
                padding: "8px",
                marginBottom: "10px",
              }}
            >
              <MiniConnection kind={item.id} />
            </div>

            <p style={{ margin: "0 0 8px", fontSize: "13px", color: "#ffd28b" }}>
              핵심식: {item.keyFormula}
            </p>
            <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "13px", lineHeight: 1.5 }}>
              {item.points.map((point) => (
                <li key={point}>{point}</li>
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
                backgroundColor: isActive ? "#1f8b4c" : "#2f6ea7",
                cursor: "pointer",
              }}
            >
              {isActive ? "실행 중" : "클릭 실행"}
            </button>
          </article>
          );
        })}
      </div>
    </section>
  );
}
