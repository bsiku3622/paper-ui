import { useRef, useState } from "react";

import { Button, Stack, Text } from "@studio-baeks/paper-ui";

import { useToast } from "../../../../kit";
import type { PeerRow } from "../../data/types";
import { messageOf } from "../../lib/errors";
import { useWireGuardApi } from "../../store/api";
import { Dialog } from "../../ui/Dialog";
import { Alert } from "../../ui/Parts";

export const RemovePeerDialog = ({ peer, onClose, onDone }: { peer: Pick<PeerRow, "name" | "allowedIp" | "publicKey"> | null; onClose: () => void; onDone?: () => void }) => {
  const { removePeer } = useWireGuardApi();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const last = useRef(peer);
  if (peer) last.current = peer;
  const shown = peer ?? last.current;

  const close = () => {
    setError(null);
    onClose();
  };

  const revoke = async () => {
    if (!shown) return;
    setBusy(true);
    setError(null);
    try {
      await removePeer(shown.publicKey);
      toast("연결을 해제했습니다");
      setBusy(false);
      onDone?.();
      onClose();
    } catch (reason) {
      setError(messageOf(reason, "peer를 해제하지 못했습니다."));
      setBusy(false);
    }
  };

  return (
    <Dialog
      open={peer !== null}
      onClose={close}
      title="peer 연결을 해제할까요?"
      size="sm"
      busy={busy}
      footer={
        <>
          <Button variant="ghost" disabled={busy} onClick={close}>취소</Button>
          <Button accent="error" loading={busy} loadingLabel="처리 중" onClick={() => void revoke()}>연결 해제</Button>
        </>
      }
    >
      <Stack gap="lg">
        <Stack gap="xs">
          <Text as="p" strong>{shown?.name} · {shown?.allowedIp}</Text>
          <Text as="p" variant="caption" ink="secondary">서버 설정과 현재 연결에서 peer를 제거합니다. 다시 연결하려면 public key를 새로 등록해야 합니다.</Text>
        </Stack>
        {error ? <Alert>{error}</Alert> : null}
      </Stack>
    </Dialog>
  );
};
