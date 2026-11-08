// 내 기기 추가 · 친구 기기 추가: a name and the public key the device made in its WireGuard app. A friend's address can be
// picked by its last number; otherwise the next free one is given. A device's key is checked the way the server checks it:
// 44 characters of base64. "데모 키 만들기" writes one that starts with DEMO, so no real key is ever needed here.

import { useEffect, useRef, useState, type FormEvent } from "react";

import { Button, Field, FormField, Stack } from "@studio-baeks/paper-ui";

import { Glyph } from "../../../../kit";
import type { PeerRow } from "../../data/types";
import { nextHost } from "../../data/wireguard";
import { messageOf } from "../../lib/errors";
import { fakeKey } from "../../lib/fake";
import { useWireGuardApi, type PeerKindInput } from "../../store/api";
import { useAdmin } from "../../store/store";
import { Dialog } from "../../ui/Dialog";
import { Alert } from "../../ui/Parts";

export const AddPeerDialog = ({ kind, onClose, onAdded }: { kind: PeerKindInput | null; onClose: () => void; onAdded: (row: PeerRow) => void }) => {
  const { peers } = useAdmin();
  const { addPeer } = useWireGuardApi();
  const [name, setName] = useState("");
  const [publicKey, setPublicKey] = useState("");
  const [host, setHost] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const first = useRef<HTMLInputElement>(null);
  // The dialog keeps the kind it opened with while it fades out.
  const last = useRef<PeerKindInput>("personal");
  if (kind) last.current = kind;
  const shown = kind ?? last.current;

  const device = shown === "personal";
  const prefix = device ? "10.20.10." : "10.20.100.";
  const nextAddress = nextHost(peers, prefix, device ? 2 : 11);
  const requestedHost = !device && host.trim() ? Number(host) : undefined;
  const validHost = requestedHost === undefined || (Number.isInteger(requestedHost) && requestedHost >= 1 && requestedHost <= 254);
  const assigned = requestedHost ?? nextAddress;

  useEffect(() => {
    if (kind) {
      setName("");
      setPublicKey("");
      setHost("");
      setError(null);
    }
  }, [kind]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const row = await addPeer(shown, name, publicKey.trim(), requestedHost);
      onAdded(row);
    } catch (reason) {
      setError(messageOf(reason, "peer를 등록하지 못했습니다."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog
      open={kind !== null}
      onClose={onClose}
      title={device ? "내 기기 추가" : "친구 기기 추가"}
      description="기기의 WireGuard 앱에서 만든 public key로 등록합니다."
      size="md"
      busy={busy}
      focusRef={first}
      footer={
        <>
          <Button variant="ghost" disabled={busy} onClick={onClose}>취소</Button>
          <Button type="submit" form={`wireguard-registration-${shown}`} loading={busy} loadingLabel="저장 중" disabled={assigned === null || !validHost}>
            {assigned === null ? "주소 없음" : `추가 · ${prefix}${assigned}`}
          </Button>
        </>
      }
    >
      <Stack as="form" id={`wireguard-registration-${shown}`} gap="lg" paddingY="xs" onSubmit={(event: FormEvent<HTMLFormElement>) => void submit(event)}>
        <FormField label="기기 이름" required>
          <Field ref={first} value={name} onChange={(event) => setName(event.currentTarget.value)} maxLength={48} autoComplete="off" placeholder={device ? "예: MacBook" : "친구 기기 이름"} />
        </FormField>
        {!device ? (
          <FormField label="주소 마지막 숫자">
            <Field type="number" min={1} max={254} step={1} numeric value={host} onChange={(event) => setHost(event.currentTarget.value)} placeholder={nextAddress === null ? "자동 배정 불가" : `비우면 자동 · 다음 주소 ${nextAddress}`} />
          </FormField>
        ) : null}
        <FormField label="클라이언트 public key" required>
          <Field
            value={publicKey}
            onChange={(event) => setPublicKey(event.currentTarget.value)}
            autoComplete="off"
            spellCheck={false}
            placeholder="WireGuard 앱에서 복사한 public key"
            trailing={<Button size="xs" variant="ghost" onClick={() => setPublicKey(fakeKey(`${name}:${peers.length}:${Date.now()}`))}><Glyph name="wand-sparkles" />데모 키</Button>}
          />
        </FormField>
        {error ? <Alert>{error}</Alert> : null}
      </Stack>
    </Dialog>
  );
};
