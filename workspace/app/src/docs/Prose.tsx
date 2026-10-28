// A doc's Markdown as the page shows it. Links go where resolveDocHref says: a heading of the same doc, another
// doc or an app route through the router, anything else to a new tab. Tables scroll inside the column.

import { useMemo } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import { Link } from "react-router-dom";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";

import "../site/markdown.css";
import { docPath, resolveDocHref } from "./links";

const remarkPlugins = [remarkGfm];
const rehypePlugins = [rehypeSlug];

const componentsFor = (file: string): Components => ({
  a: ({ href = "", children }) => {
    const target = resolveDocHref(file, href);
    switch (target.kind) {
      case "anchor":
        return <a href={`#${target.hash}`}>{children}</a>;
      case "doc":
        return <Link to={docPath(target.slug, target.hash)}>{children}</Link>;
      case "app":
        return <Link to={target.path}>{children}</Link>;
      case "external":
        return <a href={target.href} target="_blank" rel="noreferrer">{children}</a>;
    }
  },
  table: ({ children }) => <div className="md-table"><table>{children}</table></div>,
});

export const Prose = ({ file, children }: { file: string; children: string }) => {
  const components = useMemo(() => componentsFor(file), [file]);
  return (
    <div className="md">
      <ReactMarkdown remarkPlugins={remarkPlugins} rehypePlugins={rehypePlugins} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
};
