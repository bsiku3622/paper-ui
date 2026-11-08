// The Docs sidebar: the groups of DOC_GROUPS in order, one link per doc, in the visitor's language — a doc's English title is the
// title of its translation, and a doc without one keeps its Korean title.

import { DOCS } from "virtual:paper-docs";

import { useSiteLocale, type SiteLocale } from "../site/locale";
import { DOC_GROUPS } from "../site/site-map";
import { SidebarNav, type SidebarGroup } from "../site/SidebarNav";
import { docPath } from "./links";

const groupsIn = (locale: SiteLocale): SidebarGroup[] =>
  DOC_GROUPS.map((group) => ({
    label: (locale === "ko" ? group.ko : group.label) || undefined,
    blocks: [{ links: DOCS.filter((doc) => doc.group === group.id).map((doc) => ({ label: locale === "en" ? (doc.titleEn ?? doc.title) : doc.title, to: docPath(doc.slug) })) }],
  }));

const GROUPS: Record<SiteLocale, SidebarGroup[]> = { ko: groupsIn("ko"), en: groupsIn("en") };
const LABEL = { ko: "문서 목차", en: "Contents" } as const;

export const DocsNav = () => {
  const { locale } = useSiteLocale();
  return <SidebarNav label={LABEL[locale]} groups={GROUPS[locale]} />;
};
