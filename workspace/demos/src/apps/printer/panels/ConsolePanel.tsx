// The console on the dashboard: the command line, and the newest lines of the log in a box that scrolls. The page of the
// same name (Console) shows the whole log with filters; both read the same mock log.

import { useState } from "react";

import { Box, Divider, IconButton } from "@studio-baeks/paper-ui";

import { Glyph } from "../../../kit";
import { CommandHelp, CommandLine, LogList, visibleEntries } from "../parts/ConsoleParts";
import { useSettings } from "../settings";
import { useActions, useSim } from "../sim/Provider";
import { Panel } from "../ui/Panel";
import { useQueryState } from "../ui/useQueryState";

export const ConsolePanel = () => {
  const sim = useSim();
  const { update } = useActions();
  const { settings } = useSettings();
  const [, setSettings] = useQueryState("settings");
  const [text, setText] = useState("");
  const [help, setHelp] = useState(false);
  const entries = visibleEntries(sim.log, settings.console);
  return (
    <Panel
      id="console"
      title="콘솔"
      glyph="terminal"
      flush
      actions={
        <>
          <IconButton variant="ghost" size="sm" aria-label="콘솔 비우기" onClick={() => update((s) => ({ ...s, log: [] }))}><Glyph name="trash-2" /></IconButton>
          <IconButton variant="ghost" size="sm" aria-label="명령 도움말" onClick={() => setHelp(true)}><Glyph name="circle-help" /></IconButton>
          <IconButton variant="ghost" size="sm" aria-label="콘솔 설정" onClick={() => setSettings("console")}><Glyph name="settings" /></IconButton>
        </>
      }
    >
      <Box padding="lg"><CommandLine text={text} onText={setText} /></Box>
      <Divider />
      <Box height={settings.console.dashboardHeight} overflowY="auto"><LogList entries={entries} limit={60} /></Box>
      <CommandHelp open={help} onClose={() => setHelp(false)} onPick={(name) => setText(`${name} `)} />
    </Panel>
  );
};
