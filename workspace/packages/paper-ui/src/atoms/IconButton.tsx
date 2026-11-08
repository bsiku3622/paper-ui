import { forwardRef, type ElementType, type ReactElement, type ReactNode } from "react";

import { registerAtom } from "../internal/render-target";
import type { ControlForm } from "../primitives/control/Control";
import type { IconProps } from "../primitives/Icon";
import type { PaintFace } from "../primitives/paint/Paint";
import type { PolymorphicProps } from "../primitives/polymorphic";
import type { Accent } from "../tokens";
import { ButtonBase, type ButtonBaseProps } from "./button-base";

type IconButtonOwn = Pick<ControlForm, "size" | "shape" | "iconSize"> & PaintFace & {
  accent?: Accent;
  disabled?: boolean;
  badge?: ReactNode;
  "aria-label": string;
  children: ReactElement<IconProps>;
  className?: string;
};

export type IconButtonProps<As extends ElementType = "button"> = PolymorphicProps<IconButtonOwn, As>;

const IconButtonImpl = forwardRef<HTMLElement, Record<string, unknown>>(function IconButton(props, ref) {
  return <ButtonBase ref={ref} anatomy="icon" {...(props as Omit<ButtonBaseProps, "anatomy">)} />;
});

export const IconButton = registerAtom(IconButtonImpl) as unknown as {
  <As extends ElementType = "button">(props: IconButtonProps<As>): ReactElement;
};
