// Inlines.tsx — the inside of a line: bold and italic, code, links (blue when the article exists, red when it does not),
// footnote marks. Every piece is a Paper part: Text for the type, Link for links, Marker for the highlighter.

import { Link as RouterLink } from "react-router-dom";

import { Box, Link, Marker, Surface, Text } from "@studio-baeks/paper-ui";
import type { LinkUnderline, TextVariant } from "@studio-baeks/paper-ui/tokens";

import type { Inline } from "../lib/markup";
import { articlePath, categoryPath, editPath } from "../lib/paths";
import { jumpOnClick } from "./jump";

export type InlineCtx = {
  // The type size the line is set in; bold, code and the like take the same.
  variant: TextVariant;
  // Links between words are underlined; a list of links (a table of contents, a navigation box) shows it on hover.
  underline?: LinkUnderline;
  // Whether a title is an article, and where a heading of an article is.
  exists: (title: string) => boolean;
  anchorOf: (title: string, text: string) => string;
};

export const Inlines = ({ nodes, ctx }: { nodes: readonly Inline[]; ctx: InlineCtx }) => (
  <>
    {nodes.map((node, index) => (
      <Node key={index} node={node} ctx={ctx} />
    ))}
  </>
);

const Node = ({ node, ctx }: { node: Inline; ctx: InlineCtx }) => {
  switch (node.t) {
    case "text":
      return <>{node.v}</>;
    case "br":
      return <Box as="br" />;
    case "fmt": {
      const inner = <Inlines nodes={node.c} ctx={ctx} />;
      if (node.f === "b") return <Text as="strong" variant={ctx.variant} ink="inherit" strong>{inner}</Text>;
      if (node.f === "i") return <Text as="em" variant={ctx.variant} ink="inherit">{inner}</Text>;
      if (node.f === "s") return <Text as="del" variant={ctx.variant} ink="inherit">{inner}</Text>;
      if (node.f === "mark") return <Marker>{inner}</Marker>;
      return <Text as={node.f} variant="label" ink="inherit" strong={false}>{inner}</Text>;
    }
    case "code":
      return (
        <Surface as="code" fill="sunken" radius="sm" paddingX="xs">
          <Text as="span" family="mono" variant={ctx.variant === "lead" ? "body" : "caption"} ink="inherit">{node.v}</Text>
        </Surface>
      );
    case "category":
      return <Link as={RouterLink} to={categoryPath(node.name)} underline={ctx.underline}><Inlines nodes={node.c} ctx={ctx} /></Link>;
    case "ext":
      return <Link href={node.href} target="_blank" rel="noreferrer noopener" underline={ctx.underline}><Inlines nodes={node.c} ctx={ctx} /></Link>;
    case "fn":
      return (
        <Link href={`#fn-${node.n}`} id={`fnref-${node.n}`} underline="hover" onClick={jumpOnClick(`fn-${node.n}`)} aria-label={`각주 ${node.n}`}>
          <Text as="sup" variant="label" ink="inherit" strong={false}>[{node.n}]</Text>
        </Link>
      );
    case "link": {
      const inner = <Inlines nodes={node.c} ctx={ctx} />;
      if (node.to === "") {
        const id = ctx.anchorOf("", node.anchor);
        return <Link href={`#${id}`} underline={ctx.underline} onClick={jumpOnClick(id)}>{inner}</Link>;
      }
      if (ctx.exists(node.to)) {
        const id = node.anchor ? ctx.anchorOf(node.to, node.anchor) : "";
        return <Link as={RouterLink} to={articlePath(node.to, id || undefined)} underline={ctx.underline}>{inner}</Link>;
      }
      return <Text as={RouterLink} to={editPath(node.to)} variant={ctx.variant} ink="error" title={`‘${node.to}’ 문서가 없습니다`}>{inner}</Text>;
    }
  }
};
