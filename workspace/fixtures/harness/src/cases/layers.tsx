import { Button, Field, Text } from "@studio-baeks/paper-ui";

// Cascade-layer precedence. public/consumer-first.css styles the consumer-* classes; each consumer element
// has a twin without the class, which keeps the package rule. The two captions differ only in ink.
export const LayersCase = () => (
  <>
    <Button className="consumer-button">Consumer button</Button>
    <Button>Package button</Button>
    <Field className="consumer-field" data-testid="consumer-field" aria-label="Consumer field" />
    <Field data-testid="package-field" aria-label="Package field" />
    <Text variant="caption" ink="base">Caption with base ink</Text>
    <Text variant="caption">Caption with its own ink</Text>
  </>
);
