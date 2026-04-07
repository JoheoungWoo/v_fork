import { lazy } from "react";

const WIDGET_MAP = {
  trig_circle: lazy(
    () => import("@/components/animations/InteractiveUnitCircle"),
  ),
  ohms_law: lazy(
    () => import("@/components/animations/ParallelResistanceWidget"),
  ),
  y_delta_converter: lazy(
    () => import("@/components/animations/YDeltaConverterWidget"),
  ),
  coulombs_law: lazy(() => import("@/components/animations/CoulombsLaw3DPage")),
  rotating_field: lazy(
    () => import("@/components/animations/RotatingMagneticFieldWidget"),
  ),
  dc_rectifier: lazy(
    () => import("@/components/animations/DcRectificationWidget"),
  ),
  equipotential: lazy(
    () => import("@/components/animations/Equipotential3DWidget"),
  ),
  ampere_law: lazy(() => import("@/components/animations/AmpereLawWidget")),
  parabolaWidget: lazy(
    () => import("@/components/animations/ParabolaIntersection"),
  ),
  vectorInnerProject: lazy(
    () => import("@/components/animations/VectorInnerProductWidget"),
  ),
  vector_cross_product: lazy(
    // 💡 새롭게 추가된 외적 위젯
    () => import("@/components/animations/VectorCrossProductWidget"),
  ),
  derivative: lazy(() => import("@/components/animations/DerivativeWidget")),
  partial_derivative: lazy(
    () => import("@/components/animations/PartialDerivativeWidget"),
  ),
  math_integral_3d: lazy(
    () => import("@/components/animations/Integral3DWidget"),
  ),
  angular_velocity: lazy(
    () => import("@/components/animations/AngularVelocityWidget"),
  ),
  reactance_3d: lazy(() => import("@/components/animations/Reactance3DWidget")),

  laplace_3d: lazy(
    () => import("@/components/animations/controls/Laplace3DWidget"), // 만드신 경로에 맞게 지정
  ),
};

export default WIDGET_MAP;
