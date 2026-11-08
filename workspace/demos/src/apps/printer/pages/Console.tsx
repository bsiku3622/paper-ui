import { useState } from "react";

import { Box, Divider, Field, IconButton, Inline, Stack, Switch, Text } from "@studio-baeks/paper-ui";

import { Glyph, PageHeader, Segmented } from "../../../kit";
import type { LogKind } from "../model";
import { CommandHelp, CommandLine, LogList, visibleEntries } from "../parts/ConsoleParts";
import { useSettings } from "../settings";
import { useActions, useSim } from "../sim/Provider";
import { Panel } from "../ui/Panel";
import { useQueryState } from "../ui/useQueryState";

const KINDS: Record<string, readonly LogKind[] | null> = { all: null, command: ["command"], response: ["response", "info"], error: ["error"] };

export const Console = () => {
  const sim = useSim();
  const { update } = useActions();
  const { settings, patch } = useSettings();
  const [, setSettings] = useQueryState("settings");
  const [text, setText] = useState("");
  const [help, setHelp] = useState(false);
  const [kind, setKind] = useState("all");
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(150);
  const entries = visibleEntries(sim.log, settings.console, query, KINDS[kind] ?? null);
  const hidden = sim.log.length - visibleEntries(sim.log, settings.console).length;
  return (
    <>
      <PageHeader title="콘솔" description="G-code를 보내고 프린터의 응답을 봅니다. 여기서 보낸 명령은 모의 프린터에만 닿습니다." />
      <Panel
        id="console-page"
        title="명령과 기록"
        glyph="terminal"
        collapsible={false}
        flush
        actions={
          <>
            <IconButton variant="ghost" size="sm" aria-label="콘솔 비우기" onClick={() => update((s) => ({ ...s, log: [] }))}><Glyph name="trash-2" /></IconButton>
            <IconButton variant="ghost" size="sm" aria-label="명령 도움말" onClick={() => setHelp(true)}><Glyph name="circle-help" /></IconButton>
            <IconButton variant="ghost" size="sm" aria-label="콘솔 설정" onClick={() => setSettings("console")}><Glyph name="settings" /></IconButton>
          </>
        }
      >
        <Stack gap="md" padding="lg">
          <CommandLine text={text} onText={setText} />
          <Inline gap="md" align="center" justify="between" wrap>
            <Inline gap="md" align="center" wrap>
              <Segmented
                label="줄 종류"
                value={kind}
                onChange={setKind}
                options={[
                  { id: "all", label: "전체" },
                  { id: "command", label: "명령" },
                  { id: "response", label: "응답" },
                  { id: "error", label: "오류" },
                ]}
              />
              <Box width="lg" maxWidth="full">
                <Field size="sm" aria-label="로그에서 찾기" placeholder="로그에서 찾기" leading={<Glyph name="search" />} value={query} onChange={(event) => setQuery(event.target.value)} clearable onClear={() => setQuery("")} />
              </Box>
            </Inline>
            <Inline gap="lg" align="center" wrap>
              <Inline as="label" gap="sm" align="center">
                <Switch aria-label="온도 줄 숨기기" checked={settings.console.hideTemperature} onChange={(event) => patch("console", { hideTemperature: event.target.checked })} />
                <Text as="span" ink="secondary">온도 줄 숨기기</Text>
              </Inline>
              <Inline as="label" gap="sm" align="center">
                <Switch aria-label="시각 표시" checked={settings.console.timestamps} onChange={(event) => patch("console", { timestamps: event.target.checked })} />
                <Text as="span" ink="secondary">시각 표시</Text>
              </Inline>
            </Inline>
          </Inline>
          <Text as="span" variant="label" strong={false} ink="tertiary" numeric>
            {entries.length}줄 보임 · 전체 {sim.log.length}줄{hidden > 0 ? ` · 필터가 ${hidden}줄을 숨기는 중` : ""}
          </Text>
        </Stack>
        <Divider />
        <LogList entries={entries} limit={limit} onMore={() => setLimit((now) => now + 200)} />
      </Panel>
      <CommandHelp open={help} onClose={() => setHelp(false)} onPick={(name) => setText(`${name} `)} />
    </>
  );
};
