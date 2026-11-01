import { Grid, Inline, Stack, Surface } from "@studio-baeks/paper-ui";

// The layout roots against Box's named sizes: each container bare, then with a named minWidth, so the spec
// reads which min-width wins when both sit in one layer.
export const LayoutCase = () => (
  <>
    <Stack data-testid="stack-bare" />
    <Inline data-testid="inline-bare" />
    <Grid data-testid="grid-bare" />
    <Stack minWidth="md" data-testid="stack-named" />
    <Inline minWidth="full" data-testid="inline-named" />
    <Grid minWidth="container.content" data-testid="grid-named" />
    <Grid minWidth="max-content" data-testid="grid-keyword" />
    <Stack minWidth="3rem" data-testid="stack-length" />
    <Stack justify="between" data-testid="stack-between" />
    <Inline align="baseline" data-testid="inline-baseline" />
    <Surface fill="canvas" data-testid="fill-canvas" />
    <Surface fill="raised" data-testid="fill-raised" />
    <Surface fill="sunken" data-testid="fill-sunken" />
    <Surface border data-testid="surface-border" />
    <Surface radius="sm" data-testid="radius-sm" />
    <Surface radius="md" data-testid="radius-md" />
    <Surface radius="lg" data-testid="radius-lg" />
    <Surface radius="full" data-testid="radius-full" />
  </>
);
