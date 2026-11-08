// ArticleTools.tsx — the group of buttons at the top right of an article: star it, edit it, discuss it, read its history, and a
// few more. The page you are on is the quiet selected button.

import { Link as RouterLink, useNavigate } from "react-router-dom";

import { Badge, Button, Inline, Text } from "@studio-baeks/paper-ui";

import { Glyph, Menu, useToast } from "../../../kit";
import { articlePath, backlinksPath, discussPath, editPath, historyPath, randomPath, rawPath } from "../lib/paths";
import { useWiki } from "../state/store";

export type Tab = "article" | "edit" | "discuss" | "history";

export const ArticleTools = ({ title, current }: { title: string; current: Tab }) => {
  const navigate = useNavigate();
  const toast = useToast();
  const { index, stars, toggleStar, threads } = useWiki();
  const info = index.articles.get(title);
  const starred = stars.includes(title);
  const count = (info?.stars ?? 0) + (starred ? 1 : 0);
  const open = threads.filter((thread) => thread.article === title && thread.status === "open").length;
  const here = (tab: Tab) => (tab === current ? ("page" as const) : undefined);

  return (
    <Inline gap="xs" align="center" wrap>
      <Button
        variant="hairline"
        size="sm"
        selected={starred}
        aria-label={`${starred ? "문서함에서 빼기" : "문서함에 담기"} (별 ${count}개)`}
        onClick={() => {
          const on = toggleStar(title);
          toast(on ? "문서함에 담았습니다" : "문서함에서 뺐습니다", { action: { label: "되돌리기", onSelect: () => toggleStar(title) } });
        }}
      >
        <Glyph name="star" />
        <Text as="span" variant="label" ink="inherit" numeric>{count}</Text>
      </Button>
      <Button as={RouterLink} to={editPath(title)} variant="hairline" size="sm" aria-current={here("edit")}>
        <Glyph name="square-pen" />
        편집
      </Button>
      <Button as={RouterLink} to={discussPath(title)} variant="hairline" size="sm" aria-current={here("discuss")}>
        <Glyph name="messages-square" />
        토론
        {open > 0 ? <Badge size="xs" variant="soft" accent="info">{open}</Badge> : null}
      </Button>
      <Button as={RouterLink} to={historyPath(title)} variant="hairline" size="sm" aria-current={here("history")}>
        <Glyph name="history" />
        역사
      </Button>
      <Menu
        label="더 보기"
        glyph="ellipsis-vertical"
        variant="hairline"
        items={[
          { id: "links", label: "역링크", glyph: "link", hint: info ? String(info.inbound.length) : undefined, onSelect: () => navigate(backlinksPath(title)) },
          { id: "raw", label: "원문 보기", glyph: "scroll-text", onSelect: () => navigate(rawPath(title)) },
          {
            id: "copy",
            label: "주소 복사",
            glyph: "external-link",
            onSelect: () => {
              void navigator.clipboard?.writeText(window.location.origin + articlePath(title)).catch(() => undefined);
              toast("주소를 복사했습니다");
            },
          },
          { id: "d", divider: true },
          { id: "random", label: "임의 문서", glyph: "shuffle", onSelect: () => navigate(randomPath()) },
        ]}
      />
    </Inline>
  );
};
