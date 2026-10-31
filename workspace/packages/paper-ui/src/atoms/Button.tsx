// Button — 누르는 자리. accent는 resolver가 정한다: accent(의미) × variant(시각 무게).
//   accent   primary(검정 일꾼) · info · success · warning · error
//   variant  solid · soft · hairline · ghost · muted
//   shape    rounded(시스템 곡선) · pill(알약)
//
// 예) <Button>저장</Button>                        검정 solid (primary)
//     <Button variant="soft">미리보기</Button>      회색 secondary
//     <Button accent="error">삭제</Button>           빨강 solid
//     <Button accent="error" variant="ghost">…</Button>  빨강 텍스트
//     <Button variant="muted">취소</Button>  accent subtle 보조 텍스트
//     <Button loading>저장 중</Button>              스피너 + aria-busy, 포커스는 그대로
//     <Button shape="pill">시작하기</Button>        알약 (hero CTA 자리)
//     <Button variant="ghost" selected={on}>보기</Button>   선택된 면 + aria-pressed
//     <Button as={RouterLink} to="/docs">문서 읽기</Button>  누르면 이동하는 자리
//     <Button as={Floating.Trigger}>열기</Button>    행동은 부품이, 모양은 Button 이
//
// ref 를 전달한다 — 폼 라이브러리·툴팁·메뉴가 버튼을 앵커로 잡을 수 있게(공개 계약).

import { forwardRef, type ElementType, type ReactElement, type ReactNode } from "react";

import { registerAtom } from "../internal/render-target";
import type { PolymorphicProps } from "../primitives/polymorphic";
import type { Accent, ControlFontSize, ControlShape, ControlSize, SelectableVariant, Variant } from "../tokens";
import { ButtonBase, type ButtonBaseProps } from "./button-base";

// 선택은 면이 없거나 옅어서 선택된 면을 soft 로 알릴 수 있는 variant(hairline · ghost · muted)만 한다.
type ButtonSelection = { variant?: Variant; selected?: undefined } | { variant: SelectableVariant; selected: boolean };

type ButtonOwn = {
  // 큰 면을 채우는 기본은 검정(primary) — 색은 의미가 있을 때만.
  accent?: Accent;
  // 크기 3 단 (sm·md·lg). md가 Demo 기준 anchor며 Field·Select와 같은 높이 사다리를 쓴다.
  size?: ControlSize;
  // 컨트롤 실루엣은 유지하고 라벨만 조정하는 통로. 기본값은 size 사다리를 따른다.
  fontSize?: ControlFontSize;
  // 실루엣 — rounded 는 시스템 곡선(radius.control), pill 은 알약(높이의 절반).
  // 값이 둘뿐인 건 의도다 — 고르는 건 *알약이냐 아니냐* 지 곡선의 크기가 아니다.
  shape?: ControlShape;
  // 진행 중 — 스피너를 얹고 aria-busy 를 세우며 누름과 제출을 막는다. 포커스는 잃지 않고, 시작할 때 포커스가
  // 버튼에 있으면 loadingLabel 을 한 번 알린다.
  loading?: boolean;
  loadingLabel?: string;
  // 가로 꽉 — 폼·모바일.
  fullWidth?: boolean;
  disabled?: boolean;
  children?: ReactNode;
  className?: string;
} & ButtonSelection;

// `as` 로 이 자리가 실은 링크일 때의 통로 — <Button as={RouterLink} to="/docs">. 나머지 prop 은 그 대상의 것 그대로(as={RouterLink} 면 to·replace),
// 행동 부품이면 그 부품의 prop 그대로다.
//
// ⚠ 감싸지 말 것. <Link><Button/></Link> 는 <a> 안에 <button> 이라 탭 정지가 둘이
// 되고(같은 자리에서 포커스 링이 두 번, 그것도 두 모양으로 잡힌다) 중첩 자체가
// 유효하지 않은 마크업이다. 누르면 이동하는 자리는 버튼 모양의 *링크* 여야 한다.
export type ButtonProps<As extends ElementType = "button"> = PolymorphicProps<ButtonOwn, As>;

const ButtonImpl = forwardRef<HTMLElement, Record<string, unknown>>(function Button(props, ref) {
  return <ButtonBase ref={ref} anatomy="label" {...(props as Omit<ButtonBaseProps, "anatomy">)} />;
});

// forwardRef 는 제네릭을 실어 나르지 못한다(React 의 알려진 한계) — `as` 로 갈리는
// prop 타입은 여기서 씌운다. 런타임은 위 구현 그대로다.
export const Button = registerAtom(ButtonImpl) as unknown as {
  <As extends ElementType = "button">(props: ButtonProps<As>): ReactElement;
};
