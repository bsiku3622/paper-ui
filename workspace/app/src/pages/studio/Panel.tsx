// The editor on the right: four tabs — the directions, every value, the parts, and the list of what was changed.

import { Box, Button, Inline, SelectableGroup, Stack, Surface, Text } from "@studio-baeks/paper-ui";

import { ChangesPanel } from "./ChangesPanel";
import { LeverPanel } from "./LeverPanel";
import { PartPanel } from "./PartPanel";
import { changeCount, setView, useStore, type Tab } from "./store";
import * as s from "./studio.css";
import { TokenPanel } from "./TokenPanel";

const TABS: readonly { id: Tab; label: string }[] = [
  { id: "levers", label: "시안" },
  { id: "tokens", label: "값" },
  { id: "parts", label: "요소" },
  { id: "changes", label: "변경" },
];

export const Panel = () => {
  const tab = useStore((store) => store.view.tab);
  const count = useStore(changeCount);
  const pick = useStore((store) => store.pick);
  const group = {
    role: "tablist",
    "aria-label": "편집",
    selectedValues: [tab],
    selectionRequired: true,
    onSelectedValuesChange: ([next]: string[]) => { if (next) setView({ tab: next as Tab }); },
    currentValue: tab,
    onCurrentValueChange: (next: string) => setView({ tab: next as Tab }),
  };
  return (
    <Surface as="aside" aria-label="편집" fill="canvas" border="start" className={s.column}>
      <Stack gap="md" padding="lg">
        <SelectableGroup as={Inline} gap="xs" {...group}>
          {TABS.map((one) => (
            <Button key={one.id} as={SelectableGroup.Item} value={one.id} role="tab" id={`studio-tab-${one.id}`} aria-controls="studio-panel" variant="ghost" size="sm">
              {one.label}
              {one.id === "changes" && count > 0 ? <Text as="span" variant="label" strong={false} ink="tertiary" numeric>{count}</Text> : null}
              {one.id === "parts" && pick ? <Text as="span" variant="label" strong={false} ink="tertiary">고르는 중</Text> : null}
            </Button>
          ))}
        </SelectableGroup>
        <Box id="studio-panel" role="tabpanel" aria-labelledby={`studio-tab-${tab}`}>
          {tab === "levers" ? <LeverPanel /> : null}
          {tab === "tokens" ? <TokenPanel /> : null}
          {tab === "parts" ? <PartPanel /> : null}
          {tab === "changes" ? <ChangesPanel /> : null}
        </Box>
      </Stack>
    </Surface>
  );
};
