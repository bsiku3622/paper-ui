import { Grid, Inline, Stack } from "@studio-baeks/paper-ui";

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
  </>
);
