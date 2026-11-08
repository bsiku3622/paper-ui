// The studio's reader of Typography's originals: where each authored value sits in the tree an override is written in.

import { TYPOGRAPHY_VALUES } from "@paper-ui/inspect/typography";

import { leafPaths } from "./paths";

export const TYPOGRAPHY_PATHS: string[][] = leafPaths(TYPOGRAPHY_VALUES);
