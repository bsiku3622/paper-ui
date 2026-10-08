// Foundations — 역할별 디자인 토큰을 계층대로 살펴보는 reference page.

import { useParams } from "react-router-dom";

import { Box, Button, Inline, PageHeader, Stack, Text, tokens, useResolvedTheme, resolveControlTypography, type TextVariant, type ControlSize } from "@studio-baeks/paper-ui";

import { COLOR_VALUES, COLOR_VALUES_DARK } from "../../../packages/paper-ui/src/tokens/colors";
import { ACCENT_STEPS, PALETTE_TOKENS } from "../../../packages/paper-ui/src/tokens/palette";
import { PlaygroundLayout, Crumb } from "./shell";
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

const ValueRow = ({ name, value, sample }: { name: string; value: string; sample?: React.ReactNode }) => (
  <Inline className="foundation-value-row" align="center" gap="sm">
    <Text as="code" variant="caption" family="mono">{name}</Text>{sample}
    <Text variant="caption" family="mono" ink="faint">{val(value)}</Text>
  </Inline>
);

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
    { token: "control.track", description: "Switch and SegmentedControl track", light: COLOR_VALUES.control.track, dark: COLOR_VALUES_DARK.control.track },
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
        <PageHeader>
          <PageHeader.Location><Crumb group="Foundations" name={section[1]} /></PageHeader.Location>
          <PageHeader.Content><PageHeader.Title>{section[1]}</PageHeader.Title><PageHeader.Description>{section[2]} 실제 <code>tokens.*</code>에서 값을 읽으며 현재 테마에 따라 갱신됩니다.</PageHeader.Description></PageHeader.Content>
        </PageHeader>

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
                <div className="foundation-control-type-row foundation-control-type-states">
                  <Stack gap="xs"><Text as="code" variant="caption" family="mono" ink="base">text.control.navigation</Text><Text variant="caption" ink="soft">Sidebar · Tree · Menu · Navbar · Command</Text></Stack>
                  <Stack className="foundation-control-type-cell" gap="xs"><span className={resolveControlTypography("navigation", "regular")}>Navigation item</span><Text variant="caption" family="mono" ink="faint">14 / 20 · 450</Text></Stack>
                  <Stack className="foundation-control-type-cell" gap="xs"><span className={resolveControlTypography("navigation", "active")}>Active item</span><Text variant="caption" family="mono" ink="faint">14 / 20 · 500</Text></Stack>
                  <Stack className="foundation-control-type-cell" gap="xs"><span className={resolveControlTypography("navigation", "groupLabel")}>Group label</span><Text variant="caption" family="mono" ink="faint">13 / 16 · 600 · +0.01em</Text></Stack>
                </div>
                <div className="foundation-control-type-row foundation-control-type-fixed">
                  <Stack gap="xs"><Text as="code" variant="caption" family="mono" ink="base">text.control.badge / tooltip</Text><Text variant="caption" ink="soft">크기와 무관한 역할</Text></Stack>
                  <Stack className="foundation-control-type-cell" gap="xs"><span className={resolveControlTypography("badge")}>In progress</span><Text variant="caption" family="mono" ink="faint">badge · 12 / 16 · 500</Text></Stack>
                  <Stack className="foundation-control-type-cell" gap="xs"><span className={resolveControlTypography("tooltip", "regular")}>Tooltip text</span><Text variant="caption" family="mono" ink="faint">tooltip · 12 / 16 · 450</Text></Stack>
                  <Stack className="foundation-control-type-cell" gap="xs"><span className={resolveControlTypography("button", "md", "regular")}>Tab · segmented</span><Text variant="caption" family="mono" ink="faint">action · 13 / 16 · 500</Text></Stack>
                </div>
              </Box>
              <Text variant="caption" ink="soft">공유 매핑: Tab·Segmented → Button regular · md, Navbar·Command → Navigation active, Banner·Table of Contents 기본 → Text caption</Text>
            </Stack>
          </Section>}

          {section[0] === "spacing" && <Section id="spacing">
            <Stack className="foundation-scale" gap="sm">{(["xs", "sm", "md", "lg", "xl"] as const).map((size) => <ValueRow key={size} name={`shape.gap.${size}`} value={tokens.shape.gap[size]} sample={<Box className="foundation-measure" radius="full" style={{ width: tokens.shape.gap[size], height: tokens.shape.gap.xs, background: tokens.color.accent.primary.solid }} />} />)}</Stack>
            <Inline className="foundation-inline-note" align="baseline" gap="md"><Text variant="subheading">Padding</Text><Text variant="caption" ink="soft">interaction과 layout 맥락에서 별도 scale을 사용합니다.</Text></Inline>
            <div className="foundation-value-grid">{Object.entries(tokens.shape.padding).flatMap(([size, values]) => Object.entries(values).map(([context, value]) => <ValueRow key={`${size}-${context}`} name={`padding.${size}.${context}`} value={value} />))}</div>
          </Section>}

          {section[0] === "sizing" && <Section id="sizing">
            <Stack className="foundation-subsection" gap="md"><Text variant="subheading">Control height</Text><Inline className="foundation-control-samples" gap="lg" align="end" wrap>{(["sm", "md", "lg"] as const).map((size) => <Stack key={size} gap="xs" align="start"><Box className="foundation-control" border radius="sm" surface="sunken" style={{ height: tokens.shape.height[size].interaction, paddingInline: tokens.shape.controlPaddingX[size] }}><Text variant="body">Aa</Text></Box><Text variant="caption" family="mono" ink="faint">{size} · {val(tokens.shape.height[size].interaction)}</Text></Stack>)}</Inline></Stack>
            <div className="foundation-value-grid">
              {Object.entries(tokens.shape.icon).map(([name, value]) => <ValueRow key={`icon-${name}`} name={`icon.${name}`} value={value} />)}
              {Object.entries(tokens.shape.checkbox).map(([name, value]) => <ValueRow key={`checkbox-${name}`} name={`checkbox.${name}.box`} value={value.box} />)}
              {Object.entries(tokens.shape.switch).map(([name, value]) => <ValueRow key={`switch-${name}`} name={`switch.${name}`} value={`${value.w} × ${value.h}`} />)}
              {Object.entries(tokens.shape.width).map(([name, value]) => <ValueRow key={`width-${name}`} name={`width.${name}`} value={value.layout} />)}
              {Object.entries(tokens.layout.breakpoint).map(([name, value]) => <ValueRow key={`bp-${name}`} name={`breakpoint.${name}`} value={value} />)}
              {Object.entries(tokens.layout.container).map(([name, value]) => <ValueRow key={`container-${name}`} name={`container.${name}`} value={value} />)}
              {Object.entries(tokens.layout.sizeIntent).map(([name, value]) => <ValueRow key={`intent-${name}`} name={`sizeIntent.${name}`} value={value} />)}
            </div>
          </Section>}

          {section[0] === "radius" && <Section id="radius">
            <div className="foundation-radius-list">{[
              ["interaction", tokens.shape.radius.interaction], ["layout.sm", tokens.shape.radius.layout.sm], ["layout.md", tokens.shape.radius.layout.md], ["layout.lg", tokens.shape.radius.layout.lg], ["full", tokens.shape.radius.full],
            ].map(([name, value]) => <Stack key={name as string} gap="sm"><Box className="foundation-radius-sample" border radius={name === "interaction" || name === "full" ? name as "full" : name === "layout.sm" ? "sm" : name === "layout.md" ? "md" : "lg"} surface="sunken" /><Text as="code" variant="caption" family="mono">radius.{name}</Text><Text variant="caption" family="mono" ink="faint">{val(value as string)}</Text></Stack>)}</div>
          </Section>}

          {section[0] === "border" && <Section id="border">
            <div className="foundation-border-demo">{(["base", "strong", "hover"] as const).map((key) => <Stack key={key} className="foundation-border-sample" gap="md" surface="raised" border radius="md" padding="md" style={{ borderColor: tokens.color.border[key] }}><Text as="code" variant="caption" family="mono">border.{key}</Text><Text variant="caption" family="mono" ink="faint">{val(tokens.color.border[key])}</Text></Stack>)}</div>
            <div className="foundation-value-grid"><ValueRow name="shape.constants.borderWidth" value={tokens.shape.constants.borderWidth} /><ValueRow name="shape.constants.focusRingWidth" value={tokens.shape.constants.focusRingWidth} /></div>
          </Section>}

          {section[0] === "elevation" && <Section id="elevation">
            <div className="foundation-elevation-demo"><Stack className="foundation-overlay-demo" gap="sm" surface="sunken" border radius="md" padding="md"><Box className="foundation-scrim-sample" radius="sm" style={{ background: tokens.color.overlay.scrim }} /><Text variant="caption">overlay.scrim · {val(tokens.color.overlay.scrim)}</Text></Stack><div className="foundation-shadow-demo">{(["overlay", "overlayMinimal"] as const).map((key) => <Stack key={key} className="foundation-shadow-sample" gap="md" surface="raised" border radius="md" padding="md" style={{ boxShadow: tokens.shape.shadow[key] }}><Text variant="caption">shadow.{key}</Text><Text as="code" variant="caption" family="mono" ink="faint">color.shadow.{key}</Text></Stack>)}</div></div>
            <Text className="foundation-note" variant="caption" ink="soft">Scrim은 뒤쪽 화면을 눌러 overlay와의 깊이를 보여주는 면이고, shadow는 표면 아래의 빛과 깊이를 나타냅니다.</Text>
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
