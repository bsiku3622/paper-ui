import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link as RouterLink, matchPath, useLocation, useNavigate } from "react-router-dom";

import { Box, Button, Field, IconButton, Inline, Stack, Surface, Text } from "@studio-baeks/paper-ui";

import { Glyph, Menu, useToast, type GlyphName, type MenuItem } from "../../../kit";
import { OnlyBelowMd } from "../content/OnlyBelow";
import { homePath, loginPath, randomPath, recentDiscussPath, recentPath, searchPath, specialPath, starredPath, userPath } from "../lib/paths";
import { useWiki } from "../state/store";

const NavButton = ({ to, glyph, children }: { to: string; glyph: GlyphName; children: string }) => {
  const here = matchPath({ path: to, end: false }, useLocation().pathname) !== null;
  return (
    <Button as={RouterLink} to={to} variant="ghost" aria-current={here ? "page" : undefined}>
      <Glyph name={glyph} />
      {children}
    </Button>
  );
};

export const Bar = () => {
  const navigate = useNavigate();
  const here = useLocation();
  const toast = useToast();
  const { user, loggedIn, logout } = useWiki();
  const [query, setQuery] = useState("");
  const field = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
      if (target && (/^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName) || target.isContentEditable)) return;
      if (!field.current || field.current.offsetParent === null) return;
      event.preventDefault();
      field.current.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const text = query.trim();
    if (text) navigate(searchPath(text));
  };

  const go = (path: string) => () => navigate(path);
  const tools: MenuItem[] = [
    { id: "all", label: "모든 문서", glyph: "files", onSelect: go(specialPath("all")) },
    { id: "orphaned", label: "고립된 문서", glyph: "unlink", onSelect: go(specialPath("orphaned")) },
    { id: "wanted", label: "작성이 필요한 문서", glyph: "file-question", onSelect: go(specialPath("wanted")) },
    { id: "uncategorized", label: "분류 없는 문서", glyph: "tag", onSelect: go(specialPath("uncategorized")) },
    { id: "longest", label: "긴 문서", glyph: "arrow-down-to-line", onSelect: go(specialPath("longest")) },
    { id: "shortest", label: "짧은 문서", glyph: "arrow-up-to-line", onSelect: go(specialPath("shortest")) },
    { id: "categories", label: "분류 목록", glyph: "folder-open", onSelect: go(specialPath("categories")) },
    { id: "d", divider: true },
    { id: "starred", label: "문서함", glyph: "star", onSelect: go(starredPath()) },
    { id: "help", label: "문법 도움말", glyph: "circle-help", onSelect: go("/wiki/w/도움말/문법") },
  ];
  const account: MenuItem[] = loggedIn
    ? [
        { id: "who", heading: user },
        { id: "page", label: "내 사용자 문서", glyph: "user", onSelect: go(userPath(user)) },
        { id: "starred", label: "내 문서함", glyph: "star", onSelect: go(starredPath()) },
        { id: "d", divider: true },
        {
          id: "out",
          label: "로그아웃",
          glyph: "log-out",
          danger: true,
          onSelect: () => {
            logout();
            toast("로그아웃했습니다");
          },
        },
      ]
    : [
        { id: "who", heading: "로그인하지 않았습니다" },
        { id: "in", label: "로그인", glyph: "log-in", onSelect: go(loginPath(here.pathname)) },
        { id: "starred", label: "문서함", glyph: "star", onSelect: go(starredPath()) },
      ];
  const phone: MenuItem[] = [
    { id: "recent", label: "최근 변경", glyph: "refresh-cw", onSelect: go(recentPath()) },
    { id: "discuss", label: "최근 토론", glyph: "messages-square", onSelect: go(recentDiscussPath()) },
    { id: "random", label: "임의 문서", glyph: "shuffle", onSelect: go(randomPath()) },
    { id: "rule", divider: true },
    ...tools,
  ];

  return (
    <Surface as="header" theme="inverse" fill="canvas" radius="lg" shadow elevation="sticky" top="none" paddingX="lg" paddingY="sm">
      <Inline justify="between" align="center" gap="md" wrap>
        <Inline align="center" gap="md">
          <Button as={RouterLink} to={homePath()} variant="ghost" size="lg" aria-label="돌담위키 첫 화면">
            <Glyph name="book-open" />
            <Text as="span" variant="heading" ink="inherit">돌담위키</Text>
          </Button>
          <Inline as="nav" aria-label="위키 메뉴" gap="xs" hideBelow="md">
            <NavButton to={recentPath()} glyph="refresh-cw">최근 변경</NavButton>
            <NavButton to={recentDiscussPath()} glyph="messages-square">최근 토론</NavButton>
            <Menu label="특수 기능" iconOnly={false} glyph="briefcase" buttonLabel="특수 기능" size="md" placement="bottom start" items={tools} />
          </Inline>
        </Inline>
        <Inline align="center" gap="sm">
          <OnlyBelowMd>
            <Menu label="위키 메뉴" glyph="menu" size="md" items={phone} />
          </OnlyBelowMd>
          <Box hideBelow="md">
            <IconButton as={RouterLink} to={randomPath()} variant="ghost" aria-label="임의 문서로 이동">
              <Glyph name="shuffle" />
            </IconButton>
          </Box>
          <Box hideBelow="md" width="xl">
            <Stack as="form" role="search" onSubmit={submit}>
              <Field
                ref={field}
                aria-label="문서 검색"
                aria-keyshortcuts="/"
                placeholder="여기에서 검색"
                value={query}
                onChange={(event) => setQuery(event.currentTarget.value)}
                leading={<Glyph name="search" />}
                trailing={
                  <IconButton type="submit" size="xs" variant="ghost" aria-label="검색">
                    <Glyph name="arrow-right" />
                  </IconButton>
                }
              />
            </Stack>
          </Box>
          <OnlyBelowMd>
            <IconButton as={RouterLink} to={searchPath("")} variant="ghost" aria-label="검색 화면으로 이동">
              <Glyph name="search" />
            </IconButton>
          </OnlyBelowMd>
          <Menu label="계정" glyph="circle-user" size="md" items={account} />
        </Inline>
      </Inline>
    </Surface>
  );
};
