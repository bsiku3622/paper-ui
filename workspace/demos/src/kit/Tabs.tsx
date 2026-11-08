// Tabs — sections of one page ("점검 결과 · 접근 · 감사 기록"), in one of two looks:
//
//   pill       ghost buttons, the chosen one on the selection face (the default)
//   underline  words on one hairline, the chosen one in ink with a stroke under it
//
// Segmented is its own part, for a switch between views of the same thing ("목록 · 격자", "주 · 월"): Paper's SegmentControl.
// Both are groups the arrow keys move through, and the choice follows focus.

import { useId, useState, type ReactNode } from "react";

import { Box, Button, Grid, Inline, SegmentControl, SelectableGroup, Stack, Text } from "@studio-baeks/paper-ui";
import type { ControlSize } from "@studio-baeks/paper-ui/tokens";

import { Glyph, type GlyphName } from "./Glyph";
import { underlineList, underlineTab } from "./kit.css";

export type TabsLook = "pill" | "underline";

export type TabItem = {
  id: string;
  label: ReactNode;
  count?: number | string;
  glyph?: GlyphName;
  // What the tab shows. Leave it out when the app draws the panel itself (from `value`).
  panel?: ReactNode;
  disabled?: boolean;
};

export type TabsProps = {
  label: string;
  items: readonly TabItem[];
  value?: string;
  defaultValue?: string;
  onChange?: (id: string) => void;
  // Every tab takes the same share of the width.
  stretch?: boolean;
  size?: Extract<ControlSize, "sm" | "md">;
  look?: TabsLook;
};

const useChoice = (items: readonly { id: string }[], value: string | undefined, defaultValue: string | undefined, onChange?: (id: string) => void) => {
  const [own, setOwn] = useState(defaultValue ?? items[0]?.id ?? "");
  const chosen = value ?? own;
  const choose = (next: string) => {
    if (value === undefined) setOwn(next);
    onChange?.(next);
  };
  return [chosen, choose] as const;
};

export const Tabs = ({ label, items, value, defaultValue, onChange, stretch = false, size = "md", look = "pill" }: TabsProps) => {
  const base = useId();
  const [chosen, choose] = useChoice(items, value, defaultValue, onChange);
  const group = {
    role: "tablist",
    "aria-label": label,
    selectedValues: [chosen],
    selectionRequired: true,
    onSelectedValuesChange: ([next]: string[]) => { if (next) choose(next); },
    currentValue: chosen,
    onCurrentValueChange: choose,
  };
  const className = look === "underline" ? underlineTab : undefined;
  const buttons = items.map((tab) => (
    <Button
      key={tab.id}
      as={SelectableGroup.Item}
      value={tab.id}
      role="tab"
      id={`${base}-tab-${tab.id}`}
      aria-controls={tab.panel !== undefined ? `${base}-panel-${tab.id}` : undefined}
      disabled={tab.disabled}
      variant="ghost"
      size={size}
      fullWidth={stretch}
      className={className}
    >
      {tab.glyph ? <Glyph name={tab.glyph} /> : null}
      {tab.label}
      {tab.count !== undefined ? <Text as="span" variant="label" strong={false} ink="tertiary" numeric>{tab.count}</Text> : null}
    </Button>
  ));
  // Underline tabs have no face, so the space between them is the only thing that tells them apart.
  const gap = look === "underline" ? "xl" : "xs";
  const list = stretch
    ? <SelectableGroup as={Grid} columns={items.length} gap={gap} {...group}>{buttons}</SelectableGroup>
    : <SelectableGroup as={Inline} gap={gap} {...group}>{buttons}</SelectableGroup>;
  const framed = look === "underline" ? <Box className={underlineList}>{list}</Box> : list;
  const panels = items.filter((tab) => tab.panel !== undefined);
  if (panels.length === 0) return framed;
  return (
    <Stack gap="lg">
      {framed}
      {panels.map((tab) => (
        <Box key={tab.id} role="tabpanel" id={`${base}-panel-${tab.id}`} aria-labelledby={`${base}-tab-${tab.id}`} hidden={tab.id !== chosen}>
          {tab.panel}
        </Box>
      ))}
    </Stack>
  );
};

export type SegmentOption = { id: string; label: ReactNode; glyph?: GlyphName; count?: number | string };

// A switch between views.
export const Segmented = ({ label, options, value, defaultValue, onChange, size = "sm", stretch = false }: {
  label: string;
  options: readonly SegmentOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (id: string) => void;
  size?: Extract<ControlSize, "xs" | "sm" | "md">;
  stretch?: boolean;
}) => (
  <SegmentControl aria-label={label} size={size} fullWidth={stretch} value={value} defaultValue={defaultValue ?? options[0]?.id} onValueChange={onChange}>
    {options.map((option) => (
      <SegmentControl.Item key={option.id} value={option.id}>
        {option.glyph ? <Glyph name={option.glyph} /> : null}
        {option.label}
        {option.count !== undefined ? <Text as="span" variant="label" strong={false} ink="tertiary" numeric>{option.count}</Text> : null}
      </SegmentControl.Item>
    ))}
  </SegmentControl>
);
