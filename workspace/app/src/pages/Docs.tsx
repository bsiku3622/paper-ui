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

  // The body renders late, so an anchor scrolls only after the body is there.
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
