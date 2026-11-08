// Content: text in the serif the original uses for its name, its titles and the sheet. See serif.css.ts.

import type { ReactNode } from "react";

import { Text } from "@studio-baeks/paper-ui";
import type { Ink, TextVariant } from "@studio-baeks/paper-ui/tokens";

import { clamp, serif, wordmark } from "./serif.css";

export type SerifProps = {
  as?: "h1" | "h2" | "h3" | "p" | "span" | "div";
  variant?: TextVariant;
  strong?: boolean;
  ink?: Ink;
  // Cut after three lines.
  lines?: boolean;
  children: ReactNode;
};

export const Serif = ({ as = "span", variant = "body", strong, ink, lines = false, children }: SerifProps) => (
  <Text as={as} variant={variant} strong={strong} ink={ink} className={lines ? `${serif} ${clamp}` : serif}>
    {children}
  </Text>
);

// The name of the app, as the header sets it. On a phone the original sets it a size smaller.
export const Wordmark = ({ small = false }: { small?: boolean }) => (
  <Text as="span" variant={small ? "heading" : "title"} className={wordmark}>
    Paperdown
  </Text>
);
