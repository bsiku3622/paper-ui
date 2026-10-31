import { forwardRef, type HTMLAttributes } from "react";

import { dropMessages, sayMessage } from "../../internal/aria/live";

export type LivePoliteness = "polite" | "assertive";

export type LiveRegionProps = Omit<HTMLAttributes<HTMLDivElement>, "role" | "aria-live" | "aria-atomic"> & {
  /** polite waits for the reader to finish and is a status; assertive interrupts and is an alert. */
  politeness?: LivePoliteness;
  /** Read the whole region again when any part of it changes. */
  atomic?: boolean;
};

// A region assistive technology watches. It has to be in the page before its content changes, so mount it empty
// and change what is inside.
export const LiveRegion = forwardRef<HTMLDivElement, LiveRegionProps>(function LiveRegion({ politeness = "polite", atomic = true, ...rest }, ref) {
  return <div {...rest} ref={ref} role={politeness === "assertive" ? "alert" : "status"} aria-live={politeness} aria-atomic={atomic} />;
});

export type AnnounceOptions = {
  politeness?: LivePoliteness;
  /** Milliseconds the message stays in the page before it is removed. */
  timeout?: number;
};

/** Says a message once and lets it go: for a result that has no element of its own to change. */
export function announce(message: string, { politeness = "polite", timeout }: AnnounceOptions = {}): void {
  sayMessage(message, politeness, timeout);
}

/** Drops the announcements still waiting to be said, in one politeness or in both. */
export function clearAnnouncements(politeness?: LivePoliteness): void {
  dropMessages(politeness);
}
