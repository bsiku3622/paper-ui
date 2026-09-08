// Button — 누르는 자리. 색은 resolver 가 정한다: color(의미) × variant(시각 무게).
//   color    primary(검정 일꾼) · info · success · warning · error
//   variant  solid · soft · outline · quiet
//   shape    default(시스템 곡선) · pill(알약)
//
// 예) <Button>저장</Button>                        검정 solid (primary)
//     <Button variant="soft">미리보기</Button>      회색 secondary
//     <Button color="error">삭제</Button>           빨강 solid
//     <Button color="error" variant="quiet">…</Button>  빨강 텍스트
//     <Button loading>저장 중</Button>              스피너 + aria-busy
//     <Button iconOnly aria-label="닫기"><Icon>…</Icon></Button>  정사각
//     <Button shape="pill">시작하기</Button>        알약 (hero CTA 자리)
//     <Button as={Link} to="/docs">문서 읽기</Button>  누르면 이동하는 자리
//
// ref 를 전달한다 — 폼 라이브러리·툴팁·메뉴가 버튼을 앵커로 잡을 수 있게(공개 계약).

import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ComponentPropsWithRef,
  type ElementType,
  type ReactElement,
  type ReactNode,
} from "react";

import { joinClass } from "../internal/joinClass";
import { resolveColor, INTERACTIVE, type Color, type Variant } from "../resolvers";
import type { ControlSize } from "../tokens";
import {
  buttonRoot,
  buttonSize,
  buttonSpinner,
  buttonIconOnly,
  buttonFull,
  buttonPill,
} from "./Button.css";

type ButtonOwn<As extends ElementType> = {
  // 이 자리가 실은 링크일 때의 통로 — <Button as={Link} to="/docs">.
  //
  // ⚠ 감싸지 말 것. <Link><Button/></Link> 는 <a> 안에 <button> 이라 탭 정지가 둘이
  // 되고(같은 자리에서 포커스 링이 두 번, 그것도 두 모양으로 잡힌다) 중첩 자체가
  // 유효하지 않은 마크업이다. 누르면 이동하는 자리는 버튼 모양의 *링크* 여야 한다.
  as?: As;
  // 큰 면을 채우는 기본은 검정(primary) — 색은 의미가 있을 때만.
  color?: Color;
  variant?: Variant;
  // 크기 3 단 (sm·md·lg). md 가 anchor(기본), sm 은 밀집/보조, lg 는 CTA. Field·Select 와
  // 같은 사다리라 나란히 두면 높이가 맞는다.
  size?: ControlSize;
  // 실루엣 — default 는 시스템 곡선(radius.interaction), pill 은 알약(높이의 절반).
  // 값이 둘뿐인 건 의도다 — 고르는 건 *알약이냐 아니냐* 지 곡선의 크기가 아니다.
  shape?: "default" | "pill";
  // 진행 중 — 스피너를 얹고 aria-busy 를 세우며 클릭을 막는다(busy 는 다시 눌릴 수 없다).
  loading?: boolean;
  // 가로 꽉 — 폼·모바일.
  fullWidth?: boolean;
  children?: ReactNode;
  className?: string;
};

// iconOnly 면 접근 이름이 필수다 — 아이콘만 있는 버튼은 읽을 텍스트가 없어 스크린리더가
// 침묵한다. 타입으로 강제해 aria-label(또는 aria-labelledby) 없이는 컴파일이 막는다.
type IconOnly =
  | { iconOnly: true; "aria-label": string }
  | { iconOnly: true; "aria-labelledby": string }
  | { iconOnly?: false };

// 자기 prop 을 뺀 나머지는 그 태그의 속성 그대로 (as={Link} 면 to·replace 까지).
export type ButtonProps<As extends ElementType = "button"> = ButtonOwn<As> &
  Omit<ComponentPropsWithRef<As>, keyof ButtonOwn<As> | "iconOnly"> &
  IconOnly;

type ButtonImplProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> &
  ButtonOwn<ElementType> & { iconOnly?: boolean };

const ButtonImpl = forwardRef<HTMLElement, ButtonImplProps>(function Button(
  {
    as,
    color = "primary",
    variant = "solid",
    size = "md",
    shape = "default",
    loading,
    iconOnly,
    fullWidth,
    disabled,
    children,
    className,
    type,
    ...rest
  },
  ref,
) {
  const Tag = (as ?? "button") as ElementType;
  const native = Tag === "button";
  // busy 는 다시 눌릴 수 없다 — loading 도 막는다(스피너가 이유를 보인다).
  const blocked = Boolean(disabled) || Boolean(loading);

  return (
    <Tag
      ref={ref}
      // <button> 만 갖는 속성은 <button> 일 때만 얹는다. <a> 에 disabled 를 주면 무효
      // 속성이 될 뿐 링크는 그대로 눌리므로, 막는 건 aria-disabled 와 탭 이탈이 맡는다
      // (실제 차단은 buttonRoot 의 pointer-events).
      {...(native
        ? { type: type ?? "button", disabled: blocked }
        : blocked
          ? { "aria-disabled": true, tabIndex: -1 }
          : null)}
      aria-busy={loading || undefined}
      className={joinClass(
        INTERACTIVE,
        buttonRoot,
        buttonSize[size],
        resolveColor(color, variant),
        iconOnly && buttonIconOnly,
        fullWidth && buttonFull,
        shape === "pill" && buttonPill,
        className,
      )}
      {...rest}
    >
      {loading ? <span className={buttonSpinner} aria-hidden /> : null}
      {/* 아이콘 전용 로딩이면 아이콘 대신 스피너만 — 나머지는 스피너 + 라벨 */}
      {loading && iconOnly ? null : children}
    </Tag>
  );
});

// forwardRef 는 제네릭을 실어 나르지 못한다(React 의 알려진 한계) — `as` 로 갈리는
// prop 타입은 여기서 씌운다. 런타임은 위 구현 그대로다.
export const Button = ButtonImpl as <As extends ElementType = "button">(
  props: ButtonProps<As>,
) => ReactElement;
