import { useEffect, useState, type FormEvent } from "react";

import { Button, Field, FormField, Inline, Stack, Text } from "@studio-baeks/paper-ui";

import type { DocumentData } from "../lib/types";
import { Dialog } from "./Dialog";

export type DialogState =
  | { kind: "new" }
  | { kind: "link"; value: string }
  | { kind: "math"; value: string; target?: HTMLElement }
  | { kind: "import"; data: DocumentData }
  | { kind: "transfer"; data: DocumentData };

const TITLES: Record<DialogState["kind"], string> = {
  new: "새 문서를 시작할까요?",
  link: "링크 편집",
  math: "LaTeX 수식",
  import: "문서 열기",
  transfer: "문서를 Paperdown으로 옮기기",
};

export const DocumentDialog = ({ dialog, onClose, onSubmit, onSave }: { dialog: DialogState | null; onClose: () => void; onSubmit: (value: string) => void; onSave: () => void }) => {
  const [shown, setShown] = useState<DialogState | null>(dialog);
  const [value, setValue] = useState("");
  useEffect(() => {
    if (!dialog) return;
    setShown(dialog);
    setValue(dialog.kind === "link" || dialog.kind === "math" ? dialog.value : "");
  }, [dialog]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit(value);
  };

  if (!shown) return null;
  const withField = shown.kind === "link" || shown.kind === "math";
  return (
    <Dialog open={dialog !== null} onOpenChange={(open) => !open && onClose()} title={TITLES[shown.kind]} restoreFocus={false}>
      <Stack as="form" gap="xl" onSubmit={submit} noValidate>
        {withField ? (
          <FormField label={shown.kind === "link" ? "링크 주소" : "수식 입력"} description={shown.kind === "link" ? "주소를 비우면 링크를 해제합니다." : "삽입한 수식을 클릭하면 다시 편집합니다."}>
            <Field size="md" value={value} placeholder={shown.kind === "link" ? "https://example.com" : "E = mc^2"} onChange={(event) => setValue(event.target.value)} />
          </FormField>
        ) : (
          <Text as="p" ink="secondary">
            {shown.kind === "new" ? "현재 문서를 파일로 내려받아 보관한 뒤 새 문서를 시작합니다." : `“${shown.data.title}” 문서를 불러옵니다. 현재 문서는 먼저 파일로 내려받아 보관합니다.`}
          </Text>
        )}
        <Inline justify="end" gap="sm" wrap>
          <Button variant="hairline" size="sm" onClick={onClose}>취소</Button>
          {shown.kind === "new" ? <Button variant="hairline" size="sm" onClick={onSave}>현재 문서 저장</Button> : null}
          <Button type="submit" size="sm">{shown.kind === "new" ? "새 문서" : withField ? "적용" : "불러오기"}</Button>
        </Inline>
      </Stack>
    </Dialog>
  );
};
