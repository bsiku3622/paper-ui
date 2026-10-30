import { Button, Checkbox, Field, Icon, IconButton, Radio, Select, Spinner, Switch, Textarea, loop, presence } from "@studio-baeks/paper-ui";

import { SELECT_OPTIONS } from "./options.js";

// Every Atom that transitions, once, then a loading Button and a Spinner, the two loop classes, and the presence classes
// in each state they key on (no data-presence, entering, exiting).
export const MotionCase = () => (
  <>
    <Button>Button</Button>
    <IconButton aria-label="Icon button"><Icon><path d="M2 2h4" /></Icon></IconButton>
    <Field aria-label="Field" clearable defaultValue="value" />
    <Select aria-label="Select" defaultValue="a">{SELECT_OPTIONS}</Select>
    <Textarea aria-label="Textarea" />
    <Checkbox aria-label="Checkbox" />
    <Radio aria-label="Radio" />
    <Switch aria-label="Switch" />
    <Button loading>Saving</Button>
    <Spinner label="Spinner" />
    <span className={loop.spin} data-testid="loop-spin" />
    <span className={loop.pulse} data-testid="loop-pulse" />
    <div className={presence.surface} data-testid="surface-idle" />
    <div className={presence.surface} data-presence="entering" data-testid="surface-entering" />
    <div className={presence.surface} data-presence="exiting" data-testid="surface-exiting" />
    <div className={presence.scrim} data-presence="entering" data-testid="scrim-entering" />
    <div className={presence.scrim} data-presence="exiting" data-testid="scrim-exiting" />
  </>
);
