import { Stack, Text } from "@studio-baeks/paper-ui";

export const Loading = () => (
  <Stack as="main" id="main" align="center" justify="center" minHeight="viewport" role="status">
    <Text as="p" variant="caption" ink="tertiary">문서를 불러오는 중…</Text>
  </Stack>
);
