// 문서 — /docs/* 마크다운 사이트. 활성 문서의 본문은 번들에서 불러와 Prose 로 렌더한다. 문서는 레포의
// docs/ 에서 곧바로 오고, 목차와 본문 칸은 사이트 셸이 그린다. 영어로 보는 방문자에게는 docs/en/ 의 번역을 보여 주고,
// 번역이 없는 문서는 한국어 원문을 보여 준다. 어느 쪽인지는 본문 위의 한 줄이 말한다.

import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { DOCS } from "virtual:paper-docs";

import { Stack, Surface, Text } from "@studio-baeks/paper-ui";

import { loadDocBody } from "../docs/content";
import { Prose } from "../docs/Prose";
import { useSiteLocale, useWords } from "../site/locale";
import { PageHeader } from "../site/PageHeader";
import { DOC_GROUPS } from "../site/site-map";

const WORDS = {
  ko: { loading: "불러오는 중…", group: "문서", note: null, missing: null },
  en: {
    loading: "Loading…",
    group: "Documentation",
    note: "This page is translated from the Korean original. Where the two differ, the Korean text is the source of truth.",
    missing: "This page has no English translation yet, so it is shown in the Korean original.",
  },
} as const;

export const Docs = () => {
  const { pathname, hash } = useLocation();
  const { locale } = useSiteLocale();
  const words = useWords(WORDS);
  const [loaded, setLoaded] = useState<{ key: string; text: string; translated: boolean } | null>(null);

  // /docs 또는 /docs/<slug>
  const slug = pathname.replace(/^\/docs\/?/, "").replace(/\/$/, "");
  const activeDoc = DOCS.find((doc) => doc.slug === slug);
  const activeFile = activeDoc?.file;
  const key = `${locale}:${activeFile}`;
  const current = loaded && loaded.key === key ? loaded : null;

  useEffect(() => {
    if (!activeFile) return;
    let cancelled = false;
    loadDocBody(activeFile, locale).then(({ body, translated }) => {
      if (!cancelled) setLoaded({ key: `${locale}:${activeFile}`, text: body, translated });
    });
    return () => { cancelled = true; };
  }, [activeFile, locale]);

  // 본문은 늦게 그려지므로, 앵커로 들어오면 본문이 그려진 뒤 그 제목까지 내려간다.
  useEffect(() => {
    if (current && hash) document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView();
  }, [current, hash]);

  if (!activeDoc) return <Navigate to="/docs" replace />;
  if (current === null) return <Text variant="caption">{words.loading}</Text>;

  const group = DOC_GROUPS.find((one) => one.id === activeDoc.group);
  const groupLabel = (locale === "ko" ? group?.ko : group?.label) || words.group;
  const title = locale === "en" && current.translated ? (activeDoc.titleEn ?? activeDoc.title) : activeDoc.title;
  const notice = locale === "en" ? (current.translated ? words.note : words.missing) : null;

  return (
    <Stack gap="xl">
      <PageHeader group={groupLabel} name={title} />
      {notice ? (
        <Surface fill="sunken" radius="md" paddingX="lg" paddingY="md">
          <Text variant="caption" ink="secondary">{notice}</Text>
        </Surface>
      ) : null}
      <Prose file={activeDoc.file} lang={current.translated ? "en" : "ko"}>{current.text}</Prose>
    </Stack>
  );
};
