import { Button, IconButton, Inline, Surface, Text } from "@studio-baeks/paper-ui";

import { Glyph } from "../../../kit";

export type CloudState = "error" | "expired" | "conflict" | "offline";

export const parseCloud = (value: string | null): CloudState | null =>
  value === "error" || value === "expired" || value === "conflict" || value === "offline" ? value : null;

export const CLOUD_LABEL: Record<CloudState, string> = {
  error: "이 기기에 보관됨 · 재시도",
  expired: "이 기기에 보관됨 · 재시도",
  conflict: "다른 기기와 변경 충돌",
  offline: "오프라인 · 초안 보관됨",
};

export const CloudBar = ({ state, onRetry, onLogin, onKeepDraft, onReload, onClose }: {
  state: CloudState;
  onRetry: () => void;
  onLogin: () => void;
  onKeepDraft: () => void;
  onReload: () => void;
  onClose: () => void;
}) => {
  if (state === "offline") return null;
  const conflict = state === "conflict";
  return (
    <Surface fill="raised" border="bottom" paddingX="xl" paddingY="md" role={conflict ? "alert" : "status"}>
      <Inline align="center" gap="md" wrap>
        <Text as="span" variant="caption">
          {conflict
            ? "다른 기기의 변경을 덮어쓰지 않았습니다. 현재 초안을 새 노트로 보관하거나 서버 문서를 불러오세요."
            : state === "expired"
              ? "로그인이 필요합니다."
              : "서버에 연결하지 못했습니다. 초안은 이 기기에 보관됩니다."}
        </Text>
        {conflict ? (
          <>
            <Button variant="ghost" size="xs" onClick={onKeepDraft}>
              <Glyph name="copy" />
              초안으로 새 노트
            </Button>
            <Button variant="ghost" size="xs" onClick={onReload}>서버 문서 불러오기</Button>
          </>
        ) : (
          <Button variant="ghost" size="xs" onClick={state === "expired" ? onLogin : onRetry}>
            <Glyph name="refresh-cw" />
            {state === "expired" ? "다시 로그인" : "재시도"}
          </Button>
        )}
        {conflict ? null : (
          <IconButton variant="ghost" size="xs" aria-label="알림 닫기" onClick={onClose}>
            <Glyph name="x" />
          </IconButton>
        )}
      </Inline>
    </Surface>
  );
};
