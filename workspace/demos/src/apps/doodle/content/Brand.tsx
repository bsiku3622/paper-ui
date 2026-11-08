// The "d" mark beside the name. A logo is a picture, not chrome: it is Paper's solid face on a control's square, so it takes
// its size, corner and ink from Paper.

import { Control, Paint } from "@studio-baeks/paper-ui";

export const BrandMark = () => (
  <Control as={Paint} accent="primary" variant="solid" size="xs" anatomy="icon" fontSize="body" strong aria-hidden>d</Control>
);
