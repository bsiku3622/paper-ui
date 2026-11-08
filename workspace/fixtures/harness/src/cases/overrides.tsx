import { Box, Button, Checkbox, Field, Surface, Switch } from "@studio-baeks/paper-ui";

export const OverridesCase = () => (
  <div id="override-region" data-testid="override-region">
    <Button shape="rounded" data-testid="button">Button</Button>
    <Field aria-label="field" data-testid="field" />
    <Checkbox defaultChecked aria-label="checkbox" />
    <Switch defaultChecked aria-label="switch" />
    <Box width="container.content" data-testid="container-box" />
    <Surface elevation="overlay" data-testid="overlay-surface">Overlay</Surface>
  </div>
);
