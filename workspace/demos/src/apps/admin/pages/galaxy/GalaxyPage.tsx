// Galaxy S23+: a real hub only hands you over to the viewer, a separate app, and the menu and the card go there directly. A demo must not leave, so the entry is drawn — the spinner and the
// words — and then, instead of leaving, the page shows what the viewer's side holds: the phone's latest shots, with the one
// choice the hub owns, whether each is shown outside. ?entry keeps the entry on screen; ?viewer skips it.

import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { Badge, Box, Button, Field, Grid, Inline, Pressable, Spinner, Stack, Surface, Switch, Text } from "@studio-baeks/paper-ui";

import { Art, Empty, Glyph, PageHeader, Stat, useFace, useToast } from "../../../../kit";
import { GALAXY } from "../../data/galaxy";
import type { MediaRow } from "../../data/types";
import { messageOf } from "../../lib/errors";
import { formatBytes, formatMoment, formatNumber, since } from "../../lib/format";
import { LATENCY, useDelay, useDemoState } from "../../lib/hooks";
import { useGalaxyApi } from "../../store/api";
import { useAdmin } from "../../store/store";
import { Card } from "../../ui/Card";
import { Choice } from "../../ui/Choice";
import { Alert, Loading, Note } from "../../ui/Parts";
import { Summary } from "../../ui/Summary";
import { MediaDialog } from "./MediaDialog";
import { duration } from "./format";

const FILTERS = [
  { id: "all", label: "전체" },
  { id: "photo", label: "사진" },
  { id: "video", label: "영상" },
  { id: "shared", label: "공개 중" },
] as const;

const Entry = ({ onSkip, waiting }: { onSkip: () => void; waiting: boolean }) => (
  <Stack as="section" aria-label="Galaxy S23+ 뷰어로 이동" align="center" paddingY="3xl">
    <Stack width="full" maxWidth="measure.xs">
      <Card padding="2xl" gap="xl">
        <Stack gap="lg" align="center">
          <Glyph name="film" size="subheading" ink="secondary" />
          <Inline gap="sm">
            <Spinner label="뷰어로 이동하는 중" />
            <Text as="span" variant="caption">Galaxy S23+ 뷰어로 이동합니다.</Text>
          </Inline>
          <Text as="p" variant="caption" ink="tertiary" role="status">
            {waiting ? "데모에서는 뷰어로 나가지 않고, 이 화면에서 미리 보여 드립니다." : "이동하지 않고 이 화면에 머뭅니다."}
          </Text>
          <Button variant="hairline" onClick={onSkip}>바로 보기<Glyph name="arrow-right" /></Button>
        </Stack>
      </Card>
    </Stack>
  </Stack>
);

export const GalaxyPage = () => {
  const [params] = useSearchParams();
  const stay = params.has("entry");
  const [phase, setPhase] = useState<"entry" | "viewer">(params.has("viewer") ? "viewer" : "entry");
  useEffect(() => {
    if (phase !== "entry" || stay) return;
    const timer = window.setTimeout(() => setPhase("viewer"), 1600);
    return () => window.clearTimeout(timer);
  }, [phase, stay]);

  const { media: stored } = useAdmin();
  const { setShared } = useGalaxyApi();
  const toast = useToast();
  const face = useFace();
  const demo = useDemoState();
  const { ready, reload } = useDelay(LATENCY.list);
  const ok = ready && demo !== "error";
  const waiting = demo === "error" ? "확인하지 못했습니다" : "불러오는 중…";
  const [filter, setFilter] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string | null>(params.get("dialog") === "media" ? (stored[1]?.id ?? null) : null);
  const [error, setError] = useState<string | null>(null);

  if (phase === "entry") {
    return (
      <>
        <PageHeader title="Galaxy S23+" description="휴대폰 영상과 사진을 보고, 외부 공개 여부를 관리합니다." />
        <Entry waiting={!stay} onSkip={() => setPhase("viewer")} />
      </>
    );
  }

  const media = demo === "empty" ? [] : stored;
  const shared = media.filter((item) => item.shared).length;
  const shown = media.filter((item) => {
    if (filter === "photo" || filter === "video") return item.kind === filter;
    if (filter === "shared") return item.shared;
    return true;
  }).filter((item) => item.name.toLowerCase().includes(query.trim().toLowerCase()));
  const counts = { all: media.length, photo: media.filter((item) => item.kind === "photo").length, video: media.filter((item) => item.kind === "video").length, shared };

  const toggle = async (item: MediaRow, next: boolean) => {
    setError(null);
    try {
      await setShared(item.id, next);
      toast(next ? "외부에 공개했습니다" : "외부 공개를 껐습니다");
    } catch (reason) {
      setError(messageOf(reason, "공개 여부를 바꾸지 못했습니다."));
    }
  };

  return (
    <>
      <PageHeader
        title="Galaxy S23+"
        description="휴대폰 영상과 사진을 보고, 외부 공개 여부를 관리합니다."
        actions={
          <>
            <Button variant="ghost" onClick={reload}><Glyph name="refresh-cw" />새로고침</Button>
            <Button variant="hairline" onClick={() => toast("데모에서는 외부 뷰어로 이동하지 않습니다")}>뷰어 열기<Glyph name="external-link" /></Button>
          </>
        }
      />

      <Summary>
        <Stat label="사진" value={ok ? formatNumber(GALAXY.photos) : "–"} unit="장" note={ok ? `가장 오래된 것 ${formatMoment(GALAXY.oldest())}` : waiting} />
        <Stat label="영상" value={ok ? GALAXY.videos : "–"} unit="개" note={ok ? "휴대폰에 있는 것" : waiting} />
        <Stat label="외부 공개" value={ok ? shared + GALAXY.sharedOlder : "–"} unit="개" note={ok ? `최근 24개 중 ${shared}개` : waiting} />
        <Stat label="마지막 동기화" value={ok ? since(GALAXY.syncedAt()) : "–"} note={ok ? `저장 공간 ${GALAXY.storageUsed} / ${GALAXY.storageTotal} GB` : waiting} />
      </Summary>

      <Note glyph="info" live={false}>이 화면은 뷰어가 아니라 허브가 맡은 부분입니다. 사진과 영상은 휴대폰에서 데스크탑 뷰어로 모이고, 허브는 무엇을 밖에 보여 줄지만 정합니다.</Note>

      {error ? <Alert>{error}</Alert> : null}
      {demo === "error" ? <Alert action={<Button size="sm" variant="hairline" onClick={reload}>다시 시도</Button>}>휴대폰 목록을 불러오지 못했습니다. 휴대폰이 꺼져 있을 수 있습니다.</Alert> : null}

      <Stack gap="lg">
        <Inline justify="between" align="center" gap="md" wrap>
          <Choice label="보기" value={filter} onChange={setFilter} options={FILTERS.map((item) => ({ id: item.id, label: item.label, count: ready ? counts[item.id] : undefined }))} />
          <Box width="lg" maxWidth="full">
            <Field size="sm" shape="pill" fill="sunken" leading={<Glyph name="search" />} aria-label="파일 이름으로 찾기" placeholder="파일 이름" value={query} clearable onClear={() => setQuery("")} onChange={(event) => setQuery(event.currentTarget.value)} />
          </Box>
        </Inline>

        {!ready ? (
          <Loading label="사진과 영상 불러오는 중" />
        ) : demo === "error" ? null : shown.length === 0 ? (
          <Card><Empty glyph="image-off" title={media.length === 0 ? "아직 가져온 사진이 없습니다" : "조건에 맞는 항목이 없습니다"} action={media.length > 0 ? <Button variant="hairline" onClick={() => { setFilter("all"); setQuery(""); }}>조건 지우기</Button> : undefined} /></Card>
        ) : (
          <Grid columns="repeat(auto-fill, minmax(12rem, 1fr))" gap="lg" as="ul">
            {shown.map((item) => (
              <Surface key={item.id} as="li" {...face} radius="lg" overflow="hidden">
                <Stack>
                  <Pressable aria-label={`${item.name} 크게 보기`} onClick={() => setOpen(item.id)}>
                    <Art seed={item.name} kind="photo" ratio="4 / 3" radius="none" />
                  </Pressable>
                  <Stack gap="sm" padding="md">
                    <Stack gap="xs">
                      <Inline justify="between" align="center" gap="sm">
                        <Text as="span" variant="caption" family="mono" truncate>{item.name}</Text>
                        {item.kind === "video" && item.duration !== null ? <Badge variant="hairline" size="xs"><Glyph name="play" />{duration(item.duration)}</Badge> : null}
                      </Inline>
                      <Text as="span" variant="label" strong={false} ink="tertiary" numeric truncate>{formatMoment(item.takenAt)} · {formatBytes(item.size)}</Text>
                    </Stack>
                    <Inline as="label" justify="between" align="center" gap="md">
                      <Text as="span" variant="caption" ink="secondary">외부 공개</Text>
                      <Switch size="sm" aria-label={`${item.name} 외부 공개`} checked={item.shared} onChange={(event) => void toggle(item, event.currentTarget.checked)} />
                    </Inline>
                  </Stack>
                </Stack>
              </Surface>
            ))}
          </Grid>
        )}
      </Stack>

      <MediaDialog id={open} onClose={() => setOpen(null)} onToggle={(item, next) => void toggle(item, next)} />
    </>
  );
};
