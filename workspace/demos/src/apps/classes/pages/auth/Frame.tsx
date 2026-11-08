// The frame of the screens a visitor sees before the app opens (소개, 로그인, 학교 계정 연결). They stand outside the app's
// Shell, so they carry their own: a page on the canvas, a small brand mark at the
// top left, and a column as wide as the screen needs.

import type { ReactNode } from "react";
import { Link as RouterLink } from "react-router-dom";

import { Box, IconButton, Inline, Stack, Text } from "@studio-baeks/paper-ui";

import { AppShell, Glyph, TopBar } from "../../../../kit";
import { path } from "../../state";

// The app's mark and name; the mark leads to the 소개 screen.
export const Brand = () => (
  <Inline gap="sm" align="center">
    <IconButton as={RouterLink} to={path("/welcome")} size="xs" aria-label="Class Explorer 소개 화면"><Glyph name="graduation-cap" /></IconButton>
    <Stack minWidth={0}>
      <Text as="span" variant="subheading" truncate>Class Explorer</Text>
      <Text as="span" variant="caption" ink="tertiary" truncate>KSA 수업 탐색</Text>
    </Stack>
  </Inline>
);

// `wide` is the 1152 column of the 소개 screen; without it the column is a form's width, set lower on the page so the card
// is not hung from the top bar.
export const Frame = ({ end, wide = false, children }: { end?: ReactNode; wide?: boolean; children: ReactNode }) => (
  <AppShell
    kind="page"
    name="Class Explorer"
    top={
      <Stack align="center">
        <Box width="full" maxWidth="container.content">
          <TopBar start={<Brand />} end={end} />
        </Box>
      </Stack>
    }
  >
    <Stack align="center">
      <Box width="full" maxWidth={wide ? "container.content" : "measure.xs"} paddingY={wide ? undefined : "3xl"}>{children}</Box>
    </Stack>
  </AppShell>
);
