// A colour as one small face (Chip), and as a small face that can be chosen (Swatch). The colour is the face's background, whatever the
// caller gives: the studio shows palette steps with it.

import { Box, Surface } from "@studio-baeks/paper-ui";

import * as s from "./studio.css";

export const Chip = ({ color, label }: { color: string; label: string }) => (
  <Surface className={s.chip} border radius="sm" role="img" aria-label={label} title={label} style={{ background: color }} />
);

export const Swatch = ({ color, label, chosen, onChoose }: { color: string; label: string; chosen: boolean; onChoose: () => void }) => (
  <Box as="button" type="button" className={s.swatch} aria-label={label} title={label} aria-pressed={chosen} onClick={onChoose} style={{ background: color }} />
);
