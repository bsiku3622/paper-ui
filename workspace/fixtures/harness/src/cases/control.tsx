import { Badge, Button, Control, Field, Icon, Select, Textarea } from "@studio-baeks/paper-ui";
import { CONTROL_ANATOMIES, CONTROL_SIZES } from "@studio-baeks/paper-ui/tokens";

import { SELECT_OPTIONS } from "./options.js";

const glyph = <path d="M4 12h16" />;

export const ControlCase = () => (
  <>
    {CONTROL_SIZES.flatMap((size) => CONTROL_ANATOMIES.map((anatomy) => (
      <Control key={`${size}-${anatomy}`} size={size} anatomy={anatomy} data-testid={`control-${size}-${anatomy}`}>Text</Control>
    )))}
    <Control shape="pill" data-testid="control-pill">Pill</Control>
    <Control data-testid="control-bare">Bare</Control>
    <Control justify="start" width="20rem" data-testid="control-justified"><span data-testid="control-justified-content">Start</span></Control>
    <Control gap="xl" align="end" justify="between" width="20rem" data-testid="control-arranged"><span>One</span><span>Two</span></Control>
    <Button gap="xl" align="end" justify="between" fullWidth data-testid="button-arranged"><span>One</span><span>Two</span></Button>
    <Badge gap="xl" align="end" justify="between" data-testid="badge-arranged"><span>One</span><span>Two</span></Badge>
    <Badge dot data-testid="badge-bare">Bare</Badge>
    <Field aria-label="field-arranged" gap="xl" leading={<Icon data-testid="field-arranged-icon">{glyph}</Icon>} data-testid="field-arranged" />
    <Field aria-label="field-bare" leading={<Icon>{glyph}</Icon>} data-testid="field-bare" />
    <Icon data-testid="icon-alone">{glyph}</Icon>
    <Control size="lg" data-testid="control-with-icons">
      <Icon data-testid="icon-follows">{glyph}</Icon>
      <Icon size="label" data-testid="icon-explicit">{glyph}</Icon>
    </Control>
    <Control size="lg" iconSize="label"><Icon data-testid="icon-told">{glyph}</Icon></Control>
    {CONTROL_SIZES.map((size) => <Select key={size} size={size} aria-label={`select-${size}`} data-testid={`select-${size}`}>{SELECT_OPTIONS}</Select>)}
    {CONTROL_SIZES.map((size) => <Field key={size} size={size} aria-label={`field-${size}`} leading={<Icon data-testid={`field-icon-${size}`}>{glyph}</Icon>} />)}
    {CONTROL_SIZES.map((size) => <Textarea key={size} size={size} rows={1} aria-label={`textarea-${size}`} data-testid={`textarea-${size}`} />)}
  </>
);
