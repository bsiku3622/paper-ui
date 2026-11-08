import { forwardRef, type ElementType, type ReactElement, type ReactNode } from "react";

import { registerAtom } from "../internal/render-target";
import type { ControlForm } from "../primitives/control/Control";
import type { PaintFace } from "../primitives/paint/Paint";
import type { PolymorphicProps } from "../primitives/polymorphic";
import type { Accent, SelectableVariant, Variant } from "../tokens";
import { ButtonBase, type ButtonBaseProps } from "./button-base";

type ButtonSelection = { variant?: Variant; selected?: undefined } | { variant: SelectableVariant; selected: boolean };

type ButtonOwn = Pick<ControlForm, "size" | "fontSize" | "strong" | "shape" | "gap" | "align" | "justify"> & ButtonSelection & PaintFace & {
  accent?: Accent;
  loading?: boolean;
  loadingLabel?: string;
  fullWidth?: boolean;
  badge?: ReactNode;
  disabled?: boolean;
  children?: ReactNode;
  className?: string;
};

export type ButtonProps<As extends ElementType = "button"> = PolymorphicProps<ButtonOwn, As>;

const ButtonImpl = forwardRef<HTMLElement, Record<string, unknown>>(function Button(props, ref) {
  return <ButtonBase ref={ref} anatomy="label" {...(props as Omit<ButtonBaseProps, "anatomy">)} />;
});

export const Button = registerAtom(ButtonImpl) as unknown as {
  <As extends ElementType = "button">(props: ButtonProps<As>): ReactElement;
};
