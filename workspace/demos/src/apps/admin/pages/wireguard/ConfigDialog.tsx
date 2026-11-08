// 연결 설정: what the device needs in its WireGuard app. Shown right after a peer is added, and from the peer's page. The
// server's key and address are made up; the line for the device's own private key is left for the person to fill.

import { useRef } from "react";

import { Button, Stack, Surface, Text } from "@studio-baeks/paper-ui";

import { Glyph } from "../../../../kit";
import type { PeerRow } from "../../data/types";
import { useCopy } from "../../lib/hooks";
import { Dialog } from "../../ui/Dialog";
import { Hint, Note } from "../../ui/Parts";
import { peerConfig } from "./parts";

export const ConfigDialog = ({ peer, onClose }: { peer: Pick<PeerRow, "name" | "allowedIp"> | null; onClose: () => void }) => {
  const { copied, copy } = useCopy();
  const last = useRef(peer);
  if (peer) last.current = peer;
  const shown = peer ?? last.current;
  const lines = shown ? peerConfig(shown) : [];
  return (
    <Dialog
      open={peer !== null}
      onClose={onClose}
      title="연결 설정"
      description={shown ? `${shown.name} · ${shown.allowedIp}` : undefined}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>닫기</Button>
          <Button onClick={() => void copy(lines.join("\n"), "config")}>
            {copied === "config" ? <Glyph name="check" /> : <Glyph name="copy" />}
            {copied === "config" ? "복사됨" : "설정 복사"}
          </Button>
        </>
      }
    >
      <Stack gap="lg">
        <Text as="p" ink="secondary">기기의 WireGuard 앱에서 새 터널을 만들고, 아래 내용을 붙여 넣어주세요.</Text>
        <Surface fill="sunken" radius="md" padding="md">
          <Stack role="group" aria-label="WireGuard 설정">
            {lines.map((line, index) => (
              <Text key={index} as="span" variant="caption" family="mono" ink={line.startsWith("[") ? "tertiary" : "primary"}>{line || " "}</Text>
            ))}
          </Stack>
        </Surface>
        <Note glyph="key-round" live={false}>PrivateKey 줄은 이 기기에서 만든 private key로 바꿔 주세요. 서버는 private key를 알지 못합니다.</Note>
        <Hint>이 주소와 키는 데모용으로 만든 값입니다.</Hint>
      </Stack>
    </Dialog>
  );
};
