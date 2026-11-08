// The studio's reader of Shape's originals: where each authored value sits in the tree an override is written in. A value-less
// reading — the stylesheet gives the values — so a source the package adds later shows up in the studio by itself.

import { SHAPE_SOURCE } from "@paper-ui/inspect/shape";

import { leafPaths } from "./paths";

export const SHAPE_PATHS: string[][] = leafPaths(SHAPE_SOURCE);
