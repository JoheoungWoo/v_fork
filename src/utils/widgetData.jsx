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
  derivative: lazy(() => import("@/components/animations/DerivativeWidget")),
};

export default WIDGET_MAP;
