import { Badge, Button, Checkbox, Field, Icon, IconButton, Radio, Select, Surface, Switch, Textarea } from "@studio-baeks/paper-ui";

import { SELECT_OPTIONS } from "./options.js";
import { ThemeBoxes } from "./theme.js";

const SIZES = ["sm", "md", "lg"] as const;

// Every control at every size, a Surface corner and the nested theme scopes, in one form: the shape spec
// measures them, overrides source variables on #shape-fixture and reads the form's data.
export const GeometryCase = () => (
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
    </form>
  </div>
);
