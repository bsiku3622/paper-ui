// Content: the rhythm of a sheet. A paper is set in the document's own size, so its type is not a Paper role (a role is a fixed
// size) but a ratio of the body: a heading is a multiple of it, and the space between blocks is a share of it. These are those
// ratios, written once and read by paper.css.ts.

// Between two blocks, and the room a heading, a list, a quote and a rule keep from what is around them.
export const BLOCK = "1em";
export const GAP = {
  block: BLOCK,
  tight: "0.25em",
  item: "0.3em",
  heading: "0.7em",
  headingSmall: "0.65em",
  indent: "1.6em",
  rule: "1.6em",
  figure: "0.5em",
  table: "1.2em",
  math: "0.6em",
} as const;

// A heading: its size as a multiple of the body, its line, its tracking.
export const HEADING = {
  h1: { size: "2.25em", leading: 1.4, tracking: "-0.04em", after: "1em" },
  h2: { size: "1.5em", leading: 1.5, tracking: "-0.025em", after: "0.7em" },
  h3: { size: "1.2em", leading: 1.5, tracking: "normal", after: "0.65em" },
} as const;

// A link's underline stands this far under the words.
export const UNDERLINE_OFFSET = "3px";

// Inside a quote, a code stretch, a table cell and a formula.
export const QUOTE_PADDING = "0.15em 0 0.15em 1.2em";
export const CODE_PADDING = "0.15em 0.35em";
export const BLOCK_CODE_PADDING = "1em";
export const CELL_PADDING = "0.5em 0.7em";
export const MATH = { block: "1.1em", inline: "1.05em" } as const;

// A checklist's box: its size and where it sits against the first line, and where its tick sits in it.
export const BOX = {
  size: "1em",
  top: "0.33em",
  tick: { left: "0.34em", top: "0.43em", width: "0.3em", height: "0.55em" },
} as const;
