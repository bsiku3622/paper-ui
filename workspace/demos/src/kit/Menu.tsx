import { useState, type ReactNode } from "react";

import { Button, Divider, Floating, IconButton, Inline, Stack, Surface, Text } from "@studio-baeks/paper-ui";
import type { ControlSize, Variant } from "@studio-baeks/paper-ui/tokens";

import { Glyph, type GlyphName } from "./Glyph";

export type MenuItem =
  | { id: string; label: string; glyph?: GlyphName; onSelect?: () => void; danger?: boolean; disabled?: boolean; hint?: string; checked?: boolean }
  | { id: string; divider: true }
  | { id: string; heading: string };

export type MenuProps = {
  label: string;
  items: readonly MenuItem[];
  glyph?: GlyphName;
  iconOnly?: boolean;
  buttonLabel?: ReactNode;
  variant?: Exclude<Variant, "solid" | "soft">;
  size?: ControlSize;
  placement?: "bottom start" | "bottom end" | "top start" | "top end";
};

export const Menu = ({ label, items, glyph = "ellipsis", iconOnly = true, buttonLabel, variant = "ghost", size = "sm", placement = "bottom end" }: MenuProps) => {
  const [open, setOpen] = useState(false);
  return (
    <Floating open={open} onOpenChange={setOpen}>
      {iconOnly
        ? <IconButton as={Floating.Trigger} variant={variant} size={size} aria-label={label}><Glyph name={glyph} /></IconButton>
        : <Button as={Floating.Trigger} variant={variant} size={size}>{glyph !== "ellipsis" ? <Glyph name={glyph} /> : null}{buttonLabel ?? label}<Glyph name="chevron-down" /></Button>}
      <Floating.Content as={Surface} fill="raised" border radius="md" padding="xs" placement={placement} aria-label={label}>
        <Stack gap="xs" minWidth="sm">
          {items.map((item) => {
            if ("divider" in item) return <Divider key={item.id} />;
            if ("heading" in item) return <Text key={item.id} as="span" variant="caption" strong ink="tertiary">{item.heading}</Text>;
            return (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                fontSize="body"
                fullWidth
                justify="between"
                disabled={item.disabled}
                accent={item.danger ? "error" : undefined}
                onClick={() => {
                  item.onSelect?.();
                  setOpen(false);
                }}
              >
                <Inline as="span" gap="sm" align="center">
                  {item.glyph ? <Glyph name={item.glyph} /> : null}
                  {item.label}
                </Inline>
                {item.checked ? <Glyph name="check" /> : item.hint ? <Text as="span" variant="caption" ink="tertiary">{item.hint}</Text> : null}
              </Button>
            );
          })}
        </Stack>
      </Floating.Content>
    </Floating>
  );
};
