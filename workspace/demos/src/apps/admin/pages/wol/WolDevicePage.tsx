import { useState } from "react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";

import { Button, Inline, Link, Stack, Surface, Text } from "@studio-baeks/paper-ui";

import { Empty, Glyph, PageHeader, Stat, Tabs, useFace, useToast } from "../../../../kit";
import { describeRecord, isReachable } from "../../data/wol";
import type { WakeRecord } from "../../data/types";
import { now } from "../../lib/clock";
import { elapsed, formatMoment, since } from "../../lib/format";
import { LATENCY, useDelay, useTab, useTick } from "../../lib/hooks";
import { serviceTo } from "../../registry";
import { useWolApi } from "../../store/api";
import { useAdmin } from "../../store/store";
import { Card } from "../../ui/Card";
import { ConfirmDialog } from "../../ui/ConfirmDialog";
import { Facts, Hint, Loading, Mono } from "../../ui/Parts";
import { Summary } from "../../ui/Summary";
import { Table, Two, type Column } from "../../ui/Table";
import { DeviceDialog } from "./DeviceDialog";
import { ReachBadge, ResultBadge, WakeControl } from "./parts";

const TABS = ["history", "info"] as const;

export const WolDevicePage = () => {
  const { deviceId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const face = useFace();
  const { devices, peers } = useAdmin();
  const { removeDevice } = useWolApi();
  const { ready } = useDelay(LATENCY.list);
  const [tab, setTab] = useTab(TABS, "history");
  const [editing, setEditing] = useState(false);
  const [removing, setRemoving] = useState(false);
  useTick(1000);

  const device = devices.find((item) => item.id === deviceId);
  if (!ready) return <Loading label="기기 불러오는 중" />;
  if (!device) {
    return (
      <Empty
        glyph="monitor-off"
        title="기기를 찾지 못했습니다"
        description="이미 지웠거나 주소가 바뀌었을 수 있습니다."
        action={<Button as={RouterLink} to={serviceTo("wol")} variant="hairline">데스크탑 WOL로</Button>}
      />
    );
  }

  const at = now();
  const reachable = isReachable(device, at);
  const records = device.history.map((entry) => ({ entry, ...describeRecord(entry, at) }));
  const answers = records.filter((record) => record.result === "응답 확인" && record.seconds !== null);
  const average = answers.length ? Math.round(answers.reduce((sum, record) => sum + (record.seconds ?? 0), 0) / answers.length) : null;
  const peer = peers.find((item) => item.allowedIp === device.address);

  type Row = (typeof records)[number];
  const columns: Column<Row>[] = [
    { id: "time", header: "시각", track: "minmax(10rem, 1fr)", render: ({ entry }) => <Two top={formatMoment(entry.at)} sub={elapsed(entry.at)} /> },
    { id: "by", header: "보낸 사람", track: "8rem", render: ({ entry }) => <Text as="span" ink="secondary">{entry.by}</Text> },
    { id: "result", header: "결과", track: "9rem", render: ({ result }) => <ResultBadge result={result} /> },
    { id: "seconds", header: "응답 시간", track: "7rem", render: ({ seconds }) => <Text as="span" numeric ink={seconds === null ? "tertiary" : undefined}>{seconds === null ? "–" : `${seconds}초`}</Text> },
  ];
  const card = ({ entry, result, seconds }: Row) => (
    <Stack gap="xs">
      <Inline justify="between" gap="md">
        <Text as="span" numeric>{formatMoment(entry.at)}</Text>
        <ResultBadge result={result} />
      </Inline>
      <Text as="span" variant="caption" ink="secondary">{entry.by}{seconds !== null ? ` · ${seconds}초 만에 응답` : ""}</Text>
    </Stack>
  );
  const rowKey = ({ entry }: { entry: WakeRecord }) => entry.id;

  return (
    <>
      <PageHeader
        back={{ to: serviceTo("wol"), label: "데스크탑 WOL" }}
        eyebrow={<Mono>{device.host}</Mono>}
        title={device.name}
        description={device.description || undefined}
        meta={<ReachBadge device={device} />}
        actions={
          <>
            <Button variant="hairline" onClick={() => setEditing(true)}><Glyph name="pencil" />수정</Button>
            <Button variant="ghost" accent="error" onClick={() => setRemoving(true)}><Glyph name="trash-2" />삭제</Button>
          </>
        }
      />

      <Summary>
        <Stat label="상태" value={reachable ? "응답 있음" : "응답 없음"} note={reachable ? "VPN에서 응답합니다" : "절전 · 종료, 또는 연결 없음"} />
        <Stat label="마지막 신호" value={device.lastSentAt ? since(device.lastSentAt) : "없음"} note={device.lastSentAt ? formatMoment(device.lastSentAt) : "전송 기록 없음"} />
        <Stat label="보낸 신호" value={device.history.length} unit="번" note="기록에 남은 것" />
        <Stat label="평균 응답 시간" value={average ?? "–"} unit={average !== null ? "초" : undefined} note="신호를 보낸 뒤 응답까지" />
      </Summary>

      <Card>
        <Inline justify="between" align="center" gap="lg" wrap>
          <Stack gap="xs" minWidth={0}>
            <Text as="h2" variant="subheading">깨우기</Text>
            <Hint>MAC 주소 <Mono>{device.mac}</Mono>로 신호를 보내고, VPN 주소 <Mono>{device.address}</Mono>가 응답하는지 확인합니다.</Hint>
          </Stack>
          <WakeControl device={device} />
        </Inline>
      </Card>

      <Tabs label="기기 화면" items={[{ id: "history", label: "기록", count: records.length }, { id: "info", label: "정보" }]} value={tab} onChange={setTab} />

      {tab === "history" ? (
        <Surface {...face} radius="lg" overflow="hidden">
          {records.length === 0 ? (
            <Empty glyph="inbox" title="신호를 보낸 적이 없습니다" description="깨우기 신호를 보내면 결과와 함께 여기에 남습니다." />
          ) : (
            <Table label="보낸 신호" rows={records} rowKey={rowKey} columns={columns} card={card} stackBelow="md" />
          )}
        </Surface>
      ) : (
        <Card gap="lg">
          <Text as="h2" variant="subheading">기기 정보</Text>
          <Facts
            items={[
              { label: "이름", value: device.name },
              { label: "호스트 이름", value: <Mono>{device.host}</Mono> },
              { label: "유선 MAC", value: <Mono>{device.mac}</Mono> },
              { label: "VPN 주소", value: <Mono>{device.address}</Mono> },
              { label: "설명", value: device.description || "없음" },
              {
                label: "VPN peer",
                value: peer ? <Link as={RouterLink} to={`${serviceTo("wireguard")}/${peer.allowedIp}`} underline="hover">{peer.name} · {peer.allowedIp}</Link> : "등록되어 있지 않습니다",
              },
            ]}
          />
          <Inline gap="sm" wrap>
            <Button variant="hairline" onClick={() => setEditing(true)}>수정</Button>
          </Inline>
        </Card>
      )}

      <DeviceDialog open={editing} device={device} onClose={() => setEditing(false)} />
      <ConfirmDialog
        open={removing}
        onClose={() => setRemoving(false)}
        title="기기를 지울까요?"
        confirmLabel="지우기"
        busyLabel="지우는 중"
        onConfirm={async () => {
          await removeDevice(device.id);
          toast("기기를 지웠습니다");
          navigate(serviceTo("wol"));
        }}
      >
        <Stack gap="xs">
          <Text as="p" strong>{device.name} · {device.address}</Text>
          <Text as="p" variant="caption" ink="secondary">이 기기는 더 이상 여기서 깨울 수 없습니다. 보낸 신호의 기록도 함께 사라집니다.</Text>
        </Stack>
      </ConfirmDialog>
    </>
  );
};
