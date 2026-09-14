// CommandMenu — Search·Group·Item을 JSX로 조합하는 빠른 이동 surface.

import { Children, createContext, isValidElement, useContext, useId, useState, type ReactNode } from "react";

import { Divider } from "../atoms";
import { SearchField } from "../molecules";
import { Box, Stack, Text, type BoxProps } from "../primitives";
import { joinClass } from "../internal/joinClass";
import { commandCopy, commandEmpty, commandGroup, commandGroupLabel, commandIcon, commandItem, commandList, commandRoot, commandSearch, commandShortcut } from "./CommandMenu.css";

type CommandContextValue = { query: string; active?: string; setActive: (value: string) => void; choose: (value: string) => void };
const CommandContext = createContext<CommandContextValue | null>(null);
const matches = (label: ReactNode, keywords: readonly string[] | undefined, query: string) => !query.trim() || [typeof label === "string" ? label : "", ...(keywords ?? [])].join(" ").toLocaleLowerCase().includes(query.trim().toLocaleLowerCase());

export type CommandMenuProps = Omit<BoxProps<"div">, "children" | "onSelect"> & { query?: string; defaultQuery?: string; onQueryChange?: (query: string) => void; onSelect?: (value: string) => void; placeholder?: string; empty?: ReactNode; children: ReactNode };
const CommandMenuRoot = ({ query, defaultQuery = "", onQueryChange, onSelect, placeholder = "명령 또는 페이지 검색", empty = "결과가 없습니다", className, children, ...rest }: CommandMenuProps) => {
  const [internalQuery, setInternalQuery] = useState(defaultQuery); const [active, setActive] = useState<string>(); const id = useId(); const controlled = query !== undefined; const text = controlled ? query : internalQuery;
  const options = () => Array.from(document.getElementById(id)?.querySelectorAll<HTMLElement>('[role="option"]:not([aria-disabled="true"])') ?? []);
  const move = (direction: 1 | -1 | "first" | "last") => { const rows = options(); if (!rows.length) return; const index = rows.findIndex((row) => row.dataset.commandValue === active); const next = direction === "first" ? 0 : direction === "last" ? rows.length - 1 : index < 0 ? 0 : (index + direction + rows.length) % rows.length; setActive(rows[next]?.dataset.commandValue); };
  return <CommandContext.Provider value={{ query: text, active, setActive, choose: (value) => onSelect?.(value) }}><Box id={id} surface="raised" border radius="md" className={joinClass(commandRoot, className)} {...rest}>
    <Box className={commandSearch}><SearchField value={text} placeholder={placeholder} aria-label={placeholder} onChange={(event) => { if (!controlled) setInternalQuery(event.currentTarget.value); setActive(undefined); onQueryChange?.(event.currentTarget.value); }} onKeyDown={(event) => { if (event.key === "ArrowDown") { event.preventDefault(); move(1); } if (event.key === "ArrowUp") { event.preventDefault(); move(-1); } if (event.key === "Home") { event.preventDefault(); move("first"); } if (event.key === "End") { event.preventDefault(); move("last"); } if (event.key === "Enter") { event.preventDefault(); const row = options().find((item) => item.dataset.commandValue === active) ?? options()[0]; row?.click(); } }} /></Box>
    <Divider /><Box role="listbox" aria-label="명령" className={commandList}>{children}<Text variant="caption" ink="soft" className={commandEmpty}>{empty}</Text></Box>
  </Box></CommandContext.Provider>;
};

export type CommandMenuGroupProps = { label?: ReactNode; children: ReactNode };
export const CommandMenuGroup = ({ label, children }: CommandMenuGroupProps) => { const context = useContext(CommandContext); if (!context) throw new Error("CommandMenu.Group must be used inside CommandMenu"); const visible = Children.toArray(children).filter((child) => isValidElement<CommandMenuItemProps>(child) && matches(child.props.children, child.props.keywords, context.query)); if (!visible.length) return null; return <Box className={commandGroup}>{label ? <Text as="span" variant="label" ink="soft" className={commandGroupLabel}>{label}</Text> : null}{visible}</Box>; };
export type CommandMenuItemProps = { value: string; description?: ReactNode; keywords?: readonly string[]; icon?: ReactNode; shortcut?: ReactNode; disabled?: boolean; children: ReactNode };
export const CommandMenuItem = ({ value, description, keywords, icon, shortcut, disabled, children }: CommandMenuItemProps) => { const context = useContext(CommandContext); if (!context || !matches(children, keywords, context.query)) return null; return <Box as="button" type="button" role="option" data-command-value={value} aria-selected={context.active === value} aria-disabled={disabled || undefined} className={commandItem} onMouseEnter={() => { if (!disabled) context.setActive(value); }} onClick={() => { if (!disabled) context.choose(value); }}>
  {icon ? <Box as="span" className={commandIcon}>{icon}</Box> : null}<Stack gap="xs" className={commandCopy}><Text as="span" variant="body">{children}</Text>{description ? <Text as="span" variant="caption" ink="soft">{description}</Text> : null}</Stack>{shortcut ? <Text as="span" variant="label" className={commandShortcut}>{shortcut}</Text> : null}
  </Box>; };
export type CommandMenuEmptyProps = { children: ReactNode };
export const CommandMenuEmpty = ({ children }: CommandMenuEmptyProps) => <Text variant="caption" ink="soft" className={commandEmpty}>{children}</Text>;
export const CommandMenu = Object.assign(CommandMenuRoot, { Group: CommandMenuGroup, Item: CommandMenuItem, Empty: CommandMenuEmpty });
