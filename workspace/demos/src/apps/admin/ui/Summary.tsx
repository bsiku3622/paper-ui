// Summary — a page's main numbers in the kit's Anchor. On a wide window they are the kit's StatRow, a strip with a rule
// between each; on a phone a StatRow that wraps leaves a rule at the start of the second line, so the same Stats are
// laid in a two-column grid there instead.

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
