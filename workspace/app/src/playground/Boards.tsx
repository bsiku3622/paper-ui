// The Overview's boards, one for every Atom that has a size. On the start, every value of the Atom's main axis down the side and
// every size along the top; on the end, the controls that move the rest, the state it is drawn in first. A drawing is the Atom's
// own Playground subject (registry/entries), so a board shows what the Atom's page shows and follows its props when they change.
// A state a pointer or a key would hold is drawn by its preview (tokens/state.ts), and disabled by the prop; with every state laid
// out, the sheet repeats once per state. Every drawing is live: the pointer and the keyboard reach it as on a screen, a mark turns
// on and off, and each control is named by its place in the sheet.

import { Fragment, cloneElement, useState, type ReactElement } from "react";
import { Link as RouterLink } from "react-router-dom";

import { Box, Checkbox, Inline, Link, Radio, SegmentControl, Stack, Surface, Switch, Text } from "@studio-baeks/paper-ui";
import { CONTROL_SIZES, previewAttributes, tokens, type ChoiceStatus, type ControlShape, type ControlSize, type PreviewState, type SegmentVariant } from "@studio-baeks/paper-ui/tokens";

import { joinClass } from "../joinClass";
import { ControlRow } from "./ControlRow";
import { px } from "./foundations/kit";
import { axisValues } from "./Reference";
import { entryBySlug, initialState, normalized, type Entry, type State } from "./registry";
import { flag, pick } from "./registry/schema";
import * as b from "./boards.css";

// The states a board can draw: at rest, the three a preview shows, and disabled, which is the prop.
export type BoardState = "rest" | PreviewState | "disabled";
export const STATE_LABELS: Record<BoardState, string> = { rest: "기본", hover: "hover", active: "눌림", focus: "포커스", disabled: "꺼짐" };

type Row = { key: string; label: string; isDefault?: boolean; state: State };
// One drawing's props, the preview it is drawn in, and its name: the board, the row and the size.
type Cell = { state: State; preview?: PreviewState; name: string };
type BoardSpec = {
  slug: string;
  // The axis down the side: one of the entry's selects or switches, or rows of its own when one row takes more than one prop.
  rows: string | readonly Row[];
  // The states this Atom has, in the order of the docs' state table. A mark has no hover; a Badge and a Spinner have none.
  states: readonly BoardState[];
  // The entry's controls the panel offers, by key.
  axes: readonly string[];
  // What every drawing holds besides: a label left out, a shorter textarea.
  base?: State;
  // A width for a drawing that fills what it is given.
  width?: string;
  // The subject's root takes the cell's name as its own: an input with no words of its own to be named by.
  named?: true;
  // A drawing of its own: a mark the pointer turns on and off, or an Atom whose state lives on one of its parts.
  draw?: (cell: Cell) => ReactElement;
  // The drawing puts the preview on the part that holds the state, instead of the cell holding it for the whole drawing.
  previewsParts?: true;
  // The sizes run down the side and the axis along the top: an Atom too wide for five of it side by side.
  sizesDown?: true;
};

const INTERACTIVE: readonly BoardState[] = ["rest", "hover", "active", "focus", "disabled"];
const INPUT: readonly BoardState[] = ["rest", "hover", "focus", "disabled"];
// A mark answers no hover: its label and its row do.
const MARK: readonly BoardState[] = ["rest", "active", "focus", "disabled"];
const MARK_ROWS = (indeterminate: boolean): readonly Row[] => [
  { key: "off", label: "off", state: { checked: false } },
  { key: "on", label: "on", state: { checked: true } },
  ...(indeterminate ? [{ key: "indeterminate", label: "indeterminate", state: { checked: false, indeterminate: true } }] : []),
];

// The page's subject holds a mark to its value; a drawing here starts from the row's value and then answers the pointer.
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

// A segment control's states live on its items: the pointer is over the item that is not chosen, and the keyboard is on the chosen
// one. A preview of the whole control would light every item at once.
const drawSegments = ({ state, preview, name }: Cell) => {
  const on = (item: "pointer" | "keyboard") => (preview === "hover" && item === "pointer") || (preview === "focus" && item === "keyboard") ? previewAttributes(preview) : {};
  return (
    <SegmentControl aria-label={name} defaultValue="7d" variant={pick<SegmentVariant>(state, "variant")} size={pick<ControlSize>(state, "size")} shape={pick<ControlShape>(state, "shape")} disabled={flag(state, "disabled")}>
      <SegmentControl.Item value="1d" {...on("pointer")}>1일</SegmentControl.Item>
      <SegmentControl.Item value="7d" {...on("keyboard")}>7일</SegmentControl.Item>
      <SegmentControl.Item value="1m">1달</SegmentControl.Item>
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

// The head of a size: its name, and the height it stands to.
const SizeHead = ({ size, className }: { size: ControlSize; className: string }) => (
  <span className={className}>
    <Text variant="caption" family="mono" ink="secondary">{size}</Text>
    <Text variant="caption" family="mono" ink="tertiary">{px(tokens.shape.control.height[size])}</Text>
  </span>
);

// The head of a value of the axis: its name, and under it whether it is the default.
const ValueHead = ({ row, className }: { row: Row; className: string }) => (
  <span className={className}>
    <Text variant="caption" family="mono" ink="secondary">{row.label}</Text>
    {row.isDefault ? <Text variant="caption" family="mono" ink="tertiary">default</Text> : null}
  </span>
);

const AtomBoard = ({ entry, board }: { entry: Entry; board: BoardSpec }) => {
  const harness = entry.useHarness();
  const [values, setValues] = useState<State>(() => normalized(entry, { ...initialState(entry), ...board.base }));
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
    const name = `${entry.name} ${row.key} ${size}${all && group ? ` ${STATE_LABELS[group]}` : ""}`;
    const subject = board.draw ? board.draw({ state: held, preview, name }) : entry.subject(held, harness);
    const drawing = board.named ? cloneElement(subject as ReactElement<{ "aria-label"?: string }>, { "aria-label": name }) : subject;
    // A pointer that presses is over what it presses, so a press is drawn with the hover under it.
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
            <Text variant="caption" as="span" ink="inherit">{`${entry.name} 쪽에서 만지기`}</Text>
          </Link>
        </Inline>
        <div className={b.scroller}>
          {(groups.length > 0 ? groups : [undefined]).map((group) => (
            <Fragment key={group ?? "rest"}>
              {all && group ? <Text className={b.groupHead} variant="label" ink="secondary">{STATE_LABELS[group]}</Text> : null}
              {/* One order of children serves both ways round: the sizes' heads, then each value's head and its drawings. Sizes along
                  the top fill it row by row; sizes down the side fill it column by column. */}
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
            <Text variant="label">상태</Text>
            <SegmentControl aria-label={`${entry.name} 상태`} variant="outline" shape="rounded" size="sm" fullWidth value={state} onValueChange={(next) => setState(next as BoardState)} disabled={all}>
              {board.states.map((option) => <SegmentControl.Item key={option} value={option}>{STATE_LABELS[option]}</SegmentControl.Item>)}
            </SegmentControl>
            <Inline as="label" justify="between" align="center" gap="sm">
              <Text variant="label" as="span">모든 상태 펼치기</Text>
              <Switch checked={all} onChange={(event) => setAll(event.currentTarget.checked)} />
            </Inline>
          </Stack>
        ) : (
          <Text variant="caption" ink="secondary">{`${entry.name}는 표시용이라 상태가 없습니다.`}</Text>
        )}
        {axes.map((control) => (
          <ControlRow key={control.key} control={control} value={values[control.key]} defaults={entry.defaults} onChange={(next) => setValues((current) => normalized(entry, { ...current, [control.key]: next }))} />
        ))}
      </div>
    </Surface>
  );
};

export const Boards = () => (
  <>
    {BOARDS.map((board) => {
      const entry = entryBySlug(board.slug);
      if (!entry) throw new Error(`The Overview has a board for ${board.slug}, which is not in the registry.`);
      return <AtomBoard key={board.slug} entry={entry} board={board} />;
    })}
  </>
);
