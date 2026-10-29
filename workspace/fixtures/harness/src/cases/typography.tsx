import { Badge, Button, Field, FormField, Label, Select, Text, Textarea } from "@studio-baeks/paper-ui";

import { SELECT_OPTIONS } from "./options.js";

// The Typography surfaces the typography spec reads: controls at their preset and with the fontSize
// escape, the roles and families of Text, and a form field's parts.
export const TypographyCase = () => (
  <div id="typography-fixture">
    <Button data-testid="button-md">Button</Button>
    <Button variant="soft" data-testid="button-medium">Button</Button>
    <Button fontSize="body" data-testid="button-body">Button</Button>
    <Button fontSize="label" data-testid="button-label">Button</Button>
    <Badge data-testid="badge-md">Badge</Badge>
    <Badge fontSize="body" data-testid="badge-body">Badge</Badge>
    <Field aria-label="field-md" data-testid="field-md" />
    <Field fontSize="body" aria-label="field-body" data-testid="field-body" />
    <Field numeric aria-label="field-numeric" data-testid="field-numeric" />
    <Select aria-label="select-md">{SELECT_OPTIONS}</Select>
    <Select fontSize="body" aria-label="select-body">{SELECT_OPTIONS}</Select>
    <Textarea aria-label="textarea-md" />
    <Textarea fontSize="body" aria-label="textarea-body" />
    <Text variant="hero" data-testid="text-hero">복잡한 화면도 단정하게</Text>
    <Text variant="display" data-testid="text-display">복잡한 화면도 단정하게</Text>
    <Text data-testid="text-korean">복잡한 화면을 더 명확하게 보여주는 단정한 시스템입니다.</Text>
    <Text family="mono" data-testid="text-mono">WEB24_verylongidentifier_withoutbreaks</Text>
    <Text variant="caption" numeric data-testid="text-numeric">v0.1.0 1,234</Text>
    <Label data-testid="label">Name</Label>
    <FormField label="Email" description="Help" error="Wrong" invalid>
      {({ controlProps }) => <Field {...controlProps} />}
    </FormField>
  </div>
);
