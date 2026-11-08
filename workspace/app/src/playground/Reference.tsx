// The references under an Atom's code. The Props table names each prop the page moves, with its type and its default; the sheet
// draws every value of the axes the entry chose, crossed and one at a time, on the preview's ground. Both read the registry, so a
// value added to a vocabulary shows here without an edit. The sheet is a picture: nothing in it takes focus or a press, and
// assistive technology skips it.

import { Fragment } from "react";
import { Link as RouterLink } from "react-router-dom";

import { Link, Stack, Surface, Text } from "@studio-baeks/paper-ui";
import type { SurfaceFill } from "@studio-baeks/paper-ui/tokens";

import { joinClass } from "../joinClass";
import { pick as inLocale, useSiteLocale, useWords, type SiteLocale } from "../site/locale";
import { SectionHeading } from "../site/SectionHeading";
import { previewStageTrack } from "./detail.css";
import { Board, BoardRow, Cell, TokenCell, ValueCell } from "./foundations/kit";
import { initialState, normalized, type Control, type Entry, type SheetAxis, type State } from "./registry";
import * as r from "./reference.css";

// A default is named on its own value, as the Props panel names it: "solid (default)".
export const DEFAULT_MARK = " (default)";

// The example a switch puts in a slot: "leading" holds a search icon.
const exampleOf = (control: Control, locale: SiteLocale): string | undefined => (control.example ? inLocale(control.example, locale) : undefined);

const REFERENCE_WORDS = {
  ko: {
    props: "Props 표",
    note: "이 쪽에서 만지는 prop입니다. native 속성과 이벤트 처리기까지 모두 적은 목록은 ",
    atomsDocs: "Atoms 문서",
    noteEnd: "에 있습니다.",
    type: "타입",
    default: "기본값",
    example: (example: string) => `예: ${example}`,
    all: "모든 조합",
  },
  en: {
    props: "Props table",
    note: "The props this page moves. The full list, with native attributes and event handlers, is in the ",
    atomsDocs: "Atoms docs",
    noteEnd: ".",
    type: "Type",
    default: "Default",
    example: (example: string) => `e.g. ${example}`,
    all: "All combinations",
  },
} as const;

// A select of "true" and "false" is a boolean with three answers: left out, the component decides.
const isAnswer = (control: Control) => control.kind === "enum" && control.options.length === 2 && control.options.includes("true") && control.options.includes("false");

const typeOf = (control: Control): string => {
  if (control.type) return control.type;
  if (control.kind === "bool" || isAnswer(control)) return "boolean";
  if (control.kind === "text") return control.bind === "children" ? "ReactNode" : "string";
  // A sample shows some values of an open type; the others are as good.
  return `${control.options.join(" · ")}${control.source.kind === "sample" ? " …" : ""}`;
};

const restingOf = (control: Control, defaults: Readonly<Record<string, unknown>>): string => {
  const own = defaults[control.prop];
  if (own !== undefined) return String(own);
  if (control.kind === "bool") return control.type ? "—" : "false";
  if (control.kind === "enum") return control.rootDefault ?? control.omitted ?? "—";
  return "—";
};

export const PropsTable = ({ entry }: { entry: Entry }) => {
  const { locale } = useSiteLocale();
  const w = useWords(REFERENCE_WORDS);
  // A control that sets a prop of another element (a label's words) is the demo's, not the component's.
  const own = entry.controls.filter((control, index, all) => control.target === undefined && all.findIndex((other) => other.target === undefined && other.prop === control.prop) === index);
  return (
    <Stack as="section" gap="sm">
      <Stack gap="xs">
        <SectionHeading title={w.props} variant="label" />
        <Text variant="caption" ink="secondary">
          {w.note}<Link as={RouterLink} to="/docs/atoms">{w.atomsDocs}</Link>{w.noteEnd}
        </Text>
      </Stack>
      <Board columns={[{ label: "Prop", track: "minmax(8rem, 1fr)" }, { label: w.type, track: "minmax(0, 2fr)" }, { label: w.default, track: "max-content", align: "end" }]}>
        {own.map((control) => {
          const example = exampleOf(control, locale);
          return (
            <BoardRow key={control.key} size="md">
              <TokenCell name={control.prop} note={example === undefined ? undefined : w.example(example)} />
              <Cell><Text variant="caption" family="mono" ink="secondary">{typeOf(control)}</Text></Cell>
              <ValueCell>{restingOf(control, entry.defaults)}</ValueCell>
            </BoardRow>
          );
        })}
      </Board>
    </Stack>
  );
};

type AxisValue = { value: string | boolean | undefined; label: string };

// Every value an axis takes, the default named on its own. The omission comes first when no value of the axis says it.
export const axisValues = (entry: Entry, key: string): AxisValue[] => {
  const control = entry.controls.find((candidate) => candidate.key === key);
  if (!control || control.kind === "text") throw new Error(`${entry.name}'s sheet names ${key}, which is not one of its selects or switches.`);
  const own = entry.defaults[control.prop];
  if (control.kind === "bool") return [false, true].map((value) => ({ value, label: `${value}${value === (own === true) ? DEFAULT_MARK : ""}` }));
  const resting = own === undefined ? control.rootDefault : String(own);
  const restingChoice = resting !== undefined && control.options.includes(resting);
  const values = control.options.map((option) => ({ value: option, label: `${control.labels?.[option] ?? option}${restingChoice && option === resting ? DEFAULT_MARK : ""}` }));
  return control.required || restingChoice ? values : [{ value: undefined, label: `${control.omitted ?? "none"}${DEFAULT_MARK}` }, ...values];
};

const stripTitle = (axis: SheetAxis) => {
  const held = Object.entries(axis.with ?? {}).map(([key, value]) => `${key}="${String(value)}"`);
  return held.length === 0 ? axis.key : `${axis.key} · ${held.join(" ")}`;
};

export type SheetGround = SurfaceFill | "track";

export const VariantSheet = ({ entry, harness, ground }: { entry: Entry; harness: unknown; ground: SheetGround }) => {
  const { locale } = useSiteLocale();
  const w = useWords(REFERENCE_WORDS);
  const { sheet, Stage } = entry;
  if (!sheet) return null;
  const base = normalized(entry, initialState(entry, locale));
  // Each drawing is the page's subject in the first view with the cell's values, in the same stage as the preview.
  const draw = (values: State) => {
    const state = normalized(entry, { ...base, ...values });
    const subject = entry.subject(state, harness, locale);
    return <div className={r.drawing}>{Stage ? <Stage subject={subject} state={state} harness={harness} /> : subject}</div>;
  };
  const { matrix, strips = [] } = sheet;
  const card = ground === "track" ? { className: joinClass(r.sheet, previewStageTrack) } : { fill: ground, shadow: true, className: r.sheet };
  const rows = matrix ? axisValues(entry, matrix.rows) : [];
  const columns = matrix ? axisValues(entry, matrix.columns) : [];
  return (
    <Stack as="section" gap="sm">
      <SectionHeading title={w.all} variant="label" />
      <Surface {...card} inert aria-hidden data-testid="variant-sheet">
        <Stack gap="xl">
          {matrix ? (
            <Stack gap="sm">
              <Text variant="caption" family="mono" ink="secondary">{`${matrix.rows} × ${matrix.columns}`}</Text>
              <div className={r.matrix} style={{ gridTemplateColumns: `max-content repeat(${columns.length}, max-content)` }} data-sheet="matrix">
                <span />
                {columns.map((column) => <Text key={column.label} variant="caption" family="mono" ink="tertiary">{column.label}</Text>)}
                {rows.map((row) => (
                  <Fragment key={row.label}>
                    <Text className={r.rowHead} variant="caption" family="mono" ink="tertiary">{row.label}</Text>
                    {columns.map((column) => <Fragment key={column.label}>{draw({ [matrix.rows]: row.value, [matrix.columns]: column.value })}</Fragment>)}
                  </Fragment>
                ))}
              </div>
            </Stack>
          ) : null}
          {strips.map((axis) => (
            <Stack key={axis.key} gap="sm">
              <Text variant="caption" family="mono" ink="secondary">{stripTitle(axis)}</Text>
              <div className={r.strip} data-sheet="strip">
                {axisValues(entry, axis.key).map((step) => (
                  <div key={step.label} className={r.stripCell}>
                    {draw({ ...axis.with, [axis.key]: step.value })}
                    <Text variant="caption" family="mono" ink="tertiary">{step.label}</Text>
                  </div>
                ))}
              </div>
            </Stack>
          ))}
        </Stack>
      </Surface>
    </Stack>
  );
};
