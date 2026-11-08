// The conversation, kept in memory only — as the privacy page promises, a reload clears it. It lives outside React so the
// small window in the top bar and the Ask page read the same one, and so an answer that is still arriving keeps arriving
// when you move to another page. An answer is a short timeline: the model wakes (only the first time, when it is the
// desktop one), it thinks, each tool it uses appears as a step, then the text arrives in pieces.

import { useSyncExternalStore } from "react";

import { answer, type Context, type Step } from "./engine";

export type Status = "waking" | "thinking" | "streaming" | "done";
export type Message = { id: number; role: "user" | "assistant"; text: string; steps: Step[]; shownSteps: number; status: Status; seconds: number };
export type Model = "gemma" | "gpt";
export const MODELS: { id: Model; label: string }[] = [
  { id: "gemma", label: "데스크탑 Gemma" },
  { id: "gpt", label: "OpenAI" },
];

let messages: Message[] = [];
let next = 1;
let warmed = false;
const listeners = new Set<() => void>();
const timers = new Set<number>();

const emit = () => {
  messages = [...messages];
  listeners.forEach((listener) => listener());
};
const patch = (id: number, change: Partial<Message>) => {
  messages = messages.map((message) => (message.id === id ? { ...message, ...change } : message));
  emit();
};
const later = (ms: number, run: () => void) => {
  const timer = window.setTimeout(() => {
    timers.delete(timer);
    run();
  }, ms);
  timers.add(timer);
};

export const useMessages = () =>
  useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => messages,
  );

export const isBusy = (list: readonly Message[]) => list.some((message) => message.role === "assistant" && message.status !== "done");

export const send = (question: string, context: Context, model: Model) => {
  const text = question.trim();
  if (!text || isBusy(messages)) return;
  const reply = answer(text, context);
  const user: Message = { id: next++, role: "user", text, steps: [], shownSteps: 0, status: "done", seconds: 0 };
  const waking = model === "gemma" && !warmed;
  warmed = true;
  const bot: Message = { id: next++, role: "assistant", text: "", steps: reply.steps, shownSteps: 0, status: waking ? "waking" : "thinking", seconds: 0 };
  messages = [...messages, user, bot];
  emit();

  const started = Date.now();
  let at = waking ? 1500 : 0;
  if (waking) later(at, () => patch(bot.id, { status: "thinking" }));
  at += 500;
  reply.steps.forEach((_, index) => {
    later(at, () => patch(bot.id, { shownSteps: index + 1 }));
    at += 750;
  });
  later(at, () => {
    patch(bot.id, { status: "streaming" });
    let shown = 0;
    const tick = () => {
      shown = Math.min(reply.text.length, shown + 5);
      const done = shown >= reply.text.length;
      patch(bot.id, { text: reply.text.slice(0, shown), ...(done ? { status: "done" as const, seconds: Math.max(1, Math.round((Date.now() - started) / 1000)) } : {}) });
      if (!done) later(28, tick);
    };
    tick();
  });
};

// A conversation that is already finished, for a screenshot (?demo=done) or a first look: no timers, no waiting.
export const seed = (questions: readonly string[], context: Context) => {
  if (messages.length > 0) return;
  for (const question of questions) {
    const reply = answer(question, context);
    messages = [
      ...messages,
      { id: next++, role: "user", text: question, steps: [], shownSteps: 0, status: "done", seconds: 0 },
      { id: next++, role: "assistant", text: reply.text, steps: reply.steps, shownSteps: reply.steps.length, status: "done", seconds: 2 },
    ];
  }
  warmed = true;
  emit();
};

export const reset = () => {
  timers.forEach((timer) => window.clearTimeout(timer));
  timers.clear();
  messages = [];
  emit();
};
