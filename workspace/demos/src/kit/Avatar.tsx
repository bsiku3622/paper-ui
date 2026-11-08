// Avatar — a person or a thing as a round mark: the first letter on a soft colour, or a picture (Art) when there is one.
// Paper has no Avatar; this is a Paint face on the Control's square, so its size is a control size.

import type { ReactNode } from "react";

import { controlClass, Inline, Paint, Stack, Text } from "@studio-baeks/paper-ui";
import type { Accent, ControlSize } from "@studio-baeks/paper-ui/tokens";

const TONES: readonly Accent[] = ["info", "success", "warning", "error", "primary"];

// The same name always takes the same colour.
export const toneOf = (name: string): Accent => {
  let sum = 0;
  for (const char of name) sum = (sum * 31 + char.codePointAt(0)!) >>> 0;
  return TONES[sum % TONES.length]!;
};

export type AvatarProps = {
  name: string;
  size?: ControlSize;
  tone?: Accent;
  // Drawn instead of the letter, clipped to the circle (an <Art>).
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

// A row of people: an avatar, a name and a line under it.
export const Person = ({ name, sub, size = "sm", tone, picture }: { name: string; sub?: ReactNode; size?: ControlSize; tone?: Accent; picture?: ReactNode }) => (
  <Inline gap="sm" align="center" minWidth={0}>
    <Avatar name={name} size={size} tone={tone} picture={picture} />
    <Stack minWidth={0}>
      <Text as="span" truncate>{name}</Text>
      {sub ? <Text as="span" variant="caption" ink="tertiary" truncate>{sub}</Text> : null}
    </Stack>
  </Inline>
);
