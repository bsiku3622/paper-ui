// DayChip — a date of a week strip. The day the page stands on is the solid primary pill and says so with
// aria-current; the others are ghost. The package has no such mark, so this is the app's composition of Paint and Text.

import type { HTMLAttributes } from "react";

import { Paint, Text } from "@studio-baeks/paper-ui";

import { pill } from "./pill.css";

export type DayChipProps = {
  day: string;
  selected?: boolean;
} & Omit<HTMLAttributes<HTMLSpanElement>, "children" | "className" | "style">;

export const DayChip = ({ day, selected = false, ...rest }: DayChipProps) => (
  <Paint as="span" accent="primary" variant={selected ? "solid" : "ghost"} className={pill} aria-current={selected ? "date" : undefined} {...rest}>
    <Text as="span" variant="body" ink="inherit">{day}</Text>
  </Paint>
);
