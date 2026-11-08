import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { useToast } from "../../../kit";
import { ApiError } from "./errors";

export const sleep = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

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

export const LATENCY = { quick: 140, list: 280, save: 650, slow: 1100 } as const;

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

export type DemoState = "error" | "empty" | null;
export const useDemoState = (): DemoState => {
  const [params] = useSearchParams();
  const value = params.get("state");
  return value === "error" || value === "empty" ? value : null;
};

export const useTick = (ms: number) => {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => setTick((current) => current + 1), ms);
    return () => window.clearInterval(timer);
  }, [ms]);
  return tick;
};

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
