// Tooltip — trigger와 떠오르는 쪽지의 관계가 드러나는 compound API.

import {
  cloneElement,
  createContext,
  useContext,
  useId,
  useState,
  type FocusEvent,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from "react";

import { Box } from "../primitives";
import { tooltipWrap, tooltipBubble, tooltipPlacement, tooltipTrigger } from "./Tooltip.css";

type TooltipContextValue = {
  open: boolean;
  id: string;
  placement: "top" | "bottom";
};

const TooltipContext = createContext<TooltipContextValue | null>(null);
const useTooltip = () => {
  const value = useContext(TooltipContext);
  if (!value) throw new Error("Tooltip parts must be used inside <Tooltip>");
  return value;
};

export type TooltipProps = { children: ReactNode };

const TooltipRoot = ({ children }: TooltipProps) => {
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState<"top" | "bottom">("top");
  const id = useId();

  const show = (event: MouseEvent | FocusEvent) => {
    const top = (event.currentTarget as HTMLElement).getBoundingClientRect().top;
    setPlacement(top < 44 ? "bottom" : "top");
    setOpen(true);
  };

  return (
    <TooltipContext.Provider value={{ open, id, placement }}>
      <Box
        className={tooltipWrap}
        onMouseEnter={show}
        onMouseLeave={() => setOpen(false)}
        onFocus={show}
        onBlur={() => setOpen(false)}
        onKeyDown={(event) => {
          if (event.key === "Escape") setOpen(false);
        }}
      >
        {children}
      </Box>
    </TooltipContext.Provider>
  );
};

type TriggerElementProps = { "aria-describedby"?: string };
export type TooltipTriggerProps = {
  children: ReactElement<TriggerElementProps>;
  asChild?: boolean;
};

export const TooltipTrigger = ({ children, asChild = false }: TooltipTriggerProps) => {
  const { open, id } = useTooltip();
  const describedBy = [children.props["aria-describedby"], open ? id : undefined].filter(Boolean).join(" ") || undefined;

  if (asChild) return cloneElement(children, { "aria-describedby": describedBy });
  return (
    <Box as="button" type="button" className={tooltipTrigger} aria-describedby={describedBy}>
      {children}
    </Box>
  );
};

export type TooltipContentProps = { children: ReactNode };
export const TooltipContent = ({ children }: TooltipContentProps) => {
  const { open, id, placement } = useTooltip();
  if (!open) return null;
  return (
    <Box id={id} role="tooltip" className={`${tooltipBubble} ${tooltipPlacement[placement]}`}>
      {children}
    </Box>
  );
};

export const Tooltip = Object.assign(TooltipRoot, {
  Trigger: TooltipTrigger,
  Content: TooltipContent,
});
