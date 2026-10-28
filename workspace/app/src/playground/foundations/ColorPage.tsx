import { Button, Text, ThemeScope, tokens, type Variant } from "@studio-baeks/paper-ui";

import { ACCENTS, COLOR_VALUES, COLOR_VALUES_DARK, STATUS_PALETTE } from "../../../../packages/paper-ui/src/tokens/colors";
import { ACCENT_PALETTES, ACCENT_STEPS, ALPHA_STEPS, OKLCH_PALETTE, PALETTE_STEPS, PALETTE_TOKENS } from "../../../../packages/paper-ui/src/tokens/palette";
import { Board, BoardGroup, BoardRow, Cell, FoundationSection, MatrixCell, TokenCell, ValueCell } from "./kit";
import * as s from "./foundations.css";

// ── Palette ─────────────────────────────────────────────────────────────────

type Oklch = readonly [number, number, number];
const coordinates = ([l, c, h]: Oklch) => `L ${l.toFixed(3)} · C ${c.toFixed(3)} · H ${h.toFixed(1)}°`;
const FAMILIES = [
  { name: "neutral", tokens: PALETTE_TOKENS.neutral as Record<string, string>, oklch: OKLCH_PALETTE.neutral as Record<string, Oklch>, anchor: "500" },
  ...ACCENT_PALETTES.map((name) => ({ name, tokens: PALETTE_TOKENS.accent[name] as Record<string, string>, oklch: OKLCH_PALETTE.accent[name] as Record<string, Oklch>, anchor: "600" })),
];
const ACCENT_ONLY = new Set<string>(ACCENT_STEPS);
const identity = (oklch: Oklch) => `H ${oklch[2].toFixed(0)} · C ${oklch[1].toFixed(2)}`;

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

// ── Semantic roles ──────────────────────────────────────────────────────────

type Kind = "surface" | "track" | "ink" | "border" | "overlay" | "overlayOnPrimary" | "overlayOnAccent" | "focus" | "scrim" | "shadowFloating" | "shadowLifted";
type Role = { path: string; note: string; kind: Kind; ref: string; light: string; dark: string };
const role = (path: string, note: string, kind: Kind, pick: (values: typeof COLOR_VALUES) => string, ref: string): Role =>
  ({ path, note, kind, ref, light: pick(COLOR_VALUES), dark: pick(COLOR_VALUES_DARK as typeof COLOR_VALUES) });
const c = tokens.color;

const ROLE_GROUPS: { label: string; rows: Role[] }[] = [
  { label: "Surface", rows: [
    role("bg.canvas", "페이지 바탕", "surface", (v) => v.bg.canvas, c.bg.canvas),
    role("bg.raised", "카드·떠 있는 면", "surface", (v) => v.bg.raised, c.bg.raised),
    role("bg.sunken", "가라앉은 영역", "surface", (v) => v.bg.sunken, c.bg.sunken),
  ] },
  { label: "Control", rows: [
    role("control.track", "Switch 트랙·진행 막대 홈", "track", (v) => v.control.track, c.control.track),
  ] },
  { label: "Ink", rows: [
    role("ink.primary", "본문과 제목", "ink", (v) => v.ink.primary, c.ink.primary),
    role("ink.secondary", "보조 내용", "ink", (v) => v.ink.secondary, c.ink.secondary),
    role("ink.tertiary", "메타 정보·낮은 강조", "ink", (v) => v.ink.tertiary, c.ink.tertiary),
  ] },
  { label: "Border", rows: [
    role("border.base", "기본 경계", "border", (v) => v.border.base, c.border.base),
    role("border.strong", "대비가 높은 경계", "border", (v) => v.border.strong, c.border.strong),
    role("border.hover", "포인터가 올라온 입력칸", "border", (v) => v.border.hover, c.border.hover),
  ] },
  { label: "Interaction", rows: [
    role("interaction.bgHover.onSurface", "중립 면 위 hover overlay", "overlay", (v) => v.interaction.bgHover.onSurface, c.interaction.bgHover.onSurface),
    role("interaction.bgHover.onPrimarySolid", "primary solid 위 hover", "overlayOnPrimary", (v) => v.interaction.bgHover.onPrimarySolid, c.interaction.bgHover.onPrimarySolid),
    role("interaction.bgHover.onAccentSolid", "상태색 solid 위 hover", "overlayOnAccent", (v) => v.interaction.bgHover.onAccentSolid, c.interaction.bgHover.onAccentSolid),
    role("interaction.selected", "선택된 항목", "overlay", (v) => v.interaction.selected, c.interaction.selected),
    role("interaction.active", "누르는 중", "overlay", (v) => v.interaction.active, c.interaction.active),
    role("interaction.focus", "키보드 포커스 링", "focus", (v) => v.interaction.focus, c.interaction.focus),
  ] },
  { label: "Overlay · Shadow", rows: [
    role("overlay.scrim", "모달 뒤를 누르는 면", "scrim", (v) => v.overlay.scrim, c.overlay.scrim),
    role("shadow.overlay", "floating 그림자의 색", "shadowFloating", (v) => v.shadow.overlay, c.shadow.overlay),
    role("shadow.overlayMinimal", "lifted 그림자의 색", "shadowLifted", (v) => v.shadow.overlayMinimal, c.shadow.overlayMinimal),
  ] },
];

const overlay = (color: string) => `linear-gradient(${color}, ${color})`;
const RoleSpecimen = ({ kind, color }: { kind: Kind; color: string }) => {
  switch (kind) {
    case "surface": return <div className={s.swatch} style={{ background: color }} />;
    case "track": return <div className={s.track} style={{ background: color }} />;
    case "ink": return <Text variant="body" className={s.inkSample} style={{ color }}>Aa 가나다</Text>;
    case "border": return <div className={s.swatch} style={{ background: c.bg.raised, borderColor: color }} />;
    case "overlay": return <div className={s.swatch} style={{ background: c.bg.raised, backgroundImage: overlay(color) }} />;
    case "overlayOnPrimary": return <div className={s.swatch} style={{ background: c.accent.primary.solid, backgroundImage: overlay(color) }} />;
    case "overlayOnAccent": return <div className={s.swatch} style={{ background: c.accent.info.solid, backgroundImage: overlay(color) }} />;
    case "focus": return <div className={`${s.swatch} ${s.focusSample}`} style={{ background: c.bg.raised, outlineColor: color }} />;
    case "scrim": return <div className={s.swatch} style={{ background: c.bg.raised, backgroundImage: overlay(color) }} />;
    case "shadowFloating": return <div className={s.swatch} style={{ background: c.bg.raised, boxShadow: tokens.layout.elevation.overlay.shadow }} />;
    case "shadowLifted": return <div className={s.swatch} style={{ background: c.bg.raised, boxShadow: tokens.layout.elevation.raised.shadow }} />;
  }
};

// The same reference drawn in each theme: ThemeScope swaps the variables underneath it.
const InTheme = ({ theme, children }: { theme: "light" | "dark"; children: React.ReactNode }) => (
  <ThemeScope theme={theme}><div className={s.stage}>{children}</div></ThemeScope>
);

// ── Accent ──────────────────────────────────────────────────────────────────

const LADDER = ["solid", "wash", "ink", "soft", "subtle"] as const;
const VARIANTS: { variant: Variant; note: string }[] = [
  { variant: "solid", note: "solid 면 · wash 글자" },
  { variant: "soft", note: "soft 면 · ink 글자" },
  { variant: "hairline", note: "raised 면 · 경계 · ink 글자" },
  { variant: "ghost", note: "투명 · ink 글자" },
  { variant: "muted", note: "투명 · subtle 글자" },
];
const family = (accent: (typeof ACCENTS)[number]) => accent === "primary" ? "neutral" : STATUS_PALETTE[accent];

export const ColorPage = () => (
  <>
    <FoundationSection title="Color Palette" description="모든 색의 원본입니다. 테마와 무관한 OKLCH ramp 하나에서 HEX Palette Token을 만들고, light·dark 의미 역할이 이 ramp에서 단계를 고릅니다. alpha ramp는 interaction·scrim·shadow tint가 고르는 반투명 단계입니다. 칩에 포인터를 올리면 HEX와 OKLCH 좌표가 보입니다.">
      <Board columns={[{ label: "Ramp" }, ...PALETTE_STEPS.map((step) => ({ label: step, align: "center" as const }))]} template={`minmax(7rem, 1.4fr) repeat(${PALETTE_STEPS.length}, minmax(2rem, 1fr))`} minWidth="44rem">
        <BoardGroup>
          {FAMILIES.map((ramp) => (
            <BoardRow key={ramp.name}>
              <TokenCell name={ramp.name} note={identity(ramp.oklch[ramp.anchor]!)} />
              {PALETTE_STEPS.map((step) => {
                const color = ramp.tokens[step];
                const missing = ramp.name !== "neutral" && !ACCENT_ONLY.has(step);
                return missing || !color ? <span key={step} /> : (
                  <div key={step} className={s.paletteChip} style={{ background: color }} title={`${ramp.name}.${step} · ${color.toUpperCase()} · ${coordinates(ramp.oklch[step]!)}`} aria-label={`${ramp.name} ${step} ${color}`} role="img" />
                );
              })}
            </BoardRow>
          ))}
        </BoardGroup>
      </Board>
      <Board columns={[{ label: "Alpha" }, ...ALPHA_STEPS.map((step) => ({ label: step, align: "center" as const }))]} template={`minmax(7rem, 1.4fr) repeat(${ALPHA_STEPS.length}, minmax(1.25rem, 1fr))`} minWidth="44rem">
        <BoardGroup label="alpha05 ~ alpha95 — neutral 끝점에 고정 opacity">
          {(["0", "950"] as const).map((end) => (
            <BoardRow key={end}>
              <TokenCell name={`neutral.${end}`} note={end === "0" ? "흰 끝점, 어두운 면 위" : "검은 끝점, 밝은 면 위"} />
              {ALPHA_STEPS.map((step) => {
                const color = PALETTE_TOKENS[`alpha${step}`].neutral[end];
                return (
                  <div key={step} className={s.paletteChip} style={{ background: PALETTE_TOKENS.neutral[end === "0" ? "950" : "0"], backgroundImage: overlay(color) }} title={`alpha${step}.neutral.${end} · ${color}`} aria-label={`alpha ${step} neutral ${end}`} role="img" />
                );
              })}
            </BoardRow>
          ))}
        </BoardGroup>
      </Board>
    </FoundationSection>

    <FoundationSection title="Semantic roles" description="화면이 쓰는 색 이름입니다. 각 역할은 테마마다 Palette Token 하나를 고르고, 다른 역할을 참조하거나 색을 계산하지 않습니다.">
      <Board columns={[{ label: "Role" }, { label: "Light", align: "center" }, { label: "Dark", align: "center" }, { label: "Palette token", align: "end" }]} template="minmax(0, 1.4fr) minmax(7rem, 1fr) minmax(7rem, 1fr) minmax(0, 1fr)" minWidth="40rem">
        {ROLE_GROUPS.map((group) => (
          <BoardGroup key={group.label} label={group.label}>
            {group.rows.map((row) => (
              <BoardRow key={row.path}>
                <TokenCell name={`color.${row.path}`} note={row.note} />
                <InTheme theme="light"><RoleSpecimen kind={row.kind} color={row.ref} /></InTheme>
                <InTheme theme="dark"><RoleSpecimen kind={row.kind} color={row.ref} /></InTheme>
                <ValueCell title={`${row.light} · ${row.dark}`}>{paletteName(row.light)}<br />{paletteName(row.dark)}</ValueCell>
              </BoardRow>
            ))}
          </BoardGroup>
        ))}
      </Board>
    </FoundationSection>

    <FoundationSection title="Accent" description="primary와 네 상태색(info·success·warning·error)은 같은 다섯 tone을 갖습니다. solid는 채운 면과 상태 점, wash는 solid 위 글자, ink는 지면 위 색 글자, soft는 옅은 면, subtle은 muted 글자입니다. 칸의 왼쪽은 light, 오른쪽은 dark입니다.">
      <Board columns={[{ label: "Accent" }, ...LADDER.map((tone) => ({ label: tone, align: "center" as const }))]} template="minmax(8rem, 0.8fr) repeat(5, minmax(7rem, 1fr))" minWidth="44rem">
        <BoardGroup>
          {ACCENTS.map((accent) => (
            <BoardRow key={accent}>
              <TokenCell name={accent} note={`color.accent.${accent} ← ${family(accent)}`} />
              {LADDER.map((tone) => (
                <MatrixCell key={tone} caption={<>{paletteName(COLOR_VALUES.accent[accent][tone])}<br />{paletteName(COLOR_VALUES_DARK.accent[accent][tone])}</>}>
                  <div className={s.split}>
                    <ThemeScope theme="light"><div className={s.half} style={{ background: c.accent[accent][tone] }} /></ThemeScope>
                    <ThemeScope theme="dark"><div className={s.half} style={{ background: c.accent[accent][tone] }} /></ThemeScope>
                  </div>
                </MatrixCell>
              ))}
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
