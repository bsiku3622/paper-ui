import { announce, clearAnnouncer } from "@react-aria/live-announcer";

export type Politeness = "polite" | "assertive";

export const sayMessage = (message: string, politeness: Politeness, timeout?: number): void => announce(message, politeness, timeout);

export const dropMessages = (politeness?: Politeness): void => {
  for (const level of politeness ? [politeness] : (["polite", "assertive"] as const)) clearAnnouncer(level);
};
