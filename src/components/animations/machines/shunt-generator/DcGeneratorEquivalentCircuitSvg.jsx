/**
 * DC발전기 타입별 등가회로 — 토폴로지가 서로 다릅니다(단순 수치 변경 아님).
 * 교육용 단선도: 기호 배치·분기 구조를 각 연결법에 맞게 별도 SVG로 그립니다.
 */
export default function DcGeneratorEquivalentCircuitSvg({ type, isLoad }) {
  const closed = isLoad;

  const flowingStyle = `
    @keyframes dash { to { stroke-dashoffset: -20; } }
    .flowing { stroke-dasharray: 5 5; animation: dash 0.5s linear infinite; }
  `;

  switch (type) {
    case "separate":
      return (
        <>
          <style>{flowingStyle}</style>
          <svg width="100%" height="300" viewBox="0 0 460 300" preserveAspectRatio="xMidYMid meet">
            <text x="12" y="22" fill="#9ad8ff" fontSize="13" fontWeight="bold">
              타여자 — 계자는 발전기 단자와 독립(외부 직류전원)
            </text>
            {/* 외부 계자 전원 */}
            <rect x="20" y="45" width="56" height="36" rx="4" fill="#243447" stroke="#79a9ff" strokeWidth="2" />
            <text x="48" y="67" textAnchor="middle" fill="#d7e6ff" fontSize="12">
              Vf
            </text>
            <path d="M76 63 H95 V95 H115" stroke="#79a9ff" strokeWidth="2" fill="none" />
            <path
              d="M115 85 Q 135 95 115 105 Q 95 115 115 125 Q 135 135 115 145"
              fill="none"
              stroke="#79a9ff"
              strokeWidth="3"
            />
            <text x="75" y="118" fill="#79a9ff" fontSize="12" fontWeight="bold">
              Rf
            </text>
            <path d="M115 155 V185 H95 V210" stroke="#79a9ff" strokeWidth="2" fill="none" />
            <text x="125" y="200" fill="#79a9ff" fontSize="11">
              If (독립)
            </text>

            {/* 메인 버스 */}
            <line x1="180" y1="55" x2="380" y2="55" stroke="#aaa" strokeWidth="2" />
            <line x1="180" y1="235" x2="380" y2="235" stroke="#aaa" strokeWidth="2" />

            {/* 전기자 */}
            <line x1="220" y1="55" x2="220" y2="85" stroke="#aaa" strokeWidth="2" />
            <path
              d="M220 85 L210 95 L230 110 L210 125 L230 140 L220 150"
              fill="none"
              stroke="#e74c3c"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <text x="238" y="120" fill="#e74c3c" fontSize="12" fontWeight="bold">
              Ra
            </text>
            <circle cx="220" cy="190" r="28" fill="#2c3e50" stroke="#f1c40f" strokeWidth="2" />
            <text x="220" y="196" textAnchor="middle" fill="#f1c40f" fontSize="16" fontWeight="bold">
              E
            </text>
            <line x1="220" y1="218" x2="220" y2="235" stroke="#aaa" strokeWidth="2" />

            {/* 부하 */}
            <line x1="340" y1="55" x2="340" y2="95" stroke="#aaa" strokeWidth="2" />
            {closed ? (
              <line x1="340" y1="95" x2="340" y2="125" stroke="#2ecc71" strokeWidth="3" />
            ) : (
              <line x1="340" y1="95" x2="315" y2="118" stroke="#e74c3c" strokeWidth="3" />
            )}
            <rect x="320" y="125" width="40" height="72" fill={closed ? "#2ecc71" : "#555"} stroke="#fff" strokeWidth="2" />
            <text x="340" y="165" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold">
              RL
            </text>
            <line x1="340" y1="197" x2="340" y2="235" stroke="#aaa" strokeWidth="2" />

            <path d="M385 55 V235" stroke="#fff" strokeWidth="1" strokeDasharray="4 3" fill="none" />
            <text x="395" y="148" fill="#fff" fontSize="14" fontWeight="bold">
              V
            </text>

            <circle cx="180" cy="55" r="4" fill="#fff" />
            <circle cx="180" cy="235" r="4" fill="#fff" />
            <circle cx="380" cy="55" r="4" fill="#fff" />
            <circle cx="380" cy="235" r="4" fill="#fff" />

            {closed && (
              <path d="M220 50 L340 50" fill="none" stroke="#2ecc71" strokeWidth="2" className="flowing" />
            )}
          </svg>
        </>
      );

    case "self":
      return (
        <>
          <style>{flowingStyle}</style>
          <svg width="100%" height="300" viewBox="0 0 450 300" preserveAspectRatio="xMidYMid meet">
            <text x="12" y="22" fill="#9ad8ff" fontSize="13" fontWeight="bold">
              자여자 — 잔류자속→단자전압→계자전류(대표로 분권 연결 도식)
            </text>
            <line x1="80" y1="50" x2="350" y2="50" stroke="#aaa" strokeWidth="2" />
            <line x1="80" y1="250" x2="350" y2="250" stroke="#aaa" strokeWidth="2" />

            <line x1="80" y1="50" x2="80" y2="100" stroke="#aaa" strokeWidth="2" />
            <path
              d="M80 100 Q 100 110 80 120 Q 60 130 80 140 Q 100 150 80 160 Q 60 170 80 180"
              fill="none"
              stroke="#3498db"
              strokeWidth="3"
            />
            <line x1="80" y1="180" x2="80" y2="250" stroke="#aaa" strokeWidth="2" />
            <text x="35" y="145" fill="#3498db" fontSize="12" fontWeight="bold">
              Rf
            </text>

            <line x1="200" y1="50" x2="200" y2="80" stroke="#aaa" strokeWidth="2" />
            <path
              d="M200 80 L190 90 L210 105 L190 120 L210 135 L200 145"
              fill="none"
              stroke="#e74c3c"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <text x="218" y="115" fill="#e74c3c" fontSize="12" fontWeight="bold">
              Ra
            </text>
            <circle cx="200" cy="185" r="28" fill="#2c3e50" stroke="#f1c40f" strokeWidth="2" />
            <text x="200" y="191" textAnchor="middle" fill="#f1c40f" fontSize="16" fontWeight="bold">
              E
            </text>
            <line x1="200" y1="213" x2="200" y2="250" stroke="#aaa" strokeWidth="2" />

            <line x1="350" y1="50" x2="350" y2="100" stroke="#aaa" strokeWidth="2" />
            {closed ? (
              <line x1="350" y1="100" x2="350" y2="130" stroke="#2ecc71" strokeWidth="3" />
            ) : (
              <line x1="350" y1="100" x2="325" y2="120" stroke="#e74c3c" strokeWidth="3" />
            )}
            <rect x="330" y="130" width="40" height="80" fill={closed ? "#2ecc71" : "#555"} stroke="#fff" strokeWidth="2" />
            <text x="350" y="175" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold">
              RL
            </text>
            <line x1="350" y1="210" x2="350" y2="250" stroke="#aaa" strokeWidth="2" />

            <path d="M390 50 V250" stroke="#fff" strokeWidth="1" strokeDasharray="3 3" fill="none" />
            <text x="402" y="155" fill="#fff" fontSize="14" fontWeight="bold">
              V
            </text>

            <circle cx="80" cy="50" r="4" fill="#fff" />
            <circle cx="200" cy="50" r="4" fill="#fff" />
            <circle cx="350" cy="50" r="4" fill="#fff" />
            <circle cx="80" cy="250" r="4" fill="#fff" />
            <circle cx="200" cy="250" r="4" fill="#fff" />
            <circle cx="350" cy="250" r="4" fill="#fff" />

            {closed && (
              <>
                <path d="M200 45 L80 45 L80 100" fill="none" stroke="#3498db" strokeWidth="2" className="flowing" />
                <path d="M200 45 L350 45 L350 100" fill="none" stroke="#2ecc71" strokeWidth="2" className="flowing" />
              </>
            )}
          </svg>
        </>
      );

    case "shunt":
      return (
        <>
          <style>{flowingStyle}</style>
          <svg width="100%" height="300" viewBox="0 0 450 300" preserveAspectRatio="xMidYMid meet">
            <text x="12" y="22" fill="#9ad8ff" fontSize="13" fontWeight="bold">
              분권 — 계자 Rf가 단자 V에 병렬, Ia = I + If
            </text>
            <line x1="80" y1="50" x2="350" y2="50" stroke="#aaa" strokeWidth="2" />
            <line x1="80" y1="250" x2="350" y2="250" stroke="#aaa" strokeWidth="2" />

            <line x1="80" y1="50" x2="80" y2="100" stroke="#aaa" strokeWidth="2" />
            <path
              d="M80 100 Q 100 110 80 120 Q 60 130 80 140 Q 100 150 80 160 Q 60 170 80 180"
              fill="none"
              stroke="#3498db"
              strokeWidth="3"
            />
            <line x1="80" y1="180" x2="80" y2="250" stroke="#aaa" strokeWidth="2" />
            <text x="35" y="145" fill="#3498db" fontSize="12" fontWeight="bold">
              Rf
            </text>

            <line x1="200" y1="50" x2="200" y2="80" stroke="#aaa" strokeWidth="2" />
            <path
              d="M200 80 L190 90 L210 105 L190 120 L210 135 L200 145"
              fill="none"
              stroke="#e74c3c"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <text x="218" y="115" fill="#e74c3c" fontSize="12" fontWeight="bold">
              Ra
            </text>
            <circle cx="200" cy="185" r="28" fill="#2c3e50" stroke="#f1c40f" strokeWidth="2" />
            <text x="200" y="191" textAnchor="middle" fill="#f1c40f" fontSize="16" fontWeight="bold">
              E
            </text>
            <line x1="200" y1="213" x2="200" y2="250" stroke="#aaa" strokeWidth="2" />

            <line x1="350" y1="50" x2="350" y2="100" stroke="#aaa" strokeWidth="2" />
            {closed ? (
              <line x1="350" y1="100" x2="350" y2="130" stroke="#2ecc71" strokeWidth="3" />
            ) : (
              <line x1="350" y1="100" x2="325" y2="120" stroke="#e74c3c" strokeWidth="3" />
            )}
            <rect x="330" y="130" width="40" height="80" fill={closed ? "#2ecc71" : "#555"} stroke="#fff" strokeWidth="2" />
            <text x="350" y="175" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold">
              RL
            </text>
            <line x1="350" y1="210" x2="350" y2="250" stroke="#aaa" strokeWidth="2" />

            <path d="M390 50 V250" stroke="#fff" strokeWidth="1" strokeDasharray="3 3" fill="none" />
            <text x="402" y="155" fill="#fff" fontSize="14" fontWeight="bold">
              V
            </text>

            <circle cx="80" cy="50" r="4" fill="#fff" />
            <circle cx="200" cy="50" r="4" fill="#fff" />
            <circle cx="350" cy="50" r="4" fill="#fff" />
            <circle cx="80" cy="250" r="4" fill="#fff" />
            <circle cx="200" cy="250" r="4" fill="#fff" />
            <circle cx="350" cy="250" r="4" fill="#fff" />

            {closed && (
              <>
                <path d="M200 45 L80 45 L80 100" fill="none" stroke="#3498db" strokeWidth="2" className="flowing" />
                <path d="M200 45 L350 45 L350 100" fill="none" stroke="#2ecc71" strokeWidth="2" className="flowing" />
              </>
            )}
          </svg>
        </>
      );

    case "series":
      return (
        <>
          <style>{flowingStyle}</style>
          <svg width="100%" height="300" viewBox="0 0 460 300" preserveAspectRatio="xMidYMid meet">
            <text x="12" y="22" fill="#9ad8ff" fontSize="13" fontWeight="bold">
              직권 — 계자 Rse가 부하와 직렬(한 가닥 전류: Ia = I = Ise)
            </text>
            <line x1="40" y1="150" x2="400" y2="150" stroke="#aaa" strokeWidth="2" />

            <circle cx="90" cy="150" r="26" fill="#2c3e50" stroke="#f1c40f" strokeWidth="2" />
            <text x="90" y="156" textAnchor="middle" fill="#f1c40f" fontSize="15" fontWeight="bold">
              E
            </text>

            <line x1="116" y1="150" x2="150" y2="150" stroke="#aaa" strokeWidth="2" />
            <path
              d="M150 135 L145 145 L165 155 L145 165 L165 175 L150 180"
              fill="none"
              stroke="#e74c3c"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <text x="168" y="155" fill="#e74c3c" fontSize="11" fontWeight="bold">
              Ra
            </text>

            <line x1="195" y1="150" x2="230" y2="150" stroke="#aaa" strokeWidth="2" />
            <path
              d="M230 135 L225 145 L245 155 L225 165 L245 175 L230 180"
              fill="none"
              stroke="#e67e22"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <text x="248" y="155" fill="#ffc68d" fontSize="11" fontWeight="bold">
              Rse
            </text>

            <line x1="275" y1="150" x2="310" y2="150" stroke="#aaa" strokeWidth="2" />
            {closed ? (
              <>
                <rect x="310" y="125" width="44" height="50" rx="4" fill="#2ecc71" stroke="#fff" strokeWidth="2" />
                <text x="332" y="154" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold">
                  RL
                </text>
                <line x1="354" y1="150" x2="400" y2="150" stroke="#aaa" strokeWidth="2" />
              </>
            ) : (
              <>
                <line x1="310" y1="150" x2="335" y2="130" stroke="#e74c3c" strokeWidth="3" />
                <text x="318" y="122" fill="#e74c3c" fontSize="11">
                  개방
                </text>
                <line x1="360" y1="150" x2="400" y2="150" stroke="#aaa" strokeWidth="2" strokeDasharray="4 3" />
              </>
            )}

            <text x="200" y="210" fill="#e67e22" fontSize="12">
              If = Ise = I = Ia (직렬 동일 전류)
            </text>

            {closed && (
              <path d="M120 145 H280" fill="none" stroke="#2ecc71" strokeWidth="2" className="flowing" />
            )}
          </svg>
        </>
      );

    case "compound":
      return (
        <>
          <style>{flowingStyle}</style>
          <svg width="100%" height="300" viewBox="0 0 480 320" preserveAspectRatio="xMidYMid meet">
            <text x="12" y="22" fill="#9ad8ff" fontSize="13" fontWeight="bold">
              복권(일반) — 분권 Rf + 직권 Rse를 동시에 사용(연결 세부는 내분권/외분권에서 달라짐)
            </text>
            <line x1="70" y1="55" x2="400" y2="55" stroke="#aaa" strokeWidth="2" />
            <line x1="70" y1="255" x2="400" y2="255" stroke="#aaa" strokeWidth="2" />

            <line x1="90" y1="55" x2="90" y2="105" stroke="#aaa" strokeWidth="2" />
            <path
              d="M90 105 Q 110 115 90 125 Q 70 135 90 145 Q 110 155 90 165 Q 70 175 90 185"
              fill="none"
              stroke="#3498db"
              strokeWidth="3"
            />
            <line x1="90" y1="185" x2="90" y2="255" stroke="#aaa" strokeWidth="2" />
            <text x="45" y="148" fill="#3498db" fontSize="12" fontWeight="bold">
              Rf 분권
            </text>

            <line x1="210" y1="55" x2="210" y2="88" stroke="#aaa" strokeWidth="2" />
            <path
              d="M210 88 L200 98 L220 113 L200 128 L220 143 L210 153"
              fill="none"
              stroke="#e74c3c"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <text x="228" y="123" fill="#e74c3c" fontSize="11" fontWeight="bold">
              Ra
            </text>
            <circle cx="210" cy="188" r="26" fill="#2c3e50" stroke="#f1c40f" strokeWidth="2" />
            <text x="210" y="194" textAnchor="middle" fill="#f1c40f" fontSize="15" fontWeight="bold">
              E
            </text>
            <line x1="210" y1="214" x2="210" y2="255" stroke="#aaa" strokeWidth="2" />

            <line x1="300" y1="55" x2="300" y2="95" stroke="#aaa" strokeWidth="2" />
            <path
              d="M300 95 L292 105 L308 118 L292 131 L308 144 L300 154"
              fill="none"
              stroke="#e67e22"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <text x="312" y="128" fill="#ffc68d" fontSize="11" fontWeight="bold">
              Rse
            </text>
            <line x1="300" y1="154" x2="300" y2="255" stroke="#aaa" strokeWidth="2" />

            <line x1="360" y1="55" x2="360" y2="105" stroke="#aaa" strokeWidth="2" />
            {closed ? (
              <line x1="360" y1="105" x2="360" y2="135" stroke="#2ecc71" strokeWidth="3" />
            ) : (
              <line x1="360" y1="105" x2="335" y2="125" stroke="#e74c3c" strokeWidth="3" />
            )}
            <rect x="340" y="135" width="40" height="78" fill={closed ? "#2ecc71" : "#555"} stroke="#fff" strokeWidth="2" />
            <text x="360" y="178" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold">
              RL
            </text>
            <line x1="360" y1="213" x2="360" y2="255" stroke="#aaa" strokeWidth="2" />

            <path d="M420 55 V255" stroke="#fff" strokeWidth="1" strokeDasharray="3 3" fill="none" />
            <text x="428" y="158" fill="#fff" fontSize="13" fontWeight="bold">
              V
            </text>

            <circle cx="70" cy="55" r="4" fill="#fff" />
            <circle cx="70" cy="255" r="4" fill="#fff" />
            <circle cx="400" cy="55" r="4" fill="#fff" />
            <circle cx="400" cy="255" r="4" fill="#fff" />
          </svg>
        </>
      );

    case "cumulative":
      return (
        <>
          <style>{flowingStyle}</style>
          <svg width="100%" height="320" viewBox="0 0 480 320" preserveAspectRatio="xMidYMid meet">
            <text x="12" y="22" fill="#9ad8ff" fontSize="13" fontWeight="bold">
              내분권(단권) — 분권 Rf가 전기자 단자(브러시 측)에만 걸리는 형태(교육용 단선도)
            </text>
            <text x="12" y="40" fill="#aebccf" fontSize="11">
              점 A: 전기자 출구 · 점 B: 직권 후 부하측 — Rf는 A-(-)에 병렬
            </text>

            <line x1="200" y1="70" x2="380" y2="70" stroke="#aaa" strokeWidth="2" />
            <line x1="200" y1="270" x2="380" y2="270" stroke="#aaa" strokeWidth="2" />

            <line x1="200" y1="70" x2="200" y2="100" stroke="#aaa" strokeWidth="2" />
            <path
              d="M200 100 L190 110 L210 125 L190 140 L210 155 L200 165"
              fill="none"
              stroke="#e74c3c"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <text x="215" y="135" fill="#e74c3c" fontSize="11" fontWeight="bold">
              Ra
            </text>

            <circle cx="200" cy="200" r="26" fill="#2c3e50" stroke="#f1c40f" strokeWidth="2" />
            <text x="200" y="206" textAnchor="middle" fill="#f1c40f" fontSize="15" fontWeight="bold">
              E
            </text>
            <line x1="200" y1="226" x2="200" y2="270" stroke="#aaa" strokeWidth="2" />
            <text x="208" y="248" fill="#ffd28b" fontSize="10">
              A
            </text>

            {/* Rf from A (upper rail from node after armature) - simplified: tap at 260,70 */}
            <line x1="260" y1="70" x2="260" y2="110" stroke="#aaa" strokeWidth="2" />
            <path
              d="M260 110 Q 280 120 260 130 Q 240 140 260 150 Q 280 160 260 170 Q 240 180 260 190"
              fill="none"
              stroke="#3498db"
              strokeWidth="3"
            />
            <line x1="260" y1="190" x2="260" y2="270" stroke="#aaa" strokeWidth="2" />
            <text x="268" y="155" fill="#3498db" fontSize="11" fontWeight="bold">
              Rf
            </text>

            <line x1="300" y1="70" x2="300" y2="100" stroke="#aaa" strokeWidth="2" />
            <path
              d="M300 100 L292 110 L308 123 L292 136 L308 149 L300 159"
              fill="none"
              stroke="#e67e22"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <text x="308" y="132" fill="#ffc68d" fontSize="11" fontWeight="bold">
              Rse
            </text>
            <text x="308" y="188" fill="#ffd28b" fontSize="10">
              B
            </text>

            <line x1="360" y1="70" x2="360" y2="115" stroke="#aaa" strokeWidth="2" />
            {closed ? (
              <line x1="360" y1="115" x2="360" y2="145" stroke="#2ecc71" strokeWidth="3" />
            ) : (
              <line x1="360" y1="115" x2="338" y2="135" stroke="#e74c3c" strokeWidth="3" />
            )}
            <rect x="340" y="145" width="40" height="72" fill={closed ? "#2ecc71" : "#555"} stroke="#fff" strokeWidth="2" />
            <text x="360" y="184" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold">
              RL
            </text>
            <line x1="360" y1="217" x2="360" y2="270" stroke="#aaa" strokeWidth="2" />

            <path d="M400 70 V270" stroke="#fff" strokeWidth="1" strokeDasharray="3 3" fill="none" />
            <text x="408" y="175" fill="#fff" fontSize="13" fontWeight="bold">
              V
            </text>

            <text x="12" y="305" fill="#7ff2a5" fontSize="11">
              가산 복권: 직권 자속이 분권과 같은 방향으로 자속을 보강(부하 보상)
            </text>
          </svg>
        </>
      );

    case "differential":
      return (
        <>
          <style>{flowingStyle}</style>
          <svg width="100%" height="320" viewBox="0 0 480 320" preserveAspectRatio="xMidYMid meet">
            <text x="12" y="22" fill="#9ad8ff" fontSize="13" fontWeight="bold">
              외분권(장권) — 분권 Rf가 부하·직권을 포함한 전체 단자 V에 걸리는 형태(교육용 단선도)
            </text>
            <text x="12" y="40" fill="#aebccf" fontSize="11">
              Rf는 상·하 버스 전체(단자)에 병렬, 직권 Rse는 출력 쪽 직렬
            </text>

            <line x1="70" y1="65" x2="400" y2="65" stroke="#aaa" strokeWidth="2" />
            <line x1="70" y1="265" x2="400" y2="265" stroke="#aaa" strokeWidth="2" />

            <line x1="100" y1="65" x2="100" y2="110" stroke="#aaa" strokeWidth="2" />
            <path
              d="M100 110 Q 120 120 100 130 Q 80 140 100 150 Q 120 160 100 170 Q 80 180 100 190"
              fill="none"
              stroke="#3498db"
              strokeWidth="3"
            />
            <line x1="100" y1="190" x2="100" y2="265" stroke="#aaa" strokeWidth="2" />
            <text x="48" y="152" fill="#3498db" fontSize="11" fontWeight="bold">
              Rf (전체 V)
            </text>

            <line x1="220" y1="65" x2="220" y2="95" stroke="#aaa" strokeWidth="2" />
            <path
              d="M220 95 L210 105 L230 120 L210 135 L230 150 L220 160"
              fill="none"
              stroke="#e74c3c"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <text x="235" y="130" fill="#e74c3c" fontSize="11" fontWeight="bold">
              Ra
            </text>
            <circle cx="220" cy="200" r="26" fill="#2c3e50" stroke="#f1c40f" strokeWidth="2" />
            <text x="220" y="206" textAnchor="middle" fill="#f1c40f" fontSize="15" fontWeight="bold">
              E
            </text>
            <line x1="220" y1="226" x2="220" y2="265" stroke="#aaa" strokeWidth="2" />

            <line x1="310" y1="65" x2="310" y2="100" stroke="#aaa" strokeWidth="2" />
            <path
              d="M310 100 L302 110 L318 123 L302 136 L318 149 L310 159"
              fill="none"
              stroke="#e67e22"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <text x="318" y="132" fill="#ffc68d" fontSize="11" fontWeight="bold">
              Rse
            </text>
            <line x1="310" y1="159" x2="310" y2="265" stroke="#aaa" strokeWidth="2" />

            <line x1="370" y1="65" x2="370" y2="115" stroke="#aaa" strokeWidth="2" />
            {closed ? (
              <line x1="370" y1="115" x2="370" y2="145" stroke="#2ecc71" strokeWidth="3" />
            ) : (
              <line x1="370" y1="115" x2="345" y2="135" stroke="#e74c3c" strokeWidth="3" />
            )}
            <rect x="350" y="145" width="40" height="72" fill={closed ? "#2ecc71" : "#555"} stroke="#fff" strokeWidth="2" />
            <text x="370" y="184" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold">
              RL
            </text>
            <line x1="370" y1="217" x2="370" y2="265" stroke="#aaa" strokeWidth="2" />

            <path d="M430 65 V265" stroke="#fff" strokeWidth="1" strokeDasharray="3 3" fill="none" />
            <text x="438" y="168" fill="#fff" fontSize="13" fontWeight="bold">
              V
            </text>

            <text x="12" y="305" fill="#ff8d8d" fontSize="11">
              감산 복권: 직권 자속이 분권과 반대 방향으로 상쇄(실제 특성은 강한 비선형)
            </text>
          </svg>
        </>
      );

    default:
      return null;
  }
}
