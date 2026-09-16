// IconButton — 아이콘만 담는 정사각 버튼. Button의 텍스트 API와 분리해 아이콘 크기와
// 접근성 이름을 한 곳에서 강제한다.

import { cloneElement, forwardRef, type ReactElement } from "react";

import type { IconSize } from "../primitives";
import { joinClass } from "../internal/joinClass";
import { Button, type ButtonProps } from "./Button";
import { Icon, type IconProps } from "../primitives";
import { buttonIconOnly } from "./Button.css";

export type IconButtonProps = Omit<ButtonProps<"button">, "children" | "fontSize"> & {
  iconSize?: IconSize;
  children: ReactElement<IconProps>;
  "aria-label": string;
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { iconSize = "body", children, className, ...rest },
  ref,
) {
  const icon = children.type === Icon ? cloneElement(children, { size: iconSize }) : children;
  return (
    <Button ref={ref} {...rest} className={joinClass(buttonIconOnly, className)}>
      {icon}
    </Button>
  );
});
