// Button — 누르는 자리. 색은 resolver 가 정한다: color(의미) × variant(시각 무게).
//   color    primary(검정 일꾼) · info · success · warning · error
//   variant  solid · soft · outline · quiet
//
// 예) <Button>저장</Button>                        검정 solid (primary)
//     <Button variant="soft">미리보기</Button>      회색 secondary
//     <Button color="error">삭제</Button>           빨강 solid
//     <Button color="error" variant="quiet">…</Button>  빨강 텍스트
//     <Button loading>저장 중</Button>              스피너 + aria-busy
//     <Button iconOnly aria-label="닫기"><Icon>…</Icon></Button>  정사각
//     <Button radius="full">시작하기</Button>       알약 (hero CTA 자리)
//
// ref 를 전달한다 — 폼 라이브러리·툴팁·메뉴가 버튼을 앵커로 잡을 수 있게(공개 계약).

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

import { joinClass } from "../internal/joinClass";
import { resolveColor, INTERACTIVE, type Color, type Variant } from "../resolvers";
import type { ControlSize } from "../tokens";
import {
  buttonRoot,
  buttonSize,
  buttonSpinner,
  buttonIconOnly,
  buttonFull,
  buttonRadiusFull,
} from "./Button.css";

type ButtonBase = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> & {
  // 큰 면을 채우는 기본은 검정(primary) — 색은 의미가 있을 때만.
  color?: Color;
  variant?: Variant;
  // 크기 3 단 (sm·md·lg). md 가 anchor(기본), sm 은 밀집/보조, lg 는 CTA. Field·Select 와
  // 같은 사다리라 나란히 두면 높이가 맞는다.
  size?: ControlSize;
  // 진행 중 — 스피너를 얹고 aria-busy 를 세우며 클릭을 막는다(busy 는 다시 눌릴 수 없다).
  loading?: boolean;
  // 가로 꽉 — 폼·모바일.
  fullWidth?: boolean;
  // 모서리 — 생략하면 시스템 곡선(radius.interaction). "full" 이면 알약.
  // 값이 하나뿐인 건 의도다 — 고를 수 있는 건 *알약이냐 아니냐* 지 곡선의 크기가 아니다.
  radius?: "full";
  children?: ReactNode;
  className?: string;
};

// iconOnly 면 접근 이름이 필수다 — 아이콘만 있는 버튼은 읽을 텍스트가 없어 스크린리더가
// 침묵한다. 타입으로 강제해 aria-label(또는 aria-labelledby) 없이는 컴파일이 막는다.
export type ButtonProps = ButtonBase &
  (
    | { iconOnly: true; "aria-label": string }
    | { iconOnly: true; "aria-labelledby": string }
    | { iconOnly?: false }
  );

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    color = "primary",
    variant = "solid",
    size = "md",
    loading,
    iconOnly,
    fullWidth,
    radius,
    disabled,
    children,
    className,
    type = "button",
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      // busy 는 다시 눌릴 수 없다 — loading 도 disabled 로 막는다(스피너가 이유를 보인다).
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={joinClass(
        INTERACTIVE,
        buttonRoot,
        buttonSize[size],
        resolveColor(color, variant),
        iconOnly && buttonIconOnly,
        fullWidth && buttonFull,
        radius === "full" && buttonRadiusFull,
        className,
      )}
      {...rest}
    >
      {loading ? <span className={buttonSpinner} aria-hidden /> : null}
      {/* 아이콘 전용 로딩이면 아이콘 대신 스피너만 — 나머지는 스피너 + 라벨 */}
      {loading && iconOnly ? null : children}
    </button>
  );
});
