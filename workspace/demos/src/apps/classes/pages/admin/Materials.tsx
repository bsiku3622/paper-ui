import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { Badge, Box, Button, Divider, Field, FormField, Grid, IconButton, Inline, Pressable, Select, Stack, Surface, Switch, Text } from "@studio-baeks/paper-ui";
import type { Accent } from "@studio-baeks/paper-ui/tokens";

import { Art, Empty, formatBytes, Glyph, Segmented, useToast } from "../../../../kit";
import { termData, TERMS, termLabel } from "../../data/build";
import { CATEGORIES, CATEGORY_LABEL, extensionOf, type Material, type MaterialCategory, type MaterialFile, type MaterialStatus } from "../../data/materials";
import { useClasses } from "../../state";
import { Card, Dialog, Eyebrow, Hint } from "../../ui/parts";
import { ConfirmDialog, Mono, Pager, stamp, useBriefly, whenLabel } from "./parts";

type Filter = MaterialStatus | "all";
const FILTERS: readonly Filter[] = ["pending", "approved", "rejected", "all"];
const FILTER_LABEL: Record<Filter, string> = { pending: "대기", approved: "승인", rejected: "거절", all: "전체" };
const STATUS_ACCENT: Record<MaterialStatus, Accent> = { pending: "warning", approved: "success", rejected: "error" };
const PAGE = 12;

type Draft = { title: string; subject: string; category: MaterialCategory; description: string; reason: string; primary: boolean };
const draftOf = (material: Material): Draft => ({
  title: material.title,
  subject: material.subject,
  category: material.category,
  description: material.description ?? "",
  reason: material.rejectionReason ?? "",
  primary: material.primarySyllabus,
});

const queue = (materials: readonly Material[], filter: Filter) =>
  materials
    .filter((material) => filter === "all" || material.status === filter)
    .sort((a, b) => (filter === "pending" ? a.createdAt.localeCompare(b.createdAt) : b.createdAt.localeCompare(a.createdAt)));

const subjectNames = new Map<string, string[]>();
const subjectsOf = (term: string, current: string) => {
  let names = subjectNames.get(term);
  if (!names) {
    const key = TERMS.find((item) => termLabel(item) === term) ?? TERMS[0]!;
    names = termData(key).subjects.map((subject) => subject.subject);
    subjectNames.set(term, names);
  }
  return names.includes(current) ? names : [current, ...names];
};

type Target = { material: Material; file: MaterialFile };

const PreviewBody = ({ file }: { file: MaterialFile }) => {
  const [page, setPage] = useState(1);
  return (
    <Stack gap="md" align="center">
      <Box width="full" maxWidth="xl">
        {file.image ? (
          <Art seed={`material-${file.id}`} kind="photo" ratio="4 / 3" label={`${file.name} 미리보기`} />
        ) : (
          <Art seed={`material-${file.id}-${page}`} kind="document" ratio="3 / 4" grid={file.id % 4 === 0} label={`${file.name} ${page}쪽`} />
        )}
      </Box>
      {file.pages > 1 ? <Pager page={page} pages={file.pages} onPage={setPage} /> : null}
      <Hint>시연용 미리보기입니다. 파일의 내용이 아니라 쪽의 모양만 그립니다.</Hint>
    </Stack>
  );
};

type ItemProps = {
  material: Material;
  draft: Draft;
  open: boolean;
  needsReason: boolean;
  onToggle: () => void;
  onDraft: (patch: Partial<Draft>) => void;
  onDecide: (status: "approved" | "rejected") => void;
  onDelete: () => void;
  onPreview: (file: MaterialFile) => void;
  onDownload: (file: MaterialFile) => void;
};

const Item = ({ material, draft, open, needsReason, onToggle, onDraft, onDecide, onDelete, onPreview, onDownload }: ItemProps) => {
  const subjects = subjectsOf(material.term, material.subject);
  const summary = [material.subject, CATEGORY_LABEL[material.category], `파일 ${material.files.length}개`, material.uploader.username, whenLabel(material.createdAt)].join(" · ");
  return (
    <Stack gap="sm">
      <Surface as={Pressable} radius="md" hoverable paddingX="md" paddingY="sm" aria-expanded={open} onPress={onToggle}>
        <Inline as="span" justify="between" align="center" gap="md">
          <Stack as="span" gap="xs" minWidth={0}>
            <Inline as="span" gap="sm" align="center" minWidth={0}>
              <Text as="span" strong truncate>{material.title}</Text>
              <Badge size="xs" variant="soft" accent={STATUS_ACCENT[material.status]}>{FILTER_LABEL[material.status]}</Badge>
              {material.primarySyllabus ? <Badge size="xs" variant="soft"><Glyph name="star" />대표</Badge> : null}
            </Inline>
            <Text as="span" variant="caption" ink="tertiary" truncate>{summary}</Text>
          </Stack>
          <Glyph name={open ? "chevron-up" : "chevron-down"} ink="tertiary" />
        </Inline>
      </Surface>
      {open ? (
        <Surface fill="sunken" radius="md" padding="lg">
          <Stack gap="lg">
            <Grid columns={{ base: 1, md: 2 }} gap="md">
              <FormField label="제목">
                <Field value={draft.title} onChange={(event) => onDraft({ title: event.target.value })} />
              </FormField>
              <FormField label="과목">
                <Select value={draft.subject} onChange={(event) => onDraft({ subject: event.target.value })}>
                  {subjects.map((name) => <Select.Option key={name} value={name}>{name}</Select.Option>)}
                </Select>
              </FormField>
              <FormField label="유형">
                <Select value={draft.category} onChange={(event) => onDraft({ category: event.target.value as MaterialCategory, primary: event.target.value === "syllabus" && draft.primary })}>
                  {CATEGORIES.map((category) => <Select.Option key={category} value={category}>{CATEGORY_LABEL[category]}</Select.Option>)}
                </Select>
              </FormField>
              <FormField label="설명">
                <Field value={draft.description} placeholder="없으면 비워 둡니다" onChange={(event) => onDraft({ description: event.target.value })} />
              </FormField>
            </Grid>

            <Stack gap="xs">
              <Eyebrow>파일 {material.files.length}개</Eyebrow>
              <Stack as="ul">
                {material.files.map((file) => (
                  <Surface as="li" key={file.id} border="top" paddingY="sm">
                    <Inline justify="between" align="center" gap="md">
                      <Inline gap="sm" align="center" minWidth={0}>
                        <Glyph name={file.image ? "image" : "file-text"} ink="tertiary" />
                        <Stack minWidth={0}>
                          <Text as="span" truncate>{file.name}</Text>
                          <Text as="span" variant="caption" ink="tertiary" numeric>{extensionOf(file.name).toUpperCase()} · {formatBytes(file.sizeBytes)} · {file.pages}쪽</Text>
                        </Stack>
                      </Inline>
                      <Inline gap="xs">
                        <IconButton variant="ghost" size="sm" aria-label={`${file.name} 미리보기`} onClick={() => onPreview(file)}><Glyph name="eye" /></IconButton>
                        <IconButton variant="ghost" size="sm" aria-label={`${file.name} 내려받기`} onClick={() => onDownload(file)}><Glyph name="download" /></IconButton>
                      </Inline>
                    </Inline>
                  </Surface>
                ))}
              </Stack>
            </Stack>

            <Divider />

            <Grid columns={{ base: 1, md: "minmax(0, 1fr) auto" }} gap="lg" align="end">
              <Stack gap="md">
                <FormField label="거절 사유" description="거절할 때만 적습니다. 올린 학생에게 그대로 보입니다." invalid={needsReason} error="거절 사유를 적어 주세요.">
                  <Field value={draft.reason} placeholder="예: 파일이 열리지 않습니다." onChange={(event) => onDraft({ reason: event.target.value })} />
                </FormField>
                {draft.category === "syllabus" ? (
                  <Inline as="label" gap="sm" align="center">
                    <Switch checked={draft.primary} onChange={(event) => onDraft({ primary: event.target.checked })} />
                    <Text as="span">대표 강의계획서로 지정</Text>
                  </Inline>
                ) : null}
              </Stack>
              <Inline gap="sm" justify="end" wrap>
                <IconButton variant="ghost" aria-label={`${material.title} 삭제`} onClick={onDelete}><Glyph name="trash-2" /></IconButton>
                <Button variant="hairline" accent="error" onClick={() => onDecide("rejected")}><Glyph name="x" />거절</Button>
                <Button variant="solid" onClick={() => onDecide("approved")}><Glyph name="check" />{material.status === "approved" ? "수정 저장" : "승인"}</Button>
              </Inline>
            </Grid>

            <Text variant="caption" ink="tertiary">
              올린 사람 <Mono>{material.uploader.username}</Mono> · 학번 <Mono>{material.uploader.stuId}</Mono>
              {material.decidedAt ? ` · ${whenLabel(material.decidedAt)}에 ${material.status === "approved" ? "승인" : "거절"}` : ""}
            </Text>
          </Stack>
        </Surface>
      ) : null}
    </Stack>
  );
};

export const MaterialsPanel = () => {
  const { materials, setMaterials, clock } = useClasses();
  const toast = useToast();
  const [params] = useSearchParams();
  const asked = FILTERS.find((item) => item === params.get("filter")) ?? "pending";
  const [filter, setFilter] = useState<Filter>(asked);
  const [drafts, setDrafts] = useState<Record<number, Draft>>({});
  const [open, setOpen] = useState<number[]>(() => {
    const wanted = Number(params.get("open"));
    if (wanted) return [wanted];
    const first = queue(materials, asked)[0];
    return first ? [first.id] : [];
  });
  const [limit, setLimit] = useState(() => {
    const at = queue(materials, asked).findIndex((item) => item.id === Number(params.get("open")));
    return at >= PAGE ? (Math.floor(at / PAGE) + 1) * PAGE : PAGE;
  });
  const [needsReason, setNeedsReason] = useState<number | null>(null);
  const [preview, setPreview] = useState<Target | null>(() => {
    const first = queue(materials, "pending")[0];
    const file = first?.files[0];
    return params.get("dialog") === "preview" && first && file ? { material: first, file } : null;
  });
  const [removing, setRemoving] = useState<Material | null>(() => (params.get("dialog") === "delete" ? queue(materials, "pending")[0] ?? null : null));
  const [busy, refresh] = useBriefly();

  const counts = useMemo(
    () => ({ pending: materials.filter((item) => item.status === "pending").length, approved: materials.filter((item) => item.status === "approved").length, rejected: materials.filter((item) => item.status === "rejected").length, all: materials.length }),
    [materials],
  );
  const rows = useMemo(() => queue(materials, filter), [materials, filter]);
  const draftFor = (material: Material) => drafts[material.id] ?? draftOf(material);
  const patchDraft = (material: Material, patch: Partial<Draft>) => {
    setDrafts((now) => ({ ...now, [material.id]: { ...draftFor(material), ...patch } }));
    if (patch.reason !== undefined) setNeedsReason(null);
  };
  const forget = (id: number) => setDrafts((now) => Object.fromEntries(Object.entries(now).filter(([key]) => Number(key) !== id)));

  const decide = (material: Material, status: "approved" | "rejected") => {
    const draft = draftFor(material);
    if (!draft.title.trim()) {
      toast("제목을 적어 주세요", { tone: "error" });
      return;
    }
    if (status === "rejected" && !draft.reason.trim()) {
      setNeedsReason(material.id);
      toast("거절 사유를 적어 주세요", { tone: "error" });
      return;
    }
    const before = materials;
    const when = stamp(clock);
    const primary = status === "approved" && draft.category === "syllabus" && draft.primary;
    setMaterials((list) =>
      list.map((item) => {
        if (item.id === material.id) {
          return {
            ...item,
            title: draft.title.trim(),
            subject: draft.subject,
            category: draft.category,
            description: draft.description.trim() || null,
            status,
            rejectionReason: status === "rejected" ? draft.reason.trim() : null,
            primarySyllabus: primary,
            updatedAt: when,
            decidedAt: when,
          };
        }
        return primary && item.term === material.term && item.subject === draft.subject && item.primarySyllabus ? { ...item, primarySyllabus: false } : item;
      }),
    );
    forget(material.id);
    setNeedsReason(null);
    setOpen((now) => now.filter((id) => id !== material.id));
    toast(status === "approved" ? "승인했습니다. 자료실에 나타납니다" : "거절했습니다. 사유가 올린 학생에게 보입니다", { action: { label: "되돌리기", onSelect: () => setMaterials(before) } });
  };

  const remove = (material: Material) => {
    setMaterials((list) => list.filter((item) => item.id !== material.id));
    forget(material.id);
    setRemoving(null);
    toast("삭제했습니다. 저장된 파일도 함께 지웠습니다");
  };

  return (
    <Card
      title="검수할 자료"
      description="학생이 올린 자료를 확인해 승인하거나 거절합니다. 승인한 자료만 자료실에 나타나고, 올린 학생의 학번은 이 화면에서만 보입니다."
      padding="lg"
      actions={
        <Button
          variant="ghost"
          size="sm"
          loading={busy}
          onClick={() =>
            refresh(() => {
              setDrafts({});
              setNeedsReason(null);
              toast("검수 목록을 새로 받았습니다");
            })
          }
        >
          <Glyph name="refresh-cw" />새로 받기
        </Button>
      }
    >
      <Segmented
        label="검수 상태"
        value={filter}
        onChange={(id) => {
          setFilter(id as Filter);
          setLimit(PAGE);
        }}
        options={FILTERS.map((id) => ({ id, label: FILTER_LABEL[id], count: counts[id] }))}
      />

      {rows.length === 0 ? (
        <Empty
          glyph="file-check-2"
          title={filter === "pending" ? "검수할 자료가 없습니다" : "해당하는 자료가 없습니다"}
          description={filter === "pending" ? "새로 올라온 자료가 있으면 여기에 모입니다." : "다른 상태를 골라 보세요."}
        />
      ) : (
        <Stack gap="xs">
          {rows.slice(0, limit).map((material) => (
            <Item
              key={material.id}
              material={material}
              draft={draftFor(material)}
              open={open.includes(material.id)}
              needsReason={needsReason === material.id}
              onToggle={() => setOpen((now) => (now.includes(material.id) ? now.filter((id) => id !== material.id) : [...now, material.id]))}
              onDraft={(patch) => patchDraft(material, patch)}
              onDecide={(status) => decide(material, status)}
              onDelete={() => setRemoving(material)}
              onPreview={(file) => setPreview({ material, file })}
              onDownload={() => toast("데모라 파일은 받지 않습니다")}
            />
          ))}
        </Stack>
      )}
      {rows.length > limit ? (
        <Inline justify="center">
          <Button variant="ghost" size="sm" onClick={() => setLimit((now) => now + PAGE)}><Glyph name="plus" />더 보기 ({rows.length - limit})</Button>
        </Inline>
      ) : null}

      <Dialog
        open={preview !== null}
        onOpenChange={(next) => {
          if (!next) setPreview(null);
        }}
        title={preview?.file.name ?? "미리보기"}
        description={preview ? `${preview.material.title} · ${preview.material.uploader.username}` : undefined}
        size="measure.sm"
      >
        {preview ? <PreviewBody key={preview.file.id} file={preview.file} /> : null}
      </Dialog>

      <ConfirmDialog
        open={removing !== null}
        onClose={() => setRemoving(null)}
        title="자료를 지울까요?"
        description={removing ? `“${removing.title}”과 저장된 파일 ${removing.files.length}개를 지웁니다. 자료실에서도 사라지고 되돌릴 수 없습니다.` : undefined}
        confirmLabel="삭제"
        tone="error"
        onConfirm={() => {
          if (removing) remove(removing);
        }}
      />
    </Card>
  );
};
