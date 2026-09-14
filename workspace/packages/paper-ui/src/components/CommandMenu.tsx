// CommandMenu — 검색과 키보드 선택을 한 listbox로 묶는 빠른 이동 surface.

import { useEffect, useMemo, useState, type ReactNode } from "react";

import { Divider } from "../atoms";
import { SearchField } from "../molecules";
import { Box, Stack, Text, type BoxProps } from "../primitives";
import { joinClass } from "../internal/joinClass";
import { commandCopy, commandEmpty, commandGroup, commandGroupAfter, commandGroupLabel, commandIcon, commandItem, commandList, commandRoot, commandSearch, commandShortcut } from "./CommandMenu.css";

export type CommandItem = {
  value: string;
  label: ReactNode;
  description?: ReactNode;
  keywords?: readonly string[];
  group?: string;
  icon?: ReactNode;
  shortcut?: ReactNode;
  disabled?: boolean;
};
export type CommandMenuProps = Omit<BoxProps<"div">, "children" | "onSelect"> & {
  commands: readonly CommandItem[];
  query?: string;
  defaultQuery?: string;
  onQueryChange?: (query: string) => void;
  onSelect?: (value: string) => void;
  placeholder?: string;
  empty?: ReactNode;
};

export const CommandMenu = ({ commands, query, defaultQuery = "", onQueryChange, onSelect, placeholder = "명령 또는 페이지 검색", empty = "결과가 없습니다", className, ...rest }: CommandMenuProps) => {
  const [internalQuery, setInternalQuery] = useState(defaultQuery);
  const [activeIndex, setActiveIndex] = useState(0);
  const controlled = query !== undefined;
  const text = controlled ? query : internalQuery;
  const filtered = useMemo(() => {
    const needle = text.trim().toLocaleLowerCase();
    if (!needle) return commands;
    return commands.filter((command) =>
      [typeof command.label === "string" ? command.label : "", ...(command.keywords ?? [])]
        .join(" ")
        .toLocaleLowerCase()
        .includes(needle),
    );
  }, [commands, text]);
  const enabled = filtered.filter((command) => !command.disabled);

  useEffect(() => setActiveIndex(0), [text]);

  const choose = (command: CommandItem | undefined) => {
    if (command && !command.disabled) onSelect?.(command.value);
  };
  const groups = Array.from(new Set(filtered.map((command) => command.group ?? "")));

  return (
    <Box surface="raised" border radius="md" className={joinClass(commandRoot, className)} {...rest}>
      <Box className={commandSearch}>
        <SearchField
          value={text}
          placeholder={placeholder}
          aria-label={placeholder}
          onChange={(event) => {
            if (!controlled) setInternalQuery(event.currentTarget.value);
            onQueryChange?.(event.currentTarget.value);
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") { event.preventDefault(); setActiveIndex((index) => enabled.length ? (index + 1) % enabled.length : 0); }
            if (event.key === "ArrowUp") { event.preventDefault(); setActiveIndex((index) => enabled.length ? (index - 1 + enabled.length) % enabled.length : 0); }
            if (event.key === "Enter") { event.preventDefault(); choose(enabled[activeIndex]); }
          }}
        />
      </Box>
      <Divider />
      <Box role="listbox" aria-label="명령" className={commandList}>
        {filtered.length === 0 ? <Text variant="caption" ink="soft" className={commandEmpty}>{empty}</Text> : groups.map((group, groupIndex) => (
          <Box key={group || "commands"} className={joinClass(commandGroup, groupIndex > 0 && commandGroupAfter)}>
            {group ? <Text as="span" variant="label" ink="soft" className={commandGroupLabel}>{group}</Text> : null}
            {filtered.filter((command) => (command.group ?? "") === group).map((command) => {
              const enabledIndex = enabled.indexOf(command);
              return (
                <Box
                  as="button"
                  type="button"
                  role="option"
                  key={command.value}
                  aria-selected={!command.disabled && enabledIndex === activeIndex}
                  aria-disabled={command.disabled || undefined}
                  className={commandItem}
                  onMouseEnter={() => { if (!command.disabled) setActiveIndex(enabledIndex); }}
                  onClick={() => choose(command)}
                >
                  {command.icon ? <Box as="span" className={commandIcon}>{command.icon}</Box> : null}
                  <Stack gap="xs" className={commandCopy}>
                    <Text as="span" variant="body">{command.label}</Text>
                    {command.description ? <Text as="span" variant="caption" ink="soft">{command.description}</Text> : null}
                  </Stack>
                  {command.shortcut ? <Text as="span" variant="label" className={commandShortcut}>{command.shortcut}</Text> : null}
                </Box>
              );
            })}
          </Box>
        ))}
      </Box>
    </Box>
  );
};
