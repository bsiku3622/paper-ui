// Every generated block of the docs: the text the sources state, written between markers in the files named.
// `pnpm docs:sync` rewrites them; generated.test.ts fails while any of them is stale.
import { COLOR_BLOCKS } from "./color";
import { FONT_BLOCK } from "./install";
import { LAYOUT_BLOCKS } from "./layout";
import { MOTION_BLOCKS } from "./motion";
import { SHAPE_BLOCKS } from "./shape";
import { INVENTORY_BLOCKS } from "./inventory";
import type { GeneratedBlock } from "./markers";
import { DOCS_MAP_BLOCK } from "./docs-map";
import { RULE_BLOCKS } from "./rules";
import { TREE_BLOCK } from "./tree";
import { TYPOGRAPHY_BLOCKS } from "./typography";

export type { GeneratedBlock } from "./markers";

export const GENERATED_BLOCKS: readonly GeneratedBlock[] = [
  ...INVENTORY_BLOCKS,
  DOCS_MAP_BLOCK,
  ...RULE_BLOCKS,
  ...TYPOGRAPHY_BLOCKS,
  ...COLOR_BLOCKS,
  ...SHAPE_BLOCKS,
  ...LAYOUT_BLOCKS,
  ...MOTION_BLOCKS,
  TREE_BLOCK,
  FONT_BLOCK,
];
