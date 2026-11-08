import { Button, Marker, Stack, Text, Inline } from "@studio-baeks/paper-ui";

import { Glyph } from "../../../kit";
import { Diagram } from "../content/Diagram";
import { useCoarsePointer } from "../state/coarse";
import { useGridphoto } from "../state/document";
import { DropStage } from "./DropStage";

export const Start = () => {
  const { addMock, loadSample } = useGridphoto();
  const coarse = useCoarsePointer();
  return (
    <DropStage>
      <Stack align="center" gap="xl" paddingY="3xl">
        <Diagram />
        <Stack align="center" gap="md">
          <Text as="h2" variant="title">
            종이를 찍으면 <Marker>스캔본</Marker>이 됩니다
          </Text>
          <Stack align="center">
            <Text variant="lead" ink="secondary">네 모서리를 찾아 직사각형에 딱 맞추고</Text>
            <Text variant="lead" ink="secondary">그림자를 지웁니다.</Text>
            <Text variant="lead" ink="secondary">여러 장을 모아 PDF로 저장합니다.</Text>
          </Stack>
        </Stack>
        <Inline gap="sm" justify="center" wrap>
          <Button size="lg" onClick={() => addMock(3)}>
            <Glyph name="image" />
            사진 선택
          </Button>
          {coarse ? (
            <Button size="lg" variant="hairline" onClick={() => addMock(1)}>
              <Glyph name="camera" />
              카메라로 찍기
            </Button>
          ) : null}
        </Inline>
        <Stack align="center" gap="xs">
          <Text variant="caption" ink="tertiary">격자나 줄이 있으면 그 선에 맞춰 곧게 폅니다.</Text>
          {coarse ? null : <Text variant="caption" ink="tertiary">이 창에 끌어다 놓거나 붙여 넣어도 됩니다.</Text>}
          <Text variant="caption" ink="tertiary">사진은 이 기기 안에만 두고 어디로도 보내지 않습니다.</Text>
        </Stack>
        <Button variant="ghost" size="sm" onClick={loadSample}>
          <Glyph name="files" />
          예시 문서 불러오기
        </Button>
      </Stack>
    </DropStage>
  );
};
