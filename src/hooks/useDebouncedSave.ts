import { useEffect, useRef, useState } from "react";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

/**
 * Debounces writes. `onSave` is called 800ms after the last `signal` change.
 * Force-flushes on unmount (so navigating away saves immediately).
 */
export function useDebouncedSave<T>(
  signal: T,
  onSave: (value: T) => Promise<void> | void,
  delayMs = 800
) {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestRef = useRef<T>(signal);
  const onSaveRef = useRef(onSave);
  const firstRenderRef = useRef(true);

  // Keep onSave fresh without restarting the timer
  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  useEffect(() => {
    latestRef.current = signal;
  }, [signal]);

  useEffect(() => {
    // Skip on first render (nothing has changed yet)
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      return;
    }

    setStatus("saving");
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      try {
        await onSaveRef.current(latestRef.current);
        setStatus("saved");
        // Fade back to idle after 1.5s
        setTimeout(() => {
          setStatus((s) => (s === "saved" ? "idle" : s));
        }, 1500);
      } catch (err) {
        console.error("Save failed:", err);
        setStatus("error");
      }
    }, delayMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [signal, delayMs]);

  // Flush on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        // Best-effort: still call onSave with latest
        try {
          onSaveRef.current(latestRef.current);
        } catch {
          /* ignore */
        }
      }
    };
  }, []);

  return status;
}