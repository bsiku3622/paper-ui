import { memo } from "react";

import { Box, Button, Divider, Field, Inline, Stack, Surface, Text, Textarea } from "@studio-baeks/paper-ui";

import { Glyph, Menu } from "../../../kit";
import { Markdown } from "../content/Markdown";
import { MonoScope } from "../content/MonoScope";
import type { Doc } from "../data/types";

type Props = {
  doc: Doc;
  editing: boolean;
  onEdit: (id: string | null) => void;
  onChange: (id: string, patch: Partial<Pick<Doc, "title" | "markdown">>) => void;
  onAdd: (side: "left" | "right") => void;
};

export const DocSheet = memo(function DocSheet({ doc, editing, onEdit, onChange, onAdd }: Props) {
  const toggle = () => onEdit(editing ? null : doc.id);
  return (
    <Surface as={Stack} role="article" aria-label={doc.title} theme="light" fill="raised" border elevation="overlay" radius="sm" justify="between">
      <Stack>
        <Inline justify="between" paddingX="2xl" paddingY="md">
          <Inline gap="sm">
            <Glyph name="file-text" size="label" ink="tertiary" />
            <Text as="span" variant="label" strong={false} ink="tertiary">Markdown document</Text>
          </Inline>
          <Button size="sm" variant="muted" onClick={toggle}>{editing ? "완료" : "편집"}</Button>
        </Inline>
        <Divider />
        {editing ? (
          <Stack gap="md" padding="2xl">
            <Field aria-label="문서 제목" value={doc.title} onChange={(event) => onChange(doc.id, { title: event.target.value })} />
            <MonoScope>
              <Textarea
                aria-label="Markdown 내용"
                rows={28}
                fontSize="caption"
                spellCheck={false}
                value={doc.markdown}
                onChange={(event) => onChange(doc.id, { markdown: event.target.value })}
              />
            </MonoScope>
          </Stack>
        ) : (
          <Box paddingX="3xl" paddingY="3xl">
            <Markdown source={doc.markdown} />
          </Box>
        )}
      </Stack>
      <Stack>
        <Divider />
        <Inline justify="between" paddingX="2xl" paddingY="sm">
          <Text as="span" variant="label" strong={false} ink="tertiary" truncate>{doc.title}</Text>
          <Menu
            label={`${doc.title} 메뉴`}
            variant="muted"
            placement="top end"
            items={[
              { id: "edit", label: editing ? "완료" : "편집", glyph: "pencil", onSelect: toggle },
              { id: "divider", divider: true },
              { id: "left", label: "왼쪽에 문서 추가", glyph: "arrow-left", onSelect: () => onAdd("left") },
              { id: "right", label: "오른쪽에 문서 추가", glyph: "arrow-right", onSelect: () => onAdd("right") },
            ]}
          />
        </Inline>
      </Stack>
    </Surface>
  );
});
