// Color — the palette matrix on a raised panel, then each semantic group as rows of token and
// value card. Values are the current theme's: switching the theme switches every card.

import { Box, Inline, Stack, Text, tokens, useResolvedTheme } from "@studio-baeks/paper-ui";

import { COLOR_VALUES, COLOR_VALUES_DARK } from "../../../../packages/paper-ui/src/tokens/colors";
import { ACCENT_STEPS, PALETTE_TOKENS } from "../../../../packages/paper-ui/src/tokens/palette";
import "./color-page.css";

type Values = typeof COLOR_VALUES;
// `pick` reads the role from either theme's values; `live` is the token the chip paints with.
type ColorRow = { token: string; description: string; pick: (values: Values) => string; live: string };
const c = tokens.color;

const COLOR_GROUPS: { title: string; description: string; rows: ColorRow[] }[] = [
  { title: "Background", description: "페이지와 컨테이너 면의 깊이입니다.", rows: [
    { token: "bg.canvas", description: "기본 페이지 면", pick: (v) => v.bg.canvas, live: c.bg.canvas },
    { token: "bg.raised", description: "카드와 떠 있는 면", pick: (v) => v.bg.raised, live: c.bg.raised },
    { token: "bg.sunken", description: "가라앉은 영역", pick: (v) => v.bg.sunken, live: c.bg.sunken },
  ] },
  { title: "Control", description: "컨트롤 안쪽에만 쓰는 면입니다.", rows: [
    { token: "control.track", description: "Switch 트랙, 진행 막대의 홈", pick: (v) => v.control.track, live: c.control.track },
  ] },
  { title: "Text", description: "면 위 글자의 위계입니다.", rows: [
    { token: "ink.primary", description: "본문과 제목", pick: (v) => v.ink.primary, live: c.ink.primary },
    { token: "ink.secondary", description: "보조 내용", pick: (v) => v.ink.secondary, live: c.ink.secondary },
    { token: "ink.tertiary", description: "메타 정보와 낮은 강조", pick: (v) => v.ink.tertiary, live: c.ink.tertiary },
  ] },
  { title: "Border", description: "구조를 나누는 경계와 강조입니다.", rows: [
    { token: "border.base", description: "기본 컴포넌트 경계", pick: (v) => v.border.base, live: c.border.base },
    { token: "border.strong", description: "대비가 높은 경계", pick: (v) => v.border.strong, live: c.border.strong },
    { token: "border.hover", description: "포인터가 올라온 입력칸의 경계", pick: (v) => v.border.hover, live: c.border.hover },
  ] },
  { title: "Interaction", description: "상태 overlay와 키보드 포커스입니다.", rows: [
    { token: "interaction.bgHover.onSurface", description: "중립 면 위 hover overlay", pick: (v) => v.interaction.bgHover.onSurface, live: c.interaction.bgHover.onSurface },
    { token: "interaction.bgHover.onPrimarySolid", description: "primary solid 위 hover overlay", pick: (v) => v.interaction.bgHover.onPrimarySolid, live: c.interaction.bgHover.onPrimarySolid },
    { token: "interaction.bgHover.onAccentSolid", description: "상태색 solid 위 hover overlay", pick: (v) => v.interaction.bgHover.onAccentSolid, live: c.interaction.bgHover.onAccentSolid },
    { token: "interaction.selected", description: "선택된 항목의 면", pick: (v) => v.interaction.selected, live: c.interaction.selected },
    { token: "interaction.active", description: "누르는 중인 면", pick: (v) => v.interaction.active, live: c.interaction.active },
    { token: "interaction.focus", description: "키보드 포커스 표시", pick: (v) => v.interaction.focus, live: c.interaction.focus },
  ] },
  { title: "Overlay · Shadow", description: "모달 scrim과 그림자의 색입니다. 그림자의 모양과 층은 Layout의 elevation이 정합니다.", rows: [
    { token: "overlay.scrim", description: "모달 뒤를 어둡게 누르는 면", pick: (v) => v.overlay.scrim, live: c.overlay.scrim },
    { token: "shadow.overlay", description: "떠 있는 층(overlay · modal · toast) 그림자의 색", pick: (v) => v.shadow.overlay, live: c.shadow.overlay },
    { token: "shadow.overlayMinimal", description: "살짝 들린 층(raised) 그림자의 색", pick: (v) => v.shadow.overlayMinimal, live: c.shadow.overlayMinimal },
  ] },
];

const ACCENTS = ["primary", "info", "success", "warning", "error"] as const;
const LADDER = ["solid", "wash", "ink", "soft", "subtle"] as const;
const FAMILY: Record<(typeof ACCENTS)[number], string> = { primary: "neutral", info: "blue", success: "green", warning: "amber", error: "red" };

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
  return (visit(PALETTE_TOKENS, []) ?? "palette").replace(/^accent\./, "");
};

const useTheme = () => {
  const dark = useResolvedTheme() === "dark";
  return { dark, values: dark ? (COLOR_VALUES_DARK as Values) : COLOR_VALUES, label: dark ? "Dark value" : "Light value" };
};

// A role as it renders now: its chip on the page canvas, the Palette Token it selects and the HEX.
const ColorValue = ({ live, color, compact = false }: { live: string; color: string; compact?: boolean }) => {
  const paletteToken = findPaletteToken(color);
  return (
    <Stack className={`foundation-color-value${compact ? " foundation-color-value--compact" : ""}`} surface="canvas" gap="sm" border radius="md" padding="sm" title={`${paletteToken} · ${color.toUpperCase()}`}>
      <Box className="foundation-color-chip" border radius="sm" style={{ background: live }} />
      <div className="foundation-color-meta">
        <Text as="span" variant="caption" family="mono" ink="base">{paletteToken}</Text>
        <Text as="span" variant="caption" family="mono" ink="faint">{color.toUpperCase()}</Text>
      </div>
    </Stack>
  );
};

const TokenPill = ({ token }: { token: string }) => (
  <Box as="code" className="foundation-color-token" surface="sunken" radius="sm" paddingX="sm" paddingY="xs"><Text as="span" variant="caption" family="mono">{token}</Text></Box>
);

const SectionHeading = ({ title, description }: { title: string; description: string }) => (
  <Stack gap="xs"><Text variant="heading">{title}</Text><Text variant="body" ink="soft">{description}</Text></Stack>
);

const ColorGroup = ({ title, description, rows }: { title: string; description: string; rows: ColorRow[] }) => {
  const { values, label } = useTheme();
  return (
    <Stack as="section" className="foundation-color-section" gap="md">
      <SectionHeading title={title} description={description} />
      <Inline className="foundation-color-columns" align="center" gap="md"><Text variant="label">Token and description</Text><Text variant="label">{label}</Text></Inline>
      <Stack className="foundation-color-rows" gap="sm">
        {rows.map((row) => <div className="foundation-color-row" key={row.token}>
          <Stack className="foundation-color-copy" gap="sm">
            <TokenPill token={row.token} />
            <Text variant="body" ink="soft">{row.description}</Text>
          </Stack>
          <ColorValue live={row.live} color={row.pick(values)} />
        </div>)}
      </Stack>
    </Stack>
  );
};

// The five accents share one ladder, so they read best side by side: one row per accent.
const AccentGroup = () => {
  const { values } = useTheme();
  return (
    <Stack as="section" className="foundation-color-section" gap="md">
      <SectionHeading title="Accent" description="의미 이름 다섯이 같은 다섯 tone을 공유합니다. solid는 채운 면과 상태 점, wash는 solid 위 글자, ink는 지면 위 색 글자, soft는 옅은 면, subtle은 muted 글자입니다." />
      <div className="foundation-tone-scroll">
        <div className="foundation-tone-columns"><Text variant="label">Accent</Text>{LADDER.map((tone) => <Text key={tone} variant="label">{tone}</Text>)}</div>
        {ACCENTS.map((accent) => (
          <div className="foundation-tone-row" key={accent}>
            <Stack className="foundation-color-copy" gap="sm">
              <TokenPill token={`accent.${accent}`} />
              <Text variant="body" ink="soft">{FAMILY[accent]}</Text>
            </Stack>
            {LADDER.map((tone) => <ColorValue key={tone} live={c.accent[accent][tone]} color={values.accent[accent][tone]} compact />)}
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
    ...(["red", "amber", "green", "blue"] as const).map((palette) => ({ name: palette[0]!.toUpperCase() + palette.slice(1), values: steps.map((step) => PALETTE_TOKENS.accent[palette][step]) })),
  ];
  return (
    <Stack className="foundation-palette-section" gap="md">
      <Inline align="baseline" justify="between" wrap><SectionHeading title="Palette" description="테마와 무관한 원본 ramp 하나입니다. light와 dark의 의미 역할이 모두 여기서 단계를 고릅니다." /><Text variant="caption" family="mono" ink="faint">{isDark ? "950 → 50" : "50 → 950"}</Text></Inline>
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

export const ColorPage = () => (
  <Stack gap="xl">
    <PaletteMatrix />
    {COLOR_GROUPS.map((group) => <ColorGroup key={group.title} {...group} />)}
    <AccentGroup />
  </Stack>
);
