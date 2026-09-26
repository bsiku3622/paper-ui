// Foundations — 역할별 디자인 토큰을 계층대로 살펴보는 reference page.

import { useParams } from "react-router-dom";

import { Box, Button, Inline, PageHeader, Stack, Text, tokens, useResolvedTheme } from "@studio-baeks/paper-ui";

import { COLOR_VALUES, COLOR_VALUES_DARK } from "../../../packages/paper-ui/src/tokens/colors";
import { PALETTE_TOKENS } from "../../../packages/paper-ui/src/tokens/color-ladder";
import { ACCENT_STEPS } from "../../../packages/paper-ui/src/tokens/palette";
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

type ColorRow = { token: string; description: string; light: string; dark: string };
const semanticRows = (branch: "bg" | "ink" | "border", names: readonly string[], descriptions: Record<string, string>): ColorRow[] =>
  names.map((name) => ({
    token: `${branch}.${name}`,
    description: descriptions[name] ?? name,
    light: COLOR_VALUES[branch][name as keyof (typeof COLOR_VALUES)[typeof branch]] as string,
    dark: COLOR_VALUES_DARK[branch][name as keyof (typeof COLOR_VALUES_DARK)[typeof branch]] as string,
  }));

const COLOR_GROUPS: { title: string; description: string; rows: ColorRow[] }[] = [
  { title: "Background", description: "Surface depth and neutral interaction context.", rows: semanticRows("bg", ["canvas", "raised", "sunken", "well"], { canvas: "Default page surface", raised: "Cards and floating surfaces", sunken: "Recessed controls and grouped areas", well: "Deep inset surface" }) },
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
  description: "Semantic accent names share the same four-step ladder.",
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
const LADDER = ["solid", "wash", "soft", "subtle"] as const;
const TEXT_VARIANTS = ["display", "title", "heading", "subheading", "body", "caption", "label"] as const;
const WEIGHTS = ["regular", "normal", "medium", "semibold", "bold"] as const;

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
              <Text variant="heading">Type scale</Text>
              <Stack className="foundation-type-list" gap="sm">{TEXT_VARIANTS.map((variant) => <Inline key={variant} className="foundation-type-row" align="baseline" gap="md"><Text as="code" variant="caption" family="mono" ink="faint">text.{variant}</Text><Text variant={variant}>{variant === "display" || variant === "title" ? "Aa 가나다 0123" : "Aa · 가나다 · 0123"}</Text><Text variant="caption" family="mono" ink="faint">{val(tokens.text.size[variant])}</Text></Inline>)}</Stack>
            </Stack>
            <Inline className="foundation-weight-list" gap="lg" wrap>{WEIGHTS.map((weight) => <Stack key={weight} gap="xs"><Text variant="body" style={{ fontWeight: tokens.text.weight[weight] }}>Paper UI · {weight}</Text><Text as="code" variant="caption" family="mono" ink="faint">{weight} · {val(tokens.text.weight[weight])}</Text></Stack>)}</Inline>
            <Inline gap="xl" wrap><Stack gap="xs"><Text variant="heading" family="sans">Aa 가나다 0123</Text><Text variant="caption" ink="soft">sans · default</Text></Stack><Stack gap="xs"><Text variant="heading" family="mono">Aa 0123</Text><Text variant="caption" ink="soft">mono · code and numeric labels</Text></Stack></Inline>
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
