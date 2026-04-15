import { Billboard, OrbitControls, Text } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import * as THREE from "three";

// ==========================================
// [1] 3D 분권 발전기 모델 컴포넌트
// ==========================================
const ShuntGenerator3D = ({ speed, isLoad, Ia, If }) => {
  const rotorRef = useRef();

  useFrame(({ clock }) => {
    if (rotorRef.current) {
      rotorRef.current.rotation.z -= speed * 0.05;
    }
  });

  return (
    <group position={[0, -0.5, 0]}>
      {/* 고정자 (Stator / Yoke) */}
      <mesh rotation={[0, 0, 0]}>
        <tubeGeometry
          args={[new THREE.EllipseCurve(0, 0, 2.5, 2.5), 64, 0.4, 16]}
        />
        <meshStandardMaterial color="#2c3e50" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* 계자 코일 (Field Winding - 분권) - 파란색 계열 */}
      <group position={[2.5, 0, 0]}>
        <mesh>
          <boxGeometry args={[0.8, 1.2, 1.5]} />
          <meshStandardMaterial color="#5d6d7e" metalness={0.35} roughness={0.55} />
        </mesh>
        {[...Array(6)].map((_, i) => (
          <mesh
            key={`f1-${i}`}
            position={[0, -0.5 + i * 0.2, 0]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <torusGeometry args={[0.45, 0.05, 8, 24]} />
            <meshStandardMaterial
              color="#3498db"
              emissive="#3498db"
              emissiveIntensity={If * 0.5}
            />
          </mesh>
        ))}
        <Billboard position={[1, 0, 0]}>
          <Text fontSize={0.4} color="#3498db" fontWeight="bold">
            N
          </Text>
        </Billboard>
      </group>
      <group position={[-2.5, 0, 0]}>
        <mesh>
          <boxGeometry args={[0.8, 1.2, 1.5]} />
          <meshStandardMaterial color="#5d6d7e" metalness={0.35} roughness={0.55} />
        </mesh>
        {[...Array(6)].map((_, i) => (
          <mesh
            key={`f2-${i}`}
            position={[0, -0.5 + i * 0.2, 0]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <torusGeometry args={[0.45, 0.05, 8, 24]} />
            <meshStandardMaterial
              color="#3498db"
              emissive="#3498db"
              emissiveIntensity={If * 0.5}
            />
          </mesh>
        ))}
        <Billboard position={[-1, 0, 0]}>
          <Text fontSize={0.4} color="#3498db" fontWeight="bold">
            S
          </Text>
        </Billboard>
      </group>

      {/* 회전자 및 전기자 코일 (Rotor & Armature) - 붉은색 계열 */}
      <group ref={rotorRef}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[1.5, 1.5, 1.6, 32]} />
          <meshStandardMaterial
            color="#c0c7cf"
            emissive="#3a3f46"
            emissiveIntensity={0.35}
            metalness={0.75}
            roughness={0.28}
          />
        </mesh>
        {[...Array(12)].map((_, i) => (
          <mesh
            key={`a-${i}`}
            position={[
              Math.cos((i / 12) * Math.PI * 2) * 1.5,
              Math.sin((i / 12) * Math.PI * 2) * 1.5,
              0,
            ]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <cylinderGeometry args={[0.08, 0.08, 1.7]} />
            <meshStandardMaterial
              color="#e74c3c"
              emissive="#e74c3c"
              emissiveIntensity={Ia * 0.05}
            />
          </mesh>
        ))}
      </group>

      {/* 축과 정류자 (Commutator) */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 1.2]}>
        <cylinderGeometry args={[0.5, 0.5, 0.8, 16]} />
        <meshStandardMaterial color="#f1c40f" metalness={0.9} />
      </mesh>

      {/* 분권 연결선 (병렬 연결 도식화) */}
      <path d="M 0 1.2 L 2.5 1.2" fill="none" stroke="#f1c40f" />
    </group>
  );
};

// ==========================================
// [2] 메인 시뮬레이터 앱
// ==========================================
export default function ShuntGeneratorSimulator() {
  // 상태 관리 (초기값 설정)
  const [E, setE] = useState(110); // 유기기전력
  const [Ra, setRa] = useState(0.5); // 전기자 저항
  const [Rf, setRf] = useState(55); // 계자 저항
  const [RL, setRL] = useState(10); // 부하 저항
  const [isLoad, setIsLoad] = useState(true); // 부하 유무 스위치

  // 물리적 계산 로직 (비선형 방지 및 정확한 모델링)
  // V = E - Ia*Ra, Ia = I + If, If = V/Rf, I = V/RL
  // => V = E / (1 + Ra/RL + Ra/Rf)
  const loadConductance = isLoad ? 1 / RL : 0;
  const V = E / (1 + Ra * loadConductance + Ra / Rf);
  const If = V / Rf;
  const I = isLoad ? V / RL : 0;
  const Ia = I + If;
  const vDrop = Ia * Ra;

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1000px",
        margin: "0 auto",
        backgroundColor: "#1e2128",
        color: "#fff",
        fontFamily: "sans-serif",
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
      }}
    >
      {/* 헤더 및 컨트롤러 */}
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

      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {/* 상단/좌측: 3D 모델 */}
        <div
          style={{
            flex: "1 1 400px",
            height: "350px",
            position: "relative",
            backgroundColor: "#15171e",
            borderRight: "1px solid #3d424b",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 10,
              left: 10,
              zIndex: 1,
              color: "#fff",
              background: "#000a",
              padding: "5px 10px",
              borderRadius: "4px",
              fontSize: "12px",
            }}
          >
            [3D] 분권 발전기 실제 물리 구조
          </div>
          <Canvas camera={{ position: [0, -3, 6], fov: 50 }}>
            <ambientLight intensity={0.6} />
            <pointLight position={[10, 10, 10]} intensity={1.2} />
            <ShuntGenerator3D speed={E} isLoad={isLoad} Ia={Ia} If={If} />
            <OrbitControls enableZoom={false} />
          </Canvas>
        </div>

        {/* 상단/우측: 등가 회로도 (SVG) */}
        <div
          style={{
            flex: "1 1 400px",
            height: "350px",
            backgroundColor: "#1c1f26",
            position: "relative",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 10,
              left: 10,
              zIndex: 1,
              color: "#fff",
              background: "#000a",
              padding: "5px 10px",
              borderRadius: "4px",
              fontSize: "12px",
            }}
          >
            [회로도] 분권 발전기 등가 회로
          </div>

          <style>
            {`
              @keyframes dash { to { stroke-dashoffset: -20; } }
              .flowing { stroke-dasharray: 5 5; animation: dash 0.5s linear infinite; }
            `}
          </style>

          <svg width="450" height="300" viewBox="0 0 450 300">
            {/* 기본 전선망 (상단/하단 공통선) */}
            <line
              x1="80"
              y1="50"
              x2="350"
              y2="50"
              stroke="#aaa"
              strokeWidth="2"
            />
            <line
              x1="80"
              y1="250"
              x2="350"
              y2="250"
              stroke="#aaa"
              strokeWidth="2"
            />

            {/* 좌측: 계자 코일 (Rf) Branch */}
            <line
              x1="80"
              y1="50"
              x2="80"
              y2="100"
              stroke="#aaa"
              strokeWidth="2"
            />
            <path
              d="M 80 100 Q 100 110 80 120 Q 60 130 80 140 Q 100 150 80 160 Q 60 170 80 180"
              fill="none"
              stroke="#3498db"
              strokeWidth="3"
            />
            <line
              x1="80"
              y1="180"
              x2="80"
              y2="250"
              stroke="#aaa"
              strokeWidth="2"
            />
            <text x="35" y="145" fill="#3498db" fontSize="14" fontWeight="bold">
              Rf
            </text>

            {/* 계자 전류 화살표 */}
            <path
              d="M 75 70 L 80 80 L 85 70"
              fill="none"
              stroke="#3498db"
              strokeWidth="2"
            />
            <text x="50" y="75" fill="#3498db" fontSize="14" fontWeight="bold">
              If
            </text>

            {/* 중앙: 전기자 (E, Ra) Branch */}
            <line
              x1="200"
              y1="50"
              x2="200"
              y2="80"
              stroke="#aaa"
              strokeWidth="2"
            />
            <path
              d="M 200 80 L 190 90 L 210 105 L 190 120 L 210 135 L 200 145"
              fill="none"
              stroke="#e74c3c"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <text
              x="220"
              y="115"
              fill="#e74c3c"
              fontSize="14"
              fontWeight="bold"
            >
              Ra
            </text>

            {/* 발전기 심볼 */}
            <circle
              cx="200"
              cy="185"
              r="30"
              fill="#2c3e50"
              stroke="#f1c40f"
              strokeWidth="2"
            />
            <text
              x="200"
              y="190"
              fill="#f1c40f"
              fontSize="18"
              textAnchor="middle"
              fontWeight="bold"
            >
              E
            </text>
            <text x="240" y="170" fill="#fff" fontSize="16">
              +
            </text>
            <text x="240" y="210" fill="#fff" fontSize="16">
              -
            </text>
            <line
              x1="200"
              y1="215"
              x2="200"
              y2="250"
              stroke="#aaa"
              strokeWidth="2"
            />

            {/* 전기자 전류 화살표 (위로 향함) */}
            <path
              d="M 195 65 L 200 55 L 205 65"
              fill="none"
              stroke="#e74c3c"
              strokeWidth="2"
            />
            <text x="175" y="65" fill="#e74c3c" fontSize="14" fontWeight="bold">
              Ia
            </text>

            {/* 우측: 부하 (Load) Branch */}
            <line
              x1="350"
              y1="50"
              x2="350"
              y2="100"
              stroke="#aaa"
              strokeWidth="2"
            />

            {/* 스위치 (Switch) */}
            {isLoad ? (
              <line
                x1="350"
                y1="100"
                x2="350"
                y2="130"
                stroke="#2ecc71"
                strokeWidth="3"
              />
            ) : (
              <line
                x1="350"
                y1="100"
                x2="320"
                y2="120"
                stroke="#e74c3c"
                strokeWidth="3"
              />
            )}

            {/* 부하 박스 */}
            <rect
              x="330"
              y="130"
              width="40"
              height="80"
              fill={isLoad ? "#2ecc71" : "#555"}
              stroke="#fff"
              strokeWidth="2"
            />
            <text
              x="350"
              y="175"
              fill="#fff"
              fontSize="14"
              textAnchor="middle"
              fontWeight="bold"
            >
              부하
            </text>
            <line
              x1="350"
              y1="210"
              x2="350"
              y2="250"
              stroke="#aaa"
              strokeWidth="2"
            />

            {/* 단자 전압 (V) 표시 */}
            <path
              d="M 390 50 L 390 250"
              fill="none"
              stroke="#fff"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            <polygon points="387,60 393,60 390,50" fill="#fff" />
            <polygon points="387,240 393,240 390,250" fill="#fff" />
            <text x="405" y="155" fill="#fff" fontSize="16" fontWeight="bold">
              V
            </text>

            {/* 부하 전류 화살표 */}
            {isLoad && (
              <>
                <path
                  d="M 345 80 L 350 90 L 355 80"
                  fill="none"
                  stroke="#2ecc71"
                  strokeWidth="2"
                />
                <text
                  x="365"
                  y="85"
                  fill="#2ecc71"
                  fontSize="14"
                  fontWeight="bold"
                >
                  I
                </text>
              </>
            )}

            {/* 노드 점 */}
            <circle cx="80" cy="50" r="4" fill="#fff" />
            <circle cx="200" cy="50" r="4" fill="#fff" />
            <circle cx="350" cy="50" r="4" fill="#fff" />
            <circle cx="80" cy="250" r="4" fill="#fff" />
            <circle cx="200" cy="250" r="4" fill="#fff" />
            <circle cx="350" cy="250" r="4" fill="#fff" />

            {/* 전류 흐름 애니메이션 (Ia -> If, I) */}
            <path
              d="M 200 45 L 80 45 L 80 100"
              fill="none"
              stroke="#3498db"
              strokeWidth="2"
              className="flowing"
            />
            {isLoad && (
              <path
                d="M 200 45 L 350 45 L 350 100"
                fill="none"
                stroke="#2ecc71"
                strokeWidth="2"
                className="flowing"
              />
            )}
          </svg>
        </div>
      </div>

      {/* 하단: 수학적 풀이 과정 */}
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
          📝 {isLoad ? "부하 시 (Loaded)" : "무부하 시 (No Load)"} 계산 과정 및
          해석
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
                <sub>L</sub> + V/R<sub>f</sub>)R<sub>a</sub> <br />V = E / (1 +
                R<sub>a</sub>/R<sub>L</sub> + R<sub>a</sub>/R<sub>f</sub>){" "}
                <br />V = {E} / (1 + {Ra}/{RL} + {Ra}/{Rf}) ={" "}
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
                <sub>L</sub> = {V.toFixed(2)} / {RL} ={" "}
                <strong>{I.toFixed(2)} [A]</strong> <br />
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
                따라서 <strong>V ≈ E</strong> 로 근사하기도 하지만, 정확한 회로
                해석상{" "}
                <strong>
                  V = E - I<sub>a</sub>R<sub>a</sub>
                </strong>{" "}
                가 맞습니다.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
