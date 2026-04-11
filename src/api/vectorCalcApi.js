// src/api/vectorCalcApi.js
import apiClient from "@/api/core/apiClient";

const BASE = "/api/em/vector-calc";

export const fetchVCFields = () =>
  apiClient.get(`${BASE}/fields`).then((r) => r.data);

export const computeGradient = (field_id, px, py) =>
  apiClient.post(`${BASE}/gradient`, { field_id, px, py }).then((r) => r.data);

export const computeDivergence = (field_id, px, py, pz) =>
  apiClient.post(`${BASE}/divergence`, { field_id, px, py, pz }).then((r) => r.data);

export const computeCurl = (field_id, px, py, pz) =>
  apiClient.post(`${BASE}/curl`, { field_id, px, py, pz }).then((r) => r.data);

export const fetchFieldSamples = (mode, field_id, step = 2.0, extent = 4.0) =>
  apiClient.post(`${BASE}/field-samples`, { mode, field_id, step, extent }).then((r) => r.data);

export const fetchSurfaceMesh = (field_id, segments = 40, extent = 5.0) =>
  apiClient.get(`${BASE}/surface-mesh`, { params: { field_id, segments, extent } }).then((r) => r.data);

// topic: "gradient" | "divergence" | "curl" | "random"
export const generateVCQuiz = (topic = "random") =>
  apiClient.post(`${BASE}/quiz`, { topic }).then((r) => r.data);
