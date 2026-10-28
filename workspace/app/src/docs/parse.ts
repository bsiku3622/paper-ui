// A doc is Markdown whose first line is `# Title`. This is the one place that reads that rule: the
// title for the sidebar and the page, and the body without that line.

export type ParsedDoc = { title: string; body: string };

const TITLE_LINE = /^#[ \t]+(\S.*?)[ \t]*$/;

export const parseDoc = (raw: string): ParsedDoc => {
  const [first = "", ...rest] = raw.split(/\r?\n/);
  const title = TITLE_LINE.exec(first)?.[1];
  if (title === undefined) throw new Error(`a doc starts with "# Title", but its first line is "${first.slice(0, 60)}"`);
  return { title, body: rest.join("\n").replace(/^\n+/, "") };
};
