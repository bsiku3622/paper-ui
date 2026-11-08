import { Badge, Box, Button, Field, Grid, Icon, IconButton, Inline, Link, Select, Textarea } from "@studio-baeks/paper-ui";
import { JUSTIFIES, previewAttributes } from "@studio-baeks/paper-ui/tokens";
import { useState } from "react";

import { SELECT_OPTIONS } from "./options.js";

const glyph = <Icon><path d="M4 12h16" /></Icon>;

// A form that counts its submits, around a Button that is loading and one that is not.
const Submits = () => {
  const [submits, setSubmits] = useState(0);
  return (
    <form data-testid="form" data-submits={submits} onSubmit={(event) => { event.preventDefault(); setSubmits((count) => count + 1); }}>
      <input aria-label="Name" data-testid="name" />
      <Button type="submit" loading data-testid="submit-loading">Saving</Button>
    </form>
  );
};

// The Button family and the input family in the states a pointer, a key and an attribute put them in; the states and focus specs
// read their computed style. Each input is followed by a button, so the Tab order has a place to go and to come back from.
export const StatesCase = () => (
  <>
    <button type="button" data-testid="before">Before</button>
    <Button data-testid="solid">Solid</Button>
    <Button variant="soft" data-testid="soft">Soft</Button>
    <Button variant="ghost" data-testid="ghost">Ghost</Button>
    <Button variant="hairline" data-testid="hairline">Hairline</Button>
    <Button accent="error" data-testid="error">Error</Button>
    <Button variant="ghost" selected data-testid="selected-ghost">Selected ghost</Button>
    <Button variant="hairline" selected data-testid="selected-hairline">Selected hairline</Button>
    <Button variant="ghost" aria-current="page" data-testid="current">Current</Button>
    <Button disabled data-testid="disabled">Disabled</Button>
    <Button variant="hairline" disabled data-testid="disabled-hairline">Disabled hairline</Button>
    <Button as="a" href="#target" data-testid="link-button">Link button</Button>
    <Button as="a" href="#target" disabled data-testid="disabled-link-button">Disabled link button</Button>
    <Button loading data-testid="loading">Loading</Button>
    <Button shape="pill" data-testid="pill">Pill</Button>
    <IconButton aria-label="Icon" data-testid="icon-button">{glyph}</IconButton>
    <IconButton aria-label="Disabled icon" disabled data-testid="disabled-icon-button">{glyph}</IconButton>
    <IconButton aria-label="Pill icon" shape="pill" data-testid="pill-icon-button">{glyph}</IconButton>
    <Inline width="4rem">
      <IconButton aria-label="Crowded one" data-testid="crowded-one">{glyph}</IconButton>
      <IconButton aria-label="Crowded two" data-testid="crowded-two">{glyph}</IconButton>
      <IconButton aria-label="Crowded three" data-testid="crowded-three">{glyph}</IconButton>
    </Inline>
    {JUSTIFIES.map((justify) => <Button key={justify} fullWidth justify={justify} data-testid={`justify-${justify}`}><span>A</span><span>B</span></Button>)}
    <Button fullWidth data-testid="justify-default">Default</Button>
    <IconButton aria-label="Alerts 3" badge={<Badge accent="info" variant="solid" size="xs" data-testid="count">3</Badge>} data-testid="counted">{glyph}</IconButton>
    <div dir="rtl"><IconButton aria-label="Alerts 4" badge={<Badge accent="info" variant="solid" size="xs" data-testid="count-rtl">4</Badge>} data-testid="counted-rtl">{glyph}</IconButton></div>
    <Link href="#target" data-testid="link">Link</Link>
    <Link as="button" data-testid="link-as-button">Link as button</Link>
    <Link href="#target" underline="hover" data-testid="link-hover">Hover link</Link>
    <Link href="#target" underline="hover" aria-disabled data-testid="link-hover-disabled">Blocked hover link</Link>
    <Submits />
    <Field aria-label="Field" data-testid="field" />
    <Field aria-label="Field ghost" variant="ghost" data-testid="field-ghost" />
    <button type="button">After field</button>
    <Field aria-label="Field error" status="error" data-testid="field-error" />
    <Field aria-label="Field warning" status="warning" data-testid="field-warning" />
    <Field aria-label="Field disabled" disabled data-testid="field-disabled" />
    <Field aria-label="Search" type="search" clearable defaultValue="query" data-testid="search" />
    <Field aria-label="Secret" type="password" showPasswordToggle clearable defaultValue="secret" data-testid="secret" />
    <Field aria-label="Locked" type="password" showPasswordToggle disabled defaultValue="secret" data-testid="locked" />
    <Textarea aria-label="Textarea" data-testid="textarea" />
    <Textarea aria-label="Textarea ghost" variant="ghost" data-testid="textarea-ghost" />
    <button type="button">After textarea</button>
    <Textarea aria-label="Textarea error" status="error" data-testid="textarea-error" />
    <Textarea aria-label="Textarea disabled" disabled data-testid="textarea-disabled" />
    <Select aria-label="Select" data-testid="select">{SELECT_OPTIONS}</Select>
    <Select aria-label="Select ghost" variant="ghost" data-testid="select-ghost">{SELECT_OPTIONS}</Select>
    <button type="button">After select</button>
    <Select aria-label="Select error" status="error" data-testid="select-error">{SELECT_OPTIONS}</Select>
    <Select aria-label="Select disabled" disabled data-testid="select-disabled">{SELECT_OPTIONS}</Select>
    <Grid columns="minmax(0, 1fr) auto" width="40rem"><Box /><Select aria-label="Select in an auto track" data-testid="select-auto">{SELECT_OPTIONS}</Select></Grid>
    <Box width="20rem"><Select aria-label="Select in a set width" data-testid="select-fills">{SELECT_OPTIONS}</Select></Box>
    {/* The same controls under a preview, in a state no pointer or key holds; the states spec reads them against the real states above. */}
    <div {...previewAttributes("hover")}>
      <Button data-testid="preview-hover">Solid</Button>
      <Button variant="hairline" data-testid="preview-hover-hairline">Hairline</Button>
      <Button variant="ghost" selected data-testid="preview-hover-selected">Selected ghost</Button>
      <Button disabled data-testid="preview-hover-disabled">Disabled</Button>
      <Field aria-label="Field under a hover preview" data-testid="preview-hover-field" />
    </div>
    <Button {...previewAttributes("active")} data-testid="preview-active">Pressed</Button>
    <div {...previewAttributes("focus")}>
      <Button data-testid="preview-focus">Focused</Button>
      <Field aria-label="Field under a focus preview" data-testid="preview-focus-field" />
    </div>
  </>
);
