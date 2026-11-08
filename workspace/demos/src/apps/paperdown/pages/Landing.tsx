import { Link as RouterLink } from "react-router-dom";

import { Box, Button, Grid, Stack, Surface, Text, Inline } from "@studio-baeks/paper-ui";

import { Glyph, SurfaceLink } from "../../../kit";
import { Serif } from "../content/Serif";
import { useMedia, useTitle } from "../lib/hooks";
import { documentPath, useStore } from "../lib/store";
import { HomeFrame } from "../parts/Shell";

export const Landing = () => {
  const { guest, openAuth } = useStore();
  const wide = useMedia("(min-width: 768px)");
  useTitle("Paperdown — 내 문서");
  return (
    <HomeFrame end={<Button variant="hairline" size="sm" onClick={() => openAuth()}>로그인 / 회원가입</Button>}>
      <Stack gap="3xl">
        <Inline justify="between" align="center" gap="xl" wrap>
          <Stack gap="xs" minWidth={0}>
            <Serif as="h1" variant="display" strong>생각을 담아두는 곳.</Serif>
            <Text as="p" ink="secondary">종이 위에 쓰듯 편집하고, 원하는 모습으로 남기세요.</Text>
          </Stack>
          <Button as={RouterLink} to={documentPath("local")}>
            <Glyph name="plus" />
            편집기 열기
          </Button>
        </Inline>
        <Stack gap="xl">
          <Inline gap="md" align="baseline">
            <Text as="h2" variant="subheading">이 기기의 문서</Text>
            <Text as="span" ink="tertiary" numeric>1</Text>
          </Inline>
          <Grid columns={{ base: "minmax(0, 1fr)", md: "minmax(0, 1fr) minmax(0, 1fr)" }} gap="xl" align="stretch">
            <SurfaceLink to={documentPath("local")} card padding="2xl">
              <Stack justify="center" height="full">
                <Inline gap="xl" align="center" justify="between">
                  <Inline gap="xl" align="center" minWidth={0}>
                    <Glyph name="file-text" size="subheading" ink="secondary" />
                    <Stack gap="xs" minWidth={0}>
                      <Serif as="h3" variant="heading" strong={false}>{guest.title || "제목 없는 문서"}</Serif>
                      <Text as="p" variant="caption" ink="secondary">이 브라우저에 저장된 문서 이어쓰기</Text>
                    </Stack>
                  </Inline>
                  <Glyph name="arrow-up-right" size="subheading" />
                </Inline>
              </Stack>
            </SurfaceLink>
            <Surface border={wide ? "start" : "top"} paddingX={wide ? "2xl" : undefined} paddingY="xl">
              <Stack gap="md" align="start">
                <Text as="h3" variant="subheading">문서를 한곳에 모아두세요.</Text>
                <Text as="p" ink="secondary">계정에 여러 문서를 저장하고 다른 기기에서도 이어 쓸 수 있습니다.</Text>
                <Box paddingY="xs">
                  <Button variant="hairline" size="sm" onClick={() => openAuth()}>로그인 / 회원가입</Button>
                </Box>
              </Stack>
            </Surface>
          </Grid>
        </Stack>
      </Stack>
    </HomeFrame>
  );
};
