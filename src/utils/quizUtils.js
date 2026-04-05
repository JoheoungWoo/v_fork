// 💡 1강: 분수의 덧셈 (통분) 문제 생성기
export const generateFractionQuiz = () => {
  // 1~5 사이의 무작위 분자, 2~7 사이의 무작위 분모 생성
  const num1 = Math.floor(Math.random() * 5) + 1;
  const den1 = Math.floor(Math.random() * 6) + 2;
  const num2 = Math.floor(Math.random() * 5) + 1;
  const den2 = Math.floor(Math.random() * 6) + 2;

  const problem = `\\frac{${num1}}{${den1}} + \\frac{${num2}}{${den2}}`;

  // 통분 계산 (단순화를 위해 두 분모의 곱을 공통 분모로 사용)
  const commonDen = den1 * den2;
  const newNum1 = num1 * den2;
  const newNum2 = num2 * den1;
  const sumNum = newNum1 + newNum2;

  const answer = `\\frac{${sumNum}}{${commonDen}}`;

  const steps = [
    {
      text: "분모가 다르므로 덧셈을 위해 먼저 통분을 해야 합니다. 두 분모의 곱을 공통 분모로 만듭니다.",
      math: `\\frac{${num1} \\times ${den2}}{${den1} \\times ${den2}} + \\frac{${num2} \\times ${den1}}{${den2} \\times ${den1}}`,
    },
    {
      text: "각 분수를 계산하여 통분된 형태로 나타냅니다.",
      math: `\\frac{${newNum1}}{${commonDen}} + \\frac{${newNum2}}{${commonDen}}`,
    },
    {
      text: "이제 분모가 같아졌으므로 분자끼리 더해줍니다.",
      math: `\\frac{${newNum1} + ${newNum2}}{${commonDen}}`,
    },
    {
      text: "따라서 정답은 다음과 같습니다. (약분 과정 생략)",
      math: answer,
    },
  ];

  return { problem, answer, steps };
};

// 💡 2강: 지수법칙 문제 생성기
export const generateExponentQuiz = () => {
  const base = Math.floor(Math.random() * 5) + 2; // 2 ~ 6
  const exp1 = Math.floor(Math.random() * 5) + 2; // 2 ~ 6
  const exp2 = Math.floor(Math.random() * 5) + 2; // 2 ~ 6

  const problem = `${base}^{${exp1}} \\times ${base}^{${exp2}}`;
  const answer = `${base}^{${exp1 + exp2}}`;

  const steps = [
    {
      text: `밑이 ${base}로 같으므로 지수법칙을 적용할 수 있습니다.`,
      math: "a^m \\times a^n = a^{m+n}",
    },
    {
      text: "곱셈에서는 지수끼리 더해줍니다.",
      math: `${exp1} + ${exp2} = ${exp1 + exp2}`,
    },
    { text: "따라서 최종 정답은 다음과 같습니다.", math: answer },
  ];

  return { problem, answer, steps };
};

// 💡 3강: 로그 문제 생성기 (지수 다음으로 배치)
export const generateLogarithmQuiz = () => {
  // 밑(base)은 2~5 사이, 지수(exp)는 2~4 사이의 무작위 수 생성
  const base = Math.floor(Math.random() * 4) + 2;
  const exp = Math.floor(Math.random() * 3) + 2;
  const value = Math.pow(base, exp); // 진수 계산

  const problem = `\\log_{${base}}{${value}}`;
  const answer = `${exp}`;

  const steps = [
    {
      text: `주어진 로그값을 구하기 위해 진수 ${value}을(를) 밑이 ${base}인 거듭제곱으로 나타내야 합니다.`,
      math: `${value} = ${base}^{${exp}}`,
    },
    {
      text: "로그의 성질에 따라, 진수의 지수는 로그 앞으로 나올 수 있습니다.",
      math: `\\log_{${base}}{${base}^{${exp}}} = ${exp} \\log_{${base}}{${base}}`,
    },
    {
      text: "밑과 진수가 같으면 로그값은 1이 되므로 (\\log_{a}{a} = 1), 최종 정답은 다음과 같습니다.",
      math: answer,
    },
  ];

  return { problem, answer, steps };
};
// 💡 3강: 인수분해 문제 생성기
export const generateFactorizationQuiz = () => {
  let a = Math.floor(Math.random() * 19) - 9;
  let b = Math.floor(Math.random() * 19) - 9;
  if (a === 0) a = 1;
  if (b === 0) b = 2;

  const sum = a + b;
  const prod = a * b;

  const signSum = sum > 0 ? `+ ${sum}` : `- ${Math.abs(sum)}`;
  const signProd = prod > 0 ? `+ ${prod}` : `- ${Math.abs(prod)}`;

  const problem = `x^2 ${signSum}x ${signProd}`;

  const strA = a > 0 ? `+${a}` : `${a}`;
  const strB = b > 0 ? `+${b}` : `${b}`;
  const answer = `(x ${strA})(x ${strB})`;

  const steps = [
    {
      text: "주어진 이차식을 다음과 같은 기본 형태로 생각합니다.",
      math: "x^2 + (A+B)x + AB",
    },
    {
      text: `합해서 ${sum}이(가) 되고, 곱해서 ${prod}이(가) 되는 두 수 A와 B를 찾아야 합니다.`,
      math: "",
    },
    { text: `조건을 만족하는 두 수는 ${a}와(과) ${b}입니다.`, math: "" },
    { text: "따라서 인수분해 결과는 다음과 같습니다.", math: answer },
  ];

  return { problem, answer, steps };
};

// src/utils/quizUtils.js

// [5강용] 일반 함수의 함숫값 구하기 퀴즈
export const generateBasicFunctionQuiz = () => {
  const a = Math.floor(Math.random() * 4) + 1;
  const b = Math.floor(Math.random() * 9) - 4;
  const c = Math.floor(Math.random() * 9) - 4;
  const k = Math.floor(Math.random() * 7) - 3;

  const bStr = b === 0 ? "" : b > 0 ? `+ ${b}x` : `- ${Math.abs(b)}x`;
  const cStr = c === 0 ? "" : c > 0 ? `+ ${c}` : `- ${Math.abs(c)}`;
  const fx = `${a}x^2 ${bStr} ${cStr}`.trim();
  const answer = a * k * k + b * k + c;

  return {
    problem: `f(x) = ${fx} \\text{ 일 때, } f(${k}) \\text{ 의 값을 구하시오.}`,
    answer: `${answer}`,
    steps: [
      {
        text: `함수식의 x 자리에 ${k}을 대입합니다.`,
        math: `f(${k}) = ${a}(${k})^2 ${b >= 0 ? "+" : "-"} ${Math.abs(b)}(${k}) ${c >= 0 ? "+" : "-"} ${Math.abs(c)}`,
      },
      { text: `계산 결과:`, math: `f(${k}) = ${answer}` },
    ],
  };
};

// [6강용] 합성함수의 함숫값 구하기 퀴즈
export const generateCompositeFunctionQuiz = () => {
  const a = Math.floor(Math.random() * 3) + 2;
  const b = Math.floor(Math.random() * 7) - 3;
  const c = Math.floor(Math.random() * 3) + 2;
  const d = Math.floor(Math.random() * 7) - 3;
  const k = Math.floor(Math.random() * 5) - 2;

  const bStr = b === 0 ? "" : b > 0 ? `+ ${b}` : `- ${Math.abs(b)}`;
  const dStr = d === 0 ? "" : d > 0 ? `+ ${d}` : `- ${Math.abs(d)}`;
  const fx = `${a}x ${bStr}`.trim();
  const gx = `${c}x ${dStr}`.trim();

  const gk = c * k + d;
  const answer = a * gk + b;

  return {
    problem: `f(x) = ${fx}, g(x) = ${gx} \\text{ 일 때, } (f \\circ g)(${k}) \\text{ 를 구하시오.}`,
    answer: `${answer}`,
    steps: [
      {
        text: `먼저 안쪽 함수 g(${k})를 계산합니다.`,
        math: `g(${k}) = ${c}(${k}) ${d >= 0 ? "+" : "-"} ${Math.abs(d)} = ${gk}`,
      },
      {
        text: `결과값 ${gk}를 f(x)에 대입합니다.`,
        math: `f(${gk}) = ${a}(${gk}) ${b >= 0 ? "+" : "-"} ${Math.abs(b)} = ${answer}`,
      },
    ],
  };
};

// 💡 [추가] 완전제곱식 인수분해 문제 생성기
export const generatePerfectSquareQuiz = () => {
  // a는 1~9 사이의 무작위 정수
  const a = Math.floor(Math.random() * 9) + 1;
  // 부호는 50% 확률로 플러스 또는 마이너스
  const isPositive = Math.random() > 0.5;

  const middleTerm = 2 * a;
  const lastTerm = a * a;

  const signStr = isPositive ? "+" : "-";
  const middleStr = isPositive ? `+ ${middleTerm}x` : `- ${middleTerm}x`;

  // 문제: x^2 ± 2ax + a^2
  const problem = `다음 이차식을 완전제곱식으로 인수분해 하시오. \\\\[10pt] x^2 ${middleStr} + ${lastTerm}`;

  // 정답: (x ± a)^2
  const answer = `(x ${signStr} ${a})^2`;

  // 풀이 과정 (Steps)
  const steps = [
    {
      text: "완전제곱식의 기본 형태를 떠올립니다.",
      math: "(x \\pm A)^2 = x^2 \\pm 2Ax + A^2",
    },
    {
      text: `주어진 식에서 x의 계수가 ${isPositive ? "" : "-"}${middleTerm}이므로, 2A = ${middleTerm}에서 A = ${a} 임을 알 수 있습니다.`,
      math: "",
    },
    {
      text: `상수항을 확인해보면 A^2 = ${a}^2 = ${lastTerm} 으로 일치하므로, 이 식은 완전제곱식입니다.`,
      math: "",
    },
    {
      text: "따라서 인수분해 결과는 다음과 같습니다.",
      math: answer,
    },
  ];

  return { problem, answer, steps };
};

// [6강용] 오옴의 법칙과 병렬 합성저항 퀴즈
export const generateOhmQuiz = () => {
  // 딱 떨어지는 정수 계산을 위해 병렬 합성저항이 정수가 되는 쌍만 사용
  const pairs = [
    { r1: 3, r2: 6, req: 2 },
    { r1: 4, r2: 4, req: 2 },
    { r1: 6, r2: 12, req: 4 },
    { r1: 10, r2: 10, req: 5 },
    { r1: 12, r2: 24, req: 8 },
  ];

  // 무작위로 저항 쌍 선택
  const pair = pairs[Math.floor(Math.random() * pairs.length)];

  // 전체 전류(I)를 2~10A 사이의 정수로 무작위 설정 후, 전압(V) 계산
  const i = Math.floor(Math.random() * 9) + 2;
  const v = pair.req * i;

  const problem = `${pair.r1}\\Omega \\text{과 } ${pair.r2}\\Omega \\text{의 저항이 병렬로 연결된 회로에 } ${v}\\text{V}\\text{의 전압이 인가될 때, 전체 전류 } I \\text{를 구하시오.}`;
  const answer = `${i}\\text{A}`;

  const steps = [
    {
      text: "먼저 두 병렬 저항의 합성저항을 구합니다.",
      math: `R_{eq} = \\frac{${pair.r1} \\times ${pair.r2}}{${pair.r1} + ${pair.r2}} = ${pair.req}\\Omega`,
    },
    {
      text: "옴의 법칙(V=IR)을 이용하여 전체 전류를 계산합니다.",
      math: `I = \\frac{V}{R_{eq}} = \\frac{${v}}{${pair.req}} = ${i}\\text{A}`,
    },
  ];

  return { problem, answer, steps };
};

// 💡 [심화 수학] 다항함수의 미분계수 구하기 퀴즈 생성기
export const generateDerivativeQuiz = () => {
  // f(x) = ax^3 + bx^2 + cx 형태의 3차 다항함수 생성
  const a = Math.floor(Math.random() * 3) + 1; // 1 ~ 3 (최고차항 계수는 0이 되지 않도록)
  const b = Math.floor(Math.random() * 7) - 3; // -3 ~ 3
  const c = Math.floor(Math.random() * 9) - 4; // -4 ~ 4
  const k = Math.floor(Math.random() * 5) - 2; // x = k 에서의 미분계수 (-2 ~ 2)

  // f(x) 수식 문자열 조합
  const bStr = b === 0 ? "" : b > 0 ? `+ ${b}x^2` : `- ${Math.abs(b)}x^2`;
  const cStr = c === 0 ? "" : c > 0 ? `+ ${c}x` : `- ${Math.abs(c)}x`;
  const fx = `${a}x^3 ${bStr} ${cStr}`.trim();

  // 도함수 f'(x) = 3ax^2 + 2bx + c 계수 계산
  const aPrime = 3 * a;
  const bPrime = 2 * b;

  // f'(x) 수식 문자열 조합
  const bPrimeStr =
    bPrime === 0 ? "" : bPrime > 0 ? `+ ${bPrime}x` : `- ${Math.abs(bPrime)}x`;
  const cPrimeStr = c === 0 ? "" : c > 0 ? `+ ${c}` : `- ${Math.abs(c)}`;
  const fPrimeX = `${aPrime}x^2 ${bPrimeStr} ${cPrimeStr}`.trim();

  // 미분계수 f'(k) 정답 계산
  const answer = aPrime * (k * k) + bPrime * k + c;

  return {
    problem: `함수 f(x) = ${fx} \\text{ 에 대하여, } x = ${k} \\text{ 에서의 미분계수 } f'(${k}) \\text{ 의 값을 구하시오.}`,
    answer: `${answer}`,
    steps: [
      {
        text: "가장 먼저 주어진 함수의 도함수 f'(x)를 구합니다.",
        math: `f'(x) = ${fPrimeX}`,
      },
      {
        text: `구한 도함수의 x 자리에 ${k}을(를) 대입합니다.`,
        math: `f'(${k}) = ${aPrime}(${k})^2 ${bPrime >= 0 ? "+" : "-"} ${Math.abs(bPrime)}(${k}) ${c >= 0 ? "+" : "-"} ${Math.abs(c)}`,
      },
      {
        text: "계산 결과, 정답은 다음과 같습니다.",
        math: `f'(${k}) = ${answer}`,
      },
    ],
  };
};
