// SearchField — 검색이라는 반복되는 Field 조합.
//
// 돋보기·type="search"·clearable을 매 화면에서 다시 조립하지 않는다. 시각 형태와 status는
// Field를 그대로 따라가므로 별도의 검색 전용 어휘가 생기지 않는다.

import { forwardRef } from "react";

import { Field, Icon, type FieldProps } from "../atoms";

export type SearchFieldProps = Omit<FieldProps, "type" | "leading" | "clearable" | "aria-label"> & {
  "aria-label"?: string;
};

const SearchIcon = (
  <Icon size="sm" aria-hidden>
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </Icon>
);

export const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(function SearchField(
  { "aria-label": ariaLabel = "검색", ...rest },
  ref,
) {
  return <Field ref={ref} type="search" leading={SearchIcon} clearable aria-label={ariaLabel} {...rest} />;
});
