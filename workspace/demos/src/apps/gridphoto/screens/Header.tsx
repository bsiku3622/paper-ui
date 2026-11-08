import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";

import { Button, IconButton, Text } from "@studio-baeks/paper-ui";

import { Glyph, Menu, TopBar } from "../../../kit";
import { paths } from "../paths";
import { useGridphoto } from "../state/document";

export const Header = () => {
  const { pages, newDocument, addMock, loadSample } = useGridphoto();
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!confirming) return;
    const timer = window.setTimeout(() => setConfirming(false), 3500);
    return () => window.clearTimeout(timer);
  }, [confirming]);

  const clear = () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setConfirming(false);
    newDocument();
  };

  return (
    <TopBar
      start={
        <>
          <IconButton as={RouterLink} to={paths.home} size="xs" aria-label="GridPhoto 첫 화면"><Glyph name="scan-line" /></IconButton>
          <Text as="h1" variant="subheading">GridPhoto</Text>
          {pages.length > 0 ? <Text as="span" variant="caption" ink="tertiary" numeric>{pages.length}쪽</Text> : null}
        </>
      }
      end={
        <>
          {pages.length > 0 ? (
            <Button variant="ghost" size="sm" accent={confirming ? "error" : undefined} onClick={clear}>
              {confirming ? null : <Glyph name="x" />}
              {confirming ? `${pages.length}쪽을 지웁니다. 한 번 더 누르세요` : "새 문서"}
            </Button>
          ) : null}
          <Menu
            label="문서 메뉴"
            items={[
              { id: "add", label: "사진 추가", glyph: "image-plus", onSelect: () => addMock(3) },
              { id: "sample", label: "예시 문서 불러오기", glyph: "files", onSelect: loadSample },
            ]}
          />
        </>
      }
    />
  );
};
