// Above the preview, in one row: the width and the theme of the preview and the frames side by side, then what acts on the whole
// preview — its window of its own, the original held down, picking, and the editor's fold. Below lg the row also holds the apps, as
// a select.

import { Box, Button, IconButton, Inline, SelectableGroup, Select, Surface } from "@studio-baeks/paper-ui";

import { ExternalIcon, PanelIcon, PointerIcon } from "../../compositions/icons";
import { AppSelect } from "./AppBar";
import { appById, frameUrl } from "./apps";
import { openWindow } from "./bridge";
import type { Mode } from "./protocol";
import { getStore, setView, update, useStore, WIDTHS, type Compare } from "./store";
import * as s from "./studio.css";

export const PRIMARY = "frame-0";

const Choice = ({ label, value, options, onChange }: { label: string; value: string; options: readonly { id: string; label: string }[]; onChange: (id: string) => void }) => (
  <SelectableGroup as={Inline} gap="xs" role="radiogroup" aria-label={label} selectedValues={[value]} selectionRequired onSelectedValuesChange={([next]: string[]) => { if (next) onChange(next); }} currentValue={value} onCurrentValueChange={onChange}>
    {options.map((option) => (
      <Button key={option.id} as={SelectableGroup.Item} value={option.id} role="radio" variant="ghost" size="sm">
        {option.label}
      </Button>
    ))}
  </SelectableGroup>
);

const COMPARES: Record<Compare, string> = { off: "나란히 끔", theme: "나란히 · 라이트 다크", width: "나란히 · 폭 셋" };

// The page the preview shows, in a window of its own at the preview's width and the preview's theme: seen at its own size, and
// still taking what the studio turns.
const OpenWindow = () => {
  const show = () => {
    const { view, frames } = getStore();
    const app = appById(view.item);
    if (app) openWindow(frameUrl(app, frames[PRIMARY]?.path ?? view.path, view.theme), view.width);
  };
  return (
    <Button size="sm" variant="hairline" onClick={show}>
      <ExternalIcon />
      새 창으로 열기
    </Button>
  );
};

// The original held down: while it is, the frames draw as their code wrote them.
const Hold = () => {
  const paused = useStore((store) => store.paused);
  const hold = (on: boolean) => update({ paused: on });
  return (
    <Button
      size="sm"
      variant={paused ? "solid" : "hairline"}
      onPointerDown={() => hold(true)}
      onPointerUp={() => hold(false)}
      onPointerLeave={() => hold(false)}
      onPointerCancel={() => hold(false)}
      onBlur={() => hold(false)}
      onKeyDown={(event) => { if (event.key === " " || event.key === "Enter") hold(true); }}
      onKeyUp={() => hold(false)}
    >
      누르는 동안 원본
    </Button>
  );
};

// What acts on the whole preview: its window, the original held, picking, the editor's fold.
const Actions = () => {
  const view = useStore((store) => store.view);
  const pick = useStore((store) => store.pick);
  return (
    <Inline gap="sm" align="center" wrap>
      <OpenWindow />
      <Hold />
      <Button size="sm" variant={pick ? "solid" : "hairline"} aria-pressed={pick} onClick={() => update({ pick: !pick, ...(pick ? {} : { view: { ...view, tab: "parts" } }) })}>
        <PointerIcon />
        요소 골라 고치기
      </Button>
      <IconButton size="sm" variant="hairline" aria-label={view.panel ? "편집 접기" : "편집 펴기"} aria-expanded={view.panel} onClick={() => setView({ panel: !view.panel })}>
        <PanelIcon />
      </IconButton>
    </Inline>
  );
};

export const Toolbar = () => {
  const view = useStore((store) => store.view);
  return (
    <Surface fill="canvas" border="bottom">
      <Inline justify="between" align="center" gap="md" wrap padding="md">
        <Inline gap="md" align="center" wrap>
          <Box width="fit" className={s.onlyNarrow}>
            <AppSelect />
          </Box>
          <Choice label="화면 폭" value={String(view.width)} options={WIDTHS.map((width) => ({ id: String(width), label: String(width) }))} onChange={(id) => setView({ width: Number(id) })} />
          <Choice label="미리보기 테마" value={view.theme} options={[{ id: "light", label: "라이트" }, { id: "dark", label: "다크" }]} onChange={(id) => setView({ theme: id as Mode })} />
          <Box width="fit">
            <Select size="sm" aria-label="나란히" value={view.compare} onChange={(event) => setView({ compare: event.currentTarget.value as Compare })}>
              {(Object.keys(COMPARES) as Compare[]).map((one) => <Select.Option key={one} value={one}>{COMPARES[one]}</Select.Option>)}
            </Select>
          </Box>
        </Inline>
        <Actions />
      </Inline>
    </Surface>
  );
};
