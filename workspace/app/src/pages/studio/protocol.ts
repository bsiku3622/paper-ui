// The bridge between the studio (/demo) and a page it shows — a screen of this site or an app of the owner's own host — in its
// iframe, or in the window of its own the studio opens (새 창).
//
// Messages go through postMessage with an envelope { channel, v, kind, ... }. Both sides accept only the origins below (and the
// site's own origin, for the screens it serves itself), and a child also checks that the sender is the studio's window: its
// parent in a frame, its opener in a window. The host keeps the same file (src/studio/protocol.ts there); the two are kept equal
// by hand, so change both.

export const CHANNEL = "paper-studio";
export const PROTOCOL = 1;

// The only origins that talk: the dev server of this site and of the host, by name and by address.
export const ORIGINS: readonly string[] = ["http://localhost:5173", "http://localhost:5310", "http://127.0.0.1:5173", "http://127.0.0.1:5310"];

export type Mode = "light" | "dark";
export type LeverValue = string | boolean;

// A lever of a lab, described so the studio's panel can draw it without knowing the page's looks. No options: a switch.
export type LeverDef = { key: string; label: string; note?: string; section?: string; options?: readonly { value: string; label: string }[] };
export type PresetDef = { id: string; label: string; note?: string; values: Record<string, LeverValue> };
export type LabSpec = { levers: readonly LeverDef[]; presets: readonly PresetDef[]; defaults: Record<string, LeverValue> };

// What the studio sets on a marked part: a prop and its new value. null takes the prop away, so the part's own default applies.
export type PartValue = string | number | boolean | null;
export type PartEdits = Record<string, Record<string, PartValue>>;

// The overrides of PaperProvider as plain data: color per mode, palette, shape, layout, typography, shadow per mode, opacity.
export type TokenTree = { [key: string]: string | TokenTree };
export type TokenOverrides = Partial<Record<"color" | "palette" | "shape" | "layout" | "typography" | "shadow" | "opacity", TokenTree>>;

export type StudioState = {
  theme: Mode;
  // Held down on "원본": the page draws as its code wrote it, with none of the changes below.
  paused: boolean;
  pick: boolean;
  selected: string | null;
  levers: Record<string, LeverValue>;
  tokens: TokenOverrides;
  parts: PartEdits;
};

export const EMPTY_STATE: StudioState = { theme: "light", paused: false, pick: false, selected: null, levers: {}, tokens: {}, parts: {} };

// One place in the code that draws a part: its mark, and what the code says there.
export type PartSite = {
  key: string;
  component: string;
  file: string;
  line: number;
  // The props the code writes as plain values, and the names of the ones it computes.
  literals: Record<string, string | number | boolean>;
  dynamic: string[];
};

export type PickReport = PartSite & {
  // How many places on the page this one place in the code draws.
  count: number;
  rect: { x: number; y: number; width: number; height: number };
  viewport: { width: number; height: number };
  // The marked parts around this one, nearest first.
  chain: PartSite[];
};

// What the studio offers to set on a part: one prop of it. A choice names its options; a number may bound itself.
export type PropDef = { key: string; label: string; kind: "choice" | "switch" | "text" | "number"; options?: readonly string[]; min?: number; max?: number; step?: number; note?: string };
export type PartSpec = { label: string; props: readonly PropDef[] };

type Envelope = { channel: typeof CHANNEL; v: typeof PROTOCOL };

// The state carries the picker (pick, selected) too, so the page never needs a command of its own for them.
export type ToChild =
  | { kind: "state"; state: StudioState }
  | { kind: "go"; path: string };

export type FromChild =
  // `parts` is what the page can say about parts of its own that Paper does not know (the kit's), by name.
  | { kind: "hello"; app: string; path: string; title: string; marks: boolean; lab?: LabSpec; parts?: Record<string, PartSpec> }
  | { kind: "route"; path: string; title: string }
  | { kind: "pick"; pick: PickReport }
  | { kind: "escape" }
  | { kind: "error"; message: string };

export const envelope = <T extends { kind: string }>(message: T): Envelope & T => ({ channel: CHANNEL, v: PROTOCOL, ...message });

export const isEnvelope = (data: unknown): data is Envelope & { kind: string } =>
  typeof data === "object" && data !== null && (data as Envelope).channel === CHANNEL && (data as Envelope).v === PROTOCOL && typeof (data as { kind?: unknown }).kind === "string";

export const allowedOrigin = (origin: string): boolean => ORIGINS.includes(origin) || (typeof window !== "undefined" && origin === window.location.origin);

// The studio's window: the page that holds this one in a frame, or, for a page in a window of its own, the page that opened it.
export const studioWindow = (): Window | null => {
  if (typeof window === "undefined") return null;
  if (window.parent !== window) return window.parent;
  const opener = window.opener as Window | null;
  return opener && !opener.closed ? opener : null;
};

// The origin of the studio's window, if it is one of the allowed. A frame knows it from its ancestors and its referrer; a window
// knows it from its referrer, the page it was opened from.
export const studioOrigin = (): string | null => {
  const studio = studioWindow();
  if (!studio) return null;
  const candidates: string[] = [];
  const ancestors = (window.location as Location & { ancestorOrigins?: DOMStringList }).ancestorOrigins;
  if (studio === window.parent && ancestors?.[0]) candidates.push(ancestors[0]);
  try {
    if (document.referrer) candidates.push(new URL(document.referrer).origin);
  } catch {
    // A referrer that is not a URL says nothing.
  }
  return candidates.find(allowedOrigin) ?? null;
};

// The page is the studio's preview when the studio's window is of an allowed origin and the page was opened with ?studio=1. The
// answer is kept on the window: the address changes as the app navigates, and a module that loads again must not forget it.
const REMEMBER = "__paperStudioFrame";
export const detectEmbedded = (): boolean => {
  if (typeof window === "undefined") return false;
  const kept = window as unknown as Record<string, unknown>;
  if (typeof kept[REMEMBER] === "boolean") return kept[REMEMBER];
  const on = new URLSearchParams(window.location.search).get("studio") === "1" && studioOrigin() !== null;
  kept[REMEMBER] = on;
  return on;
};

export const initialMode = (): Mode => (new URLSearchParams(window.location.search).get("theme") === "dark" ? "dark" : "light");

export const send = (message: FromChild): void => {
  const studio = studioWindow();
  const origin = studioOrigin();
  if (studio && origin) studio.postMessage(envelope(message), origin);
};
