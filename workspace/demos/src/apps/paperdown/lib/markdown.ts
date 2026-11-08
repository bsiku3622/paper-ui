const escapeHtml = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const inline = (source: string): string => {
  const kept: string[] = [];
  const keep = (html: string) => `\u0000${kept.push(html) - 1}\u0000`;
  let text = source;
  text = text.replace(/`([^`]+)`/g, (_, code: string) => keep(`<code>${escapeHtml(code)}</code>`));
  text = text.replace(/(^|[^\\$])\$([^$\n]+?)\$(?!\$)/g, (_, before: string, latex: string) => `${before}${keep(`<span data-type="inline-math" data-latex="${escapeHtml(latex)}"></span>`)}`);
  text = escapeHtml(text);
  text = text.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+&quot;[^&]*&quot;)?\)/g, (_, alt: string, src: string) => `<img src="${src}" alt="${alt}">`);
  text = text.replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+&quot;[^&]*&quot;)?\)/g, (_, label: string, href: string) => `<a href="${href}" rel="noopener noreferrer">${label}</a>`);
  text = text.replace(/\*\*([^*]+?)\*\*|__([^_]+?)__/g, (_, a: string | undefined, b: string | undefined) => `<strong>${a ?? b}</strong>`);
  text = text.replace(/~~([^~]+?)~~/g, "<del>$1</del>");
  text = text.replace(/==([^=]+?)==/g, "<mark>$1</mark>");
  text = text.replace(/(^|[^*\w])\*([^*\s][^*]*?)\*(?!\*)/g, "$1<em>$2</em>");
  text = text.replace(/(^|[^_\w])_([^_\s][^_]*?)_(?![_\w])/g, "$1<em>$2</em>");
  return text.replace(/\u0000(\d+)\u0000/g, (_, index: string) => kept[Number(index)] ?? "");
};

const FENCE = /^\s*```(\S*)\s*$/;
const HEADING = /^(#{1,6})\s+(.*?)\s*#*\s*$/;
const RULE = /^\s*([-*_])(\s*\1){2,}\s*$/;
const ITEM = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/;
const TABLE_ROW = /^\s*\|?.*\|.*$/;
const TABLE_RULE = /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/;
const IMAGE_LINE = /^\s*!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)\s*$/;

const cells = (line: string) => line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim());

const startsBlock = (line: string) => FENCE.test(line) || HEADING.test(line) || RULE.test(line) || /^\s*>/.test(line) || ITEM.test(line) || /^\s*\$\$/.test(line);

const list = (lines: string[], start: number): { html: string; next: number } => {
  const first = ITEM.exec(lines[start]!)!;
  const base = first[1]!.length;
  const ordered = /\d/.test(first[2]!);
  const items: string[] = [];
  let task = false;
  let i = start;
  while (i < lines.length) {
    const match = ITEM.exec(lines[i]!);
    if (!match || match[1]!.length < base || (match[1]!.length === base && /\d/.test(match[2]!) !== ordered)) break;
    if (match[1]!.length > base) {
      const nested = list(lines, i);
      items[items.length - 1] = (items[items.length - 1] ?? "").replace(/<\/li>$/, `${nested.html}</li>`);
      i = nested.next;
      continue;
    }
    let body = match[3]!;
    const box = /^\[([ xX])\]\s+(.*)$/.exec(body);
    if (box) {
      task = true;
      body = box[2]!;
      items.push(`<li data-type="taskItem" data-checked="${box[1] !== " "}"><p>${inline(body)}</p></li>`);
    } else items.push(`<li><p>${inline(body)}</p></li>`);
    i++;
  }
  const tag = ordered ? "ol" : "ul";
  return { html: `<${tag}${task ? ' data-type="taskList"' : ""}>${items.join("")}</${tag}>`, next: i };
};

export const markdownToHtml = (source: string): string => {
  const lines = source.replace(/\r\n?/g, "\n").split("\n");
  const out: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i]!;
    if (line.trim() === "") {
      i++;
      continue;
    }
    const fence = FENCE.exec(line);
    if (fence) {
      const code: string[] = [];
      i++;
      while (i < lines.length && !FENCE.test(lines[i]!)) code.push(lines[i++]!);
      i++;
      out.push(`<pre><code>${escapeHtml(code.join("\n"))}</code></pre>`);
      continue;
    }
    if (/^\s*\$\$/.test(line)) {
      const inlineBlock = /^\s*\$\$(.+)\$\$\s*$/.exec(line);
      let latex = inlineBlock?.[1] ?? "";
      if (!inlineBlock) {
        const body: string[] = [];
        const rest = line.replace(/^\s*\$\$/, "");
        if (rest.trim()) body.push(rest);
        i++;
        while (i < lines.length && !/^\s*\$\$\s*$/.test(lines[i]!)) body.push(lines[i++]!);
        latex = body.join("\n");
      }
      i++;
      out.push(`<div data-type="block-math" data-latex="${escapeHtml(latex.trim())}"></div>`);
      continue;
    }
    const heading = HEADING.exec(line);
    if (heading) {
      const level = Math.min(3, heading[1]!.length);
      out.push(`<h${level}>${inline(heading[2]!)}</h${level}>`);
      i++;
      continue;
    }
    if (RULE.test(line)) {
      out.push("<hr>");
      i++;
      continue;
    }
    if (/^\s*>/.test(line)) {
      const quoted: string[] = [];
      while (i < lines.length && /^\s*>/.test(lines[i]!)) quoted.push(lines[i++]!.replace(/^\s*>\s?/, ""));
      out.push(`<blockquote>${markdownToHtml(quoted.join("\n"))}</blockquote>`);
      continue;
    }
    if (ITEM.test(line)) {
      const result = list(lines, i);
      out.push(result.html);
      i = result.next;
      continue;
    }
    if (TABLE_ROW.test(line) && i + 1 < lines.length && TABLE_RULE.test(lines[i + 1]!)) {
      const head = cells(line);
      const rows: string[][] = [];
      i += 2;
      while (i < lines.length && lines[i]!.trim() !== "" && TABLE_ROW.test(lines[i]!)) rows.push(cells(lines[i++]!));
      const cell = (tag: string, text: string) => `<${tag}><p>${inline(text)}</p></${tag}>`;
      const body = rows.map((row) => `<tr>${head.map((_, column) => cell("td", row[column] ?? "")).join("")}</tr>`).join("");
      out.push(`<table><tbody><tr>${head.map((text) => cell("th", text)).join("")}</tr>${body}</tbody></table>`);
      continue;
    }
    const image = IMAGE_LINE.exec(line);
    if (image) {
      out.push(`<img src="${escapeHtml(image[2]!)}" alt="${escapeHtml(image[1]!)}">`);
      i++;
      continue;
    }
    const paragraph: string[] = [];
    while (i < lines.length && lines[i]!.trim() !== "" && (paragraph.length === 0 || !startsBlock(lines[i]!))) paragraph.push(lines[i++]!.trim());
    out.push(`<p>${paragraph.map(inline).join("<br>")}</p>`);
  }
  return out.join("");
};

const pad = (text: string, prefix: string) => text.split("\n").map((line) => (line === "" ? prefix.trimEnd() : prefix + line)).join("\n");

const words = (node: Node): string => {
  if (node.nodeType === Node.TEXT_NODE) return (node.textContent ?? "").replace(/ /g, " ");
  if (!(node instanceof HTMLElement)) return "";
  const inner = () => Array.from(node.childNodes).map(words).join("");
  const type = node.dataset.type;
  if (type === "inline-math") return `$${node.dataset.latex ?? ""}$`;
  switch (node.tagName) {
    case "BR":
      return "  \n";
    case "STRONG":
    case "B":
      return inner() ? `**${inner()}**` : "";
    case "EM":
    case "I":
      return inner() ? `*${inner()}*` : "";
    case "DEL":
    case "S":
    case "STRIKE":
      return inner() ? `~~${inner()}~~` : "";
    case "MARK":
      return inner() ? `==${inner()}==` : "";
    case "CODE":
      return `\`${node.textContent ?? ""}\``;
    case "A":
      return `[${inner()}](${node.getAttribute("href") ?? ""})`;
    case "IMG":
      return `![${node.getAttribute("alt") ?? ""}](${node.getAttribute("src") ?? ""})`;
    default:
      return inner();
  }
};

const blocks = (parent: HTMLElement): string => {
  const out: string[] = [];
  for (const node of Array.from(parent.childNodes)) {
    if (node.nodeType === Node.TEXT_NODE) {
      if ((node.textContent ?? "").trim()) out.push(words(node));
      continue;
    }
    if (!(node instanceof HTMLElement)) continue;
    out.push(block(node));
  }
  return out.filter((chunk) => chunk !== "").join("\n\n");
};

const listMarkdown = (list: HTMLElement): string => {
  const ordered = list.tagName === "OL";
  const task = list.dataset.type === "taskList";
  return Array.from(list.children)
    .filter((item): item is HTMLElement => item instanceof HTMLElement && item.tagName === "LI")
    .map((item, index) => {
      const marker = ordered ? `${index + 1}. ` : "- ";
      const box = task ? (item.dataset.checked === "true" ? "[x] " : "[ ] ") : "";
      const nested = Array.from(item.children).filter((child) => child.tagName === "UL" || child.tagName === "OL");
      const text = Array.from(item.childNodes)
        .filter((child) => !(child instanceof HTMLElement && (child.tagName === "UL" || child.tagName === "OL")))
        .map(words)
        .join("")
        .trim();
      const deeper = nested.map((child) => pad(listMarkdown(child as HTMLElement), "  ")).join("\n");
      return `${marker}${box}${text}${deeper ? `\n${deeper}` : ""}`;
    })
    .join("\n");
};

const block = (node: HTMLElement): string => {
  const type = node.dataset.type;
  if (type === "block-math") return `$$\n${node.dataset.latex ?? ""}\n$$`;
  if (type === "taskList") return listMarkdown(node);
  switch (node.tagName) {
    case "H1":
    case "H2":
    case "H3":
      return `${"#".repeat(Number(node.tagName[1]))} ${words(node).trim()}`;
    case "P":
      return words(node).trim();
    case "BLOCKQUOTE":
      return pad(blocks(node), "> ");
    case "UL":
    case "OL":
      return listMarkdown(node);
    case "PRE":
      return `\`\`\`\n${node.textContent ?? ""}\n\`\`\``;
    case "HR":
      return "---";
    case "IMG":
      return words(node);
    case "TABLE": {
      const rows = Array.from(node.querySelectorAll("tr")).map((row) => Array.from(row.children).map((cell) => words(cell).trim().replace(/\|/g, "\\|").replace(/\n/g, " ")));
      if (rows.length === 0) return "";
      const width = Math.max(...rows.map((row) => row.length));
      const line = (row: string[]) => `| ${Array.from({ length: width }, (_, column) => row[column] ?? "").join(" | ")} |`;
      return [line(rows[0]!), `| ${Array.from({ length: width }, () => "---").join(" | ")} |`, ...rows.slice(1).map(line)].join("\n");
    }
    default:
      return node.children.length > 0 ? blocks(node) : words(node).trim();
  }
};

export const htmlToMarkdown = (html: string): string => {
  const root = new DOMParser().parseFromString(`<body>${html}</body>`, "text/html").body;
  return `${blocks(root)}\n`;
};
