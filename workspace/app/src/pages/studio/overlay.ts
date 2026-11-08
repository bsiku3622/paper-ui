// The two lines the picker draws over a page in a frame, and where they stand. A line is placed where the part is: the numbers are the
// page's, measured now, and not the system's, so they are written here and nowhere else.

import { surfaceClass } from "@studio-baeks/paper-ui";

import * as s from "./studio.css";

export type Box = { x: number; y: number; width: number; height: number };

// Over everything on the page, in the tier toasts stand in.
const OVER = surfaceClass({ elevation: "toast" });

export type Lines = { hover: HTMLElement; name: HTMLElement; picked: HTMLElement };

export const makeLines = (): Lines => {
  const hover = document.createElement("div");
  hover.className = `${OVER} ${s.hoverBox}`;
  const name = document.createElement("span");
  name.className = s.label;
  hover.appendChild(name);
  const picked = document.createElement("div");
  picked.className = `${OVER} ${s.pickedBox}`;
  document.body.append(hover, picked);
  return { hover, name, picked };
};

export const hide = (line: HTMLElement): void => {
  line.style.setProperty("display", "none");
};

export const place = (line: HTMLElement, box: Box | null): void => {
  if (!box) {
    hide(line);
    return;
  }
  line.style.setProperty("display", "block");
  line.style.setProperty("left", `${box.x}px`);
  line.style.setProperty("top", `${box.y}px`);
  line.style.setProperty("width", `${box.width}px`);
  line.style.setProperty("height", `${box.height}px`);
};

// The name of a part at the top edge of the window goes inside its line, and one that would run out of the window on the right
// stands at the line's right end.
export const nameAt = (name: HTMLElement, text: string, box: Box): void => {
  name.textContent = text;
  name.className = box.y < 28 ? `${s.label} ${s.labelInside}` : s.label;
  if (box.x + name.offsetWidth > window.innerWidth) name.classList.add(s.labelEnd);
};
