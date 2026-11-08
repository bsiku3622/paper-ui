import { useState, type ReactNode } from "react";
import { Link as RouterLink } from "react-router-dom";

import { Box, Button, Divider, IconButton, Inline, Stack, Surface, Text, useResolvedTheme, useTheme } from "@studio-baeks/paper-ui";

import { Anchor, Art, Empty, Glyph, Stat, StatRow, Tabs, useFace } from "../../../kit";
import { Ring } from "../content/Ring";
import { baseName } from "../files";
import { bytesText, clockText, grams, hms, longDuration, metres, millimetres, stampText } from "../format";
import { printing, type PrintState } from "../model";
import { JobGlyph } from "../parts/JobStatus";
import { useSettings } from "../settings";
import { fileByPath, layersOf } from "../sim/engine";
import { useActions, useSim } from "../sim/Provider";
import { remainingBy, STATE_LABEL } from "../status";
import { ConfirmDialog } from "../ui/Dialog";
import { Fact, Facts } from "../ui/Controls";

const ProgressRing = ({ value, state }: { value: number; state: PrintState }) => (
  <Ring value={value} size="md" tone={state === "complete" ? "success" : state === "paused" ? "warning" : state === "cancelled" || state === "error" ? "error" : "info"} label={`진행률 ${Math.round(value * 100)}%`} />
);

const Numbers = () => {
  const sim = useSim();
  const { settings, stamp } = useSettings();
  const { print } = sim;
  const live = printing(print.state) || print.state === "complete";
  const layers = layersOf(sim);
  const left = remainingBy(sim, settings.general.estimate);
  const dash = "—";
  return (
    <Stack gap="lg">
      <StatRow min="8.25rem">
        <Stat small label="속도" value={live ? Math.round(sim.velocity) : dash} unit={live ? "mm/s" : undefined} />
        <Stat small label="유량" value={live ? sim.flow.toFixed(1) : dash} unit={live ? "mm³/s" : undefined} />
        <Stat small label="필라멘트" value={live ? (print.filamentUsed / 1000).toFixed(2) : dash} unit={live ? "m" : undefined} />
      </StatRow>
      <Divider />
      <StatRow min="8.25rem">
        <Stat small label="레이어" value={live ? layers.current : dash} unit={live ? `/ ${layers.total}` : undefined} />
        <Stat small label="남은 시간" value={live ? hms(print.state === "complete" ? 0 : left) : dash} />
        <Stat small label="완료 예정" value={live && print.state !== "complete" ? clockText(sim.clock + left * 1000, stamp.hour12) : dash} note={live && print.state === "complete" ? stampText(sim.clock, sim.clock, stamp) : undefined} />
      </StatRow>
      <Inline gap="xl" wrap>
        <Text as="span" variant="caption" ink="tertiary">슬라이서 예상 <Text as="span" variant="caption" ink="secondary" numeric>{live ? hms(print.state === "complete" ? 0 : Math.max(0, (fileByPath(sim, print.file)?.meta.estimatedTime ?? 0) - print.printDuration)) : dash}</Text></Text>
        <Text as="span" variant="caption" ink="tertiary">경과 <Text as="span" variant="caption" ink="secondary" numeric>{live ? hms(print.totalDuration) : dash}</Text></Text>
      </Inline>
    </Stack>
  );
};

const FileTab = () => {
  const sim = useSim();
  const { stamp } = useSettings();
  const file = fileByPath(sim, sim.print.file);
  if (!file) return <Empty glyph="file" title="선택한 파일이 없습니다" description="G-code 파일에서 출력할 파일을 고르세요." action={<Button as={RouterLink} to="/printer/files" size="sm" variant="hairline">파일 열기</Button>} />;
  const { meta } = file;
  return (
    <Stack gap="lg">
      <Box width="sm"><Art seed={file.path} kind="cover" ratio="1 / 1" label={`${file.name} 미리보기`} /></Box>
      <Facts min="9rem">
        <Fact label="크기">{bytesText(file.size)}</Fact>
        <Fact label="슬라이서">{meta.slicer} {meta.slicerVersion}</Fact>
        <Fact label="레이어 높이">{millimetres(meta.layerHeight)}</Fact>
        <Fact label="개체 높이">{millimetres(meta.objectHeight)}</Fact>
        <Fact label="필라멘트">{meta.filamentType} · {grams(meta.filamentWeight)} · {metres(meta.filamentTotal)}</Fact>
        <Fact label="예상 시간">{longDuration(meta.estimatedTime)}</Fact>
        <Fact label="노즐 / 베드">{meta.extruderTemp} / {meta.bedTemp} °C</Fact>
        <Fact label="수정">{stampText(file.modified * 1000, sim.clock, stamp)}</Fact>
      </Facts>
    </Stack>
  );
};

const LastJobs = () => {
  const { history } = useSim();
  const { stamp } = useSettings();
  const { clock } = useSim();
  const jobs = history.filter((job) => job.status !== "in_progress").slice(0, 5);
  return (
    <Stack gap="sm">
      <Stack as="ul" aria-label="최근 출력">
        {jobs.map((job, index) => (
          <Stack as="li" key={job.id}>
            {index > 0 ? <Divider aria-hidden /> : null}
            <Inline justify="between" align="center" gap="md" paddingY="sm" wrap={false}>
              <Inline gap="sm" align="center" minWidth={0}>
                <JobGlyph status={job.status} />
                <Stack minWidth={0}>
                  <Text as="span" truncate>{job.filename}</Text>
                  <Text as="span" variant="label" strong={false} ink="tertiary" truncate>{stampText(job.start * 1000, clock, stamp)}</Text>
                </Stack>
              </Inline>
              <Text as="span" variant="caption" ink="tertiary" numeric>{longDuration(job.printDuration)}</Text>
            </Inline>
          </Stack>
        ))}
      </Stack>
      <Inline><Button as={RouterLink} to="/printer/history" variant="ghost" size="sm">전체 기록 <Glyph name="chevron-right" /></Button></Inline>
    </Stack>
  );
};

const Queue = () => {
  const { queue, files } = useSim();
  const { update } = useActions();
  if (queue.length === 0) {
    return <Empty glyph="list" title="대기열이 비었습니다" description="G-code 파일에서 대기열에 추가하면 지금 출력이 끝난 뒤 차례로 시작합니다." action={<Button as={RouterLink} to="/printer/files" size="sm" variant="hairline">파일 열기</Button>} />;
  }
  return (
    <Stack as="ul" aria-label="출력 대기열">
      {queue.map((path, index) => (
        <Stack as="li" key={path}>
          {index > 0 ? <Divider aria-hidden /> : null}
          <Inline justify="between" align="center" gap="md" paddingY="sm" wrap={false}>
            <Inline gap="sm" align="center" minWidth={0}>
              <Text as="span" variant="caption" ink="tertiary" numeric>{index + 1}</Text>
              <Text as="span" truncate>{files.find((file) => file.path === path)?.name ?? baseName(path)}</Text>
            </Inline>
            <IconButton variant="ghost" size="xs" aria-label={`${baseName(path)} 대기열에서 빼기`} onClick={() => update((s) => ({ ...s, queue: s.queue.filter((item) => item !== path) }))}><Glyph name="x" /></IconButton>
          </Inline>
        </Stack>
      ))}
    </Stack>
  );
};

const Card = ({ children }: { children: (inverted: boolean) => ReactNode }) => {
  const face = useFace();
  const inverted = useResolvedTheme() !== useTheme().resolved;
  return inverted ? <>{children(true)}</> : <Surface as="section" aria-label="출력 상태" {...face} radius="lg">{children(false)}</Surface>;
};

export const StatusPanel = () => {
  const sim = useSim();
  const { send } = useActions();
  const { settings, patch } = useSettings();
  const [cancelling, setCancelling] = useState(false);
  const { print } = sim;
  const open = !settings.collapsed.status;
  const live = printing(print.state);
  const percent = Math.round(print.progress * 100);
  const headline = print.state === "printing" ? `${percent}% ${STATE_LABEL.printing}` : print.state === "paused" ? `${percent}% ${STATE_LABEL.paused}` : STATE_LABEL[print.state];
  const queue = sim.queue.length;
  const reprint = () => print.file && send(`SDCARD_PRINT_FILE FILENAME="${baseName(print.file)}"`);
  return (
    <Anchor>
      <Card>
        {(inverted) => (
          <Stack gap="md" padding={inverted ? undefined : "lg"}>
            <Inline justify="between" align="center" gap="md">
              <Inline gap="md" align="center" minWidth={0}>
                <ProgressRing value={print.state === "complete" ? 1 : print.progress} state={print.state} />
                <Text as="h2" variant="heading" truncate>{headline}</Text>
              </Inline>
              <Inline gap="xs" align="center">
                {print.state === "printing" ? <IconButton accent="warning" variant="soft" size="sm" aria-label="일시 정지" onClick={() => send("PAUSE")}><Glyph name="pause" /></IconButton> : null}
                {print.state === "paused" ? <IconButton accent="success" variant="soft" size="sm" aria-label="이어서 출력" onClick={() => send("RESUME")}><Glyph name="play" /></IconButton> : null}
                {live ? <IconButton accent="error" variant="ghost" size="sm" aria-label="출력 취소" onClick={() => setCancelling(true)}><Glyph name="square" /></IconButton> : null}
                {(print.state === "complete" || print.state === "cancelled") && print.file ? (
                  <>
                    <Button size="sm" variant="hairline" onClick={reprint}><Glyph name="rotate-ccw" />다시 출력</Button>
                    <Button size="sm" variant="ghost" onClick={() => send("SDCARD_RESET_FILE")}>지우기</Button>
                  </>
                ) : null}
                <IconButton variant="ghost" size="sm" aria-label={`출력 상태 ${open ? "접기" : "펼치기"}`} aria-expanded={open} onClick={() => patch("collapsed", { ...settings.collapsed, status: open })}>
                  <Glyph name={open ? "chevron-up" : "chevron-down"} />
                </IconButton>
              </Inline>
            </Inline>
            <Inline gap="sm" align="center" minWidth={0}>
              <Glyph name="file" ink="tertiary" />
              <Text as="span" ink="secondary" truncate>{print.file ?? "선택한 파일 없음"}</Text>
            </Inline>
            {open ? (
              <Tabs
                label="출력 상태 구역"
                stretch
                items={[
                  { id: "status", label: "상태", glyph: "gauge", panel: <Numbers /> },
                  { id: "file", label: "파일", glyph: "file-text", panel: <FileTab /> },
                  { id: "history", label: "기록", glyph: "history", panel: <LastJobs /> },
                  { id: "queue", label: "대기열", glyph: "list", count: queue, panel: <Queue /> },
                ]}
              />
            ) : null}
            <ConfirmDialog
              open={cancelling}
              onClose={() => setCancelling(false)}
              title="출력을 취소할까요?"
              description={`${print.file ?? "지금 출력"}을 멈추고 히터를 끕니다. 취소한 출력은 이어서 할 수 없습니다.`}
              confirmLabel="출력 취소"
              danger
              onConfirm={() => send("CANCEL_PRINT")}
            />
          </Stack>
        )}
      </Card>
    </Anchor>
  );
};

