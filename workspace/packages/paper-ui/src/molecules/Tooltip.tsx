// Tooltip — 잠깐 뜨는 쪽지.
//
// 위쪽이 기본이되, trigger 위에 공간이 없으면(상단 navbar 등) 자동으로 아래로
// 뒤집는다. 툴팁이 화면 밖으로 잘려 나가는 건 사용자가 고를 문제가 아니다 —
// 시스템이 처리한다.

import { useId, useState, type FocusEvent, type MouseEvent, type ReactNode } from "react";

import { Box } from "../primitives";
import { tooltipWrap, tooltipBubble, tooltipPlacement } from "./Tooltip.css";

export type TooltipProps = {
  label: string;
  children?: ReactNode;
};

export const Tooltip = ({ label, children }: TooltipProps) => {
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState<"top" | "bottom">("top");
  const id = useId();

  // 위 공간이 부족하면(≈ 말풍선 높이) 아래로. e.currentTarget 로 ref 없이 측정.
  const show = (e: MouseEvent | FocusEvent) => {
    const top = (e.currentTarget as HTMLElement).getBoundingClientRect().top;
    setPlacement(top < 44 ? "bottom" : "top");
    setOpen(true);
  };
  const hide = () => setOpen(false);

  return (
    <Box
      className={tooltipWrap}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      <Box aria-describedby={open ? id : undefined}>{children}</Box>
      {open ? (
        <Box id={id} role="tooltip" className={`${tooltipBubble} ${tooltipPlacement[placement]}`}>
          {label}
        </Box>
      ) : null}
    </Box>
  );
};
