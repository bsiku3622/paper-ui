import { useMemo } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import { Link as RouterLink } from "react-router-dom";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";

import { Link } from "@studio-baeks/paper-ui";

import { docPath, resolveDocHref } from "./links";
import * as s from "./prose.css";

type Node = { type: string; value?: string; children?: Node[] };
const isComment = ({ type, value }: Node) => type === "html" && /^<!--[\s\S]*-->$/.test(value?.trim() ?? "");
const dropComments = (node: Node): void => {
  if (!node.children) return;
  node.children = node.children.filter((child) => !isComment(child));
  node.children.forEach(dropComments);
};
const remarkDropComments = () => dropComments;

const remarkPlugins = [remarkGfm, remarkDropComments];
const rehypePlugins = [rehypeSlug];

const componentsFor = (file: string): Components => ({
  a: ({ href = "", children }) => {
    const target = resolveDocHref(file, href);
    switch (target.kind) {
      case "anchor":
        return <Link href={`#${target.hash}`}>{children}</Link>;
      case "doc":
        return <Link as={RouterLink} to={docPath(target.slug, target.hash)}>{children}</Link>;
      case "app":
        return <Link as={RouterLink} to={target.path}>{children}</Link>;
      case "external":
        return <Link href={target.href} target="_blank" rel="noreferrer">{children}</Link>;
    }
  },
  table: ({ children }) => <div className={s.tableScroll} data-testid="prose-table"><table>{children}</table></div>,
});

export const Prose = ({ file, lang, children }: { file: string; lang?: string; children: string }) => {
  const components = useMemo(() => componentsFor(file), [file]);
  return (
    <div className={s.prose} data-testid="prose" lang={lang}>
      <ReactMarkdown remarkPlugins={remarkPlugins} rehypePlugins={rehypePlugins} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
};
