// Small hooks every page shares: a pretend request time, a clock tick, a tab that lives in the address, a copy button.

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { useToast } from "../../../kit";
import { ApiError } from "./errors";

export const sleep = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

// A progress that fills over `duration` (fast at first, slower at the end), reported on every frame. It stops with an
// ApiError when the caller says it was cancelled.
export const animate = (duration: number, onFrame: (ratio: number) => void, isCancelled: () => boolean) =>
  new Promise<void>((resolve, reject) => {
    const start = performance.now();
    const step = () => {
      if (isCancelled()) {
        reject(new ApiError("업로드를 멈췄습니다.", "aborted", 0));
        return;
      }
      const ratio = Math.min(1, (performance.now() - start) / duration);
      onFrame(1 - (1 - ratio) ** 2);
      if (ratio < 1) window.setTimeout(step, 70);
      else resolve();
    };
    step();
  });

// How long a pretend request takes: long enough to see the spinner, short enough not to be in the way.
export const LATENCY = { quick: 140, list: 280, save: 650, slow: 1100 } as const;

// "The request is out": false until `ms` has passed, again after reload().
export const useDelay = (ms: number = LATENCY.list) => {
  const [ready, setReady] = useState(false);
  const [round, setRound] = useState(0);
  useEffect(() => {
    setReady(false);
    const timer = window.setTimeout(() => setReady(true), ms);
    return () => window.clearTimeout(timer);
  }, [ms, round]);
  const reload = useCallback(() => setRound((current) => current + 1), []);
  return { ready, reload };
};

// ?state=error and ?state=empty show a list's other faces without breaking anything first.
export type DemoState = "error" | "empty" | null;
export const useDemoState = (): DemoState => {
  const [params] = useSearchParams();
  const value = params.get("state");
  return value === "error" || value === "empty" ? value : null;
};

// Re-renders every `ms`, for numbers that move on their own (a countdown, a live rate).
export const useTick = (ms: number) => {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => setTick((current) => current + 1), ms);
    return () => window.clearInterval(timer);
  }, [ms]);
  return tick;
};

// The page's tab, kept in ?tab= so it can be linked to and survives a reload. The first tab leaves the address clean.
export const useTab = <T extends string>(ids: readonly T[], fallback: T) => {
  const [params, setParams] = useSearchParams();
  const asked = params.get("tab") ?? "";
  const value = (ids as readonly string[]).includes(asked) ? (asked as T) : fallback;
  const choose = useCallback(
    (next: string) => {
      setParams(
        (current) => {
          const copy = new URLSearchParams(current);
          if (next === fallback) copy.delete("tab");
          else copy.set("tab", next);
          return copy;
        },
        { replace: true },
      );
    },
    [fallback, setParams],
  );
  return [value, choose] as const;
};

// A copy button's memory: which thing was just copied (for 1.2 seconds), and the copying. A blocked clipboard says so.
export const useCopy = () => {
  const toast = useToast();
  const [copied, setCopied] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const copy = useCallback(
    async (text: string, key: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(key);
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setCopied((current) => (current === key ? null : current)), 1200);
      } catch {
        toast("클립보드에 쓰지 못했습니다. 직접 복사해주세요.", { tone: "error" });
      }
    },
    [toast],
  );
  return { copied, copy };
};
