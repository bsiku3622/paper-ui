import { Box, Button, Field, Paint, Text } from "@studio-baeks/paper-ui";

// Cascade-layer precedence. public/consumer-first.css styles the consumer-* classes; each consumer element
// has a twin without the class, which keeps the package rule. The two captions differ only in ink, and the last takes the ink of the face around it.
export const LayersCase = () => (
  <>
    <Button className="consumer-button">Consumer button</Button>
    <Button>Package button</Button>
    <Field className="consumer-field" data-testid="consumer-field" aria-label="Consumer field" />
    <Field data-testid="package-field" aria-label="Package field" />
    <Box className="consumer-box" width="md" data-testid="consumer-box" />
    <Box width="md" data-testid="package-box" />
    <Text variant="caption" ink="primary">Caption with primary ink</Text>
    <Text variant="caption">Caption with its own ink</Text>
    <Paint accent="error" variant="solid" data-testid="ink-face"><Text variant="caption" ink="inherit">Caption on a face</Text></Paint>
  </>
);
