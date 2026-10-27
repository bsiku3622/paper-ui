// Foundations — 역할별 디자인 토큰을 계층대로 살펴보는 reference page.

import { useLayoutEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

import { Box, Button, Inline, Stack, Text, tokens, useResolvedTheme, resolveControlTypography, CONTROL_SIZES, DIMENSION_KEYS, ELEVATIONS, ICON_SIZES, SPACE_KEYS, type TextVariant, type ControlSize } from "@studio-baeks/paper-ui";

import { COLOR_VALUES, COLOR_VALUES_DARK } from "../../../packages/paper-ui/src/tokens/colors";
import { ACCENT_STEPS, PALETTE_TOKENS } from "../../../packages/paper-ui/src/tokens/palette";
import { PlaygroundLayout, ReferenceHeading } from "./shell";
import { FOUNDATION_SECTIONS } from "./foundation-sections";
import "./foundations.css";

const withPx = (value: string) => {
  const match = /^(-?[\d.]+)rem$/.exec(value);
  return match ? `${value} · ${Math.round(Number(match[1]) * 16 * 100) / 100}px` : value;
};

const val = (ref: string) => {
  if (!ref.startsWith("var(")) return withPx(ref);
  const name = (ref.slice(4, -1).split(",")[0] ?? "").trim();
  return withPx(getComputedStyle(document.documentElement).getPropertyValue(name).trim() || ref);
};

const Section = ({ id, children }: { id: string; children: React.ReactNode }) => (
  <Stack as="section" id={id} className="foundation-section" gap="lg">{children}</Stack>
);

// Derived roles are calc() formulas; the browser computes them on a probe element.
const Computed = ({ value }: { value: string }) => {
  const probe = useRef<HTMLSpanElement>(null);
  const [px, setPx] = useState("");
  useLayoutEffect(() => {
    if (probe.current) setPx(`${Math.round(parseFloat(getComputedStyle(probe.current).width) * 100) / 100}px`);
  }, [value]);
  return <>{value.startsWith("var(") ? val(value) : px}<span ref={probe} aria-hidden style={{ position: "absolute", visibility: "hidden", width: value }} /></>;
};

const ValueRow = ({ name, value, sample }: { name: string; value: string; sample?: React.ReactNode }) => (
  <Inline className="foundation-value-row" align="center" gap="sm">
    <Text as="code" variant="caption" family="mono">{name}</Text>{sample}
    <Text variant="caption" family="mono" ink="faint">{/^(var|calc|round)\(/.test(value) && !value.startsWith("var(") ? <Computed value={value} /> : val(value)}</Text>
  </Inline>
);

const Subsection = ({ title, note, children }: { title: string; note: string; children: React.ReactNode }) => (
  <Stack className="foundation-subsection" gap="md">
    <Stack gap="xs"><Text variant="subheading">{title}</Text><Text variant="caption" ink="soft">{note}</Text></Stack>
    {children}
  </Stack>
);

const RADIUS_ROWS = [
  ["control", tokens.shape.radius.control], ["selection", tokens.shape.radius.selection], ["surface.sm", tokens.shape.radius.surface.sm],
  ["surface.md", tokens.shape.radius.surface.md], ["surface.lg", tokens.shape.radius.surface.lg], ["full", tokens.shape.radius.full],
] as const;

type TypographyPaletteGroup = "fontSize" | "weight" | "leading" | "tracking" | "family";
const SIZE_LEADING: Record<string, keyof typeof tokens.text.palette.leading> = {
  "12": "16",
  "13": "16",
  "14": "20",
  "16": "24",
  "20": "28",
  "24": "32",
  "32": "40",
};
const TypographyPaletteSpecimen = ({ group, name, value }: { group: TypographyPaletteGroup; name: string; value: string }) => {
  const sample = group === "fontSize" ? "Aa 가나다 0123"
    : group === "weight" ? "Aa 가나다 0123"
      : group === "leading" ? <>한 줄과 다음 줄의 간격을<br />눈으로 확인합니다.</>
        : group === "tracking" ? "TRACKING · 가나다"
          : "Aa 가나다 0123";
  const style: React.CSSProperties = group === "fontSize" ? { fontSize: value, lineHeight: tokens.text.palette.leading[SIZE_LEADING[name]!] }
    : group === "weight" ? { fontWeight: value }
      : group === "leading" ? { lineHeight: value }
        : group === "tracking" ? { letterSpacing: value }
          : { fontFamily: value, fontSize: name === "mono" ? `calc(${tokens.text.palette.fontSize["14"]} * ${tokens.text.palette.monoSizeScale})` : tokens.text.palette.fontSize["14"] };
  return <Text className={`foundation-typography-specimen foundation-typography-palette-specimen foundation-typography-specimen--${group}`} variant="body" ink="base" style={style}>{sample}</Text>;
};

type ColorRow = { token: string; description: string; light: string; dark: string };
const semanticRows = (branch: "bg" | "ink" | "border", names: readonly string[], descriptions: Record<string, string>): ColorRow[] =>
  names.map((name) => ({
    token: `${branch}.${name}`,
    description: descriptions[name] ?? name,
    light: COLOR_VALUES[branch][name as keyof (typeof COLOR_VALUES)[typeof branch]] as string,
    dark: COLOR_VALUES_DARK[branch][name as keyof (typeof COLOR_VALUES_DARK)[typeof branch]] as string,
  }));

const COLOR_GROUPS: { title: string; description: string; rows: ColorRow[] }[] = [
  { title: "Background", description: "Page and container surface depth.", rows: semanticRows("bg", ["canvas", "raised", "sunken"], { canvas: "Default page surface", raised: "Cards and floating surfaces", sunken: "Recessed areas" }) },
  { title: "Control", description: "Dedicated surfaces inside interactive controls.", rows: [
    { token: "control.track", description: "Switch track", light: COLOR_VALUES.control.track, dark: COLOR_VALUES_DARK.control.track },
  ] },
  { title: "Text", description: "Content hierarchy across surfaces.", rows: semanticRows("ink", ["primary", "secondary", "tertiary"], { primary: "Main content and headings", secondary: "Supporting content", tertiary: "Metadata and low emphasis" }) },
  { title: "Border", description: "Structural boundaries and emphasis.", rows: semanticRows("border", ["base", "strong", "hover"], { base: "Default component boundary", strong: "Higher contrast boundary", hover: "Boundary emphasis on pointer hover" }) },
  { title: "Interaction", description: "State overlays and keyboard focus.", rows: [
    { token: "interaction.bgHover.onSurface", description: "Hover overlay on a neutral surface", light: COLOR_VALUES.interaction.bgHover.onSurface, dark: COLOR_VALUES_DARK.interaction.bgHover.onSurface },
    { token: "interaction.bgHover.onPrimarySolid", description: "Hover overlay on the primary solid accent", light: COLOR_VALUES.interaction.bgHover.onPrimarySolid, dark: COLOR_VALUES_DARK.interaction.bgHover.onPrimarySolid },
    { token: "interaction.bgHover.onAccentSolid", description: "Hover overlay on a semantic accent", light: COLOR_VALUES.interaction.bgHover.onAccentSolid, dark: COLOR_VALUES_DARK.interaction.bgHover.onAccentSolid },
    { token: "interaction.selected", description: "Selected item surface", light: COLOR_VALUES.interaction.selected, dark: COLOR_VALUES_DARK.interaction.selected },
    { token: "interaction.active", description: "Pressed or active surface", light: COLOR_VALUES.interaction.active, dark: COLOR_VALUES_DARK.interaction.active },
    { token: "interaction.focus", description: "Keyboard focus indicator", light: COLOR_VALUES.interaction.focus, dark: COLOR_VALUES_DARK.interaction.focus },
  ] },
  { title: "Elevation", description: "Color layers that communicate modal depth and shadow tint.", rows: [
    { token: "overlay.scrim", description: "Dims content behind a modal surface", light: COLOR_VALUES.overlay.scrim, dark: COLOR_VALUES_DARK.overlay.scrim },
    { token: "shadow.overlay", description: "Tint for floating surface shadows", light: COLOR_VALUES.shadow.overlay, dark: COLOR_VALUES_DARK.shadow.overlay },
    { token: "shadow.overlayMinimal", description: "Subtle tint for small control shadows", light: COLOR_VALUES.shadow.overlayMinimal, dark: COLOR_VALUES_DARK.shadow.overlayMinimal },
  ] },
];

const AccentColorGroup = () => ({
  title: "Accent",
  description: "Semantic accent names share the same five color roles.",
  rows: ACCENTS.flatMap((accent) => LADDER.map((ladder) => ({
    token: `accent.${accent}.${ladder}`,
    description: `${accent} · ${ladder}`,
    light: COLOR_VALUES.accent[accent][ladder],
    dark: COLOR_VALUES_DARK.accent[accent][ladder],
  }))),
});

const ColorValue = ({ color, mode }: { color: string; mode: "light" | "dark" }) => {
  const surface = mode === "light" ? COLOR_VALUES.bg.canvas : COLOR_VALUES_DARK.bg.canvas;
  const ink = mode === "light" ? COLOR_VALUES.ink.primary : COLOR_VALUES_DARK.ink.primary;
  const border = mode === "light" ? COLOR_VALUES.border.base : COLOR_VALUES_DARK.border.base;
  const paletteToken = findPaletteToken(color);
  return (
    <Stack className={`foundation-color-value foundation-color-value--${mode}`} gap="sm" border radius="md" padding="sm" tabIndex={0} role="group" aria-label={`${paletteToken}, ${color.toUpperCase()}`} title={`${paletteToken} · ${color.toUpperCase()}`} style={{ background: surface, color: ink, borderColor: border }}>
      <Box className="foundation-color-chip" border radius="sm" style={{ background: color, borderColor: mode === "light" ? COLOR_VALUES.border.base : COLOR_VALUES_DARK.border.base }} />
      <Box className="foundation-color-meta">
        <Text className="foundation-color-palette-token" variant="caption" family="mono" style={{ color: "inherit" }}>{paletteToken}</Text>
        <Text className="foundation-color-hex" variant="caption" family="mono" style={{ color: "inherit" }}>{color.toUpperCase()}</Text>
      </Box>
    </Stack>
  );
};

const ColorGroup = ({ title, description, rows }: { title: string; description: string; rows: ColorRow[] }) => (
  <Stack as="section" className="foundation-color-section" gap="md">
    <Stack gap="xs"><Text variant="heading">{title}</Text><Text variant="body" ink="soft">{description}</Text></Stack>
    <Inline className="foundation-color-columns" align="center" gap="md"><Text variant="label">Token and description</Text><Text variant="label">Light value</Text><Text variant="label">Dark value</Text></Inline>
    <Stack className="foundation-color-rows" gap="sm">
      {rows.map((row) => <div className="foundation-color-row" key={row.token}>
        <Stack className="foundation-color-copy" gap="sm">
          <Box as="code" className="foundation-color-token" surface="sunken" radius="sm" paddingX="sm" paddingY="xs"><Text as="span" variant="caption" family="mono">{row.token}</Text></Box>
          <Text variant="body" ink="soft">{row.description}</Text>
        </Stack>
        <ColorValue color={row.light} mode="light" />
        <ColorValue color={row.dark} mode="dark" />
      </div>)}
    </Stack>
  </Stack>
);

const PaletteMatrix = () => {
  const isDark = useResolvedTheme() === "dark";
  const steps = isDark ? [...ACCENT_STEPS].reverse() : ACCENT_STEPS;
  const rows = [
    { name: "Neutral", values: steps.map((step) => PALETTE_TOKENS.neutral[step]) },
    ...(["red", "amber", "green", "blue"] as const).map((palette) => ({ name: palette[0]!.toUpperCase() + palette.slice(1), values: steps.map((step) => PALETTE_TOKENS.accent[palette][step]) })),
  ];
  return (
    <Stack className="foundation-palette-section" gap="md">
      <Inline align="baseline" justify="between" wrap><Stack gap="xs"><Text variant="heading">Palette</Text><Text variant="body" ink="soft">One source ramp · shared by light and dark semantic tokens</Text></Stack><Text variant="caption" family="mono" ink="faint">{isDark ? "950 → 50" : "50 → 950"}</Text></Inline>
      <Box className="foundation-palette-scroll" surface="raised" border radius="lg" padding="md">
        <div className="foundation-palette-matrix">
          <span />{steps.map((step) => <Text key={step} variant="caption" family="mono" ink="faint">{step}</Text>)}
          {rows.flatMap((row) => [
            <Text key={`${row.name}-label`} variant="caption">{row.name}</Text>,
            ...row.values.map((color, index) => <Box key={`${row.name}-${steps[index]}`} className="foundation-palette-swatch" border radius="sm" title={`${row.name} ${steps[index]} · ${color}`} aria-label={`${row.name} ${steps[index]} ${color}`} style={{ background: color }} />),
          ])}
        </div>
      </Box>
    </Stack>
  );
};

const ACCENTS = ["primary", "info", "success", "warning", "error"] as const;
const LADDER = ["solid", "wash", "ink", "soft", "subtle"] as const;
const TEXT_SAMPLES = {
  display: "복잡한 화면을 더 명확하게",
  title: "큰 흐름을 한눈에 보여줍니다",
  heading: "필요한 정보에 집중할 수 있도록",
  subheading: "작업의 맥락을 놓치지 않게",
  body: "팀의 진행 상황과 다음 할 일을 한곳에서 확인하세요.",
  caption: "마지막 수정 · 오늘 오전 10:42",
  label: "담당자 · 진행 상태 · 마감일",
} satisfies Record<TextVariant, string>;
const TEXT_ROLE_DESCRIPTIONS: Record<TextVariant, string> = {
  display: "랜딩 헤드라인",
  title: "페이지 제목",
  heading: "섹션 제목",
  subheading: "작은 제목",
  body: "읽기 본문",
  caption: "보조 정보",
  label: "짧은 이름",
};
const TEXT_VARIANTS = Object.keys(tokens.text.style) as TextVariant[];
const CONTROL_PRESET_ROWS = [
  { role: "Button · regular", path: "button.regular", token: (size: ControlSize) => tokens.text.control.button.regular[size], style: (size: ControlSize) => resolveControlTypography("button", size, "regular"), sample: "Continue" },
  { role: "Button · strong", path: "button.strong", token: (size: ControlSize) => tokens.text.control.button.strong[size], style: (size: ControlSize) => resolveControlTypography("button", size, "strong"), sample: "Save changes" },
  { role: "Field · Input / Select", path: "field", token: (size: ControlSize) => tokens.text.control.field[size], style: (size: ControlSize) => resolveControlTypography("field", size), sample: "Search projects" },
  { role: "Textarea", path: "textarea", token: (size: ControlSize) => tokens.text.control.textarea[size], style: (size: ControlSize) => resolveControlTypography("textarea", size), sample: "Add a description" },
] as const;

const findPaletteToken = (color: string): string => {
  const visit = (value: unknown, path: string[]): string | undefined => {
    if (typeof value === "string") return value.toLowerCase() === color.toLowerCase() ? path.join(".") : undefined;
    if (!value || typeof value !== "object") return undefined;
    for (const [key, child] of Object.entries(value)) {
      const match = visit(child, [...path, key]);
      if (match) return match;
    }
    return undefined;
  };
  return visit(PALETTE_TOKENS, []) ?? "palette";
};

export const Tokens = () => {
  const { section: routeSection } = useParams<{ section: string }>();
  const section = FOUNDATION_SECTIONS.find(([id]) => id === routeSection) ?? FOUNDATION_SECTIONS[0];
  return (
    <PlaygroundLayout value={`foundation-${section[0]}`}>
      <Stack className="foundation-page" gap="xl">
        <ReferenceHeading group="Foundations" name={section[1]} description={`${section[2]} 실제 tokens.*에서 값을 읽으며 현재 테마에 따라 갱신됩니다.`} />

        <Stack className="foundation-content" gap="xl">
          {section[0] === "color" && <Stack gap="xl">
            <PaletteMatrix />
            {COLOR_GROUPS.map((group) => <ColorGroup key={group.title} {...group} />)}
            <ColorGroup {...AccentColorGroup()} />
          </Stack>}

          {section[0] === "typography" && <Section id="typography">
            <Stack className="foundation-subsection" gap="md">
              <Stack gap="xs"><Text variant="heading">Typography Palette</Text><Text variant="body" ink="soft">Text와 Control preset이 함께 참조하는 원본 값입니다.</Text></Stack>
              <Box className="foundation-type-board foundation-typography-palette-board" surface="raised" border radius="lg" padding="md">
              <div className="foundation-typography-palette-header"><Text variant="label" ink="base">Token</Text><Text variant="label" ink="base">Specimen</Text><Text variant="label" ink="base">Value</Text></div>
                {(["fontSize", "weight", "leading", "tracking", "family"] as const).map((group) => {
                  const values = tokens.text.palette[group] as Record<string, string>;
                  const labels: Record<typeof group, string> = { fontSize: "Font size", weight: "Weight", leading: "Leading", tracking: "Tracking", family: "Family" };
                  return <div className="foundation-typography-palette-group" key={group}>
                    <Text className="foundation-typography-palette-group-label" variant="label" ink="soft">{labels[group]}</Text>
                    {Object.entries(values).map(([name, value]) => <div className="foundation-typography-palette-row" key={`${group}-${name}`}>
                      <Text className="foundation-typography-palette-token" as="code" variant="caption" family="mono" ink="base">text.palette.{group}.{name}</Text>
                      <TypographyPaletteSpecimen group={group} name={name} value={value} />
                      <Text className="foundation-typography-palette-value" variant="caption" family="mono" ink="base">{val(value)}</Text>
                    </div>)}
                  </div>;
                })}
              </Box>
            </Stack>
            <Stack className="foundation-subsection" gap="md">
              <Stack gap="xs"><Text variant="heading">Type scale</Text><Text variant="body" ink="soft">페이지 제목부터 보조 정보까지, 화면에서 맡은 역할로 크기와 굵기를 고릅니다.</Text></Stack>
              <Box className="foundation-type-board" surface="raised" border radius="lg" padding="md">
                <div className="foundation-type-header"><Text variant="label" ink="base">Role</Text><Text variant="label" ink="base">Specimen</Text><Text variant="label" ink="base">Weight</Text><Text variant="label" ink="base">Size / leading</Text></div>
                <div className="foundation-type-list">{TEXT_VARIANTS.map((variant) => {
                  const size = val(tokens.text.style[variant].size);
                  const leading = val(tokens.text.style[variant].leading);
                  const weight = val(tokens.text.style[variant].weight);
                  const px = (value: string) => value.match(/([\d.]+px)$/)?.[1] ?? value;
                  return <div key={variant} className="foundation-type-row">
                    <Stack className="foundation-type-role" gap="xs"><Text as="code" variant="caption" family="mono" ink="base">text.{variant}</Text><Text variant="caption" ink="base">{TEXT_ROLE_DESCRIPTIONS[variant]}</Text></Stack>
                    <Text as="p" variant={variant} ink="base" className="foundation-type-sample">{TEXT_SAMPLES[variant]}</Text>
                    <Text className="foundation-type-weight" variant="caption" family="mono" ink="base">{weight}</Text>
                    <Text className="foundation-type-measure" variant="caption" family="mono" ink="base" title={`${size} / ${leading}`}>{px(size)} / {px(leading)}</Text>
                  </div>;
                })}</div>
              </Box>
              <Stack gap="xs"><Text variant="heading">Control presets</Text><Text variant="body" ink="soft">비슷한 컴포넌트는 같은 완성 typography class를 공유합니다. size는 geometry와 함께 선택됩니다.</Text></Stack>
              <Box className="foundation-control-type-board" surface="raised" border radius="lg" padding="md">
                <div className="foundation-control-type-header"><Text variant="label" ink="base">Preset</Text>{(["sm", "md", "lg"] as const).map((size) => <Text key={size} variant="label" ink="base">{size}</Text>)}</div>
                {CONTROL_PRESET_ROWS.map((row) => <div className="foundation-control-type-row" key={row.path}>
                  <Stack gap="xs"><Text as="code" variant="caption" family="mono" ink="base">text.control.{row.path}</Text><Text variant="caption" ink="soft">{row.role}</Text></Stack>
                  {(["sm", "md", "lg"] as const).map((size) => {
                    const spec = row.token(size);
                    const px = (value: string) => val(value).match(/([\d.]+px)$/)?.[1] ?? val(value);
                    return <Stack className="foundation-control-type-cell" key={size} gap="xs">
                      <span className={row.style(size)}>{row.sample}</span>
                      <Text variant="caption" family="mono" ink="faint">{px(spec.size)} / {px(spec.leading)} · {val(spec.weight)}</Text>
                    </Stack>;
                  })}
                </div>)}
                <div className="foundation-control-type-row">
                  <Stack gap="xs"><Text as="code" variant="caption" family="mono" ink="base">text.control.badge</Text><Text variant="caption" ink="soft">고정 크기 표식</Text></Stack>
                  <Stack className="foundation-control-type-cell" gap="xs"><span className={resolveControlTypography("badge")}>In progress</span><Text variant="caption" family="mono" ink="faint">badge · 12 / 16 · 500</Text></Stack>
                  <Stack className="foundation-control-type-cell" gap="xs"><span className={resolveControlTypography("button", "md", "regular")}>Button · regular</span><Text variant="caption" family="mono" ink="faint">13 / 16 · 500</Text></Stack>
                  <Stack className="foundation-control-type-cell" gap="xs"><span className={resolveControlTypography("button", "md", "strong")}>Button · strong</span><Text variant="caption" family="mono" ink="faint">13 / 16 · 650</Text></Stack>
                </div>
              </Box>
            </Stack>
          </Section>}

          {section[0] === "shape" && <Section id="shape">
            <Text className="foundation-note" variant="caption" ink="soft">원본(source)만 CSS 변수로 굽고, 역할은 그 변수의 별칭이거나 쓰이는 자리에서 계산되는 식입니다. 파생 값은 브라우저가 계산한 결과를 보여줍니다.</Text>
            <Subsection title="Inset" note="요소 안쪽 여백. Layout gap과 같은 scale을 씁니다.">
              <Stack className="foundation-scale" gap="sm">{SPACE_KEYS.map((step) => <ValueRow key={step} name={`shape.inset.${step}`} value={tokens.shape.inset[step]} sample={<Box className="foundation-measure" radius="full" style={{ width: tokens.shape.inset[step], height: tokens.shape.inset.xs, background: tokens.color.accent.primary.solid }} />} />)}</Stack>
            </Subsection>
            <Subsection title="Radius" note="모서리는 날만 죽이고, 같은 가족은 크기와 무관하게 한 값을 씁니다.">
              <div className="foundation-radius-list">{RADIUS_ROWS.map(([name, value]) => <Stack key={name} gap="sm"><Box className="foundation-radius-sample" border style={{ borderRadius: value }} surface="sunken" /><Text as="code" variant="caption" family="mono">radius.{name}</Text><Text variant="caption" family="mono" ink="faint">{val(value)}</Text></Stack>)}</div>
            </Subsection>
            <Subsection title="Stroke · Focus" note="선과 포커스 링은 rem으로 커지지 않는 px입니다. icon은 24 artboard의 SVG 단위입니다.">
              <div className="foundation-value-grid">{Object.entries(tokens.shape.stroke).map(([name, value]) => <ValueRow key={name} name={`shape.stroke.${name}`} value={value} />)}{Object.entries(tokens.shape.focus).map(([name, value]) => <ValueRow key={name} name={`shape.focus.${name}`} value={value} />)}</div>
            </Subsection>
            <Subsection title="Control" note="높이만 원본이고, inset은 컨트롤 글자 줄에서, 선택 표식은 높이의 절반에서 계산합니다.">
              <Inline className="foundation-control-samples" gap="lg" align="end" wrap>{CONTROL_SIZES.map((size) => <Stack key={size} gap="xs" align="start"><Box className="foundation-control" border radius="sm" surface="sunken" style={{ height: tokens.shape.control.height[size], paddingInline: tokens.shape.control.inset.button[size] }}><Text variant="body">Aa</Text></Box><Text variant="caption" family="mono" ink="faint">{size} · <Computed value={tokens.shape.control.height[size]} /></Text></Stack>)}</Inline>
              <div className="foundation-value-grid">
                {CONTROL_SIZES.map((size) => <ValueRow key={`input-${size}`} name={`control.inset.input.${size}`} value={tokens.shape.control.inset.input[size]} />)}
                {CONTROL_SIZES.map((size) => <ValueRow key={`button-${size}`} name={`control.inset.button.${size}`} value={tokens.shape.control.inset.button[size]} />)}
                {CONTROL_SIZES.map((size) => <ValueRow key={`icon-${size}`} name={`control.icon.${size}`} value={tokens.shape.control.icon[size]} />)}
                {CONTROL_SIZES.map((size) => <ValueRow key={`selection-${size}`} name={`selection.size.${size}`} value={tokens.shape.selection.size[size]} />)}
                <ValueRow name="control.gap" value={tokens.shape.control.gap} />
              </div>
            </Subsection>
            <Subsection title="Sizing" note="아이콘은 옆에 서는 Text 역할 이름을, Box의 이름 있는 크기와 읽기 폭은 다섯 단계를 씁니다.">
              <div className="foundation-value-grid">
                {ICON_SIZES.map((size) => <ValueRow key={`icon-${size}`} name={`icon.size.${size}`} value={tokens.shape.icon.size[size]} />)}
                {DIMENSION_KEYS.map((step) => <ValueRow key={`width-${step}`} name={`dimension.width.${step}`} value={tokens.shape.dimension.width[step]} />)}
                {DIMENSION_KEYS.map((step) => <ValueRow key={`height-${step}`} name={`dimension.height.${step}`} value={tokens.shape.dimension.height[step]} />)}
                {DIMENSION_KEYS.map((step) => <ValueRow key={`measure-${step}`} name={`measure.${step}`} value={tokens.shape.measure[step]} />)}
              </div>
            </Subsection>
          </Section>}

          {section[0] === "layout" && <Section id="layout">
            <Subsection title="Gap" note="형제 사이의 거리. Shape inset과 같은 scale이라 같은 단계는 같은 길이입니다.">
              <Stack className="foundation-scale" gap="sm">{SPACE_KEYS.map((step) => <ValueRow key={step} name={`layout.gap.${step}`} value={tokens.layout.gap[step]} sample={<Box className="foundation-measure" radius="full" style={{ width: tokens.layout.gap[step], height: tokens.shape.inset.xs, background: tokens.color.ink.tertiary }} />} />)}</Stack>
            </Subsection>
            <Subsection title="Page" note="페이지 가장자리와 내용 사이(gutter), 본문 최대 폭, 뷰포트 분기점입니다. breakpoint는 미디어 쿼리가 변수를 못 읽어 값으로 둡니다.">
              <div className="foundation-value-grid">
                <ValueRow name="layout.gutter" value={tokens.layout.gutter} />
                {Object.entries(tokens.layout.container).map(([name, value]) => <ValueRow key={`container-${name}`} name={`container.${name}`} value={value} />)}
                {Object.entries(tokens.layout.breakpoint).map(([name, value]) => <ValueRow key={`bp-${name}`} name={`breakpoint.${name}`} value={value} />)}
              </div>
            </Subsection>
            <Subsection title="Elevation" note="층 하나가 쌓임 순서(z)와 그림자를 함께 정합니다. 떠 있는 층만 그림자를 갖고, 색은 Color의 shadow tint에서 옵니다.">
              <div className="foundation-elevation-list">{ELEVATIONS.map((level) => <Stack key={level} className="foundation-shadow-sample" gap="sm" surface="raised" border radius="md" padding="md" style={{ boxShadow: tokens.layout.elevation[level].shadow }}><Text as="code" variant="caption" family="mono">elevation.{level}</Text><Text variant="caption" family="mono" ink="faint">z {val(tokens.layout.elevation[level].z)}</Text></Stack>)}</div>
              <Stack className="foundation-overlay-demo" gap="sm" surface="sunken" border radius="md" padding="md"><Box className="foundation-scrim-sample" radius="sm" style={{ background: tokens.color.overlay.scrim }} /><Text variant="caption">modal 아래 scrim · color.overlay.scrim · {val(tokens.color.overlay.scrim)}</Text></Stack>
            </Subsection>
          </Section>}

          {section[0] === "motion" && <Section id="motion">
            <div className="foundation-value-grid">{Object.entries(tokens.motion.duration).map(([name, value]) => <ValueRow key={`duration-${name}`} name={`duration.${name}`} value={value} />)}{Object.entries(tokens.motion.easing).map(([name, value]) => <ValueRow key={`easing-${name}`} name={`easing.${name}`} value={value} />)}</div>
            <Inline className="foundation-motion-demo" gap="md" align="center" wrap><Button>Hover to preview</Button><Text variant="caption" family="mono" ink="faint">color · {val(tokens.motion.duration.base)} · {val(tokens.motion.easing.standard)}</Text></Inline>
          </Section>}
        </Stack>
      </Stack>
    </PlaygroundLayout>
  );
};
