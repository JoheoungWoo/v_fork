import { lazy } from "react";

const AutoWidgetL7LineIntersectionLazy = lazy(() => import("@/components/animations/auto/AutoWidgetL7LineIntersection"));
const AutoWidgetL11TrigFunction2Lazy = lazy(() => import("@/components/animations/auto/AutoWidgetL11TrigFunction2"));
const AutoWidgetDcCoilMotor3dLazy = lazy(() => import("@/components/animations/auto/AutoWidgetDcCoilMotor3d"));
const AutoWidgetL9PerfectSquareLazy = lazy(() => import("@/components/animations/auto/AutoWidgetL9PerfectSquare"));
const AutoWidgetPowerTriangleLecLazy = lazy(() => import("@/components/animations/auto/AutoWidgetPowerTriangleLec"));
const AutoWidgetFlemmingLeftHand3dLazy = lazy(() => import("@/components/animations/auto/AutoWidgetFlemmingLeftHand3d"));
const AutoWidgetHomopolarMotorLazy = lazy(() => import("@/components/animations/auto/AutoWidgetHomopolarMotor"));
const AutoWidgetIronCoreMagneticGapLazy = lazy(() => import("@/components/animations/auto/AutoWidgetIronCoreMagneticGap"));
const AutoWidgetBridgeDiodeRectifierLazy = lazy(() => import("@/components/animations/auto/AutoWidgetBridgeDiodeRectifier"));
const AutoWidgetDcCoilMotor3dAssemblyLazy = lazy(() => import("@/components/animations/auto/AutoWidgetDcCoilMotor3dAssembly"));
const AutoWidgetDcShuntGeneratorLazy = lazy(() => import("@/components/animations/auto/AutoWidgetDcShuntGenerator"));
const AutoWidgetHBridgeControlLazy = lazy(() => import("@/components/animations/auto/AutoWidgetHBridgeControl"));
const AutoWidgetInductionMachinePowerflowHubLazy = lazy(() => import("@/components/animations/auto/AutoWidgetInductionMachinePowerflowHub"));
const AutoWidgetInductionMachineRmfHubLazy = lazy(() => import("@/components/animations/auto/AutoWidgetInductionMachineRmfHub"));
const AutoWidgetThreePhaseInductionMotorLazy = lazy(() => import("@/components/animations/auto/AutoWidgetThreePhaseInductionMotor"));
const AutoWidgetInductionMotorLearningHubLazy = lazy(() => import("@/components/animations/auto/AutoWidgetInductionMotorLearningHub"));
const AutoWidgetLorentzForceLazy = lazy(() => import("@/components/animations/auto/AutoWidgetLorentzForce"));
const AutoWidgetSynchronousMachineLearningHubLazy = lazy(() => import("@/components/animations/auto/AutoWidgetSynchronousMachineLearningHub"));
const AutoWidgetVConnectionCtMeasurementLazy = lazy(() => import("@/components/animations/auto/AutoWidgetVConnectionCtMeasurement"));
const AutoWidgetMachineYDeltaWiringLazy = lazy(() => import("@/components/animations/auto/AutoWidgetMachineYDeltaWiring"));
const AutoWidgetL2MathExponentLazy = lazy(() => import("@/components/animations/auto/AutoWidgetL2MathExponent"));
const AutoWidgetL4MathFactorizationLazy = lazy(() => import("@/components/animations/auto/AutoWidgetL4MathFactorization"));
const AutoWidgetL1MathFractionLazy = lazy(() => import("@/components/animations/auto/AutoWidgetL1MathFraction"));
const AutoWidgetL5MathFunctionLazy = lazy(() => import("@/components/animations/auto/AutoWidgetL5MathFunction"));
const AutoWidgetL3MathLogarithmLazy = lazy(() => import("@/components/animations/auto/AutoWidgetL3MathLogarithm"));
const AutoWidgetL12MathRadianLazy = lazy(() => import("@/components/animations/auto/AutoWidgetL12MathRadian"));
const AutoWidgetSkinEffectAcLazy = lazy(() => import("@/components/animations/auto/AutoWidgetSkinEffectAc"));
const AutoWidgetTransformerConnectionTypesLazy = lazy(() => import("@/components/animations/auto/AutoWidgetTransformerConnectionTypes"));
const AutoWidgetTransformerYyDeltaLazy = lazy(() => import("@/components/animations/auto/AutoWidgetTransformerYyDelta"));
const AutoWidgetL1VisionIntroLazy = lazy(() => import("@/components/animations/auto/AutoWidgetL1VisionIntro"));
const AutoWidgetL2VisionVideoLazy = lazy(() => import("@/components/animations/auto/AutoWidgetL2VisionVideo"));
const AutoWidgetVoltageManifoldLazy = lazy(() => import("@/components/animations/auto/AutoWidgetVoltageManifold"));

const GENERATED_WIDGET_MAP = {
  "7_line_intersection": [AutoWidgetL7LineIntersectionLazy],
  "11_trig_function_2": [AutoWidgetL11TrigFunction2Lazy],
  "dc_coil_motor_3d": [AutoWidgetDcCoilMotor3dLazy],
  "9_perfect_square": [AutoWidgetL9PerfectSquareLazy],
  "power_triangle_lec": [AutoWidgetPowerTriangleLecLazy],
  "flemming_left_hand_3d": [AutoWidgetFlemmingLeftHand3dLazy],
  "homopolar_motor": [AutoWidgetHomopolarMotorLazy],
  "iron_core_magnetic_gap": [AutoWidgetIronCoreMagneticGapLazy],
  "bridge_diode_rectifier": [AutoWidgetBridgeDiodeRectifierLazy],
  "dc_coil_motor_3d_assembly": [AutoWidgetDcCoilMotor3dAssemblyLazy],
  "dc_shunt_generator": [AutoWidgetDcShuntGeneratorLazy],
  "h_bridge_control": [AutoWidgetHBridgeControlLazy],
  "induction_machine_powerflow_hub": [AutoWidgetInductionMachinePowerflowHubLazy],
  "induction_machine_rmf_hub": [AutoWidgetInductionMachineRmfHubLazy],
  "three_phase_induction_motor": [AutoWidgetThreePhaseInductionMotorLazy],
  "induction_motor_learning_hub": [AutoWidgetInductionMotorLearningHubLazy],
  "lorentz_force": [AutoWidgetLorentzForceLazy],
  "synchronous_machine_learning_hub": [AutoWidgetSynchronousMachineLearningHubLazy],
  "v_connection_ct_measurement": [AutoWidgetVConnectionCtMeasurementLazy],
  "machine_y_delta_wiring": [AutoWidgetMachineYDeltaWiringLazy],
  "2_math_exponent": [AutoWidgetL2MathExponentLazy],
  "4_math_factorization": [AutoWidgetL4MathFactorizationLazy],
  "1_math_fraction": [AutoWidgetL1MathFractionLazy],
  "5_math_function": [AutoWidgetL5MathFunctionLazy],
  "3_math_logarithm": [AutoWidgetL3MathLogarithmLazy],
  "12_math_radian": [AutoWidgetL12MathRadianLazy],
  "skin_effect_ac": [AutoWidgetSkinEffectAcLazy],
  "transformer_connection_types": [AutoWidgetTransformerConnectionTypesLazy],
  "transformer_yy_delta": [AutoWidgetTransformerYyDeltaLazy],
  "1_vision_intro": [AutoWidgetL1VisionIntroLazy],
  "2_vision_video": [AutoWidgetL2VisionVideoLazy],
  "voltage_manifold": [AutoWidgetVoltageManifoldLazy],
};

export default GENERATED_WIDGET_MAP;
