import type { ReactNode } from "react";

import { Box, Grid, Inline, Stack, Surface, Text } from "@studio-baeks/paper-ui";

import { Glyph, SurfaceLink } from "../../../kit";
import { Wordmark } from "../content/Serif";
import { useMedia } from "../lib/hooks";

export const Brand = () => {
  const phone = useMedia("(max-width: 767px)");
  return (
    <SurfaceLink to="/paperdown" aria-label="Paperdown 홈" radius="sm">
      <Inline gap="sm" align="center">
        {phone ? null : <Glyph name="file-text" size="subheading" />}
        <Wordmark small={phone} />
      </Inline>
    </SurfaceLink>
  );
};

export const Column = ({ children }: { children: ReactNode }) => (
  <Stack align="center" paddingX="lg">
    <Box width="container.content" maxWidth="full">
      {children}
    </Box>
  </Stack>
);

export const HomeFrame = ({ end, children }: { end: ReactNode; children: ReactNode }) => (
  <Grid rows="auto minmax(0, 1fr) auto" minHeight="viewport">
    <Surface as="header" fill="raised" border="bottom">
      <Column>
        <Inline justify="between" align="center" gap="md" paddingY="xl">
          <Brand />
          {end}
        </Inline>
      </Column>
    </Surface>
    <Box as="main" id="main">
      <Column>
        <Box paddingY="3xl">
          <Box paddingY="lg">{children}</Box>
        </Box>
      </Column>
    </Box>
    <Surface as="footer" border="top">
      <Column>
        <Inline justify="between" align="center" gap="lg" paddingY="lg">
          <Text as="span" variant="label" strong={false} ink="tertiary">Paperdown</Text>
          <Box as="span" hideBelow="sm">
            <Text as="span" variant="label" strong={false} ink="tertiary">글에 집중하고, 종이로 남기세요.</Text>
          </Box>
        </Inline>
      </Column>
    </Surface>
  </Grid>
);
