// 변경: everything that was turned, what it was and what it is, and a way out — as JSON, and as code to paste where it belongs. What was
// turned is kept in this browser, so it is still here after a reload.

import { useEffect, useMemo, useRef, useState } from "react";

import { Button, Divider, IconButton, Inline, Stack, Text, Textarea } from "@studio-baeks/paper-ui";

import { ArrowRightIcon, UndoIcon } from "../../compositions/icons";
import { getCatalog } from "./catalog";
import { Chip } from "./chip";
import { stepName } from "./controls";
import { exportCode, exportJson } from "./export";
import type { LabSpec } from "./protocol";
import { resetAll, resetEdits, resetLevers, resetPart, resetParts, setLever, tokensOf, useStore } from "./store";
import * as s from "./studio.css";

const MODE_NAMES = { light: "라이트", dark: "다크" } as const;

const copy = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

// The levers that are not at the page's own setting, as "name: setting".
const leverNotes = (lab: LabSpec | undefined, levers: Readonly<Record<string, string | boolean>>): { key: string; text: string }[] => {
  if (!lab) return Object.entries(levers).map(([key, value]) => ({ key, text: `${key}: ${String(value)}` }));
  return lab.levers.flatMap((lever) => {
    const value = levers[lever.key];
    if (value === undefined || value === lab.defaults[lever.key]) return [];
    const option = lever.options?.find((one) => one.value === value)?.label;
    return [{ key: lever.key, text: `${lever.label}: ${option ?? (value === true ? "켬" : String(value))}` }];
  });
};

export const ChangesPanel = () => {
  const levers = useStore((store) => store.levers);
  const edits = useStore((store) => store.edits);
  const parts = useStore((store) => store.parts);
  const sites = useStore((store) => store.sites);
  const lab = useStore((store) => Object.values(store.frames).find((frame) => frame.lab)?.lab);
  const catalog = useMemo(getCatalog, []);
  const [done, setDone] = useState<"json" | "code" | null>(null);
  const [sure, setSure] = useState(false);
  const timer = useRef(0);

  const notes = leverNotes(lab, levers);
  const values = Object.entries(edits).flatMap(([id, value]) => {
    const found = catalog.slots.get(id);
    return found ? [{ id, ...found, value }] : [];
  });
  const json = useMemo(() => exportJson({ levers, tokens: tokensOf(edits), edits, parts, sites }), [levers, edits, parts, sites]);
  const code = exportCode({ levers, tokens: tokensOf(edits), edits, parts, sites }, notes.map((note) => note.text));
  const url = useMemo(() => URL.createObjectURL(new Blob([json], { type: "application/json" })), [json]);
  useEffect(() => () => URL.revokeObjectURL(url), [url]);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const partCount = Object.values(parts).reduce((sum, props) => sum + Object.keys(props).length, 0);
  const total = notes.length + values.length + partCount;

  const finish = (which: "json" | "code") => {
    setDone(which);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setDone(null), 1800);
  };

  if (total === 0) return <Text as="p" ink="tertiary">아직 바꾼 것이 없습니다. 시안을 고르거나 값을 고치거나 요소를 골라 보세요. 바꾼 것은 이 브라우저에 남습니다.</Text>;

  return (
    <Stack gap="md">
      <Inline gap="sm" wrap>
        <Button size="sm" variant="hairline" onClick={async () => { if (await copy(json)) finish("json"); }}>{done === "json" ? "복사했습니다" : "JSON 복사"}</Button>
        <Button as="a" size="sm" variant="hairline" href={url} download="paper-studio.json">JSON 내려받기</Button>
        <Button size="sm" variant="hairline" onClick={async () => { if (await copy(code)) finish("code"); }}>{done === "code" ? "복사했습니다" : "코드 복사"}</Button>
      </Inline>

      {notes.length > 0 ? (
        <Stack gap="xs">
          <Inline justify="between" align="center">
            <Text as="span" variant="label" ink="tertiary">시안 {notes.length}</Text>
            <Button size="xs" variant="ghost" onClick={resetLevers}>되돌리기</Button>
          </Inline>
          {notes.map((note) => (
            <Inline key={note.key} justify="between" align="center" gap="sm">
              <Text as="span" variant="caption">{note.text}</Text>
              <IconButton size="xs" variant="ghost" aria-label={`${note.text} 되돌리기`} onClick={() => setLever(note.key, lab?.defaults[note.key] ?? false)}>
                <UndoIcon />
              </IconButton>
            </Inline>
          ))}
        </Stack>
      ) : null}

      {values.length > 0 ? (
        <Stack gap="xs">
          <Divider />
          <Inline justify="between" align="center">
            <Text as="span" variant="label" ink="tertiary">값 {values.length}</Text>
            <Button size="xs" variant="ghost" onClick={() => resetEdits()}>되돌리기</Button>
          </Inline>
          {values.map(({ id, item, slot, value }) => (
            <Inline key={id} justify="between" align="center" gap="sm">
              <Stack minWidth={0}>
                <Text as="span" variant="caption" truncate>{item.label}{slot.mode ? ` · ${MODE_NAMES[slot.mode]}` : ""}</Text>
                <Text as="span" variant="label" strong={false} ink="tertiary" family="mono" truncate>{item.hint}</Text>
              </Stack>
              <Inline gap="xs" align="center">
                {item.kind === "color" ? (
                  <>
                    <Chip color={slot.original} label={`원래 ${stepName(slot.original)}`} />
                    <ArrowRightIcon size="label" ink="tertiary" />
                    <Chip color={value} label={`지금 ${stepName(value)}`} />
                    <Text as="span" variant="label" strong={false} ink="secondary" family="mono">{stepName(value)}</Text>
                  </>
                ) : (
                  <Inline gap="xs" align="center">
                    <Text as="span" variant="label" strong={false} ink="tertiary" family="mono" numeric>{slot.original}</Text>
                    <ArrowRightIcon size="label" ink="tertiary" />
                    <Text as="span" variant="label" strong={false} ink="secondary" family="mono" numeric>{value}</Text>
                  </Inline>
                )}
                <IconButton size="xs" variant="ghost" aria-label={`${item.label} 되돌리기`} onClick={() => resetEdits([id])}>
                  <UndoIcon />
                </IconButton>
              </Inline>
            </Inline>
          ))}
        </Stack>
      ) : null}

      {partCount > 0 ? (
        <Stack gap="xs">
          <Divider />
          <Inline justify="between" align="center">
            <Text as="span" variant="label" ink="tertiary">요소 {Object.keys(parts).length}</Text>
            <Button size="xs" variant="ghost" onClick={resetParts}>되돌리기</Button>
          </Inline>
          {Object.entries(parts).map(([key, props]) => {
            const site = sites[key];
            return (
              <Inline key={key} justify="between" align="center" gap="sm">
                <Stack minWidth={0}>
                  <Text as="span" variant="caption" truncate>{site?.component ?? key}</Text>
                  <Text as="span" variant="label" strong={false} ink="tertiary" family="mono" truncate>{site ? `${site.file}:${site.line}` : key}</Text>
                  <Text as="span" variant="label" strong={false} ink="secondary" truncate>{Object.entries(props).map(([prop, value]) => `${prop}=${value === null ? "빼기" : String(value)}`).join(" · ")}</Text>
                </Stack>
                <IconButton size="xs" variant="ghost" aria-label={`${site?.component ?? key} 되돌리기`} onClick={() => resetPart(key)}>
                  <UndoIcon />
                </IconButton>
              </Inline>
            );
          })}
        </Stack>
      ) : null}

      <Divider />
      <Stack gap="xs">
        <Text as="span" variant="label" ink="tertiary">코드</Text>
        <Textarea readOnly rows={12} className={s.codeField} aria-label="내보낼 코드" value={code} onFocus={(event) => event.currentTarget.select()} />
      </Stack>
      <Inline justify="end">
        {sure ? (
          <Inline gap="xs">
            <Button size="sm" variant="ghost" onClick={() => setSure(false)}>그만두기</Button>
            <Button size="sm" variant="solid" accent="error" onClick={() => { resetAll(); setSure(false); }}>전부 되돌립니다</Button>
          </Inline>
        ) : (
          <Button size="sm" variant="hairline" onClick={() => setSure(true)}>전부 되돌리기</Button>
        )}
      </Inline>
    </Stack>
  );
};
