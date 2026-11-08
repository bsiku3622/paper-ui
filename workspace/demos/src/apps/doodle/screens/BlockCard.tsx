// A text box, a picture or a video put on the canvas: a small card with its kind in the corner ("Text", "Image", "Video"), and a
// delete button while it is chosen. The picture is drawn from its address (Art), because nothing here calls out to the network;
// the prototype pointed an <img> or a player at the address.

import { memo } from "react";

import { Control, Divider, IconButton, Inline, Link, Stack, Surface, Text, Textarea } from "@studio-baeks/paper-ui";

import { Art, Glyph, type GlyphName } from "../../../kit";
import type { Block } from "../data/types";

const KIND: Record<Block["kind"], { label: string; glyph: GlyphName; alt: string }> = {
  text: { label: "Text", glyph: "type", alt: "텍스트 상자" },
  image: { label: "Image", glyph: "image", alt: "캔버스 이미지" },
  video: { label: "Video", glyph: "video", alt: "캔버스 동영상" },
};

type Props = {
  block: Block;
  selected: boolean;
  onChange: (id: string, content: string) => void;
  onDelete: (id: string) => void;
};

export const BlockCard = memo(function BlockCard({ block, selected, onChange, onDelete }: Props) {
  const kind = KIND[block.kind];
  return (
    <Surface as={Stack} role="article" aria-label={`${kind.label} 블록`} fill="raised" border elevation={selected ? undefined : "overlay"} radius="sm" overflow="hidden">
      <Inline justify="between" paddingX="md">
        <Text as="span" variant="label" strong={false} ink="tertiary">{kind.label}</Text>
        {/* A chosen box swaps its kind's mark for a delete button of the same size, so the top line does not jump. */}
        {selected ? (
          <IconButton size="xs" variant="ghost" aria-label="블록 삭제" onClick={() => onDelete(block.id)}><Glyph name="x" /></IconButton>
        ) : (
          <Control as="span" size="xs" anatomy="icon" aria-hidden><Glyph name={kind.glyph} ink="tertiary" /></Control>
        )}
      </Inline>
      <Divider />
      {block.kind === "text" ? (
        <Textarea
          aria-label={kind.alt}
          variant="ghost"
          rows={Math.max(3, block.content.split("\n").length + 1)}
          value={block.content}
          onChange={(event) => onChange(block.id, event.target.value)}
        />
      ) : null}
      {block.kind === "image" ? <Art seed={block.content} kind="photo" ratio="4 / 3" radius="none" label={kind.alt} /> : null}
      {block.kind === "video" ? (
        <Stack>
          <Art seed={block.content} kind="photo" ratio="16 / 9" radius="none" label={kind.alt} />
          <Inline paddingX="md" paddingY="sm">
            <Link href={block.content} target="_blank" rel="noreferrer" underline="hover">동영상 열기<Glyph name="arrow-down-right" /></Link>
          </Inline>
        </Stack>
      ) : null}
    </Surface>
  );
});
