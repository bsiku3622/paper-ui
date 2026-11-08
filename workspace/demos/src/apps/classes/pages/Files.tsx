import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink, useSearchParams } from "react-router-dom";

import { Badge, Box, Button, Field, Inline, Select, Spinner, Stack, Text } from "@studio-baeks/paper-ui";

import { Empty, formatBytes, formatDate, Glyph, PageHeader, Tabs } from "../../../kit";
import { termLabel } from "../data/build";
import { CATEGORIES, CATEGORY_LABEL, type Material, type MaterialCategory } from "../data/materials";
import { koreanName } from "../lib/utils";
import { path, useClasses } from "../state";
import { Card, Count, Hint, Rows, ScrollTabs } from "../ui/parts";
import { MaterialPreview } from "../ui/MaterialPreview";

const PAGE = 20;
const SORTS = [
  { id: "new", label: "최신순" },
  { id: "subject", label: "과목순" },
  { id: "title", label: "제목순" },
] as const;

export const FilesPage = () => {
  const { materials, data, term } = useClasses();
  const [params, setParams] = useSearchParams();
  const subjectId = Number(params.get("subject")) || null;
  const subjectName = subjectId ? data.subjects.find((subject) => subject.subjectId === subjectId)?.subject : undefined;
  const [category, setCategory] = useState<"all" | MaterialCategory>("all");
  const [subject, setSubject] = useState(subjectName ?? "");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<(typeof SORTS)[number]["id"]>("new");
  const asked = Number(params.get("open")) || null;
  const [open, setOpen] = useState<Material | null>(() => materials.find((item) => item.id === asked && item.status === "approved") ?? null);
  const [limit, setLimit] = useState(PAGE);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 450);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => setSubject(subjectName ?? ""), [subjectName]);

  const approved = useMemo(() => materials.filter((item) => item.status === "approved" && item.term === termLabel(term)), [materials, term]);
  const subjects = useMemo(() => [...new Set(approved.map((item) => item.subject))].sort((a, b) => a.localeCompare(b, "ko")), [approved]);
  const counts = useMemo(() => {
    const out: Record<string, number> = { all: approved.length };
    for (const item of approved) out[item.category] = (out[item.category] ?? 0) + 1;
    return out;
  }, [approved]);

  const shown = useMemo(() => {
    const text = query.trim().toLowerCase();
    const list = approved.filter((item) => (category === "all" || item.category === category) && (!subject || item.subject === subject) && (!text || `${item.title} ${item.subject} ${item.description ?? ""}`.toLowerCase().includes(text)));
    return list.sort((a, b) => (sort === "new" ? b.createdAt.localeCompare(a.createdAt) : sort === "subject" ? a.subject.localeCompare(b.subject, "ko") || a.title.localeCompare(b.title, "ko") : a.title.localeCompare(b.title, "ko")));
  }, [approved, category, subject, query, sort]);

  return (
    <>
      <PageHeader
        eyebrow={`${termLabel(term)}학기`}
        title="자료실"
        description="수업 자료를 과목별로 찾아 봅니다. 학교가 올린 강의계획서와 학생들이 나눈 정리가 한곳에 모입니다."
        actions={<Button as={RouterLink} to={path("/upload")} variant="solid"><Glyph name="upload" />자료 올리기</Button>}
      />

      <ScrollTabs selected={category}>
        <Tabs
          label="자료 분류"
          value={category}
          onChange={(id) => { setCategory(id as "all" | MaterialCategory); setLimit(PAGE); }}
          items={[{ id: "all", label: "전체", count: counts.all }, ...CATEGORIES.map((id) => ({ id, label: CATEGORY_LABEL[id], count: counts[id] ?? 0 }))]}
        />
      </ScrollTabs>

      <Card padding="lg">
        <Inline gap="md" wrap align="center">
          <Box width="xl" maxWidth="full">
            <Field aria-label="자료 찾기" placeholder="제목이나 설명으로 찾기" leading={<Glyph name="search" />} clearable value={query} onChange={(event) => { setQuery(event.target.value); setLimit(PAGE); }} />
          </Box>
          <Box width="lg" maxWidth="full">
            <Select aria-label="과목" value={subject} onChange={(event) => { setSubject(event.target.value); setLimit(PAGE); if (params.has("subject")) setParams({}, { replace: true }); }}>
              <Select.Option value="">모든 과목</Select.Option>
              {subjects.map((name) => <Select.Option key={name} value={name}>{koreanName(name)}</Select.Option>)}
            </Select>
          </Box>
          <Box width="md" maxWidth="full">
            <Select aria-label="정렬" value={sort} onChange={(event) => setSort(event.target.value as typeof sort)}>
              {SORTS.map((item) => <Select.Option key={item.id} value={item.id}>{item.label}</Select.Option>)}
            </Select>
          </Box>
        </Inline>
        <Inline gap="sm" align="center">
          <Text as="span" variant="caption" ink="tertiary" numeric>{shown.length}개의 자료</Text>
          {loading ? <Inline gap="xs" align="center"><Spinner size="inline" label="강의계획서를 불러오는 중" /><Text as="span" variant="caption" ink="tertiary">강의계획서를 불러오는 중</Text></Inline> : null}
        </Inline>

        {shown.length === 0 ? (
          <Empty glyph="folder-open" title="맞는 자료가 없습니다" description="분류나 과목을 바꾸거나, 직접 올려 보세요." action={<Button as={RouterLink} to={path("/upload")} size="sm" variant="hairline">자료 올리기</Button>} />
        ) : (
          <Rows>
            {shown.slice(0, limit).map((item) => (
              <Inline key={item.id} justify="between" align="center" gap="md">
                <Stack gap="xs" minWidth={0}>
                  <Inline gap="sm" align="center" wrap>
                    <Text as="span" strong>{item.title}</Text>
                    {item.primarySyllabus ? <Badge size="sm" variant="soft" accent="info">공식</Badge> : null}
                  </Inline>
                  <Text as="span" variant="caption" ink="tertiary">
                    {[koreanName(item.subject), CATEGORY_LABEL[item.category], item.uploader.username, formatDate(new Date(item.createdAt)), `${item.files.length}개 파일 · ${formatBytes(item.files.reduce((sum, file) => sum + file.sizeBytes, 0))}`].join(" · ")}
                  </Text>
                  {item.description ? <Text as="span" variant="caption" ink="secondary" truncate>{item.description}</Text> : null}
                </Stack>
                <Button variant="hairline" size="sm" onClick={() => setOpen(item)}><Glyph name="eye" />열어 보기</Button>
              </Inline>
            ))}
          </Rows>
        )}
        {shown.length > limit ? <Button variant="hairline" onClick={() => setLimit((value) => value + PAGE)}><Glyph name="plus" />{Math.min(PAGE, shown.length - limit)}개 더 보기</Button> : null}
      </Card>

      <Hint>올라온 자료는 매니저가 검수한 뒤에 보입니다. 교재 본문을 그대로 옮기거나 개인정보가 있는 자료는 반려됩니다. <Count>{materials.filter((item) => item.status === "pending").length}건 검수 대기</Count></Hint>
      <MaterialPreview material={open} onClose={() => setOpen(null)} />
    </>
  );
};
