// Toast — a short notice at the bottom of the screen. The live region is mounted from the start and only its content
// changes, so a reader says each notice; a region inserted together with its text may not be read. The visible
// plate stands at the toast tier. The package has no toast, so this is the app's composition of LiveRegion and Surface.

import { LiveRegion, Surface, Text } from "@studio-baeks/paper-ui";

import { CheckIcon } from "./icons";
import * as s from "./toast.css";

export const Toast = ({ message }: { message: string }) => (
  <LiveRegion>
    {message ? (
      <Surface fill="raised" border radius="md" elevation="toast" className={s.toast}>
        <CheckIcon ink="success" />
        <Text variant="body">{message}</Text>
      </Surface>
    ) : null}
  </LiveRegion>
);
