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
  menu: <Icon><path d="M4 6h16M4 12h16M4 18h16" /></Icon>,
  home: <Icon><path d="M4 11 12 4l8 7v9H4z" /></Icon>,
  file: <Icon><path d="M7 3h7l4 4v14H7z" /><path d="M14 3v4h4" /></Icon>,
  clock: <Icon><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Icon>,
  gear: <Icon><circle cx="12" cy="12" r="3" /><path d="M12 3v3M12 18v3M3 12h3M18 12h3" /></Icon>,
  upload: <Icon><path d="M12 16V4M7 9l5-5 5 5M5 20h14" /></Icon>,
  info: [<circle key="ring" cx="12" cy="12" r="9" />, <path key="mark" d="M12 11v5M12 8h.01" />],
};

export const sunkenBoxes = (labels: readonly string[]) =>
  labels.map((label) => (
    <Surface key={label} fill="sunken" radius="sm" padding="sm">
      <Text variant="caption" as="span">{label}</Text>
    </Surface>
  ));

export const stay = named("(event) => event.preventDefault()", (event: { preventDefault(): void }) => event.preventDefault());
