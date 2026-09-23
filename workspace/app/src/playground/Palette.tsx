// Palette (Foundations) — semantic role 이전, 시스템이 실제로 색을 시작하는 자리.
//
// Tokens 화면은 소비자가 쓰는 L2 semantic token을 보여준다. 여기는 그 앞의 L0/L1을
// 한 방향으로 읽게 한다: neutral은 raw zinc surface palette → neutral ladder, accent는
// pigment identity → calibrated ladder. 이 화면만 의도적으로 source layer를 읽는다.

import { useEffect, useState } from "react";

import { Box, Inline, Stack, Text, tokens } from "@studio-baeks/paper-ui";

import { ACCENT_LADDER, ACCENT_STEPS } from "../../../packages/paper-ui/src/tokens/color-ladder";
import { ACCENT_PALETTES, PALETTE, SURFACE_PALETTE, SURFACE_STEPS } from "../../../packages/paper-ui/src/tokens/palette";
import type { ColorMode, SurfaceStep } from "../../../packages/paper-ui/src/tokens/palette";

import { Crumb, PlaygroundLayout } from "./shell";

const useColorMode = (): ColorMode => {
  const [mode, setMode] = useState<ColorMode>(() =>
    typeof document === "undefined" || document.documentElement.dataset.theme === "dark" ? "dark" : "light",
  );

  useEffect(() => {
    const root = document.documentElement;
    const sync = () => setMode(root.dataset.theme === "dark" ? "dark" : "light");
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  return mode;
};

const surfaceInk = (mode: ColorMode, step: SurfaceStep) => {
  const index = SURFACE_STEPS.indexOf(step);
  if (mode === "light") return index < 6 ? tokens.color.surface.raised : tokens.color.content.primary;
  return index < 7 ? tokens.color.content.primary : tokens.color.surface.raised;
};

// Palette swatch 자체도 대비를 지켜야 한다. 두 theme의 ladder 방향을 고려해 충분히
// 어두운 칸에는 밝은 잉크를, 충분히 밝은 칸에는 어두운 잉크를 올린다.
const oklchParts = (value: string) => {
  const [, lightness, chroma, hue] = value.match(/^oklch\(([\d.]+) ([\d.]+) ([\d.]+)\)$/) ?? [];
  return lightness ? { lightness, chroma, hue } : undefined;
};

const accentInk = (mode: ColorMode, palette: (typeof ACCENT_PALETTES)[number], color: string) => {
  const lightness = Number(oklchParts(color)?.lightness);
  // Use the actual generated tone rather than step numbers: dark-mode ladders run in
  // the opposite direction. Amber 400 is intentionally kept light per the palette review.
  const lightInk = palette === "amber" && mode === "light" && lightness >= 0.66 && lightness < 0.7
    ? true
    : lightness < (mode === "dark" ? 0.58 : 0.62);
  if (mode === "dark") return lightInk ? tokens.color.content.primary : tokens.color.surface.raised;
  return lightInk ? tokens.color.surface.raised : tokens.color.content.primary;
};

const Section = ({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) => (
  <Stack as="section" gap="lg">
    <Stack gap="xs">
      <Text variant="label">{title}</Text>
      <Text variant="caption" ink="soft">{desc}</Text>
    </Stack>
    {children}
  </Stack>
);

const SurfaceStrip = ({ mode }: { mode: ColorMode }) => (
  <Box
    border
    radius="md"
    overflow="hidden"
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(13, minmax(4.75rem, 1fr))",
      minWidth: "61.75rem",
    }}
  >
    {SURFACE_STEPS.map((step) => {
      const color = SURFACE_PALETTE[mode][step];
      const ink = surfaceInk(mode, step);
      return (
        <Stack
          key={step}
          gap="xs"
          style={{ minHeight: "7.25rem", padding: tokens.shape.padding.sm.interaction, background: color, color: ink, justifyContent: "space-between" }}
        >
          <Text variant="caption" as="span" style={{ color: "inherit" }}>{step}</Text>
          <Text variant="caption" family="mono" as="span" style={{ color: "inherit", opacity: 0.72 }}>{color}</Text>
        </Stack>
      );
    })}
  </Box>
);

const AccentStrip = ({ mode, palette }: { mode: ColorMode; palette: (typeof ACCENT_PALETTES)[number] }) => (
  <Stack gap="sm">
    <Inline gap="sm" align="baseline" wrap>
      <Text variant="subheading" as="span">{palette}</Text>
      <Text variant="caption" family="mono" ink="faint" as="span">
        H {PALETTE[palette].hue[mode]} · C {PALETTE[palette].chroma}
      </Text>
    </Inline>
    <Box
      border
      radius="md"
      overflow="hidden"
    style={{ display: "grid", gridTemplateColumns: "repeat(11, minmax(5.5rem, 1fr))", minWidth: "60.5rem" }}
    >
      {ACCENT_STEPS.map((step) => {
        const color = ACCENT_LADDER[mode][palette][step];
        const ink = accentInk(mode, palette, color);
        const parts = oklchParts(color);
        return (
          <Stack
            key={step}
            gap="xs"
            style={{ minHeight: "6.5rem", padding: tokens.shape.padding.sm.interaction, background: color, borderInlineStart: `${tokens.shape.constants.borderWidth} solid ${tokens.color.border.base}`, color: ink, justifyContent: "space-between" }}
          >
            <Text variant="caption" as="span" style={{ color: "inherit" }}>{step}</Text>
            <Stack gap="xs" style={{ color: "inherit", opacity: 0.78 }}>
              <Text variant="caption" family="mono" as="span" style={{ color: "inherit" }}>L {parts?.lightness?.slice(1) ?? "—"} · C {parts?.chroma?.slice(1) ?? "—"}</Text>
              <Text variant="caption" family="mono" as="span" style={{ color: "inherit" }}>H {parts?.hue ?? "—"}°</Text>
            </Stack>
          </Stack>
        );
      })}
    </Box>
  </Stack>
);

export const Palette = () => {
  const mode = useColorMode();

  return (
    <PlaygroundLayout value="palette">
      <Stack gap="xs" style={{ marginBottom: tokens.shape.gap.lg }}>
        <Crumb group="Reference" name="Palette" />
        <Text variant="title">Palette</Text>
        <Text variant="caption" ink="soft">
          색의 출발점입니다. 현재 {mode} theme의 L0 palette와 L1 calibrated ladder를 보며, 실제 컴포넌트는 다음 단계의 semantic token만 사용합니다.
        </Text>
      </Stack>

      <Stack gap="xl">
        <Section
          title="Surface palette · zinc"
          desc="L0의 실제 neutral ramp입니다. 낮은 step은 어둡고 높은 step은 밝습니다. 다음 L1에서 이 순서를 neutral ladder로 연결하고, L2에서 surface.raised·canvas·sunken처럼 역할을 부여합니다."
        >
          <Box overflow="auto" style={{ paddingBottom: tokens.shape.gap.xs }}>
            <SurfaceStrip mode={mode} />
          </Box>
          <Inline gap="md" wrap>
            <Text variant="caption" ink="faint" as="span">surface palette → neutral ladder → semantic surface / content / border</Text>
          </Inline>
        </Section>

        <Section
          title="Accent palette · calibrated ladders"
          desc="blue·green·amber·red은 각각 info·success·warning·error로 이어집니다. 대표색을 OKLCH anchor로 두고, 사이 step의 L·C·H를 perceptual space에서 보간해 생성합니다. 기존 Veil anchor 색감은 유지하면서 중간 단계의 밝기와 채도 변화가 매끄러운지 확인합니다."
        >
          <Stack gap="lg">
            {ACCENT_PALETTES.map((palette) => (
              <Box key={palette} overflow="auto" style={{ paddingBottom: tokens.shape.gap.xs }}>
                <AccentStrip mode={mode} palette={palette} />
              </Box>
            ))}
          </Stack>
        </Section>

        <Section
          title="Semantic handoff"
          desc="palette나 ladder를 직접 가져오는 것은 Foundations inspector뿐입니다. application과 component는 색 이름이 아니라 역할을 선택합니다."
        >
          <Inline gap="md" wrap>
            {[
              "info ← blue",
              "success ← green",
              "warning ← amber",
              "error ← red",
            ].map((mapping) => (
              <Box key={mapping} border radius="sm" paddingX="sm" paddingY="xs">
                <Text variant="caption" family="mono" as="span">{mapping}</Text>
              </Box>
            ))}
          </Inline>
        </Section>
      </Stack>
    </PlaygroundLayout>
  );
};
