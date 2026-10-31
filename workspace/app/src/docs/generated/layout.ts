// The Layout tables and the elevation one-liner of AGENTS: the frame, the gaps and the tiers, read from the Layout source.
import { LAYOUT_SOURCE, resolveRole } from "@paper-ui/inspect/layout";
import { ELEVATIONS, tokens } from "@studio-baeks/paper-ui/tokens";

import type { GeneratedBlock } from "./markers";
import { table } from "./table";

const L = LAYOUT_SOURCE;
const rem = (px: number) => `${px / 16}rem`;

const TIER_USES: Record<(typeof ELEVATIONS)[number], string> = {
  lifted: "스위치 손잡이처럼 살짝 들린 작은 것",
  sticky: "sticky 헤더·사이드바 — 경계선으로 나눕니다",
  overlay: "팝오버·메뉴",
  modal: "대화상자, 그 아래 `color.overlay.scrim`",
  toast: "가장 위 알림",
};

const layoutRoleRows = (): string[][] => [
  ["`layout.gap.xs ~ 3xl`", Object.values(tokens.layout.gap).map(resolveRole).join(" · "), "Shape inset과 같은 scale"],
  ["`layout.gutter`", String(resolveRole(tokens.layout.gutter)), "페이지 가장자리와 내용 사이, 모달 scrim의 안쪽, 팝오버가 뷰포트에 닿을 때 남기는 여백"],
  ["`layout.container.content`", `${rem(L.container.content)} (${L.container.content})`, "사이트 본문 격자의 최대 폭. Box에서는 `maxWidth=\"container.content\"`로 고릅니다"],
  ["`layout.breakpoint.sm / md / lg / xl`", `${Object.values(L.breakpoint).map((px) => px / 16).join(" · ")}em (${Object.values(L.breakpoint).join(" · ")}px)`, "미디어 쿼리가 변수를 못 읽어 값으로 둡니다"],
  ["`layout.section.start / end`", `clamp(3xl, ${L.section.start.vh}vh, ${L.section.start.maxRatio} × 3xl) · clamp(2xl, ${L.section.end.vh}vh, 3xl)`, "페이지 구획의 위·아래 거리. 뷰포트 높이를 따라 자라는 유동 단계입니다"],
  ["`elevation.<tier>` (class)", "아래 표", "tier 하나가 position · z · 그림자를 한 번에 붙이는 class입니다. `tokens.layout`의 역할이 아닙니다"],
];

const tierRows = (): string[][] =>
  ELEVATIONS.map((tier) => {
    const { position, depth, z } = L.elevation.tier[tier];
    return [`\`${tier}\``, position, String(z), depth ?? "없음", TIER_USES[tier]];
  });

export const LAYOUT_BLOCKS: GeneratedBlock[] = [
  { id: "layout-roles", files: ["docs/foundations/layout.md"], render: () => table(["역할", "값", "비고"], layoutRoleRows()) },
  { id: "layout-elevation", files: ["docs/foundations/layout.md"], render: () => table(["tier", "position", "z", "그림자 깊이", "쓰는 곳"], tierRows()) },
  {
    id: "agents-elevation",
    files: ["AGENTS.md"],
    inline: true,
    render: () => `\`${ELEVATIONS.map((tier) => `${tier} ${L.elevation.tier[tier].z}`).join(" · ")}\``,
  },
];
