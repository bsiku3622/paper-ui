// The source trees the AGENTS tree names: every directory under the two src folders with the note DIR_NOTES gives
// it, and the files FILE_NOTES describes under their directory. A directory without a note, or a described file that
// is gone, throws, so the tree cannot grow a folder nobody described or keep a line for a file that was renamed.
import { existsSync, readdirSync } from "node:fs";

import type { GeneratedBlock } from "./markers";
import { DIR_NOTES, FILE_NOTES } from "./notes";
import { WORKSPACE } from "./paths";

const ROOTS = ["packages/paper-ui/src", "app/src"];

const directoriesOf = (root: string): string[] =>
  readdirSync(`${WORKSPACE}/${root}`, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => `${entry.parentPath.slice(WORKSPACE.length + 1)}/${entry.name}`)
    .filter((path) => path.startsWith(`${root}/`) && !path.split("/").some((part) => part.startsWith("__")))
    .sort();

const noteOf = (path: string): string => {
  const note = DIR_NOTES[path];
  if (note === undefined) throw new Error(`no DIR_NOTES entry for ${path}`);
  return note;
};

const parentOf = (path: string) => path.slice(0, path.lastIndexOf("/"));

export const TREE_BLOCK: GeneratedBlock = {
  id: "src-tree",
  files: ["AGENTS.md"],
  render: () => {
    for (const file of Object.keys(FILE_NOTES)) if (!existsSync(`${WORKSPACE}/${file}`)) throw new Error(`FILE_NOTES names ${file}, which does not exist`);
    const line = (name: string, depth: number, note: string) => `${`${"  ".repeat(depth)}${name}`.padEnd(30)} ${note}`;
    const filesIn = (directory: string, depth: number) =>
      Object.entries(FILE_NOTES).filter(([file]) => parentOf(file) === directory).sort(([a], [b]) => a.localeCompare(b)).map(([file, note]) => line(file.split("/").at(-1)!, depth, note));
    const lines = ROOTS.flatMap((root) => [
      `workspace/${root}/`,
      ...filesIn(root, 1),
      ...directoriesOf(root).flatMap((path) => {
        const depth = path.slice(root.length + 1).split("/").length;
        return [line(`${path.split("/").at(-1)}/`, depth, noteOf(path)), ...filesIn(path, depth + 1)];
      }),
    ]);
    return ["```text", ...lines, "```"].join("\n");
  },
};
