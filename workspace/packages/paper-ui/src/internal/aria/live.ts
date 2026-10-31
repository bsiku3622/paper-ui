import { announce, clearAnnouncer } from "@react-aria/live-announcer";

export type Politeness = "polite" | "assertive";

// Says a message through the page's live regions, which assistive technology reads without moving focus.
export const sayMessage = (message: string, politeness: Politeness, timeout?: number): void => announce(message, politeness, timeout);

// Drops the messages still waiting to be said, in one politeness or both.
export const dropMessages = (politeness?: Politeness): void => {
  for (const level of politeness ? [politeness] : (["polite", "assertive"] as const)) clearAnnouncer(level);
};
