// One peer's page: whether it is connected and how much it moves (a day of usage, with its table), its speed limit, the
// details of its connection (key, address, endpoint) and the sessions it has had. The original packed the key and the
// limit into a row's disclosure; here they have room.

import { useState } from "react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";

import { Badge, Button, Field, FormField, Inline, Stack, Text } from "@studio-baeks/paper-ui";

import { Empty, Glyph, PageHeader, Stat, Tabs, useToast } from "../../../../kit";
import { Legend, LineChart } from "../../content/charts";
import type { PeerRow } from "../../data/types";
import { hourlyUsage, kindOf, rateOf, recentHandshakes, sessionsOf, SLOT, WG, type Session } from "../../data/wireguard";
import { now } from "../../lib/clock";
import { messageOf } from "../../lib/errors";
import { formatClock, formatIec, formatMoment, formatRate, formatSpan, since } from "../../lib/format";
import { LATENCY, useCopy, useDelay, useTab, useTick } from "../../lib/hooks";
import { serviceTo } from "../../registry";
import { useWireGuardApi } from "../../store/api";
import { usePeerViews } from "../../store/views";
import { Card } from "../../ui/Card";
import { ChartCard } from "../../ui/ChartCard";
import { Alert, Facts, Hint, Loading, Mono } from "../../ui/Parts";
import { Summary } from "../../ui/Summary";
import { Table, Two, type Column } from "../../ui/Table";
import { ConfigDialog } from "./ConfigDialog";
import { RateLimitControl } from "./RateLimitControl";
import { RemovePeerDialog } from "./RemovePeerDialog";
import { kindLabel, limitLabel, peerInfo, StatusBadge, statusText } from "./parts";

const TABS = ["usage", "limit", "info", "sessions"] as const;

const sessionColumns: Column<Session>[] = [
  { id: "start", header: "시작", track: "minmax(9rem, 1fr)", render: (session) => <Two top={formatMoment(session.start)} sub={since(session.start)} /> },
  { id: "end", header: "끝", track: "minmax(9rem, 1fr)", render: (session) => (session.end === null ? <Badge accent="success" dot>연결 중</Badge> : <Text as="span" numeric>{formatMoment(session.end)}</Text>) },
  { id: "length", header: "길이", track: "6rem", render: (session) => <Text as="span" numeric>{formatSpan((session.end ?? now()) - session.start)}</Text> },
  { id: "down", header: "↓ 받음", track: "6rem", render: (session) => <Text as="span" numeric>{formatIec(session.download)}</Text> },
  { id: "up", header: "↑ 보냄", track: "6rem", render: (session) => <Text as="span" numeric>{formatIec(session.upload)}</Text> },
];

export const PeerDetailPage = () => {
  const { peerId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const views = usePeerViews();
  const { setRateLimit, renamePeer } = useWireGuardApi();
  const { ready } = useDelay(LATENCY.list);
  const { copied, copy } = useCopy();
  const [tab, setTab] = useTab(TABS, "usage");
  const [configOpen, setConfigOpen] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [savingLimit, setSavingLimit] = useState(false);
  const [limitError, setLimitError] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [renaming, setRenaming] = useState(false);
  useTick(10_000);

  const view = views.find((item) => item.peer.allowedIp === peerId);
  if (!ready) return <Loading label="peer 불러오는 중" />;
  if (!view) {
    return (
      <Empty
        glyph="unplug"
        title="peer를 찾지 못했습니다"
        description="이미 해제했거나 주소가 바뀌었을 수 있습니다."
        action={<Button as={RouterLink} to={serviceTo("wireguard")} variant="hairline">WireGuard로</Button>}
      />
    );
  }

  const { row, peer, online } = view;
  const at = now();
  const kind = kindOf(peer.allowedIp);
  const hours = hourlyUsage(row, peer, at, 24);
  const sessions = sessionsOf(row, peer, at);
  const rate = rateOf(row, Math.floor(at / SLOT), online);
  const downTotal = hours.reduce((sum, hour) => sum + hour.download, 0);
  const upTotal = hours.reduce((sum, hour) => sum + hour.upload, 0);
  const busiest = hours.reduce((best, hour) => (hour.download > best.download ? hour : best), hours[0]!);
  const shownName = name ?? peer.name;
  const MB = (value: number) => `${value.toFixed(value < 10 ? 1 : 0)} MB`;

  const saveLimit = async (value: number | "unlimited") => {
    setSavingLimit(true);
    setLimitError(null);
    try {
      await setRateLimit(peer.allowedIp, value);
      toast("저장했습니다");
      return true;
    } catch (reason) {
      setLimitError(messageOf(reason, "속도 제한을 저장하지 못했습니다."));
      return false;
    } finally {
      setSavingLimit(false);
    }
  };

  const rename = async () => {
    setRenaming(true);
    try {
      await renamePeer(peer.publicKey, shownName);
      setName(null);
      toast("이름을 바꿨습니다");
    } catch (reason) {
      toast(messageOf(reason, "이름을 바꾸지 못했습니다."), { tone: "error" });
    } finally {
      setRenaming(false);
    }
  };

  const hourColumns: Column<(typeof hours)[number]>[] = [
    { id: "time", header: "시각", track: "minmax(8rem, 1fr)", render: (hour) => <Text as="span" numeric>{formatMoment(hour.at)}</Text> },
    { id: "down", header: "↓ 받음", track: "6.5rem", render: (hour) => <Text as="span" numeric>{MB(hour.download)}</Text> },
    { id: "up", header: "↑ 보냄", track: "6.5rem", render: (hour) => <Text as="span" numeric>{MB(hour.upload)}</Text> },
  ];

  const sessionCard = (session: Session) => (
    <Stack gap="xs">
      <Inline justify="between" gap="md">
        <Text as="span" numeric>{formatMoment(session.start)}</Text>
        {session.end === null ? <Badge accent="success" dot>연결 중</Badge> : <Text as="span" variant="caption" ink="secondary" numeric>{formatSpan(session.end - session.start)}</Text>}
      </Inline>
      <Text as="span" variant="caption" ink="secondary" numeric>↓ {formatIec(session.download)}　↑ {formatIec(session.upload)}</Text>
    </Stack>
  );

  const infoActions = (
    <>
      <Button variant="hairline" onClick={() => void copy(peerInfo(peer), "info")}>{copied === "info" ? <Glyph name="check" /> : <Glyph name="copy" />}{copied === "info" ? "복사됨" : "정보 복사"}</Button>
      <Button variant="hairline" onClick={() => setConfigOpen(true)}><Glyph name="file-cog" />연결 설정</Button>
      {kind === "other" ? null : <Button variant="ghost" accent="error" onClick={() => setRemoving(true)}><Glyph name="unplug" />해제</Button>}
    </>
  );

  return (
    <>
      <PageHeader
        back={{ to: serviceTo("wireguard"), label: "WireGuard" }}
        eyebrow={<>{kindLabel(peer.allowedIp)} · <Mono>{peer.allowedIp}</Mono></>}
        title={peer.name}
        meta={<StatusBadge peer={peer} online={online} />}
        actions={infoActions}
      />

      <Summary>
        <Stat label="상태" value={online ? "연결됨" : peer.handshake ? "끊김" : "연결 전"} note={statusText(peer, online)} />
        <Stat label="받은 양" value={formatIec(peer.sent)} note="서버 → peer · 누계" small />
        <Stat label="보낸 양" value={formatIec(peer.received)} note="peer → 서버 · 누계" small />
        <Stat label="지금 속도" value={online ? rate.download.toFixed(2) : "–"} unit={online ? "Mbps" : undefined} note={online ? `↑ ${formatRate(rate.upload)}` : "연결되어 있지 않습니다"} />
        <Stat label="속도 제한" value={limitLabel(row.rateLimitMbps)} note={row.rateLimitMbps === null ? "내 기기는 제한을 두지 않습니다" : "기기별 제한"} small />
      </Summary>

      <Tabs
        label="peer 화면"
        items={[
          { id: "usage", label: "사용량" },
          { id: "limit", label: "속도 제한" },
          { id: "info", label: "연결 정보" },
          { id: "sessions", label: "연결 기록", count: sessions.length },
        ]}
        value={tab}
        onChange={setTab}
      />

      {tab === "usage" ? (
        <Stack gap="lg">
          <ChartCard
            title="최근 24시간"
            description="한 시간에 얼마나 주고받았는지"
            legend={<Legend items={[{ id: "download", name: "↓ 받음 · 서버 → peer", tone: "info" }, { id: "upload", name: "↑ 보냄 · peer → 서버", tone: "ink" }]} />}
            chart={
              <LineChart
                label={`${peer.name}의 최근 24시간 사용량`}
                times={hours.map((hour) => hour.at)}
                series={[
                  { id: "download", name: "↓ 받음", tone: "info", values: hours.map((hour) => hour.download) },
                  { id: "upload", name: "↑ 보냄", tone: "ink", values: hours.map((hour) => hour.upload) },
                ]}
                xTick={formatClock}
                xTip={formatMoment}
                format={MB}
                yTick={(value) => String(Math.round(value))}
                floor={20}
              />
            }
            table={<Table label="한 시간별 사용량" dense stackBelow="sm" rows={[...hours].reverse()} rowKey={(hour) => String(hour.at)} columns={hourColumns} card={(hour) => <Inline justify="between" gap="md"><Text as="span" numeric>{formatClock(hour.at)}</Text><Text as="span" variant="caption" ink="secondary" numeric>↓ {MB(hour.download)}　↑ {MB(hour.upload)}</Text></Inline>} />}
          />
          <Card gap="lg">
            <Text as="h2" variant="subheading">24시간 요약</Text>
            <Facts
              items={[
                { label: "받은 양", value: formatIec(downTotal * 1024 * 1024) },
                { label: "보낸 양", value: formatIec(upTotal * 1024 * 1024) },
                { label: "가장 바빴던 때", value: busiest.download > 0 ? `${formatMoment(busiest.at)} · ${MB(busiest.download)}` : "없음" },
              ]}
            />
          </Card>
        </Stack>
      ) : null}

      {tab === "limit" ? (
        <Card gap="xl">
          <Stack gap="xs">
            <Text as="h2" variant="subheading">속도 제한</Text>
            <Hint>0은 연결을 막고, 1부터 300 사이는 그 속도(Mbps)로 제한합니다. 슬라이더를 끝까지 밀거나 숫자를 비우면 제한이 없습니다.</Hint>
          </Stack>
          {row.rateLimitMbps === null ? (
            <Empty glyph="gauge" title="내 기기는 속도를 제한하지 않습니다" description="친구 기기에만 속도 제한을 둘 수 있습니다." />
          ) : (
            <>
              <RateLimitControl name={peer.name} saved={row.rateLimitMbps} busy={savingLimit} onSave={saveLimit} />
              {limitError ? <Alert>{limitError}</Alert> : null}
              <Hint>저장하면 다음 handshake부터 새 제한이 적용됩니다. 지금 연결된 세션은 곧 이어서 바뀝니다.</Hint>
            </>
          )}
        </Card>
      ) : null}

      {tab === "info" ? (
        <Stack gap="lg">
          <Card gap="lg">
            <Text as="h2" variant="subheading">기기 이름</Text>
            <Inline gap="sm" align="end" wrap>
              <Stack width="lg" maxWidth="full">
                <FormField label="이름">
                  <Field value={shownName} maxLength={48} onChange={(event) => setName(event.currentTarget.value)} />
                </FormField>
              </Stack>
              <Button variant="soft" loading={renaming} loadingLabel="저장 중" disabled={name === null || name === peer.name || !name.trim()} onClick={() => void rename()}>저장</Button>
            </Inline>
          </Card>
          <Card gap="lg">
            <Text as="h2" variant="subheading">연결 정보</Text>
            <Facts
              items={[
                { label: "구분", value: kindLabel(peer.allowedIp) },
                { label: "허용 주소", value: <Mono>{peer.allowedIp}</Mono> },
                {
                  label: "public key",
                  value: (
                    <Inline gap="sm" align="start" minWidth={0}>
                      <Mono>{peer.publicKey}</Mono>
                      <Button size="xs" variant="ghost" onClick={() => void copy(peer.publicKey, "key")}>{copied === "key" ? "복사됨" : "복사"}</Button>
                    </Inline>
                  ),
                },
                { label: "endpoint", value: peer.endpoint ? <Mono>{peer.endpoint}</Mono> : "endpoint 대기 중" },
                { label: "마지막 handshake", value: peer.handshake ? `${since(peer.handshake * 1000)} · ${formatMoment(peer.handshake * 1000)}` : "아직 없음" },
                { label: "등록한 날", value: formatMoment(row.addedAt) },
                { label: "인터페이스", value: <Mono>{WG.interface} · {kind === "personal" ? WG.personalSubnet : WG.subnet}</Mono> },
              ]}
            />
            {online ? (
              <Hint>최근 handshake · {recentHandshakes(peer, at, 4).map((moment) => since(moment)).join(" · ")}</Hint>
            ) : null}
          </Card>
        </Stack>
      ) : null}

      {tab === "sessions" ? (
        sessions.length === 0 ? (
          <Card><Empty glyph="plug-zap" title="아직 연결한 적이 없습니다" description="기기에서 터널을 켜면 첫 handshake와 함께 여기에 남습니다." /></Card>
        ) : (
          <Card padding="lg" gap="md">
            <Table label="연결 기록" dense stackBelow="md" rows={sessions} rowKey={(session) => session.id} columns={sessionColumns} card={sessionCard} />
          </Card>
        )
      ) : null}

      <ConfigDialog peer={configOpen ? row : null} onClose={() => setConfigOpen(false)} />
      <RemovePeerDialog peer={removing ? (row as PeerRow) : null} onClose={() => setRemoving(false)} onDone={() => navigate(serviceTo("wireguard"))} />
    </>
  );
};
