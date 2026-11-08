import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";

import { Button, Inline } from "@studio-baeks/paper-ui";

import { Glyph } from "../../../kit";

export const usePage = (pages: number) => {
  const [params, setParams] = useSearchParams();
  const raw = Number(params.get("page") ?? 1);
  const page = Number.isFinite(raw) ? Math.min(Math.max(1, Math.floor(raw)), Math.max(1, pages)) : 1;
  const setPage = useCallback(
    (next: number) => {
      const copy = new URLSearchParams(params);
      if (next <= 1) copy.delete("page");
      else copy.set("page", String(next));
      setParams(copy, { replace: false });
      window.scrollTo({ top: 0 });
    },
    [params, setParams],
  );
  return [page, setPage] as const;
};

export const Pager = ({ page, pages, onPage }: { page: number; pages: number; onPage: (page: number) => void }) => {
  if (pages <= 1) return null;
  const numbers: number[] = [];
  for (let n = Math.max(1, page - 2); n <= Math.min(pages, page + 2); n++) numbers.push(n);
  return (
    <Inline as="nav" aria-label="쪽 이동" gap="xs" justify="center" wrap>
      <Button size="sm" variant="ghost" disabled={page <= 1} onClick={() => onPage(page - 1)}>
        <Glyph name="chevron-left" />
        이전
      </Button>
      {numbers.map((n) => (
        <Button key={n} size="sm" variant="ghost" aria-current={n === page ? "page" : undefined} aria-label={`${n}쪽`} onClick={() => onPage(n)}>
          {n}
        </Button>
      ))}
      <Button size="sm" variant="ghost" disabled={page >= pages} onClick={() => onPage(page + 1)}>
        다음
        <Glyph name="chevron-right" />
      </Button>
    </Inline>
  );
};

export const PAGE_SIZE = 30;
