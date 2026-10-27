import { VisuallyHidden as AriaVisuallyHidden, type VisuallyHiddenProps as AriaVisuallyHiddenProps } from "@react-aria/visually-hidden";

export type VisuallyHiddenProps = Omit<AriaVisuallyHiddenProps, "elementType"> & { as?: AriaVisuallyHiddenProps["elementType"] };
export function VisuallyHidden({ as = "span", ...props }: VisuallyHiddenProps) {
  return <AriaVisuallyHidden {...props} elementType={as} />;
}
