"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export function useAutoSave<T>(
  saveFn: (payload: T) => Promise<unknown>,
  delay = 900,
) {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pending = useRef<T | null>(null);
  const saveRef = useRef(saveFn);

  useEffect(() => {
    saveRef.current = saveFn;
  }, [saveFn]);

  const flush = useCallback(async () => {
    if (pending.current == null) return;
    const payload = pending.current;
    pending.current = null;
    setStatus("saving");
    try {
      await saveRef.current(payload);
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  }, []);

  const schedule = useCallback(
    (payload: T) => {
      pending.current = payload;
      setStatus("saving");
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(flush, delay);
    },
    [flush, delay],
  );

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  return { status, schedule, flush };
}
