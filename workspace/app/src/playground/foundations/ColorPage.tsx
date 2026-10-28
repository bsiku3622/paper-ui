// Color — the page as it was before the Foundations kit: the palette matrix on a raised panel,
// then each semantic group with its light and dark values side by side.

import { Box, Inline, Stack, Text, useResolvedTheme } from "@studio-baeks/paper-ui";

import { COLOR_VALUES, COLOR_VALUES_DARK } from "../../../../packages/paper-ui/src/tokens/colors";
import { ACCENT_STEPS, PALETTE_TOKENS } from "../../../../packages/paper-ui/src/tokens/palette";
import "./color-page.css";

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

export const ColorPage = () => (
  <Stack gap="xl">
    <PaletteMatrix />
    {COLOR_GROUPS.map((group) => <ColorGroup key={group.title} {...group} />)}
    <ColorGroup {...AccentColorGroup()} />
  </Stack>
);
