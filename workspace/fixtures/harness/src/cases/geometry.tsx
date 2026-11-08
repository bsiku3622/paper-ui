import { Badge, Button, Checkbox, Field, Floating, Icon, IconButton, Inline, Radio, Select, Surface, Switch, Textarea } from "@studio-baeks/paper-ui";
import { CONTROL_SIZES, sourceVars } from "@studio-baeks/paper-ui/tokens";
import { useState } from "react";

import { SELECT_OPTIONS } from "./options.js";
import { ThemeBoxes } from "./theme.js";


const Panels = ({ id }: { id: string }) => (
  <>
    {(["popover", "modal"] as const).map((presentation) => (
      <Floating key={presentation}>
        <Floating.Trigger data-testid={`${id}-${presentation}-trigger`}>{`${id} ${presentation}`}</Floating.Trigger>
        <Floating.Content presentation={presentation} aria-label={`${id} ${presentation}`} data-testid={`${id}-${presentation}`}>
          <Button data-testid={`${id}-${presentation}-button`}>Button</Button>
          <Field aria-label={`${id}-${presentation}-field`} data-testid={`${id}-${presentation}-field`} />
          <Floating.Close>Close</Floating.Close>
        </Floating.Content>
      </Floating>
    ))}
  </>
);

export const GeometryCase = () => (
  <>
    <div id="shape-fixture">
      <form id="shape-form">
        <button type="button" id="before-select">Before</button>
        {CONTROL_SIZES.map((size) => (
          <div key={size} data-size={size}>
            <Button size={size} shape="rounded" data-testid={`button-${size}`}>Button</Button>
            <IconButton size={size} shape="rounded" aria-label={`icon-${size}`} data-testid={`icon-${size}`}>
              <Icon><path d="M12 4v16M4 12h16" /></Icon>
            </IconButton>
            <Field size={size} aria-label={`field-${size}`} data-testid={`field-${size}`} />
            <Field size={size} type="password" showPasswordToggle clearable defaultValue="secret" aria-label={`actions-${size}`} data-testid={`actions-${size}`} />
            <Select size={size} name={`select-${size}`} aria-label={`select-${size}`} data-testid={`select-${size}`}>{SELECT_OPTIONS}</Select>
            <Field size={size} shape="pill" aria-label={`field-pill-${size}`} data-testid={`field-pill-${size}`} />
            <Select size={size} shape="pill" aria-label={`select-pill-${size}`} data-testid={`select-pill-${size}`}>{SELECT_OPTIONS}</Select>
            <Textarea size={size} aria-label={`textarea-${size}`} />
            <Textarea size={size} rows={1} aria-label={`textarea-row-${size}`} />
            <Checkbox size={size} defaultChecked aria-label={`checkbox-${size}`} />
            <Radio size={size} defaultChecked aria-label={`radio-${size}`} />
            <Switch size={size} defaultChecked aria-label={`switch-${size}`} />
            <Badge size={size} data-testid={`badge-${size}`}>Badge</Badge>
            <Badge size={size} shape="rounded" data-testid={`badge-rounded-${size}`}>Badge</Badge>
          </div>
        ))}
        <Surface radius="sm" data-testid="surface-corner">Surface</Surface>
        <Inline gap="md" data-testid="gap-md"><span>A</span><span>B</span></Inline>
        <ThemeBoxes />
        <Panels id="inside" />
      </form>
    </div>
    <Panels id="outside" />
  </>
);

const REGION = sourceVars({ shape: { control: { height: { md: "40px" } }, space: { lg: "24px", sm: "12px" } } });
const OTHER_REGION = sourceVars({ shape: { control: { height: { md: "48px" } }, space: { lg: "32px", sm: "20px" } } });

export const CarryCase = () => {
  const params = new URLSearchParams(window.location.search);
  const [mounted, setMounted] = useState(params.get("mount") !== "press");
  const below = params.get("trigger") === "below";
  const trigger = <Floating.Trigger data-testid="trigger">Trigger</Floating.Trigger>;
  const panel = mounted && (
    <Floating defaultOpen>
      {!below && trigger}
      <Floating.Content presentation={params.get("presentation") === "modal" ? "modal" : "popover"} aria-label="panel" data-testid="panel">
        <Button data-testid="button">Button</Button>
        <Field aria-label="field" data-testid="field" />
      </Floating.Content>
      {below && trigger}
    </Floating>
  );
  const inside = params.get("where") === "inside";
  return (
    <>
      <div style={REGION}>{inside && panel}</div>
      {/* WebKit's native button height is fractional, so this row is a whole number of pixels. */}
      <div style={{ ...OTHER_REGION, height: 32 }}><button type="button" data-testid="mount" onClick={() => setMounted(true)}>Mount</button></div>
      {!inside && panel}
    </>
  );
};
