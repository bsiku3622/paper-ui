import { useEffect, useRef, useState, type FormEvent } from "react";

import { Button, Field, FormField, Stack } from "@studio-baeks/paper-ui";

import { useToast } from "../../../../kit";
import type { WolDevice } from "../../data/types";
import { messageOf } from "../../lib/errors";
import { useWolApi } from "../../store/api";
import { Dialog } from "../../ui/Dialog";
import { FormGrid } from "../../ui/Form";
import { Alert } from "../../ui/Parts";

export const DeviceDialog = ({ open, device, onClose, onSaved }: { open: boolean; device?: WolDevice; onClose: () => void; onSaved?: (device: WolDevice | null) => void }) => {
  const { addDevice, updateDevice } = useWolApi();
  const toast = useToast();
  const [name, setName] = useState("");
  const [host, setHost] = useState("");
  const [mac, setMac] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const first = useRef<HTMLInputElement>(null);
  const editing = device !== undefined;

  const filled = useRef<string | null>(null);
  useEffect(() => {
    if (!open) {
      filled.current = null;
      return;
    }
    const key = device?.id ?? "";
    if (filled.current === key) return;
    filled.current = key;
    setName(device?.name ?? "");
    setHost(device?.host ?? "");
    setMac(device?.mac ?? "");
    setAddress(device?.address ?? "");
    setDescription(device?.description ?? "");
    setError(null);
  }, [open, device]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const input = { name, host, mac, address, description };
    try {
      if (device) {
        await updateDevice(device.id, input);
        toast("저장했습니다");
        onSaved?.(null);
      } else {
        const added = await addDevice(input);
        toast("기기를 추가했습니다");
        onSaved?.(added);
      }
      onClose();
    } catch (reason) {
      setError(messageOf(reason, "저장하지 못했습니다."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={editing ? "기기 정보" : "기기 추가"}
      description="깨우기 신호는 MAC 주소로 보내고, 응답은 VPN 주소로 확인합니다."
      busy={busy}
      focusRef={first}
      footer={
        <>
          <Button variant="ghost" disabled={busy} onClick={onClose}>취소</Button>
          <Button type="submit" form="wol-device" loading={busy} loadingLabel="저장 중">{editing ? "저장" : "추가"}</Button>
        </>
      }
    >
      <Stack as="form" id="wol-device" gap="lg" paddingY="xs" onSubmit={(event: FormEvent) => void submit(event)}>
        <FormGrid>
          <FormField label="이름" required>
            <Field ref={first} value={name} maxLength={40} autoComplete="off" placeholder="예: 작업용 데스크탑" onChange={(event) => setName(event.currentTarget.value)} />
          </FormField>
          <FormField label="호스트 이름">
            <Field value={host} maxLength={40} autoComplete="off" placeholder="예: desk-pc" onChange={(event) => setHost(event.currentTarget.value)} />
          </FormField>
          <FormField label="유선 MAC 주소" required description="콜론으로 나눠 씁니다">
            <Field value={mac} autoComplete="off" spellCheck={false} placeholder="00:00:5e:00:53:1a" onChange={(event) => setMac(event.currentTarget.value)} />
          </FormField>
          <FormField label="VPN 주소" required>
            <Field value={address} autoComplete="off" spellCheck={false} placeholder="10.20.10.8" onChange={(event) => setAddress(event.currentTarget.value)} />
          </FormField>
        </FormGrid>
        <FormField label="설명">
          <Field value={description} placeholder="어디에 있는 기기인지, 무엇에 쓰는지" onChange={(event) => setDescription(event.currentTarget.value)} />
        </FormField>
        {error ? <Alert>{error}</Alert> : null}
      </Stack>
    </Dialog>
  );
};
