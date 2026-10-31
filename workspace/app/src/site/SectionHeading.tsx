// The head of a section of a page: its title, and a line on what it shows. `heading` is the section titles of the
// Foundations pages, `label` the quiet titles of the Overview. The tag is the page's outline, so it is chosen by the page.

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
