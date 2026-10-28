// Pieces the entries share: the glyphs and sample children their subjects are written with.

import { Box, Icon, Text } from "@studio-baeks/paper-ui";

import { named } from "./jsx";
import { pending } from "./schema";

// The ink select, until INKS joins the vocabulary.
export const inkOptions = () => pending(["base", "soft", "faint", "info", "success", "warning", "error", "inherit"] as const, "S11", "INKS");

export const glyph = {
  grip: <Icon size="caption"><path d="M9 5h.01M9 12h.01M9 19h.01M15 5h.01M15 12h.01M15 19h.01" /></Icon>,
  plus: <Icon><path d="M12 5v14M5 12h14" /></Icon>,
  search: <Icon size="caption"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></Icon>,
  info: [<circle key="ring" cx="12" cy="12" r="9" />, <path key="mark" d="M12 11v5M12 8h.01" />],
};

// Sunken boxes that give a layout something to arrange.
export const sunkenBoxes = (labels: readonly string[]) =>
  labels.map((label) => (
    <Box key={label} surface="sunken" radius="sm" padding="sm">
      <Text variant="caption" as="span">{label}</Text>
    </Box>
  ));

// An anchor in a preview should stay on the page.
export const stay = named("(event) => event.preventDefault()", (event: { preventDefault(): void }) => event.preventDefault());
