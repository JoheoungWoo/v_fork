/**
 * DC발전기 타입별 정상상태 근사(교육용). 등가 토폴로지에 맞춘 연립식/근사식.
 */
export function calculateDcGeneratorOperatingPoint(type, { E, Ra, Rf, RL, isLoad }) {
  const loadOn = isLoad ? 1 : 0;
  const safeRL = isLoad ? Math.max(0.5, RL) : 1e12;
  const safeRf = Math.max(0.5, Rf);
  const Rse = Math.max(0.05, safeRf * 0.04);
  const Vf = E * 0.92;

  if (type === "separate") {
    const If = Vf / safeRf;
    if (!loadOn) {
      return { V: E, I: 0, If, Ia: 0, Rse, Vf, Ise: 0, mode: "separate" };
    }
    const V = E / (1 + Ra / safeRL);
    const I = V / safeRL;
    const Ia = I;
    return { V, I, If, Ia, Rse, Vf, Ise: 0, mode: "separate" };
  }

  if (type === "series") {
    if (!loadOn) {
      return { V: E, I: 0, If: 0, Ia: 0, Rse, Vf, Ise: 0, mode: "series" };
    }
    const I = E / (Ra + Rse + safeRL);
    const V = I * safeRL;
    const Ia = I;
    const If = I;
    return { V, I, If, Ia, Rse, Vf, Ise: I, mode: "series" };
  }

  if (type === "shunt" || type === "self") {
    if (!loadOn) {
      const V = E / (1 + Ra / safeRf);
      const If = V / safeRf;
      return { V, I: 0, If, Ia: If, Rse, Vf, Ise: 0, mode: type };
    }
    const loadConductance = 1 / safeRL;
    const V = E / (1 + Ra * loadConductance + Ra / safeRf);
    const If = V / safeRf;
    const I = V / safeRL;
    const Ia = I + If;
    return { V, I, If, Ia, Rse, Vf, Ise: 0, mode: type };
  }

  if (type === "compound") {
    if (!loadOn) {
      const V = E / (1 + Ra / safeRf);
      const If = V / safeRf;
      return { V, I: 0, If, Ia: If, Rse, Vf, Ise: 0, mode: "compound" };
    }
    const denom = 1 + Ra / safeRf + (Ra + Rse) / safeRL;
    const V = E / denom;
    const I = V / safeRL;
    const If = V / safeRf;
    const Ia = I + If;
    return { V, I, If, Ia, Rse, Vf, Ise: I, mode: "compound-long-cumulative" };
  }

  if (type === "cumulative") {
    if (!loadOn) {
      const V = E / (1 + Ra / safeRf);
      const If = V / safeRf;
      return { V, I: 0, If, Ia: If, Rse, Vf, Ise: 0, mode: "short-shunt-cum" };
    }
    const num = E / Ra;
    const den =
      (1 + Rse / safeRL) / Ra + 1 / safeRL + (1 + Rse / safeRL) / safeRf;
    const V = num / den;
    const I = V / safeRL;
    const If = (V * (1 + Rse / safeRL)) / safeRf;
    const Ia = I + If;
    return { V, I, If, Ia, Rse, Vf, Ise: I, mode: "short-shunt-cum" };
  }

  if (type === "differential") {
    if (!loadOn) {
      const V = E / (1 + Ra / safeRf);
      const If = V / safeRf;
      return { V, I: 0, If, Ia: If, Rse, Vf, Ise: 0, mode: "long-shunt-diff" };
    }
    const alpha = 1.35;
    const denom = 1 + Ra / safeRf + (Ra + alpha * Rse) / safeRL;
    const V = E / denom;
    const I = V / safeRL;
    const If = V / safeRf;
    const Ia = I + If;
    return { V, I, If, Ia, Rse, Vf, Ise: I, mode: "long-shunt-diff" };
  }

  return calculateDcGeneratorOperatingPoint("self", { E, Ra, Rf, RL, isLoad });
}
