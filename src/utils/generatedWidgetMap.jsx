import { lazy } from "react";

const AutoWidgetL7LineIntersectionLazy = lazy(() => import("@/components/animations/auto/AutoWidgetL7LineIntersection"));
const AutoWidgetL11TrigFunction2Lazy = lazy(() => import("@/components/animations/auto/AutoWidgetL11TrigFunction2"));
const AutoWidgetL9PerfectSquareLazy = lazy(() => import("@/components/animations/auto/AutoWidgetL9PerfectSquare"));
const AutoWidgetL2MathExponentLazy = lazy(() => import("@/components/animations/auto/AutoWidgetL2MathExponent"));
const AutoWidgetL4MathFactorizationLazy = lazy(() => import("@/components/animations/auto/AutoWidgetL4MathFactorization"));
const AutoWidgetL1MathFractionLazy = lazy(() => import("@/components/animations/auto/AutoWidgetL1MathFraction"));
const AutoWidgetL5MathFunctionLazy = lazy(() => import("@/components/animations/auto/AutoWidgetL5MathFunction"));
const AutoWidgetL3MathLogarithmLazy = lazy(() => import("@/components/animations/auto/AutoWidgetL3MathLogarithm"));
const AutoWidgetL12MathRadianLazy = lazy(() => import("@/components/animations/auto/AutoWidgetL12MathRadian"));
const AutoWidgetL1VisionIntroLazy = lazy(() => import("@/components/animations/auto/AutoWidgetL1VisionIntro"));
const AutoWidgetL2VisionVideoLazy = lazy(() => import("@/components/animations/auto/AutoWidgetL2VisionVideo"));

const GENERATED_WIDGET_MAP = {
  "7_line_intersection": [AutoWidgetL7LineIntersectionLazy],
  "11_trig_function_2": [AutoWidgetL11TrigFunction2Lazy],
  "9_perfect_square": [AutoWidgetL9PerfectSquareLazy],
  "2_math_exponent": [AutoWidgetL2MathExponentLazy],
  "4_math_factorization": [AutoWidgetL4MathFactorizationLazy],
  "1_math_fraction": [AutoWidgetL1MathFractionLazy],
  "5_math_function": [AutoWidgetL5MathFunctionLazy],
  "3_math_logarithm": [AutoWidgetL3MathLogarithmLazy],
  "12_math_radian": [AutoWidgetL12MathRadianLazy],
  "1_vision_intro": [AutoWidgetL1VisionIntroLazy],
  "2_vision_video": [AutoWidgetL2VisionVideoLazy],
};

export default GENERATED_WIDGET_MAP;
