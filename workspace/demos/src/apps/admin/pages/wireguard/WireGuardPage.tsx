// WireGuard: who is connected, how much they move, and the way to add or drop a device. The numbers at the top and the
// groups below are the original's (내 기기 · 친구 · 기타 peer); the traffic chart is the original's polyline with axes,
// a legend, a hover readout and a table behind it, and each peer now has a page of its own. Everything re-reads every ten
// seconds, as the original did.

import { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate, useSearchParams } from "react-router-dom";

import { Badge, Button, Floating, Grid, IconButton, Inline, Link, Spinner, Stack, Surface, Text } from "@studio-baeks/paper-ui";

import { Glyph, Menu, Meter, PageHeader, SectionHeader, Stat, useFace, useToast } from "../../../../kit";
import { Legend, LineChart } from "../../content/charts";
import { useAtLeast } from "../../content/viewport";
import type { PeerRow } from "../../data/types";
import { hourlyUsage, isOnline, kindOf, trafficHistory } from "../../data/wireguard";
import { now, nowSeconds } from "../../lib/clock";
import { formatClock, formatClockSeconds, formatIec, formatRate } from "../../lib/format";
import { LATENCY, useCopy, useDelay, useDemoState, useTick } from "../../lib/hooks";
import { serviceTo } from "../../registry";
import type { PeerKindInput } from "../../store/api";
import { useAdmin } from "../../store/store";
import { useReach, usePeerViews, type PeerView } from "../../store/views";
import { Card } from "../../ui/Card";
import { ChartCard } from "../../ui/ChartCard";
import { Alert, Hint, Loading, Mono } from "../../ui/Parts";
import { Summary } from "../../ui/Summary";
import { Table, Two, type Column } from "../../ui/Table";
import { AddPeerDialog } from "./AddPeerDialog";
import { ConfigDialog } from "./ConfigDialog";
import { RemovePeerDialog } from "./RemovePeerDialog";
import { limitLabel, peerInfo, StatusBadge, traffic } from "./parts";

const detailTo = (peer: { allowedIp: string }) => `${serviceTo("wireguard")}/${peer.allowedIp}`;

type Pending = { publicKey: string; name: string; allowedIp: string };

export const WireGuardPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const face = useFace();
  const [params] = useSearchParams();
  const demo = useDemoState();
  const { peers: rows } = useAdmin();
  const reach = useReach();
  const { ready, reload } = useDelay(LATENCY.list);
  const { copied, copy } = useCopy();
  const wide = useAtLeast("sm");
  const ok = ready && demo !== "error";
  const waiting = demo === "error" ? "확인하지 못했습니다" : "불러오는 중…";

  const asked = params.get("dialog");
  const [adding, setAdding] = useState<PeerKindInput | null>(asked === "add-personal" ? "personal" : asked === "add-friend" ? "friend" : null);
  const [config, setConfig] = useState<Pick<PeerRow, "name" | "allowedIp"> | null>(asked === "config" ? (rows[0] ?? null) : null);
  const [removing, setRemoving] = useState<PeerRow | null>(asked === "remove" ? (rows[4] ?? null) : null);
  const [pending, setPending] = useState<Pending | null>(asked === "pending" && rows[0] ? { publicKey: rows[0].publicKey, name: rows[0].name, allowedIp: rows[0].allowedIp } : null);
  // The page re-reads every ten seconds; once a new peer is awaited, every second.
  useTick(pending ? 1000 : 10_000);

  const at = now();
  const everyone = usePeerViews();
  const all = demo === "empty" ? [] : everyone;
  const mine = all.filter((view) => kindOf(view.peer.allowedIp) === "personal");
  const friends = all.filter((view) => kindOf(view.peer.allowedIp) === "friend");
  const others = all.filter((view) => kindOf(view.peer.allowedIp) === "other");
  const online = all.filter((view) => view.online).length;
  const received = all.reduce((sum, view) => sum + view.peer.received, 0);
  const sent = all.reduce((sum, view) => sum + view.peer.sent, 0);
  const history = trafficHistory(rows, at, 18, reach);
  const current = history[history.length - 1] ?? { at, upload: 0, download: 0 };

  const pendingView = pending ? all.find((view) => view.row.publicKey === pending.publicKey) : undefined;
  const connected = pendingView !== undefined && isOnline(pendingView.peer, at) && nowSeconds() - pendingView.peer.handshake < 30;
  useEffect(() => {
    if (!connected) return;
    const timer = window.setTimeout(() => setPending(null), 6000);
    return () => window.clearTimeout(timer);
  }, [connected]);

  const actions = (view: PeerView) => (
    <Inline gap="xs" justify="end">
      <IconCopy label={`${view.peer.name} 정보 복사`} done={copied === view.peer.publicKey} onCopy={() => void copy(peerInfo(view.peer), view.peer.publicKey)} />
      <Menu
        label={`${view.peer.name} 더 보기`}
        items={[
          { id: "detail", label: "상세 보기", glyph: "panel-right", onSelect: () => navigate(detailTo(view.peer)) },
          { id: "config", label: "연결 설정 보기", glyph: "file-cog", onSelect: () => setConfig(view.row) },
          ...(kindOf(view.peer.allowedIp) === "other" ? [] : [{ id: "divider", divider: true as const }, { id: "remove", label: "해제", glyph: "unplug" as const, danger: true, onSelect: () => setRemoving(view.row) }]),
        ]}
      />
    </Inline>
  );

  const columns: Column<PeerView>[] = [
    {
      id: "name",
      header: "기기",
      track: "minmax(11rem, 1.2fr)",
      render: ({ peer }) => (
        <Stack minWidth={0}>
          <Link as={RouterLink} to={detailTo(peer)} underline="hover"><Text as="span" strong truncate>{peer.name}</Text></Link>
          <Mono ink="tertiary">{peer.allowedIp}</Mono>
        </Stack>
      ),
    },
    { id: "status", header: "상태", track: "minmax(10.5rem, 1fr)", render: ({ peer, online: isUp }) => <StatusBadge peer={peer} online={isUp} /> },
    { id: "traffic", header: "송수신", track: "6.5rem", render: ({ peer }) => <Two top={traffic(peer).up} sub={traffic(peer).down} /> },
    { id: "limit", header: "속도 제한", track: "6rem", render: ({ row }) => <Text as="span" ink={row.rateLimitMbps === null ? "tertiary" : undefined}>{limitLabel(row.rateLimitMbps)}</Text> },
    { id: "actions", header: "", track: "5.5rem", render: actions },
  ];

  const card = (view: PeerView) => (
    <Stack gap="md">
      <Inline justify="between" align="start" gap="sm">
        <Stack minWidth={0} gap="xs">
          <Link as={RouterLink} to={detailTo(view.peer)} underline="hover"><Text as="span" strong truncate>{view.peer.name}</Text></Link>
          <Mono ink="tertiary">{view.peer.allowedIp}</Mono>
        </Stack>
        <StatusBadge peer={view.peer} online={view.online} />
      </Inline>
      <Text as="span" variant="caption" ink="secondary" numeric>{traffic(view.peer).up}　{traffic(view.peer).down}{view.row.rateLimitMbps !== null ? ` · 제한 ${limitLabel(view.row.rateLimitMbps)}` : ""}</Text>
      <Inline gap="xs" wrap>
        <Button size="sm" variant="ghost" onClick={() => void copy(peerInfo(view.peer), view.peer.publicKey)}>{copied === view.peer.publicKey ? "복사됨" : "정보 복사"}</Button>
        <Button size="sm" variant="ghost" as={RouterLink} to={detailTo(view.peer)}>상세</Button>
        {kindOf(view.peer.allowedIp) === "other" ? null : <Button size="sm" variant="ghost" accent="error" onClick={() => setRemoving(view.row)}>해제</Button>}
      </Inline>
    </Stack>
  );

  const group = (title: string, list: PeerView[], empty: string, note?: string) => (
    <Stack gap="md">
      <SectionHeader title={`${title} · ${list.length}`} description={note} />
      {list.length > 0 ? (
        <Surface {...face} radius="lg" overflow="hidden">
          <Table label={title} rows={list} rowKey={(view) => view.row.publicKey} columns={columns} card={card} />
        </Surface>
      ) : (
        <Card padding="lg"><Hint>{empty}</Hint></Card>
      )}
    </Stack>
  );

  // Who moved the most in the last day, by what they received: ranked bars on one baseline, largest first.
  const talkers = all
    .map((view) => ({ view, bytes: hourlyUsage(view.row, view.peer, at, 24).reduce((sum, hour) => sum + hour.download, 0) * 1024 * 1024 }))
    .sort((a, b) => b.bytes - a.bytes)
    .slice(0, 5);
  const biggest = talkers[0]?.bytes ?? 0;

  const times = history.map((sample) => sample.at);
  const series = [
    { id: "download", name: "↓ 받음", tone: "info" as const, values: history.map((sample) => sample.download) },
    { id: "upload", name: "↑ 보냄", tone: "ink" as const, values: history.map((sample) => sample.upload) },
  ];

  return (
    <>
      <PageHeader
        title="WireGuard"
        description="기기 연결과 네트워크 사용량을 관리합니다."
        actions={
          <>
            {wide ? <Text as="span" variant="caption" ink="tertiary" numeric>{!ready ? "불러오는 중…" : `${all.length} peers · 10초마다 갱신`}</Text> : null}
            <Button variant="ghost" onClick={reload}><Glyph name="refresh-cw" />새로고침</Button>
            <Floating>
              <Button as={Floating.Trigger}><Glyph name="plus" />기기 추가</Button>
              <Floating.Content as={Surface} fill="raised" border radius="md" padding="xs" width="md" placement="bottom end" aria-label="추가할 기기 종류">
                <Stack gap="xs">
                  <Button as={Floating.Close} variant="ghost" fullWidth justify="start" strong={false} onClick={() => setAdding("personal")}><Glyph name="laptop" />내 기기</Button>
                  <Button as={Floating.Close} variant="ghost" fullWidth justify="start" strong={false} onClick={() => setAdding("friend")}><Glyph name="users" />친구 기기</Button>
                </Stack>
              </Floating.Content>
            </Floating>
          </>
        }
      />

      {pending ? (
        <Surface elevation="sticky" top="sm" {...face} radius="md" padding="md">
          <Inline justify="between" gap="md" wrap>
            <Inline gap="sm">
              {connected ? <Badge accent="success" dot>연결 확인</Badge> : <Spinner label="기기 연결 확인 중" />}
              <Stack>
                <Text as="span" strong>{pending.name} · {pending.allowedIp}</Text>
                <Text as="span" variant="caption" ink="secondary" role="status">{connected ? "WireGuard 연결이 확인됐습니다." : "저장됨 · WireGuard 연결을 확인하고 있습니다."}</Text>
              </Stack>
            </Inline>
            {connected ? null : <Button variant="ghost" onClick={() => setPending(null)}>대기 종료</Button>}
          </Inline>
        </Surface>
      ) : null}

      {demo === "error" ? <Alert action={<Button size="sm" variant="hairline" onClick={reload}>다시 시도</Button>}>WireGuard peer를 불러오지 못했습니다. 서버가 응답하지 않습니다.</Alert> : null}

      <Summary>
        <Stat label="내 기기" value={ok ? mine.length : "–"} note={ok ? `${mine.filter((view) => view.online).length}대 최근 연결` : waiting} />
        <Stat label="친구" value={ok ? friends.length : "–"} note={ok ? `${friends.filter((view) => view.online).length}명 최근 연결` : waiting} />
        <Stat label="현재 연결" value={ok ? online : "–"} note="최근 3분 내 handshake" />
        <Stat label="VPN 수신 누계" value={ok ? formatIec(received) : "–"} note="peer → 서버" small />
        <Stat label="VPN 송신 누계" value={ok ? formatIec(sent) : "–"} note="서버 → peer" small />
      </Summary>

      {!ready ? (
        <Loading label="peer 불러오는 중" />
      ) : demo === "error" ? null : (
        <>
          <Grid columns={{ base: "minmax(0, 1fr)", xl: "minmax(0, 2fr) minmax(0, 1fr)" }} gap="lg" align="start">
            <ChartCard
              title="실시간 트래픽"
              description={`최근 3분 · 지금 ↓ ${formatRate(current.download)}　↑ ${formatRate(current.upload)}`}
              legend={<Legend items={[{ id: "download", name: "↓ 받음 · 서버 → peer", tone: "info" }, { id: "upload", name: "↑ 보냄 · peer → 서버", tone: "ink" }]} />}
              chart={
                <LineChart
                  label="최근 3분 VPN 업로드와 다운로드 속도"
                  times={times}
                  series={series}
                  xTick={formatClockSeconds}
                  xTip={formatClockSeconds}
                  format={formatRate}
                  yTick={(value) => String(Number(value.toFixed(2)))}
                  floor={1}
                />
              }
              table={
                <Table
                  label="최근 3분 트래픽"
                  dense
                  stackBelow="sm"
                  rows={[...history].reverse()}
                  rowKey={(sample) => String(sample.at)}
                  columns={[
                    { id: "time", header: "시각", track: "minmax(7rem, 1fr)", render: (sample) => <Text as="span" numeric>{formatClockSeconds(sample.at)}</Text> },
                    { id: "down", header: "↓ 받음", track: "7rem", render: (sample) => <Text as="span" numeric>{formatRate(sample.download)}</Text> },
                    { id: "up", header: "↑ 보냄", track: "7rem", render: (sample) => <Text as="span" numeric>{formatRate(sample.upload)}</Text> },
                  ]}
                  card={(sample) => <Inline justify="between" gap="md"><Text as="span" numeric>{formatClock(sample.at)}</Text><Text as="span" variant="caption" ink="secondary" numeric>↓ {formatRate(sample.download)}　↑ {formatRate(sample.upload)}</Text></Inline>}
                />
              }
            />
            <Card gap="lg">
              <Stack gap="xs">
                <Text as="h2" variant="subheading">오늘 많이 쓴 기기</Text>
                <Hint>최근 24시간 동안 받은 양이 많은 순서</Hint>
              </Stack>
              <Stack as="ul" gap="lg">
                {talkers.map((item) => (
                  <Stack key={item.view.row.publicKey} as="li">
                    <Meter value={biggest > 0 ? item.bytes / biggest : 0} label={item.view.peer.name} valueText={formatIec(item.bytes)} weight="thin" />
                  </Stack>
                ))}
              </Stack>
            </Card>
          </Grid>

          {group("내 기기", mine, "등록된 개인 기기가 없습니다.")}
          {group("친구", friends, "등록된 친구 peer가 없습니다.")}
          {others.length > 0 ? group("기타 peer", others, "", "서버에 직접 등록한 peer입니다. 여기서는 해제할 수 없습니다.") : null}
        </>
      )}

      <AddPeerDialog
        kind={adding}
        onClose={() => setAdding(null)}
        onAdded={(row) => {
          setAdding(null);
          setConfig(row);
          setPending({ publicKey: row.publicKey, name: row.name, allowedIp: row.allowedIp });
          toast("peer를 추가했습니다");
        }}
      />
      <ConfigDialog peer={config} onClose={() => setConfig(null)} />
      <RemovePeerDialog peer={removing} onClose={() => setRemoving(null)} />
    </>
  );
};

// A copy button that says it copied.
const IconCopy = ({ label, done, onCopy }: { label: string; done: boolean; onCopy: () => void }) => (
  <IconButton size="sm" variant="ghost" aria-label={done ? "복사됨" : label} onClick={onCopy}>
    <Glyph name={done ? "check" : "copy"} />
  </IconButton>
);
