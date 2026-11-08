import { useEffect, useRef, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";

import { Badge, Box, Button, Divider, Field, FormField, Grid, Inline, Select, Stack, Text } from "@studio-baeks/paper-ui";

import { Art, Glyph, useToast } from "../../../kit";
import { downloadText } from "../content/files";
import { historyOf } from "../files";
import { bytesText, grams, longDuration, metres, millimetres, stampText } from "../format";
import { printing } from "../model";
import { useSettings } from "../settings";
import { useActions, useSim } from "../sim/Provider";
import { Fact, Facts } from "../ui/Controls";
import { ConfirmDialog, Dialog } from "../ui/Dialog";
import { JobGlyph } from "./JobStatus";

export const FileDialog = ({ path, onClose }: { path: string | null; onClose: () => void }) => {
  const sim = useSim();
  const { send, update } = useActions();
  const { stamp } = useSettings();
  const toast = useToast();
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [renaming, setRenaming] = useState<string | null>(null);
  const renameField = useRef<HTMLInputElement>(null);
  const renameOpen = renaming !== null;
  useEffect(() => {
    if (renameOpen) renameField.current?.focus();
  }, [renameOpen]);
  const file = path ? sim.files.find((item) => item.path === path) : undefined;
  const busy = printing(sim.print.state);
  if (!file) return <Dialog open={false} onClose={onClose} title="파일" />;
  const { meta } = file;
  const record = historyOf(sim.history, file.name);
  const jobs = sim.history.filter((job) => job.filename === file.name && job.status !== "in_progress").slice(0, 3);
  const queued = sim.queue.includes(file.path);
  const folders = ["", ...sim.folders];
  const start = () => {
    send(`SDCARD_PRINT_FILE FILENAME="${file.name}"`);
    toast(`${file.name} 출력을 시작했습니다 (모의)`);
    onClose();
    navigate("/printer");
  };
  const move = (folder: string) => {
    const next = folder ? `${folder}/${file.name}` : file.name;
    update((s) => ({ ...s, files: s.files.map((item) => (item.path === file.path ? { ...item, path: next, folder } : item)), queue: s.queue.map((item) => (item === file.path ? next : item)) }));
    toast(`${folder || "/gcodes"} 폴더로 옮겼습니다`);
    onClose();
  };
  const rename = () => {
    const name = (renaming ?? "").trim();
    if (!name || name === file.name) return setRenaming(null);
    const final = name.endsWith(".gcode") ? name : `${name}.gcode`;
    const next = file.folder ? `${file.folder}/${final}` : final;
    update((s) => ({ ...s, files: s.files.map((item) => (item.path === file.path ? { ...item, name: final, path: next } : item)), queue: s.queue.map((item) => (item === file.path ? next : item)) }));
    toast("이름을 바꿨습니다");
    setRenaming(null);
    onClose();
  };
  return (
    <>
      <Dialog
        open
        onClose={onClose}
        title={file.name}
        description={file.folder ? `/gcodes/${file.folder}` : "/gcodes"}
        size="lg"
        footer={
          <>
            <Button variant="ghost" accent="error" onClick={() => setDeleting(true)}><Glyph name="trash-2" />삭제</Button>
            <Button variant="ghost" onClick={() => setRenaming(file.name)}><Glyph name="pencil" />이름 바꾸기</Button>
            <Button variant="ghost" onClick={() => downloadText(file.name, `; ${file.name} (모의 G-code)\n; 실제 파일은 프린터에 있습니다.\nG28\nG1 Z10 F600\n`)}><Glyph name="download" />내려받기</Button>
            <Button as={RouterLink} to={`/printer/viewer?file=${encodeURIComponent(file.path)}`} variant="hairline"><Glyph name="layers" />뷰어에서 보기</Button>
            <Button variant="hairline" disabled={queued} onClick={() => { update((s) => ({ ...s, queue: [...s.queue, file.path] })); toast("대기열에 추가했습니다"); }}><Glyph name="list" />{queued ? "대기열에 있음" : "대기열에 추가"}</Button>
            <Button disabled={busy} onClick={() => setConfirming(true)}><Glyph name="play" />출력 시작</Button>
          </>
        }
      >
        <Stack gap="lg">
          <Grid columns={{ base: "minmax(0, 1fr)", sm: "9rem minmax(0, 1fr)" }} gap="lg" align="start">
            <Stack gap="sm">
              <Art seed={file.path} kind="cover" ratio="1 / 1" label={`${file.name} 미리보기`} />
              <Inline gap="xs" wrap>
                <Badge variant="soft" size="sm">{meta.filamentType}</Badge>
                {record.last?.status === "in_progress" ? <Badge accent="info" variant="soft" size="sm" dot>출력 중</Badge> : null}
              </Inline>
            </Stack>
            <Facts min="10rem">
              <Fact label="크기">{bytesText(file.size)}</Fact>
              <Fact label="수정">{stampText(file.modified * 1000, sim.clock, stamp)}</Fact>
              <Fact label="슬라이서">{meta.slicer} {meta.slicerVersion}</Fact>
              <Fact label="예상 시간">{longDuration(meta.estimatedTime)}</Fact>
              <Fact label="레이어 높이">{millimetres(meta.layerHeight)}</Fact>
              <Fact label="개체 높이">{millimetres(meta.objectHeight)}</Fact>
              <Fact label="레이어 수">{meta.layerCount}</Fact>
              <Fact label="노즐 지름">{millimetres(meta.nozzle)}</Fact>
              <Fact label="필라멘트">{grams(meta.filamentWeight)} · {metres(meta.filamentTotal)}</Fact>
              <Fact label="노즐 / 베드">{meta.extruderTemp} / {meta.bedTemp} °C</Fact>
            </Facts>
          </Grid>
          <Divider />
          <Stack gap="sm">
            <Text as="h3" variant="subheading">출력 기록</Text>
            {record.count === 0 ? (
              <Text ink="tertiary">아직 출력한 적이 없습니다.</Text>
            ) : (
              <>
                <Text ink="secondary" numeric>{record.count}번 출력했고 {record.completed}번 끝까지 마쳤습니다.</Text>
                <Stack as="ul" aria-label="최근 출력">
                  {jobs.map((job, index) => (
                    <Stack as="li" key={job.id}>
                      {index > 0 ? <Divider aria-hidden /> : null}
                      <Inline justify="between" align="center" gap="md" paddingY="sm">
                        <Inline gap="sm" align="center"><JobGlyph status={job.status} /><Text as="span">{stampText(job.start * 1000, sim.clock, stamp)}</Text></Inline>
                        <Text as="span" ink="tertiary" numeric>{longDuration(job.printDuration)}</Text>
                      </Inline>
                    </Stack>
                  ))}
                </Stack>
              </>
            )}
          </Stack>
          {renaming !== null ? (
            <Inline gap="sm" align="end" wrap>
              <Box width="xl" maxWidth="full"><FormField label="새 이름"><Field ref={renameField} value={renaming} onChange={(event) => setRenaming(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") rename(); }} /></FormField></Box>
              <Button onClick={rename}>바꾸기</Button>
              <Button variant="ghost" onClick={() => setRenaming(null)}>취소</Button>
            </Inline>
          ) : null}
          <FormField label="위치">
            <Select value={file.folder} onChange={(event) => move(event.target.value)}>
              {folders.map((folder) => <Select.Option key={folder} value={folder}>{folder ? `/gcodes/${folder}` : "/gcodes"}</Select.Option>)}
            </Select>
          </FormField>
          {busy ? <Text variant="caption" ink="tertiary">지금 출력 중이라 시작할 수 없습니다. 대기열에 추가하면 이어서 출력합니다.</Text> : null}
        </Stack>
      </Dialog>
      <ConfirmDialog
        open={confirming}
        onClose={() => setConfirming(false)}
        title="이 파일을 출력할까요?"
        description={`${file.name}을 지금 출력합니다. 예상 시간은 ${longDuration(meta.estimatedTime)}이고 노즐 ${meta.extruderTemp}°C, 베드 ${meta.bedTemp}°C로 데웁니다.`}
        confirmLabel="출력 시작"
        onConfirm={start}
      >
        <Text ink="tertiary" variant="caption">모의 프린터에서만 시작합니다. 실제 프린터에는 아무것도 보내지 않습니다.</Text>
      </ConfirmDialog>
      <ConfirmDialog
        open={deleting}
        onClose={() => setDeleting(false)}
        title="파일을 삭제할까요?"
        description={`${file.name}을 삭제합니다. 출력 기록은 남습니다.`}
        confirmLabel="삭제"
        danger
        onConfirm={() => {
          const wasQueued = sim.queue.includes(file.path);
          update((s) => ({ ...s, files: s.files.filter((item) => item.path !== file.path), queue: s.queue.filter((item) => item !== file.path) }));
          toast("파일을 삭제했습니다", {
            action: {
              label: "되돌리기",
              onSelect: () => update((s) => (s.files.some((item) => item.path === file.path) ? s : { ...s, files: [...s.files, file], queue: wasQueued ? [...s.queue, file.path] : s.queue })),
            },
          });
          onClose();
        }}
      />
    </>
  );
};
