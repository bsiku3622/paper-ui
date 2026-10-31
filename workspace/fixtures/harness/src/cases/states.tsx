import { Button, Icon, IconButton, Link } from "@studio-baeks/paper-ui";
import { useState } from "react";

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

// The Button family in the states a pointer, a key and an attribute put it in; the states spec reads their computed style.
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
    <Link href="#target" data-testid="link">Link</Link>
    <Link href="#target" underline="hover" data-testid="link-hover">Hover link</Link>
    <Link href="#target" underline="hover" aria-disabled data-testid="link-hover-disabled">Blocked hover link</Link>
    <Submits />
  </>
);
