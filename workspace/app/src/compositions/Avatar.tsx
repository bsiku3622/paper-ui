// Avatar — a person or a workspace as one initial: a neutral soft pill, or a square for a workspace. The package has no
// avatar, so this is the app's composition of Paint and Text.

import type { HTMLAttributes } from "react";

import { Paint, Text } from "@studio-baeks/paper-ui";

import { joinClass } from "../joinClass";
import { pill, square } from "./pill.css";

export type AvatarProps = {
  initial: string;
  shape?: "circle" | "square";
} & Omit<HTMLAttributes<HTMLSpanElement>, "children" | "className" | "style">;

export const Avatar = ({ initial, shape = "circle", ...rest }: AvatarProps) => (
  <Paint as="span" accent="primary" variant="soft" className={joinClass(pill, shape === "square" && square)} {...rest}>
    <Text as="span" variant="body" ink="inherit">{initial}</Text>
  </Paint>
);
