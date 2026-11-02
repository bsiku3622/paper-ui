import { Button, PaperProvider, Surface } from "@studio-baeks/paper-ui";

// A Provider given a value of each kind. The values are ones no default holds, so a spec can tell them apart from Paper's.
export const ProviderOverridesCase = () => (
  <PaperProvider
    storageKey={null}
    defaultTheme="light"
    shape={{ radius: { control: { md: "11px" } } }}
    color={{ light: { bg: { raised: "rgb(1, 2, 3)" } }, dark: { bg: { raised: "rgb(7, 8, 9)" } } }}
    palette={{ blue: { "600": "#0a0b0c" } }}
    shadow={{ light: { resting: { "0": "0px 1px 2px 3px" } } }}
    opacity={{ disabled: "0.25" }}
  >
    <Button data-testid="button">Button</Button>
    <Button data-testid="info" accent="info">Info</Button>
    <Button data-testid="disabled" disabled>Disabled</Button>
    <Surface data-testid="light-face" fill="raised" shadow>Light</Surface>
    <Surface data-testid="dark-face" theme="dark" fill="raised">Dark</Surface>
  </PaperProvider>
);
