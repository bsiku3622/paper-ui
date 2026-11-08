import { useEffect, useRef, useState } from "react";
import { Link as RouterLink, useSearchParams } from "react-router-dom";

import { Button, Grid, Link, Stack, Text, Inline } from "@studio-baeks/paper-ui";

import { Empty, Glyph, PageHeader, Stat, useToast } from "../../../../kit";
import { describeRecord, isReachable } from "../../data/wol";
import { DAY, now } from "../../lib/clock";
import { elapsed, formatMoment, since } from "../../lib/format";
import { LATENCY, useDelay, useDemoState, useTick } from "../../lib/hooks";
import { serviceTo } from "../../registry";
import { useAdmin } from "../../store/store";
import { Card } from "../../ui/Card";
import { Alert, Loading, Note } from "../../ui/Parts";
import { Summary } from "../../ui/Summary";
import { DeviceDialog } from "./DeviceDialog";
import { ReachBadge, WakeControl } from "./parts";

export const WolPage = () => {
  const { devices: stored } = useAdmin();
  const toast = useToast();
  const [params] = useSearchParams();
  const demo = useDemoState();
  const { ready, reload } = useDelay(LATENCY.list);
  const [adding, setAdding] = useState(params.get("dialog") === "add");
  useTick(1000);
  const ok = ready && demo !== "error";
  const waiting = demo === "error" ? "확인하지 못했습니다" : "불러오는 중…";

  const devices = demo === "empty" ? [] : stored;
  const at = now();
  const up = devices.filter((device) => isReachable(device, at));
  const records = devices.flatMap((device) => device.history.map((entry) => ({ device, entry, ...describeRecord(entry, at) })));
  const week = records.filter((record) => record.entry.at > at - 7 * DAY);
  const answers = records.filter((record) => record.result === "응답 확인" && record.seconds !== null);
  const average = answers.length ? Math.round(answers.reduce((sum, record) => sum + (record.seconds ?? 0), 0) / answers.length) : null;
  const latest = devices.filter((device) => device.lastSentAt !== null).sort((a, b) => (b.lastSentAt ?? 0) - (a.lastSentAt ?? 0))[0];

  const before = useRef<Record<string, boolean>>({});
  useEffect(() => {
    for (const device of stored) {
      const answering = isReachable(device);
      if (before.current[device.id] === false && answering) toast(`${device.name}이(가) 응답했습니다`);
      before.current[device.id] = answering;
    }
  });

  return (
    <>
      <PageHeader
        title="데스크탑 WOL"
        description="집의 데스크탑에 깨우기 신호를 보냅니다."
        actions={
          <>
            <Button variant="ghost" onClick={reload}><Glyph name="refresh-cw" />새로고침</Button>
            <Button onClick={() => setAdding(true)}><Glyph name="plus" />기기 추가</Button>
          </>
        }
      />

      <Summary>
        <Stat label="기기" value={ok ? devices.length : "–"} unit="대" note={ok ? `${up.length}대 응답 있음` : waiting} />
        <Stat label="마지막 신호" value={ok ? (latest?.lastSentAt ? since(latest.lastSentAt) : "없음") : "–"} note={ok ? (latest ? latest.name : "전송 기록 없음") : waiting} />
        <Stat label="최근 7일 신호" value={ok ? week.length : "–"} unit="번" note={ok ? `깨운 기기 ${new Set(week.map((record) => record.device.id)).size}대` : waiting} />
        <Stat label="평균 응답 시간" value={ok && average !== null ? average : "–"} unit={ok && average !== null ? "초" : undefined} note={ok ? "신호를 보낸 뒤 응답까지" : waiting} />
      </Summary>

      {!ready ? (
        <Loading label="기기 상태를 확인하는 중입니다" />
      ) : demo === "error" ? (
        <Alert action={<Button size="sm" variant="hairline" onClick={reload}>다시 시도</Button>}>데스크탑 상태를 불러오지 못했습니다. 잠시 뒤에 다시 시도해주세요.</Alert>
      ) : devices.length === 0 ? (
        <Empty glyph="monitor-off" title="등록된 기기가 없습니다" description="깨울 기기의 MAC 주소와 VPN 주소를 등록하면 여기서 신호를 보낼 수 있습니다." action={<Button variant="hairline" onClick={() => setAdding(true)}>기기 추가</Button>} />
      ) : (
        <>
          <Grid columns={{ base: "minmax(0, 1fr)", lg: "repeat(2, minmax(0, 1fr))", xl: "repeat(3, minmax(0, 1fr))" }} gap="lg">
            {devices.map((device) => {
              const reachable = isReachable(device, at);
              return (
                <Card key={device.id} gap="lg">
                  <Stack gap="lg">
                    <Inline justify="between" align="start" gap="sm" wrap>
                      <Inline gap="sm" minWidth={0}>
                        <Glyph name="monitor" />
                        <Link as={RouterLink} to={`${serviceTo("wol")}/${device.id}`} underline="hover"><Text as="h2" variant="subheading">{device.name}</Text></Link>
                      </Inline>
                      <ReachBadge device={device} />
                    </Inline>
                    <Text as="p" ink="secondary">
                      {reachable ? `${device.name}에 연결됩니다. 이미 켜져 있으면 깨우기 신호를 보내도 계속 켜져 있습니다.` : "절전 또는 종료 상태이거나 네트워크에 연결되지 않았습니다."}
                    </Text>
                    <Stack gap="xs">
                      <Text as="span" variant="caption" ink="secondary" numeric>VPN 주소 · {device.address}</Text>
                      <Text as="span" variant="caption" ink="secondary" numeric>유선 MAC · {device.mac}</Text>
                      <Text as="span" variant="caption" ink="secondary" numeric>최근 신호 · {device.lastSentAt ? `${formatMoment(device.lastSentAt)} (${elapsed(device.lastSentAt)})` : "전송 기록 없음"}</Text>
                    </Stack>
                  </Stack>
                  <WakeControl device={device} extra={<Button as={RouterLink} to={`${serviceTo("wol")}/${device.id}`} variant="ghost">기록<Glyph name="arrow-right" /></Button>} />
                </Card>
              );
            })}
          </Grid>
          <Note glyph="info" live={false}>기기의 전원과 유선 LAN이 연결되어 있어야 합니다. 신호 전송이 부팅 완료를 뜻하지는 않으며, 응답 상태는 VPN 연결을 기준으로 확인합니다.</Note>
        </>
      )}

      <DeviceDialog open={adding} onClose={() => setAdding(false)} />
    </>
  );
};
