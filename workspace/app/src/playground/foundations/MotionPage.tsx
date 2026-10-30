import { useState } from "react";

import { Button, Inline, Surface, Switch, Text, elevation } from "@studio-baeks/paper-ui";
import { tokens } from "@studio-baeks/paper-ui/tokens";

import { Board, BoardGroup, BoardRow, Cell, FoundationSection, TokenCell, ValueCell } from "./kit";
import * as s from "./foundations.css";

const motion = tokens.motion;
type Easing = keyof typeof motion.easing;
type RoleName = keyof typeof motion.role;
const easingName = (value: string) => (Object.entries(motion.easing).find(([, curve]) => curve === value)?.[0] ?? value) as Easing;

// A dot that crosses its track while the pointer is over it, with the given timing.
const Travel = ({ duration, easing }: { duration: string; easing: string }) => (
  <div className={s.motionTrack} title="포인터를 올리면 움직입니다">
    <span className={s.motionDot} style={{ transitionDuration: duration, transitionTimingFunction: easing }} />
  </div>
);

// The easing drawn as its curve on a 64 × 32 plot.
const Curve = ({ easing }: { easing: string }) => {
  const points = /cubic-bezier\(([^)]+)\)/.exec(easing)?.[1]?.split(",").map(Number) ?? [0, 0, 1, 1];
  const [x1 = 0, y1 = 0, x2 = 1, y2 = 1] = points;
  const d = `M0 32 C ${x1 * 64} ${32 - y1 * 32}, ${x2 * 64} ${32 - y2 * 32}, 64 0`;
  return <svg className={s.curve} viewBox="-2 -6 68 44" aria-hidden="true"><path d={d} /></svg>;
};

// Plays an overlay entering or leaving with the role's timing and displacement.
const Presence = ({ mode }: { mode: "enter" | "exit" }) => {
  const [shown, setShown] = useState(mode === "exit");
  const timing = motion.role[shown ? "enter" : "exit"];
  const hidden = `translateY(${motion.role.enter.offset}) scale(${motion.role.enter.scale})`;
  return (
    <div className={s.presence}>
      <Button size="sm" variant="hairline" onClick={() => setShown((value) => !value)}>{shown ? "닫기" : "열기"}</Button>
      <div className={`${s.presenceCard} ${elevation.overlay}`} style={{ opacity: shown ? 1 : 0, transform: shown ? "none" : hidden, transition: `opacity ${timing.duration} ${timing.easing}, transform ${timing.duration} ${timing.easing}` }}>
        <Text variant="caption">{shown ? "떠오른 면" : "사라지는 중"}</Text>
      </div>
    </div>
  );
};

// A Surface that swaps between the ambient theme and its inverse: the Switch inside changes in the same frame.
const ThemeSwap = () => {
  const [inverse, setInverse] = useState(false);
  return (
    <div className={s.themeSwap}>
      <Button size="sm" variant="hairline" onClick={() => setInverse((value) => !value)}>전환</Button>
      <Surface theme={inverse ? "inverse" : undefined} fill="canvas" border radius="md" padding="sm">
        <Inline gap="sm">
          <Switch size="sm" defaultChecked aria-label="테마 전환 예시" />
          <Text variant="caption">{inverse ? "inverse" : "ambient"}</Text>
        </Inline>
      </Surface>
    </div>
  );
};

const HoverSample = () => (
  <div className={s.hoverSample} style={{ transition: `background-color ${motion.role.hover.duration} ${motion.role.hover.easing}` }}>
    <Text variant="caption" ink="secondary">포인터를 올려 보세요</Text>
  </div>
);

const ROLES: { name: RoleName; note: string; specimen: React.ReactNode }[] = [
  { name: "press", note: "누르는 순간 1px 내려앉음", specimen: <Button size="sm" variant="hairline">눌러 보기</Button> },
  { name: "hover", note: "면·글자색의 짧은 반응", specimen: <HoverSample /> },
  { name: "focus", note: "포커스 링 · Tab으로 확인", specimen: <Button size="sm" variant="hairline">Tab으로 포커스</Button> },
  { name: "state", note: "켜짐·선택 같은 상태 전이", specimen: <Switch size="sm" defaultChecked aria-label="상태 전이 예시" /> },
  { name: "enter", note: "떠오르는 overlay — 살짝 튀어 안착", specimen: <Presence mode="enter" /> },
  { name: "exit", note: "사라질 때는 짧게 가속", specimen: <Presence mode="exit" /> },
  { name: "theme", note: "테마 전환 — 컨트롤도 페이지와 같은 프레임에 바뀜", specimen: <ThemeSwap /> },
];

export const MotionPage = () => (
  <>
    <FoundationSection title="Motion Source" description="시간의 원본입니다. 조용한 밀도의 시스템이라 전이는 짧고 차분합니다(100~200ms). 다른 시스템과 달리 CSS 변수로 굽지 않고, stylesheet가 빌드 때 transition 문자열로 조립합니다.">
      <Board columns={[{ label: "Token" }, { label: "Specimen" }, { label: "Value", align: "end" }]} template="minmax(0, 1fr) minmax(0, 1.5fr) minmax(0, 1fr)" minWidth="36rem">
        <BoardGroup label="Duration — 막대에 포인터를 올리면 그 시간으로 움직입니다">
          {Object.entries(motion.duration).map(([name, value]) => (
            <BoardRow key={name}>
              <TokenCell name={`motion.duration.${name}`} note={name === "reduced" ? "prefers-reduced-motion에서 쓰는 최소 양수" : undefined} />
              <Travel duration={value} easing={motion.easing.standard} />
              <ValueCell>{value}</ValueCell>
            </BoardRow>
          ))}
        </BoardGroup>
        <BoardGroup label="Easing — 곡선과 slow(300ms) 이동">
          {Object.entries(motion.easing).map(([name, value]) => (
            <BoardRow key={name}>
              <TokenCell name={`motion.easing.${name}`} />
              <Cell><div className={s.easingSpecimen}><Curve easing={value} /><Travel duration={motion.duration.slow} easing={value} /></div></Cell>
              <ValueCell>{value}</ValueCell>
            </BoardRow>
          ))}
        </BoardGroup>
        <BoardGroup label="Loop — 전이와 별도인 반복 주기">
          <BoardRow>
            <TokenCell name="motion.loop.spin" note="Spinner 회전" />
            <Cell><span className={s.spin} style={{ animationDuration: motion.loop.spin }} /></Cell>
            <ValueCell>{motion.loop.spin}</ValueCell>
          </BoardRow>
          <BoardRow>
            <TokenCell name="motion.loop.pulse" note="대기 중인 표식" />
            <Cell><span className={s.pulse} style={{ animationDuration: motion.loop.pulse }} /></Cell>
            <ValueCell>{motion.loop.pulse}</ValueCell>
          </BoardRow>
        </BoardGroup>
      </Board>
    </FoundationSection>

    <FoundationSection title="Motion roles" description="컴포넌트는 시간과 곡선을 따로 고르지 않고, 지금이 어떤 상황의 움직임인지(role)만 고릅니다. 모든 전이는 reduced-motion 환경에서 즉시 끝납니다.">
      <Board columns={[{ label: "Role" }, { label: "Specimen" }, { label: "Duration", align: "end" }, { label: "Easing", align: "end" }, { label: "Offset", align: "end" }]} template="minmax(0, 1.2fr) minmax(0, 1.3fr) minmax(4rem, auto) minmax(5rem, auto) minmax(5rem, auto)" minWidth="40rem">
        {ROLES.map((role) => {
          const spec = motion.role[role.name] as { duration: string; easing: string; offset?: string; scale?: string };
          return (
            <BoardRow key={role.name} size="md">
              <TokenCell name={`motion.role.${role.name}`} note={role.note} />
              <Cell>{role.specimen}</Cell>
              <ValueCell>{spec.duration}</ValueCell>
              <ValueCell title={spec.easing}>{easingName(spec.easing)}</ValueCell>
              <ValueCell>{spec.offset ? [spec.offset, spec.scale].filter(Boolean).join(" · ") : "—"}</ValueCell>
            </BoardRow>
          );
        })}
      </Board>
    </FoundationSection>
  </>
);
