import { Stack, Text } from "@studio-baeks/paper-ui";

export const SectionHeading = ({
  title,
  description,
  as = "h2",
  variant = "heading",
}: {
  title: string;
  description?: string;
  as?: "h2" | "h3";
  variant?: "heading" | "label";
}) => {
  const heading = <Text as={as} variant={variant}>{title}</Text>;
  return description === undefined ? heading : (
    <Stack gap="xs">
      {heading}
      <Text variant="body" ink="secondary">{description}</Text>
    </Stack>
  );
};
