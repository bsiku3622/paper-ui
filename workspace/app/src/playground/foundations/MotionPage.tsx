import { useState, type ReactNode } from "react";

import { Button, Inline, Spinner, Surface, Switch, Text, loop, presence, reveal, revealAfter } from "@studio-baeks/paper-ui";
import { MOTION_CONSUMERS, MOTION_ROLES, tokens, transition, type MotionRole } from "@studio-baeks/paper-ui/tokens";
import { DURATION, EASING, LOOP, LOOP_REDUCED } from "@paper-ui/inspect/motion";

import { Board, BoardGroup, BoardRow, Cell, Curve, FoundationSection, TokenCell, Travel, ValueCell, px } from "./kit";
import { LOOP_NOTES, TRANSITION_PROPERTIES, roleNote, roleRange } from "./motion-roles";
import * as s from "./foundations.css";

const role = tokens.motion.role;
const easingName = (value: string) => Object.entries(EASING).find(([, curve]) => curve === value)?.[0] ?? value;
const timing = (spec: { duration: string; easing: string }) => `${spec.duration} ${easingName(spec.easing)}`;

// A surface entering or leaving through the presence recipe: data-presence picks the role. The exit specimen
// starts open, so it plays its enter once on load; the enter specimen waits until it is opened.
type Phase = "idle" | "entering" | "exiting";
const Presence = ({ mode }: { mode: "enter" | "exit" }) => {
  const [phase, setPhase] = useState<Phase>(mode === "exit" ? "entering" : "idle");
  const open = phase === "entering";
  return (
    <div className={s.presence}>
      <Button size="sm" variant="hairline" onClick={() => setPhase(open ? (mode === "exit" ? "exiting" : "idle") : "entering")}>{open ? "닫기" : "열기"}</Button>
      <Surface
        className={phase === "idle" ? `${presence.surface} ${s.presenceIdle}` : presence.surface}
        data-presence={phase === "idle" ? undefined : phase}
        fill="raised"
        border
        radius="md"
        paddingX="md"
        paddingY="sm"
        elevation="overlay"
      >
        <Text variant="caption">{open ? "떠오른 면" : "사라지는 중"}</Text>
      </Surface>
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

// What first comes onto a screen: three tiles that come in a step apart, played again on each press.
const REVEAL_TILES = ["제목", "본문", "카드"] as const;
const RevealSpecimen = () => {
  const [round, setRound] = useState(0);
  return (
    <div className={s.revealSpecimen}>
      <Button size="sm" variant="hairline" onClick={() => setRound((value) => value + 1)}>다시 재생</Button>
      <Inline key={round} gap="xs" data-testid="reveal-specimen">
        {REVEAL_TILES.map((label, index) => (
          <Surface key={label} className={`${reveal.load} ${revealAfter[index as keyof typeof revealAfter]}`} fill="raised" border radius="sm" paddingX="sm" paddingY="xs">
            <Text variant="caption">{label}</Text>
          </Surface>
        ))}
      </Inline>
    </div>
  );
};

const SPECIMENS: Record<MotionRole, ReactNode> = {
  press: <Button size="sm" variant="hairline">눌러 보기</Button>,
  hover: <Button size="sm" variant="hairline">포인터를 올려 보세요</Button>,
  state: <Switch size="sm" defaultChecked aria-label="상태 전이 예시" />,
  enter: <Presence mode="enter" />,
  exit: <Presence mode="exit" />,
  reveal: <RevealSpecimen />,
  theme: <ThemeSwap />,
};

// The roles a component transitions with; reveal is the app's, for what first comes onto a screen.
const COMPONENT_ROLES = MOTION_ROLES.filter((name) => name !== "reveal");
const REVEAL_RESULT = `${timing(role.reveal)} · ${px(role.reveal.offset)} 아래에서 · 흐림 ${px(role.reveal.blur)}`;

// The roles' presence recipe, as the two timings it joins.
const PRESENCE_RESULT = `entering → enter ${timing(role.enter)} · exiting → exit ${timing(role.exit)}`;
const PRESENCE_USERS = [...new Set([...MOTION_CONSUMERS.enter, ...MOTION_CONSUMERS.exit])].join(" · ");

export const MotionPage = () => (
  <>
    <FoundationSection title="Motion Source" description={`시간의 원본입니다. 조용한 밀도의 시스템이라 컴포넌트의 전이는 짧고 차분하고(${roleRange(COMPONENT_ROLES.map((name) => role[name].duration))}), 화면에 처음 들어오는 덩어리만 reveal로 ${role.reveal.duration}에 걸쳐 들어옵니다. 다른 시스템과 달리 CSS 변수로 굽지 않고, stylesheet가 빌드 때 transition 문자열로 조립합니다.`}>
      <Board columns={[{ label: "Token", track: "minmax(0, 1fr)" }, { label: "Specimen", track: "minmax(0, 1.5fr)" }, { label: "Value", align: "end", track: "minmax(0, 1fr)" }]} minWidth="36rem">
        <BoardGroup label="Duration — 막대에 포인터를 올리면 그 시간으로 움직입니다">
          {Object.entries(DURATION).map(([name, value]) => (
            <BoardRow key={name}>
              <TokenCell name={`motion.duration.${name}`} note={name === "reduced" ? "prefers-reduced-motion에서 쓰는 최소 양수" : undefined} />
              <Travel duration={value} easing={EASING.standard} />
              <ValueCell>{value}</ValueCell>
            </BoardRow>
          ))}
        </BoardGroup>
        <BoardGroup label={`Easing — 곡선과 slow(${DURATION.slow}) 이동`}>
          {Object.entries(EASING).map(([name, value]) => (
            <BoardRow key={name}>
              <TokenCell name={`motion.easing.${name}`} />
              <Cell><div className={s.easingSpecimen}><Curve easing={value} /><Travel duration={DURATION.slow} easing={value} /></div></Cell>
              <ValueCell>{value}</ValueCell>
            </BoardRow>
          ))}
        </BoardGroup>
        <BoardGroup label="Loop — 전이와 별도인 반복 주기">
          <BoardRow>
            <TokenCell name="motion.loop.spin" note={LOOP_NOTES.spin.note} />
            <Cell><Spinner size="md" label="회전 반복 예시" /></Cell>
            <ValueCell>{LOOP.spin.duration}</ValueCell>
          </BoardRow>
          <BoardRow>
            <TokenCell name="motion.loop.pulse" note={LOOP_NOTES.pulse.note} />
            <Cell><span className={`${s.pulseDot} ${loop.pulse}`} /></Cell>
            <ValueCell>{LOOP.pulse.duration}</ValueCell>
          </BoardRow>
        </BoardGroup>
      </Board>
    </FoundationSection>

    <FoundationSection title="Motion roles" description="컴포넌트는 시간과 곡선을 따로 고르지 않고, 지금이 어떤 상황의 움직임인지(role)만 고릅니다. reduced-motion에서 전이는 즉시 끝나고, 반복은 회전 대신 맥박으로 바뀌며, reveal은 재생되지 않고 처음부터 제자리에 섭니다.">
      <Board columns={[{ label: "Role", track: "minmax(0, 1.2fr)" }, { label: "Specimen", track: "minmax(0, 1.3fr)" }, { label: "Duration", align: "end", track: "minmax(4rem, auto)" }, { label: "Easing", align: "end", track: "minmax(5rem, auto)" }, { label: "Offset", align: "end", track: "minmax(5rem, auto)" }]} minWidth="40rem">
        {MOTION_ROLES.map((name) => {
          const spec: { duration: string; easing: string; offset?: string; scale?: string; blur?: string } = role[name];
          return (
            <BoardRow key={name} size="md">
              <TokenCell name={`motion.role.${name}`} note={roleNote(name)} />
              <Cell>{SPECIMENS[name]}</Cell>
              <ValueCell>{spec.duration}</ValueCell>
              <ValueCell title={spec.easing}>{easingName(spec.easing)}</ValueCell>
              <ValueCell>{spec.offset ? [px(spec.offset), spec.scale, spec.blur && `흐림 ${px(spec.blur)}`].filter(Boolean).join(" · ") : "—"}</ValueCell>
            </BoardRow>
          );
        })}
      </Board>
    </FoundationSection>

    <FoundationSection title="Motion composition" description="역할 위에 얹은 조합입니다. 전이는 transition()이 속성마다 역할의 시간과 곡선을 이어 붙이고, 면의 등장·퇴장은 presence, 반복은 loop, 화면에 처음 들어오는 덩어리는 reveal class가 겁니다. 쓰는 곳은 MOTION_CONSUMERS가 정합니다.">
      <Board columns={[{ label: "Composition", track: "minmax(0, 1.2fr)" }, { label: "Result", track: "minmax(0, 1.8fr)" }, { label: "Used by", align: "end", track: "minmax(0, 1.2fr)" }]} minWidth="40rem">
        <BoardGroup label="transition(role, …속성) — 역할의 시간과 곡선을 속성마다 붙입니다">
          {(Object.keys(TRANSITION_PROPERTIES) as (keyof typeof TRANSITION_PROPERTIES)[]).map((name) => (
            <BoardRow key={name}>
              <TokenCell name={`transition("${name}", …)`} note={TRANSITION_PROPERTIES[name].join(" · ")} />
              <Cell><Text variant="caption" family="mono" ink="secondary">{transition(name, ...TRANSITION_PROPERTIES[name])}</Text></Cell>
              <ValueCell>{MOTION_CONSUMERS[name].join(" · ")}</ValueCell>
            </BoardRow>
          ))}
        </BoardGroup>
        <BoardGroup label="presence — data-presence가 면의 등장과 퇴장에 enter · exit 역할을 겁니다">
          {(["surface", "scrim"] as const).map((name) => (
            <BoardRow key={name}>
              <TokenCell name={`presence.${name}`} note={name === "surface" ? "opacity와 변위" : "opacity만"} />
              <Cell><Text variant="caption" family="mono" ink="secondary">{PRESENCE_RESULT}</Text></Cell>
              <ValueCell>{PRESENCE_USERS}</ValueCell>
            </BoardRow>
          ))}
        </BoardGroup>
        <BoardGroup label="reveal — 화면에 처음 들어오는 덩어리에 reveal 역할을 겁니다. reduced-motion에서는 재생되지 않습니다">
          <BoardRow>
            <TokenCell name="reveal.load" note="마운트될 때 한 번" />
            <Cell><Text variant="caption" family="mono" ink="secondary">{REVEAL_RESULT}</Text></Cell>
            <ValueCell>앱 화면</ValueCell>
          </BoardRow>
          <BoardRow>
            <TokenCell name="reveal.scroll" note="화면에 들어오는 동안 view timeline을 따라 — 없는 브라우저에서는 제자리" />
            <Cell><Text variant="caption" family="mono" ink="secondary">{`${px(role.reveal.offset)} 아래에서 · 흐림 ${px(role.reveal.blur)} · ${easingName(role.reveal.easing)}`}</Text></Cell>
            <ValueCell>앱 화면</ValueCell>
          </BoardRow>
          <BoardRow>
            <TokenCell name="revealAfter[n]" note="함께 들어오는 형제는 n 걸음 늦게" />
            <Cell><Text variant="caption" family="mono" ink="secondary">{`한 걸음 ${role.reveal.step}`}</Text></Cell>
            <ValueCell>앱 화면</ValueCell>
          </BoardRow>
        </BoardGroup>
        <BoardGroup label="loop — 반복. reduced-motion에서는 정해진 맥박으로 바뀝니다">
          {(Object.keys(LOOP) as (keyof typeof LOOP)[]).map((name) => (
            <BoardRow key={name}>
              <TokenCell name={`loop.${name}`} note={LOOP_NOTES[name].note} />
              <Cell><Text variant="caption" family="mono" ink="secondary">{`${LOOP[name].duration} ${easingName(LOOP[name].easing)} · reduced → ${LOOP_REDUCED[name]}`}</Text></Cell>
              <ValueCell>{LOOP_NOTES[name].usedBy}</ValueCell>
            </BoardRow>
          ))}
        </BoardGroup>
      </Board>
    </FoundationSection>
  </>
);
