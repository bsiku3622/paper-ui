// Pieces the entries share: the glyphs and sample children their subjects are written with.

import { Icon, Surface, Text } from "@studio-baeks/paper-ui";

import { named } from "./jsx";

export const glyph = {
  grip: (
    <Icon size="caption">
      <circle cx="9" cy="6" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="9" cy="18" r="1" />
      <circle cx="15" cy="6" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="18" r="1" />
    </Icon>
  ),
  plus: <Icon><path d="M12 5v14M5 12h14" /></Icon>,
  search: <Icon size="caption"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></Icon>,
  info: [<circle key="ring" cx="12" cy="12" r="9" />, <path key="mark" d="M12 11v5M12 8h.01" />],
};

// Sunken boxes that give a layout something to arrange.
export const sunkenBoxes = (labels: readonly string[]) =>
  labels.map((label) => (
    <Surface key={label} fill="sunken" radius="sm" padding="sm">
      <Text variant="caption" as="span">{label}</Text>
    </Surface>
  ));

// An anchor in a preview should stay on the page.
export const stay = named("(event) => event.preventDefault()", (event: { preventDefault(): void }) => event.preventDefault());
