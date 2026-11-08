import { Fragment, cloneElement, useState, type ReactElement } from "react";
import { Link as RouterLink } from "react-router-dom";

import { Box, Checkbox, Inline, Link, Radio, SegmentControl, Stack, Surface, Switch, Text } from "@studio-baeks/paper-ui";
import { CONTROL_SIZES, previewAttributes, tokens, type ChoiceStatus, type ControlShape, type ControlSize, type PreviewState, type SegmentVariant } from "@studio-baeks/paper-ui/tokens";

import { joinClass } from "../joinClass";
import { ControlRow } from "./ControlRow";
import { pick as inLocale, useSiteLocale, useWords, type Bilingual, type SiteLocale } from "../site/locale";
import { px } from "./foundations/kit";
import { axisValues } from "./Reference";
import { entryBySlug, initialState, normalized, type Entry, type State } from "./registry";
import { flag, pick } from "./registry/schema";
import * as b from "./boards.css";

export type BoardState = "rest" | PreviewState | "disabled";
export const STATE_LABELS: Record<BoardState, Bilingual> = {
  rest: { ko: "기본", en: "Rest" },
  hover: { ko: "hover", en: "hover" },
  active: { ko: "눌림", en: "Pressed" },
  focus: { ko: "포커스", en: "Focus" },
  disabled: { ko: "꺼짐", en: "Disabled" },
};

const BOARD_WORDS = {
  ko: {
    touch: (name: string) => `${name} 쪽에서 만지기`,
    state: "상태",
    stateOf: (name: string) => `${name} 상태`,
    spread: "모든 상태 펼치기",
    stateless: (name: string) => `${name}는 표시용이라 상태가 없습니다.`,
  },
  en: {
    touch: (name: string) => `Try it on the ${name} page`,
    state: "State",
    stateOf: (name: string) => `${name} state`,
    spread: "Spread all states",
    stateless: (name: string) => `${name} is for display and has no states.`,
  },
} as const;

const PERIODS: Bilingual<readonly [string, string, string]> = { ko: ["1일", "7일", "1달"], en: ["1 day", "7 days", "1 month"] };

type Row = { key: string; label: string; isDefault?: boolean; state: State };
type Cell = { state: State; preview?: PreviewState; name: string; locale: SiteLocale };
type BoardSpec = {
  slug: string;
  rows: string | readonly Row[];
  states: readonly BoardState[];
  axes: readonly string[];
  base?: State;
  width?: string;
  named?: true;
  draw?: (cell: Cell) => ReactElement;
  previewsParts?: true;
  sizesDown?: true;
};

const INTERACTIVE: readonly BoardState[] = ["rest", "hover", "active", "focus", "disabled"];
const INPUT: readonly BoardState[] = ["rest", "hover", "focus", "disabled"];
const MARK: readonly BoardState[] = ["rest", "active", "focus", "disabled"];
const MARK_ROWS = (indeterminate: boolean): readonly Row[] => [
  { key: "off", label: "off", state: { checked: false } },
  { key: "on", label: "on", state: { checked: true } },
  ...(indeterminate ? [{ key: "indeterminate", label: "indeterminate", state: { checked: false, indeterminate: true } }] : []),
];

const markProps = ({ state, name }: Cell) => ({
  defaultChecked: flag(state, "checked"),
  status: pick<ChoiceStatus>(state, "status"),
  size: pick<ControlSize>(state, "size"),
  disabled: flag(state, "disabled"),
  "aria-label": name,
});
const drawCheckbox = (cell: Cell) => <Checkbox {...markProps(cell)} indeterminate={flag(cell.state, "indeterminate")} />;
const drawRadio = (cell: Cell) => <Radio {...markProps(cell)} />;
const drawSwitch = (cell: Cell) => <Switch {...markProps(cell)} />;

const drawSegments = ({ state, preview, name, locale }: Cell) => {
  const [day, week, month] = inLocale(PERIODS, locale);
  const on = (item: "pointer" | "keyboard") => (preview === "hover" && item === "pointer") || (preview === "focus" && item === "keyboard") ? previewAttributes(preview) : {};
  return (
    <SegmentControl aria-label={name} defaultValue="7d" variant={pick<SegmentVariant>(state, "variant")} size={pick<ControlSize>(state, "size")} shape={pick<ControlShape>(state, "shape")} disabled={flag(state, "disabled")}>
      <SegmentControl.Item value="1d" {...on("pointer")}>{day}</SegmentControl.Item>
      <SegmentControl.Item value="7d" {...on("keyboard")}>{week}</SegmentControl.Item>
      <SegmentControl.Item value="1m">{month}</SegmentControl.Item>
    </SegmentControl>
  );
};

export const BOARDS: readonly BoardSpec[] = [
  { slug: "button", rows: "variant", states: INTERACTIVE, axes: ["accent", "shape", "fill", "shadow", "selected", "loading"] },
  { slug: "icon-button", rows: "variant", states: INTERACTIVE, axes: ["accent", "shape", "fill", "shadow"] },
  { slug: "badge", rows: "variant", states: [], axes: ["accent", "shape", "fill", "shadow", "dot"] },
  { slug: "field", rows: "variant", states: INPUT, axes: ["status", "shape", "fill", "shadow", "leading"], width: "6rem", named: true },
  { slug: "select", rows: "variant", states: INPUT, axes: ["status", "shape", "fill", "shadow"], width: "6rem", named: true },
  { slug: "textarea", rows: "variant", states: INPUT, axes: ["status", "fill", "shadow"], base: { rows: "2" }, width: "6rem", named: true },
  { slug: "checkbox", rows: MARK_ROWS(true), states: MARK, axes: ["status"], draw: drawCheckbox },
  { slug: "radio", rows: MARK_ROWS(false), states: MARK, axes: ["status"], draw: drawRadio },
  { slug: "switch", rows: MARK_ROWS(false), states: MARK, axes: ["status"], draw: drawSwitch },
  { slug: "segment-control", rows: "variant", states: INPUT, axes: ["shape"], draw: drawSegments, previewsParts: true, sizesDown: true },
  { slug: "slider", rows: "status", states: ["rest", "focus", "disabled"], axes: [], width: "6.5rem", named: true },
  { slug: "spinner", rows: [{ key: "ring", label: "ring", state: {} }], states: [], axes: [] },
];

const rowsOf = (entry: Entry, board: BoardSpec): readonly Row[] =>
  typeof board.rows === "string"
    ? axisValues(entry, board.rows).map((value) => {
        const key = String(value.value ?? "none");
        return { key, label: key, isDefault: value.label !== key, state: { [board.rows as string]: value.value } };
      })
    : board.rows;

const SizeHead = ({ size, className }: { size: ControlSize; className: string }) => (
  <span className={className}>
    <Text variant="caption" family="mono" ink="secondary">{size}</Text>
    <Text variant="caption" family="mono" ink="tertiary">{px(tokens.shape.control.height[size])}</Text>
  </span>
);

const ValueHead = ({ row, className }: { row: Row; className: string }) => (
  <span className={className}>
    <Text variant="caption" family="mono" ink="secondary">{row.label}</Text>
    {row.isDefault ? <Text variant="caption" family="mono" ink="tertiary">default</Text> : null}
  </span>
);

const AtomBoard = ({ entry, board }: { entry: Entry; board: BoardSpec }) => {
  const { locale } = useSiteLocale();
  const w = useWords(BOARD_WORDS);
  const harness = entry.useHarness();
  const [values, setValues] = useState<State>(() => normalized(entry, { ...initialState(entry, locale), ...board.base }));
  const [state, setState] = useState<BoardState>("rest");
  const [all, setAll] = useState(false);
  const rows = rowsOf(entry, board);
  const axes = board.axes.map((key) => {
    const control = entry.controls.find((candidate) => candidate.key === key);
    if (!control) throw new Error(`The ${entry.name} board offers ${key}, which is not one of its controls.`);
    return control;
  });
  const groups = all ? board.states : [state];
  const rowsName = typeof board.rows === "string" ? board.rows : rows.map((row) => row.key).join(" · ");

  const draw = (group: BoardState | undefined, row: Row, size: ControlSize) => {
    const preview = group === "hover" || group === "active" || group === "focus" ? group : undefined;
    const held = normalized(entry, { ...values, ...row.state, size, ...(group === "disabled" ? { disabled: true } : {}) });
    const name = `${entry.name} ${row.key} ${size}${all && group ? ` ${inLocale(STATE_LABELS[group], locale)}` : ""}`;
    const subject = board.draw ? board.draw({ state: held, preview, name, locale }) : entry.subject(held, harness, locale);
    const drawing = board.named ? cloneElement(subject as ReactElement<{ "aria-label"?: string }>, { "aria-label": name }) : subject;
    const previewed = preview === "active" ? previewAttributes("hover", "active") : preview ? previewAttributes(preview) : {};
    return (
      <div className={b.cell} data-cell={`${group ?? "rest"} ${row.key} ${size}`} {...(board.previewsParts ? {} : previewed)}>
        {board.width ? <Box width={board.width}>{drawing}</Box> : drawing}
      </div>
    );
  };

  return (
    <Surface as="article" fill="raised" radius="lg" shadow className={b.board} aria-labelledby={`board-${entry.slug}`} data-testid={`board-${entry.slug}`}>
      <div className={b.sheet}>
        <Inline justify="between" align="baseline" gap="md" wrap>
          <Stack gap="xs">
            <Text variant="subheading" as="h3" id={`board-${entry.slug}`}>{entry.name}</Text>
            <Text variant="caption" family="mono" ink="secondary">{`${rowsName} × size`}</Text>
          </Stack>
          <Link as={RouterLink} to={`/playground/${entry.slug}`} underline="hover">
            <Text variant="caption" as="span" ink="inherit">{w.touch(entry.name)}</Text>
          </Link>
        </Inline>
        <div className={b.scroller}>
          {(groups.length > 0 ? groups : [undefined]).map((group) => (
            <Fragment key={group ?? "rest"}>
              {all && group ? <Text className={b.groupHead} variant="label" ink="secondary">{inLocale(STATE_LABELS[group], locale)}</Text> : null}
              <div className={joinClass(b.matrix, board.sizesDown ? b.sizesDown : b.sizesAcross)} data-board-sheet={group ?? "rest"}>
                <span />
                {CONTROL_SIZES.map((size) => <SizeHead key={size} size={size} className={board.sizesDown ? b.rowHead : b.columnHead} />)}
                {rows.map((row) => (
                  <Fragment key={row.key}>
                    <ValueHead row={row} className={board.sizesDown ? b.columnHead : b.rowHead} />
                    {CONTROL_SIZES.map((size) => <Fragment key={size}>{draw(group, row, size)}</Fragment>)}
                  </Fragment>
                ))}
              </div>
            </Fragment>
          ))}
        </div>
      </div>
      <div className={b.panel}>
        {board.states.length > 0 ? (
          <Stack gap="xs">
            <Text variant="label">{w.state}</Text>
            <SegmentControl aria-label={w.stateOf(entry.name)} variant="outline" shape="rounded" size="sm" fullWidth value={state} onValueChange={(next) => setState(next as BoardState)} disabled={all}>
              {board.states.map((option) => <SegmentControl.Item key={option} value={option}>{inLocale(STATE_LABELS[option], locale)}</SegmentControl.Item>)}
            </SegmentControl>
            <Inline as="label" justify="between" align="center" gap="sm">
              <Text variant="label" as="span">{w.spread}</Text>
              <Switch checked={all} onChange={(event) => setAll(event.currentTarget.checked)} />
            </Inline>
          </Stack>
        ) : (
          <Text variant="caption" ink="secondary">{w.stateless(entry.name)}</Text>
        )}
        {axes.map((control) => (
          <ControlRow key={control.key} control={control} value={values[control.key]} defaults={entry.defaults} onChange={(next) => setValues((current) => normalized(entry, { ...current, [control.key]: next }))} />
        ))}
      </div>
    </Surface>
  );
};

export const Boards = () => {
  const { locale } = useSiteLocale();
  return (
  <>
    {BOARDS.map((board) => {
      const entry = entryBySlug(board.slug);
      if (!entry) throw new Error(`The Overview has a board for ${board.slug}, which is not in the registry.`);
      return <AtomBoard key={`${board.slug}:${locale}`} entry={entry} board={board} />;
    })}
  </>
  );
};
