import { Inline, Stack, Text } from "@studio-baeks/paper-ui";

export const PageHeader = ({ group, name, description }: { group: string; name: string; description?: string }) => (
  <Stack gap="sm">
    <Inline gap="xs" align="center">
      <Text variant="caption" ink="tertiary">{group}</Text>
      <Text variant="caption" ink="tertiary">/</Text>
      <Text variant="caption" ink="secondary">{name}</Text>
    </Inline>
    <Text as="h1" variant="display" strong>{name}</Text>
    {description ? <Text variant="lead" ink="secondary">{description}</Text> : null}
  </Stack>
);
