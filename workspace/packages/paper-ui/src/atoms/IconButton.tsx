// IconButton — 아이콘만 담는 정사각 버튼. Button의 텍스트 API와 분리해 아이콘 크기와
// 접근성 이름을 한 곳에서 강제한다. 축은 명시적이다: 정사각과 부딪히는 loading · fullWidth · fontSize 는 없다.
//
// 안의 Icon 은 size 를 안 주면 컨트롤 높이를 따른다. iconSize 를 주면 컨트롤 안의 모든 Icon 이 그 크기다.

import { forwardRef, type ElementType, type ReactElement, type ReactNode } from "react";

import { registerAtom } from "../internal/render-target";
import type { ControlForm } from "../primitives/control/Control";
import type { IconProps } from "../primitives/Icon";
import type { PaintFace } from "../primitives/paint/Paint";
import type { PolymorphicProps } from "../primitives/polymorphic";
import type { Accent } from "../tokens";
import { ButtonBase, type ButtonBaseProps } from "./button-base";

type IconButtonOwn = Pick<ControlForm, "size" | "shape" | "iconSize"> & PaintFace & {
  accent?: Accent;
  disabled?: boolean;
  // 모서리 표식 — 보통 Badge 하나. 이름은 aria-label 이 말하므로 숫자도 거기에 적는다("알림 3개").
  badge?: ReactNode;
  "aria-label": string;
  children: ReactElement<IconProps>;
  className?: string;
};

export type IconButtonProps<As extends ElementType = "button"> = PolymorphicProps<IconButtonOwn, As>;

const IconButtonImpl = forwardRef<HTMLElement, Record<string, unknown>>(function IconButton(props, ref) {
  return <ButtonBase ref={ref} anatomy="icon" {...(props as Omit<ButtonBaseProps, "anatomy">)} />;
});

export const IconButton = registerAtom(IconButtonImpl) as unknown as {
  <As extends ElementType = "button">(props: IconButtonProps<As>): ReactElement;
};
