// The eight rules of the manifest, as the docs state them: the list in AGENTS.md and the foundations overview,
// and the paragraph the package README carries. The names come from RULES, so a rule renamed there is renamed here.
import { RULES } from "../../../../eslint-rules/manifest.js";

import type { GeneratedBlock } from "./markers";

const count = (n: number) => ["", "one", "two", "three", "four", "five", "six", "seven", "eight"][n] ?? String(n);
const join = (clauses: string[]) => `${clauses.slice(0, -1).join(", ")}, and ${clauses.at(-1)}`;

export const RULE_BLOCKS: GeneratedBlock[] = [
  {
    id: "rules.ko",
    files: ["AGENTS.md", "docs/foundations/README.md"],
    render: () => RULES.map((rule, index) => `${index + 1}. **${rule.ko.title}** (\`${rule.eslint[0]}\`). ${rule.ko.summary}`).join("\n"),
  },
  {
    id: "rules.en",
    files: ["workspace/packages/paper-ui/README.md"],
    render: () =>
      `${count(RULES.length).replace(/^./, (c) => c.toUpperCase())} rules hold the rest together, and eslint enforces them rather than the documentation: ${join(RULES.map((rule) => rule.en.summary))}. The package build, prepublish and CI run those checks.`,
  },
];
