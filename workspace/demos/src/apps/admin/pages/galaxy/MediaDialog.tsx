// One shot, larger: its details and the choice of showing it outside. The picture is drawn from the file's name, as every
// picture in this demo is; the phone's real files are not here.

import { useRef } from "react";

import { Button, Stack } from "@studio-baeks/paper-ui";

import { Art } from "../../../../kit";
import type { MediaRow } from "../../data/types";
import { formatBytes, formatMoment } from "../../lib/format";
import { useAdmin } from "../../store/store";
import { Dialog } from "../../ui/Dialog";
import { Toggle } from "../../ui/Form";
import { Facts, Mono } from "../../ui/Parts";
import { duration } from "./format";

export const MediaDialog = ({ id, onClose, onToggle }: { id: string | null; onClose: () => void; onToggle: (item: MediaRow, next: boolean) => void }) => {
  const { media } = useAdmin();
  const found = media.find((item) => item.id === id) ?? null;
  const last = useRef<MediaRow | null>(null);
  if (found) last.current = found;
  const item = found ?? last.current;
  return (
    <Dialog open={id !== null} onClose={onClose} title={item?.kind === "video" ? "영상" : "사진"} description={item ? formatMoment(item.takenAt) : undefined} size="md" footer={<Button onClick={onClose}>닫기</Button>}>
      {item ? (
        <Stack gap="xl">
          <Art seed={item.name} kind="photo" ratio="4 / 3" label={`${item.name}의 미리보기`} />
          <Facts
            items={[
              { label: "파일", value: <Mono>{item.name}</Mono> },
              { label: "크기", value: formatBytes(item.size) },
              ...(item.duration !== null ? [{ label: "길이", value: duration(item.duration) }] : []),
            ]}
          />
          <Toggle label="외부 공개" description="켜면 허브 밖의 주소로 이 항목을 볼 수 있습니다." checked={item.shared} onChange={(next) => onToggle(item, next)} />
        </Stack>
      ) : null}
    </Dialog>
  );
};
