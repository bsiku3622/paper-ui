import { Badge, Button, Field, Icon, IconButton, PaperProvider, SegmentControl, Select, Textarea } from "@studio-baeks/paper-ui";
import { CONTROL_SIZES } from "@studio-baeks/paper-ui/tokens";

import { SELECT_OPTIONS } from "./options.js";

const SHAPES = ["sharp", "small"] as const;

export const ShapesCase = () => (
  <div id="shapes-fixture">
    {CONTROL_SIZES.map((size) => SHAPES.map((shape) => (
      <div key={`${size}-${shape}`} data-size={size}>
        <Button size={size} shape={shape} data-testid={`button-${shape}-${size}`}>Button</Button>
        <IconButton size={size} shape={shape} aria-label={`icon-${shape}-${size}`} data-testid={`icon-${shape}-${size}`}>
          <Icon><path d="M12 4v16M4 12h16" /></Icon>
        </IconButton>
        <Field size={size} shape={shape} clearable defaultValue="value" aria-label={`field-${shape}-${size}`} data-testid={`field-${shape}-${size}`} />
        <Select size={size} shape={shape} aria-label={`select-${shape}-${size}`} data-testid={`select-${shape}-${size}`}>{SELECT_OPTIONS}</Select>
        <Textarea size={size} shape={shape} aria-label={`textarea-${shape}-${size}`} />
        <Badge size={size} shape={shape} data-testid={`badge-${shape}-${size}`}>Badge</Badge>
        <SegmentControl size={size} shape={shape} defaultValue="a" aria-label={`segment-${shape}-${size}`} data-testid={`segment-${shape}-${size}`}>
          <SegmentControl.Item value="a">A</SegmentControl.Item>
          <SegmentControl.Item value="b">B</SegmentControl.Item>
        </SegmentControl>
      </div>
    )))}
    <PaperProvider storageKey={null} controlShape="small">
      <Button data-testid="app-button">Button</Button>
      <Button shape="pill" data-testid="app-button-pill">Button</Button>
      <Field aria-label="app-field" data-testid="app-field" />
      <Textarea aria-label="app-textarea" />
    </PaperProvider>
    <PaperProvider storageKey={null} controlShape="pill">
      <Textarea aria-label="app-pill-textarea" />
    </PaperProvider>
  </div>
);
