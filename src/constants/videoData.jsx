// constants/videoData.js
import {
  generateBasicFunctionQuiz,
  generateExponentQuiz,
  generateFactorizationQuiz,
  generateFractionQuiz,
  generateLogarithmQuiz,
  generatePerfectSquareQuiz,
} from "@/utils/quizUtils";

// 1. 기초수학 데이터
export const mathLectures = [
  {
    id: "math_fraction",
    subject: "기초수학 (중학)",
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
    subject: "기초수학 (중학)",
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
    subject: "기초수학 (중학)",
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
    subject: "기초수학 (중학)",
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
    subject: "기초수학 (중학)",
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
    id: "62069c25429c16e898888d5611eb67b4", // 클라우드플레어 영상 해시 ID
    subject: "기초수학 (중학)", // 💡 여기를 정확히 맞춰주세요!
    title: "7강. 직선의 방정식과 두 직선의 교점", // 번호는 알맞게 조정해 주세요
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
  // 💡 2. 여기에 '포물선과 직선의 교점' 데이터 추가
  // constants/videoData.js 내부 수정
  {
    id: "61b1ec56bcd7e87535d18c40bb9afb21",
    // 61b1ec56bcd7e87535d18c40bb9afb21
    subject: "기초수학 (중학)",
    title: "8강. 포물선과 직선의 교점",
    duration: "10:30", // 적절한 시간 입력
    description:
      "이차함수와 일차함수의 연립방정식을 통해 교점의 좌표를 찾는 방법을 배웁니다.",
    thumbnail:
      "https://customer-w4c7tmh3vvpu6ohy.cloudflarestream.com/61b1ec56bcd7e87535d18c40bb9afb21/thumbnails/thumbnail.jpg",
    thumbnailTime: "10s",
    videoUrls: [
      "https://customer-w4c7tmh3vvpu6ohy.cloudflarestream.com/61b1ec56bcd7e87535d18c40bb9afb21/watch",
    ], // 👈 이 필드가 있어야 목록에서 보입니다!
    useBackend: true,
  },
  {
    id: "math_radian",
    subject: "기초수학 (고등)",
    title: "13강. 호도법과 라디안(Radian)",
    duration: "-", // 정확한 영상 길이를 아시면 수정해 주세요
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
    id: "c3d27bab5e1cf6ae9f07f70ae08c1e26",
    subject: "기초수학 (고등)",
    title: "삼각함수 1",
    duration: "-",
    description:
      "교류(AC) 파형 해석의 기초가 되는 삼각함수(sin, cos, tan)의 기본 원리를 학습합니다.",
    thumbnail:
      "https://customer-w4c7tmh3vvpu6ohy.cloudflarestream.com/c3d27bab5e1cf6ae9f07f70ae08c1e26/thumbnails/thumbnail.jpg",
    thumbnailTime: "10s",
    videoUrls: [
      "https://customer-w4c7tmh3vvpu6ohy.cloudflarestream.com/c3d27bab5e1cf6ae9f07f70ae08c1e26/watch", // 일반 시청용
      "https://customer-w4c7tmh3vvpu6ohy.cloudflarestream.com/c3d27bab5e1cf6ae9f07f70ae08c1e26/manifest/video.m3u8", // HLS 스트리밍용
    ],
  },
  {
    id: "8fc05f0f6c31f19deeb976cb2b1562cf",
    subject: "기초수학 (고등)",
    title: "삼각함수 2",
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
    id: "e935dc2d2e592a79688c5f40da5fbe23", // 요청하신 영상 해시 ID
    subject: "기초수학 (중학)",
    title: "완전제곱식의 이해",
    duration: "-",
    description:
      "다항식의 제곱 형태로 인수분해되는 완전제곱식의 조건과 원리를 학습하고 실전에 적용합니다.",
    thumbnail:
      "https://customer-w4c7tmh3vvpu6ohy.cloudflarestream.com/e935dc2d2e592a79688c5f40da5fbe23/thumbnails/thumbnail.jpg",
    thumbnailTime: "10s",
    videoUrls: [
      "https://customer-w4c7tmh3vvpu6ohy.cloudflarestream.com/e935dc2d2e592a79688c5f40da5fbe23/watch",
    ],
    generator: generatePerfectSquareQuiz, // 💡 방금 만든 문제 생성기 연결!
  },
  {
    id: "201092af306ff8cb381808e4c3f45e0c", // DB와 일치하는 새 영상 ID
    subject: "심화수학 (고등)",
    title: "10강. 기하와 벡터의 내적",
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
    useBackend: true, // 무작위 퀴즈를 위해 백엔드 API를 사용하도록 설정
  },
  {
    id: "math_polynomial",
    subject: "기초수학 (중학)",
    title: "6강. 다항식의 연산과 곱셈공식", // ✅ 5강 -> 6강으로 수정
    duration: "-",
    description:
      "복잡한 수식을 간결하게 정리하기 위한 다항식의 전개와 인수분해 기초를 다집니다.",
    thumbnail: "",
    thumbnailTime: "",
    videoUrls: [""],
  },
  {
    id: "c44dc0cd81fbb02320299a7bff062e4d", // Neo4j 및 백엔드와 매핑되는 클라우드플레어 해시 ID
    subject: "기초수학", // 요청하신 대로 기초수학으로 분류
    title: "12강. 미분의 이해", // 번호는 커리큘럼에 맞게 조정해 주세요
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
    useBackend: true, // 💡 FastAPI 백엔드의 무한 문제풀이(generate_derivative_problem)를 호출하기 위해 반드시 true로 설정
  },
  {
    id: "math_equation",
    subject: "기초수학 (중/고등)",
    title: "7강. 방정식과 부등식", // ✅ 6강 -> 7강으로 수정
    duration: "-",
    description:
      "미지수 x를 구하는 일차/이차 방정식(근의 공식)과 연립방정식 풀이법을 학습합니다.",
    thumbnail: "",
    thumbnailTime: "",
    videoUrls: [""],
  },
  {
    id: "math_trig",
    subject: "기초수학 (고등)",
    title: "8강. 삼각함수의 완벽 이해", // ✅ 7강 -> 8강으로 수정
    duration: "-",
    description:
      "교류(AC) 파형 해석에 필수적인 sin, cos, tan의 개념, 피타고라스 정리 및 호도법을 배웁니다.",
    thumbnail: "",
    thumbnailTime: "",
    videoUrls: [""],
  },
  {
    id: "math_imaginary",
    subject: "기초수학 (고등)",
    title: "9강. 허수와 복소수 (j)", // ✅ 8강 -> 9강으로 수정
    duration: "-",
    description:
      "리액턴스와 임피던스 계산을 위해 수학의 'i' 대신 전기공학의 'j'를 활용한 복소수 연산을 익힙니다.",
    thumbnail: "",
    thumbnailTime: "",
    videoUrls: [""],
  },
  {
    id: "math_vector",
    subject: "심화수학 (고등)",
    title: "10강. 기하와 벡터", // ✅ 9강 -> 10강으로 수정
    duration: "-",
    description:
      "전자기학의 핵심! 힘의 방향과 크기를 나타내는 벡터의 합, 차, 내적(Dot), 외적(Cross)을 계산합니다.",
    thumbnail: "",
    thumbnailTime: "",
    videoUrls: [""],
  },
  {
    id: "math_matrix",
    subject: "심화수학 (고등)",
    title: "11강. 행렬과 행렬식", // ✅ 10강 -> 11강으로 수정
    duration: "-",
    description:
      "복잡한 다중 루프 회로망(키르히호프)을 쉽게 풀기 위한 행렬의 곱셈과 크래머 공식(Cramer's rule)을 배웁니다.",
    thumbnail: "",
    thumbnailTime: "",
    videoUrls: [""],
  },
  {
    id: "math_calculus",
    subject: "심화수학 (고등)",
    title: "12강. 미분과 적분 기초", // ✅ 11강 -> 12강으로 수정
    duration: "-",
    description:
      "맥스웰 방정식과 전자기학 전반을 지배하는 다항함수 및 삼각함수의 기본 미적분 공식을 마스터합니다.",
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
  },
];

// 3. 전자기학 데이터
export const emLectures = [
  {
    id: "em_coulomb",
    subject: "전자기학",
    title: "1강. 쿨롱의 법칙",
    duration: "-",
    description:
      "전하 간에 작용하는 힘을 벡터와 분수식을 이용해 정확히 계산합니다.",
    thumbnail: "",
    thumbnailTime: "",
    videoUrls: [""],
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
