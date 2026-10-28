import { Box, Icon, Overlay, Pressable, Select } from "@studio-baeks/paper-ui";

import { SELECT_OPTIONS } from "./options.js";

// A light Box theme nested inside a dark one, each holding a Select, and an inverse Box that casts a shadow
// and holds one that casts its own. The geometry case carries the same tree.
export const ThemeBoxes = () => (
  <>
    <Box theme="dark">
      <Select aria-label="dark-select" defaultValue="a">{SELECT_OPTIONS}</Select>
      <Box theme="light">
        <Select aria-label="nested-light-select">{SELECT_OPTIONS}</Select>
      </Box>
    </Box>
    <Box theme="inverse" elevation="overlay" tabIndex={0} data-testid="inverse-card">
      <Box elevation="overlay" data-testid="inverse-card-child">Inside</Box>
    </Box>
  </>
);

// Raw text, an Icon with no ink, a Pressable and an Overlay inside an inverse Box: each takes the Box's ink.
const ThemeInk = () => (
  <Box theme="inverse" data-testid="ink-scope">
    <span data-testid="ink-raw">raw</span>
    <Icon data-testid="ink-icon" aria-hidden="true"><path d="M2 2h4" /></Icon>
    <Pressable data-testid="ink-pressable">Press</Pressable>
    <Overlay>
      <Overlay.Trigger data-testid="ink-trigger">Open</Overlay.Trigger>
      <Overlay.Content aria-label="Ink panel">
        <span data-testid="ink-overlay-raw">raw</span>
        <Overlay.Close data-testid="ink-overlay-close">Close</Overlay.Close>
      </Overlay.Content>
    </Overlay>
  </Box>
);

export const ThemeCase = () => (
  <>
    <ThemeBoxes />
    <ThemeInk />
  </>
);
