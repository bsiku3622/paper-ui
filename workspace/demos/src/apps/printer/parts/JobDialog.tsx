// One job of the history: how it ended, when, for how long, how much filament, and what to do with it. A job whose file is
// still on the printer can be printed again (after a confirmation); the job itself can be deleted from the history.

import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";

import { Badge, Button, Divider, Grid, Inline, Stack, Text } from "@studio-baeks/paper-ui";

import { Art, Glyph, useToast } from "../../../kit";
import type { JobStatus } from "../data/history";
import { bytesText, grams, longDuration, metres, millimetres, stampText } from "../format";
import { printing } from "../model";
import { useSettings } from "../settings";
import { useActions, useSim } from "../sim/Provider";
import { Fact, Facts } from "../ui/Controls";
import { ConfirmDialog, Dialog } from "../ui/Dialog";
import { JOB_LABEL, JobGlyph } from "./JobStatus";

export const JobDialog = ({ id, onClose }: { id: string | null; onClose: () => void }) => {
  const sim = useSim();
  const { send, update } = useActions();
  const { stamp } = useSettings();
  const toast = useToast();
  const navigate = useNavigate();
  const [again, setAgain] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const job = id ? sim.history.find((item) => item.id === id) : undefined;
  if (!job) return <Dialog open={false} onClose={onClose} title="작업" />;
  const file = sim.files.find((item) => item.name === job.filename);
  const { meta } = job;
  const busy = printing(sim.print.state);
  return (
    <>
      <Dialog
        open
        onClose={onClose}
        title={job.filename}
        description={`작업 ${job.id}`}
        size="lg"
        footer={
          <>
            <Button variant="ghost" accent="error" onClick={() => setDeleting(true)}><Glyph name="trash-2" />기록에서 삭제</Button>
            {file ? <Button as={RouterLink} to={`/printer/files?file=${encodeURIComponent(file.path)}`} variant="hairline"><Glyph name="file-code" />파일 열기</Button> : null}
            <Button disabled={!file || busy} onClick={() => setAgain(true)}><Glyph name="rotate-ccw" />다시 출력</Button>
          </>
        }
      >
        <Stack gap="lg">
          <Grid columns={{ base: "minmax(0, 1fr)", sm: "8rem minmax(0, 1fr)" }} gap="lg" align="start">
            <Stack gap="sm">
              <Art seed={file?.path ?? job.filename} kind="cover" ratio="1 / 1" label={`${job.filename} 미리보기`} />
              <Badge variant="soft" size="sm" accent={job.status === "completed" ? "success" : job.status === "cancelled" ? "error" : job.status === "in_progress" ? "info" : "warning"} dot>{JOB_LABEL[job.status]}</Badge>
            </Stack>
            <Facts min="10rem">
              <Fact label="시작">{stampText(job.start * 1000, sim.clock, stamp)}</Fact>
              <Fact label="종료">{job.end ? stampText(job.end * 1000, sim.clock, stamp) : "—"}</Fact>
              <Fact label="출력 시간">{job.printDuration > 0 ? longDuration(job.printDuration) : "—"}</Fact>
              <Fact label="총 시간">{job.totalDuration > 1 ? longDuration(job.totalDuration) : "—"}</Fact>
              <Fact label="예상 시간">{meta ? longDuration(meta.estimatedTime) : "—"}</Fact>
              <Fact label="필라멘트 사용">{job.filament < 1000 ? `${job.filament.toFixed(0)} mm` : metres(job.filament)}</Fact>
              <Fact label="슬라이서">{meta ? `${meta.slicer} ${meta.slicerVersion}` : "—"}</Fact>
              <Fact label="개체 높이">{meta ? millimetres(meta.objectHeight) : "—"}</Fact>
              <Fact label="파일 크기">{meta ? bytesText(meta.size) : "—"}</Fact>
              <Fact label="필라멘트 총량">{meta ? `${grams(meta.filamentWeight)} · ${metres(meta.filamentTotal)}` : "—"}</Fact>
            </Facts>
          </Grid>
          <Divider />
          <Outcome job={job.status} exists={Boolean(file)} />
        </Stack>
      </Dialog>
      <ConfirmDialog
        open={again}
        onClose={() => setAgain(false)}
        title="이 파일을 다시 출력할까요?"
        description={`${job.filename}을 처음부터 출력합니다.`}
        confirmLabel="출력 시작"
        onConfirm={() => {
          send(`SDCARD_PRINT_FILE FILENAME="${job.filename}"`);
          toast(`${job.filename} 출력을 시작했습니다 (모의)`);
          onClose();
          navigate("/printer");
        }}
      />
      <ConfirmDialog
        open={deleting}
        onClose={() => setDeleting(false)}
        title="이 작업을 기록에서 지울까요?"
        description="파일은 그대로 두고 기록만 지웁니다. 통계에서도 빠집니다."
        confirmLabel="삭제"
        danger
        onConfirm={() => {
          update((s) => ({ ...s, history: s.history.filter((item) => item.id !== job.id) }));
          toast("작업을 지웠습니다", {
            action: {
              label: "되돌리기",
              onSelect: () => update((s) => (s.history.some((item) => item.id === job.id) ? s : { ...s, history: [...s.history, job].sort((a, b) => b.start - a.start) })),
            },
          });
          onClose();
        }}
      />
    </>
  );
};

const SAYING: Record<JobStatus, string> = {
  completed: "끝까지 마쳤습니다.",
  cancelled: "도중에 취소했습니다.",
  in_progress: "지금 출력 중입니다.",
  klippy_shutdown: "Klipper가 멈추면서 끝났습니다.",
};

const Outcome = ({ job, exists }: { job: JobStatus; exists: boolean }) => (
  <Stack gap="xs">
    <Inline gap="sm" align="center">
      <JobGlyph status={job} label={false} />
      <Text as="span" ink="secondary">{SAYING[job]}</Text>
    </Inline>
    {exists ? null : <Text variant="caption" ink="tertiary">프린터에서 파일이 지워져 다시 출력할 수 없습니다.</Text>}
  </Stack>
);
