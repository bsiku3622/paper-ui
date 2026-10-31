// A GitHub-flavoured table from its header and rows; a cell that holds a pipe is escaped here, once.
export const table = (header: readonly string[], rows: readonly (readonly string[])[]): string => {
  const cell = (text: string) => text.replaceAll("|", "\\|");
  const line = (cells: readonly string[]) => `| ${cells.map(cell).join(" | ")} |`;
  return [line(header), line(header.map(() => "---")), ...rows.map(line)].join("\n");
};

// A list of names as the docs write it: in one code span (`A · B`), or plain where the prose around it is not code.
export const list = (names: readonly string[]) => `\`${names.join(" · ")}\``;
// Each name in its own code span, where the sentence reads them one by one.
export const codes = (names: readonly string[]) => names.map((name) => `\`${name}\``).join(" · ");
export const plain = (names: readonly string[]) => names.join(" · ");
