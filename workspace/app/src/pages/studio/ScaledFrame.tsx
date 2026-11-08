// An iframe at the width its page is told to have, drawn smaller by the one scale of the stage. The numbers are the frame's own size and
// that scale, measured now; the wrapper takes the size the frame has on screen.

import { forwardRef } from "react";

import * as s from "./studio.css";

type ScaledFrameProps = { title: string; src: string; width: number; height: number; scale: number; onLoad: () => void };

export const ScaledFrame = forwardRef<HTMLIFrameElement, ScaledFrameProps>(function ScaledFrame({ title, src, width, height, scale, onLoad }, ref) {
  return (
    <div className={s.scaled} style={{ width: width * scale, height: height * scale }}>
      <iframe ref={ref} className={s.frame} title={title} src={src} style={{ width, height, transform: `scale(${scale})` }} onLoad={onLoad} />
    </div>
  );
});
