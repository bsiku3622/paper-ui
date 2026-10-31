// 문서 — /docs/* 마크다운 사이트. 활성 문서의 본문은 번들에서 불러와 Prose 로 렌더한다. 문서는 레포의
// docs/ 에서 곧바로 오고, 목차와 본문 칸은 사이트 셸이 그린다.

import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { DOCS } from "virtual:paper-docs";

import { Stack, Text } from "@studio-baeks/paper-ui";

import { loadDocBody } from "../docs/content";
import { Prose } from "../docs/Prose";
import { PageHeader } from "../site/PageHeader";
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
  if (body === null) return <Text variant="caption">불러오는 중…</Text>;

  return (
    <Stack gap="xl">
      <PageHeader group={DOC_GROUPS.find((group) => group.id === activeDoc.group)?.label || "Documentation"} name={activeDoc.title} />
      <Prose file={activeDoc.file}>{body}</Prose>
    </Stack>
  );
};
