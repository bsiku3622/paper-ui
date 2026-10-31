// The Motion tables: the durations, curves and loops as authored, and the role each component picks.
import { DURATION, EASING, LOOP, MOTION, MOTION_CONSUMERS, MOTION_ROLES } from "@paper-ui/inspect/motion";
import { tokens } from "@studio-baeks/paper-ui/tokens";

import type { GeneratedBlock } from "./markers";
import { table } from "./table";

const nameOf = <T extends Record<string, unknown>>(record: T, value: unknown) => Object.keys(record).find((key) => record[key] === value) ?? String(value);

const motionSourceRows = (): string[][] => [
  ["`duration`", Object.entries(DURATION).map(([name, value]) => `\`${name}\` ${value}`).join(" · ")],
  ["`easing`", Object.entries(EASING).map(([name, value]) => `\`${name}\` ${value.startsWith("cubic") ? `(${value.slice(13, -1)})` : ""}`.trim()).join(" · ")],
  ["`loop`", Object.entries(LOOP).map(([name, loop]) => `\`${name}\` ${loop.duration} ${nameOf(EASING, loop.easing)}`).join(" · ")],
];

// The situation of each role; the places that use it come from MOTION_CONSUMERS.
const SITUATIONS: Record<(typeof MOTION_ROLES)[number], string> = {
  press: "버튼을 누르는 순간",
  hover: "포인터가 지나갈 때 바뀌는 hover tint·테두리·글자색",
  state: "켜짐·선택처럼 머무는 상태, 면·배경의 전이, 스위치 손잡이",
  enter: "떠오르는 overlay",
  exit: "사라지는 overlay",
  theme: "테마 전환 — 모드가 바뀌는 프레임에 모든 전이가 즉시 끝남",
};

// A displacement is the length of a Layout gap or a Shape stroke; the role that holds it names it.
const LENGTH_ROLES = { gap: tokens.layout.gap, stroke: tokens.shape.stroke };
const lengthName = (length: string): string => {
  for (const [group, roles] of Object.entries(LENGTH_ROLES)) {
    const key = Object.entries(roles).find(([, value]) => value === length)?.[0];
    if (key !== undefined) return `\`${group}.${key}\``;
  }
  throw new Error(`no role holds the displacement ${length}`);
};

const displacement = (role: (typeof MOTION_ROLES)[number]): string => {
  const { offset, scale }: { duration: string; offset?: string; scale?: string } = MOTION[role];
  if (offset === undefined) return "—";
  return role === "press" ? `${lengthName(offset)} 만큼 아래로` : [lengthName(offset), scale === undefined ? "" : `scale ${scale}`].filter(Boolean).join(" · ");
};

const motionRoleRows = (): string[][] =>
  MOTION_ROLES.map((role) => {
    const spec = MOTION[role];
    return [`\`${role}\``, nameOf(DURATION, spec.duration), nameOf(EASING, spec.easing), displacement(role), SITUATIONS[role], MOTION_CONSUMERS[role].join(" · ")];
  });

export const MOTION_BLOCKS: GeneratedBlock[] = [
  { id: "motion-source", files: ["docs/foundations/motion.md"], render: () => table(["축", "값"], motionSourceRows()) },
  { id: "motion-roles", files: ["docs/foundations/motion.md"], render: () => table(["역할", "duration", "easing", "변위", "상황", "쓰는 곳"], motionRoleRows()) },
];
