const InductionMotorConfiguration = ({
  voltage,
  setVoltage,
  freq,
  setFreq,
  poles,
  setPoles,
  slip,
  setSlip,
}) => {
  return (
    <div
      style={{
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        backgroundColor: "#f9fafb",
      }}
    >
      <h3 style={{ marginTop: 0 }}>1. 전동기 제어 및 입력</h3>

      <div style={{ marginBottom: "15px" }}>
        <label style={{ display: "block", fontWeight: "bold" }}>
          상전압 (Vs): {voltage} V
        </label>
        <input
          type="range"
          min="100"
          max="440"
          step="10"
          value={voltage}
          onChange={(e) => setVoltage(Number(e.target.value))}
          style={{ width: "100%" }}
        />
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label style={{ display: "block", fontWeight: "bold" }}>
          주파수 (f): {freq} Hz
        </label>
        <select
          value={freq}
          onChange={(e) => setFreq(Number(e.target.value))}
          style={{ width: "100%", padding: "5px" }}
        >
          <option value={50}>50 Hz</option>
          <option value={60}>60 Hz</option>
        </select>
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label style={{ display: "block", fontWeight: "bold" }}>
          극수 (P): {poles} Poles
        </label>
        <select
          value={poles}
          onChange={(e) => setPoles(Number(e.target.value))}
          style={{ width: "100%", padding: "5px" }}
        >
          <option value={2}>2</option>
          <option value={4}>4</option>
          <option value={6}>6</option>
          <option value={8}>8</option>
        </select>
      </div>

      <div
        style={{
          marginBottom: "15px",
          padding: "10px",
          backgroundColor: "#fff",
          borderRadius: "5px",
          border: "1px solid #ddd",
        }}
      >
        <label
          style={{ display: "block", fontWeight: "bold", color: "#2563eb" }}
        >
          슬립 (s): {slip.toFixed(3)}
        </label>
        <input
          type="range"
          min="0.001"
          max="1"
          step="0.001"
          value={slip}
          onChange={(e) => setSlip(Number(e.target.value))}
          style={{ width: "100%" }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "12px",
            color: "#666",
          }}
        >
          <span>동기속도(s=0)</span>
          <span>정지(s=1)</span>
        </div>
      </div>
    </div>
  );
};

export default InductionMotorConfiguration;
