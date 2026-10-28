import { Button, Inline, Stack, Text, tokens, useResolvedTheme, type Variant } from "@studio-baeks/paper-ui";

import { ACCENTS, COLOR_VALUES, COLOR_VALUES_DARK, STATUS_PALETTE } from "../../../../packages/paper-ui/src/tokens/colors";
import { ACCENT_STEPS, ALPHA_STEPS, OKLCH_PALETTE, PALETTE_STEPS, PALETTE_TOKENS } from "../../../../packages/paper-ui/src/tokens/palette";
import { Board, BoardGroup, BoardRow, Cell, FoundationSection, TokenCell, ValueCell } from "./kit";
import * as s from "./foundations.css";

type Oklch = readonly [number, number, number];
const c = tokens.color;

// Generated value → its Palette Token name, so a semantic role reads as the step it selects.
const paletteName = (color: string): string => {
  const visit = (value: unknown, path: string[]): string | undefined => {
    if (typeof value === "string") return value.toLowerCase() === color.toLowerCase() ? path.join(".") : undefined;
    if (!value || typeof value !== "object") return undefined;
    for (const [key, child] of Object.entries(value)) {
      const match = visit(child, [...path, key]);
      if (match) return match;
    }
    return undefined;
  };
  return (visit(PALETTE_TOKENS, []) ?? color).replace(/^accent\./, "");
};
const coordinates = ([l, ch, h]: Oklch) => `L ${l.toFixed(3)} · C ${ch.toFixed(3)} · H ${h.toFixed(1)}°`;
const overlay = (color: string) => `linear-gradient(${color}, ${color})`;

// The page shows the theme it is in; switching the theme switches every value below.
const useThemeValues = () => {
  const dark = useResolvedTheme() === "dark";
  return { dark, values: dark ? (COLOR_VALUES_DARK as typeof COLOR_VALUES) : COLOR_VALUES };
};

// ── Palette ─────────────────────────────────────────────────────────────────

// Every ramp shares these steps, so the matrix has no holes; neutral's own steps sit below it.
const RAMPS = [
  { name: "Neutral", tokens: PALETTE_TOKENS.neutral as Record<string, string>, oklch: OKLCH_PALETTE.neutral as Record<string, Oklch>, anchor: "500" },
  ...(["red", "amber", "green", "blue"] as const).map((name) => ({
    name: name[0]!.toUpperCase() + name.slice(1),
    tokens: PALETTE_TOKENS.accent[name] as Record<string, string>,
    oklch: OKLCH_PALETTE.accent[name] as Record<string, Oklch>,
    anchor: "600",
  })),
];
const SHARED = new Set<string>(ACCENT_STEPS);
const NEUTRAL_ONLY = PALETTE_STEPS.filter((step) => !SHARED.has(step));
const NEUTRAL_ONLY_NOTE: Record<string, string> = { "0": "흰 끝점 — light의 raised 면", "875": "dark의 primary soft 면" };

const Chip = ({ ramp, step, color, oklch }: { ramp: string; step: string; color: string; oklch: Oklch }) => (
  <div className={s.chip} style={{ background: color }} role="img" aria-label={`${ramp} ${step} ${color}`} title={`${ramp.toLowerCase()}.${step} · ${color.toUpperCase()} · ${coordinates(oklch)}`} />
);

const PaletteMatrix = ({ dark }: { dark: boolean }) => {
  // Dark reads from its own end of the ramp, the way its semantic roles pick steps.
  const steps = dark ? [...ACCENT_STEPS].reverse() : [...ACCENT_STEPS];
  return (
    <Board columns={[{ label: "Ramp" }, ...steps.map((step) => ({ label: step, align: "center" as const }))]} template={`minmax(6.5rem, 1.2fr) repeat(${steps.length}, minmax(2.25rem, 1fr))`} minWidth="44rem">
      <BoardGroup>
        {RAMPS.map((ramp) => (
          <BoardRow key={ramp.name}>
            <Stack gap="xs">
              <Text variant="caption" ink="base">{ramp.name}</Text>
              <Text variant="caption" family="mono" ink="faint">H {ramp.oklch[ramp.anchor]![2].toFixed(0)} · C {ramp.oklch[ramp.anchor]![1].toFixed(2)}</Text>
            </Stack>
            {steps.map((step) => <Chip key={step} ramp={ramp.name} step={step} color={ramp.tokens[step]!} oklch={ramp.oklch[step]!} />)}
          </BoardRow>
        ))}
      </BoardGroup>
      <BoardGroup label="Neutral에만 있는 단계">
        <BoardRow>
          <Text variant="caption" ink="base">Neutral</Text>
          <Cell span={steps.length}>
            <Inline gap="xl" wrap>
              {NEUTRAL_ONLY.map((step) => (
                <Inline key={step} gap="sm">
                  <div className={s.chipInline}><Chip ramp="Neutral" step={step} color={PALETTE_TOKENS.neutral[step]} oklch={OKLCH_PALETTE.neutral[step]} /></div>
                  <Stack gap="xs">
                    <Text variant="caption" family="mono" ink="base">neutral.{step} · {PALETTE_TOKENS.neutral[step].toUpperCase()}</Text>
                    <Text variant="caption" ink="soft">{NEUTRAL_ONLY_NOTE[step]}</Text>
                  </Stack>
                </Inline>
              ))}
            </Inline>
          </Cell>
        </BoardRow>
      </BoardGroup>
    </Board>
  );
};

const AlphaMatrix = () => (
  <Board columns={[{ label: "Alpha" }, ...ALPHA_STEPS.map((step) => ({ label: step, align: "center" as const }))]} template={`minmax(6.5rem, 1.2fr) repeat(${ALPHA_STEPS.length}, minmax(1.5rem, 1fr))`} minWidth="44rem">
    <BoardGroup>
      {(["0", "950"] as const).map((end) => (
        <BoardRow key={end}>
          <Stack gap="xs">
            <Text variant="caption" family="mono" ink="base">neutral.{end}</Text>
            <Text variant="caption" ink="soft">{end === "0" ? "어두운 면 위" : "밝은 면 위"}</Text>
          </Stack>
          {ALPHA_STEPS.map((step) => {
            const color = PALETTE_TOKENS[`alpha${step}`].neutral[end];
            return <div key={step} className={s.chip} style={{ background: PALETTE_TOKENS.neutral[end === "0" ? "950" : "0"], backgroundImage: overlay(color) }} role="img" aria-label={`alpha ${step} neutral ${end}`} title={`alpha${step}.neutral.${end} · ${color.toUpperCase()}`} />;
          })}
        </BoardRow>
      ))}
    </BoardGroup>
  </Board>
);

// ── Semantic roles ──────────────────────────────────────────────────────────

// One role as it renders now: the live color as a chip on the page canvas, with the Palette
// Token it selects. Translucent roles read as they really do — over the canvas.
const ValueCard = ({ color, raw, hex = false }: { color: string; raw: string; hex?: boolean }) => (
  <div className={s.valueCard} role="img" aria-label={`${paletteName(raw)} ${raw.toUpperCase()}`} title={`${paletteName(raw)} · ${raw.toUpperCase()}`}>
    <div className={s.valueChip} style={{ background: color }} />
    <Text as="span" variant="caption" family="mono" ink="base">{paletteName(raw)}</Text>
    {hex ? <Text as="span" variant="caption" family="mono" ink="soft">{raw.toUpperCase()}</Text> : null}
  </div>
);

type Role = { path: string; note: string; ref: string; pick: (values: typeof COLOR_VALUES) => string };
const ROLE_GROUPS: { label: string; rows: Role[] }[] = [
  { label: "Surface", rows: [
    { path: "bg.canvas", note: "페이지 바탕", ref: c.bg.canvas, pick: (v) => v.bg.canvas },
    { path: "bg.raised", note: "카드 · 떠 있는 면", ref: c.bg.raised, pick: (v) => v.bg.raised },
    { path: "bg.sunken", note: "가라앉은 영역", ref: c.bg.sunken, pick: (v) => v.bg.sunken },
  ] },
  { label: "Control", rows: [
    { path: "control.track", note: "Switch 트랙 · 진행 막대 홈", ref: c.control.track, pick: (v) => v.control.track },
  ] },
  { label: "Ink", rows: [
    { path: "ink.primary", note: "본문과 제목", ref: c.ink.primary, pick: (v) => v.ink.primary },
    { path: "ink.secondary", note: "보조 내용", ref: c.ink.secondary, pick: (v) => v.ink.secondary },
    { path: "ink.tertiary", note: "메타 정보 · 낮은 강조", ref: c.ink.tertiary, pick: (v) => v.ink.tertiary },
  ] },
  { label: "Border", rows: [
    { path: "border.base", note: "기본 경계", ref: c.border.base, pick: (v) => v.border.base },
    { path: "border.strong", note: "대비가 높은 경계", ref: c.border.strong, pick: (v) => v.border.strong },
    { path: "border.hover", note: "포인터가 올라온 입력칸", ref: c.border.hover, pick: (v) => v.border.hover },
  ] },
  { label: "Interaction", rows: [
    { path: "interaction.bgHover.onSurface", note: "중립 면 위 hover overlay", ref: c.interaction.bgHover.onSurface, pick: (v) => v.interaction.bgHover.onSurface },
    { path: "interaction.bgHover.onPrimarySolid", note: "primary solid 위 hover", ref: c.interaction.bgHover.onPrimarySolid, pick: (v) => v.interaction.bgHover.onPrimarySolid },
    { path: "interaction.bgHover.onAccentSolid", note: "상태색 solid 위 hover", ref: c.interaction.bgHover.onAccentSolid, pick: (v) => v.interaction.bgHover.onAccentSolid },
    { path: "interaction.selected", note: "선택된 항목", ref: c.interaction.selected, pick: (v) => v.interaction.selected },
    { path: "interaction.active", note: "누르는 중", ref: c.interaction.active, pick: (v) => v.interaction.active },
    { path: "interaction.focus", note: "키보드 포커스 링", ref: c.interaction.focus, pick: (v) => v.interaction.focus },
  ] },
  { label: "Overlay · Shadow", rows: [
    { path: "overlay.scrim", note: "모달 뒤를 누르는 면", ref: c.overlay.scrim, pick: (v) => v.overlay.scrim },
    { path: "shadow.overlay", note: "floating 그림자의 색", ref: c.shadow.overlay, pick: (v) => v.shadow.overlay },
    { path: "shadow.overlayMinimal", note: "lifted 그림자의 색", ref: c.shadow.overlayMinimal, pick: (v) => v.shadow.overlayMinimal },
  ] },
];

// ── Accent ──────────────────────────────────────────────────────────────────

const TONES = ["solid", "wash", "ink", "soft", "subtle"] as const;
const VARIANTS: { variant: Variant; note: string }[] = [
  { variant: "solid", note: "solid 면 · wash 글자" },
  { variant: "soft", note: "soft 면 · ink 글자" },
  { variant: "hairline", note: "raised 면 · 경계 · ink 글자" },
  { variant: "ghost", note: "투명 · ink 글자" },
  { variant: "muted", note: "투명 · subtle 글자" },
];
const family = (accent: (typeof ACCENTS)[number]) => accent === "primary" ? "neutral" : STATUS_PALETTE[accent];

export const ColorPage = () => {
  const { dark, values } = useThemeValues();
  const theme = dark ? "dark" : "light";
  return (
    <>
      <FoundationSection
        title="Color Palette"
        description="모든 색의 원본입니다. 테마와 무관한 OKLCH ramp 하나에서 HEX Palette Token을 만들고, light·dark 의미 역할이 이 ramp에서 단계를 고릅니다. 칩에 포인터를 올리면 HEX와 OKLCH 좌표가 보입니다."
        aside={<Text variant="caption" family="mono" ink="faint">{dark ? "950 → 50" : "50 → 950"}</Text>}
      >
        <PaletteMatrix dark={dark} />
        <AlphaMatrix />
      </FoundationSection>

      <FoundationSection title="Semantic roles" description={`화면이 쓰는 색 이름입니다. 각 역할은 테마마다 Palette Token 하나를 고르고, 다른 역할을 참조하거나 색을 계산하지 않습니다. 지금 테마(${theme})의 값이며, 테마를 바꾸면 함께 바뀝니다.`}>
        <Board columns={[{ label: "Role" }, { label: "Value" }, { label: "HEX", align: "end" }]} template="minmax(0, 1.4fr) minmax(12rem, 1fr) minmax(6.5rem, auto)" minWidth="36rem">
          {ROLE_GROUPS.map((group) => (
            <BoardGroup key={group.label} label={group.label}>
              {group.rows.map((row) => (
                <BoardRow key={row.path}>
                  <TokenCell name={`color.${row.path}`} note={row.note} />
                  <ValueCard color={row.ref} raw={row.pick(values)} />
                  <ValueCell>{row.pick(values).toUpperCase()}</ValueCell>
                </BoardRow>
              ))}
            </BoardGroup>
          ))}
        </Board>
      </FoundationSection>

      <FoundationSection title="Accent" description={`primary와 네 상태색(info·success·warning·error)은 같은 다섯 tone을 갖습니다. solid는 채운 면과 상태 점, wash는 solid 위 글자, ink는 지면 위 색 글자, soft는 옅은 면, subtle은 muted 글자입니다. 지금 테마(${theme})의 값입니다.`}>
        <Board columns={[{ label: "Accent" }, ...TONES.map((tone) => ({ label: tone }))]} template="minmax(7rem, 0.8fr) repeat(5, minmax(6.5rem, 1fr))" minWidth="44rem">
          <BoardGroup>
            {ACCENTS.map((accent) => (
              <BoardRow key={accent}>
                <TokenCell name={accent} note={`← ${family(accent)}`} />
                {TONES.map((tone) => <ValueCard key={tone} color={c.accent[accent][tone]} raw={values.accent[accent][tone]} hex />)}
              </BoardRow>
            ))}
          </BoardGroup>
        </Board>
      </FoundationSection>

      <FoundationSection title="Accent × variant" description="Atom은 accent와 variant를 조합해 위 tone을 고릅니다. 같은 칸이 Button·Badge의 색과 hover의 출처입니다.">
        <Board columns={[{ label: "Variant" }, ...ACCENTS.map((accent) => ({ label: accent, align: "center" as const }))]} template="minmax(9rem, 1.2fr) repeat(5, minmax(6rem, 1fr))" minWidth="40rem">
          {VARIANTS.map(({ variant, note }) => (
            <BoardRow key={variant} size="md">
              <TokenCell name={variant} note={note} />
              {ACCENTS.map((accent) => <Cell key={accent} align="center"><Button size="sm" accent={accent} variant={variant}>{accent}</Button></Cell>)}
            </BoardRow>
          ))}
        </Board>
      </FoundationSection>
    </>
  );
};
