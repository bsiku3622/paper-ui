// Button — 누르는 자리. 색은 resolver 가 정한다: variant(시각 무게) × status(의미 색).
//   variant  solid · soft · outline · quiet
//   status   default · info · success · warning · danger
//
// 예) <Button>저장</Button>                    검정 solid
//     <Button variant="soft">미리보기</Button>  회색 secondary
//     <Button status="danger">삭제</Button>     빨강 solid
//     <Button variant="quiet" status="danger">…</Button>  빨강 텍스트

import type { ButtonHTMLAttributes, ReactNode } from "react";

import { joinClass } from "../internal/joinClass";
import { resolveColorClassnames, INTERACTIVE, type Variant, type ColorStatus } from "../resolvers";
import type { ControlSize } from "../tokens";
import { buttonRoot, buttonSize } from "./Button.css";

export type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> & {
  variant?: Variant;
  status?: ColorStatus;
  // 크기 3 단 (sm·md·lg). md 가 anchor(기본), sm 은 밀집/보조, lg 는 CTA. Field·Select 와
  // 같은 사다리라 나란히 두면 높이가 맞는다.
  size?: ControlSize;
  children?: ReactNode;
  className?: string;
};

export const Button = ({
  variant = "solid",
  status = "default",
  size = "md",
  children,
  className,
  type = "button",
  ...rest
}: ButtonProps) => (
  <button
    type={type}
    className={joinClass(INTERACTIVE, buttonRoot, buttonSize[size], resolveColorClassnames(variant, status), className)}
    {...rest}
  >
    {children}
  </button>
);
