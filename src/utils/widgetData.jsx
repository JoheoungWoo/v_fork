import { lazy } from "react";

/**
 * 🌟 [Single Source of Truth]
 * DB의 'lecture_id'를 키(Key) 값으로 사용하여 위젯을 직접 연결합니다.
 * 하나의 강의에 여러 위젯이 들어갈 수 있도록 모든 값은 배열([])로 관리합니다.
 */
const WIDGET_MAP = {
  // ==========================================
  // ⚡ 회로이론 (Circuit Theory)
  // ==========================================
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
  ],
  "9_circuit_analysis_rlc": [
    lazy(() => import("@/components/animations/circuits/RLCCombinedWidget")),
  ],
  "1_frequency_meaning": [
    lazy(() => import("@/components/animations/circuits/SineWaveWidget")),
  ],
  // ==========================================
  // 🧲 전자기학 (Electromagnetics)
  // ==========================================
  "1_coulombs_law": [
    lazy(() => import("@/components/animations/CoulombsLaw3DPage")),
  ],
  "2_equipotential_3d": [
    lazy(() => import("@/components/animations/Equipotential3DWidget")),
  ],
  "3_ampere_law": [
    lazy(() => import("@/components/animations/AmpereLawWidget")),
  ],

  // ==========================================
  // 📐 기초수학 (Basic Math)
  // ==========================================
  "10_trig_function_1": [
    lazy(() => import("@/components/animations/InteractiveUnitCircle")),
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
    lazy(
      () =>
        import("@/components/animations/machines/InductionMotorCombinedWidget"),
    ),
  ],
};

export default WIDGET_MAP;
