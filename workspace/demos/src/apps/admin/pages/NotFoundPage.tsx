import { Link as RouterLink } from "react-router-dom";

import { Button } from "@studio-baeks/paper-ui";

import { Empty } from "../../../kit";
import { BASE } from "../registry";

export const NotFoundPage = () => (
  <Empty
    glyph="compass"
    title="없는 주소입니다."
    description="주소를 다시 확인하거나 서비스 목록으로 돌아가주세요."
    action={<Button as={RouterLink} to={BASE} variant="hairline">서비스 목록으로</Button>}
  />
);
