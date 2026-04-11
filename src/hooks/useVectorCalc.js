// src/hooks/useVectorCalc.js
import {
  computeCurl,
  computeDivergence,
  computeGradient,
  fetchFieldSamples,
  fetchSurfaceMesh,
  fetchVCFields,
} from "@/api/vectorCalcApi";
import { useCallback, useEffect, useRef, useState } from "react";

const DEBOUNCE_MS = 150;

export function useVectorCalc() {
  const [mode, setMode] = useState("gradient");
  const [fieldLists, setFieldLists] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [probe, setProbe] = useState({ x: 1.0, y: 1.0, z: 0.0 });

  const [result, setResult] = useState(null);
  const [fieldSamples, setFieldSamples] = useState([]);
  const [surfaceMesh, setSurfaceMesh] = useState(null);

  const [loading, setLoading] = useState(false);
  const [samplesLoading, setSamplesLoading] = useState(false);
  const [error, setError] = useState(null);

  const debounceRef = useRef(null);

  // ── 초기 필드 목록 로드 ────────────────────────────────────────────────────
  useEffect(() => {
    fetchVCFields()
      .then((data) => {
        setFieldLists(data);
        setSelectedId(data["gradient"][0].id);
      })
      .catch((e) => setError(e.message));
  }, []);

  // ── 모드 전환 ─────────────────────────────────────────────────────────────
  const changeMode = useCallback(
    (newMode) => {
      setMode(newMode);
      setResult(null);
      setFieldSamples([]);
      setSurfaceMesh(null);
      if (fieldLists) setSelectedId(fieldLists[newMode][0].id);
    },
    [fieldLists],
  );

  const changeField = useCallback((id) => {
    setSelectedId(id);
    setResult(null);
  }, []);

  // ── 메인 계산 (디바운스) ───────────────────────────────────────────────────
  const runCalc = useCallback(
    (newProbe = probe, fieldId = selectedId, curMode = mode) => {
      if (!fieldId) return;
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        setLoading(true);
        setError(null);
        try {
          let res;
          if (curMode === "gradient") {
            res = await computeGradient(fieldId, newProbe.x, newProbe.y);
          } else if (curMode === "divergence") {
            res = await computeDivergence(
              fieldId,
              newProbe.x,
              newProbe.y,
              newProbe.z,
            );
          } else {
            res = await computeCurl(
              fieldId,
              newProbe.x,
              newProbe.y,
              newProbe.z,
            );
          }
          setResult(res);
        } catch (e) {
          setError(e.message);
        } finally {
          setLoading(false);
        }
      }, DEBOUNCE_MS);
    },
    [probe, selectedId, mode],
  );

  // ── 탐색점 변경 ───────────────────────────────────────────────────────────
  const updateProbe = useCallback(
    (axis, value) => {
      const newProbe = { ...probe, [axis]: value };
      setProbe(newProbe);
      runCalc(newProbe, selectedId, mode);
    },
    [probe, selectedId, mode, runCalc],
  );

  // ── 필드/모드 변경 시 샘플 재로드 ─────────────────────────────────────────
  useEffect(() => {
    if (!selectedId) return;

    setSamplesLoading(true);
    fetchFieldSamples(mode, selectedId)
      .then((data) => setFieldSamples(data.samples))
      .catch((e) => console.warn("field samples:", e))
      .finally(() => setSamplesLoading(false));

    if (mode === "gradient") {
      fetchSurfaceMesh(selectedId)
        .then(setSurfaceMesh)
        .catch((e) => console.warn("surface mesh:", e));
    } else {
      setSurfaceMesh(null);
    }

    runCalc(probe, selectedId, mode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, mode]);

  const currentFieldMeta =
    fieldLists && selectedId
      ? (fieldLists[mode].find((f) => f.id === selectedId) ?? null)
      : null;

  return {
    mode,
    probe,
    result,
    fieldSamples,
    surfaceMesh,
    loading,
    samplesLoading,
    error,
    fieldLists,
    selectedId,
    currentFieldMeta,
    changeMode,
    changeField,
    updateProbe,
  };
}
