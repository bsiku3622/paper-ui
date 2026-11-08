// 없는 앨범 · 플레이리스트 · 아티스트로 들어왔을 때.

import { Link as RouterLink } from "react-router-dom";

import { Button } from "@studio-baeks/paper-ui";

import { Empty } from "../../../kit";
import { withJosa } from "../data/josa";

export const NotFound = ({ what }: { what: string }) => (
  <Empty
    glyph="search-x"
    title={`${withJosa(what, "을/를")} 찾을 수 없습니다`}
    description="주소가 바뀌었거나 지워진 것 같습니다."
    action={<Button as={RouterLink} to="/music" variant="hairline" size="sm">지금 듣기로</Button>}
  />
);
