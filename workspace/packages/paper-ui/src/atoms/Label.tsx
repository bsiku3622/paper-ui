// Label — 입력의 이름표. Text label 역할을 그대로 쓴다.

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
