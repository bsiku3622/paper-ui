import { Badge, Button, Checkbox, Field, Floating, Icon, IconButton, Radio, Select, Surface, Switch, Textarea } from "@studio-baeks/paper-ui";
import { useState, type CSSProperties } from "react";

import { SELECT_OPTIONS } from "./options.js";
import { ThemeBoxes } from "./theme.js";

const SIZES = ["sm", "md", "lg"] as const;

// A popover and a dialog, each holding a Button and a Field, that open from where the Trigger stands.
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

// Every control at every size, a Surface corner and the nested theme scopes, in one form: the shape spec
// measures them, overrides source variables on #shape-fixture and reads the form's data. A popover and a dialog open from
// inside the form and from outside it.
export const GeometryCase = () => (
  <>
    <div id="shape-fixture">
      <form id="shape-form">
        <button type="button" id="before-select">Before</button>
        {SIZES.map((size) => (
          <div key={size} data-size={size}>
            <Button size={size} data-testid={`button-${size}`}>Button</Button>
            <IconButton size={size} aria-label={`icon-${size}`} data-testid={`icon-${size}`}>
              <Icon><path d="M12 4v16M4 12h16" /></Icon>
            </IconButton>
            <Field size={size} aria-label={`field-${size}`} data-testid={`field-${size}`} />
            <Select size={size} name={`select-${size}`} aria-label={`select-${size}`}>{SELECT_OPTIONS}</Select>
            <Textarea size={size} aria-label={`textarea-${size}`} />
            <Checkbox size={size} defaultChecked aria-label={`checkbox-${size}`} />
            <Radio size={size} defaultChecked aria-label={`radio-${size}`} />
            <Switch size={size} defaultChecked aria-label={`switch-${size}`} />
            <Badge size={size} data-testid={`badge-${size}`}>Badge</Badge>
          </div>
        ))}
        <Surface radius="sm" data-testid="surface-corner">Surface</Surface>
        <ThemeBoxes />
        <Panels id="inside" />
      </form>
    </div>
    <Panels id="outside" />
  </>
);

const REGION = { "--pui-shape-control-height-md": "40px", "--pui-shape-space-lg": "24px", "--pui-shape-space-sm": "12px" } as CSSProperties;
const OTHER_REGION = { "--pui-shape-control-height-md": "48px", "--pui-shape-space-lg": "32px", "--pui-shape-space-sm": "20px" } as CSSProperties;

// One panel already open when it mounts, so its Trigger's ref does not exist yet while it first renders. ?where= stands it
// in an overriding region or out of it, ?presentation= picks the panel, ?trigger=below writes the Trigger under its Content,
// and ?mount=press holds it back for a press that leaves the focus in a second overriding region. The press row has a whole-pixel
// height: WebKit's native button is fractional, and a panel placed on whole pixels would read off a Trigger below it by that fraction.
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
      <div style={{ ...OTHER_REGION, height: 32 }}><button type="button" data-testid="mount" onClick={() => setMounted(true)}>Mount</button></div>
      {!inside && panel}
    </>
  );
};
