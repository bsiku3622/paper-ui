import { useMemo, useState } from "react";

import { Box, Button, Divider, Field, Grid, IconButton, Inline, Stack, Text } from "@studio-baeks/paper-ui";

import { Glyph, Empty } from "../../../kit";
import { COMMANDS } from "../catalog";
import { MonoField } from "../content/Mono";
import { clockText } from "../format";
import type { LogEntry, LogKind } from "../model";
import { useActions } from "../sim/Provider";
import { useSettings, type Settings } from "../settings";
import { Dialog } from "../ui/Dialog";

const TEMPERATURE = /^(?:ok\s+)?(?:B|C|T\d*):/;

export const visibleEntries = (log: readonly LogEntry[], setting: Settings["console"], query = "", kinds: readonly LogKind[] | null = null): LogEntry[] => {
  const custom = setting.filters.filter((filter) => filter.enabled).flatMap((filter) => {
    try {
      return [new RegExp(filter.pattern, "i")];
    } catch {
      return [];
    }
  });
  const needle = query.trim().toLowerCase();
  const list = log.filter((entry) => {
    if (setting.hideTemperature && entry.auto && TEMPERATURE.test(entry.text)) return false;
    if (setting.hideOk && /^ok$/i.test(entry.text.trim())) return false;
    if (custom.some((pattern) => pattern.test(entry.text))) return false;
    if (kinds && !kinds.includes(entry.kind)) return false;
    if (needle && !entry.text.toLowerCase().includes(needle)) return false;
    return true;
  });
  return setting.newestFirst ? list.reverse() : list;
};

const INK = { command: "info", response: "primary", info: "secondary", error: "error" } as const;

export const LogList = ({ entries, limit, onMore }: { entries: readonly LogEntry[]; limit: number; onMore?: () => void }) => {
  const { settings, stamp } = useSettings();
  if (entries.length === 0) return <Empty glyph="terminal" title="보여 줄 줄이 없습니다" description="필터에 걸렸거나 아직 아무것도 보내지 않았습니다." />;
  const shown = entries.slice(0, limit);
  return (
    <Stack>
      <Stack as="ul" aria-label="콘솔 기록">
        {shown.map((entry, index) => (
          <Stack as="li" key={entry.id}>
            {index > 0 ? <Divider aria-hidden /> : null}
            <Grid columns={settings.console.timestamps ? "5.75rem minmax(0, 1fr)" : "minmax(0, 1fr)"} gap="md" align="baseline" paddingX="lg" paddingY="xs">
              {settings.console.timestamps ? <Text as="span" variant="caption" family="mono" ink="tertiary" numeric>{clockText(entry.time, stamp.hour12)}</Text> : null}
              <Stack minWidth={0}>
                {entry.text.split("\n").map((line, at) => (
                  <Text key={at} as="span" family="mono" ink={INK[entry.kind]}>{line}</Text>
                ))}
              </Stack>
            </Grid>
          </Stack>
        ))}
      </Stack>
      {entries.length > limit && onMore ? (
        <Inline justify="center" paddingY="sm">
          <Button variant="ghost" size="sm" onClick={onMore}>이전 줄 더 보기 ({entries.length - limit}줄 남음)</Button>
        </Inline>
      ) : null}
    </Stack>
  );
};

const complete = (text: string) => {
  const head = text.trimStart();
  if (!head || /\s/.test(head)) return [];
  const needle = head.toUpperCase();
  const starts = COMMANDS.filter((command) => command.name.startsWith(needle));
  const has = COMMANDS.filter((command) => !command.name.startsWith(needle) && command.name.includes(needle));
  return [...starts, ...has].slice(0, 6);
};

type CommandLineProps = { text: string; onText: (text: string) => void };

export const CommandLine = ({ text, onText }: CommandLineProps) => {
  const { send, commands, remember } = useActions();
  const { settings } = useSettings();
  const [at, setAt] = useState<number | null>(null);
  const suggestions = useMemo(() => (settings.console.suggest ? complete(text) : []), [settings.console.suggest, text]);
  const submit = () => {
    const line = text.trim();
    if (!line) return;
    send(line);
    remember(line, settings.console.historySize);
    onText("");
    setAt(null);
  };
  const walk = (direction: -1 | 1) => {
    if (commands.length === 0) return;
    const next = at === null ? (direction === -1 ? commands.length - 1 : null) : at + direction;
    if (next === null || next >= commands.length) {
      setAt(null);
      onText("");
      return;
    }
    const clamped = Math.max(0, next);
    setAt(clamped);
    onText(commands[clamped] ?? "");
  };
  return (
    <Stack gap="xs">
      <Grid columns="minmax(0, 1fr) auto" gap="sm" align="center">
        <MonoField
          aria-label="G-code 입력"
          placeholder="G-code 입력…"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          value={text}
          onChange={(event) => {
            onText(event.target.value);
            setAt(null);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") submit();
            else if (event.key === "ArrowUp" && (text === "" || at !== null)) {
              event.preventDefault();
              walk(-1);
            } else if (event.key === "ArrowDown" && at !== null) {
              event.preventDefault();
              walk(1);
            } else if (event.key === "Tab" && suggestions.length > 0 && text.trim() !== suggestions[0]!.name) {
              event.preventDefault();
              onText(`${suggestions[0]!.name} `);
            } else if (event.key === "Escape") onText("");
          }}
        />
        <IconButton variant="soft" aria-label="보내기" disabled={text.trim() === ""} onClick={submit}><Glyph name="send" /></IconButton>
      </Grid>
      {suggestions.length > 0 ? (
        <Inline gap="xs" wrap aria-label="자동 완성">
          {suggestions.map((command) => (
            <Button key={command.name} variant="hairline" size="xs" fontSize="label" onClick={() => onText(`${command.name} `)}>{command.name}</Button>
          ))}
          <Text as="span" variant="label" strong={false} ink="tertiary">Tab으로 완성</Text>
        </Inline>
      ) : null}
    </Stack>
  );
};

export const CommandHelp = ({ open, onClose, onPick }: { open: boolean; onClose: () => void; onPick: (name: string) => void }) => {
  const [query, setQuery] = useState("");
  const needle = query.trim().toUpperCase();
  const list = COMMANDS.filter((command) => !needle || command.name.includes(needle) || command.description.toUpperCase().includes(needle));
  return (
    <Dialog open={open} onClose={onClose} title="명령 도움말" description="프린터가 알아듣는 명령입니다. 누르면 명령 줄에 넣습니다." size="lg">
      <Stack gap="md">
        <Field size="sm" aria-label="명령 찾기" placeholder="이름이나 설명으로 찾기" leading={<Glyph name="search" />} value={query} onChange={(event) => setQuery(event.target.value)} clearable onClear={() => setQuery("")} />
        <Box maxHeight="xl" overflowY="auto">
          <Stack as="ul" aria-label="명령">
            {list.map((command, index) => (
              <Stack as="li" key={command.name}>
                {index > 0 ? <Divider aria-hidden /> : null}
                <Button variant="ghost" fullWidth justify="between" onClick={() => { onPick(command.name); onClose(); }}>
                  <Text as="span" family="mono" strong ink="inherit">{command.name}</Text>
                  <Text as="span" variant="caption" ink="tertiary" truncate>{command.description}</Text>
                </Button>
              </Stack>
            ))}
            {list.length === 0 ? <Empty glyph="search" title="맞는 명령이 없습니다" /> : null}
          </Stack>
        </Box>
      </Stack>
    </Dialog>
  );
};
