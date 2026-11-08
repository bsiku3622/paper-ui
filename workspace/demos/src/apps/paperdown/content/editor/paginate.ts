// Content: the page breaks of a paper that is cut into pages. The original puts a spacer between two blocks where the next
// page begins (Tiptap decorations). A `contenteditable` cannot hold spacers that are not
// its words, so here the block that would cross the end of a page gets a top margin that pushes it onto the next one. A
// heading goes with what follows it; a list and a quote are cut between their items. A paragraph longer than a page is
// not cut (the original cuts it between lines): it runs on past the page's end.

export type Layout = { enabled: boolean; height: number; margin: number; gap: number };

const LISTS = new Set(["UL", "OL", "BLOCKQUOTE", "LI"]);

const units = (root: HTMLElement): HTMLElement[] => {
  const out: HTMLElement[] = [];
  const visit = (parent: HTMLElement) => {
    for (const child of Array.from(parent.children)) {
      if (!(child instanceof HTMLElement)) continue;
      if (LISTS.has(child.tagName) && child.children.length > 0) visit(child);
      else out.push(child);
    }
  };
  visit(root);
  return out;
};

const px = (value: string) => parseFloat(value) || 0;

export const paginate = (root: HTMLElement, layout: Layout): number => {
  for (const element of Array.from(root.querySelectorAll<HTMLElement>("[data-pgap]"))) {
    element.style.marginTop = "";
    element.removeAttribute("data-pgap");
    if (!element.getAttribute("style")) element.removeAttribute("style");
  }
  if (!layout.enabled) return 1;
  const rect = root.getBoundingClientRect();
  // The paper may be shown zoomed: lengths on the screen are the paper's lengths times this, when it can be told.
  const natural = parseFloat(getComputedStyle(root).width);
  const scale = natural > 0 && rect.width > 0 ? rect.width / natural : undefined;
  const unscale = (value: number) => (scale ? value / scale : value);
  const stride = layout.height + layout.gap;
  const inner = layout.height - 2 * layout.margin;
  const list = units(root);
  const measured = list.map((element) => {
    const box = element.getBoundingClientRect();
    return { element, top: unscale(box.top - rect.top), bottom: unscale(box.bottom - rect.top), height: unscale(box.height) };
  });

  const breaks: { element: HTMLElement; gap: number }[] = [];
  let added = 0;
  measured.forEach((unit, index) => {
    const y = unit.top + added;
    const page = Math.max(0, Math.floor((y - layout.margin + 0.1) / stride));
    const limit = page * stride + layout.height - layout.margin;
    let keepTo = unit.bottom;
    if (/^H[1-6]$/.test(unit.element.tagName)) {
      // A heading keeps company with the first two lines of what follows it.
      const next = measured[index + 1];
      if (next) {
        const line = px(getComputedStyle(next.element).lineHeight) || 24;
        keepTo = Math.max(unit.bottom, next.top + Math.min(next.height, line * 2));
      }
    }
    if (unit.bottom - unit.top <= inner && keepTo + added > limit + 0.5 && y > page * stride + layout.margin + 1) {
      const gap = Math.round(((page + 1) * stride + layout.margin - y) * 100) / 100;
      if (gap > 1) {
        breaks.push({ element: unit.element, gap });
        added += gap;
      }
    }
  });

  for (const { element, gap } of breaks) {
    // Margins of neighbouring blocks collapse into the larger one, so the push is the gap plus what is already between them.
    const before = element.previousElementSibling;
    const already = before instanceof HTMLElement ? px(getComputedStyle(before).marginBottom) : 0;
    element.style.marginTop = `${gap + already}px`;
    element.dataset.pgap = String(gap);
  }
  return Math.max(1, Math.ceil((root.scrollHeight + layout.gap - 0.5) / stride));
};
