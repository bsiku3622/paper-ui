import { useState } from "react";
import { useSearchParams } from "react-router-dom";

import { Badge, Button, Grid, IconButton, Inline, Stack, Surface, Text } from "@studio-baeks/paper-ui";

import { Empty, formatBytes, Glyph, useToast } from "../../../../kit";
import { backupName, type Backup, type BackupKind } from "../../data/admin";
import { useClasses } from "../../state";
import { Card, Hint, Notice } from "../../ui/parts";
import { ConfirmDialog, Mono, stamp, useBriefly, whenLabel } from "./parts";
import { useAdmin } from "./store";

const KIND_LABEL: Record<BackupKind, string> = { auto: "자동", "before-sync": "수집 직전", manual: "수동" };

export const BackupsPanel = () => {
  const { clock } = useClasses();
  const { backups, setBackups } = useAdmin();
  const toast = useToast();
  const [params] = useSearchParams();
  const [busy, refresh] = useBriefly();
  const [saving, save] = useBriefly(1400);
  const rows = [...backups].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const [restoring, setRestoring] = useState<Backup | null>(() => (params.get("dialog") === "restore" ? ([...backups].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] ?? null) : null));
  const total = backups.reduce((sum, item) => sum + item.bytes, 0);

  const snapshot = (note: string | null) => {
    const at = stamp(clock);
    setBackups((list) => [{ name: backupName(at, "manual"), kind: "manual", note, bytes: (rows[0]?.bytes ?? 23_000_000) + 65_536, createdAt: at }, ...list]);
  };

  return (
    <Card
      title="백업"
      description={`매일 새벽 3시 10분과 학기 데이터를 받기 직전에 자동으로 남습니다. 지금 ${backups.length}개, 모두 ${formatBytes(total)}입니다.`}
      padding="lg"
      actions={
        <>
          <Button variant="ghost" size="sm" loading={busy} onClick={() => refresh(() => toast("백업 목록을 새로 받았습니다"))}><Glyph name="refresh-cw" />새로 받기</Button>
          <Button
            variant="solid"
            size="sm"
            loading={saving}
            onClick={() =>
              save(() => {
                snapshot(null);
                toast("지금 상태를 백업했습니다");
              })
            }
          >
            <Glyph name="camera" />지금 백업
          </Button>
        </>
      }
    >
      {rows.length === 0 ? (
        <Empty glyph="archive" title="백업이 없습니다" description="‘지금 백업’으로 첫 백업을 남길 수 있습니다." />
      ) : (
        <Stack as="ul" aria-label="백업 목록">
          {rows.map((item) => (
            <Surface as="li" key={item.name} border="top" paddingY="md">
              <Grid columns="minmax(0, 1fr) auto" gap="md" align="center">
                <Stack gap="xs" minWidth={0}>
                  <Mono strong>{item.name}</Mono>
                  <Inline gap="sm" align="center" wrap>
                    <Badge size="xs" variant="soft">{KIND_LABEL[item.kind]}</Badge>
                    <Text as="span" variant="caption" ink="tertiary" numeric>{[formatBytes(item.bytes), whenLabel(item.createdAt), item.note ?? ""].filter(Boolean).join(" · ")}</Text>
                  </Inline>
                </Stack>
                <Inline gap="xs" align="center">
                  <Button variant="ghost" size="sm" onClick={() => setRestoring(item)}><Glyph name="rotate-ccw" />복원</Button>
                  <IconButton variant="ghost" size="sm" aria-label={`${item.name} 내려받기`} onClick={() => toast("데모라 파일은 받지 않습니다")}><Glyph name="download" /></IconButton>
                </Inline>
              </Grid>
            </Surface>
          ))}
        </Stack>
      )}
      <Hint>백업은 1년이 지나면 저절로 지워집니다. 로그인한 기기의 정보는 백업에 넣지 않습니다.</Hint>

      <ConfirmDialog
        open={restoring !== null}
        onClose={() => setRestoring(null)}
        title="이 시점으로 복원할까요?"
        description={restoring ? `${whenLabel(restoring.createdAt)}에 남긴 백업입니다.` : undefined}
        confirmLabel="복원"
        tone="error"
        onConfirm={() => {
          snapshot("복원 직전");
          setRestoring(null);
          toast("복원했습니다. 복원하기 전의 상태는 새 백업으로 남겼습니다");
        }}
      >
        <Notice tone="warning" glyph="triangle-alert">복원하면 지금의 학기 데이터가 이 백업의 것으로 통째로 바뀝니다. 그 뒤에 받은 데이터와 고친 이름은 사라집니다. 데모라 실제 데이터는 바뀌지 않습니다.</Notice>
      </ConfirmDialog>
    </Card>
  );
};
