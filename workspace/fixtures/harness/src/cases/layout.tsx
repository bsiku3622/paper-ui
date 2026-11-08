import { Box, Field, FormField, Grid, Inline, Stack, Surface, Text } from "@studio-baeks/paper-ui";

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
    <Grid columns={{ base: 1, md: 2, lg: "1fr 2fr 3fr" }} rows={{ md: "2rem 3rem" }} data-testid="grid-steps"><Box /></Grid>
    <Grid columns={{ md: 3 }} data-testid="grid-no-base"><Box /></Grid>
    <Grid columns={{ md: 2 }} data-testid="grid-outer"><Grid columns={{ lg: 3 }} data-testid="grid-inner"><Box /></Grid></Grid>
    <Box hideBelow="md" data-testid="hide-box">Box</Box>
    <Stack hideBelow="md" data-testid="hide-stack">Stack</Stack>
    <Grid hideBelow="lg" data-testid="hide-grid">Grid</Grid>
    <Box height="viewport" data-testid="height-viewport" />
    <Box minHeight="viewport" data-testid="min-height-viewport" />
    <Surface elevation="sticky" top="lg" fill="raised" shadow data-testid="sticky-top" />
    <Surface elevation="sticky" top="none" data-testid="sticky-none" />
    <Surface elevation="overlay" top="lg" data-testid="top-unread" />
    <Surface border="bottom" data-testid="border-bottom">Bottom</Surface>
    <Surface border data-testid="border-all">All</Surface>
    <Stack as="ul" data-testid="list-stack"><li>One</li></Stack>
    <Inline as="ol" data-testid="list-inline"><li>One</li></Inline>
    <Grid as="ul" data-testid="list-grid"><li>One</li></Grid>
    <Stack as="ul" paddingX="lg" data-testid="list-padded"><li>One</li></Stack>
    <Inline width="md"><Text truncate data-testid="truncate">{"긴 글자가 칸을 넘으면 말줄임표로 잘립니다 ".repeat(6)}</Text></Inline>
    <FormField label="Email" description="Help" error="Wrong" invalid data-testid="form-field"><Field /></FormField>
  </>
);
