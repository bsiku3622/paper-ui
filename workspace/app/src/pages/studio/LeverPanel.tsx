// 시안: the directions the owner judges Paper by, the levers of the page that is shown. The page describes its own levers (the hello
// message), so the panel draws whichever the page has: Paper's screens answer to a few, the owner's host to all of its lab.

import { Button, Divider, Inline, Radio, Select, Stack, Switch, Text } from "@studio-baeks/paper-ui";

import type { LabSpec, LeverDef, LeverValue } from "./protocol";
import { applyLevers, resetLevers, setLever, useStore } from "./store";

const effective = (lab: LabSpec, levers: Readonly<Record<string, LeverValue>>, key: string): LeverValue | undefined => levers[key] ?? lab.defaults[key];

const sameAs = (lab: LabSpec, levers: Readonly<Record<string, LeverValue>>, values: Readonly<Record<string, LeverValue>>) =>
  lab.levers.every((lever) => values[lever.key] === undefined || values[lever.key] === effective(lab, levers, lever.key));

const Lever = ({ lever, lab, levers }: { lever: LeverDef; lab: LabSpec; levers: Readonly<Record<string, LeverValue>> }) => {
  const value = effective(lab, levers, lever.key);
  if (!lever.options) {
    return (
      <Inline as="label" justify="between" align="center" gap="md">
        <Stack>
          <Text as="span" variant="label">{lever.label}</Text>
          {lever.note ? <Text as="span" variant="caption" ink="tertiary">{lever.note}</Text> : null}
        </Stack>
        <Switch size="sm" checked={value === true} onChange={(event) => setLever(lever.key, event.currentTarget.checked)} />
      </Inline>
    );
  }
  return (
    <Inline justify="between" align="center" gap="md">
      <Text as="span" variant="label">{lever.label}</Text>
      <Select size="sm" aria-label={lever.label} value={String(value)} onChange={(event) => setLever(lever.key, event.currentTarget.value)}>
        {lever.options.map((option) => <Select.Option key={option.value} value={option.value}>{option.label}</Select.Option>)}
      </Select>
    </Inline>
  );
};

export const LeverPanel = () => {
  const levers = useStore((store) => store.levers);
  const lab = useStore((store) => Object.values(store.frames).find((frame) => frame.lab)?.lab);
  const connected = useStore((store) => Object.values(store.frames).some((frame) => frame.connected));

  if (!lab) {
    return <Text as="p" ink="tertiary">{connected ? "이 화면에는 고를 시안이 없습니다." : "화면이 연결되면 시안을 고를 수 있습니다."}</Text>;
  }
  const sections = [...new Set(lab.levers.map((lever) => lever.section ?? ""))];
  const current = lab.presets.find((preset) => sameAs(lab, levers, preset.values));
  return (
    <Stack gap="md">
      <Stack gap="xs" role="radiogroup" aria-label="방향">
        {lab.presets.map((preset) => (
          <Inline key={preset.id} as="label" gap="sm" align="start">
            <Radio name="studio-direction" checked={current?.id === preset.id} onChange={() => applyLevers(preset.values)} />
            <Stack>
              <Text as="span" strong={current?.id === preset.id}>{preset.label}</Text>
              {preset.note ? <Text as="span" variant="caption" ink="tertiary">{preset.note}</Text> : null}
            </Stack>
          </Inline>
        ))}
        {current ? null : <Text variant="caption" ink="secondary">직접 고른 조합</Text>}
      </Stack>
      {sections.map((section) => (
        <Stack key={section} gap="sm">
          <Divider />
          {section ? <Text as="span" variant="label" ink="tertiary">{section}</Text> : null}
          {lab.levers.filter((lever) => (lever.section ?? "") === section).map((lever) => <Lever key={lever.key} lever={lever} lab={lab} levers={levers} />)}
        </Stack>
      ))}
      <Inline justify="between" align="center">
        <Text variant="caption" ink="tertiary">라이트 기준으로 골랐습니다.</Text>
        <Button size="xs" variant="hairline" onClick={resetLevers}>전부 지금으로</Button>
      </Inline>
    </Stack>
  );
};
