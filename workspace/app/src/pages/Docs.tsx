// 문서 — /docs/* 마크다운 사이트. manifest.json 으로 사이드바를 세우고,
// 활성 문서의 .md 를 fetch 해 react-markdown 으로 렌더한다.
// (docs 는 predev 스크립트가 public/docs 로 미러링해 fetch 가능.)

import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";

import { Box, Stack, Text } from "@studio-baeks/paper-ui";
import { tokens } from "@studio-baeks/paper-ui/tokens";

import { SiteNav, NAV_HEIGHT } from "../site/chrome";
import "../site/markdown.css";

type Doc = { slug: string; group: string; title: string; file: string };
type Group = { group: string; label: string; docs: Doc[] };

const base = import.meta.env.BASE_URL;

export const Docs = () => {
  const { pathname, hash } = useLocation();
  const [groups, setGroups] = useState<Group[]>([]);
  const [content, setContent] = useState<string | null>(null);

  // /docs 또는 /docs/<slug>
  const slug = pathname.replace(/^\/docs\/?/, "").replace(/\/$/, "");

  useEffect(() => {
    fetch(`${base}docs/manifest.json`).then((r) => r.json()).then(setGroups).catch(() => setGroups([]));
  }, []);

  // slug 없으면 README(개요)
  const activeDoc = useMemo(() => {
    const all = groups.flatMap((g) => g.docs);
    if (!slug) return all.find((d) => d.slug === "") ?? null;
    return all.find((d) => d.slug === slug) ?? null;
  }, [groups, slug]);
  const activeFile = activeDoc?.file ?? (!slug ? "README.md" : null);

  useEffect(() => {
    if (!activeFile) { setContent(null); return; }
    let cancelled = false;
    setContent(null);
    fetch(`${base}docs/${activeFile}`).then((r) => (r.ok ? r.text() : null)).then((t) => {
      if (!cancelled) setContent(t);
    });
    return () => { cancelled = true; };
  }, [activeFile]);

  // 문서는 늦게 도착하므로, 앵커로 들어오면 본문이 그려진 뒤 그 제목까지 내려간다.
  useEffect(() => {
    if (content && hash) document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView();
  }, [content, hash]);

  return (
    <Stack>
      <SiteNav />
      <Box style={{ display: "grid", gridTemplateColumns: `${tokens.shape.dimension.width.lg} 1fr`, maxWidth: tokens.layout.container.content, marginInline: "auto", width: "100%" }}>
        <Box as="nav" aria-label="문서 목차" style={{ minHeight: `calc(100vh - ${NAV_HEIGHT})`, top: NAV_HEIGHT, position: "sticky", alignSelf: "start", padding: tokens.shape.inset.lg, borderRight: `${tokens.shape.stroke.border} solid ${tokens.color.border.base}` }}>
          <Stack gap="lg">
            {groups.map((group) => (
              <Stack key={group.group} gap="xs">
                {group.label ? <Text variant="label" ink="faint">{group.label}</Text> : null}
                {group.docs.map((doc) => (
                  <Link key={doc.slug || "overview"} to={`/docs/${doc.slug}`} aria-current={slug === doc.slug ? "page" : undefined} style={{ display: "block", padding: `${tokens.shape.inset.sm} ${tokens.shape.inset.md}`, color: slug === doc.slug ? tokens.color.ink.primary : tokens.color.ink.secondary, textDecoration: "none" }}>
                    {doc.title}
                  </Link>
                ))}
              </Stack>
            ))}
          </Stack>
        </Box>

        {/* 본문 */}
        <Box paddingX="xl" paddingY="xl">
          {content === null ? (
            <Text variant="caption">불러오는 중…</Text>
          ) : (
            <Stack gap="xl">
              <Stack gap="xs">
                <Text variant="caption" ink="soft">{groups.find((group) => group.group === activeDoc?.group)?.label || "Documentation"}</Text>
                <Text as="h1" variant="title">{activeDoc?.title ?? "Documentation"}</Text>
              </Stack>
              <div className="md">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeSlug]}
                components={{
                  a: ({ href = "", children }) => {
                    // 내부 .md 링크 → docs 슬러그로, /경로 → 라우터로, #앵커 → 같은 문서, 그 외 → 새 탭.
                    // 상대 경로는 문서 파일이 있는 폴더 기준이다 — 그룹 README의 slug는 폴더 이름이라
                    // slug로 풀면 한 단계 위가 된다.
                    if (href.startsWith("#")) return <a href={href}>{children}</a>;
                    const [path = "", hash] = href.split("#");
                    if (path.endsWith(".md") || path.startsWith("./") || path.startsWith("../")) {
                      const segs = (activeFile ?? "").split("/").slice(0, -1);
                      for (const s of path.replace(/\.md$/, "").split("/")) {
                        if (s === "." || s === "") continue;
                        if (s === "..") segs.pop(); else segs.push(s);
                      }
                      const target = segs.join("/").replace(/(^|\/)README$/, "");
                      return <Link to={`/docs/${target}${hash ? `#${hash}` : ""}`}>{children}</Link>;
                    }
                    if (href.startsWith("/")) return <Link to={href}>{children}</Link>;
                    return <a href={href} target="_blank" rel="noreferrer">{children}</a>;
                  },
                }}
              >
                {content.replace(/^#\s+.+(?:\r?\n)+/, "")}
              </ReactMarkdown>
              </div>
            </Stack>
          )}
        </Box>
      </Box>
    </Stack>
  );
};
