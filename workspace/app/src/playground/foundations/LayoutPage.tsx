import { Text, useResolvedTheme } from "@studio-baeks/paper-ui";
import { tokens, BREAKPOINTS, ELEVATIONS, SPACES, type Depth, type Elevation } from "@studio-baeks/paper-ui/tokens";

import { LAYOUT_SOURCE } from "../../../../packages/paper-ui/src/tokens/layout";
import { Board, BoardGroup, BoardRow, Cell, FoundationSection, Meter, TokenCell, ValueCell, mediaValue, resolved } from "./kit";
import * as s from "./foundations.css";

const layout = tokens.layout;
const maxBreakpoint = Math.max(...Object.values(LAYOUT_SOURCE.breakpoint));
const geometry = (layers: readonly (readonly number[])[]) => layers.map((layer) => layer.join(" ")).join(", ");

// The levels that cast a given depth of shadow, in elevation order; the first one stands for the depth.
const levelsOf = (depth: Depth) => ELEVATIONS.filter((level) => LAYOUT_SOURCE.elevation[level].depth === depth);

const ELEVATION_USE: Record<Elevation, string> = {
  base: "지면에 붙은 면",
  raised: "살짝 들린 작은 것 — 스위치 손잡이, 미리보기 위 도구",
  sticky: "sticky 헤더·사이드바 — 그림자 대신 경계선",
  overlay: "팝오버·메뉴",
  modal: "대화상자 — 아래에 scrim",
  toast: "가장 위 알림",
};

// A raised card on the page canvas carrying the level's shadow, in the current theme.
const ElevationCard = ({ level }: { level: Elevation }) => (
  <div className={s.elevationStage}>
    <div className={s.elevationCard} style={{ boxShadow: layout.elevation[level].shadow }}><Text variant="caption" ink="secondary">{level}</Text></div>
  </div>
);

export const LayoutPage = () => {
  const theme = useResolvedTheme() === "dark" ? "dark" : "light";
  return (
    <>
      <FoundationSection title="Layout Source" description="요소 사이의 관계를 정하는 원본입니다. 거리는 Shape의 길이 scale을 그대로 쓰므로 여기에는 페이지 틀·분기점·깊이만 있습니다.">
        <Board columns={[{ label: "Token" }, { label: "Specimen" }, { label: "Value", align: "end" }]} template="minmax(0, 1fr) minmax(0, 1.5fr) minmax(0, 1fr)" minWidth="36rem">
          <BoardGroup label="Container">
            <BoardRow>
              <TokenCell name="layout.container.content" note="사이트 본문 격자의 최대 폭" />
              <Meter value={LAYOUT_SOURCE.container.content} max={LAYOUT_SOURCE.container.content} />
              <ValueCell>{resolved(layout.container.content)}</ValueCell>
            </BoardRow>
          </BoardGroup>
          <BoardGroup label="Breakpoint — 미디어 쿼리가 변수를 못 읽어 값으로 둡니다">
            {BREAKPOINTS.map((name) => (
              <BoardRow key={name}>
                <TokenCell name={`layout.breakpoint.${name}`} />
                <Meter value={LAYOUT_SOURCE.breakpoint[name]} max={maxBreakpoint} />
                <ValueCell>{mediaValue(layout.breakpoint[name])}</ValueCell>
              </BoardRow>
            ))}
          </BoardGroup>
          <BoardGroup label="Elevation z — tier 사이를 10씩 띄웁니다">
            {ELEVATIONS.map((level, index) => (
              <BoardRow key={level}>
                <TokenCell name={`layout.elevation.${level}.z`} />
                <Cell><div className={s.zStack}>{ELEVATIONS.slice(0, index + 1).map((step) => <span key={step} className={s.zLayer} />)}</div></Cell>
                <ValueCell>{resolved(layout.elevation[level].z)}</ValueCell>
              </BoardRow>
            ))}
          </BoardGroup>
          <BoardGroup label={`Shadow geometry — x y blur spread (px), 지금 테마(${theme})의 기하 · 색은 Color의 shadow colour`}>
            {(Object.keys(LAYOUT_SOURCE.shadow[theme]) as Depth[]).map((depth) => (
              <BoardRow key={depth}>
                <TokenCell name={`shadow.${depth}.${theme}`} note={`${levelsOf(depth).join(" · ")} 층`} />
                <ElevationCard level={levelsOf(depth)[0]!} />
                <ValueCell>{geometry(LAYOUT_SOURCE.shadow[theme][depth])}</ValueCell>
              </BoardRow>
            ))}
          </BoardGroup>
        </Board>
      </FoundationSection>

      <FoundationSection title="Layout roles" description="형제 사이와 페이지 가장자리의 거리입니다. gap은 Shape inset과 같은 scale이라 같은 단계는 같은 길이입니다.">
        <Board columns={[{ label: "Role" }, { label: "Specimen" }, { label: "Value", align: "end" }]} template="minmax(0, 1fr) minmax(0, 1.5fr) minmax(0, 1fr)" minWidth="36rem">
          <BoardGroup label="Gap — Stack·Inline·Grid의 gap, margin, 위치 offset">
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
              <TokenCell name="layout.gutter" note="페이지 가장자리와 내용 사이, 모달 scrim의 안쪽 = space.lg" />
              <Cell><div className={s.gutterFrame}><span /></div></Cell>
              <ValueCell>{resolved(layout.gutter)}</ValueCell>
            </BoardRow>
          </BoardGroup>
        </Board>
      </FoundationSection>

      <FoundationSection title="Elevation" description={`층 하나가 쌓임 순서(z)와 그림자를 함께 정합니다. 떠 있는 층만 그림자를 갖고, 깊이는 lifted와 floating 둘뿐입니다. Box는 elevation prop으로 층을 고릅니다. 지금 테마(${theme})의 그림자입니다.`}>
        <Board columns={[{ label: "Level" }, { label: "z", align: "end" }, { label: "Specimen", align: "center" }]} template="minmax(0, 1.5fr) minmax(3rem, auto) minmax(12rem, 1fr)" minWidth="36rem">
          {ELEVATIONS.map((level) => (
            <BoardRow key={level} size="md">
              <TokenCell name={`layout.elevation.${level}`} note={ELEVATION_USE[level]} />
              <ValueCell>{resolved(layout.elevation[level].z)}</ValueCell>
              <ElevationCard level={level} />
            </BoardRow>
          ))}
        </Board>
      </FoundationSection>
    </>
  );
};
