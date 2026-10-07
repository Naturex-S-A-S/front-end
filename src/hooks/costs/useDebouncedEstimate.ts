"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { estimateDummyProductAction } from "@/api/costs/actions";
import type { DummyEstimatePayload, ICostEstimate } from "@/types/pages/costs";

const DEBOUNCE_MS = 400;

// El resultado de la Server Action viaja serializado y su `error` debería ser
// string, pero si el backend devuelve algo inesperado nunca debe llegar un
// objeto a la UI (se renderizaría como "[object Object]").
const toErrorText = (value: unknown): string => {
  if (typeof value === "string" && value.length > 0) return value;

  try {
    const serialized = JSON.stringify(value);

    if (serialized) return serialized;
  } catch {
    // usa el mensaje genérico
  }

  return "No se pudo calcular la estimación";
};

const useDebouncedEstimate = () => {
  const [estimate, setEstimate] = useState<ICostEstimate | null>(null);
  const [isEstimating, setIsEstimating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestPayloadRef = useRef<DummyEstimatePayload | null>(null);
  const inflightIdRef = useRef(0);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      inflightIdRef.current++;
    },
    []
  );

  const runEstimate = useCallback((payload: DummyEstimatePayload) => {
    if (timerRef.current) clearTimeout(timerRef.current);

    latestPayloadRef.current = payload;
    setIsEstimating(true);
    setError(null);

    timerRef.current = setTimeout(() => {
      const currentId = ++inflightIdRef.current;
      const p = latestPayloadRef.current;

      if (!p) return;

      void (async () => {
        const result = await estimateDummyProductAction(p);

        if (inflightIdRef.current !== currentId) return;
        setIsEstimating(false);

        if (result.success) {
          setEstimate(result.data);
        } else {
          setEstimate(null);
          setError(toErrorText(result.error));
        }
      })();
    }, DEBOUNCE_MS);
  }, []);

  const reset = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    latestPayloadRef.current = null;
    inflightIdRef.current++;
    setEstimate(null);
    setError(null);
    setIsEstimating(false);
  }, []);

  return { estimate, isEstimating, error, runEstimate, reset };
};

export default useDebouncedEstimate;
