// Dot — a small filled mark: a status point or a navigation marker. The package has no dot, so this is
// the app's composition of Surface; the colour is a status (its solid) or an ink level (the mark takes its ink).

import type { HTMLAttributes } from "react";

import { Surface } from "@studio-baeks/paper-ui";
import type { InkLevel, Status } from "@studio-baeks/paper-ui/tokens";

import * as s from "./dot.css";

type DotColor = { status: Status; ink?: never } | { ink: InkLevel; status?: never };

export type DotProps = DotColor & {
  size?: keyof typeof s.size;
} & Omit<HTMLAttributes<HTMLDivElement>, "children" | "className" | "style">;

export const Dot = ({ status, ink, size = "sm", ...rest }: DotProps) => (
  <Surface radius="full" className={`${s.size[size]} ${status ? s.status[status] : ink ? s.ink[ink] : ""}`} {...rest} />
);
