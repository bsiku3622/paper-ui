import { forwardRef, type HTMLAttributes } from "react";

import { dropMessages, sayMessage } from "../../internal/aria/live";

export type LivePoliteness = "polite" | "assertive";

export type LiveRegionProps = Omit<HTMLAttributes<HTMLDivElement>, "role" | "aria-live" | "aria-atomic"> & {
  politeness?: LivePoliteness;
  atomic?: boolean;
};

// A live region has to be in the page before its content changes, so mount it empty and change what is inside.
export const LiveRegion = forwardRef<HTMLDivElement, LiveRegionProps>(function LiveRegion({ politeness = "polite", atomic = true, ...rest }, ref) {
  return <div {...rest} ref={ref} role={politeness === "assertive" ? "alert" : "status"} aria-live={politeness} aria-atomic={atomic} />;
});

export type AnnounceOptions = {
  politeness?: LivePoliteness;
  timeout?: number;
};

export function announce(message: string, { politeness = "polite", timeout }: AnnounceOptions = {}): void {
  sayMessage(message, politeness, timeout);
}

export function clearAnnouncements(politeness?: LivePoliteness): void {
  dropMessages(politeness);
}
