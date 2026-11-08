// What the pages of the app share: the name of the app as a link home, the column the home's content stands in, and the home's
// frame (a header, the page, a footer).

import type { ReactNode } from "react";

import { Box, Grid, Inline, Stack, Surface, Text } from "@studio-baeks/paper-ui";

import { Glyph, SurfaceLink } from "../../../kit";
import { Wordmark } from "../content/Serif";
import { useMedia } from "../lib/hooks";

// The mark and the name, one link to the home. On a phone the original drops the mark and sets the name a size smaller.
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

// The home's column: as wide as the page may be, with a gutter on a narrow window.
export const Column = ({ children }: { children: ReactNode }) => (
  <Stack align="center" paddingX="lg">
    <Box width="container.content" maxWidth="full">
      {children}
    </Box>
  </Stack>
);

// The home: a white header with the name and the account on it, the page on the canvas, and a footer that always stands at
// the foot of the window.
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
