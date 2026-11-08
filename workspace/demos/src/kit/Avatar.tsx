import type { ReactNode } from "react";

import { controlClass, Inline, Paint, Stack, Text } from "@studio-baeks/paper-ui";
import type { Accent, ControlSize } from "@studio-baeks/paper-ui/tokens";

const TONES: readonly Accent[] = ["info", "success", "warning", "error", "primary"];

export const toneOf = (name: string): Accent => {
  let sum = 0;
  for (const char of name) sum = (sum * 31 + char.codePointAt(0)!) >>> 0;
  return TONES[sum % TONES.length]!;
};

export type AvatarProps = {
  name: string;
  size?: ControlSize;
  tone?: Accent;
  picture?: ReactNode;
  square?: boolean;
};

export const Avatar = ({ name, size = "sm", tone, picture, square = false }: AvatarProps) => (
  <Paint
    as="span"
    role="img"
    aria-label={name}
    accent={tone ?? toneOf(name)}
    variant="soft"
    overflow="hidden"
    className={controlClass({ size, anatomy: "icon", shape: square ? "rounded" : "pill", fontSize: size === "lg" ? "body" : "label", strong: true })}
  >
    {picture ?? Array.from(name.trim())[0] ?? "?"}
  </Paint>
);

export const Person = ({ name, sub, size = "sm", tone, picture }: { name: string; sub?: ReactNode; size?: ControlSize; tone?: Accent; picture?: ReactNode }) => (
  <Inline gap="sm" align="center" minWidth={0}>
    <Avatar name={name} size={size} tone={tone} picture={picture} />
    <Stack minWidth={0}>
      <Text as="span" truncate>{name}</Text>
      {sub ? <Text as="span" variant="caption" ink="tertiary" truncate>{sub}</Text> : null}
    </Stack>
  </Inline>
);
