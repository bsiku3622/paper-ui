import { Box, Select, ThemeScope } from "@studio-baeks/paper-ui";

import { SELECT_OPTIONS } from "./options.js";

// A light scope nested inside a dark one, each holding a Select, and an inverse Box that casts a shadow
// and holds one that casts its own. The geometry case carries the same tree.
export const ThemeCase = () => (
  <>
    <ThemeScope theme="dark">
      <Select aria-label="dark-select" defaultValue="a">{SELECT_OPTIONS}</Select>
      <ThemeScope theme="light">
        <Select aria-label="nested-light-select">{SELECT_OPTIONS}</Select>
      </ThemeScope>
    </ThemeScope>
    <Box inverse elevation="overlay" data-testid="inverse-card">
      <Box elevation="overlay" data-testid="inverse-card-child">Inside</Box>
    </Box>
  </>
);
