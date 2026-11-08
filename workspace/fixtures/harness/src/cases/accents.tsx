import { Badge, Button } from "@studio-baeks/paper-ui";
import { ACCENTS, VARIANTS } from "@studio-baeks/paper-ui/tokens";

export const AccentsCase = () => (
  <div id="accents-fixture">
    {ACCENTS.flatMap((accent) =>
      VARIANTS.map((variant) => (
        <Button key={`${accent}-${variant}`} accent={accent} variant={variant} data-testid={`accent-${accent}-${variant}`}>
          {accent} {variant}
        </Button>
      )),
    )}
    <Badge accent="error" variant="soft" dot data-testid="badge-dot">error</Badge>
  </div>
);
