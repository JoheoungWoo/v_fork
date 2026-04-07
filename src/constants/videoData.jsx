// constants/videoData.js
import {
  generateBasicFunctionQuiz,
  generateExponentQuiz,
  generateFactorizationQuiz,
  generateFractionQuiz,
  generateLogarithmQuiz,
  generatePerfectSquareQuiz,
} from "@/utils/quizUtils";

export const mathLectures = [
  {
    id: "math_fraction",
    subject: "기초수학",
    title: "1강. 분수와 비례식",
    duration: "12:45",
    description:
      "전기 공식 계산의 뼈대인 분수의 사칙연산, 번분수, 그리고 비례식의 성질을 완벽히 마스터합니다.",
    thumbnail:
      "https://customer-w4c7tmh3vvpu6ohy.cloudflarestream.com/acf4500a94d8492cde7139e71760ff71/thumbnails/thumbnail.jpg",
    thumbnailTime: "30s",
    videoUrls: [
      "https://customer-w4c7tmh3vvpu6ohy.cloudflarestream.com/acf4500a94d8492cde7139e71760ff71/watch",
    ],
    generator: generateFractionQuiz,
  },
  {
    id: "math_exponent",
    subject: "기초수학",
    title: "2강. 지수법칙 기초",
    duration: "08:20",
    description:
      "곱셈과 나눗셈을 간결하게 표현하고 계산하는 지수법칙의 핵심 원리를 배웁니다.",
    thumbnail:
      "https://customer-w4c7tmh3vvpu6ohy.cloudflarestream.com/8f64d560795529a483a89a6047ce49bc/thumbnails/thumbnail.jpg",
    thumbnailTime: "15s",
    videoUrls: [
      "https://customer-w4c7tmh3vvpu6ohy.cloudflarestream.com/8f64d560795529a483a89a6047ce49bc/watch",
    ],
    generator: generateExponentQuiz,
  },
  {
    id: "math_logarithm",
    subject: "기초수학",
    title: "3강. 로그의 이해",
    duration: "15:10",
    description:
      "지수의 역연산인 로그의 개념을 이해하고, 복잡한 곱셈을 덧셈으로 바꾸는 로그의 성질을 학습합니다.",
    thumbnail:
      "https://customer-w4c7tmh3vvpu6ohy.cloudflarestream.com/225bd49d27265ca6694547376b4d4c0a/thumbnails/thumbnail.jpg",
    thumbnailTime: "45s",
    videoUrls: [
      "https://customer-w4c7tmh3vvpu6ohy.cloudflarestream.com/225bd49d27265ca6694547376b4d4c0a/watch",
    ],
    generator: generateLogarithmQuiz,
  },
  {
    id: "math_factorization",
    subject: "기초수학",
    title: "4강. 인수분해",
    duration: "10:05",
    description:
      "공통인수 묶기, 합차공식 등 복잡한 식을 간단한 곱의 형태로 바꾸는 인수분해의 핵심 원리를 학습합니다.",
    thumbnail:
      "https://customer-w4c7tmh3vvpu6ohy.cloudflarestream.com/c01bc310e3016b36fa3e1ad800ca67b8/thumbnails/thumbnail.jpg",
    thumbnailTime: "20s",
    videoUrls: [
      "https://customer-w4c7tmh3vvpu6ohy.cloudflarestream.com/c01bc310e3016b36fa3e1ad800ca67b8/watch",
    ],
    generator: generateFactorizationQuiz,
  },
  {
    id: "math_function",
    subject: "기초수학",
    title: "5강. 함수의 이해",
    duration: "09:30",
    description:
      "입력에 따른 출력을 결정하는 함수의 기본 개념과 전기 회로 모델링의 기초를 다집니다.",
    thumbnail:
      "https://customer-w4c7tmh3vvpu6ohy.cloudflarestream.com/55c575f10cf02e8c135645e38983999f/thumbnails/thumbnail.jpg",
    thumbnailTime: "10s",
    videoUrls: [
      "https://customer-w4c7tmh3vvpu6ohy.cloudflarestream.com/55c575f10cf02e8c135645e38983999f/watch",
    ],
    generator: generateBasicFunctionQuiz,
  },
  {
    id: "math_polynomial",
    subject: "기초수학",
    title: "6강. 다항식의 연산과 곱셈공식",
    duration: "-",
    description:
      "복잡한 수식을 간결하게 정리하기 위한 다항식의 전개와 인수분해 기초를 다집니다.",
    thumbnail: "",
    thumbnailTime: "",
    videoUrls: [""],
  },
  {
    id: "62069c25429c16e898888d5611eb67b4",
    subject: "기초수학",
    title: "7강. 직선의 방정식과 두 직선의 교점",
    duration: "-",
    description:
      "두 직선의 방정식을 이해하고, 연립방정식을 통해 두 직선이 만나는 교점을 구하는 방법을 학습합니다.",
    thumbnail:
      "https://customer-w4c7tmh3vvpu6ohy.cloudflarestream.com/62069c25429c16e898888d5611eb67b4/thumbnails/thumbnail.jpg",
    thumbnailTime: "10s",
    videoUrls: [
      "https://customer-w4c7tmh3vvpu6ohy.cloudflarestream.com/62069c25429c16e898888d5611eb67b4/watch",
      "https://customer-w4c7tmh3vvpu6ohy.cloudflarestream.com/62069c25429c16e898888d5611eb67b4/manifest/video.m3u8",
    ],
  },
  {
    id: "61b1ec56bcd7e87535d18c40bb9afb21",
    subject: "기초수학",
    title: "8강. 포물선과 직선의 교점",
    duration: "10:30",
    description:
      "이차함수와 일차함수의 연립방정식을 통해 교점의 좌표를 찾는 방법을 배웁니다.",
    thumbnail:
      "https://customer-w4c7tmh3vvpu6ohy.cloudflarestream.com/61b1ec56bcd7e87535d18c40bb9afb21/thumbnails/thumbnail.jpg",
    thumbnailTime: "10s",
    videoUrls: [
      "https://customer-w4c7tmh3vvpu6ohy.cloudflarestream.com/61b1ec56bcd7e87535d18c40bb9afb21/watch",
    ],
    useBackend: true,
  },
  {
    id: "e935dc2d2e592a79688c5f40da5fbe23",
    subject: "기초수학",
    title: "9강. 완전제곱식의 이해",
    duration: "-",
    description:
      "다항식의 제곱 형태로 인수분해되는 완전제곱식의 조건과 원리를 학습하고 실전에 적용합니다.",
    thumbnail:
      "https://customer-w4c7tmh3vvpu6ohy.cloudflarestream.com/e935dc2d2e592a79688c5f40da5fbe23/thumbnails/thumbnail.jpg",
    thumbnailTime: "10s",
    videoUrls: [
      "https://customer-w4c7tmh3vvpu6ohy.cloudflarestream.com/e935dc2d2e592a79688c5f40da5fbe23/watch",
    ],
    generator: generatePerfectSquareQuiz,
  },
  {
    id: "c3d27bab5e1cf6ae9f07f70ae08c1e26",
    subject: "기초수학",
    title: "10강. 삼각함수 1",
    duration: "-",
    description:
      "교류(AC) 파형 해석의 기초가 되는 삼각함수(sin, cos, tan)의 기본 원리를 학습합니다.",
    thumbnail:
      "https://customer-w4c7tmh3vvpu6ohy.cloudflarestream.com/c3d27bab5e1cf6ae9f07f70ae08c1e26/thumbnails/thumbnail.jpg",
    thumbnailTime: "10s",
    videoUrls: [
      "https://customer-w4c7tmh3vvpu6ohy.cloudflarestream.com/c3d27bab5e1cf6ae9f07f70ae08c1e26/watch",
      "https://customer-w4c7tmh3vvpu6ohy.cloudflarestream.com/c3d27bab5e1cf6ae9f07f70ae08c1e26/manifest/video.m3u8",
    ],
    widget_type: "trig_circle",
  },
  {
    id: "8fc05f0f6c31f19deeb976cb2b1562cf",
    subject: "기초수학",
    title: "11강. 삼각함수 2",
    duration: "-",
    description:
      "삼각함수의 그래프, 주기성, 그리고 전기공학의 교류 분석에서 중요한 위상(Phase)의 개념을 학습합니다.",
    thumbnail:
      "https://customer-w4c7tmh3vvpu6ohy.cloudflarestream.com/8fc05f0f6c31f19deeb976cb2b1562cf/thumbnails/thumbnail.jpg",
    thumbnailTime: "10s",
    videoUrls: [
      "https://customer-w4c7tmh3vvpu6ohy.cloudflarestream.com/8fc05f0f6c31f19deeb976cb2b1562cf/watch",
      "https://customer-w4c7tmh3vvpu6ohy.cloudflarestream.com/8fc05f0f6c31f19deeb976cb2b1562cf/manifest/video.m3u8",
    ],
  },
  {
    id: "math_radian",
    subject: "기초수학",
    title: "12강. 호도법과 라디안(Radian)",
    duration: "-",
    description:
      "육십분법(도, °)과 호도법(라디안, rad)의 관계를 이해하고, 교류 회로 및 삼각함수 해석에 필수적인 라디안 변환 방법을 학습합니다.",
    thumbnail:
      "https://customer-w4c7tmh3vvpu6ohy.cloudflarestream.com/c3d27bab5e1cf6ae9f07f70ae08c1e26/thumbnails/thumbnail.jpg",
    thumbnailTime: "10s",
    videoUrls: [
      "https://customer-w4c7tmh3vvpu6ohy.cloudflarestream.com/c3d27bab5e1cf6ae9f07f70ae08c1e26/watch",
    ],
  },
  {
    id: "201092af306ff8cb381808e4c3f45e0c",
    subject: "기초수학",
    title: "13강. 기하와 벡터의 내적",
    duration: "-",
    description:
      "두 벡터의 내적 연산과 기하학적 의미(투영)를 직관적으로 이해하고, 역코사인(cos⁻¹θ)을 이용해 사이각을 구하는 방법을 학습합니다.",
    thumbnail:
      "https://customer-w4c7tmh3vvpu6ohy.cloudflarestream.com/201092af306ff8cb381808e4c3f45e0c/thumbnails/thumbnail.jpg",
    thumbnailTime: "10s",
    videoUrls: [
      "https://customer-w4c7tmh3vvpu6ohy.cloudflarestream.com/201092af306ff8cb381808e4c3f45e0c/watch",
      "https://customer-w4c7tmh3vvpu6ohy.cloudflarestream.com/201092af306ff8cb381808e4c3f45e0c/manifest/video.m3u8",
    ],
    useBackend: true,
  },
  {
    id: "30d2bd6d1675fb17fe237d8c9d930413",
    subject: "기초수학",
    title: "14강. 3차원 공간과 벡터의 외적",
    duration: "-",
    description:
      "3차원 공간에서 두 벡터의 외적 연산을 직관적으로 이해하고, 외적 벡터의 방향(오른나사 법칙)과 크기를 구하는 방법을 시뮬레이션과 함께 학습합니다.",
    thumbnail:
      "https://customer-w4c7tmh3vvpu6ohy.cloudflarestream.com/30d2bd6d1675fb17fe237d8c9d930413/thumbnails/thumbnail.jpg",
    thumbnailTime: "10s",
    videoUrls: [
      "https://customer-w4c7tmh3vvpu6ohy.cloudflarestream.com/30d2bd6d1675fb17fe237d8c9d930413/watch",
      "https://customer-w4c7tmh3vvpu6ohy.cloudflarestream.com/30d2bd6d1675fb17fe237d8c9d930413/manifest/video.m3u8",
    ],
    widget_type: "vector_cross_product",
    useBackend: true,
  },
  {
    id: "c44dc0cd81fbb02320299a7bff062e4d",
    subject: "기초수학",
    title: "15강. 미분의 이해",
    duration: "-",
    description:
      "함수의 순간 변화율을 구하는 미분의 기본 개념과 다항함수의 미분법을 시각적으로 학습합니다.",
    thumbnail:
      "https://customer-w4c7tmh3vvpu6ohy.cloudflarestream.com/c44dc0cd81fbb02320299a7bff062e4d/thumbnails/thumbnail.jpg",
    thumbnailTime: "10s",
    videoUrls: [
      "https://customer-w4c7tmh3vvpu6ohy.cloudflarestream.com/c44dc0cd81fbb02320299a7bff062e4d/watch",
      "https://customer-w4c7tmh3vvpu6ohy.cloudflarestream.com/c44dc0cd81fbb02320299a7bff062e4d/manifest/video.m3u8",
    ],
    widget_type: "derivative",
    useBackend: true,
  },
  {
    id: "a778e615bf667e6db830b498baa5ec66", // ✅ 수정된 편미분 객체
    subject: "기초수학",
    title: "16강. 편미분의 기하학적 이해",
    duration: "-",
    description:
      "3차원 곡면에서 X 또는 Y를 고정(Slice)했을 때 나타나는 단면의 접선 기울기를 통해 편미분의 개념을 3D 시뮬레이션으로 직관적으로 학습합니다.",
    thumbnail:
      "https://customer-w4c7tmh3vvpu6ohy.cloudflarestream.com/a778e615bf667e6db830b498baa5ec66/thumbnails/thumbnail.jpg",
    thumbnailTime: "10s",
    videoUrls: [
      "https://customer-w4c7tmh3vvpu6ohy.cloudflarestream.com/a778e615bf667e6db830b498baa5ec66/watch",
      "https://customer-w4c7tmh3vvpu6ohy.cloudflarestream.com/a778e615bf667e6db830b498baa5ec66/manifest/video.m3u8",
    ],
    widget_type: "partial_derivative",
    useBackend: true,
  },
  {
    id: "math_integral_3d",
    subject: "기초수학",
    title: "17강. 다중적분과 단면의 넓이 (3D)",
    duration: "-",
    description:
      "3차원 공간에서 f(x,y) 곡면을 x 또는 y 평면으로 절단했을 때 나타나는 단면의 면적을 구하며, 정적분의 기하학적 의미를 3D 시뮬레이션으로 직관적으로 학습합니다.",
    thumbnail:
      "https://placehold.co/600x400/0f172a/ffffff?text=Integral+Area+3D",
    thumbnailTime: "",
    videoUrls: ["https://www.w3schools.com/html/mov_bbb.mp4"],
    widget_type: "math_integral_3d",
  },
  {
    id: "605e4d59a8fdcfe8f914734370c726f4",
    subject: "기초수학",
    title: "18강. 각속도와 주파수",
    duration: "-",
    description:
      "각속도와 주파수의 관계를 이해하고, 주기와의 연관성을 통해 회전 운동을 정량적으로 계산하는 방법을 학습합니다.",
    thumbnail:
      "https://customer-w4c7tmh3vvpu6ohy.cloudflarestream.com/605e4d59a8fdcfe8f914734370c726f4/thumbnails/thumbnail.jpg",
    thumbnailTime: "10s",
    videoUrls: [
      "https://customer-w4c7tmh3vvpu6ohy.cloudflarestream.com/605e4d59a8fdcfe8f914734370c726f4/watch",
      "https://customer-w4c7tmh3vvpu6ohy.cloudflarestream.com/605e4d59a8fdcfe8f914734370c726f4/manifest/video.m3u8",
    ],
    widget_type: "angular_velocity",
    useBackend: true,
  },
  {
    id: "math_equation",
    subject: "기초수학",
    title: "부록. 방정식과 부등식",
    duration: "-",
    description:
      "미지수 x를 구하는 일차/이차 방정식(근의 공식)과 연립방정식 풀이법을 학습합니다.",
    thumbnail: "",
    thumbnailTime: "",
    videoUrls: [""],
  },
  {
    id: "math_imaginary",
    subject: "기초수학",
    title: "부록. 허수와 복소수 (j)",
    duration: "-",
    description:
      "리액턴스와 임피던스 계산을 위해 수학의 'i' 대신 전기공학의 'j'를 활용한 복소수 연산을 익힙니다.",
    thumbnail: "",
    thumbnailTime: "",
    videoUrls: [""],
  },
  {
    id: "math_matrix",
    subject: "기초수학",
    title: "부록. 행렬과 행렬식",
    duration: "-",
    description:
      "복잡한 다중 루프 회로망(키르히호프)을 쉽게 풀기 위한 행렬의 곱셈과 크래머 공식(Cramer's rule)을 배웁니다.",
    thumbnail: "",
    thumbnailTime: "",
    videoUrls: [""],
  },
];

// 2. 회로이론 데이터
export const circuitLectures = [
  {
    id: "circuit_resistance",
    subject: "회로이론",
    title: "1강. 직·병렬 회로망",
    duration: "-",
    description:
      "저항의 직렬, 병렬 연결 특성을 이해하고 합성저항을 계산합니다.",
    thumbnail: "",
    thumbnailTime: "",
    videoUrls: [""],
  },
  {
    id: "circuit_power",
    subject: "회로이론",
    title: "2강. 옴의 법칙과 소비 전력",
    duration: "-",
    description: "회로에서 소비되는 유효 전력(P)을 계산하는 방법을 배웁니다.",
    thumbnail: "",
    thumbnailTime: "",
    videoUrls: [""],
  },
  {
    id: "circuit_ydelta",
    subject: "회로이론",
    title: "3강. Y-Δ (와이-델타) 변환",
    duration: "-",
    description:
      "브릿지 회로 해석의 핵심! 델타 결선을 Y결선으로 등가 변환합니다.",
    thumbnail: "",
    thumbnailTime: "",
    videoUrls: [""],
  },
  {
    id: "circuit_y_voltage",
    subject: "회로이론",
    title: "4강. Y결선 상전압과 선간전압",
    duration: "-",
    description:
      "3상 교류 회로에서 Y결선의 120도 전압 벡터도를 이해하고 선간전압을 도출합니다.",
    thumbnail: "",
    thumbnailTime: "",
    videoUrls: [""],
  },
  {
    id: "circuit_ohm_law_equivalent", // 고유 ID 부여
    subject: "회로이론",
    title: "6강. 오옴의 법칙과 합성저항", // 기존 넘버링에 맞춰 6강으로 설정 (5강 누락 상태)
    duration: "-",
    description:
      "전기회로 해석의 가장 기본이 되는 옴의 법칙(V=IR)을 이해하고, 직렬 및 병렬 회로에서의 합성저항을 완벽히 계산합니다.",
    thumbnail:
      "https://customer-w4c7tmh3vvpu6ohy.cloudflarestream.com/99ba85e1fdd547f5cdc6e4afd17e03ce/thumbnails/thumbnail.jpg",
    thumbnailTime: "",
    videoUrls: [
      "https://customer-w4c7tmh3vvpu6ohy.cloudflarestream.com/99ba85e1fdd547f5cdc6e4afd17e03ce/watch", // 시청용 링크
    ],
    widget_type: "ohms_law", // 💡 이 줄을 추가하세요!
  },
  {
    id: "circuit_reactance_3d",
    subject: "회로이론",
    title: "7강. 코일과 콘덴서의 리액턴스 (jωL, 1/jωC)",
    duration: "15:00",
    description:
      "주파수에 따라 변하는 코일과 콘덴서의 저항 성분(리액턴스)을 3차원 복소 평면 위젯을 통해 직관적으로 학습합니다.",
    thumbnail: "https://placehold.co/600x400/0f172a/ffffff?text=Reactance+3D",
    thumbnailTime: "",
    videoUrls: ["https://www.w3schools.com/html/mov_bbb.mp4"], // 더미 URL
    widget_type: "reactance_3d",
    useBackend: true, // 문제는 백엔드에서 생성
  },
];

// 3. 전자기학 데이터
export const emLectures = [
  {
    id: "em_coulomb",
    subject: "전자기학",
    title: "1강. 쿨롱의 법칙",
    duration: "10:00",
    description:
      "두 전하 사이에 작용하는 전기력(쿨롱의 힘)을 3D 시뮬레이션을 통해 직관적으로 이해하고 계산해 봅니다.",
    thumbnail:
      "https://placehold.co/600x400/0f172a/ffffff?text=Coulomb%27s+Law+3D",
    thumbnailTime: "",
    // 💡 잠금 해제를 위한 임시 더미 영상 URL 삽입!
    videoUrls: ["https://www.w3schools.com/html/mov_bbb.mp4"],
    widget_type: "coulombs_law",
  },
  {
    id: "lec_poten_3d",
    subject: "전자기학",
    title: "2강. 등전위선 3D 시각화",
    duration: "12:30",
    description:
      "전기장 내에서 전위가 같은 점들을 연결한 등전위선을 3D 공간에서 확인하고 전하의 움직임을 예측해 봅니다.",
    thumbnail:
      "https://placehold.co/600x400/1e293b/ffffff?text=Equipotential+3D",
    thumbnailTime: "",
    // 💡 잠금 해제를 위한 임시 더미 영상 URL 삽입!
    videoUrls: ["https://www.w3schools.com/html/mov_bbb.mp4"],
    widget_type: "equipotential",
  },
  {
    id: "em_ampere_law",
    subject: "전자기학",
    title: "3강. 앙페르의 오른나사 법칙",
    duration: "08:45",
    description:
      "직선 전류 주위에 생성되는 자기장의 방향을 앙페르의 오른나사 법칙을 통해 입체적으로 학습합니다.",
    thumbnail:
      "https://placehold.co/600x400/334155/ffffff?text=Ampere%27s+Law+3D",
    thumbnailTime: "",
    // 💡 잠금 해제를 위한 임시 더미 영상 URL 삽입!
    videoUrls: ["https://www.w3schools.com/html/mov_bbb.mp4"],
    widget_type: "ampere_law",
  },
];
// 4. AI Company Vision 데이터
export const visionLectures = [
  {
    id: "vision_intro",
    subject: "AI Company",
    title: "1강. AI Company의 비전과 미래",
    duration: "05:12",
    description:
      "AI Company가 그려나가는 전기공학 교육의 혁신과 AI 튜터 시스템의 미래 비전을 소개합니다.",
    thumbnail:
      "https://pub-b1c7390b6f034c2cb585d27f4310e78a.r2.dev/thumbnails/thumbnail.jpg",
    thumbnailTime: "5s",
    videoUrls: [
      "https://pub-b1c7390b6f034c2cb585d27f4310e78a.r2.dev/Ai%20Company%20%20%EC%9D%98%20%20vision.mp4",
    ],
  },
  {
    id: "vision_video",
    subject: "AI Company",
    title: "2강. AI Company Vision 영상",
    duration: "03:45",
    description:
      "Cloudflare Stream을 통해 제공되는 AI Company의 공식 비전 영상입니다.",
    thumbnail:
      "https://customer-w4c7tmh3vvpu6ohy.cloudflarestream.com/5f16ede4e7730bdbf86da518cfd232e9/thumbnails/thumbnail.jpg",
    thumbnailTime: "25s",
    videoUrls: [
      "https://customer-w4c7tmh3vvpu6ohy.cloudflarestream.com/5f16ede4e7730bdbf86da518cfd232e9/watch",
    ],
  },
];

export const controlLectures = [
  {
    id: "control_laplace_stability",
    subject: "제어공학",
    title: "1강. 라플라스 변환과 시스템 안정도 (s-평면)",
    duration: "15:00",
    description:
      "미분방정식을 쉽게 풀게 해주는 라플라스 변환! 극점(Pole)의 위치에 따른 시스템의 안정성(Stability)을 3D 지형도로 직관적으로 학습합니다.",
    thumbnail:
      "https://placehold.co/600x400/1e40af/ffffff?text=Laplace+3D+s-plane",
    thumbnailTime: "",
    videoUrls: ["https://www.w3schools.com/html/mov_bbb.mp4"], // 더미 영상
    widget_type: "laplace_3d", // WIDGET_MAP과 연결될 키값
    useBackend: true, // 파이썬 백엔드(control_service)에서 문제를 가져옴
  },
];
