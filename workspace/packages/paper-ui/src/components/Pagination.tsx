// Pagination — 긴 목록의 현재 위치와 다음 이동.
//
// 현재 페이지만 검정 solid로 잡고 나머지는 지면의 hairline에 둔다. 숫자를 전부 나열하지
// 않아도 시작·끝과 현재 주변이 보이므로, 데이터 화면의 하단이 소음이 되지 않는다.

import { Box, Inline } from "../primitives";
import { Button } from "../atoms";
import { joinClass } from "../internal/joinClass";
import { paginationEllipsis, paginationPage, paginationRoot } from "./Pagination.css";

export type PaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  "aria-label"?: string;
  className?: string;
  variant?: PaginationVariant;
};

export type PaginationVariant = "outline" | "soft" | "minimal";

const PAGE_VARIANT = {
  outline: { current: "solid", rest: "hairline" },
  soft: { current: "solid", rest: "soft" },
  minimal: { current: "soft", rest: "quiet" },
} as const;

type PageItem = number | "ellipsis";

const pageItems = (page: number, total: number): PageItem[] => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (page <= 4) return [1, 2, 3, 4, 5, "ellipsis", total];
  if (page >= total - 3) return [1, "ellipsis", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "ellipsis", page - 1, page, page + 1, "ellipsis", total];
};

export const Pagination = ({ page, totalPages, onPageChange, "aria-label": ariaLabel = "페이지 이동", className, variant = "outline" }: PaginationProps) => {
  const total = Math.max(1, totalPages);
  const current = Math.min(Math.max(1, page), total);
  const items = pageItems(current, total);
  const itemVariant = PAGE_VARIANT[variant];

  return (
    <Inline as="nav" aria-label={ariaLabel} className={joinClass(paginationRoot, className)}>
      <Button size="sm" variant="quiet" disabled={current === 1} onClick={() => onPageChange(current - 1)}>
        이전
      </Button>
      {items.map((item, index) =>
        item === "ellipsis" ? (
          <Box as="span" key={`ellipsis-${index}`} aria-hidden className={paginationEllipsis}>…</Box>
        ) : (
          <Button
            key={item}
            size="sm"
            variant={item === current ? itemVariant.current : itemVariant.rest}
            aria-current={item === current ? "page" : undefined}
            aria-label={`${item}페이지`}
            className={paginationPage}
            onClick={() => onPageChange(item)}
          >
            {item}
          </Button>
        ),
      )}
      <Button size="sm" variant="quiet" disabled={current === total} onClick={() => onPageChange(current + 1)}>
        다음
      </Button>
    </Inline>
  );
};
