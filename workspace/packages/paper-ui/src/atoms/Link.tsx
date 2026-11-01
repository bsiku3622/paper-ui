// Link — 딴 데로 가는 글자. 색은 interaction.link 이고, 밑줄이 링크임을 알리는 단서다.
//   underline  always(기본 — 문장 안 링크) · hover(메뉴처럼 위치가 링크임을 말해 주는 단독 링크)
//
// 예) <Link href="/docs">문서</Link>
//     <Link as={RouterLink} to="/demo" underline="hover">데모 열기</Link>   라우터 링크도 태그 하나만 그린다
//
// 키보드 포커스는 useFocusRing 이 판정하고, 링은 링크 자신의 곡률을 따른다.

import { forwardRef, type ElementType, type ReactElement, type ReactNode } from "react";

import { joinClass } from "../internal/joinClass";
import { bareButton } from "../primitives/bare-button.css";
import { mergeProps } from "../primitives/composition";
import { useFocusRing } from "../primitives/a11y/focus";
import type { PolymorphicProps } from "../primitives/polymorphic";
import { linkPaint } from "../primitives/paint/recipes.css";
import type { LinkUnderline } from "../tokens";
import { linkRoot, linkUnderline } from "./Link.css";

type LinkOwn = {
  // 밑줄이 드러나는 때 — 안 주면 늘.
  underline?: LinkUnderline;
  children?: ReactNode;
  className?: string;
};

// `as` 는 라우터의 Link 같은 컴포넌트도 받는다 — 나머지 prop 은 그 대상의 것 그대로(as={RouterLink} 면 to).
// as="button" 은 type="button" 과 Pressable 의 button reset 을 받아 링크와 같은 모습이 된다.
export type LinkProps<As extends ElementType = "a"> = PolymorphicProps<LinkOwn, As>;

const LinkImpl = forwardRef<HTMLElement, Omit<LinkProps, "as" | "ref"> & { as?: ElementType }>(function Link(
  { as, underline = "always", className, ...rest },
  ref,
) {
  const Tag = as ?? "a";
  const { focusProps } = useFocusRing();
  const isButton = Tag === "button";
  return <Tag ref={ref} className={joinClass(isButton && bareButton, linkPaint, linkRoot, linkUnderline[underline], className)} {...mergeProps(isButton ? { type: "button" } : null, rest, focusProps)} />;
});

export const Link = LinkImpl as <As extends ElementType = "a">(props: LinkProps<As>) => ReactElement;
