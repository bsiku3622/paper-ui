import { Badge, Button, Checkbox, Field, Icon, Marker, Radio, SegmentControl, Select, Slider, Spinner, Switch, Text, Textarea } from "@studio-baeks/paper-ui";
import { tokens, CONTROL_SIZES, DIMENSIONS, ICON_SIZES, MEASURES, SPACES, type ControlSize } from "@studio-baeks/paper-ui/tokens";
import { CONTROL, SHAPE_RECIPES, SHAPE_SOURCE } from "@paper-ui/inspect/shape";

import type { Bilingual } from "../../site/locale";
import { Board, BoardGroup, BoardRow, Cell, Computed, FoundationSection, Ladder, MatrixCell, Meter, TokenCell, ValueCell, resolved, useT } from "./kit";
import { PlusIcon } from "../../compositions/icons";
import { leafPaths, valueAt } from "./paths";
import { ROLE_ALIASES, ROLE_FORMULAS, TARGET_NOTES } from "./shape-roles";
import * as s from "./foundations.css";

const shape = tokens.shape;
const r = SHAPE_RECIPES;
const maxOf = (scale: Record<string, number>) => Math.max(...Object.values(scale));
const Plus = () => <PlusIcon size="caption" />;

const SOURCE_COLUMNS = [{ label: "Token", track: "minmax(0, 1fr)" }, { label: "Specimen", track: "minmax(0, 1.5fr)" }, { label: "Value", align: "end" as const, track: "minmax(0, 1fr)" }];
const ROLE_COLUMNS = [{ label: "Role", track: "minmax(0, 1fr)" }, { label: "Rule", track: "minmax(0, 1.2fr)" }, { label: "Value", align: "end" as const, track: "minmax(11rem, auto)" }];

const n = (dp: number, unit = "dp") => `${dp} ${unit}`;

// What each stroke is drawn as; the icon stroke is SVG units, not a line.
const STROKE_NOTES: Record<keyof typeof SHAPE_SOURCE.stroke, Bilingual | undefined> = { border: undefined, emphasis: undefined, icon: { ko: "24 artboard의 SVG 단위", en: "SVG units of the 24 artboard" } };
const STROKE_SPECIMEN: Record<keyof typeof SHAPE_SOURCE.stroke, React.ReactNode> = {
  border: <div className={s.strokeLine.border} />,
  emphasis: <div className={s.strokeLine.emphasis} />,
  icon: <Cell><Icon size="body"><circle cx="12" cy="12" r="8" /><path d="M8 12h8" /></Icon></Cell>,
};

const ShapeSource = () => {
  const t = useT();
  return (
  <Board columns={SOURCE_COLUMNS} minWidth="36rem">
    <BoardGroup label={t({ ko: "Space — inset과 gap이 함께 고르는 길이", en: "Space — the lengths that inset and gap both pick from" })}>
      {SPACES.map((step) => (
        <BoardRow key={step}>
          <TokenCell name={`shape.space.${step}`} />
          <div className={s.spaceBar[step]} />
          <ValueCell>{resolved(shape.inset[step])}</ValueCell>
        </BoardRow>
      ))}
    </BoardGroup>
    <BoardGroup label="Radius">
      {leafPaths(SHAPE_SOURCE.radius).map((name) => (
        <BoardRow key={name}>
          <TokenCell name={`shape.radius.${name}`} />
          <div className={s.radiusSample[name]} />
          <ValueCell>{resolved(valueAt(shape.radius, name) as string)}</ValueCell>
        </BoardRow>
      ))}
    </BoardGroup>
    <BoardGroup label={t({ ko: "Stroke · Focus — px라 root 크기를 따라 커지지 않습니다", en: "Stroke · Focus — in px, so they do not grow with the root size" })}>
      {leafPaths(SHAPE_SOURCE.stroke).map((name) => (
        <BoardRow key={name}>
          <TokenCell name={`shape.stroke.${name}`} note={STROKE_NOTES[name] ? t(STROKE_NOTES[name]) : undefined} />
          {STROKE_SPECIMEN[name]}
          <ValueCell>{resolved(shape.stroke[name])}</ValueCell>
        </BoardRow>
      ))}
      {leafPaths(SHAPE_SOURCE.focus).map((name) => (
        <BoardRow key={name}>
          <TokenCell name={`shape.focus.${name}`} />
          <Cell><div className={s.focusBox} /></Cell>
          <ValueCell>{resolved(shape.focus[name])}</ValueCell>
        </BoardRow>
      ))}
    </BoardGroup>
    <BoardGroup label={t({ ko: "Target — px라 root 크기를 따라 커지지 않습니다", en: "Target — in px, so it does not grow with the root size" })}>
      {leafPaths(SHAPE_SOURCE.target).map((name) => (
        <BoardRow key={name}>
          <TokenCell name={`shape.target.${name}`} note={t(TARGET_NOTES[name])} />
          <Cell><div className={s.targetBox} /></Cell>
          <ValueCell>{resolved(shape.target[name])}</ValueCell>
        </BoardRow>
      ))}
    </BoardGroup>
    <BoardGroup label="Control">
      {CONTROL_SIZES.map((size) => (
        <BoardRow key={size}>
          <TokenCell name={`shape.control.height.${size}`} />
          <div className={s.controlBox[size]} />
          <ValueCell>{resolved(shape.control.height[size])}</ValueCell>
        </BoardRow>
      ))}
      {CONTROL_SIZES.map((size) => (
        <BoardRow key={`button-inset-${size}`}>
          <TokenCell name={`shape.control.buttonInset.${size}`} note={size === "xs" ? t({ ko: "버튼 좌우 여백 — 크기마다 손으로 적고, 높이를 따라가지 않습니다", en: "A button's horizontal space: written by hand for each size, and it does not follow the height" }) : undefined} />
          <Cell><Button size={size} variant="hairline">Button</Button></Cell>
          <ValueCell>{SHAPE_SOURCE.control.buttonInset[size]}</ValueCell>
        </BoardRow>
      ))}
    </BoardGroup>
    <BoardGroup label={t({ ko: "Selection — Checkbox와 Radio의 상자. 스위치 트랙은 이 값에 테를 더한 높이에 폭은 그 1.5배이고, 손잡이는 둥근 원입니다. 컨트롤 높이와 따로 움직입니다", en: "Selection — the box of Checkbox and Radio. A switch track is this value plus the border in height and 1.5 times that in width, and its knob is a round circle. It moves apart from the control height" })}>
      {CONTROL_SIZES.map((size) => (
        <BoardRow key={size}>
          <TokenCell name={`shape.selection.size.${size}`} />
          <Cell><Checkbox size={size} defaultChecked aria-label={`selection ${size}`} /></Cell>
          <ValueCell>{resolved(shape.selection.size[size])}</ValueCell>
        </BoardRow>
      ))}
    </BoardGroup>
    <BoardGroup label={t({ ko: "Icon — 옆에 서는 Text 역할 이름", en: "Icon — the name of the Text role it stands beside" })}>
      {ICON_SIZES.map((size) => (
        <BoardRow key={size}>
          <TokenCell name={`shape.icon.${size}`} />
          <Cell><Icon size={size}><circle cx="12" cy="12" r="8" /><path d="M12 8v8M8 12h8" /></Icon></Cell>
          <ValueCell>{resolved(shape.icon.size[size])}</ValueCell>
        </BoardRow>
      ))}
    </BoardGroup>
    <BoardGroup label={t({ ko: "Dimension · Measure — 막대는 각 단계의 가장 큰 값 대비 길이", en: "Dimension · Measure — each bar is its length against the largest value of its scale" })}>
      {(["width", "height"] as const).flatMap((axis) => DIMENSIONS.map((step) => (
        <BoardRow key={`${axis}-${step}`}>
          <TokenCell name={`shape.dimension.${axis}.${step}`} />
          <Meter value={SHAPE_SOURCE.dimension[axis][step]} max={maxOf(SHAPE_SOURCE.dimension[axis])} />
          <ValueCell>{resolved(shape.dimension[axis][step])}</ValueCell>
        </BoardRow>
      )))}
      {MEASURES.map((step) => (
        <BoardRow key={`measure-${step}`}>
          <TokenCell name={`shape.measure.${step}`} />
          <Meter value={SHAPE_SOURCE.measure[step]} max={maxOf(SHAPE_SOURCE.measure)} />
          <ValueCell>{resolved(shape.measure[step])}</ValueCell>
        </BoardRow>
      ))}
    </BoardGroup>
    <BoardGroup label={t({ ko: "Anatomy — 규칙으로 나오지 않아 원본에 둔 값 (recipe만 읽음)", en: "Anatomy — values that no rule yields, so they live in the source (read only by recipes)" })}>
      {CONTROL_SIZES.map((size) => (
        <BoardRow key={`badge-${size}`}>
          <TokenCell name={`shape.anatomy.badge.height.${size} · inset.${size}`} />
          <Cell><Badge size={size}>Badge</Badge></Cell>
          <ValueCell>{n(SHAPE_SOURCE.anatomy.badge.height[size])} · {n(SHAPE_SOURCE.anatomy.badge.inset[size])}</ValueCell>
        </BoardRow>
      ))}
      <BoardRow>
        <TokenCell name="shape.anatomy.checkbox.markShift · x · y" note={t({ ko: "돌린 체크의 광학 보정 — 획(emphasis)의 배수", en: "The optical correction of the rotated check, as a multiple of the stroke (emphasis)" })} />
        <Cell><Checkbox size="md" defaultChecked aria-label="Checkbox markShift" /></Cell>
        <ValueCell>{SHAPE_SOURCE.anatomy.checkbox.markShift.x} · {String(SHAPE_SOURCE.anatomy.checkbox.markShift.y).replace("-", "−")}</ValueCell>
      </BoardRow>
      <BoardRow>
        <TokenCell name="shape.anatomy.switch.length" note={t({ ko: "스위치 트랙 폭 — 트랙 높이의 배수. 짧고 뚱뚱해서 둥근 손잡이가 트랙을 거의 채웁니다", en: "The switch track's width, as a multiple of the track height. Short and stout, so the round knob nearly fills the track" })} />
        <Cell><Switch size="md" defaultChecked aria-label="Switch length" /></Cell>
        <ValueCell>× {SHAPE_SOURCE.anatomy.switch.length}</ValueCell>
      </BoardRow>
      <BoardRow>
        <TokenCell name="shape.anatomy.marker.height · position · overrun" note={t({ ko: "칠의 높이, 글자 상자 안 위치, 좌우로 넘는 길이", en: "The height of the fill, its position in the text box, and how far it runs over on each side" })} />
        <Cell><Text as="span" variant="body"><Marker>{t({ ko: "칠", en: "Fill" })}</Marker></Text></Cell>
        <ValueCell>{SHAPE_SOURCE.anatomy.marker.height}% · {SHAPE_SOURCE.anatomy.marker.position}% · {n(SHAPE_SOURCE.anatomy.marker.overrun, "em")}</ValueCell>
      </BoardRow>
      <BoardRow>
        <TokenCell name="shape.anatomy.inline.dot" note={t({ ko: "글자에 붙는 상태 점", en: "A status dot attached to text" })} />
        <Cell><Badge accent="info" dot>{t({ ko: "진행", en: "In progress" })}</Badge></Cell>
        <ValueCell>{n(SHAPE_SOURCE.anatomy.inline.dot, "em")}</ValueCell>
      </BoardRow>
      <BoardRow>
        <TokenCell name="shape.anatomy.inline.spinner" note={t({ ko: "버튼 라벨 옆 스피너", en: "A spinner beside a button label" })} />
        <Cell><Button size="md" loading>{t({ ko: "저장 중", en: "Saving" })}</Button></Cell>
        <ValueCell>{n(SHAPE_SOURCE.anatomy.inline.spinner, "em")}</ValueCell>
      </BoardRow>
    </BoardGroup>
  </Board>
  );
};

const sizes = (role: Record<ControlSize, string>) => CONTROL_SIZES.map((size) => role[size]);

const ALIAS_VALUES: Record<keyof typeof ROLE_ALIASES, readonly string[]> = {
  inset: SPACES.map((step) => shape.inset[step]),
  radius: leafPaths(SHAPE_SOURCE.radius).map((name) => valueAt(shape.radius, name) as string),
  "control.height": sizes(shape.control.height),
  "control.inset.button": sizes(shape.control.inset.button),
  "control.icon": sizes(shape.control.icon),
  "control.gap": [shape.control.gap],
  target: [shape.target.min],
};

const FORMULA_VALUES: Record<keyof typeof ROLE_FORMULAS, readonly string[]> = {
  "control.inset.input": sizes(shape.control.inset.input),
};

const ShapeRoles = () => {
  const t = useT();
  return (
  <Board columns={ROLE_COLUMNS} minWidth="36rem">
    <BoardGroup label={t({ ko: "Alias — 원본 변수를 그대로 가리킵니다", en: "Alias — points straight at the source variable" })}>
      {(Object.keys(ROLE_ALIASES) as (keyof typeof ROLE_ALIASES)[]).map((role) => (
        <BoardRow key={role}>
          <TokenCell name={ROLE_ALIASES[role].name} />
          <Cell><span className={s.rule}>{t(ROLE_ALIASES[role].rule)}</span></Cell>
          <ValueCell><Ladder values={[...ALIAS_VALUES[role]]} /></ValueCell>
        </BoardRow>
      ))}
    </BoardGroup>
    <BoardGroup label={t({ ko: "Formula — 쓰이는 요소에서 계산되어, 원본을 덮으면 따라 바뀝니다", en: "Formula — computed on the element that uses it, so it follows when the source is overridden" })}>
      {([
        ...(Object.keys(ROLE_FORMULAS) as (keyof typeof ROLE_FORMULAS)[]).map((role) => [`shape.${role}`, t(ROLE_FORMULAS[role].rule), FORMULA_VALUES[role], t(ROLE_FORMULAS[role].note)] as const),
        ["targetReach(shape.selection.size)", t({ ko: "(min(표식, target.min) − target.min) / 2", en: "(min(mark, target.min) − target.min) / 2" }), sizes(r.target.selection), t({ ko: "최소 크기에 못 미치는 표식 밖으로 hit area가 뻗는 거리 — Switch 트랙과 Field 액션도 같은 식", en: "How far the hit area reaches beyond a mark smaller than the minimum size; the Switch track and the Field action use the same formula" })],
      ] as const).map(([name, rule, values, note]) => (
        <BoardRow key={name}>
          <TokenCell name={name} note={note} />
          <Cell><span className={s.rule}>{rule}</span></Cell>
          <ValueCell><Ladder values={[...values]} /></ValueCell>
        </BoardRow>
      ))}
    </BoardGroup>
  </Board>
  );
};

const C = ({ value }: { value: string }) => <Computed value={value} unit={false} />;
type Tr = ReturnType<typeof useT>;
const W = {
  height: { ko: "높이", en: "height" },
  arrow: { ko: "화살표", en: "arrow" },
  end: { ko: "끝", en: "end" },
  vertical: { ko: "위아래", en: "vertical" },
  box: { ko: "상자", en: "box" },
  check: { ko: "체크", en: "check" },
  dot: { ko: "점", en: "dot" },
  track: { ko: "트랙", en: "track" },
  knob: { ko: "손잡이", en: "knob" },
  inner: { ko: "안쪽", en: "inner" },
  bar: { ko: "막대", en: "bar" },
  diameter: { ko: "지름", en: "diameter" },
} satisfies Record<string, Bilingual>;
const RECIPES: { name: string; note: Bilingual; render: (size: ControlSize, t: Tr) => React.ReactNode; caption: (size: ControlSize, t: Tr) => React.ReactNode }[] = [
  { name: "Button", note: { ko: "높이 · inset", en: "height · inset" }, render: (size) => <Button size={size} variant="hairline"><Plus />Button</Button>, caption: (size, t) => <>{t(W.height)} <C value={shape.control.height[size]} /> · inset <C value={shape.control.inset.button[size]} /></> },
  { name: "Field", note: { ko: "높이 · inset", en: "height · inset" }, render: (size) => <Field size={size} aria-label={`Field ${size}`} placeholder="Field" />, caption: (size, t) => <>{t(W.height)} <C value={shape.control.height[size]} /> · inset <C value={shape.control.inset.input[size]} /></> },
  { name: "Select", note: { ko: "화살표 · 값이 멈추는 자리", en: "arrow · where the value stops" }, render: (size) => <Select size={size} aria-label={`Select ${size}`}><Select.Option value="a">Select</Select.Option></Select>, caption: (size, t) => <>{t(W.arrow)} <C value={shape.control.icon[size]} /> · {t(W.end)} <C value={CONTROL.select.paddingEnd[size]} /></> },
  { name: "Textarea", note: { ko: "위아래 여백 · 한 줄 = Field", en: "vertical space · one line = Field" }, render: (size) => <Textarea size={size} rows={1} aria-label={`Textarea ${size}`} placeholder="Textarea" />, caption: (size, t) => <>{t(W.vertical)} <C value={CONTROL.area.paddingBlock[size]} /></> },
  { name: "Checkbox", note: { ko: "상자 · 체크 긴 변", en: "box · long side of the check" }, render: (size) => <Checkbox size={size} defaultChecked aria-label={`Checkbox ${size}`} />, caption: (size, t) => <>{t(W.box)} <C value={shape.selection.size[size]} /> · {t(W.check)} <C value={r.checkbox.mark[size]} /></> },
  { name: "Radio", note: { ko: "상자 · 점", en: "box · dot" }, render: (size) => <Radio size={size} defaultChecked aria-label={`Radio ${size}`} />, caption: (size, t) => <>{t(W.box)} <C value={shape.selection.size[size]} /> · {t(W.dot)} <C value={r.radio.dot[size]} /></> },
  { name: "Switch", note: { ko: "트랙 · 손잡이", en: "track · knob" }, render: (size) => <Switch size={size} defaultChecked aria-label={`Switch ${size}`} />, caption: (size, t) => <>{t(W.track)} <C value={r.switch.width[size]} />×<C value={r.switch.height[size]} /> · {t(W.knob)} <C value={r.switch.thumbWidth[size]} />×<C value={r.switch.thumb[size]} /></> },
  { name: "SegmentControl", note: { ko: "트랙 높이 · 칸이 들어앉는 거리", en: "track height · how far a segment sits in" }, render: (size, t) => <SegmentControl size={size} aria-label={`SegmentControl ${size}`} defaultValue="a"><SegmentControl.Item value="a">{t({ ko: "하나", en: "One" })}</SegmentControl.Item><SegmentControl.Item value="b">{t({ ko: "둘", en: "Two" })}</SegmentControl.Item></SegmentControl>, caption: (size, t) => <>{t(W.height)} <C value={shape.control.height[size]} /> · {t(W.inner)} <C value={r.segment.inset} /></> },
  { name: "Slider", note: { ko: "막대 · 손잡이", en: "bar · knob" }, render: (size) => <Slider size={size} aria-label={`Slider ${size}`} defaultValue={50} />, caption: (size, t) => <>{t(W.bar)} <C value={r.switch.height[size]} /> · {t(W.knob)} <C value={r.slider.thumb[size]} /></> },
  { name: "Badge", note: { ko: "높이 · inset", en: "height · inset" }, render: (size) => <Badge size={size}>Badge</Badge>, caption: (size, t) => <>{t(W.height)} <C value={r.badge.height[size]} /> · inset <C value={r.badge.inset[size]} /></> },
  { name: "Spinner", note: { ko: "지름", en: "diameter" }, render: (size) => <Spinner size={size} />, caption: (size, t) => <>{t(W.diameter)} <C value={r.spinner.size[size]} /></> },
];

// One size across what a control is made of, read at a glance. The height, the button's inset, the corner and the icon are Shape's
// roles, the text is Typography's control preset, and the marks follow that text rather than the height.
const SIZE_HEADS: Bilingual<readonly string[]> = {
  ko: ["높이", "버튼 좌우", "모서리", "글자", "아이콘", "체크 · 라디오"],
  en: ["Height", "Button sides", "Corner", "Text", "Icon", "Check · radio"],
};
const sizeColumns = (heads: readonly string[]) => [
  { label: "size", track: "minmax(5rem, 1fr)" },
  ...heads.map((label) => ({ label, align: "end" as const, track: "minmax(0, 1fr)" })),
];
const sizeRow = (size: ControlSize) => [
  shape.control.height[size],
  shape.control.inset.button[size],
  shape.radius.control[size],
  tokens.typography.preset.button[size].size,
  shape.control.icon[size],
  shape.selection.size[size],
];

const ControlSizes = () => {
  const t = useT();
  return (
  <Board columns={sizeColumns(t(SIZE_HEADS))} minWidth="36rem">
    {CONTROL_SIZES.map((size) => (
      <BoardRow key={size} size="md">
        <TokenCell name={size} note={size === "md" ? t({ ko: "기본", en: "Default" }) : undefined} />
        {sizeRow(size).map((value, index) => <ValueCell key={index}><Computed value={value} unit={false} /></ValueCell>)}
      </BoardRow>
    ))}
  </Board>
  );
};

export const ShapePage = () => {
  const t = useT();
  return (
  <>
    <FoundationSection title="Shape Source" description={t({ ko: "Shape의 모든 숫자가 적힌 단 한 곳입니다. 원본만 CSS 변수로 굽고, 아래 역할과 recipe는 이 변수를 가리키거나 계산합니다.", en: "The single place where every number of Shape is written. Only the source is baked into CSS variables; the roles and recipes below point at those variables or compute from them." })}>
      <ShapeSource />
    </FoundationSection>
    <FoundationSection title="Shape roles" description={t({ ko: "컴포넌트와 앱이 고르는 이름입니다. 역할은 자기 변수를 갖지 않습니다 — 원본의 별칭이거나 원본 위의 식입니다.", en: "The names that components and apps pick. A role has no variable of its own: it is an alias of the source or a formula over it." })}>
      <ShapeRoles />
    </FoundationSection>
    <FoundationSection title="Control sizes" description={t({ ko: "size 하나가 고르는 값을 한 표에 모았습니다. 높이 · 버튼 좌우 · 모서리 · 아이콘은 Shape의 역할이고 글자는 Typography의 control preset입니다. 체크 · 라디오는 높이가 아니라 옆 글자를 따라서, 글자가 같은 md와 lg는 같은 값입니다. 값은 브라우저가 계산한 px입니다.", en: "The values one size picks, gathered in one table. Height, button sides, corner and icon are Shape roles, and text is Typography's control preset. Check and radio follow the neighbouring text rather than the height, so md and lg, whose text is the same, share a value. Values are the px the browser computed." })}>
      <ControlSizes />
    </FoundationSection>
    <FoundationSection title="Recipes" description={t({ ko: "역할이 컴포넌트 anatomy가 되는 자리입니다. recipe에는 구조 값(절반 /2, 45° 회전)만 쓰고, 광학 보정 비율은 원본 anatomy에 둡니다. 아래 값은 브라우저가 식을 계산한 결과입니다.", en: "Where roles become a component's anatomy. A recipe uses only structural values (half, /2; a 45° rotation); optical correction ratios live in the source anatomy. The values below are what the browser computed from the formulas." })}>
      <Board columns={[{ label: "Recipe", track: "minmax(9rem, 1fr)" }, ...CONTROL_SIZES.map((size) => ({ label: size, align: "center" as const, track: "minmax(min-content, 1fr)" }))]} minWidth="44rem">
        {RECIPES.map((recipe) => (
          <BoardRow key={recipe.name} size="lg">
            <TokenCell name={recipe.name} note={t(recipe.note)} />
            {CONTROL_SIZES.map((size) => <MatrixCell key={size} caption={recipe.caption(size, t)}><div className={s.recipeSample}>{recipe.render(size, t)}</div></MatrixCell>)}
          </BoardRow>
        ))}
      </Board>
    </FoundationSection>
  </>
  );
};
