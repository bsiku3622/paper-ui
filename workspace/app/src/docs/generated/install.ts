// The font stylesheets a consumer loads, from the one constant the package exports.
import { FONT_STYLESHEETS } from "@studio-baeks/paper-ui/tokens";

import type { GeneratedBlock } from "./markers";

export const FONT_BLOCK: GeneratedBlock = {
  id: "install-fonts",
  files: ["docs/get-started/install.md"],
  render: () =>
    ["```html", `<link rel="stylesheet" href="${FONT_STYLESHEETS.sans}" />`, `<link rel="stylesheet" href="${FONT_STYLESHEETS.mono}" />`, "```"].join("\n"),
};
