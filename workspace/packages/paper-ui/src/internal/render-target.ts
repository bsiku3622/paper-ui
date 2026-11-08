import type { ElementType, KeyboardEvent, MouseEvent } from "react";

import { stateAttributes, type StateAttributes } from "../tokens";
import { paperError } from "./errors";

export type TargetKind = "control" | "region";

export type TargetOptions = {
  disabled?: boolean;
  focusable?: boolean;
  type?: string;
  href?: unknown;
  activateOnKey?: boolean;
  kind: TargetKind;
};

export type TargetProps = {
  type?: string;
  disabled?: boolean;
  role?: "button";
  tabIndex?: number;
  "aria-disabled"?: true;
  onClickCapture?: (event: MouseEvent<HTMLElement>) => void;
  onAuxClickCapture?: (event: MouseEvent<HTMLElement>) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLElement>) => void;
} & StateAttributes<"disabled">;

const NATIVE = new Set(["button", "input", "select", "textarea", "fieldset", "optgroup", "option"]);

const PARTS = new WeakSet<object>();
export const registerPart = <Component extends ElementType>(component: Component): Component => {
  if (typeof component !== "string") PARTS.add(component as object);
  return component;
};

const ATOMS = new WeakSet<object>();
const told = new WeakSet<object>();
export const registerAtom = <Component extends ElementType>(component: Component): Component => {
  if (typeof component !== "string") ATOMS.add(component as object);
  return registerPart(component);
};
const refuseAtom = (Tag: ElementType) => {
  if (process.env.NODE_ENV === "production" || typeof Tag === "string" || !ATOMS.has(Tag as object) || told.has(Tag as object)) return;
  told.add(Tag as object);
  console.error(paperError("An Atom is not a target for a behaviour. Give the Atom the part instead: <Button as={Floating.Trigger}>, not <Floating.Trigger as={Button}>.").message);
};

// An element that cannot be disabled natively still must not act: the click stops before the target or its ancestors hear it.
const block = (event: MouseEvent<HTMLElement>) => {
  event.preventDefault();
  event.stopPropagation();
};
const blocked = { "aria-disabled": true, onClickCapture: block, onAuxClickCapture: block } as const;

const activate = (event: KeyboardEvent<HTMLElement>) => {
  if (event.target !== event.currentTarget || (event.key !== "Enter" && event.key !== " ")) return;
  event.preventDefault();
  if (!event.repeat) event.currentTarget.click();
};

export function targetProps(Tag: ElementType, { disabled = false, focusable = false, type, href, activateOnKey = false, kind }: TargetOptions): TargetProps {
  if (kind === "control") refuseAtom(Tag);
  const state = disabled ? stateAttributes({ disabled }) : undefined;
  if (typeof Tag === "string") {
    const native = NATIVE.has(Tag);
    if (kind === "region" || (native && Tag !== "button")) return { ...(native && disabled ? { disabled: true } : null), ...state };
    if (Tag === "button") return { type: type ?? "button", ...(disabled ? (focusable ? blocked : { disabled: true }) : null), ...state };
    return {
      ...(Tag === "a" && href !== undefined ? null : { role: "button" as const, ...(activateOnKey && !disabled ? { onKeyDown: activate } : null) }),
      tabIndex: disabled && !focusable ? -1 : 0,
      ...(disabled ? blocked : null),
      ...state,
    };
  }
  const part = PARTS.has(Tag as object);
  if (kind === "region") return { ...(disabled ? { disabled: true } : null), ...state };
  if (part) return { ...(type !== undefined ? { type } : null), ...(disabled ? (focusable ? blocked : { disabled: true }) : null), ...state };
  return { ...(type !== undefined ? { type } : null), ...(disabled ? { ...blocked, tabIndex: focusable ? 0 : -1 } : null), ...state };
}
