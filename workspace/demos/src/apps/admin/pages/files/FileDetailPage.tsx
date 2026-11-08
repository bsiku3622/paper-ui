import { useState } from "react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";

import { Badge, Button, Divider, Grid, Inline, Stack, Surface, Text } from "@studio-baeks/paper-ui";

import { Empty, Glyph, PageHeader, Stat, useToast } from "../../../../kit";
import { BarChart } from "../../content/charts";
import { dailyDownloads, downloadsOf, publicUrl } from "../../data/files";
import { formatBytes, formatDayHeading, formatMoment, formatShortDay, since } from "../../lib/format";
import { LATENCY, useCopy, useDelay } from "../../lib/hooks";
import { serviceTo } from "../../registry";
import { useFilesApi } from "../../store/api";
import { useFileList } from "../../store/views";
import { Card } from "../../ui/Card";
import { ChartCard } from "../../ui/ChartCard";
import { Facts, Loading, Mono } from "../../ui/Parts";
import { Summary } from "../../ui/Summary";
import { Table, type Column } from "../../ui/Table";
import { DeleteDialog } from "./DeleteDialog";
import { EditDialog } from "./EditDialog";
import { StateBadge, expiryText } from "./parts";

export const FileDetailPage = () => {
  const { fileId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const files = useFileList();
  const { stopSharing } = useFilesApi();
  const { copied, copy } = useCopy();
  const { ready } = useDelay(LATENCY.list);
  const [editing, setEditing] = useState(false);
  const [removing, setRemoving] = useState(false);
  const file = files.find((item) => item.id === fileId);

  if (!ready) return <Loading label="파일 불러오는 중" />;
  if (!file) {
    return (
      <Empty
        glyph="file-question"
        title="파일을 찾지 못했습니다"
        description="이미 지웠거나 주소가 바뀌었을 수 있습니다."
        action={<Button as={RouterLink} to={serviceTo("files")} variant="hairline">파일 관리로</Button>}
      />
    );
  }

  const link = publicUrl(file.slug);
  const days = dailyDownloads(file);
  const visits = downloadsOf(file, 40);
  const last = visits.find((visit) => visit.result === "완료");
  const left = file.remainingDownloads;

  const dayColumns: Column<(typeof days)[number]>[] = [
    { id: "day", header: "날짜", track: "minmax(8rem, 1fr)", render: (item) => <Text as="span">{formatDayHeading(item.day)}</Text> },
    { id: "count", header: "받아간 횟수", track: "7rem", render: (item) => <Text as="span" numeric>{item.count}회</Text> },
  ];
  const visitColumns: Column<(typeof visits)[number]>[] = [
    { id: "time", header: "시각", track: "8.5rem", render: (visit) => <Text as="span" numeric>{formatMoment(visit.at)}</Text> },
    { id: "from", header: "받은 곳", track: "minmax(9rem, 1fr)", render: (visit) => <Text as="span" truncate>{visit.place} · <Mono>{visit.address}</Mono></Text> },
    { id: "result", header: "결과", track: "6rem", render: (visit) => <Badge accent={visit.result === "완료" ? "success" : "warning"} variant="soft" dot>{visit.result}</Badge> },
  ];

  return (
    <>
      <PageHeader
        back={{ to: serviceTo("files"), label: "파일 관리" }}
        eyebrow={`${file.originalName} · ${formatBytes(file.size)}`}
        title={file.title}
        description={file.description || undefined}
        meta={<StateBadge file={file} />}
        actions={
          <>
            <Button variant="hairline" onClick={() => void copy(link, "link")}>{copied === "link" ? <Glyph name="check" /> : <Glyph name="link" />}{copied === "link" ? "복사됨" : "링크 복사"}</Button>
            <Button variant="hairline" onClick={() => setEditing(true)}><Glyph name="pencil" />수정</Button>
            <Button variant="ghost" accent="error" onClick={() => setRemoving(true)}><Glyph name="trash-2" />삭제</Button>
          </>
        }
      />

      <Summary>
        <Stat label="받아간 횟수" value={file.downloadCount} unit="회" note={last ? `마지막 ${since(last.at)}` : "아직 받아간 사람 없음"} />
        <Stat label="남은 횟수" value={left === null ? "제한 없음" : left} unit={left === null ? undefined : "회"} note={file.maxDownloads === null ? "횟수 제한을 두지 않았습니다" : `전체 ${file.maxDownloads}회 중`} tone={left === 0 ? "warning" : undefined} />
        <Stat label="남은 시간" value={file.expiresAt === null ? "무기한" : expiryText(file).replace(" 남음", "")} note={file.expiresAt === null ? "만료 시각을 두지 않았습니다" : file.state === "expired" ? "공유가 끝났습니다" : formatMoment(file.expiresAt)} tone={file.state === "expired" ? "warning" : undefined} />
        <Stat label="크기" value={formatBytes(file.size)} note={file.mime} />
      </Summary>

      <Grid columns={{ base: "minmax(0, 1fr)", lg: "minmax(0, 2fr) minmax(0, 1fr)" }} gap="lg" align="start">
        <Stack gap="lg">
          <ChartCard
            title="받아간 추이"
            description="최근 14일, 하루에 몇 번 받아갔는지"
            chart={
              <BarChart
                label={`${file.title}을 받아간 횟수, 최근 14일`}
                bars={days.map((item) => ({ key: String(item.day), value: item.count, tick: formatShortDay(item.day), heading: formatDayHeading(item.day) }))}
                format={(value) => `${value}회`}
                whole
              />
            }
            table={<Table label="하루별 받아간 횟수" rows={[...days].reverse()} rowKey={(item) => String(item.day)} columns={dayColumns} stackBelow="sm" dense card={(item) => <Inline justify="between"><Text as="span">{formatDayHeading(item.day)}</Text><Text as="span" numeric>{item.count}회</Text></Inline>} />}
          />

          <Card padding="lg" gap="md">
            <Inline justify="between" align="center" gap="md">
              <Text as="h2" variant="subheading">최근 받은 기록</Text>
              <Text as="span" variant="caption" ink="tertiary" numeric>{visits.length}건</Text>
            </Inline>
            <Divider />
            {visits.length === 0 ? (
              <Empty glyph="inbox" title="받은 기록이 없습니다" description="링크로 파일을 받아가면 여기에 남습니다." />
            ) : (
              <Table label="받은 기록" rows={visits.slice(0, 8)} rowKey={(visit) => visit.id} columns={visitColumns} stackBelow="sm" dense card={(visit) => <Inline justify="between" gap="md"><Text as="span" variant="caption" ink="secondary">{formatMoment(visit.at)} · {visit.place}</Text><Badge accent={visit.result === "완료" ? "success" : "warning"} variant="soft" dot>{visit.result}</Badge></Inline>} />
            )}
          </Card>
        </Stack>

        <Stack gap="lg">
          <Card gap="lg">
            <Text as="h2" variant="subheading">공유 링크</Text>
            <Surface fill="sunken" radius="md" padding="md"><Mono>{link}</Mono></Surface>
            <Inline gap="sm" wrap>
              <Button variant="hairline" onClick={() => void copy(link, "link2")}>{copied === "link2" ? <Glyph name="check" /> : <Glyph name="copy" />}{copied === "link2" ? "복사됨" : "복사"}</Button>
              <Button variant="ghost" onClick={() => toast("데모에서는 공개 사이트로 이동하지 않습니다")}>공개 페이지 열기</Button>
            </Inline>
            <Facts
              items={[
                { label: "상태", value: <StateBadge file={file} /> },
                { label: "공개 범위", value: file.locked ? "비밀번호를 아는 사람만" : "링크만 있으면 누구나" },
                { label: "주소", value: <Mono>/f/{file.slug}</Mono> },
              ]}
            />
            {file.state === "live" ? (
              <>
                <Divider />
                <Inline justify="between" align="center" gap="md" wrap>
                  <Text as="span" variant="caption" ink="secondary">공유를 멈추면 링크가 바로 닫힙니다.</Text>
                  <Button size="sm" variant="ghost" accent="error" onClick={() => void stopSharing(file.id).then(() => toast("공유를 멈췄습니다"))}>공유 멈추기</Button>
                </Inline>
              </>
            ) : null}
          </Card>

          <Card gap="lg">
            <Text as="h2" variant="subheading">파일 정보</Text>
            <Facts
              items={[
                { label: "원래 이름", value: file.originalName },
                { label: "형식", value: <Mono>{file.mime}</Mono> },
                { label: "크기", value: formatBytes(file.size) },
                { label: "올린 때", value: formatMoment(file.createdAt) },
                { label: "마지막 수정", value: formatMoment(file.updatedAt) },
              ]}
            />
          </Card>
        </Stack>
      </Grid>

      <EditDialog id={editing ? file.id : null} onClose={() => setEditing(false)} />
      <DeleteDialog ids={removing ? [file.id] : null} onClose={() => setRemoving(false)} onDone={() => navigate(serviceTo("files"))} />
    </>
  );
};
