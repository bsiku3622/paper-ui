// A document of the account on the home: a small page with its title on it, the title and the day it was last changed under
// it, and a button that takes it away.

import { IconButton, Inline, Stack, Surface, Text } from "@studio-baeks/paper-ui";

import { Glyph, SurfaceLink, formatDate, useFace } from "../../../kit";
import { Serif } from "../content/Serif";
import { documentPath } from "../lib/store";
import type { DocumentData } from "../lib/types";

export const DocumentCard = ({ note, onRemove }: { note: DocumentData; onRemove: () => void }) => {
  const face = useFace();
  const title = note.title || "제목 없는 문서";
  return (
    <Surface {...face} radius="md" overflow="hidden">
      <Stack>
        <SurfaceLink to={documentPath(note.id)} aria-label={`${title} 열기`} padding="lg">
          <Surface fill="canvas" border radius="sm" padding="lg" height="md" overflow="hidden">
            <Stack gap="md">
              <Glyph name="file-text" size="subheading" ink="secondary" />
              <Serif variant="lead" ink="primary" lines>{title}</Serif>
            </Stack>
          </Surface>
        </SurfaceLink>
        <Surface border="top" paddingX="lg" paddingY="md">
          <Inline justify="between" align="center" gap="sm">
            <Stack minWidth={0}>
              <Text as="h3" variant="body" strong truncate>{title}</Text>
              <Text as="p" variant="caption" ink="secondary">{formatDate(new Date(note.updatedAt), true)} 수정</Text>
            </Stack>
            <IconButton size="xs" variant="ghost" aria-label={`${note.title || "문서"} 삭제`} onClick={onRemove}>
              <Glyph name="trash-2" ink="tertiary" />
            </IconButton>
          </Inline>
        </Surface>
      </Stack>
    </Surface>
  );
};
