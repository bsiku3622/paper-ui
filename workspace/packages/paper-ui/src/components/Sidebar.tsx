import { createContext, forwardRef, useCallback, useContext, useEffect, useId, useLayoutEffect, useMemo, useRef, type ElementType, type HTMLAttributes, type MouseEvent, type ReactElement, type ReactNode } from "react";

import { Divider } from "../atoms/Divider";
import { paperError } from "../internal/errors";
import { Button } from "../atoms/Button";
import { useScopeFocus } from "../internal/aria/focus";
import { usePageScrollLock } from "../internal/aria/overlay";
import { joinClass } from "../internal/joinClass";
import { useMergedRef } from "../internal/refs";
import { useControllableState } from "../internal/useControllableState";
import { useMediaQuery } from "../internal/useMediaQuery";
import { FocusScope } from "../primitives/a11y/focus";
import type { ControlForm } from "../primitives/control/Control";
import { controlSize } from "../primitives/control/Control.css";
import { scrimPaint, sidebarPaint } from "../primitives/paint/recipes.css";
import type { PolymorphicProps } from "../primitives/polymorphic";
import { usePressable } from "../primitives/press/usePressable";
import { Icon } from "../primitives/Icon";
import { Text } from "../primitives/Text";
import { tokens, type Accent, type Breakpoint, type Dimension, type Variant } from "../tokens";
import { sidebarBadge, sidebarDivider, sidebarDrawer, sidebarClosed, sidebarFooter, sidebarGroup, sidebarGroupChevron, sidebarGroupToggle, sidebarGroupTitle, sidebarItem, sidebarOffsetProperty, sidebarRail, sidebarScrim, sidebarWidth } from "./Sidebar.css";

export type SidebarProps = Omit<HTMLAttributes<HTMLElement>, "className" | "children" | "aria-label"> & {
  label: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  collapseBelow?: Breakpoint | "never" | "always";
  offset?: string;
  width?: Dimension;
  children?: ReactNode;
  className?: string;
};

type SidebarItemOwn = Pick<ControlForm, "shape"> & {
  current?: boolean;
  icon?: ReactNode;
  badge?: ReactNode;
  accent?: Accent;
  variant?: Variant;
  disabled?: boolean;
  children?: ReactNode;
  className?: string;
};

export type SidebarItemProps<As extends ElementType = "button"> = PolymorphicProps<SidebarItemOwn, As>;

type SidebarGroupBase = Omit<HTMLAttributes<HTMLDivElement>, "className" | "children" | "title"> & {
  children?: ReactNode;
  className?: string;
};

export type SidebarGroupProps =
  | (SidebarGroupBase & { title?: ReactNode; collapsible?: false; open?: never; defaultOpen?: never; onOpenChange?: never })
  | (SidebarGroupBase & { title: ReactNode; collapsible: true; open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void });

export type SidebarDividerProps = Omit<HTMLAttributes<HTMLHRElement>, "className" | "children"> & { className?: string };

export type SidebarFooterProps = Omit<HTMLAttributes<HTMLDivElement>, "className" | "children"> & {
  children?: ReactNode;
  className?: string;
};

const SidebarContext = createContext<{ dismiss: () => void }>({ dismiss: () => {} });

const useIsomorphicLayoutEffect = typeof document === "undefined" ? useEffect : useLayoutEffect;

function DrawerFocus({ active }: { active: boolean }) {
  const scope = useScopeFocus();
  const focusFirst = useRef(scope?.focusFirst);
  focusFirst.current = scope?.focusFirst;
  useEffect(() => {
    if (!active) return;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    focusFirst.current?.({ tabbable: true });
    return () => { if (opener?.isConnected) opener.focus(); };
  }, [active]);
  return null;
}

function Scrim({ offset, onDismiss }: { offset?: string; onDismiss: () => void }) {
  const { pressProps } = usePressable({ onPress: onDismiss, preventFocusOnPress: true });
  return <div {...pressProps} aria-hidden className={joinClass(sidebarScrim, scrimPaint)} style={offset === undefined ? undefined : { [sidebarOffsetProperty]: offset }} />;
}

const SidebarRoot = forwardRef<HTMLElement, SidebarProps>(function Sidebar(
  { label, open, defaultOpen = false, onOpenChange, collapseBelow = "md", offset, width = "lg", children, className, style, ...rest },
  forwardedRef,
) {
  const [isOpen, setOpen] = useControllableState<boolean>({ value: open, defaultValue: defaultOpen, onChange: onOpenChange });
  const below = useMediaQuery(collapseBelow === "never" || collapseBelow === "always" ? null : `not all and (min-width: ${tokens.layout.breakpoint[collapseBelow]})`);
  const drawer = collapseBelow === "always" || below;
  const active = drawer && isOpen;
  const nav = useRef<HTMLElement>(null);
  const ref = useMergedRef(forwardedRef, nav);
  usePageScrollLock(active);

  useIsomorphicLayoutEffect(() => {
    const element = nav.current;
    if (element === null) return;
    if (drawer && !isOpen) element.setAttribute("inert", "");
    else element.removeAttribute("inert");
  }, [drawer, isOpen]);

  const dismiss = useCallback(() => { if (drawer) setOpen(false); }, [drawer, setOpen]);
  const context = useMemo(() => ({ dismiss }), [dismiss]);
  useEffect(() => {
    if (!active) return;
    const close = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape" && !event.defaultPrevented) setOpen(false);
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [active, setOpen]);

  return (
    <>
      <FocusScope contain={active}>
        <nav
          ref={ref}
          aria-label={label}
          className={joinClass(sidebarRail, sidebarWidth[width], sidebarPaint, collapseBelow !== "never" && sidebarDrawer[collapseBelow], collapseBelow !== "never" && !isOpen && sidebarClosed[collapseBelow], className)}
          style={offset === undefined ? style : { [sidebarOffsetProperty]: offset, ...style }}
          {...rest}
        >
          <DrawerFocus active={active} />
          <SidebarContext.Provider value={context}>{children}</SidebarContext.Provider>
        </nav>
      </FocusScope>
      {active ? <Scrim offset={offset} onDismiss={dismiss} /> : null}
    </>
  );
});

const ItemButton = Button as unknown as ElementType;

const SidebarItemImpl = forwardRef<HTMLElement, Omit<SidebarItemProps, "as" | "ref"> & { as?: ElementType }>(function SidebarItem(
  { current = false, icon, badge, variant, shape = "rounded", children, className, onClick, ...rest },
  ref,
) {
  const { dismiss } = useContext(SidebarContext);
  return (
    <ItemButton
      ref={ref}
      size="md"
      shape={shape}
      fullWidth
      justify="start"
      gap="sm"
      variant={variant ?? (current ? "muted" : "ghost")}
      aria-current={current ? "page" : undefined}
      className={joinClass(sidebarItem, className)}
      onClick={(event: MouseEvent<HTMLElement>) => { (onClick as ((event: MouseEvent<HTMLElement>) => void) | undefined)?.(event); dismiss(); }}
      {...rest}
    >
      {icon}
      <Text as="span" ink="inherit" strong={current} truncate>{children}</Text>
      {badge != null ? <span className={sidebarBadge}>{badge}</span> : null}
    </ItemButton>
  );
});

const SidebarItem = SidebarItemImpl as unknown as {
  <As extends ElementType = "button">(props: SidebarItemProps<As>): ReactElement;
};

const SidebarGroup = forwardRef<HTMLDivElement, SidebarGroupProps>(function SidebarGroup(props, ref) {
  const { title, collapsible = false, open, defaultOpen = true, onOpenChange, children, className, ...rest } = props;
  const titleId = useId();
  const listId = useId();
  const [expanded, setExpanded] = useControllableState<boolean>({ value: open, defaultValue: defaultOpen, onChange: onOpenChange });
  if (collapsible && title == null && process.env.NODE_ENV !== "production") {
    console.error(paperError("A collapsible Sidebar.Group needs a title: the title is the button that folds it.").message);
  }
  if (!collapsible || title == null) {
    return (
      <div ref={ref} role={title == null ? undefined : "group"} aria-labelledby={title == null ? undefined : titleId} className={joinClass(sidebarGroup, className)} {...rest}>
        {title == null ? null : <Text id={titleId} as="span" variant="label" ink="tertiary" className={joinClass(controlSize.md, sidebarGroupTitle)}>{title}</Text>}
        {children}
      </div>
    );
  }
  return (
    <div ref={ref} role="group" aria-labelledby={titleId} className={joinClass(sidebarGroup, className)} {...rest}>
      <Button size="md" shape="rounded" variant="ghost" fullWidth justify="between" className={sidebarGroupToggle} aria-expanded={expanded} aria-controls={listId} onClick={() => setExpanded(!expanded)}>
        <Text id={titleId} as="span" variant="label" ink="tertiary" truncate>{title}</Text>
        <Icon className={sidebarGroupChevron}><path d="m6 9 6 6 6-6" /></Icon>
      </Button>
      <div id={listId} hidden={!expanded} className={sidebarGroup}>{children}</div>
    </div>
  );
});

const SidebarDivider = forwardRef<HTMLHRElement, SidebarDividerProps>(function SidebarDivider({ className, ...rest }, ref) {
  return <Divider ref={ref} className={joinClass(sidebarDivider, className)} {...rest} />;
});

const SidebarFooter = forwardRef<HTMLDivElement, SidebarFooterProps>(function SidebarFooter({ children, className, ...rest }, ref) {
  return (
    <div ref={ref} className={joinClass(sidebarFooter, className)} {...rest}>
      <SidebarDivider />
      {children}
    </div>
  );
});

export const Sidebar = Object.assign(SidebarRoot, { Item: SidebarItem, Group: SidebarGroup, Divider: SidebarDivider, Footer: SidebarFooter });
