// Color — the palette matrix on a raised panel, then each semantic group as rows of token and
// value card, then the accent × variant combinations. Values are the current theme's: switching
// the theme switches every card. Every row comes from the selection table (color-roles.ts).

import { Badge, Button, Inline, Stack, Surface, Text, useResolvedTheme } from "@studio-baeks/paper-ui";
import { ACCENTS, ACCENT_TONES, VARIANTS, type ColorMode } from "@studio-baeks/paper-ui/tokens";

import { VARIANT_RECIPE } from "../../../../packages/paper-ui/src/tokens/color-recipes";
import { ACCENT_PALETTE } from "../../../../packages/paper-ui/src/tokens/colors";
import { ACCENT_PALETTES, ACCENT_STEPS, PALETTE_TOKENS } from "../../../../packages/paper-ui/src/tokens/palette";
import { GROUPS, ROLE_NOTES, formatPalettePath, hexAt, rolesOf, selectionAt } from "./color-roles";
import { Chip, StepGrid, Swatch } from "./kit";
import type { ChipRole } from "./kit.css";
import * as s from "./color-page.css";

const useThemeValues = (): { mode: ColorMode; label: string } => {
  const mode = useResolvedTheme() === "dark" ? "dark" : "light";
  return { mode, label: mode === "dark" ? "Dark value" : "Light value" };
};

// A role as it renders now: its chip on the page canvas, the Palette Token it selects and the HEX.
const ColorValue = ({ path, mode, compact = false }: { path: ChipRole; mode: ColorMode; compact?: boolean }) => {
  const paletteToken = formatPalettePath(selectionAt(mode, path));
  const hex = hexAt(mode, path);
  return (
    <Surface as={Stack} className={compact ? `${s.value} ${s.valueCompact}` : s.value} fill="canvas" gap="sm" border radius="md" padding="sm" title={`${paletteToken} · ${hex}`}>
      <Chip path={path} />
      <div className={s.meta}>
        <Text as="span" variant="caption" family="mono" ink="primary">{paletteToken}</Text>
        <Text as="span" variant="caption" family="mono" ink="tertiary">{hex}</Text>
      </div>
    </Surface>
  );
};

const TokenPill = ({ token }: { token: string }) => (
  <Surface as="code" className={s.token} fill="sunken" radius="sm" paddingX="sm" paddingY="xs"><Text as="span" variant="caption" family="mono">{token}</Text></Surface>
);

const SectionHeading = ({ title, description }: { title: string; description: string }) => (
  <Stack gap="xs"><Text variant="heading">{title}</Text><Text variant="body" ink="secondary">{description}</Text></Stack>
);

const ColorGroup = ({ title, description, branches }: (typeof GROUPS)[number]) => {
  const { mode, label } = useThemeValues();
  return (
    <Stack as="section" className={s.section} gap="md">
      <SectionHeading title={title} description={description} />
      <Inline className={s.columns} align="center" gap="md"><Text variant="label">Token and description</Text><Text variant="label">{label}</Text></Inline>
      <Stack gap="sm">
        {rolesOf(branches).map((role) => <div className={s.row} key={role}>
          <Stack className={s.copy} gap="sm">
            <TokenPill token={role} />
            <Text variant="body" ink="secondary">{ROLE_NOTES[role]}</Text>
          </Stack>
          <ColorValue path={role} mode={mode} />
        </div>)}
      </Stack>
    </Stack>
  );
};

// The five accents share the same tones, so they read best side by side: one row per accent.
const AccentGroup = () => {
  const { mode } = useThemeValues();
  return (
    <Stack as="section" className={s.section} gap="md">
      <SectionHeading title="Accent" description="의미 이름 다섯이 같은 다섯 tone을 공유합니다. solid는 채운 면과 상태 점, wash는 solid 위 글자, ink는 지면 위 색 글자, soft는 옅은 면, subtle은 muted 글자입니다." />
      <div className={s.toneScroll}>
        <div className={s.toneColumns}><Text variant="label">Accent</Text>{ACCENT_TONES.map((tone) => <Text key={tone} variant="label">{tone}</Text>)}</div>
        {ACCENTS.map((accent) => (
          <div className={s.toneRow} key={accent}>
            <Stack className={s.copy} gap="sm">
              <TokenPill token={`accent.${accent}`} />
              <Text variant="body" ink="secondary">{ACCENT_PALETTE[accent]}</Text>
            </Stack>
            {ACCENT_TONES.map((tone) => <ColorValue key={tone} path={`accent.${accent}.${tone}`} mode={mode} compact />)}
          </div>
        ))}
      </div>
    </Stack>
  );
};

const PaletteMatrix = () => {
  const isDark = useResolvedTheme() === "dark";
  const steps = isDark ? [...ACCENT_STEPS].reverse() : ACCENT_STEPS;
  const rows = [
    { name: "Neutral", values: steps.map((step) => PALETTE_TOKENS.neutral[step]) },
    ...[...ACCENT_PALETTES].reverse().map((palette) => ({ name: palette[0]!.toUpperCase() + palette.slice(1), values: steps.map((step) => PALETTE_TOKENS.accent[palette][step]) })),
  ];
  return (
    <Stack gap="md">
      <Inline align="baseline" justify="between" wrap><SectionHeading title="Palette" description="테마와 무관한 원본 ramp 하나입니다. light와 dark의 의미 역할이 모두 여기서 단계를 고릅니다." /><Text variant="caption" family="mono" ink="tertiary">{isDark ? "950 → 50" : "50 → 950"}</Text></Inline>
      <Surface className={s.paletteScroll} fill="raised" border radius="lg" padding="md">
        <StepGrid steps={steps.length} data-testid="palette-matrix">
          <span className={s.headCell} />{steps.map((step) => <Text key={step} className={s.headCell} variant="caption" family="mono" ink="tertiary">{step}</Text>)}
          {rows.flatMap((row) => [
            <Text key={`${row.name}-label`} className={s.rowLabel} variant="caption">{row.name}</Text>,
            ...row.values.map((color, index) => <Swatch key={`${row.name}-${steps[index]}`} color={color} label={`${row.name} ${steps[index]}`} />),
          ])}
        </StepGrid>
      </Surface>
    </Stack>
  );
};

// What a variant picks from the five tones, read from the recipe that colours it.
const recipeCaption = (variant: (typeof VARIANTS)[number]) => {
  const { face, ink, hover } = VARIANT_RECIPE[variant];
  return `면 ${face === "none" ? "없음" : face} · 글자 ${ink} · hover ${hover}`;
};

// Each variant combined with each accent: the real Button and Badge, so the table is the evidence.
const AccentVariantGroup = () => (
  <Stack as="section" className={s.section} gap="md">
    <SectionHeading title="Accent × variant" description="Atom은 accent와 variant 두 축만 말하고, 각 조합이 어떤 tone을 쓰는지는 color profile이 정합니다. 각 칸은 실제 Button과 Badge입니다." />
    <div className={s.toneScroll}>
      <div role="table" aria-label="Accent and button variant combinations" data-testid="color-variant-matrix">
        <div role="row" className={s.toneColumns}>
          <Text role="columnheader" variant="label">Variant</Text>
          {ACCENTS.map((accent) => <Text key={accent} role="columnheader" variant="label">{accent}</Text>)}
        </div>
        {VARIANTS.map((variant) => (
          <div role="row" className={s.toneRow} key={variant}>
            <Stack role="rowheader" className={s.copy} gap="sm">
              <TokenPill token={variant} />
              <Text variant="body" ink="secondary">{recipeCaption(variant)}</Text>
            </Stack>
            {ACCENTS.map((accent) => (
              <Stack role="cell" key={accent} gap="sm" align="start">
                <Button size="sm" accent={accent} variant={variant}>{accent}</Button>
                <Badge accent={accent} variant={variant}>{accent}</Badge>
              </Stack>
            ))}
          </div>
        ))}
      </div>
    </div>
  </Stack>
);

export const ColorPage = () => (
  <Stack gap="xl">
    <PaletteMatrix />
    {GROUPS.map((group) => <ColorGroup key={group.title} {...group} />)}
    <AccentGroup />
    <AccentVariantGroup />
  </Stack>
);
