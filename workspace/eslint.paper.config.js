// The second lint pass: the paper rules alone, read with inline configuration switched off.
//
// An `/* eslint paper/no-rule-disable: "off", paper/raw-color: "off" */` comment is applied before any rule runs,
// so no rule can see it, and the main pass lets it through. This pass ignores every inline comment, so the rules
// a comment tried to switch off run in full. It is derived from eslint.config.js: the same files, the same parser,
// only the paper/* rules, with `noInlineConfig` on.
//
//   eslint . -c eslint.paper.config.js --quiet
//
// --quiet drops the warning ESLint gives for each disable comment it now ignores; every paper rule is an error.

import base from "./eslint.config.js";

const paperOnly = (config) => {
  if (!config.rules) return config;
  return { ...config, rules: Object.fromEntries(Object.entries(config.rules).filter(([id]) => id.startsWith("paper/"))) };
};

export default [
  ...base.map(paperOnly),
  { linterOptions: { noInlineConfig: true, reportUnusedDisableDirectives: "off" } },
];
