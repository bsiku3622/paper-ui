import type { CSSProperties } from "react";

import { Text } from "@studio-baeks/paper-ui";
import { tokens, CONTROL_SIZES, TEXT_VARIANTS, type ControlSize, type TextVariant } from "@studio-baeks/paper-ui/tokens";
import { TYPOGRAPHY } from "@paper-ui/inspect/typography";

import { Board, BoardGroup, BoardRow, FoundationSection, FontSample, MatrixCell, TokenCell, ValueCell, px, resolved } from "./kit";
import { valueAt } from "./paths";
import { CODE_BLOCK, CODE_SCALE_NOTES, PRESET_NOTES, PRESET_PATHS, SIZE_LEADING, fluidRole, fluidStepOf, isLadder, type PresetPath } from "./typography-roles";
import * as s from "./foundations.css";

const SPECIMEN = "Aa 가나다 0123";

type PaletteGroup = { key: string; label: string; rows: { name: string; value: string; font: CSSProperties; sample?: React.ReactNode }[] };
const palette = TYPOGRAPHY.palette;
const entries = <T extends Record<string, string>>(values: T) => Object.entries(values) as [string, string][];

const PALETTE_GROUPS: PaletteGroup[] = [
  { key: "fontSize", label: "Font size", rows: entries(palette.fontSize).map(([name, value]) => ({ name, value, font: { fontSize: value, lineHeight: palette.leading[SIZE_LEADING[name as keyof typeof SIZE_LEADING]] }, sample: fluidStepOf(name)?.palette })) },
  { key: "weight", label: "Weight", rows: entries(palette.weight).map(([name, value]) => ({ name, value, font: { fontWeight: value } })) },
  { key: "leading", label: "Leading", rows: entries(palette.leading).map(([name, value]) => ({ name, value, font: { lineHeight: value }, sample: <>한 줄과 다음 줄의 간격을<br />눈으로 확인합니다.</> })) },
  { key: "tracking", label: "Tracking", rows: entries(palette.tracking).map(([name, value]) => ({ name, value, font: { letterSpacing: value }, sample: "TRACKING · 가나다" })) },
  { key: "family", label: "Family", rows: [
    ...entries(palette.family).map(([name, value]) => ({ name, value, font: { fontFamily: value, fontSize: name === "mono" ? `calc(${palette.fontSize["14"]} * ${palette.monoSizeScale})` : palette.fontSize["14"] } })),
  ] },
  { key: "decoration", label: "Decoration", rows: [
    { name: "underlineOffset", value: palette.decoration.underlineOffset, font: { textDecoration: "underline", textUnderlineOffset: palette.decoration.underlineOffset }, sample: "밑줄이 글자에서 떨어진 거리" },
  ] },
];
const MONO_SCALE = { name: "monoSizeScale", value: palette.monoSizeScale };
const CODE_SCALES = entries(palette.codeScale) as [keyof typeof palette.codeScale, string][];
const codeBlockValue = `${px(palette.fontSize[CODE_BLOCK.spec.size])} / ${px(palette.leading[CODE_BLOCK.spec.leading])} · ${resolved(palette.weight[CODE_BLOCK.spec.weight])}`;

const TEXT_SAMPLES = {
  hero: "조용한 바탕",
  display: "복잡한 화면을 더 명확하게",
  title: "큰 흐름을 한눈에 보여줍니다",
  heading: "필요한 정보에 집중할 수 있도록",
  subheading: "작업의 맥락을 놓치지 않게",
  body: "팀의 진행 상황과 다음 할 일을 한곳에서 확인하세요.",
  caption: "마지막 수정 · 오늘 오전 10:42",
  label: "담당자 · 진행 상태 · 마감일",
} satisfies Record<TextVariant, string>;
const TEXT_ROLES: Record<TextVariant, string> = {
  hero: "랜딩 헤드라인",
  display: "큰 제목",
  title: "페이지 제목",
  heading: "섹션 제목",
  subheading: "작은 제목",
  body: "읽기 본문",
  caption: "보조 정보",
  label: "짧은 이름",
};

type PresetRefs = { size: string; leading: string; weight: string; inputLeading?: string };
const presetRefs = (path: PresetPath, size?: ControlSize): PresetRefs => {
  const node = valueAt(tokens.typography.preset, path) as PresetRefs | Record<ControlSize, PresetRefs>;
  return size ? (node as Record<ControlSize, PresetRefs>)[size] : (node as PresetRefs);
};

const presetCaption = (spec: PresetRefs) => (
  <>
    {`${px(spec.size)} / ${px(spec.leading)} · ${resolved(spec.weight)}`}
    {spec.inputLeading ? <><br />{`입력 줄상자 ${px(spec.inputLeading)}`}</> : null}
  </>
);

const sizeLeading = (variant: TextVariant) => {
  const fluid = fluidRole(variant);
  const role = tokens.typography.role[variant];
  return fluid ? `${fluid.span} / ${fluid.leading}` : `${px(role.size)} / ${px(role.leading)}`;
};

export const TypographyPage = () => (
  <>
    <FoundationSection title="Typography Palette" description="Text 역할과 Control preset이 함께 참조하는 원본 값입니다. 크기와 행간은 실제 px 값을 이름으로 씁니다.">
      <Board columns={[{ label: "Token" }, { label: "Specimen" }, { label: "Value", align: "end" }]} template="minmax(22rem, 1fr) minmax(13.25rem, 1.5fr) minmax(13rem, 1fr)" minWidth="52.25rem">
        {PALETTE_GROUPS.map((group) => (
          <BoardGroup key={group.key} label={group.label}>
            {group.rows.map((row) => (
              <BoardRow key={row.name}>
                <TokenCell name={`typography.palette.${group.key}.${row.name}`} />
                <FontSample className={s.specimen} font={row.font}>{row.sample ?? SPECIMEN}</FontSample>
                <ValueCell>{resolved(row.value)}</ValueCell>
              </BoardRow>
            ))}
            {group.key === "family" ? (
              <BoardRow>
                <TokenCell name={`typography.palette.${MONO_SCALE.name}`} note="mono가 sans와 같은 크기로 읽히도록 줄이는 배율" />
                <Text className={s.specimen} variant="body" family="mono" ink="primary">{SPECIMEN}</Text>
                <ValueCell>{resolved(MONO_SCALE.value)}</ValueCell>
              </BoardRow>
            ) : null}
            {group.key === "family" ? CODE_SCALES.map(([name, value]) => (
              <BoardRow key={name}>
                <TokenCell name={`typography.palette.codeScale.${name}`} note={CODE_SCALE_NOTES[name]} />
                <Text className={s.specimen} variant="body" ink="primary">문장 속 <code className={s.codeSample[name]}>WEB-24 · 0123</code></Text>
                <ValueCell>{resolved(value)}</ValueCell>
              </BoardRow>
            )) : null}
            {group.key === "family" ? (
              <BoardRow>
                <TokenCell name={'codeRule("block")'} note={CODE_BLOCK.note} />
                <Text className={s.specimen} variant="body" ink="primary"><code className={s.codeSample.block}>{'const gap = "lg";'}</code></Text>
                <ValueCell>{codeBlockValue}</ValueCell>
              </BoardRow>
            ) : null}
          </BoardGroup>
        ))}
      </Board>
    </FoundationSection>

    <FoundationSection title="Type scale" description="페이지 제목부터 보조 정보까지, 화면에서 맡은 역할로 크기와 굵기를 고릅니다.">
      <Board columns={[{ label: "Role" }, { label: "Specimen" }, { label: "Weight", align: "end" }, { label: "Size / leading", align: "end" }]} template="minmax(6.75rem, auto) minmax(0, 1fr) minmax(4.5rem, auto) minmax(6.75rem, auto)" minWidth="36rem">
        {TEXT_VARIANTS.map((variant) => (
          <BoardRow key={variant} size="md">
            <TokenCell name={`typography.role.${variant}`} note={TEXT_ROLES[variant]} />
            <Text as="p" variant={variant} ink="primary" className={s.specimen}>{TEXT_SAMPLES[variant]}</Text>
            <ValueCell>{resolved(tokens.typography.role[variant].weight)}</ValueCell>
            <ValueCell>{sizeLeading(variant)}</ValueCell>
          </BoardRow>
        ))}
      </Board>
    </FoundationSection>

    <FoundationSection title="Control presets" description="비슷한 컴포넌트는 같은 완성 typography class를 공유합니다. size는 geometry와 함께 선택됩니다.">
      <Board columns={[{ label: "Preset" }, ...CONTROL_SIZES.map((size) => ({ label: size, align: "center" as const }))]} template="minmax(15.5rem, 1.1fr) repeat(3, minmax(10rem, 1fr))" minWidth="50rem">
        {PRESET_PATHS.map((path) => (
          <BoardRow key={path} size="lg">
            <TokenCell name={`typography.preset.${path}`} note={PRESET_NOTES[path].role} />
            {isLadder(path)
              ? CONTROL_SIZES.map((size) => (
                <MatrixCell key={size} caption={presetCaption(presetRefs(path, size))}>
                  <span className={`${s.presetFont[path][size]} ${s.presetSample}`}>{PRESET_NOTES[path].sample}</span>
                </MatrixCell>
              ))
              : (
                <MatrixCell caption={presetCaption(presetRefs(path))}>
                  <span className={`${s.presetFont[path].md} ${s.presetSample}`}>{PRESET_NOTES[path].sample}</span>
                </MatrixCell>
              )}
          </BoardRow>
        ))}
      </Board>
    </FoundationSection>
  </>
);
