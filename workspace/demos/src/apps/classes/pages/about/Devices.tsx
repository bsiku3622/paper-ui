// 로그인한 기기 — one account can be signed in on five devices at once; past that the one used longest ago is dropped.
// Here you see them, cut one off, or cut every other one off. A device that has been dropped finds out the next time it
// asks, and is sent back to the sign-in page. The list is made up.

import { useState } from "react";

import { Badge, Button, IconButton, Inline, Spinner, Stack, Text } from "@studio-baeks/paper-ui";

import { ago, Glyph, relative, useStored, useToast } from "../../../../kit";
import { Card, Dialog, Hint, Rows } from "../../ui/parts";

type Device = { id: number; name: string; detail: string; current: boolean; lastUsed: string };
const LIMIT = 5;

const FIRST: Device[] = [
  { id: 1, name: "웹 · Chrome", detail: "Mac", current: true, lastUsed: ago(0).toISOString() },
  { id: 2, name: "Chrome · Android", detail: "Pixel", current: false, lastUsed: ago(8).toISOString() },
  { id: 3, name: "Safari · Mac", detail: "MacBook", current: false, lastUsed: ago(5 * 60).toISOString() },
  { id: 4, name: "Edge · Windows", detail: "생활관 공용 PC", current: false, lastUsed: ago(4 * 24 * 60).toISOString() },
];

export const Devices = () => {
  const toast = useToast();
  const [devices, setDevices] = useStored<Device[]>("classes:devices", FIRST);
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const others = devices.filter((device) => !device.current);

  const revoke = (device: Device) => {
    const before = devices;
    setDevices((now) => now.filter((item) => item.id !== device.id));
    toast(`${device.name}에서 로그아웃시켰습니다`, { action: { label: "되돌리기", onSelect: () => setDevices(before) } });
  };
  const revokeAll = () => {
    const before = devices;
    setDevices((now) => now.filter((item) => item.current));
    setConfirm(false);
    toast(`다른 기기 ${others.length}대를 모두 로그아웃시켰습니다`, { action: { label: "되돌리기", onSelect: () => setDevices(before) } });
  };
  const refresh = () => {
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      toast("기기 목록을 새로 받았습니다");
    }, 500);
  };

  return (
    <Card
      title="로그인한 기기"
      description={`한 계정으로 ${LIMIT}대까지 동시에 쓸 수 있습니다. 그 이상 로그인하면 가장 오래 안 쓴 기기부터 끊깁니다.`}
      actions={
        <Inline gap="sm" align="center">
          <Text as="span" variant="caption" ink="tertiary" numeric>{LIMIT}대 중 {devices.length}대</Text>
          <IconButton variant="ghost" size="sm" aria-label="기기 목록 새로 받기" onClick={refresh} disabled={loading}>{loading ? <Spinner size="inline" ink="inherit" decorative /> : <Glyph name="refresh-cw" />}</IconButton>
        </Inline>
      }
    >
      <Rows>
        {devices.map((device) => (
          <Inline key={device.id} justify="between" align="center" gap="md">
            <Stack gap="xs" minWidth={0}>
              <Inline gap="sm" align="center" wrap>
                <Glyph name="monitor-smartphone" ink="tertiary" />
                <Text as="span" strong>{device.name}</Text>
                {device.current ? <Badge variant="solid" size="sm">이 기기</Badge> : null}
              </Inline>
              <Text as="span" variant="caption" ink="tertiary">{device.detail} · {device.current ? "방금 사용" : `${relative(new Date(device.lastUsed))} 사용`}</Text>
            </Stack>
            {device.current ? null : <Button size="sm" variant="hairline" onClick={() => revoke(device)}>끊기</Button>}
          </Inline>
        ))}
      </Rows>
      <Button variant="hairline" fullWidth disabled={others.length === 0} onClick={() => setConfirm(true)}><Glyph name="log-out" />다른 기기 모두 로그아웃</Button>
      <Hint>끊은 기기는 다음에 서버에 물어볼 때 로그인 화면으로 돌아갑니다. 이 기기는 끊지 않습니다.</Hint>
      <Dialog
        open={confirm}
        onOpenChange={setConfirm}
        title="다른 기기를 모두 로그아웃할까요?"
        description={`이 기기를 뺀 ${others.length}대가 로그인 화면으로 돌아갑니다.`}
        size="measure.xs"
        footer={<><Button variant="ghost" onClick={() => setConfirm(false)}>취소</Button><Button variant="solid" accent="error" onClick={revokeAll}>모두 로그아웃</Button></>}
      >
        <Text ink="secondary">다시 쓰려면 그 기기에서 새로 로그인해야 합니다.</Text>
      </Dialog>
    </Card>
  );
};
