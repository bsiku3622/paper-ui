// Alert — status surface와 그 안의 title · description anatomy.

import { Children, isValidElement, type ReactNode } from "react";

import { Box, Inline, Stack, Text } from "../primitives";
import { Icon } from "../primitives";
import { joinClass } from "../internal/joinClass";
import { resolveAccent, type Accent, type Variant } from "../resolvers";
import { alertRoot, srOnly } from "./Alert.css";

export type AlertProps = {
  accent?: Accent;
  variant?: Variant;
  children: ReactNode;
  className?: string;
};

const STATUS_WORD: Record<Accent, string> = {
  primary: "안내",
  info: "정보",
  success: "성공",
  warning: "경고",
  error: "오류",
};

const ROLE = (accent: Accent) => (accent === "error" || accent === "warning" ? "alert" : "status");

export type AlertPartProps = { children: ReactNode };
export const AlertIcon = ({ children }: AlertPartProps) => <Icon aria-hidden>{children}</Icon>;
export const AlertTitle = ({ children }: AlertPartProps) => <Text variant="label" ink="inherit" as="span">{children}</Text>;
export const AlertDescription = ({ children }: AlertPartProps) => <Text variant="caption" ink="inherit" as="span">{children}</Text>;

const DefaultAlertIcon = () => (
  <Icon aria-hidden>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8h.01M12 11v5" />
  </Icon>
);

const AlertRoot = ({ accent = "info", variant = "soft", children, className }: AlertProps) => {
  const parts = Children.toArray(children);
  const customIcon = parts.find((child) => isValidElement(child) && child.type === AlertIcon);
  const copy = parts.filter((child) => !(isValidElement(child) && child.type === AlertIcon));

  return (
    <Box radius="md" padding="md" role={ROLE(accent)} className={joinClass(resolveAccent(accent, variant), alertRoot, className)}>
      <Text as="span" variant="caption" className={srOnly}>{STATUS_WORD[accent]}: </Text>
      <Inline gap="sm" align="start">
        {customIcon ?? <DefaultAlertIcon />}
        <Stack gap="xs" style={{ minWidth: 0 }}>{copy}</Stack>
      </Inline>
    </Box>
  );
};

export const Alert = Object.assign(AlertRoot, {
  Icon: AlertIcon,
  Title: AlertTitle,
  Description: AlertDescription,
});
