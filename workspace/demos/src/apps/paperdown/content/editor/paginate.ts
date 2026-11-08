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
    const before = element.previousElementSibling;
    const already = before instanceof HTMLElement ? px(getComputedStyle(before).marginBottom) : 0;
    element.style.marginTop = `${gap + already}px`;
    element.dataset.pgap = String(gap);
  }
  return Math.max(1, Math.ceil((root.scrollHeight + layout.gap - 0.5) / stride));
};
