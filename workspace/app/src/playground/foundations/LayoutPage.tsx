import { Surface, Text, elevation, useResolvedTheme } from "@studio-baeks/paper-ui";
import { tokens, BREAKPOINTS, ELEVATIONS, SPACES, type Depth, type Elevation } from "@studio-baeks/paper-ui/tokens";
import { ELEVATION_NEST_LIMIT, LAYOUT, LAYOUT_SOURCE } from "@paper-ui/inspect/layout";

import type { Bilingual } from "../../site/locale";
import { Board, BoardGroup, BoardRow, Cell, Computed, FoundationSection, Meter, TokenCell, ValueCell, mediaValue, resolved, useT } from "./kit";
import * as s from "./foundations.css";

const layout = tokens.layout;
const gutterStep = SPACES.find((step) => LAYOUT.gap[step] === LAYOUT.gutter);
const maxBreakpoint = Math.max(...Object.values(LAYOUT_SOURCE.breakpoint));
const geometry = (layers: readonly (readonly number[])[]) => layers.map((layer) => layer.join(" ")).join(", ");

const { section } = LAYOUT_SOURCE;
const { tier, nudge } = LAYOUT_SOURCE.elevation;
const tierSpan = tier.sticky.z - tier.lifted.z;

// The levels that cast a given depth of shadow, in elevation order; the first one stands for the depth. Resting has none.
const levelsOf = (depth: Depth) => ELEVATIONS.filter((level) => tier[level].depth === depth);

const ELEVATION_USE: Record<Elevation, Bilingual> = {
  lifted: { ko: "살짝 들린 작은 것 — 스위치 손잡이", en: "A small, slightly lifted thing: a switch knob" },
  sticky: { ko: "sticky 헤더·사이드바 — 경계선이나 제자리 그림자로 나눕니다", en: "Sticky headers and sidebars: set apart by a border or a resting shadow" },
  overlay: { ko: "팝오버·메뉴", en: "Popovers and menus" },
  modal: { ko: "대화상자 — 아래에 scrim", en: "Dialogs, with a scrim beneath" },
  toast: { ko: "가장 위 알림", en: "The topmost notice" },
};

// A card on the page canvas carrying the level's elevation, in the current theme. The stage isolates it, so its z
// stays inside the board.
const ElevationCard = ({ level }: { level: Elevation }) => (
  <div className={s.elevationStage}>
    <div className={`${s.elevationCard} ${elevation[level]}`}><Text variant="caption" ink="secondary">{level}</Text></div>
  </div>
);

const RestingCard = () => (
  <div className={s.elevationStage}>
    <Surface fill="raised" shadow className={s.elevationCard}><Text variant="caption" ink="secondary">resting</Text></Surface>
  </div>
);

export const LayoutPage = () => {
  const theme = useResolvedTheme() === "dark" ? "dark" : "light";
  const t = useT();
  return (
    <>
      <FoundationSection title="Layout Source" description={t({ ko: "요소 사이의 관계를 정하는 원본입니다. 거리는 Shape의 길이 scale을 그대로 쓰므로 여기에는 페이지 틀·구간·분기점·깊이만 있습니다.", en: "The source that sets the relations between elements. Distances use Shape's length scale as it is, so only the page frame, sections, breakpoints and depth live here." })}>
        <Board columns={[{ label: "Token", track: "minmax(0, 1fr)" }, { label: "Specimen", track: "minmax(0, 1.5fr)" }, { label: "Value", align: "end", track: "minmax(0, 1fr)" }]} minWidth="36rem">
          <BoardGroup label="Container">
            <BoardRow>
              <TokenCell name="layout.container.content" note={t({ ko: "사이트 본문 격자의 최대 폭", en: "The maximum width of the site's content grid" })} />
              <Meter value={LAYOUT_SOURCE.container.content} max={LAYOUT_SOURCE.container.content} />
              <ValueCell>{resolved(layout.container.content)}</ValueCell>
            </BoardRow>
          </BoardGroup>
          <BoardGroup label={t({ ko: "Breakpoint — 미디어 쿼리가 변수를 못 읽어 값으로 둡니다", en: "Breakpoint — kept as values, since a media query cannot read a variable" })}>
            {BREAKPOINTS.map((name) => (
              <BoardRow key={name}>
                <TokenCell name={`layout.breakpoint.${name}`} />
                <Meter value={LAYOUT_SOURCE.breakpoint[name]} max={maxBreakpoint} />
                <ValueCell>{mediaValue(layout.breakpoint[name])}</ValueCell>
              </BoardRow>
            ))}
          </BoardGroup>
          <BoardGroup label={t({ ko: "Viewport — 창의 높이입니다", en: "Viewport — the height of the window" })}>
            <BoardRow>
              <TokenCell name="layout.viewport" note={t({ ko: "창만큼 서는 면과 화면을 채우는 틀 — Box의 height=\"viewport\"", en: "A surface as tall as the window, and the frame that fills the screen: Box height=\"viewport\"" })} />
              <Meter value={1} max={1} />
              <ValueCell><Computed value={layout.viewport} /></ValueCell>
            </BoardRow>
          </BoardGroup>
          <BoardGroup label={t({ ko: "Section — 페이지의 한 구간이 열고 닫는 거리, 뷰포트 높이를 따라 자라는 선언된 유동 단계입니다", en: "Section — the distance a section of the page opens and closes with: a declared fluid step that grows with the viewport height" })}>
            <BoardRow>
              <TokenCell name="layout.section.start" note={t({ ko: `구간 위 — 뷰포트 높이의 ${section.start.vh}%, space.3xl에서 ${section.start.maxRatio}배 사이`, en: `Above a section — ${section.start.vh}% of the viewport height, between space.3xl and ${section.start.maxRatio}× that` })} />
              <Meter value={section.start.vh} max={100} />
              <ValueCell><Computed value={layout.section.start} /></ValueCell>
            </BoardRow>
            <BoardRow>
              <TokenCell name="layout.section.end" note={t({ ko: `구간 아래 — 뷰포트 높이의 ${section.end.vh}%, space.2xl에서 space.3xl 사이`, en: `Below a section — ${section.end.vh}% of the viewport height, between space.2xl and space.3xl` })} />
              <Meter value={section.end.vh} max={100} />
              <ValueCell><Computed value={layout.section.end} /></ValueCell>
            </BoardRow>
          </BoardGroup>
          <BoardGroup label={t({ ko: `Elevation z — tier 사이를 ${tierSpan}씩 띄웁니다`, en: `Elevation z — tiers are ${tierSpan} apart` })}>
            {ELEVATIONS.map((level, index) => (
              <BoardRow key={level}>
                <TokenCell name={`layout.elevation.${level}.z`} />
                <Cell><div className={s.zStack}>{ELEVATIONS.slice(0, index + 1).map((step) => <span key={step} className={s.zLayer} />)}</div></Cell>
                <ValueCell>{tier[level].z}</ValueCell>
              </BoardRow>
            ))}
            <BoardRow>
              <TokenCell name="layout.elevation.nudge" note={t({ ko: `같은 tier 안의 한 걸음, tier당 ${ELEVATION_NEST_LIMIT}번`, en: `One step within the same tier, ${ELEVATION_NEST_LIMIT} per tier` })} />
              <Meter value={nudge} max={tierSpan} />
              <ValueCell>{nudge}</ValueCell>
            </BoardRow>
          </BoardGroup>
          <BoardGroup label={t({ ko: `Shadow geometry — x y blur spread (px), 지금 테마(${theme})의 기하 · 색은 Color의 shadow 색`, en: `Shadow geometry — x y blur spread (px), the geometry of the current theme (${theme}) · the colour is Color's shadow colour` })}>
            {(Object.keys(LAYOUT_SOURCE.shadow[theme]) as Depth[]).map((depth) => {
              const [level] = levelsOf(depth);
              return (
                <BoardRow key={depth}>
                  <TokenCell name={`layout.shadow.${depth}`} note={level ? `${levelsOf(depth).join(" · ")} tier` : t({ ko: "tier 없음 · shadow prop", en: "no tier · shadow prop" })} />
                  {level ? <ElevationCard level={level} /> : <RestingCard />}
                  <ValueCell>{geometry(LAYOUT_SOURCE.shadow[theme][depth])}</ValueCell>
                </BoardRow>
              );
            })}
          </BoardGroup>
        </Board>
      </FoundationSection>

      <FoundationSection title="Layout roles" description={t({ ko: "형제 사이와 페이지 가장자리의 거리입니다. gap은 Shape inset과 같은 scale이라 같은 단계는 같은 길이입니다.", en: "The distances between siblings and at the page edge. gap shares Shape inset's scale, so the same step is the same length." })}>
        <Board columns={[{ label: "Role", track: "minmax(0, 1fr)" }, { label: "Specimen", track: "minmax(0, 1.5fr)" }, { label: "Value", align: "end", track: "minmax(0, 1fr)" }]} minWidth="36rem">
          <BoardGroup label={t({ ko: "Gap — Stack·Inline·Grid의 gap, margin, 위치 offset", en: "Gap — the gap of Stack, Inline and Grid, margins, and position offsets" })}>
            {SPACES.map((step) => (
              <BoardRow key={step}>
                <TokenCell name={`layout.gap.${step}`} note={`= shape.space.${step}`} />
                <Cell><div className={`${s.gapSample} ${s.gapOf[step]}`}><span /><span /></div></Cell>
                <ValueCell>{resolved(layout.gap[step])}</ValueCell>
              </BoardRow>
            ))}
          </BoardGroup>
          <BoardGroup label="Page">
            <BoardRow>
              <TokenCell name="layout.gutter" note={t({ ko: `페이지 가장자리와 내용 사이, 모달 scrim의 안쪽, 팝오버가 뷰포트에 닿을 때 남기는 여백 = space.${gutterStep}`, en: `The space between the page edge and the content, inside the modal scrim, and left when a popover meets the viewport = space.${gutterStep}` })} />
              <Cell><div className={s.gutterFrame}><span /></div></Cell>
              <ValueCell>{resolved(layout.gutter)}</ValueCell>
            </BoardRow>
          </BoardGroup>
        </Board>
      </FoundationSection>

      <FoundationSection title="Elevation" description={t({ ko: `tier 하나가 position과 쌓임 순서(z)와 그림자를 함께 정합니다. 떠 있는 tier만 그림자를 갖고, 깊이는 lifted와 floating 둘뿐입니다. Surface는 elevation prop으로, 그 밖의 요소는 elevation class로 tier를 고릅니다. 지금 테마(${theme})의 그림자입니다.`, en: `One tier sets the position, the stacking order (z) and the shadow together. Only floating tiers cast a shadow, and there are just two depths, lifted and floating. A Surface picks its tier with the elevation prop, any other element with an elevation class. These are the shadows of the current theme (${theme}).` })}>
        <Board columns={[{ label: "Level", track: "minmax(0, 1.5fr)" }, { label: "z", align: "end", track: "minmax(3rem, auto)" }, { label: "Specimen", align: "center", track: "minmax(12rem, 1fr)" }]} minWidth="36rem">
          {ELEVATIONS.map((level) => (
            <BoardRow key={level} size="md">
              <TokenCell name={`layout.elevation.${level}`} note={t(ELEVATION_USE[level])} />
              <ValueCell>{tier[level].z}</ValueCell>
              <ElevationCard level={level} />
            </BoardRow>
          ))}
        </Board>
      </FoundationSection>
    </>
  );
};
