export const table = (header: readonly string[], rows: readonly (readonly string[])[]): string => {
  const cell = (text: string) => text.replaceAll("|", "\\|");
  const line = (cells: readonly string[]) => `| ${cells.map(cell).join(" | ")} |`;
  return [line(header), line(header.map(() => "---")), ...rows.map(line)].join("\n");
};

export const list = (names: readonly string[]) => `\`${names.join(" · ")}\``;
export const codes = (names: readonly string[]) => names.map((name) => `\`${name}\``).join(" · ");
export const plain = (names: readonly string[]) => names.join(" · ");
