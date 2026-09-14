// DropdownMenu — Trigger·Content·Item을 조합하는 떠 있는 menu.

import { cloneElement, createContext, useCallback, useContext, useEffect, useId, useState, type MouseEvent, type ReactElement, type ReactNode } from "react";

import { Menu, MenuItem } from "../molecules";
import { Box } from "../primitives";
import { joinClass } from "../internal/joinClass";
import { useControllableState } from "../internal/useControllableState";
import { dropdownAlign, dropdownPanel, dropdownRoot } from "./DropdownMenu.css";

type DropdownContextValue = { shown: boolean; setShown: (open: boolean) => void; align: "start" | "end"; value?: string; onValueChange?: (value: string) => void; label?: string };
const DropdownContext = createContext<DropdownContextValue | null>(null);
export type DropdownMenuProps = { align?: "start" | "end"; value?: string; defaultValue?: string; open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void; onValueChange?: (value: string) => void; "aria-label"?: string; children: ReactNode };
const DropdownMenuRoot = ({ align = "start", value: controlledValue, defaultValue = "", open, defaultOpen = false, onOpenChange, onValueChange, "aria-label": label, children }: DropdownMenuProps) => {
  const [internalOpen, setInternalOpen] = useState(defaultOpen); const id = useId(); const controlled = open !== undefined; const shown = controlled ? open : internalOpen;
  const [value, setValue] = useControllableState({ value: controlledValue, defaultValue, onValueChange });
  const setShown = useCallback((next: boolean) => { if (!controlled) setInternalOpen(next); onOpenChange?.(next); }, [controlled, onOpenChange]);
  useEffect(() => { if (!shown) return; const pointer = (event: PointerEvent) => { if (!document.getElementById(id)?.contains(event.target as Node)) setShown(false); }; const key = (event: KeyboardEvent) => { if (event.key === "Escape") { setShown(false); document.getElementById(id)?.querySelector<HTMLElement>('[aria-haspopup="menu"]')?.focus(); } }; document.addEventListener("pointerdown", pointer); document.addEventListener("keydown", key); return () => { document.removeEventListener("pointerdown", pointer); document.removeEventListener("keydown", key); }; }, [id, setShown, shown]);
  useEffect(() => { if (shown) document.getElementById(id)?.querySelector<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])')?.focus(); }, [id, shown]);
  return <DropdownContext.Provider value={{ shown, setShown, align, value, onValueChange: setValue, label }}><Box id={id} className={dropdownRoot}>{children}</Box></DropdownContext.Provider>;
};

type TriggerProps = { onClick?: (event: MouseEvent<HTMLElement>) => void; "aria-haspopup"?: "menu"; "aria-expanded"?: boolean };
export type DropdownMenuTriggerProps = { children: ReactElement<TriggerProps> };
export const DropdownMenuTrigger = ({ children }: DropdownMenuTriggerProps) => { const context = useContext(DropdownContext); if (!context) throw new Error("DropdownMenu.Trigger must be used inside DropdownMenu"); return cloneElement(children, { "aria-haspopup": "menu", "aria-expanded": context.shown, onClick: (event) => { children.props.onClick?.(event); if (!event.defaultPrevented) context.setShown(!context.shown); } }); };
export type DropdownMenuContentProps = { children: ReactNode };
export const DropdownMenuContent = ({ children }: DropdownMenuContentProps) => { const context = useContext(DropdownContext); if (!context || !context.shown) return null; return <Box radius="md" shadow="overlay" className={joinClass(dropdownPanel, dropdownAlign[context.align])}><Menu value={context.value} aria-label={context.label ?? "드롭다운 메뉴"} onValueChange={(value) => { context.onValueChange?.(value); context.setShown(false); }}>{children}</Menu></Box>; };

export const DropdownMenu = Object.assign(DropdownMenuRoot, { Trigger: DropdownMenuTrigger, Content: DropdownMenuContent, Item: MenuItem });
