import { Badge, Button, Checkbox, Field, Icon, Radio, Select, Spinner, Switch, Textarea } from "@studio-baeks/paper-ui";
import { tokens, CONTROL_SIZES, DIMENSIONS, ICON_SIZES, MEASURES, SPACES, type ControlSize } from "@studio-baeks/paper-ui/tokens";

import { SHAPE_SOURCE } from "../../../../packages/paper-ui/src/tokens/shape";
import { SHAPE_RECIPES } from "../../../../packages/paper-ui/src/tokens/shape-recipes";
import { Board, BoardGroup, BoardRow, Cell, Computed, FoundationSection, Ladder, MatrixCell, Meter, TokenCell, ValueCell, resolved } from "./kit";
import { leafPaths, valueAt } from "./paths";
import * as s from "./foundations.css";

const shape = tokens.shape;
const r = SHAPE_RECIPES;
const maxOf = (scale: Record<string, number>) => Math.max(...Object.values(scale));
const Plus = () => <Icon size="caption"><path d="M12 5v14M5 12h14" /></Icon>;

const SOURCE_COLUMNS = [{ label: "Token" }, { label: "Specimen" }, { label: "Value", align: "end" as const }];
const SOURCE_TEMPLATE = "minmax(0, 1fr) minmax(0, 1.5fr) minmax(0, 1fr)";
const ROLE_COLUMNS = [{ label: "Role" }, { label: "Rule" }, { label: "Value", align: "end" as const }];
const ROLE_TEMPLATE = "minmax(0, 1fr) minmax(0, 1.2fr) minmax(11rem, auto)";

const n = (dp: number, unit = "dp") => `${dp} ${unit}`;

// What each stroke is drawn as; the icon stroke is SVG units, not a line.
const STROKE_NOTES: Record<keyof typeof SHAPE_SOURCE.stroke, string | undefined> = { border: undefined, emphasis: undefined, icon: "24 artboard의 SVG 단위" };
const STROKE_SPECIMEN: Record<keyof typeof SHAPE_SOURCE.stroke, React.ReactNode> = {
  border: <div className={s.strokeLine.border} />,
  emphasis: <div className={s.strokeLine.emphasis} />,
  icon: <Cell><Icon size="body"><circle cx="12" cy="12" r="8" /><path d="M8 12h8" /></Icon></Cell>,
};

const ShapeSource = () => (
  <Board columns={SOURCE_COLUMNS} template={SOURCE_TEMPLATE} minWidth="36rem">
    <BoardGroup label="Space — inset과 gap이 함께 고르는 길이">
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
    <BoardGroup label="Stroke · Focus — px라 root 크기를 따라 커지지 않습니다">
      {leafPaths(SHAPE_SOURCE.stroke).map((name) => (
        <BoardRow key={name}>
          <TokenCell name={`shape.stroke.${name}`} note={STROKE_NOTES[name]} />
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
    <BoardGroup label="Control">
      {CONTROL_SIZES.map((size) => (
        <BoardRow key={size}>
          <TokenCell name={`shape.control.height.${size}`} />
          <div className={s.controlBox[size]} />
          <ValueCell>{resolved(shape.control.height[size])}</ValueCell>
        </BoardRow>
      ))}
      <BoardRow>
        <TokenCell name="shape.control.buttonInsetRatio" note="버튼 inset = (높이 − 버튼 글자 줄)/2 × 이 값" />
        <Cell><Button size="md" variant="hairline">Button</Button></Cell>
        <ValueCell>{SHAPE_SOURCE.control.buttonInsetRatio}</ValueCell>
      </BoardRow>
    </BoardGroup>
    <BoardGroup label="Icon — 옆에 서는 Text 역할 이름">
      {ICON_SIZES.map((size) => (
        <BoardRow key={size}>
          <TokenCell name={`shape.icon.${size}`} />
          <Cell><Icon size={size}><circle cx="12" cy="12" r="8" /><path d="M12 8v8M8 12h8" /></Icon></Cell>
          <ValueCell>{resolved(shape.icon.size[size])}</ValueCell>
        </BoardRow>
      ))}
    </BoardGroup>
    <BoardGroup label="Dimension · Measure — 막대는 각 단계의 가장 큰 값 대비 길이">
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
    <BoardGroup label="Anatomy — 규칙으로 나오지 않아 원본에 둔 값 (recipe만 읽음)">
      {CONTROL_SIZES.map((size) => (
        <BoardRow key={`badge-${size}`}>
          <TokenCell name={`shape.anatomy.badge.height.${size} · inset.${size}`} />
          <Cell><Badge size={size}>Badge</Badge></Cell>
          <ValueCell>{n(SHAPE_SOURCE.anatomy.badge.height[size])} · {n(SHAPE_SOURCE.anatomy.badge.inset[size])}</ValueCell>
        </BoardRow>
      ))}
      <BoardRow>
        <TokenCell name="shape.anatomy.inline.dot" note="글자에 붙는 상태 점" />
        <Cell><Badge accent="info" dot>진행</Badge></Cell>
        <ValueCell>{n(SHAPE_SOURCE.anatomy.inline.dot, "em")}</ValueCell>
      </BoardRow>
      <BoardRow>
        <TokenCell name="shape.anatomy.inline.spinner" note="버튼 라벨 옆 스피너" />
        <Cell><Button size="md" loading>저장 중</Button></Cell>
        <ValueCell>{n(SHAPE_SOURCE.anatomy.inline.spinner, "em")}</ValueCell>
      </BoardRow>
    </BoardGroup>
  </Board>
);

const sizes = (role: Record<ControlSize, string>) => CONTROL_SIZES.map((size) => role[size]);

const ShapeRoles = () => (
  <Board columns={ROLE_COLUMNS} template={ROLE_TEMPLATE} minWidth="36rem">
    <BoardGroup label="Alias — 원본 변수를 그대로 가리킵니다">
      {([
        ["shape.inset.xs ~ 3xl", "= shape.space 같은 단계", SPACES.map((step) => shape.inset[step])],
        ["shape.radius.*", "= shape.radius 원본", leafPaths(SHAPE_SOURCE.radius).map((name) => valueAt(shape.radius, name) as string)],
        ["shape.control.height", "= 원본 사다리", sizes(shape.control.height)],
        ["shape.control.icon", "= icon caption · body · subheading", sizes(shape.control.icon)],
        ["shape.control.gap", "= shape.space.sm", [shape.control.gap]],
      ] as const).map(([name, rule, values]) => (
        <BoardRow key={name}>
          <TokenCell name={name} />
          <Cell><span className={s.rule}>{rule}</span></Cell>
          <ValueCell><Ladder values={[...values]} /></ValueCell>
        </BoardRow>
      ))}
    </BoardGroup>
    <BoardGroup label="Formula — 쓰이는 요소에서 계산되어, 원본을 덮으면 따라 바뀝니다">
      {([
        ["shape.control.inset.input", "(control.height − 컨트롤 글자 줄) / 2", sizes(shape.control.inset.input), "입력값 줄상자 사방에 같은 여백"],
        ["shape.control.inset.button", `round(nearest, (control.height − 버튼 글자 줄) / 2 × ${SHAPE_SOURCE.control.buttonInsetRatio}, 1px)`, sizes(shape.control.inset.button), "라벨이 상자를 정의하므로 더 넓게"],
        ["shape.selection.size", "control.height / 2", sizes(shape.selection.size), "그래서 스위치 트랙 폭 = 컨트롤 높이"],
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

const C = ({ value }: { value: string }) => <Computed value={value} unit={false} />;
const RECIPES: { name: string; note: string; render: (size: ControlSize) => React.ReactNode; caption: (size: ControlSize) => React.ReactNode }[] = [
  { name: "Button", note: "높이 · inset", render: (size) => <Button size={size} variant="hairline"><Plus />Button</Button>, caption: (size) => <>높이 <C value={shape.control.height[size]} /> · inset <C value={shape.control.inset.button[size]} /></> },
  { name: "Field", note: "높이 · inset", render: (size) => <Field size={size} aria-label={`Field ${size}`} placeholder="Field" />, caption: (size) => <>높이 <C value={shape.control.height[size]} /> · inset <C value={shape.control.inset.input[size]} /></> },
  { name: "Select", note: "화살표 · 값이 멈추는 자리", render: (size) => <Select size={size} aria-label={`Select ${size}`}><Select.Option value="a">Select</Select.Option></Select>, caption: (size) => <>화살표 <C value={r.select.arrow[size]} /> · 끝 <C value={r.select.paddingEnd[size]} /></> },
  { name: "Textarea", note: "위아래 여백 · 최소 높이", render: (size) => <Textarea size={size} rows={1} aria-label={`Textarea ${size}`} placeholder="Textarea" />, caption: (size) => <>위아래 <C value={r.textarea.paddingBlock[size]} /> · 최소 <C value={r.textarea.minHeight} /></> },
  { name: "Checkbox", note: "상자 · 체크 긴 변", render: (size) => <Checkbox size={size} defaultChecked aria-label={`Checkbox ${size}`} />, caption: (size) => <>상자 <C value={shape.selection.size[size]} /> · 체크 <C value={r.checkbox.mark[size]} /></> },
  { name: "Radio", note: "상자 · 점", render: (size) => <Radio size={size} defaultChecked aria-label={`Radio ${size}`} />, caption: (size) => <>상자 <C value={shape.selection.size[size]} /> · 점 <C value={r.radio.dot[size]} /></> },
  { name: "Switch", note: "트랙 · 손잡이", render: (size) => <Switch size={size} defaultChecked aria-label={`Switch ${size}`} />, caption: (size) => <>트랙 <C value={r.switch.width[size]} />×<C value={r.switch.height[size]} /> · 손잡이 <C value={r.switch.thumb[size]} /></> },
  { name: "Badge", note: "높이 · inset", render: (size) => <Badge size={size}>Badge</Badge>, caption: (size) => <>높이 <C value={r.badge.height[size]} /> · inset <C value={r.badge.inset[size]} /></> },
  { name: "Spinner", note: "지름", render: (size) => <Spinner size={size} />, caption: (size) => <>지름 <C value={r.spinner.size[size]} /></> },
];

export const ShapePage = () => (
  <>
    <FoundationSection title="Shape Source" description="Shape의 모든 숫자가 적힌 단 한 곳입니다. 원본만 CSS 변수로 굽고, 아래 역할과 recipe는 이 변수를 가리키거나 계산합니다.">
      <ShapeSource />
    </FoundationSection>
    <FoundationSection title="Shape roles" description="컴포넌트와 앱이 고르는 이름입니다. 역할은 자기 변수를 갖지 않습니다 — 원본의 별칭이거나 원본 위의 식입니다.">
      <ShapeRoles />
    </FoundationSection>
    <FoundationSection title="Recipes" description="역할이 컴포넌트 anatomy가 되는 자리입니다. recipe에는 숫자가 없고, 아래 값은 브라우저가 식을 계산한 결과입니다.">
      <Board columns={[{ label: "Recipe" }, ...CONTROL_SIZES.map((size) => ({ label: size, align: "center" as const }))]} template="minmax(9rem, 1fr) repeat(3, minmax(10rem, 1fr))" minWidth="44rem">
        {RECIPES.map((recipe) => (
          <BoardRow key={recipe.name} size="lg">
            <TokenCell name={recipe.name} note={recipe.note} />
            {CONTROL_SIZES.map((size) => <MatrixCell key={size} caption={recipe.caption(size)}><div className={s.recipeSample}>{recipe.render(size)}</div></MatrixCell>)}
          </BoardRow>
        ))}
      </Board>
    </FoundationSection>
  </>
);
