// The Color inspector's data: which roles each group shows, what each role is for, and the Palette
// Token it selects in a theme. Rows come from walking the selection table, so a role added there
// shows up here and ROLE_NOTES makes its missing note a type error.

import type { ColorMode } from "@studio-baeks/paper-ui/tokens";
import { COLOR_SELECTION, paletteValue, type PalettePath } from "@paper-ui/inspect/color";

import type { Bilingual } from "../../site/locale";
import { leafPaths, valueAt, type LeafPaths } from "./paths";

type Selection = (typeof COLOR_SELECTION)["light"];
type Branch = Exclude<keyof Selection, "accent">;
export type RolePath = LeafPaths<Omit<Selection, "accent">>;

export const ROLE_NOTES: Record<RolePath, Bilingual> = {
  "bg.canvas": { ko: "기본 페이지 면", en: "The page's base surface" },
  "bg.raised": { ko: "카드와 떠 있는 면", en: "Cards and floating surfaces" },
  "bg.sunken": { ko: "가라앉은 영역", en: "Recessed areas" },
  "control.track": { ko: "Switch · SegmentControl · Slider의 트랙, 진행 막대의 홈", en: "The track of Switch, SegmentControl and Slider, and the groove of a progress bar" },
  "control.knob": { ko: "꺼진 Switch의 손잡이", en: "The knob of an off Switch" },
  "control.thumb": { ko: "SegmentControl의 칸", en: "The chosen segment of a SegmentControl" },
  "control.field": { ko: "면을 고르지 않은 입력 틀의 면 — 어디서나 흰 면에 회색 선, 다크는 카드보다 한 단계 밝게", en: "The face of an input frame with no fill chosen: white with a grey line everywhere, one step brighter than the card in dark" },
  "control.mark": { ko: "꺼진 표식의 면 — 어디서나 흰 면에 회색 선, 다크는 카드보다 한 단계 밝게", en: "The face of an off mark: white with a grey line everywhere, one step brighter than the card in dark" },
  "control.chosen": { ko: "선 두른 SegmentControl에서 고른 칸의 면 — 라이트는 트랙의 회색, 다크는 틀이 이미 그 회색이라 한 단계 위", en: "The face of the chosen segment in an outlined SegmentControl: the track's grey in light; in dark the frame is already that grey, so one step above" },
  "ink.primary": { ko: "본문과 제목", en: "Body text and titles" },
  "ink.secondary": { ko: "보조 내용", en: "Supporting content" },
  "ink.tertiary": { ko: "메타 정보와 낮은 강조", en: "Meta information and low emphasis" },
  "border.base": { ko: "기본 컴포넌트 경계", en: "The default component border" },
  "border.strong": { ko: "대비가 높은 경계", en: "A high-contrast border" },
  "border.hover": { ko: "포인터가 올라온 입력칸의 경계", en: "The border of an input under the pointer" },
  "interaction.bgHover.onSurface": { ko: "중립 면 위 hover tint", en: "Hover tint on a neutral surface" },
  "interaction.bgHover.onPrimarySolid": { ko: "primary solid 위 hover tint", en: "Hover tint on a primary solid" },
  "interaction.bgHover.onAccentSolid": { ko: "상태색 solid 위 hover tint", en: "Hover tint on a status-colour solid" },
  "interaction.selected": { ko: "선택된 항목의 면", en: "The face of a selected item" },
  "interaction.active": { ko: "누르는 중인 면", en: "The face while pressed" },
  "interaction.focus": { ko: "키보드 포커스 표시", en: "The keyboard focus indicator" },
  "interaction.link": { ko: "링크 글자", en: "Link text" },
  "overlay.scrim": { ko: "모달 뒤를 어둡게 누르는 면", en: "The surface that dims what is behind a modal" },
  "shadow.floating": { ko: "떠 있는 층(overlay · modal · toast) 그림자의 색", en: "Shadow colour of the floating tiers (overlay, modal, toast)" },
  "shadow.lifted": { ko: "살짝 들린 층(lifted) 그림자의 색", en: "Shadow colour of the slightly lifted tier (lifted)" },
  "shadow.resting": { ko: "제자리에 있는 면(shadow prop) 그림자의 색", en: "Shadow colour of a surface at rest (the shadow prop)" },
  "shadow.inset": { ko: "파인 홈(Switch · SegmentControl 트랙)이 안으로 들어가는 그림자의 색", en: "Colour of the inner shadow of a recessed groove (Switch and SegmentControl tracks)" },
  "marker.fill": { ko: "형광펜의 칠", en: "The highlighter's fill" },
  "marker.ink": { ko: "칠 위 글자, 두 모드 모두 어두운 잉크", en: "Text on the fill: dark ink in both modes" },
};

export const GROUPS: { title: string; description: Bilingual; branches: Branch[] }[] = [
  { title: "Background", description: { ko: "페이지와 컨테이너 면의 깊이입니다.", en: "The depth of page and container surfaces." }, branches: ["bg"] },
  { title: "Control", description: { ko: "컨트롤 안쪽에만 쓰는 면입니다.", en: "Surfaces used only inside controls." }, branches: ["control"] },
  { title: "Text", description: { ko: "면 위 글자의 위계입니다.", en: "The hierarchy of text on a surface." }, branches: ["ink"] },
  { title: "Border", description: { ko: "구조를 나누는 경계와 강조입니다.", en: "Borders that divide structure, and emphasis." }, branches: ["border"] },
  { title: "Interaction", description: { ko: "상태 tint, 키보드 포커스, 링크입니다.", en: "State tints, keyboard focus and links." }, branches: ["interaction"] },
  { title: "Overlay · Shadow", description: { ko: "모달 scrim과 그림자의 색입니다. 그림자의 모양과 층은 Layout의 elevation이 정합니다.", en: "The modal scrim and the colour of shadows. A shadow's shape and tier come from Layout's elevation." }, branches: ["overlay", "shadow"] },
  { title: "Marker", description: { ko: "형광펜입니다. 장식이고 상태를 말하지 않습니다.", en: "The highlighter. It is decoration and says nothing about state." }, branches: ["marker"] },
];

// The Palette Token a role selects, as the cards name it.
export const formatPalettePath = (path: PalettePath): string => path;

export const rolesOf = (branches: readonly Branch[]): RolePath[] =>
  branches.flatMap((branch) => leafPaths(COLOR_SELECTION.light[branch], `${branch}.`)) as RolePath[];

export const selectionAt = (mode: ColorMode, path: string): PalettePath => valueAt(COLOR_SELECTION[mode], path) as PalettePath;

export const hexAt = (mode: ColorMode, path: string): string => paletteValue(selectionAt(mode, path)).toUpperCase();
