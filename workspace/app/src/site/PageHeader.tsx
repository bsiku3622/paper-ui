// The head of a page: where it sits (group / name), its title and what it is for. Every Docs and Playground
// page opens with this one part.

import { Inline, Stack, Text } from "@studio-baeks/paper-ui";

export const PageHeader = ({ group, name, description }: { group: string; name: string; description?: string }) => (
  <Stack gap="xs">
    <Inline gap="xs" align="center">
      <Text variant="caption" ink="tertiary">{group}</Text>
      <Text variant="caption" ink="tertiary">/</Text>
      <Text variant="caption" ink="secondary">{name}</Text>
    </Inline>
    <Text as="h1" variant="title">{name}</Text>
    {description ? <Text variant="body" ink="secondary">{description}</Text> : null}
  </Stack>
);
