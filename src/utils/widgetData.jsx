import { lazy } from "react";

const PowerTrianglePowerFactorLazy = lazy(
  () =>
    import("@/components/animations/circuits/PowerTrianglePowerFactorWidget"),
);

/**
 * 🌟 [Single Source of Truth]
 * DB의 'lecture_id'를 키(Key) 값으로 사용하여 위젯을 직접 연결합니다.
 * 하나의 강의에 여러 위젯이 들어갈 수 있도록 모든 값은 배열([])로 관리합니다.
 */
const WIDGET_MAP = {
  // ==========================================
  // ⚡ 회로이론 (Circuit Theory)
  // ==========================================
  /** Y–Δ 결선도 3D — 백엔드 handler `machine_y_delta_wiring` (wiring_diagram_3d) */
  /** 전위 다양체(지형) + 전류 입자 — lecture_id: voltage_manifold 또는 machine_voltage_manifold */
  voltage_manifold: [
    lazy(() =>
      import("@/components/animations/machines/MachineWidgetPage").then(
        (m) => ({
          default: function VoltageManifoldWidgetPage() {
            return <m.default widgetHandlerId="voltage_manifold" />;
          },
        }),
      ),
    ),
  ],
  "6_ohms_law": [
    lazy(() => import("@/components/animations/ParallelResistanceWidget")),
  ],
  "3_circuit_ydelta": [
    lazy(() => import("@/components/animations/YDeltaConverterWidget")),
  ],
  "7_reactance_3d": [
    // 💡 7강에는 2개의 위젯이 렌더링됩니다! (콤마로 연결)
    lazy(() => import("@/components/animations/Reactance3DWidget")),
    lazy(
      () =>
        import("@/components/animations/circuits/MobileCoilAndCapacitorWidget"),
    ),
    lazy(() => import("@/components/animations/circuits/LCSimulator")),
    lazy(() => import("@/components/animations/circuits/DualityWidget")),
  ],
  "8_time_constant": [
    lazy(() => import("@/components/animations/circuits/TimeConstantWidget")),
    lazy(() => import("@/components/animations/circuits/RCCircuit")),
  ],
  "9_circuit_analysis_rlc": [
    lazy(() => import("@/components/animations/circuits/RLCCombinedWidget")),
  ],
  "1_frequency_meaning": [
    lazy(() => import("@/components/animations/circuits/SineWaveWidget")),
  ],
  /** 전기기사·회로: 전력 삼각형 P/Q/S, 역률, 콘덴서 보상 (DB lecture_id 아무거나 하나만 맞추면 됨) */
  ee_power_triangle: [PowerTrianglePowerFactorLazy],
  /** Supabase 등에서 쓰는 lecture_id 예: power_triangle_lec */
  power_triangle_lec: [PowerTrianglePowerFactorLazy],
  // ==========================================
  // 🧲 전자기학 (Electromagnetics)
  // ==========================================
  "1_coulombs_law": [
    lazy(() => import("@/components/animations/CoulombsLaw3DPage")),
  ],
  /** 플레밍 방향 퀴즈 + 말굽자석·원판 3D (왼손 GLB는 lecture_id `flemming_left_hand_3d` 등 별도 키로 분리 가능) */
  "5_flemming_law": [
    lazy(() => import("@/components/animations/magnetics/FlemingWidget")),
    lazy(
      () =>
        import("@/components/animations/magnetics/HorseshoeMagnetDiskWidget"),
    ),
  ],
  /** 플레밍 왼손 GLB + 이미지 모드 — DB lecture_id를 이 값으로 두면 손 위젯만 씁니다. */
  flemming_left_hand_3d: [
    lazy(
      () => import("@/components/animations/magnetics/FlemingLeftHand3DWidget"),
    ),
  ],
  /** 플레밍 오른손 법칙(발전기): B, v, I(=v×B) 3D 시각화 */
  flemming_right_hand_3d: [
    lazy(
      () => import("@/components/animations/magnetics/FlemingRightHandWidget"),
    ),
  ],
  "2_equipotential_3d": [
    lazy(() => import("@/components/animations/Equipotential3DWidget")),
  ],
  "3_ampere_law": [
    lazy(() => import("@/components/animations/AmpereLawWidget")),
  ],
  "4_vector_calculus": [
    lazy(
      () => import("@/components/animations/magnetics/VectorCalculus3DWidget"),
    ),
  ],
  "5_electro_magnetic": [
    lazy(
      () =>
        import("@/components/animations/magnetics/ElectromagneticInductionApp"),
    ),
  ],
  /** 말굽 자석 + 원판만 (플레밍 퀴즈 없이) — Supabase `lecture_id`와 동일하게 맞추세요. */
  horseshoe_magnet_disk: [
    lazy(
      () =>
        import("@/components/animations/magnetics/HorseshoeMagnetDiskWidget"),
    ),
  ],

  // ==========================================
  // 📐 기초수학 (Basic Math)
  // ==========================================
  "10_trig_function_1": [
    lazy(() => import("@/components/animations/InteractiveUnitCircle")),
  ],
  "10_integral": [
    lazy(() => import("@/components/animations/math/IntegralWidget")),
  ],
  "8_parabola_line_intersection": [
    lazy(() => import("@/components/animations/ParabolaIntersection")),
  ],
  "13_vector_dot_product": [
    lazy(() => import("@/components/animations/VectorInnerProductWidget")),
  ],
  "14_vector_cross_product": [
    lazy(() => import("@/components/animations/VectorCrossProductWidget")),
  ],
  "15_derivative": [
    lazy(() => import("@/components/animations/DerivativeWidget")),
  ],
  "16_partial_derivative": [
    lazy(() => import("@/components/animations/PartialDerivativeWidget")),
  ],
  "17_math_integral_3d": [
    lazy(() => import("@/components/animations/Integral3DWidget")),
  ],
  "18_angular_velocity": [
    lazy(() => import("@/components/animations/AngularVelocityWidget")),
  ],
  "12_trig_function_3": [
    lazy(() => import("@/components/animations/math/TrigGraphWidget")),
  ],

  // ==========================================
  // ⚙️ 제어공학 (Control Engineering)
  // ==========================================
  "1_laplace_stability": [
    lazy(() => import("@/components/animations/controls/Laplace3DWidget")),
    lazy(
      () =>
        import("@/components/animations/controls/LaplaceTimeComparisonWidget"),
    ),
  ],
  laplace_time_compare: [
    lazy(
      () =>
        import("@/components/animations/controls/LaplaceTimeComparisonWidget"),
    ),
  ],

  // ==========================================
  // 💡 미연결 / 예비용 위젯
  // ==========================================
  polar_coordinate: [
    lazy(() => import("@/components/animations/PolarCoordinateWidget")),
  ],
  rotating_field: [
    lazy(() => import("@/components/animations/RotatingMagneticFieldWidget")),
  ],
  dc_rectifier: [
    lazy(() => import("@/components/animations/DcRectificationWidget")),
  ],

  // ==========================================
  // ⚙️ 전기기기 (Electrical Machines)
  // ==========================================
  "1_induction_motor": [
    lazy(() =>
      import("@/components/animations/machines/MachineWidgetPage").then(
        (m) => ({
          default: function InductionMotorFromApiPage() {
            return <m.default widgetHandlerId="machine_induction_motor" />;
          },
        }),
      ),
    ),
  ],
  /** Skin effect 3D — backend handler machine_skin_effect */
  skin_effect_ac: [
    lazy(() =>
      import("@/components/animations/machines/MachineWidgetPage").then(
        (m) => ({
          default: function SkinEffectFromApiPage() {
            return <m.default widgetHandlerId="machine_skin_effect" />;
          },
        }),
      ),
    ),
  ],
  /** DC rectangular coil + N/S poles — handler machine_dc_coil_motor */
  dc_coil_motor_3d: [
    lazy(() =>
      import("@/components/animations/machines/MachineWidgetPage").then(
        (m) => ({
          default: function DcCoilMotorFromApiPage() {
            return <m.default widgetHandlerId="machine_dc_coil_motor" />;
          },
        }),
      ),
    ),
  ],
  "2_induction_motor": [
    lazy(() => import("@/components/animations/machines/EMInductionWidget")),
  ],

  /** 백엔드 @RegisterQuiz id와 동일할 때 */
  machine_voltage_manifold: [
    lazy(() =>
      import("@/components/animations/machines/MachineWidgetPage").then(
        (m) => ({
          default: function MachineVoltageManifoldPage() {
            return <m.default widgetHandlerId="machine_voltage_manifold" />;
          },
        }),
      ),
    ),
  ],
  machine_y_delta_wiring: [
    lazy(() =>
      import("@/components/animations/machines/MachineWidgetPage").then(
        (m) => ({
          default: function MachineYDeltaWiringPage() {
            return <m.default widgetHandlerId="machine_y_delta_wiring" />;
          },
        }),
      ),
    ),
  ],
  /** 변압기: 정적 결선도 + Y-Y 3D 네온 시뮬 — DB lecture_id 예: transformer_connection_types */
  transformer_connection_types: [
    lazy(
      () =>
        import("@/components/animations/machines/TransformerConnectionWidget"),
    ),
    lazy(
      () => import("@/components/animations/machines/NeonYYTransformerWidget"),
    ),
  ],
  /** Supabase 등 별칭 */
  transformer_yy_delta: [
    lazy(() => import("@/components/animations/machines/MachineWidgetPage")),
  ],

  /** Supabase: homopolar_motor — 말굽자석·도체 원판 회전(호모폴라·플레밍 연계 설명용) */
  homopolar_motor: [
    lazy(
      () =>
        import("@/components/animations/magnetics/HorseshoeMagnetDiskWidget"),
    ),
  ],
  /** 단순 직류 전동기 3D: N–S, 직사각 권선, 정류자·브러시, 배터리, 풀리·전류 입자 */
  iron_core_magnetic_gap: [
    lazy(
      () =>
        import("@/components/animations/magnetics/IronCoreMagneticGapWidget"),
    ),
  ],
  simple_dc_motor: [
    lazy(
      () =>
        import("@/components/animations/magnetics/IronCoreMagneticGapWidget"),
    ),
  ],
  "9_flemming_right_hand_3d": [
    lazy(
      () => import("@/components/animations/magnetics/FlemingRightHandWidget"),
    ),
  ],
  dc_coil_motor_3d_assembly: [
    lazy(
      () =>
        import("@/components/animations/machines/DcCoilMotorAssemblyWidget"),
    ),
  ],
  lorentz_force: [
    lazy(() => import("@/components/animations/machines/LorentzForceWidget")),
  ],
};

export default WIDGET_MAP;
