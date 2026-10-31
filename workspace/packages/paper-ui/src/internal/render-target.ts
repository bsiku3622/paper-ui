// The one projection of `disabled` onto the element a primitive renders. A primitive takes `as` to name that
// element, and what disabled means depends on what it is: a native button disables, a div has to say so with aria,
// a Paper part takes the prop and does it itself, a foreign component is told in the one way every component can be.
// Every primitive that takes `as` and `disabled` asks here instead of deciding for itself.
//
// Two kinds of target. A control takes input: it is a button, or stands in for one. A region only sits there
// (VisuallyHidden, a Box-based part), so it is disabled where the element supports it and left alone elsewhere.
// The result goes into mergeProps ahead of the caller's own props, so an explicit role or tabIndex still wins.

import type { ElementType, KeyboardEvent, MouseEvent } from "react";

import { stateAttributes, type StateAttributes } from "../tokens";

export type TargetKind = "control" | "region";

export type TargetOptions = {
  disabled?: boolean;
  /** A disabled control that keeps its place in the Tab order and says so with aria-disabled (a button that is loading). */
  focusable?: boolean;
  /** Set by the caller; a button defaults to "button", and a part or a component is given one only when asked. */
  type?: string;
  /** Whether an `a` is a link: a link keeps its own role. */
  href?: unknown;
  /** Set by a part with no press of its own: a tag that stands in for a button takes Enter and Space from here. */
  activateOnKey?: boolean;
  kind: TargetKind;
};

export type TargetProps = {
  type?: string;
  disabled?: boolean;
  focusable?: boolean;
  role?: "button";
  tabIndex?: number;
  "aria-disabled"?: true;
  onClickCapture?: (event: MouseEvent<HTMLElement>) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLElement>) => void;
} & StateAttributes<"disabled">;

// The tags the platform can disable by themselves.
const NATIVE = new Set(["button", "input", "select", "textarea", "fieldset", "optgroup", "option"]);

// The Paper components that take `disabled` and carry it to their element. A part registers itself where it is
// made; an Atom that is pressable registers the same way. Nothing else is known to understand the prop.
const PARTS = new WeakSet<object>();
export const registerPart = <Component extends ElementType>(component: Component): Component => {
  if (typeof component !== "string") PARTS.add(component as object);
  return component;
};

// An element that cannot be disabled natively still must not act: the click stops before anything of the
// target's own, or of its ancestors, hears it. A link with this does not navigate.
const block = (event: MouseEvent<HTMLElement>) => {
  event.preventDefault();
  event.stopPropagation();
};
const blocked = { "aria-disabled": true, onClickCapture: block } as const;

// What a button does with its keys, for a tag that has to be told. A key meant for something inside the target stays
// there, and a held key clicks once.
const activate = (event: KeyboardEvent<HTMLElement>) => {
  if (event.target !== event.currentTarget || (event.key !== "Enter" && event.key !== " ")) return;
  event.preventDefault();
  if (!event.repeat) event.currentTarget.click();
};

export function targetProps(Tag: ElementType, { disabled = false, focusable = false, type, href, activateOnKey = false, kind }: TargetOptions): TargetProps {
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
  if (part) return { ...(type !== undefined ? { type } : null), ...(disabled ? { disabled: true, ...(focusable ? { focusable: true } : null) } : null), ...state };
  return { ...(type !== undefined ? { type } : null), ...(disabled ? { ...blocked, tabIndex: focusable ? 0 : -1 } : null), ...state };
}
