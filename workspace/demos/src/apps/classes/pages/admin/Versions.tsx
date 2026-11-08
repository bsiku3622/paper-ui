import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { Badge, Button, Inline, Pressable, Stack, Surface, Text } from "@studio-baeks/paper-ui";

import { Empty, Glyph, Segmented, useToast } from "../../../../kit";
import type { VersionRow, VersionSource } from "../../data/admin";
import { Card } from "../../ui/parts";
import { Changes } from "./Changes";
import { Mono, useBriefly, whenLabel } from "./parts";
import { useAdmin } from "./store";

const SOURCE_LABEL: Record<VersionSource, string> = { sync: "수집", edit: "수정", seed: "기준점" };

const headline = (row: VersionRow) => {
  const summary = row.summary;
  if (!summary) return row.source === "seed" ? "비교할 앞 회차가 없습니다" : "";
  const net = (name: string, added: number, removed: number) => [name, added ? `+${added}` : "", removed ? `−${removed}` : ""].filter(Boolean).join(" ");
  const parts: string[] = [];
  if (summary.classes.added.length || summary.classes.removed.length) parts.push(net("분반", summary.classes.added.length, summary.classes.removed.length));
  if (summary.enrollments.added || summary.enrollments.removed) parts.push(net("수강", summary.enrollments.added, summary.enrollments.removed));
  if (summary.classes.moved.length) parts.push(`교실 이동 ${summary.classes.moved.length}`);
  if (summary.classes.swapped.length) parts.push(`교사 교체 ${summary.classes.swapped.length}`);
  if (summary.students.renamed || summary.teachersRenamed) parts.push("이름 수정");
  return parts.join(" · ") || "변화 없음";
};

export const VersionsPanel = () => {
  const { versions } = useAdmin();
  const toast = useToast();
  const [params] = useSearchParams();
  const [busy, refresh] = useBriefly();
  const terms = useMemo(() => [...new Set(versions.map((row) => row.term))].sort().reverse(), [versions]);
  const [term, setTerm] = useState(() => terms.find((item) => item === params.get("term")) ?? terms[0] ?? "");
  const rows = useMemo(() => versions.filter((row) => row.term === term).sort((a, b) => b.version - a.version), [versions, term]);
  const [open, setOpen] = useState<number | null>(() => Number(params.get("open")) || rows[0]?.version || null);

  return (
    <Card
      title="데이터 회차"
      description="학기 데이터가 바뀐 때와 바뀐 정도입니다. 수집과 이름 수정이 회차를 하나씩 더하고, 바뀐 것이 없으면 회차를 만들지 않습니다."
      padding="lg"
      actions={
        <Button variant="ghost" size="sm" loading={busy} onClick={() => refresh(() => toast("회차 기록을 새로 받았습니다"))}>
          <Glyph name="refresh-cw" />새로 받기
        </Button>
      }
    >
      {terms.length > 1 ? (
        <Segmented
          label="학기"
          value={term}
          onChange={(id) => {
            setTerm(id);
            setOpen(null);
          }}
          options={terms.map((id) => ({ id, label: id }))}
        />
      ) : null}
      {rows.length === 0 ? (
        <Empty glyph="history" title="회차 기록이 없습니다" description="학기 데이터를 받으면 첫 회차가 생깁니다." />
      ) : (
        <Stack gap="xs">
          {rows.map((row) => {
            const here = open === row.version;
            return (
              <Stack key={row.version} gap="sm">
                <Surface as={Pressable} radius="md" hoverable paddingX="md" paddingY="sm" aria-expanded={here} onPress={() => setOpen(here ? null : row.version)}>
                  <Inline as="span" justify="between" align="center" gap="md">
                    <Stack as="span" gap="xs" minWidth={0}>
                      <Inline as="span" gap="sm" align="center">
                        <Mono strong>v{row.version}</Mono>
                        <Badge size="xs" variant="soft">{SOURCE_LABEL[row.source]}</Badge>
                      </Inline>
                      <Text as="span" variant="caption" ink="tertiary" truncate>{[whenLabel(row.at), headline(row)].filter(Boolean).join(" · ")}</Text>
                    </Stack>
                    <Glyph name={here ? "chevron-up" : "chevron-down"} ink="tertiary" />
                  </Inline>
                </Surface>
                {here ? (
                  <Surface fill="sunken" radius="md" padding="lg">
                    <Stack gap="md">
                      {row.note ? <Text ink="secondary">{row.note}</Text> : null}
                      {row.summary ? <Changes data={row.summary} /> : <Text ink="tertiary">비교할 앞 회차가 없습니다.</Text>}
                      {row.synced !== null ? (
                        <Text variant="caption" ink="tertiary">
                          받은 분반 {row.synced}개 · 건너뛴 분반 {row.skipped ?? 0}개{row.errors ? ` · 오류 ${row.errors}` : ""}{row.elapsed ? ` · ${row.elapsed}` : ""}
                          {row.backup ? <> · 직전 스냅샷 <Mono ink="tertiary">{row.backup}</Mono></> : null}
                        </Text>
                      ) : null}
                    </Stack>
                  </Surface>
                ) : null}
              </Stack>
            );
          })}
        </Stack>
      )}
    </Card>
  );
};
