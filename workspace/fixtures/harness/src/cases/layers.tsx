import { Box, Button, Field, Paint, Text } from "@studio-baeks/paper-ui";

export const LayersCase = () => (
  <>
    <Button className="consumer-button">Consumer button</Button>
    <Button>Package button</Button>
    <Field className="consumer-field" variant="hairline" data-testid="consumer-field" aria-label="Consumer field" />
    <Field variant="hairline" data-testid="package-field" aria-label="Package field" />
    <Box className="consumer-box" width="md" data-testid="consumer-box" />
    <Box width="md" data-testid="package-box" />
    <Text variant="caption" ink="primary">Caption with primary ink</Text>
    <Text variant="caption">Caption with its own ink</Text>
    <Paint accent="error" variant="solid" data-testid="ink-face"><Text variant="caption" ink="inherit">Caption on a face</Text></Paint>
  </>
);
