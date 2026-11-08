// 요소: pick a part on the page and set its props. The studio edits no file; a prop set here is held against the place in the code that
// draws the part, and every place that code draws it follows. The props come from the part's spec; what the code writes there is shown.

import type { ReactNode } from "react";

import { Button, Divider, Field, IconButton, Inline, Select, Stack, Switch, Text } from "@studio-baeks/paper-ui";

import { CloseIcon, PointerIcon, UndoIcon } from "../../compositions/icons";
import { specOf } from "./parts";
import type { PartSite, PartValue, PropDef } from "./protocol";
import { deselect, resetPart, resetParts, setPartProp, update, useStore, type Selection } from "./store";

const KEEP = "";
const REMOVE = "\u0000remove";

const show = (value: unknown): string => (value === undefined ? "" : String(value));

const PropRow = ({ def, site, own }: { def: PropDef; site: PartSite; own: PartValue | undefined }) => {
  const literal = site.literals[def.key];
  const computed = site.dynamic.includes(def.key);
  const set = (value: PartValue | undefined) => setPartProp(site, def.key, value);
  const inCode = literal !== undefined ? `코드 ${show(literal)}` : computed ? "코드가 정함" : "기본";
  const effective = own !== undefined ? own : literal;
  let control: ReactNode;
  if (def.kind === "choice") {
    const value = own === undefined ? KEEP : own === null ? REMOVE : String(own);
    control = (
      <Select size="sm" aria-label={def.label} value={value} onChange={(event) => { const next = event.currentTarget.value; set(next === KEEP ? undefined : next === REMOVE ? null : next); }}>
        <Select.Option value={KEEP}>{inCode}</Select.Option>
        {literal !== undefined ? <Select.Option value={REMOVE}>빼기 (기본값)</Select.Option> : null}
        {(def.options ?? []).map((option) => <Select.Option key={option} value={option}>{option}</Select.Option>)}
      </Select>
    );
  } else if (def.kind === "switch") {
    control = <Switch size="sm" aria-label={def.label} checked={effective === true} onChange={(event) => set(event.currentTarget.checked)} />;
  } else if (def.kind === "number") {
    control = <Field size="sm" type="number" numeric textAlign="end" aria-label={def.label} min={def.min} max={def.max} step={def.step} value={show(effective)} onChange={(event) => set(event.currentTarget.value === "" ? undefined : Number(event.currentTarget.value))} />;
  } else {
    control = <Field size="sm" aria-label={def.label} placeholder={inCode} value={own === undefined || own === null ? "" : String(own)} onChange={(event) => set(event.currentTarget.value === "" ? undefined : event.currentTarget.value)} />;
  }
  return (
    <Stack gap="xs">
      <Inline justify="between" align="center" gap="sm">
        <Stack minWidth={0}>
          <Text as="span" variant="caption" strong={own !== undefined}>{def.label}</Text>
          <Text as="span" variant="label" strong={false} ink="tertiary" family="mono">{def.key}{computed ? " · 코드가 계산" : ""}</Text>
        </Stack>
        <Inline gap="xs" align="center">
          {control}
          {own !== undefined ? (
            <IconButton size="xs" variant="ghost" aria-label={`${def.label} 되돌리기`} onClick={() => set(undefined)}>
              <UndoIcon />
            </IconButton>
          ) : null}
        </Inline>
      </Inline>
      {def.note ? <Text as="p" variant="caption" ink="tertiary">{def.note}</Text> : null}
    </Stack>
  );
};

const Picked = ({ selection }: { selection: Selection }) => {
  const { pick } = selection;
  const parts = useStore((store) => store.parts);
  const extra = useStore((store) => store.frames[selection.frame]?.parts);
  const spec = specOf(pick.component, extra);
  const own = parts[pick.key] ?? {};
  const goUp = (site: PartSite, index: number) =>
    update({ selection: { frame: selection.frame, pick: { ...pick, ...site, count: 1, chain: pick.chain.slice(index + 1) } } });
  return (
    <Stack gap="md">
      <Inline justify="between" align="start" gap="sm">
        <Stack minWidth={0}>
          <Inline gap="sm" align="baseline">
            <Text as="h3" variant="subheading">{spec?.label ?? pick.component}</Text>
            <Text as="span" variant="label" strong={false} ink="tertiary" family="mono">{pick.component}</Text>
          </Inline>
          <Text as="span" variant="caption" ink="tertiary" family="mono" truncate>{pick.file}{pick.line > 0 ? `:${pick.line}` : ""}</Text>
          {pick.rect.width > 0 ? <Text as="span" variant="caption" ink="tertiary" numeric>{Math.round(pick.rect.width)} × {Math.round(pick.rect.height)}</Text> : null}
          {pick.count > 1 ? <Text as="span" variant="caption" ink="secondary">같은 코드 {pick.count}곳이 함께 바뀝니다</Text> : null}
        </Stack>
        <IconButton size="xs" variant="ghost" aria-label="고른 요소 놓기" onClick={deselect}>
          <CloseIcon />
        </IconButton>
      </Inline>
      {pick.chain.length > 0 ? (
        <Inline gap="xs" align="center" wrap>
          <Text as="span" variant="label" strong={false} ink="tertiary">바깥 부품</Text>
          {pick.chain.slice(0, 4).map((site, index) => (
            <Button key={site.key} size="xs" variant="muted" onClick={() => goUp(site, index)}>{specOf(site.component, extra)?.label ?? site.component}</Button>
          ))}
        </Inline>
      ) : null}
      <Divider />
      {spec && spec.props.length > 0 ? (
        <Stack gap="md">
          {spec.props.map((def) => <PropRow key={def.key} def={def} site={pick} own={own[def.key]} />)}
        </Stack>
      ) : (
        <Text as="p" ink="tertiary">이 부품에는 고를 Prop이 없습니다.</Text>
      )}
      {pick.dynamic.length > 0 ? <Text as="p" variant="caption" ink="tertiary">코드가 계산하는 Prop: {pick.dynamic.join(", ")}</Text> : null}
      {Object.keys(own).length > 0 ? (
        <Inline justify="end">
          <Button size="xs" variant="hairline" onClick={() => resetPart(pick.key)}>이 요소 되돌리기</Button>
        </Inline>
      ) : null}
    </Stack>
  );
};

export const PartPanel = () => {
  const pick = useStore((store) => store.pick);
  const selection = useStore((store) => store.selection);
  const parts = useStore((store) => store.parts);
  const sites = useStore((store) => store.sites);
  const frames = useStore((store) => store.frames);
  const marks = Object.values(frames).some((frame) => frame.marks);
  const connected = Object.values(frames).some((frame) => frame.connected);
  const edited = Object.keys(parts);
  const frame = Object.keys(frames)[0] ?? "";

  return (
    <Stack gap="md">
      <Inline gap="sm" align="center" justify="between">
        <Text as="p" variant="caption" ink="secondary">{pick ? "화면에서 부품을 누르세요. 누른 것은 화면에 닿지 않습니다." : "부품을 골라 그 Prop을 고칩니다."}</Text>
        <Button size="sm" variant={pick ? "solid" : "hairline"} disabled={!connected || !marks} onClick={() => update({ pick: !pick })}>
          <PointerIcon />
          {pick ? "고르는 중" : "요소 골라 고치기"}
        </Button>
      </Inline>
      {connected && !marks ? <Text as="p" variant="caption" ink="tertiary">이 빌드에는 요소 표식이 없습니다. 개발 서버에서만 쓸 수 있습니다.</Text> : null}
      {selection ? <Picked selection={selection} /> : null}
      {edited.length > 0 ? (
        <Stack gap="sm">
          <Divider />
          <Inline justify="between" align="center">
            <Text as="span" variant="label" ink="tertiary">바꾼 요소 {edited.length}</Text>
            <Button size="xs" variant="ghost" onClick={resetParts}>전부 되돌리기</Button>
          </Inline>
          {edited.map((key) => {
            const site = sites[key];
            const props = parts[key] ?? {};
            return (
              <Inline key={key} justify="between" align="center" gap="sm">
                <Stack minWidth={0}>
                  <Text as="span" variant="caption" truncate>{site?.component ?? key}</Text>
                  <Text as="span" variant="label" strong={false} ink="tertiary" family="mono" truncate>{site ? `${site.file}:${site.line}` : key}</Text>
                  <Text as="span" variant="label" strong={false} ink="secondary" truncate>{Object.entries(props).map(([prop, value]) => `${prop}=${value === null ? "빼기" : String(value)}`).join(" · ")}</Text>
                </Stack>
                <Inline gap="xs">
                  {site && frame ? (
                    <Button size="xs" variant="ghost" onClick={() => update({ selection: { frame, pick: { ...site, count: 1, rect: { x: 0, y: 0, width: 0, height: 0 }, viewport: { width: 0, height: 0 }, chain: [] } } })}>고치기</Button>
                  ) : null}
                  <IconButton size="xs" variant="ghost" aria-label={`${site?.component ?? key} 되돌리기`} onClick={() => resetPart(key)}>
                    <UndoIcon />
                  </IconButton>
                </Inline>
              </Inline>
            );
          })}
        </Stack>
      ) : null}
    </Stack>
  );
};
