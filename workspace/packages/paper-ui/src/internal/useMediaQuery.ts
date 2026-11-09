import { useCallback, useSyncExternalStore } from "react";

const server = () => false;

export function useMediaQuery(query: string | null): boolean {
  const subscribe = useCallback((notify: () => void) => {
    if (query === null || typeof window.matchMedia !== "function") return () => {};
    const list = window.matchMedia(query);
    list.addEventListener("change", notify);
    return () => list.removeEventListener("change", notify);
  }, [query]);
  const read = useCallback(() => query !== null && typeof window.matchMedia === "function" && window.matchMedia(query).matches, [query]);
  return useSyncExternalStore(subscribe, read, server);
}
