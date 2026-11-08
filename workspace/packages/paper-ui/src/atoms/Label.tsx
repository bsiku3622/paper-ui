import { forwardRef, type LabelHTMLAttributes, type ReactNode } from "react";

import { Text } from "../primitives/Text";

export type LabelProps = Omit<LabelHTMLAttributes<HTMLLabelElement>, "className"> & {
  children?: ReactNode;
  className?: string;
};

export const Label = forwardRef<HTMLLabelElement, LabelProps>(function Label({ children, className, ...rest }, ref) {
  return (
    <Text as="label" variant="label" ref={ref} className={className} {...rest}>
      {children}
    </Text>
  );
});
