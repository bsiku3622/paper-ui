// Palette (Foundations) — semantic role 이전, 시스템이 실제로 색을 시작하는 자리.
//
// Tokens 화면은 소비자가 쓰는 semantic token을 보여준다. 여기는 OKLCH palette source와
// 생성된 HEX Palette Token을 나란히 보여주는 Foundations inspector다.

import { Box, Inline, Stack, Text } from "@studio-baeks/paper-ui";

import { ACCENT_PALETTES, ACCENT_STEPS, ALPHA_STEPS, OKLCH_PALETTE, PALETTE_STEPS, PALETTE_TOKENS } from "../../../packages/paper-ui/src/tokens/palette";

import { PlaygroundLayout, ReferenceHeading } from "./shell";
import "./palette.css";

const paletteIdentity = (palette: (typeof ACCENT_PALETTES)[number]) => {
  const [lightness, chroma, hue] = OKLCH_PALETTE.accent[palette]["600"];
  return `H ${hue} · C ${chroma} · L ${lightness}`;
};

const Section = ({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) => (
  <Stack as="section" gap="lg">
    <Stack gap="xs">
      <Text variant="heading">{title}</Text>
      <Text variant="body" ink="soft">{desc}</Text>
    </Stack>
    {children}
  </Stack>
);

const PaletteStrip = <Step extends string>({ name, steps, getColor, getCoordinates }: {
  name: string;
  steps: readonly Step[];
  getColor: (step: Step) => string;
  getCoordinates: (step: Step) => readonly [number, number, number];
}) => (
  <Stack className="palette-scale" gap="sm">
    {name !== "Neutral" && <Inline className="palette-scale-heading" gap="sm" align="baseline" wrap>
      <Text variant="subheading" as="span">{name}</Text>
      <Text variant="caption" family="mono" ink="faint" as="span">{paletteIdentity(name as (typeof ACCENT_PALETTES)[number])}</Text>
    </Inline>}
    <Box className={`palette-grid ${name === "Neutral" ? "palette-grid--neutral" : "palette-grid--accent"}`} role="list" aria-label={`${name} palette`}>
      {steps.map((step) => {
        const color = getColor(step);
        const [lightness, chroma, hue] = getCoordinates(step);
        return (
          <Stack key={step} className="palette-cell" role="listitem" gap="xs">
            <Text variant="caption" family="mono" as="span" ink="faint">{step}</Text>
            <Box className="palette-swatch" radius="sm" border style={{ background: color }} title={`${name} ${step} · ${color} · L ${lightness.toFixed(3)} · C ${chroma.toFixed(3)} · H ${hue.toFixed(1)}°`} />
            <Text variant="caption" family="mono" as="span">{color}</Text>
          </Stack>
        );
      })}
    </Box>
  </Stack>
);

const SurfaceStrip = () => (
  <PaletteStrip name="Neutral" steps={PALETTE_STEPS}
    getColor={(step) => PALETTE_TOKENS.neutral[step]}
    getCoordinates={(step) => OKLCH_PALETTE.neutral[step]} />
);

const AccentStrip = ({ palette }: { palette: (typeof ACCENT_PALETTES)[number] }) => (
  <PaletteStrip name={palette} steps={ACCENT_STEPS}
    getColor={(step) => PALETTE_TOKENS.accent[palette][step]}
    getCoordinates={(step) => OKLCH_PALETTE.accent[palette][step]} />
);

const AlphaPalette = () => (
  <Box className="palette-interaction-grid">
    {(["0", "950"] as const).flatMap((neutral) => ALPHA_STEPS.map((step) => {
      const token = PALETTE_TOKENS[`alpha${step}`].neutral[neutral];
      return (
        <Stack key={`${neutral}-${step}`} gap="xs" style={{ minWidth: 0 }}>
          <Box
            border
            radius="sm"
            overflow="hidden"
            style={{ height: "2.75rem", background: PALETTE_TOKENS.neutral[neutral === "0" ? "950" : "0"] }}
          >
            <Box style={{ width: "100%", height: "100%", background: token }} />
          </Box>
          <Text variant="caption" as="span">alpha{step}.neutral.{neutral}</Text>
          <Text variant="caption" family="mono" ink="faint" as="span">{token}</Text>
        </Stack>
      );
    }))}
  </Box>
);

export const Palette = () => {
  return (
    <PlaygroundLayout value="palette">
      <Stack className="palette-page" gap="xl">
        <ReferenceHeading group="Reference" name="Palette" description="테마와 무관한 단일 OKLCH palette와 생성된 HEX token입니다. Light/Dark 테마 차이는 semantic token이 필요한 palette step을 선택해 만듭니다." />

        <Section
          title="Neutral"
          desc="0부터 950까지 이어지는 단일 중립 scale입니다. Dark canvas를 위해 900과 950 사이에 925를 둡니다."
        >
          <SurfaceStrip />
        </Section>

        <Section
          title="Alpha"
          desc="Neutral 양 끝 색에 고정 opacity scale을 적용한 단일 alpha palette입니다. Interaction, scrim, shadow semantic이 필요한 항목을 선택합니다."
        >
          <AlphaPalette />
        </Section>

        <Section
          title="Accent"
          desc="OKLCH 기준 색을 보간해 만든 단일 accent scale입니다. 100과 200 사이에는 soft surface용 150 단계를 둡니다. 색상 값과 source 좌표는 칩에 포인터를 올려 확인할 수 있습니다."
        >
          <Stack gap="lg">
            {ACCENT_PALETTES.map((palette) => <AccentStrip key={palette} palette={palette} />)}
          </Stack>
        </Section>

        <Section
          title="Semantic handoff"
          desc="Palette inspector만 원본 좌표와 생성된 HEX token을 살펴봅니다. application과 component는 semantic role만 선택합니다."
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
