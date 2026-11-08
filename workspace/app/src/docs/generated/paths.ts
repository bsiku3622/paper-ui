import { fileURLToPath } from "node:url";

export const REPO = fileURLToPath(new URL("../../../../../", import.meta.url)).replace(/\/$/, "");
export const DOCS_DIR = `${REPO}/docs`;
export const WORKSPACE = `${REPO}/workspace`;
