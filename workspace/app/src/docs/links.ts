// Where a link in a doc goes. Relative paths are read from the folder of the doc that holds the link; a
// group's README answers to the folder name, so `../foundations/README.md` is the slug `foundations`.

export type DocHref =
  | { kind: "anchor"; hash: string }
  | { kind: "doc"; slug: string; hash?: string }
  | { kind: "app"; path: string }
  | { kind: "external"; href: string };

export const resolveDocHref = (fromFile: string, href: string): DocHref => {
  if (href.startsWith("#")) return { kind: "anchor", hash: href.slice(1) };
  if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(href)) return { kind: "external", href };
  const at = href.indexOf("#");
  const path = at < 0 ? href : href.slice(0, at);
  const hash = at < 0 ? undefined : href.slice(at + 1) || undefined;
  if (path.endsWith(".md") || path.startsWith("./") || path.startsWith("../")) {
    const segments = fromFile.split("/").slice(0, -1);
    for (const segment of path.replace(/\.md$/, "").split("/")) {
      if (segment === "." || segment === "") continue;
      if (segment === "..") segments.pop();
      else segments.push(segment);
    }
    return { kind: "doc", slug: segments.join("/").replace(/(^|\/)README$/, ""), hash };
  }
  if (href.startsWith("/")) return { kind: "app", path: href };
  return { kind: "external", href };
};

// The route of a doc: /docs for the overview, /docs/<slug> for the rest.
export const docPath = (slug: string, hash?: string): string => `${slug ? `/docs/${slug}` : "/docs"}${hash ? `#${hash}` : ""}`;
