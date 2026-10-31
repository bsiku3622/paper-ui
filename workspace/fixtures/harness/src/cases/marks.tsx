import { Badge, Button, Checkbox, Divider, Label, Radio, Spinner, Switch } from "@studio-baeks/paper-ui";
import type { CSSProperties, ReactNode } from "react";

const SIZES = ["sm", "md", "lg"] as const;
// Every mark stands in a room of its own, so the hit area of one never reaches into the next.
const ROOM: CSSProperties = { display: "flex", alignItems: "center", padding: 32 };
const Room = ({ children }: { children: ReactNode }) => <div style={ROOM}>{children}</div>;

// The selection marks in every size and every state, one to a room, and the display Atoms that draw themselves with a border or a ring
// (Divider, Spinner, Badge), and a Label. The states, forced-colors and shape specs read their computed style and hit-test them.
export const MarksCase = () => (
  <>
    <Room><button type="button" data-testid="before">Before</button></Room>
    {SIZES.map((size) => (
      <div key={size} data-size={size} style={{ display: "flex", flexWrap: "wrap" }}>
        <Room><Checkbox size={size} aria-label={`checkbox-${size}`} data-testid={`checkbox-${size}`} /></Room>
        <Room><Radio size={size} name={`size-${size}`} aria-label={`radio-${size}`} data-testid={`radio-${size}`} /></Room>
        <Room><Switch size={size} aria-label={`switch-${size}`} data-testid={`switch-${size}`} /></Room>
      </div>
    ))}
    <div style={{ display: "flex", flexWrap: "wrap" }}>
      <Room><Checkbox aria-label="checkbox-on" defaultChecked data-testid="checkbox-on" /></Room>
      <Room><Checkbox aria-label="checkbox-mixed" indeterminate data-testid="checkbox-mixed" /></Room>
      <Room><Radio aria-label="radio-on" name="on" defaultChecked data-testid="radio-on" /></Room>
      <Room><Switch aria-label="switch-on" defaultChecked data-testid="switch-on" /></Room>
    </div>
    <div style={{ display: "flex", flexWrap: "wrap" }}>
      <Room><Checkbox aria-label="checkbox-error" status="error" data-testid="checkbox-error" /></Room>
      <Room><Radio aria-label="radio-error" name="error" status="error" data-testid="radio-error" /></Room>
      <Room><Switch aria-label="switch-error" status="error" data-testid="switch-error" /></Room>
      <Room><Checkbox aria-label="checkbox-error-on" status="error" defaultChecked data-testid="checkbox-error-on" /></Room>
    </div>
    <div style={{ display: "flex", flexWrap: "wrap" }}>
      <Room><Checkbox aria-label="checkbox-disabled" disabled data-testid="checkbox-disabled" /></Room>
      <Room><Checkbox aria-label="checkbox-on-disabled" disabled defaultChecked data-testid="checkbox-on-disabled" /></Room>
      <Room><Radio aria-label="radio-disabled" name="disabled" disabled data-testid="radio-disabled" /></Room>
      <Room><Radio aria-label="radio-on-disabled" name="disabled-on" disabled defaultChecked data-testid="radio-on-disabled" /></Room>
      <Room><Switch aria-label="switch-disabled" disabled data-testid="switch-disabled" /></Room>
      <Room><Switch aria-label="switch-on-disabled" disabled defaultChecked data-testid="switch-on-disabled" /></Room>
    </div>
    <div dir="rtl" style={{ display: "flex", flexWrap: "wrap" }}>
      <Room><Switch aria-label="switch-rtl-off" data-testid="switch-rtl-off" /></Room>
      <Room><Switch aria-label="switch-rtl-on" defaultChecked data-testid="switch-rtl-on" /></Room>
    </div>
    <Room>
      <div style={{ width: 160 }}>
        <Divider data-testid="divider" />
        <Divider level="strong" data-testid="divider-strong" />
      </div>
      <div style={{ display: "flex", height: 48, gap: 16 }}>
        <Divider orientation="vertical" data-testid="divider-vertical" />
      </div>
      <Spinner data-testid="spinner" />
      <Badge data-testid="badge">Badge</Badge>
      <Badge variant="ghost" data-testid="badge-ghost">Ghost</Badge>
      <Label data-testid="label">Label</Label>
      <Button variant="hairline" selected data-testid="button-selected">Selected</Button>
    </Room>
  </>
);
