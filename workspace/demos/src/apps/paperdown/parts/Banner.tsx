// The bar an old address shows above the toolbar: the app has a new name and a new address, and the document can go along. The demo shows it on `/paperdown/documents/local?legacy`.

import { Button, Inline, Surface, Text } from "@studio-baeks/paper-ui";

import { Glyph } from "../../../kit";

export const Banner = ({ onMove }: { onMove: () => void }) => (
  <Surface fill="sunken" border="bottom" paddingX="xl" paddingY="sm">
    <Inline justify="center" align="center" gap="xl" wrap>
      <Text as="span" variant="label" strong={false} ink="secondary">
        여백이 <Text as="strong" variant="label" ink="inherit">Paperdown</Text>으로 새로워졌습니다.
      </Text>
      <Button variant="ghost" size="xs" onClick={onMove}>
        현재 문서와 함께 새 주소로 이동
        <Glyph name="arrow-up-right" />
      </Button>
    </Inline>
  </Surface>
);
