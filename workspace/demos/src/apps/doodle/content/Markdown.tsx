// A Markdown document drawn on its paper. Paper has no rich text: a document's headings, lists, quotes and tables are real
// elements here, and the sizes, weights and colours they take are Paper's roles (markdown.css.ts). Words that are Paper
// atoms stay atoms — a link is Paper's Link, a task's box is Paper's Checkbox, a picture is the kit's Art.

import { Fragment, memo, useMemo, type ReactNode } from "react";

import { Checkbox, Link } from "@studio-baeks/paper-ui";

import { Art } from "../../../kit";
import { parse, type Align, type Inline, type Node } from "./read";
import * as css from "./markdown.css";

const Inlines = ({ items }: { items: readonly Inline[] }) => (
  <>
    {items.map((item, index) => {
      switch (item.t) {
        case "text": return <Fragment key={index}>{item.v}</Fragment>;
        case "br": return <br key={index} />;
        case "strong": return <strong key={index}><Inlines items={item.c} /></strong>;
        case "em": return <em key={index}><Inlines items={item.c} /></em>;
        case "del": return <del key={index}><Inlines items={item.c} /></del>;
        case "code": return <code key={index}>{item.v}</code>;
        case "link": return <Link key={index} href={item.href} target="_blank" rel="noreferrer"><Inlines items={item.c} /></Link>;
        case "image": return <Fragment key={index}>{item.alt}</Fragment>;
      }
    })}
  </>
);

const HEADINGS = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;

const alignOf = (align: Align) => align ?? undefined;

const Blocks = ({ nodes }: { nodes: readonly Node[] }) => <>{nodes.map((node, index) => <Block key={index} node={node} />)}</>;

const Block = ({ node }: { node: Node }): ReactNode => {
  switch (node.t) {
    case "heading": {
      const Tag = HEADINGS[Math.min(node.level, 6) - 1]!;
      return <Tag><Inlines items={node.c} /></Tag>;
    }
    case "p":
      return <p><Inlines items={node.c} /></p>;
    case "list": {
      const items = node.items.map((item, index) => (
        <li key={index} data-task={item.checked !== null ? "" : undefined}>
          {item.checked !== null ? <Checkbox size="sm" checked={item.checked} disabled readOnly aria-label={item.checked ? "완료한 항목" : "남은 항목"} onChange={() => {}} /> : null}
          {item.checked !== null ? <span><Blocks nodes={item.c} /></span> : <Blocks nodes={item.c} />}
        </li>
      ));
      return node.ordered ? <ol start={node.start}>{items}</ol> : <ul>{items}</ul>;
    }
    case "quote":
      return <blockquote><Blocks nodes={node.c} /></blockquote>;
    case "code":
      return <pre><code>{node.v}</code></pre>;
    case "hr":
      return <hr />;
    case "image":
      return <Art seed={node.src} kind="photo" ratio="16 / 9" radius="md" label={node.alt || "그림"} />;
    case "table":
      return (
        <table>
          <thead>
            <tr>{node.head.map((cell, index) => <th key={index} data-align={alignOf(node.align[index] ?? null)}><Inlines items={cell} /></th>)}</tr>
          </thead>
          <tbody>
            {node.rows.map((row, rowIndex) => (
              <tr key={rowIndex}>{row.map((cell, index) => <td key={index} data-align={alignOf(node.align[index] ?? null)}><Inlines items={cell} /></td>)}</tr>
            ))}
          </tbody>
        </table>
      );
  }
};

export const Markdown = memo(function Markdown({ source }: { source: string }) {
  const nodes = useMemo(() => parse(source), [source]);
  return (
    <div className={css.root}>
      <Blocks nodes={nodes} />
    </div>
  );
});
