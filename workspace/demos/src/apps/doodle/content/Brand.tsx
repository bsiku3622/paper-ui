import { Control, Paint } from "@studio-baeks/paper-ui";

import { tilt } from "./brand.css";

export const BrandMark = () => (
  <Control as={Paint} accent="primary" variant="solid" size="xs" anatomy="icon" fontSize="body" strong aria-hidden className={tilt}>d</Control>
);
