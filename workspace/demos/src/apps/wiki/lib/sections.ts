// sections.ts — a document cut at its headings, so “[편집]” beside a heading can edit that section alone.
// Section 0 is the lead (everything before the first heading); section n is the n-th heading with what is under it, up to the
// next heading of the same or a higher level. The file has no imports so a script can load it on its own.

export type SectionInfo = { n: number; level: number; title: string; start: number; end: number };

const HEADING = /^(={2,4}) (.+?) \1\s*$/;

const scan = (text: string) => {
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  const heads: { at: number; level: number; title: string }[] = [];
  let fence = false;
  let macro = false;
  lines.forEach((line, at) => {
    if (fence) {
      if (/^```\s*$/.test(line)) fence = false;
      return;
    }
    if (macro) {
      if (line.trim() === "}}") macro = false;
      return;
    }
    if (line.startsWith("```")) {
      fence = true;
      return;
    }
    const trimmed = line.trim();
    if (/^\{\{(정보상자|틀)/.test(trimmed) && !/\}\}\s*$/.test(trimmed)) {
      macro = true;
      return;
    }
    const m = HEADING.exec(line);
    if (m) heads.push({ at, level: m[1]!.length, title: m[2]!.trim() });
  });
  const sections: SectionInfo[] = heads.map((head, k) => {
    let end = lines.length;
    for (let j = k + 1; j < heads.length; j++) {
      if (heads[j]!.level <= head.level) {
        end = heads[j]!.at;
        break;
      }
    }
    return { n: k + 1, level: head.level, title: head.title, start: head.at, end };
  });
  return { lines, sections, leadEnd: heads[0]?.at ?? lines.length };
};

export const listSections = (text: string) => scan(text).sections;

const range = (text: string, n: number) => {
  const { lines, sections, leadEnd } = scan(text);
  if (n === 0) return { lines, start: 0, end: leadEnd };
  const section = sections[n - 1];
  return section ? { lines, start: section.start, end: section.end } : null;
};

export const hasSection = (text: string, n: number) => range(text, n) !== null;

export const getSection = (text: string, n: number) => {
  const r = range(text, n);
  return r ? r.lines.slice(r.start, r.end).join("\n").replace(/\s+$/, "") : "";
};

export const sectionTitle = (text: string, n: number) => (n === 0 ? "" : (scan(text).sections[n - 1]?.title ?? ""));

export const replaceSection = (text: string, n: number, next: string) => {
  const r = range(text, n);
  if (!r) return text;
  const body = next.replace(/\s+$/, "");
  const after = r.lines.slice(r.end);
  const out = [...r.lines.slice(0, r.start), ...(body ? body.split("\n") : []), ...(after.length > 0 ? ["", ...after] : [])];
  return out.join("\n").replace(/\n{3,}/g, "\n\n").replace(/\s+$/, "");
};
