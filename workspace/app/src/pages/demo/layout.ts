// The product frame of /demo: one page's content dimensions, in dp. The frame is wider than container.content and the
// page collapses at its own widths, so none of them is a step of the public scale; they live here, the one module the
// lint manifest declares for the Demo. A width in a media query is em, so it follows the browser's default font size.

export const DEMO_LAYOUT = {
  frame: 1540,
  track: { nav: 218, navNarrow: 190, rail: 260 },
  collapse: { rail: 1180, nav: 900, stack: 600 },
} as const;

export const px = (dp: number) => `${dp}px`;
const maxWidth = (dp: number) => `(max-width: ${dp / 16}em)`;

// The rail drops under the content, the nav leaves, and the rail's cards stack.
export const DEMO_MEDIA = {
  rail: maxWidth(DEMO_LAYOUT.collapse.rail),
  nav: maxWidth(DEMO_LAYOUT.collapse.nav),
  stack: maxWidth(DEMO_LAYOUT.collapse.stack),
} as const;
