// The macros Klipper reports, as buttons: grouped as the user grouped them, the hidden ones left out. A macro that takes
// parameters has a chevron beside it that opens its fields; the button itself runs it with its defaults.

import { useState } from "react";

import { Button, Field, Floating, FormField, IconButton, Inline, Stack, Surface, Text } from "@studio-baeks/paper-ui";

import { Empty, Glyph } from "../../../kit";
import { MACROS } from "../catalog";
import type { MacroDef } from "../model";
import { useSettings } from "../settings";
import { useActions } from "../sim/Provider";
import { Panel } from "../ui/Panel";
import { useQueryState } from "../ui/useQueryState";

const nameOf = (macro: MacroDef) => macro.name.replaceAll("_", " ");

const MacroButton = ({ macro }: { macro: MacroDef }) => {
  const { send } = useActions();
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<Record<string, string>>(() => Object.fromEntries(macro.params.map((param) => [param.name, param.value])));
  if (macro.params.length === 0) return <Button variant="hairline" size="sm" fontSize="label" onClick={() => send(macro.name)}>{nameOf(macro)}</Button>;
  const line = `${macro.name} ${macro.params.map((param) => `${param.name}=${values[param.name] ?? param.value}`).join(" ")}`;
  return (
    <Floating open={open} onOpenChange={setOpen}>
      <Inline gap="xs">
        <Button variant="hairline" size="sm" fontSize="label" onClick={() => send(macro.name)}>{nameOf(macro)}</Button>
        <IconButton as={Floating.Trigger} variant="hairline" size="sm" aria-label={`${nameOf(macro)} 매개변수`}><Glyph name="chevron-down" /></IconButton>
      </Inline>
      <Floating.Content as={Surface} fill="raised" border radius="md" padding="lg" placement="bottom start" width="xl" maxWidth="full" aria-label={`${nameOf(macro)} 매개변수`}>
        <Stack gap="md">
          <Stack gap="xs">
            <Text as="h3" variant="subheading">{nameOf(macro)}</Text>
            <Text variant="caption" ink="tertiary">{macro.description}</Text>
          </Stack>
          {macro.params.map((param) => (
            <FormField key={param.name} label={`${param.label} (${param.name})`}>
              <Field size="sm" value={values[param.name] ?? param.value} onChange={(event) => setValues((now) => ({ ...now, [param.name]: event.target.value }))} />
            </FormField>
          ))}
          <Inline justify="end" gap="sm">
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>닫기</Button>
            <Button size="sm" onClick={() => { send(line); setOpen(false); }}><Glyph name="play" />실행</Button>
          </Inline>
          <Text as="span" variant="label" strong={false} ink="tertiary" family="mono">{line}</Text>
        </Stack>
      </Floating.Content>
    </Floating>
  );
};

export const MacrosPanel = () => {
  const { settings } = useSettings();
  const [, setSettings] = useQueryState("settings");
  const shown = MACROS.filter((macro) => !settings.macros.hidden.includes(macro.name));
  const grouped = settings.macros.groups.map((name) => ({ name, macros: shown.filter((macro) => settings.macros.assign[macro.name] === name) }));
  const loose = shown.filter((macro) => !settings.macros.groups.includes(settings.macros.assign[macro.name] ?? ""));
  const sections = [{ name: null as string | null, macros: loose }, ...grouped].filter((section) => section.macros.length > 0);
  return (
    <Panel id="macros" title="매크로" glyph="code" actions={<IconButton variant="ghost" size="sm" aria-label="매크로 설정" onClick={() => setSettings("macros")}><Glyph name="settings" /></IconButton>}>
      {sections.length === 0 ? (
        <Empty glyph="code" title="보이는 매크로가 없습니다" description="설정의 매크로 탭에서 켤 수 있습니다." />
      ) : (
        <Stack gap="lg">
          {sections.map((section) => (
            <Stack key={section.name ?? "loose"} gap="sm">
              {section.name ? <Text as="h3" variant="label" strong={false} ink="tertiary">{section.name}</Text> : null}
              <Inline gap="sm" wrap>{section.macros.map((macro) => <MacroButton key={macro.name} macro={macro} />)}</Inline>
            </Stack>
          ))}
        </Stack>
      )}
    </Panel>
  );
};
