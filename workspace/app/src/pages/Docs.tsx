// 문서 — /docs/* 마크다운 사이트. 사이드바는 DOC_GROUPS 순서의 DOCS 이고, 활성 문서의
// 본문은 번들에서 불러와 Prose 로 렌더한다. 문서는 레포의 docs/ 에서 곧바로 온다.

import { useEffect, useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { DOCS } from "virtual:paper-docs";

import { Box, Stack, Text } from "@studio-baeks/paper-ui";
import { tokens } from "@studio-baeks/paper-ui/tokens";

import { loadDocBody } from "../docs/content";
import { docPath } from "../docs/links";
import { Prose } from "../docs/Prose";
import { SiteNav, NAV_HEIGHT } from "../site/chrome";
import { DOC_GROUPS } from "../site/site-map";

export const Docs = () => {
  const { pathname, hash } = useLocation();
  const [loaded, setLoaded] = useState<{ file: string; text: string } | null>(null);

  // /docs 또는 /docs/<slug>
  const slug = pathname.replace(/^\/docs\/?/, "").replace(/\/$/, "");
  const activeDoc = DOCS.find((doc) => doc.slug === slug);
  const activeFile = activeDoc?.file;
  const body = loaded && loaded.file === activeFile ? loaded.text : null;

  useEffect(() => {
    if (!activeFile) return;
    let cancelled = false;
    loadDocBody(activeFile).then((text) => {
      if (!cancelled) setLoaded({ file: activeFile, text });
    });
    return () => { cancelled = true; };
  }, [activeFile]);

  // 본문은 늦게 그려지므로, 앵커로 들어오면 본문이 그려진 뒤 그 제목까지 내려간다.
  useEffect(() => {
    if (body && hash) document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView();
  }, [body, hash]);

  if (!activeDoc) return <Navigate to="/docs" replace />;

  return (
    <Stack>
      <SiteNav />
      <Box style={{ display: "grid", gridTemplateColumns: `${tokens.shape.dimension.width.lg} 1fr`, maxWidth: tokens.layout.container.content, marginInline: "auto", width: "100%" }}>
        <Box as="nav" aria-label="문서 목차" style={{ minHeight: `calc(100vh - ${NAV_HEIGHT})`, top: NAV_HEIGHT, position: "sticky", alignSelf: "start", padding: tokens.shape.inset.lg, borderRight: `${tokens.shape.stroke.border} solid ${tokens.color.border.base}` }}>
          <Stack gap="lg">
            {DOC_GROUPS.map((group) => (
              <Stack key={group.id} gap="xs">
                {group.label ? <Text variant="label" ink="faint">{group.label}</Text> : null}
                {DOCS.filter((doc) => doc.group === group.id).map((doc) => (
                  <Link key={doc.slug || "overview"} to={docPath(doc.slug)} aria-current={slug === doc.slug ? "page" : undefined} style={{ display: "block", padding: `${tokens.shape.inset.sm} ${tokens.shape.inset.md}`, color: slug === doc.slug ? tokens.color.ink.primary : tokens.color.ink.secondary, textDecoration: "none" }}>
                    {doc.title}
                  </Link>
                ))}
              </Stack>
            ))}
          </Stack>
        </Box>

        {/* 본문 */}
        <Box paddingX="xl" paddingY="xl">
          {body === null ? (
            <Text variant="caption">불러오는 중…</Text>
          ) : (
            <Stack gap="xl">
              <Stack gap="xs">
                <Text variant="caption" ink="soft">{DOC_GROUPS.find((group) => group.id === activeDoc.group)?.label || "Documentation"}</Text>
                <Text as="h1" variant="title">{activeDoc.title}</Text>
              </Stack>
              <Prose file={activeDoc.file}>{body}</Prose>
            </Stack>
          )}
        </Box>
      </Box>
    </Stack>
  );
};
