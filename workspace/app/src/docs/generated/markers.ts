const NOTE = "<!-- 이 블록은 생성됩니다 — pnpm docs:sync -->";

export type GeneratedBlock = {
  id: string;
  files: readonly string[];
  inline?: boolean;
  render: () => string;
};

const open = (id: string) => `<!-- generated:${id} -->`;
const close = (id: string) => `<!-- /generated:${id} -->`;

export const wrapBlock = ({ id, inline }: Pick<GeneratedBlock, "id" | "inline">, content: string): string =>
  inline ? `${open(id)}${NOTE}${content}${close(id)}` : `${open(id)}\n${NOTE}\n${content}\n${close(id)}`;

export const readBlock = (text: string, id: string): string | undefined => {
  const start = text.indexOf(open(id));
  if (start < 0) return undefined;
  const end = text.indexOf(close(id), start);
  if (end < 0) return undefined;
  const inner = text.slice(start + open(id).length, end);
  if (inner.startsWith(`\n${NOTE}\n`)) return inner.slice(NOTE.length + 2, -1);
  if (inner.startsWith(NOTE)) return inner.slice(NOTE.length);
  return undefined;
};

export const replaceBlock = (text: string, block: Pick<GeneratedBlock, "id" | "inline">, content: string): string => {
  const start = text.indexOf(open(block.id));
  const end = start < 0 ? -1 : text.indexOf(close(block.id), start);
  if (start < 0 || end < 0) throw new Error(`no generated:${block.id} markers`);
  return text.slice(0, start) + wrapBlock(block, content) + text.slice(end + close(block.id).length);
};
