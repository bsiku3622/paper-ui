import { useMemo, type MutableRefObject, type Ref, type RefCallback } from "react";

// One callback ref that feeds every ref it is given. A callback ref that returns a cleanup keeps React 19's
// contract: the cleanup runs on unmount instead of a call with null. Any other ref is called with null on unmount.
export function mergeRefs<T>(...refs: ReadonlyArray<Ref<T> | undefined | null>): RefCallback<T> {
  const cleanups: Array<(() => void) | undefined> = [];
  return (node) => {
    refs.forEach((ref, index) => {
      if (typeof ref === "function") {
        const cleanup = cleanups[index];
        if (node === null && cleanup) {
          cleanups[index] = undefined;
          cleanup();
          return;
        }
        const result = ref(node);
        cleanups[index] = typeof result === "function" ? result : undefined;
      } else if (ref) {
        (ref as MutableRefObject<T | null>).current = node;
      }
    });
  };
}

// mergeRefs with a callback that holds its identity while the refs do, so React does not detach and reattach every render.
export function useMergedRef<T>(...refs: ReadonlyArray<Ref<T> | undefined | null>): RefCallback<T> {
  // eslint-disable-next-line react-hooks/exhaustive-deps -- the refs are the dependencies
  return useMemo(() => mergeRefs(...refs), refs);
}
