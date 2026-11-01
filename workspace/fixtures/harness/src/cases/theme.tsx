import { Floating, Icon, Pressable, Select, Surface } from "@studio-baeks/paper-ui";

import { SELECT_OPTIONS } from "./options.js";

// A light Surface theme nested inside a dark one, each holding a Select, and an inverse Surface that casts a shadow
// and holds one that casts its own. The geometry case carries the same tree.
export const ThemeBoxes = () => (
  <>
    <Surface theme="dark">
      <Select aria-label="dark-select" defaultValue="a">{SELECT_OPTIONS}</Select>
      <Surface theme="light">
        <Select aria-label="nested-light-select">{SELECT_OPTIONS}</Select>
      </Surface>
    </Surface>
    <Surface theme="inverse" elevation="overlay" tabIndex={0} data-testid="inverse-card">
      <Surface elevation="overlay" data-testid="inverse-card-child">Inside</Surface>
    </Surface>
  </>
);

// Raw text, an Icon with no ink, a Pressable and a Floating panel inside an inverse Surface: each takes the Surface's ink.
const ThemeInk = () => (
  <Surface theme="inverse" data-testid="ink-scope">
    <span data-testid="ink-raw">raw</span>
    <Surface theme="inverse" data-testid="ink-nested">
      <span data-testid="ink-nested-raw">raw</span>
    </Surface>
    <Icon data-testid="ink-icon" aria-hidden="true"><path d="M2 2h4" /></Icon>
    <Pressable data-testid="ink-pressable">Press</Pressable>
    <Floating>
      <Floating.Trigger data-testid="ink-trigger">Open</Floating.Trigger>
      <Floating.Content aria-label="Ink panel">
        <span data-testid="ink-floating-raw">raw</span>
        <Floating.Close data-testid="ink-floating-close">Close</Floating.Close>
      </Floating.Content>
    </Floating>
  </Surface>
);

export const ThemeCase = () => (
  <>
    <ThemeBoxes />
    <ThemeInk />
  </>
);
