// The index of the demos: every app, one card each.

import { Grid, Inline, Stack, Text } from "@studio-baeks/paper-ui";

import { APPS } from "../apps/registry";
import { AppShell, Art, Glyph, PageHeader, SurfaceLink } from "../kit";

export const Launcher = () => (
  <AppShell name="Paper 앱" kind="board">
    <PageHeader title="Paper 앱" description="Paper로만 그린 앱 여덟 개입니다. 데이터는 모두 지어낸 것입니다." />
    <Grid columns="repeat(auto-fill, minmax(17rem, 1fr))" gap="xl">
      {APPS.map((app) => (
        <SurfaceLink key={app.id} to={`/${app.id}`} card padding="md">
          <Stack gap="md">
            <Art seed={app.id} kind="cover" ratio="16 / 9" radius="md" />
            <Stack gap="xs" paddingX="xs" paddingY="xs">
              <Inline gap="sm" align="center">
                <Glyph name={app.glyph} />
                <Text as="span" variant="subheading">{app.name}</Text>
              </Inline>
              <Text as="p" ink="secondary">{app.description}</Text>
            </Stack>
          </Stack>
        </SurfaceLink>
      ))}
    </Grid>
  </AppShell>
);
