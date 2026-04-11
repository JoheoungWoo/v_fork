// src/api/vectorCalcApi.js
// 기존 apiClient.js (axios + Bearer 토큰) 를 그대로 재사용합니다.
// 별도 fetch 클라이언트를 만들지 않고 프로젝트 공통 인터셉터를 활용합니다.

import apiClient from "@/api/core/apiClient";

const BASE = "/api/em/vector-calc";

// ─── 필드 목록 ──────────────────────────────────────────────────────────────
export const fetchVCFields = () =>
  apiClient.get(`${BASE}/fields`).then((r) => r.data);

// ─── 기울기 ∇f ──────────────────────────────────────────────────────────────
export const computeGradient = (field_id, px, py) =>
  apiClient
    .post(`${BASE}/gradient`, { field_id, px, py })
    .then((r) => r.data);

// ─── 발산 ∇·A ───────────────────────────────────────────────────────────────
export const computeDivergence = (field_id, px, py, pz) =>
  apiClient
    .post(`${BASE}/divergence`, { field_id, px, py, pz })
    .then((r) => r.data);

// ─── 회전 ∇×A ───────────────────────────────────────────────────────────────
export const computeCurl = (field_id, px, py, pz) =>
  apiClient
    .post(`${BASE}/curl`, { field_id, px, py, pz })
    .then((r) => r.data);

// ─── 배경 벡터장 샘플 (Three.js 화살표용) ───────────────────────────────────
export const fetchFieldSamples = (mode, field_id, step = 2.0, extent = 4.0) =>
  apiClient
    .post(`${BASE}/field-samples`, { mode, field_id, step, extent })
    .then((r) => r.data);

// ─── 스칼라 곡면 메시 (Gradient 모드) ───────────────────────────────────────
export const fetchSurfaceMesh = (field_id, segments = 40, extent = 5.0) =>
  apiClient
    .get(`${BASE}/surface-mesh`, { params: { field_id, segments, extent } })
    .then((r) => r.data);
