// 값: every token, grouped, with a search. A colour is chosen from the palette's steps; a length, a number or a shadow is typed. What was
// changed shows a mark and a way back, and all of it goes to the frames as PaperProvider's props.

import { useMemo, useState } from "react";

import { Button, Field, IconButton, Inline, Stack, Switch, Text } from "@studio-baeks/paper-ui";

import { ChevronDownIcon, ChevronRightIcon, SearchIcon, UndoIcon } from "../../compositions/icons";
import { Dot } from "../../compositions/Dot";
import { SECTIONS, getCatalog, type Item, type Section, type Slot } from "./catalog";
import { Chip } from "./chip";
import { StepPicker, ValueControl, stepName } from "./controls";
import { resetEdits, setEdit, useStore } from "./store";

const MODE_NAMES = { light: "라이트", dark: "다크" } as const;

const valueOf = (slot: Slot, edits: Readonly<Record<string, string>>) => edits[slot.id] ?? slot.original;

const matches = (item: Item, query: string) => `${item.label} ${item.hint} ${item.group}`.toLowerCase().includes(query);

const Row = ({ item, edits, picking, onPicking }: { item: Item; edits: Readonly<Record<string, string>>; picking: string | null; onPicking: (id: string | null) => void }) => {
  const changed = item.slots.some((slot) => slot.id in edits);
  const open = item.slots.find((slot) => slot.id === picking);
  return (
    <Stack gap="sm" paddingY="xs">
      <Inline justify="between" align="center" gap="sm" wrap>
        <Stack gap="xs" minWidth={0}>
          <Inline gap="xs" align="center">
            {changed ? <Dot ink="primary" aria-label="바꾼 값" role="img" /> : null}
            <Text as="span" variant="caption" truncate>{item.label}</Text>
          </Inline>
          <Text as="span" variant="label" strong={false} ink="tertiary" family="mono" truncate>{item.hint}</Text>
        </Stack>
        <Inline gap="xs" align="center">
          {item.kind === "color"
            ? item.slots.map((slot) => {
                const value = valueOf(slot, edits);
                const name = slot.mode ? MODE_NAMES[slot.mode] : stepName(value);
                return (
                  <Button key={slot.id} size="xs" variant="hairline" selected={picking === slot.id} aria-expanded={picking === slot.id} aria-label={`${item.label} ${name} ${value}`} onClick={() => onPicking(picking === slot.id ? null : slot.id)}>
                    <Chip color={value} label={`${stepName(value)}`} />
                    {name}
                  </Button>
                );
              })
            : item.slots.map((slot) => {
                if (item.kind === "color") return null;
                return (
                  <ValueControl key={slot.id} kind={item.kind} label={`${item.label}${slot.mode ? ` ${MODE_NAMES[slot.mode]}` : ""}`} value={valueOf(slot, edits)} original={slot.original} hint={item.range} onChange={(next) => setEdit(slot.id, next === slot.original ? null : next)} />
                );
              })}
          {changed ? (
            <IconButton size="xs" variant="ghost" aria-label={`${item.label} 되돌리기`} onClick={() => resetEdits(item.slots.map((slot) => slot.id))}>
              <UndoIcon />
            </IconButton>
          ) : null}
        </Inline>
      </Inline>
      {open ? <StepPicker value={valueOf(open, edits)} plain={item.section === "palette"} onPick={(hex) => setEdit(open.id, hex === open.original ? null : hex)} /> : null}
    </Stack>
  );
};

export const TokenPanel = () => {
  const catalog = useMemo(getCatalog, []);
  const edits = useStore((store) => store.edits);
  const [section, setSection] = useState<Section>("color");
  const [search, setSearch] = useState("");
  const [changedOnly, setChangedOnly] = useState(false);
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  const [picking, setPicking] = useState<string | null>(null);

  const query = search.trim().toLowerCase();
  const visible = (item: Item) => (query ? matches(item, query) : item.section === section) && (!changedOnly || item.slots.some((slot) => slot.id in edits));
  const groups = catalog.groups.map((group) => ({ group, items: group.items.filter(visible) })).filter((entry) => entry.items.length > 0);
  const changedCount = catalog.items.filter((item) => item.slots.some((slot) => slot.id in edits)).length;

  return (
    <Stack gap="md">
      <Field size="sm" aria-label="토큰 찾기" placeholder="토큰 찾기 (이름 · 경로)" leading={<SearchIcon />} clearable value={search} onChange={(event) => setSearch(event.currentTarget.value)} onClear={() => setSearch("")} />
      <Inline gap="xs" wrap role="group" aria-label="값의 종류">
        {SECTIONS.map((one) => (
          <Button key={one.id} size="xs" variant="ghost" selected={!query && section === one.id} onClick={() => { setSection(one.id); setSearch(""); }}>
            {one.label}
          </Button>
        ))}
      </Inline>
      <Inline as="label" justify="between" align="center" gap="md">
        <Text as="span" variant="caption" ink="secondary">바꾼 것만 보기 ({changedCount})</Text>
        <Switch size="sm" checked={changedOnly} onChange={(event) => setChangedOnly(event.currentTarget.checked)} />
      </Inline>
      {groups.length === 0 ? <Text as="p" ink="tertiary">{changedOnly ? "바꾼 값이 없습니다." : "맞는 토큰이 없습니다."}</Text> : null}
      {groups.map(({ group, items }) => {
        const open = !(group.collapsed && !query && !changedOnly) !== (flipped[group.id] ?? false);
        const count = items.filter((item) => item.slots.some((slot) => slot.id in edits)).length;
        return (
          <Stack key={group.id} gap="xs">
            <Button size="sm" variant="ghost" fullWidth justify="start" aria-expanded={open} onClick={() => setFlipped((now) => ({ ...now, [group.id]: !now[group.id] }))}>
              {open ? <ChevronDownIcon /> : <ChevronRightIcon />}
              {group.title}
              <Text as="span" variant="label" strong={false} ink="tertiary" numeric>{count > 0 ? `${count}/${items.length}` : items.length}</Text>
            </Button>
            {open ? (
              <Stack gap="xs" paddingX="sm">
                {group.note ? <Text as="p" variant="caption" ink="tertiary">{group.note}</Text> : null}
                {items.map((item) => <Row key={item.key} item={item} edits={edits} picking={picking} onPicking={setPicking} />)}
              </Stack>
            ) : null}
          </Stack>
        );
      })}
    </Stack>
  );
};
