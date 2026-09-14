// DropdownMenu — trigger에 Menu를 붙이는 떠 있는 navigation/action surface.

import { cloneElement, useEffect, useId, useState, type MouseEvent, type ReactElement } from "react";

import { Menu, type MenuItem } from "../molecules";
import { Box } from "../primitives";
import { joinClass } from "../internal/joinClass";
import { dropdownAlign, dropdownPanel, dropdownRoot } from "./DropdownMenu.css";

type TriggerProps = {
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  "aria-haspopup"?: "menu";
  "aria-expanded"?: boolean;
};

export type DropdownMenuProps = {
  trigger: ReactElement<TriggerProps>;
  items: readonly MenuItem[];
  active?: string;
  align?: "start" | "end";
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSelect?: (value: string) => void;
  "aria-label"?: string;
};

export const DropdownMenu = ({ trigger, items, active, align = "start", open, defaultOpen = false, onOpenChange, onSelect, "aria-label": ariaLabel }: DropdownMenuProps) => {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const rootId = useId();
  const controlled = open !== undefined;
  const shown = controlled ? open : internalOpen;
  const setShown = (next: boolean) => {
    if (!controlled) setInternalOpen(next);
    onOpenChange?.(next);
  };

  useEffect(() => {
    if (!shown) return;
    const onPointer = (event: PointerEvent) => {
      if (!document.getElementById(rootId)?.contains(event.target as Node)) setShown(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setShown(false);
      document.getElementById(rootId)?.querySelector<HTMLElement>('[aria-haspopup="menu"]')?.focus();
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  });

  useEffect(() => {
    if (!shown) return;
    document.getElementById(rootId)?.querySelector<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])')?.focus();
  }, [shown, rootId]);

  return (
    <Box id={rootId} className={dropdownRoot}>
      {cloneElement(trigger, {
        "aria-haspopup": "menu",
        "aria-expanded": shown,
        onClick: (event: MouseEvent<HTMLElement>) => {
          trigger.props.onClick?.(event);
          if (!event.defaultPrevented) setShown(!shown);
        },
      })}
      {shown ? (
        <Box radius="md" shadow="overlay" className={joinClass(dropdownPanel, dropdownAlign[align])}>
          <Menu
            items={items}
            active={active}
            aria-label={ariaLabel ?? "드롭다운 메뉴"}
            onSelect={(value) => { onSelect?.(value); setShown(false); }}
          />
        </Box>
      ) : null}
    </Box>
  );
};
