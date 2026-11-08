import type { ReactNode } from "react";

import { Grid } from "@studio-baeks/paper-ui";

import { Anchor, StatRow } from "../../../kit";
import { useAtLeast } from "../content/viewport";

export const Summary = ({ children, min }: { children: ReactNode; min?: string }) => {
  const wide = useAtLeast("md");
  return (
    <Anchor>
      {wide ? <StatRow min={min}>{children}</StatRow> : <Grid columns={2} gap="xl">{children}</Grid>}
    </Anchor>
  );
};
