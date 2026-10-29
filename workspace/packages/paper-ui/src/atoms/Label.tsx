// Label — 입력의 이름표. Text label 역할을 그대로 쓴다.

import type { LabelHTMLAttributes, ReactNode } from "react";

import { Text } from "../primitives/Text";

export type LabelProps = Omit<LabelHTMLAttributes<HTMLLabelElement>, "className"> & {
  children?: ReactNode;
  className?: string;
};

export const Label = ({ children, className, ...rest }: LabelProps) => (
  <Text as="label" variant="label" className={className} {...rest}>
    {children}
  </Text>
);
