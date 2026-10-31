import { Button, Checkbox, Field, Switch } from "@studio-baeks/paper-ui";

// One region a spec overrides through window.__paper.sourceVars (set in main.tsx): the variables it gets
// back are written on #override-region, and every control inside re-derives its size from them.
export const OverridesCase = () => (
  <div id="override-region" data-testid="override-region">
    <Button data-testid="button">Button</Button>
    <Field aria-label="field" data-testid="field" />
    <Checkbox defaultChecked aria-label="checkbox" />
    <Switch defaultChecked aria-label="switch" />
  </div>
);
