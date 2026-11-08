// Form pieces the dialogs share: two columns when there is room, one when there is not; a switch with its words.

import type { ReactNode } from "react";

import { Grid, Inline, Switch, Text } from "@studio-baeks/paper-ui";

export const FormGrid = ({ children }: { children: ReactNode }) => (
  <Grid columns={{ base: "minmax(0, 1fr)", sm: "repeat(2, minmax(0, 1fr))" }} gap="lg" align="start">
    {children}
  </Grid>
);

// A switch with its words beside it, the whole row pressable.
export const Toggle = ({ label, description, checked, onChange, disabled }: { label: string; description?: ReactNode; checked: boolean; onChange: (checked: boolean) => void; disabled?: boolean }) => (
  <Inline as="label" justify="between" align="center" gap="lg">
    <Grid gap="xs">
      <Text as="span">{label}</Text>
      {description ? <Text as="span" variant="caption" ink="tertiary">{description}</Text> : null}
    </Grid>
    <Switch aria-label={label} checked={checked} disabled={disabled} onChange={(event) => onChange(event.currentTarget.checked)} />
  </Inline>
);
