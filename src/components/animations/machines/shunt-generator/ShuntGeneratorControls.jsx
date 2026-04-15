export default function ShuntGeneratorControls({
  E,
  setE,
  Ra,
  setRa,
  Rf,
  setRf,
  RL,
  setRL,
  isLoad,
  setIsLoad,
}) {
  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "#282c34",
        borderBottom: "1px solid #3d424b",
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "20px",
      }}
    >
      <h3 style={{ margin: 0, color: "#61dafb" }}>
        직류 분권 발전기 (DC Shunt Generator) 해석
      </h3>

      <div
        style={{
          display: "flex",
          gap: "15px",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <label
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: "12px",
            color: "#aaa",
          }}
        >
          <span>
            유기기전력 (E) : <strong>{E} V</strong>
          </span>
          <input
            type="range"
            min="50"
            max="200"
            step="5"
            value={E}
            onChange={(e) => setE(Number(e.target.value))}
          />
        </label>
        <label
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: "12px",
            color: "#aaa",
          }}
        >
          <span>
            전기자 저항 (Ra) : <strong>{Ra} Ω</strong>
          </span>
          <input
            type="range"
            min="0.1"
            max="2.0"
            step="0.1"
            value={Ra}
            onChange={(e) => setRa(Number(e.target.value))}
          />
        </label>
        <label
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: "12px",
            color: "#aaa",
          }}
        >
          <span>
            계자 저항 (Rf) : <strong>{Rf} Ω</strong>
          </span>
          <input
            type="range"
            min="10"
            max="100"
            step="5"
            value={Rf}
            onChange={(e) => setRf(Number(e.target.value))}
          />
        </label>
        <label
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: "12px",
            color: "#aaa",
          }}
        >
          <span>
            부하 저항 (RL) : <strong>{RL} Ω</strong>
          </span>
          <input
            type="range"
            min="1"
            max="50"
            step="1"
            value={RL}
            onChange={(e) => setRL(Number(e.target.value))}
            disabled={!isLoad}
            style={{ opacity: isLoad ? 1 : 0.3 }}
          />
        </label>

        <button
          onClick={() => setIsLoad(!isLoad)}
          style={{
            padding: "10px 20px",
            fontSize: "14px",
            fontWeight: "bold",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            backgroundColor: isLoad ? "#e74c3c" : "#2ecc71",
            color: "#fff",
            marginLeft: "10px",
          }}
        >
          {isLoad ? "부하 개방 (무부하 전환)" : "부하 투입 (부하 전환)"}
        </button>
      </div>
    </div>
  );
}
