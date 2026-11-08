// What the original shows while a document is being fetched (Account.tsx's `loading`): a line of words in the middle of the
// window. The demo's notes are local, so it is shown for a moment only, when a note is opened.

import { Stack, Text } from "@studio-baeks/paper-ui";

export const Loading = () => (
  <Stack as="main" id="main" align="center" justify="center" minHeight="viewport" role="status">
    <Text as="p" variant="caption" ink="tertiary">문서를 불러오는 중…</Text>
  </Stack>
);
