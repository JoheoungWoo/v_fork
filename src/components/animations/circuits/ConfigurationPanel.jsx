const ConfigurationPanel = ({
  vPeak,
  setVPeak,
  freq,
  setFreq,

  // 저항(R) 상태
  activeR,
  setActiveR,
  valR,
  setValR,

  // 코일(L) 상태
  activeL,
  setActiveL,
  valL,
  setValL,

  // 콘덴서(C) 상태
  activeC,
  setActiveC,
  valC,
  setValC,
}) => {
  return (
    <div
      style={{
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        minWidth: "300px",
      }}
    >
      <h3 style={{ marginTop: 0 }}>1. 입력 설정</h3>

      {/* 기본 설정 (전압, 주파수) */}
      <div style={{ marginBottom: "15px" }}>
        <div style={{ marginBottom: "8px" }}>
          <label
            style={{
              display: "inline-block",
              width: "150px",
              fontWeight: "bold",
            }}
          >
            전압 크기 (Vp):{" "}
          </label>
          <input
            type="number"
            value={vPeak}
            onChange={(e) => setVPeak(parseFloat(e.target.value) || 0)}
            style={{ width: "80px", marginRight: "5px" }}
          />{" "}
          V
        </div>
        <div>
          <label
            style={{
              display: "inline-block",
              width: "150px",
              fontWeight: "bold",
            }}
          >
            주파수 (f):{" "}
          </label>
          <input
            type="number"
            value={freq}
            onChange={(e) => setFreq(parseFloat(e.target.value) || 0)}
            style={{ width: "80px", marginRight: "5px" }}
          />{" "}
          Hz
        </div>
      </div>

      <hr
        style={{
          border: "none",
          borderTop: "1px solid #eee",
          margin: "20px 0",
        }}
      />

      {/* 소자 다중 선택 및 값 입력 */}
      <h4 style={{ marginBottom: "15px" }}>소자 선택 (다중 선택 가능)</h4>

      {/* 저항 (R) 영역 */}
      <div
        style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}
      >
        <input
          type="checkbox"
          id="checkR"
          checked={activeR}
          onChange={(e) => setActiveR(e.target.checked)}
          style={{
            width: "18px",
            height: "18px",
            marginRight: "10px",
            cursor: "pointer",
          }}
        />
        <label htmlFor="checkR" style={{ width: "100px", cursor: "pointer" }}>
          저항 (R)
        </label>
        <input
          type="number"
          value={valR}
          onChange={(e) => setValR(parseFloat(e.target.value) || 0)}
          disabled={!activeR}
          style={{
            width: "80px",
            marginRight: "5px",
            backgroundColor: activeR ? "#fff" : "#f0f0f0",
          }}
        />{" "}
        Ω
      </div>

      {/* 코일 (L) 영역 */}
      <div
        style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}
      >
        <input
          type="checkbox"
          id="checkL"
          checked={activeL}
          onChange={(e) => setActiveL(e.target.checked)}
          style={{
            width: "18px",
            height: "18px",
            marginRight: "10px",
            cursor: "pointer",
          }}
        />
        <label htmlFor="checkL" style={{ width: "100px", cursor: "pointer" }}>
          코일 (L)
        </label>
        <input
          type="number"
          value={valL}
          onChange={(e) => setValL(parseFloat(e.target.value) || 0)}
          disabled={!activeL}
          style={{
            width: "80px",
            marginRight: "5px",
            backgroundColor: activeL ? "#fff" : "#f0f0f0",
          }}
        />{" "}
        mH
      </div>

      {/* 콘덴서 (C) 영역 */}
      <div
        style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}
      >
        <input
          type="checkbox"
          id="checkC"
          checked={activeC}
          onChange={(e) => setActiveC(e.target.checked)}
          style={{
            width: "18px",
            height: "18px",
            marginRight: "10px",
            cursor: "pointer",
          }}
        />
        <label htmlFor="checkC" style={{ width: "100px", cursor: "pointer" }}>
          콘덴서 (C)
        </label>
        <input
          type="number"
          value={valC}
          onChange={(e) => setValC(parseFloat(e.target.value) || 0)}
          disabled={!activeC}
          style={{
            width: "80px",
            marginRight: "5px",
            backgroundColor: activeC ? "#fff" : "#f0f0f0",
          }}
        />{" "}
        μF
      </div>
    </div>
  );
};

export default ConfigurationPanel;
