import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { Badge, Button, Field, FormField, IconButton, Inline, Select, Stack, Text, Textarea } from "@studio-baeks/paper-ui";

import { Empty, formatBytes, formatDate, Glyph, PageHeader, random, useToast } from "../../../kit";
import { termLabel } from "../data/build";
import { CATEGORIES, CATEGORY_LABEL, extensionOf, makeFile, MEDIA, type Material, type MaterialCategory, type MaterialFile, type MaterialStatus } from "../data/materials";
import { koreanName } from "../lib/utils";
import { useClasses } from "../state";
import { Card, Dialog, Hint, Notice, Rows } from "../ui/parts";

const ALLOWED = ["pdf", "png", "jpg", "jpeg", "webp", "docx", "pptx", "xlsx", "zip"];
const CONVERTED = ["docx", "pptx", "xlsx"];
const MAX_FILES = 20;
const MAX_CONVERTED = 10;
const SAMPLES = ["중간고사_범위_정리.pdf", "연습문제_풀이.pdf", "수업_필기_1.png", "수업_필기_2.png", "발표_자료.pptx", "실험_결과표.xlsx"];

const STATUS: Record<MaterialStatus, { label: string; accent: "warning" | "success" | "error" }> = {
  pending: { label: "검수 대기", accent: "warning" },
  approved: { label: "승인", accent: "success" },
  rejected: { label: "반려", accent: "error" },
};

type Draft = { subject: string; category: MaterialCategory; title: string; description: string };

export const UploadPage = () => {
  const { materials, setMaterials, data, term, me, session, clock } = useClasses();
  const toast = useToast();
  const subjects = useMemo(() => data.subjects.map((subject) => subject.subject), [data]);
  const demo = useSearchParams()[0].get("demo") === "1";
  const [draft, setDraft] = useState<Draft>({ subject: "", category: "lecture_note", title: demo ? "그래프 탐색 정리" : "", description: "" });
  const [files, setFiles] = useState<MaterialFile[]>([]);
  const [tried, setTried] = useState(demo);
  const [editing, setEditing] = useState<Material | null>(null);
  const [edit, setEdit] = useState<Draft | null>(null);

  const mine = materials.filter((item) => item.uploader.stuId === me.stuId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const converted = files.filter((file) => CONVERTED.includes(extensionOf(file.name))).length;
  const problems = [
    files.length > MAX_FILES ? `파일은 한 번에 ${MAX_FILES}개까지 올릴 수 있습니다.` : null,
    converted > MAX_CONVERTED ? `DOCX·PPTX·XLSX는 자료 하나에 ${MAX_CONVERTED}개까지입니다. 서버에서 PDF 미리보기로 바꾸기 때문입니다.` : null,
  ].filter((item): item is string => item !== null);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((now) => ({ ...now, [key]: value }));
  const errors = {
    subject: tried && !draft.subject ? "과목을 고르세요." : undefined,
    title: tried && !draft.title.trim() ? "제목을 적어 주세요." : undefined,
    files: tried && files.length === 0 ? "파일을 하나 이상 고르세요." : undefined,
  };

  const pick = (list: FileList | null) => {
    if (!list) return;
    const r = random(`pick:${Date.now()}`);
    const added: MaterialFile[] = [];
    const rejected: string[] = [];
    Array.from(list).forEach((file, index) => {
      const extension = extensionOf(file.name);
      if (!ALLOWED.includes(extension)) {
        rejected.push(file.name);
        return;
      }
      added.push({ id: Date.now() + index, name: file.name, mediaType: MEDIA[extension] ?? file.type, sizeBytes: file.size, pages: 1 + Math.floor(r() * 5), image: ["png", "jpg", "jpeg", "webp"].includes(extension) });
    });
    setFiles((now) => [...now, ...added]);
    if (rejected.length) toast(`올릴 수 없는 형식입니다: ${rejected.join(", ")}`, { tone: "error" });
  };
  const fillSamples = () => {
    const r = random("samples");
    setFiles(SAMPLES.slice(0, 3).map((name, index) => makeFile(r, Date.now() + index, name.replace(/\.[^.]+$/, ""), extensionOf(name), 0)));
    toast("예시 파일 3개를 넣었습니다");
  };

  const submit = () => {
    setTried(true);
    if (!draft.subject || !draft.title.trim() || files.length === 0 || problems.length > 0) return;
    const now = `${clock.key}T${String(Math.floor(clock.minute / 60)).padStart(2, "0")}:${String(clock.minute % 60).padStart(2, "0")}:00+09:00`;
    const made: Material = {
      id: Math.max(0, ...materials.map((item) => item.id)) + 1,
      term: termLabel(term),
      subject: draft.subject,
      title: draft.title.trim(),
      category: draft.category,
      description: draft.description.trim() || null,
      status: "pending",
      rejectionReason: null,
      primarySyllabus: false,
      files,
      createdAt: now,
      updatedAt: now,
      uploader: { username: session.username, stuId: me.stuId },
      decidedAt: null,
    };
    setMaterials((list) => [made, ...list]);
    setDraft({ subject: "", category: "lecture_note", title: "", description: "" });
    setFiles([]);
    setTried(false);
    toast("올렸습니다. 매니저가 확인하면 자료실에 나타납니다");
  };

  const withdraw = (item: Material) => {
    const before = materials;
    setMaterials((list) => list.filter((other) => other.id !== item.id));
    toast("자료를 철회했습니다", { action: { label: "되돌리기", onSelect: () => setMaterials(before) } });
  };
  const openEdit = (item: Material) => {
    setEditing(item);
    setEdit({ subject: item.subject, category: item.category, title: item.title, description: item.description ?? "" });
  };
  const saveEdit = () => {
    if (!editing || !edit || !edit.title.trim()) return;
    setMaterials((list) => list.map((item) => (item.id === editing.id ? { ...item, title: edit.title.trim(), category: edit.category, description: edit.description.trim() || null, status: item.status === "approved" ? "pending" : item.status, decidedAt: item.status === "approved" ? null : item.decidedAt } : item)));
    toast(editing.status === "approved" ? "고쳤습니다. 다시 검수를 받습니다" : "고쳤습니다");
    setEditing(null);
  };

  return (
    <>
      <PageHeader eyebrow={`${termLabel(term)}학기`} title="자료 올리기" description="수업에서 만든 정리나 학습지를 나누세요. 올린 자료는 매니저가 확인한 뒤에 자료실에 나타납니다." />

      <Card title="새 자료" description="과목을 먼저 고르고, 파일은 최대 20개까지 올릴 수 있습니다.">
        <Stack gap="lg">
          <Inline gap="md" wrap align="start">
            <FormField label="과목" required error={errors.subject}>
              <Select value={draft.subject} onChange={(event) => set("subject", event.target.value)}>
                <Select.Option value="">과목을 고르세요</Select.Option>
                {subjects.map((name) => <Select.Option key={name} value={name}>{koreanName(name)}</Select.Option>)}
              </Select>
            </FormField>
            <FormField label="분류">
              <Select value={draft.category} onChange={(event) => set("category", event.target.value as MaterialCategory)}>
                {CATEGORIES.filter((id) => id !== "syllabus").map((id) => <Select.Option key={id} value={id}>{CATEGORY_LABEL[id]}</Select.Option>)}
              </Select>
            </FormField>
          </Inline>
          <FormField label="제목" required error={errors.title}>
            <Field value={draft.title} placeholder="예: 그래프 탐색 정리" onChange={(event) => set("title", event.target.value)} />
          </FormField>
          <FormField label="설명" description="어떤 범위인지, 어떻게 쓰면 좋은지 적어 주세요.">
            <Textarea rows={3} value={draft.description} onChange={(event) => set("description", event.target.value)} />
          </FormField>
          <FormField label="파일" required error={errors.files} description="PDF, PNG, JPG, WEBP, DOCX, PPTX, XLSX, ZIP. ZIP은 서버가 한 번 더 검사합니다.">
            <Field type="file" multiple accept=".pdf,.png,.jpg,.jpeg,.webp,.docx,.pptx,.xlsx,.zip" onChange={(event) => { pick(event.target.files); event.target.value = ""; }} />
          </FormField>
          {files.length > 0 ? (
            <Stack gap="xs">
              {files.map((file) => (
                <Inline key={file.id} justify="between" align="center" gap="md">
                  <Inline gap="sm" align="center" minWidth={0}>
                    <Glyph name="file" ink="tertiary" />
                    <Text as="span" truncate>{file.name}</Text>
                    <Text as="span" variant="caption" ink="tertiary" numeric>{formatBytes(file.sizeBytes)}</Text>
                  </Inline>
                  <IconButton variant="ghost" size="xs" aria-label={`${file.name} 빼기`} onClick={() => setFiles((now) => now.filter((item) => item.id !== file.id))}><Glyph name="x" /></IconButton>
                </Inline>
              ))}
            </Stack>
          ) : (
            <Hint>고른 파일이 없습니다. <Button variant="ghost" size="xs" onClick={fillSamples}>예시 파일 넣기</Button></Hint>
          )}
          {problems.map((problem) => <Notice key={problem} tone="warning" glyph="triangle-alert">{problem}</Notice>)}
          <Inline justify="end" gap="sm">
            <Button variant="ghost" onClick={() => { setDraft({ subject: "", category: "lecture_note", title: "", description: "" }); setFiles([]); setTried(false); }}>비우기</Button>
            <Button variant="solid" onClick={submit}><Glyph name="upload" />올리기</Button>
          </Inline>
        </Stack>
      </Card>

      <Card title="내가 올린 자료" description={`${mine.length}개 · 검수 대기 ${mine.filter((item) => item.status === "pending").length}개`}>
        {mine.length === 0 ? (
          <Empty glyph="inbox" title="올린 자료가 없습니다" description="위에서 첫 자료를 올려 보세요." />
        ) : (
          <Rows>
            {mine.map((item) => (
              <Inline key={item.id} justify="between" align="start" gap="md" wrap>
                <Stack gap="xs" minWidth={0}>
                  <Inline gap="sm" align="center" wrap>
                    <Text as="span" strong>{item.title}</Text>
                    <Badge size="sm" variant="soft" accent={STATUS[item.status].accent}>{STATUS[item.status].label}</Badge>
                  </Inline>
                  <Text as="span" variant="caption" ink="tertiary">{[koreanName(item.subject), CATEGORY_LABEL[item.category], formatDate(new Date(item.createdAt)), `${item.files.length}개 파일`].join(" · ")}</Text>
                  {item.rejectionReason ? <Text as="span" variant="caption" ink="error">반려 사유 · {item.rejectionReason}</Text> : null}
                </Stack>
                <Inline gap="xs">
                  <Button size="sm" variant="hairline" onClick={() => openEdit(item)}>고치기</Button>
                  {item.status !== "approved" ? <Button size="sm" variant="ghost" accent="error" onClick={() => withdraw(item)}>철회</Button> : null}
                </Inline>
              </Inline>
            ))}
          </Rows>
        )}
        <Hint>승인된 자료를 고치면 다시 검수를 받습니다. 승인된 자료는 철회할 수 없으니 필요하면 매니저에게 요청하세요.</Hint>
      </Card>

      <Dialog
        open={editing !== null}
        onOpenChange={(open) => { if (!open) setEditing(null); }}
        title="자료 고치기"
        description={editing?.status === "approved" ? "승인된 자료를 고치면 다시 검수를 받습니다." : undefined}
        footer={<><Button variant="ghost" onClick={() => setEditing(null)}>취소</Button><Button variant="solid" onClick={saveEdit}>저장</Button></>}
      >
        {edit ? (
          <Stack gap="md">
            <FormField label="제목" required error={!edit.title.trim() ? "제목을 적어 주세요." : undefined}>
              <Field value={edit.title} onChange={(event) => setEdit({ ...edit, title: event.target.value })} />
            </FormField>
            <FormField label="분류">
              <Select value={edit.category} onChange={(event) => setEdit({ ...edit, category: event.target.value as MaterialCategory })}>
                {CATEGORIES.filter((id) => id !== "syllabus").map((id) => <Select.Option key={id} value={id}>{CATEGORY_LABEL[id]}</Select.Option>)}
              </Select>
            </FormField>
            <FormField label="설명">
              <Textarea rows={3} value={edit.description} onChange={(event) => setEdit({ ...edit, description: event.target.value })} />
            </FormField>
          </Stack>
        ) : null}
      </Dialog>
    </>
  );
};
