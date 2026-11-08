// The studio's reader of Layout's originals: where each authored value sits in the tree an override is written in.

import { LAYOUT_SOURCE } from "@paper-ui/inspect/layout";

import { leafPaths } from "./paths";

export const LAYOUT_PATHS: string[][] = leafPaths(LAYOUT_SOURCE);
