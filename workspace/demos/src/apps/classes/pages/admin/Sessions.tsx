// 접속 기기 — every browser or phone that is signed in, with the address it came from and when it was last used. Cutting one
// off makes that device sign in again. The addresses are in the ranges set aside for documentation; none of them is real.

import { Badge, Button, IconButton, Inline, Stack, Surface, Text } from "@studio-baeks/paper-ui";

import { Empty, Glyph, relative, useToast } from "../../../../kit";
import type { DeviceSession } from "../../data/admin";
import { Card } from "../../ui/parts";
import { dayLabel, Mono, useBriefly } from "./parts";
import { useAdmin } from "./store";

export const SessionsPanel = () => {
  const { sessions, setSessions } = useAdmin();
  const toast = useToast();
  const [busy, refresh] = useBriefly();
  const rows = [...sessions].sort((a, b) => b.lastUsedAt.localeCompare(a.lastUsedAt));

  const revoke = (target: DeviceSession) => {
    const before = sessions;
    setSessions((list) => list.filter((item) => item.id !== target.id));
    toast(`${target.username}의 ${target.agent} 기기를 끊었습니다`, { action: { label: "되돌리기", onSelect: () => setSessions(before) } });
  };

  return (
    <Card
      title="로그인해 둔 기기"
      description={`${rows.length}대가 로그인해 있습니다. 마지막으로 쓴 지 30일이 지나면 저절로 끊기고, 끊은 기기는 다시 로그인해야 합니다.`}
      padding="lg"
      actions={
        <Button variant="ghost" size="sm" loading={busy} onClick={() => refresh(() => toast("기기 목록을 새로 받았습니다"))}>
          <Glyph name="refresh-cw" />새로 받기
        </Button>
      }
    >
      {rows.length === 0 ? (
        <Empty glyph="monitor-smartphone" title="로그인해 둔 기기가 없습니다" description="누군가 로그인하면 여기에 나타납니다." />
      ) : (
        <Stack as="ul" aria-label="로그인한 기기">
          {rows.map((item) => (
            <Surface as="li" key={item.id} border="top" paddingY="md">
              <Inline justify="between" align="center" gap="md">
                <Stack gap="xs" minWidth={0}>
                  <Inline gap="sm" align="center" wrap>
                    <Mono strong>{item.username}</Mono>
                    <Badge size="xs" variant="soft"><Glyph name={item.device === "mobile" ? "smartphone" : "laptop"} />{item.device === "mobile" ? "모바일" : "웹"}</Badge>
                    {item.current ? <Badge size="xs" variant="soft" accent="info">이 기기</Badge> : null}
                  </Inline>
                  <Text as="span" variant="caption" ink="tertiary">
                    {item.agent} · <Mono ink="tertiary">{item.ip}</Mono> · 마지막 사용 {relative(new Date(item.lastUsedAt))} · {dayLabel(item.expiresAt)}에 만료
                  </Text>
                </Stack>
                <IconButton variant="ghost" size="sm" disabled={item.current} aria-label={item.current ? "지금 쓰는 기기는 끊을 수 없습니다" : `${item.username}의 ${item.agent} 기기 끊기`} onClick={() => revoke(item)}>
                  <Glyph name="log-out" />
                </IconButton>
              </Inline>
            </Surface>
          ))}
        </Stack>
      )}
    </Card>
  );
};
