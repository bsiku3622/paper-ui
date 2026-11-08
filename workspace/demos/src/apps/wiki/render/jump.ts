import type { MouseEvent } from "react";

const CLEAR = 88;

export const jump = (id: string) => {
  const element = document.getElementById(id);
  if (!element) return;
  window.scrollTo({ top: element.getBoundingClientRect().top + window.scrollY - CLEAR, behavior: "smooth" });
};

export const jumpOnClick = (id: string) => (event: MouseEvent) => {
  event.preventDefault();
  jump(id);
};

export const toTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
export const toBottom = () => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });
