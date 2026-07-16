// Tooltip — 잠깐 뜨는 쪽지.

import { useId, useState, type ReactNode } from "react";

import { Box } from "../primitives";
import { tooltipWrap, tooltipBubble } from "./Tooltip.css";

export type TooltipProps = {
  label: string;
  children?: ReactNode;
};

export const Tooltip = ({ label, children }: TooltipProps) => {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <Box
      className={tooltipWrap}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <Box aria-describedby={open ? id : undefined}>{children}</Box>
      {open ? (
        <Box id={id} role="tooltip" className={tooltipBubble}>
          {label}
        </Box>
      ) : null}
    </Box>
  );
};
