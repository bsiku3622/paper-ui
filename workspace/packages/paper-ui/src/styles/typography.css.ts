// typography.css — 글자 축의 이름이 가리키는 class 의 실체. Text 역할 · family=mono · 숫자 표기 · 컨트롤
// preset · fontSize 탈출구가 각자 지도 하나로 굳는다. 선언은 tokens/typography-recipes.ts 가 만들고
// 여기는 그것을 class 로 얹을 뿐이다. 전부 pui.utilities 에 있어서 컴포넌트의 geometry 가 이긴다.

import { tokens, CONTROL_FONT_SIZES, CONTROL_SIZES, presetRule, typographyRule, type ControlFontSize, type ControlSize } from "../tokens";
import { layered } from "../tokens/layers.css";

const { style, styleVariants } = layered("utilities");

// ───── Text 역할 class ───────────────────────────────────────────────────────
//
// 역할의 글자와 줄바꿈. 잉크는 정하지 않는다 — 기본 잉크도 ink class 가 얹는다(resolveText).
export const textRoleClass = styleVariants(tokens.typography.role, (_, variant) => ({ ...typographyRule(variant), margin: 0 }));

// family=mono — 역할 위에 교차하는 모디파이어. 서체를 등폭으로 바꾸고 mono 전용
// 자간을 준다. sans 의 역할별 tracking을 그대로 얹으면 큰
// 크기 mono 가 짓눌리므로 버리고, 대신 단일 값 -0.04em — SF Mono·D2Coding 은 advance 가
// 넓어 UI 에서 벌어져 보여 조인다 (균일 적용이라 tabular 정렬은 유지). letter-spacing 은
// 요소당 하나라 영어·한글을 한 런에서 따로 못 준다 — 코드·토큰(영어) 기준 단일값.
// 크기는 variant 의 px 를 monoSizeScale 로 줄이고, 줄은 어디서든 끊는다.
// textRoleClass 뒤에 와서 같은 특정도의 역할 class 를 순서로 이긴다.
export const textMonoClass = styleVariants(tokens.typography.role, (_, variant) => {
  const { fontFamily, fontSize, letterSpacing, wordBreak, overflowWrap } = typographyRule(variant, { family: "mono" });
  return { fontFamily, fontSize, letterSpacing, wordBreak, overflowWrap };
});

// 숫자 표기 — sans 그대로 숫자 글리프만 등폭(tabular-nums). 정렬은 안 건드린다.
export const textNumericClass = style({ fontVariantNumeric: "tabular-nums" });

// ───── 컨트롤 preset class ───────────────────────────────────────────────────
//
// tokens.typography.preset 과 같은 모양의 지도. 같은 선언은 class 하나를 나눠 쓴다 — sm 과 md 가 같은
// Field 글자처럼. preset 이 늘면 이 타입이 여기서 빠진 자리를 걸러낸다.
type Mirror<T> = { [K in keyof T]: T[K] extends { size: string } ? string : Mirror<T[K]> };

const shared = new Map<string, string>();
const classOf = (rule: Parameters<typeof style>[0]): string => {
  const signature = JSON.stringify(rule);
  const known = shared.get(signature);
  if (known) return known;
  const created = style(rule);
  shared.set(signature, created);
  return created;
};
const bySize = (rule: (size: ControlSize) => Parameters<typeof style>[0]) =>
  Object.fromEntries(CONTROL_SIZES.map((size) => [size, classOf(rule(size))])) as Record<ControlSize, string>;

export const presetClass: Mirror<typeof tokens.typography.preset> = {
  button: {
    medium: bySize((size) => presetRule("button", size, "medium")),
    strong: bySize((size) => presetRule("button", size, "strong")),
  },
  field: bySize((size) => presetRule("field", size)),
  textarea: bySize((size) => presetRule("textarea", size)),
  badge: classOf(presetRule("badge")),
};

// fontSize 탈출구 — 크기만 바꾼다. 컨트롤 상자가 담을 수 있는 역할만 받고, presetClass 뒤에 와서 같은
// 특정도의 preset 크기를 순서로 이긴다. 행간은 preset 에 남으므로 상자의 기하는 그대로다.
const sizes = Object.fromEntries(CONTROL_FONT_SIZES.map((variant) => [variant, tokens.typography.role[variant].size])) as Record<ControlFontSize, string>;
export const controlFontSizeClass = styleVariants(sizes, (fontSize) => ({ fontSize }));
