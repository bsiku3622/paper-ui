// The Docs sidebar: the groups of DOC_GROUPS in order, one link per doc.

import { DOCS } from "virtual:paper-docs";

import { DOC_GROUPS } from "../site/site-map";
import { SidebarNav, type SidebarGroup } from "../site/SidebarNav";
import { docPath } from "./links";

const GROUPS: SidebarGroup[] = DOC_GROUPS.map((group) => ({
  label: group.label || undefined,
  blocks: [{ sections: [{ links: DOCS.filter((doc) => doc.group === group.id).map((doc) => ({ label: doc.title, to: docPath(doc.slug) })) }] }],
}));

export const DocsNav = () => <SidebarNav label="문서 목차" groups={GROUPS} />;
