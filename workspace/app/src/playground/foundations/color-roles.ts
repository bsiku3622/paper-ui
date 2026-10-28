// The Color inspector's data: which roles each group shows, what each role is for, and the Palette
// Token it selects in a theme. Rows come from walking the selection table, so a role added there
// shows up here and ROLE_NOTES makes its missing note a type error.

import type { ColorMode } from "@studio-baeks/paper-ui/tokens";

import { COLOR_SELECTION, paletteValue, type PalettePath } from "../../../../packages/paper-ui/src/tokens/colors";
import { leafPaths, valueAt, type LeafPaths } from "./paths";

type Selection = (typeof COLOR_SELECTION)["light"];
type Branch = Exclude<keyof Selection, "accent">;
export type RolePath = LeafPaths<Omit<Selection, "accent">>;

export const ROLE_NOTES: Record<RolePath, string> = {
  "bg.canvas": "기본 페이지 면",
  "bg.raised": "카드와 떠 있는 면",
  "bg.sunken": "가라앉은 영역",
  "control.track": "Switch 트랙, 진행 막대의 홈",
  "ink.primary": "본문과 제목",
  "ink.secondary": "보조 내용",
  "ink.tertiary": "메타 정보와 낮은 강조",
  "border.base": "기본 컴포넌트 경계",
  "border.strong": "대비가 높은 경계",
  "border.hover": "포인터가 올라온 입력칸의 경계",
  "interaction.bgHover.onSurface": "중립 면 위 hover tint",
  "interaction.bgHover.onPrimarySolid": "primary solid 위 hover tint",
  "interaction.bgHover.onAccentSolid": "상태색 solid 위 hover tint",
  "interaction.selected": "선택된 항목의 면",
  "interaction.active": "누르는 중인 면",
  "interaction.focus": "키보드 포커스 표시",
  "interaction.link": "링크 글자",
  "overlay.scrim": "모달 뒤를 어둡게 누르는 면",
  "shadow.floating": "떠 있는 층(overlay · modal · toast) 그림자의 색",
  "shadow.lifted": "살짝 들린 층(raised) 그림자의 색",
};

export const GROUPS: { title: string; description: string; branches: Branch[] }[] = [
  { title: "Background", description: "페이지와 컨테이너 면의 깊이입니다.", branches: ["bg"] },
  { title: "Control", description: "컨트롤 안쪽에만 쓰는 면입니다.", branches: ["control"] },
  { title: "Text", description: "면 위 글자의 위계입니다.", branches: ["ink"] },
  { title: "Border", description: "구조를 나누는 경계와 강조입니다.", branches: ["border"] },
  { title: "Interaction", description: "상태 tint, 키보드 포커스, 링크입니다.", branches: ["interaction"] },
  { title: "Overlay · Shadow", description: "모달 scrim과 그림자의 색입니다. 그림자의 모양과 층은 Layout의 elevation이 정합니다.", branches: ["overlay", "shadow"] },
];

// The Palette Token a role selects, as the cards name it.
export const formatPalettePath = (path: PalettePath): string => path;

export const rolesOf = (branches: readonly Branch[]): RolePath[] =>
  branches.flatMap((branch) => leafPaths(COLOR_SELECTION.light[branch], `${branch}.`)) as RolePath[];

export const selectionAt = (mode: ColorMode, path: string): PalettePath => valueAt(COLOR_SELECTION[mode], path) as PalettePath;

export const hexAt = (mode: ColorMode, path: string): string => paletteValue(selectionAt(mode, path)).toUpperCase();
