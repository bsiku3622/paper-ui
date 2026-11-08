// The zoom control at the bottom of the canvas: out, the level, in. A small face of its own floating over the canvas: xs buttons in
// xs padding, on a face whose corner is theirs plus the padding.

import { IconButton, Inline, Surface, Text } from "@studio-baeks/paper-ui";

import { Glyph } from "../../../kit";

export const ZoomBar = ({ zoom, onOut, onIn }: { zoom: number; onOut: () => void; onIn: () => void }) => {
  return (
    <Surface fill="raised" border elevation="overlay" radius="sm" padding="xs">
      <Inline gap="xs">
        <IconButton size="xs" variant="muted" aria-label="축소" onClick={onOut}><Glyph name="zoom-out" /></IconButton>
        <Inline paddingX="sm">
          <Text as="span" variant="label" strong={false} ink="secondary" numeric role="status">{Math.round(zoom * 100)}%</Text>
        </Inline>
        <IconButton size="xs" variant="muted" aria-label="확대" onClick={onIn}><Glyph name="zoom-in" /></IconButton>
      </Inline>
    </Surface>
  );
};
