import { Link as RouterLink } from "react-router-dom";

import { Button, Stack, Text } from "@studio-baeks/paper-ui";

import { Glyph } from "../../../kit";
import { Serif } from "../content/Serif";
import { useTitle } from "../lib/hooks";
import { useStore } from "../lib/store";

export const NotFound = ({ kind = "missing", reason, login = false }: { kind?: "missing" | "closed"; reason?: string; login?: boolean }) => {
  const { openAuth } = useStore();
  useTitle("문서를 열 수 없습니다 — Paperdown");
  return (
    <Stack as="main" id="main" align="center" justify="center" gap="lg" minHeight="viewport" padding="2xl">
      <Stack align="center" gap="xl">
        <Glyph name="file-text" size="subheading" ink="secondary" />
        <Serif as="h1" variant="title" strong>{kind === "missing" ? "페이지를 찾을 수 없습니다" : "문서를 열 수 없습니다"}</Serif>
        <Text as="p" ink="secondary">{reason ?? "주소를 확인하거나 홈에서 문서를 선택해주세요."}</Text>
      </Stack>
      {login ? <Button size="sm" onClick={() => openAuth()}>로그인 / 회원가입</Button> : null}
      <Button as={RouterLink} to="/paperdown" variant="hairline" size="sm">홈으로</Button>
    </Stack>
  );
};
