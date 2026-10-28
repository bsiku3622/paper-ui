import { Select, ThemeScope } from "@studio-baeks/paper-ui";

import { SELECT_OPTIONS } from "./options.js";

// A light scope nested inside a dark one, each holding a Select. The geometry case carries the same tree.
export const ThemeCase = () => (
  <ThemeScope theme="dark">
    <Select aria-label="dark-select" defaultValue="a">{SELECT_OPTIONS}</Select>
    <ThemeScope theme="light">
      <Select aria-label="nested-light-select">{SELECT_OPTIONS}</Select>
    </ThemeScope>
  </ThemeScope>
);
