export default function ShuntCalculationPanel({
  isLoad,
  E,
  Ra,
  Rf,
  RL,
  V,
  I,
  If,
  Ia,
  vDrop,
}) {
  return (
    <div style={{ padding: "25px", backgroundColor: "#21252b" }}>
      <h4
        style={{
          margin: "0 0 15px 0",
          color: "#f1c40f",
          fontSize: "18px",
          borderBottom: "1px solid #3d424b",
          paddingBottom: "10px",
        }}
      >
        📝 {isLoad ? "부하 시 (Loaded)" : "무부하 시 (No Load)"} 계산 과정 및 해석
      </h4>

      {isLoad ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
            fontSize: "15px",
            lineHeight: "1.7",
            color: "#abb2bf",
          }}
        >
          <div
            style={{
              backgroundColor: "#1e2128",
              padding: "15px",
              borderRadius: "8px",
              borderLeft: "4px solid #2ecc71",
            }}
          >
            <p>
              <strong>1. 전류 분배 법칙:</strong>
            </p>
            <p style={{ paddingLeft: "15px" }}>
              <span style={{ color: "#e74c3c" }}>
                I<sub>a</sub>
              </span>{" "}
              = <span style={{ color: "#2ecc71" }}>I</span> +{" "}
              <span style={{ color: "#3498db" }}>
                I<sub>f</sub>
              </span>
            </p>
            <p>
              <strong>2. 단자 전압 (V) 계산:</strong> (옴의 법칙 연립)
            </p>
            <p style={{ paddingLeft: "15px", fontSize: "14px" }}>
              V = E - I<sub>a</sub>R<sub>a</sub> <br />V = E - (V/R
              <sub>L</sub> + V/R<sub>f</sub>)R<sub>a</sub> <br />V = E / (1 + R
              <sub>a</sub>/R<sub>L</sub> + R<sub>a</sub>/R<sub>f</sub>) <br />V ={" "}
              {E} / (1 + {Ra}/{RL} + {Ra}/{Rf}) ={" "}
              <span
                style={{
                  color: "#fff",
                  fontWeight: "bold",
                  fontSize: "18px",
                }}
              >
                {V.toFixed(2)} [V]
              </span>
            </p>
          </div>
          <div
            style={{
              backgroundColor: "#1e2128",
              padding: "15px",
              borderRadius: "8px",
              borderLeft: "4px solid #f1c40f",
            }}
          >
            <p>
              <strong>3. 각 부 전류 계산:</strong>
            </p>
            <p style={{ paddingLeft: "15px" }}>
              부하 전류 (<span style={{ color: "#2ecc71" }}>I</span>) = V / R
              <sub>L</sub> = {V.toFixed(2)} / {RL} = <strong>{I.toFixed(2)} [A]</strong>{" "}
              <br />
              계자 전류 (
              <span style={{ color: "#3498db" }}>
                I<sub>f</sub>
              </span>
              ) = V / R<sub>f</sub> = {V.toFixed(2)} / {Rf} ={" "}
              <strong>{If.toFixed(2)} [A]</strong> <br />
              전기자 전류 (
              <span style={{ color: "#e74c3c" }}>
                I<sub>a</sub>
              </span>
              ) = I + I<sub>f</sub> = <strong>{Ia.toFixed(2)} [A]</strong>
            </p>
            <p>
              <strong>4. 전압 강하 확인:</strong>
            </p>
            <p style={{ paddingLeft: "15px" }}>
              E = V + I<sub>a</sub>R<sub>a</sub> <br />
              {E} ≒ {V.toFixed(2)} + ({Ia.toFixed(2)} × {Ra}) ={" "}
              {(V + vDrop).toFixed(2)} [V]
            </p>
          </div>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
            fontSize: "15px",
            lineHeight: "1.7",
            color: "#abb2bf",
          }}
        >
          <div
            style={{
              backgroundColor: "#1e2128",
              padding: "15px",
              borderRadius: "8px",
              borderLeft: "4px solid #e74c3c",
            }}
          >
            <p>
              <strong>1. 무부하 조건 (I = 0):</strong>
            </p>
            <p style={{ paddingLeft: "15px" }}>
              부하가 개방되었으므로 단자전류{" "}
              <span style={{ color: "#2ecc71" }}>I = 0</span> 입니다. <br />
              따라서{" "}
              <span style={{ color: "#e74c3c" }}>
                I<sub>a</sub>
              </span>{" "}
              ={" "}
              <span style={{ color: "#3498db" }}>
                I<sub>f</sub>
              </span>{" "}
              가 됩니다.
            </p>
            <p>
              <strong>2. 단자 전압 (V) 계산:</strong>
            </p>
            <p style={{ paddingLeft: "15px", fontSize: "14px" }}>
              V = E - I<sub>a</sub>R<sub>a</sub> <br />V = E / (1 + R
              <sub>a</sub>/R<sub>f</sub>) <br />V = {E} / (1 + {Ra}/{Rf}) ={" "}
              <span
                style={{
                  color: "#fff",
                  fontWeight: "bold",
                  fontSize: "18px",
                }}
              >
                {V.toFixed(2)} [V]
              </span>
            </p>
          </div>
          <div
            style={{
              backgroundColor: "#1e2128",
              padding: "15px",
              borderRadius: "8px",
              borderLeft: "4px solid #f1c40f",
            }}
          >
            <p>
              <strong>3. 각 부 전류 계산:</strong>
            </p>
            <p style={{ paddingLeft: "15px" }}>
              부하 전류 (<span style={{ color: "#2ecc71" }}>I</span>) ={" "}
              <strong>0 [A]</strong> <br />
              계자 전류 (
              <span style={{ color: "#3498db" }}>
                I<sub>f</sub>
              </span>
              ) = V / R<sub>f</sub> = {V.toFixed(2)} / {Rf} ={" "}
              <strong>{If.toFixed(2)} [A]</strong> <br />
              전기자 전류 (
              <span style={{ color: "#e74c3c" }}>
                I<sub>a</sub>
              </span>
              ) = I<sub>f</sub> = <strong>{Ia.toFixed(2)} [A]</strong>
            </p>
            <p>
              <strong>💡 중요 해석:</strong>
            </p>
            <p style={{ paddingLeft: "15px", fontSize: "14px" }}>
              무부하 시에도 계자 전류(If)가 미세하게 흐르므로 아주 약간의
              전압강하(I<sub>a</sub>R<sub>a</sub> = {vDrop.toFixed(2)}V)가
              발생합니다.
              <br />
              따라서 <strong>V ≈ E</strong> 로 근사하기도 하지만, 정확한 회로 해석상{" "}
              <strong>V = E - I<sub>a</sub>R<sub>a</sub></strong> 가 맞습니다.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
