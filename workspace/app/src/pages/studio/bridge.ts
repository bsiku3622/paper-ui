// The studio's end of the bridge. The frames register here with the origin they were opened at; what a frame says is taken only from
// that frame's window and that origin, and the whole state goes to every frame whenever it changes. The window the toolbar opens
// (새 창) is one more frame: its page takes the same state and says what the stage's frames say.

import { allowedOrigin, envelope, isEnvelope, type FromChild, type Mode, type ToChild } from "./protocol";
import { getStore, stateFor, WINDOW } from "./store";

// `ready` is set when the frame has said hello. Until then its window is a blank page of the studio's own origin, and what is posted to
// it for the frame's origin would be refused with a warning.
type Registered = { id: string; window: () => Window | null; origin: string; theme: () => Mode; ready?: boolean };

const frames = new Map<string, Registered>();

export const registerFrame = (frame: Registered): (() => void) => {
  frames.set(frame.id, frame);
  return () => {
    if (frames.get(frame.id) === frame) frames.delete(frame.id);
  };
};

const post = (frame: Registered, message: ToChild) => frame.window()?.postMessage(envelope(message), frame.origin);

export const sendState = (id?: string): void => {
  const store = getStore();
  for (const frame of id ? [frames.get(id)] : frames.values()) if (frame && (id || frame.ready)) post(frame, { kind: "state", state: stateFor(store, frame.theme()) });
};

let scheduled = 0;
// The state of a burst of changes goes once, at the next frame.
export const sendStateSoon = (): void => {
  if (scheduled) return;
  scheduled = window.requestAnimationFrame(() => {
    scheduled = 0;
    sendState();
  });
};

export const goTo = (id: string, path: string): void => {
  const frame = frames.get(id);
  if (frame) post(frame, { kind: "go", path });
};

// One window for the studio, opened again at another page when the toolbar asks again. It is as wide as the preview is told to be
// (a 390 page is seen at 390) and as tall as the screen allows. The browser may refuse to open it; then nothing is registered.
const WINDOW_NAME = "paper-studio-window";

export const openWindow = (url: string, width: number): boolean => {
  const opened = window.open(url, WINDOW_NAME, `popup,width=${width},height=${window.screen.availHeight}`);
  if (!opened) return false;
  opened.focus();
  registerFrame({ id: WINDOW, window: () => (opened.closed ? null : opened), origin: new URL(url).origin, theme: () => getStore().view.theme });
  return true;
};

export const frameIds = (): string[] => [...frames.keys()];

export type Hear = (id: string, message: FromChild) => void;

// Listens for the frames. A message counts when its envelope is ours, its origin is one of the allowed and the one the frame was opened
// at, and its sender is the frame's own window. The frame that says hello is sent the state at once.
export const listen = (hear: Hear): (() => void) => {
  const onMessage = (event: MessageEvent) => {
    if (!allowedOrigin(event.origin) || !isEnvelope(event.data)) return;
    const frame = [...frames.values()].find((one) => one.window() === event.source);
    if (!frame || frame.origin !== event.origin) return;
    const message = event.data as unknown as FromChild;
    if (message.kind === "hello") frame.ready = true;
    hear(frame.id, message);
    if (message.kind === "hello") sendState(frame.id);
  };
  window.addEventListener("message", onMessage);
  return () => window.removeEventListener("message", onMessage);
};
