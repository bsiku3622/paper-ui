import { forwardRef, type ComponentPropsWithRef, type ComponentPropsWithoutRef, type ElementType, type ReactElement, type ReactNode } from "react";
import { mergeProps } from "@react-aria/utils";
import { useHover, type HoverOptions } from "./useHover";

export type HoverableState = { isHovered: boolean; isDisabled: boolean };
export type HoverableProps<As extends ElementType = "div"> = HoverOptions & {
  as?: As;
  children?: ReactNode | ((state: HoverableState) => ReactNode);
} & Omit<ComponentPropsWithoutRef<As>, keyof HoverOptions | "children"> & { ref?: ComponentPropsWithRef<As>["ref"] };
const HoverableImpl = forwardRef<HTMLElement, Omit<HoverableProps, "as" | "ref"> & { as?: ElementType }>(function Hoverable({ as, disabled = false, onHoverStart, onHoverEnd, onHoverChange, children, ...rest }, ref) {
  const Tag = (as ?? "div") as ElementType;
  const { hoverProps, isHovered } = useHover({ disabled, onHoverStart, onHoverEnd, onHoverChange });
  return <Tag {...mergeProps(rest, hoverProps)} ref={ref} data-hovered={isHovered || undefined}>
    {typeof children === "function" ? children({ isHovered, isDisabled: disabled }) : children}
  </Tag>;
});
export const Hoverable = HoverableImpl as <As extends ElementType = "div">(props: HoverableProps<As>) => ReactElement;
