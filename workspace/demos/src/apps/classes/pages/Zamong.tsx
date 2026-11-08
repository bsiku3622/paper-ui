// 자몽 — the school's Zamong workbook turned into an app. A course is a card with three cells (term · credits · grade); choosing
// the term is what makes it "taken" and clearing it removes the record, so there is no checkbox, and a re-take is choosing the
// term again. The roadmap on top is always there and counts what the cards say: credits against the graduation requirements,
// GPA, and the 시수 the person types. Below it, one department at a time, the cards by prerequisite depth.
//
// Nothing here is read from the school's records after the first time: a ready-made history (밑칠) is offered once to an empty
// 자몽, and from then on only what the person wrote is counted. A department's track is shown as the school wrote it, never
// judged.
//
// Reachable states: ?dept=물리학 opens that department, ?course=미적분학1 holds a course's detail open, ?term=4 opens that term's
// panel, ?seed=1 takes the offer of a ready-made history at once.

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { Box, Button, Inline, Stack, Text } from "@studio-baeks/paper-ui";

import { Glyph, PageHeader, Tabs } from "../../../kit";
import { TERMS } from "../data/build";
import { CATEGORY_LABEL, COURSE_BY_NAME, DEPARTMENT_ORDER, DEPARTMENTS } from "../data/catalog";
import { boardOf, isTermKey, termSlotOf, type TermKey } from "../lib/curriculum";
import { useClasses } from "../state";
import { Card, Dialog, Heading, Hint, ScrollTabs, Tint } from "../ui/parts";
import { Board } from "./zamong/Board";
import { Detail } from "./zamong/Detail";
import { Roadmap } from "./zamong/Roadmap";
import { TermPanel } from "./zamong/TermPanel";
import { useZamong } from "./zamong/useZamong";

export const ZamongPage = () => {
  const { me } = useClasses();
  const zamong = useZamong();
  const { entries, summary } = zamong;
  const [params, setParams] = useSearchParams();
  const [hovered, setHovered] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);
  const board = useRef<HTMLDivElement>(null);

  // The address holds what is open: the department, the course held for its detail, the term whose panel is up.
  const heldName = params.get("course");
  const held = heldName ? COURSE_BY_NAME.get(heldName) : undefined;
  const department = DEPARTMENT_ORDER.find((name) => name === params.get("dept")) ?? held?.department ?? DEPARTMENT_ORDER[0]!;
  // A held course belongs to the sheet that is open; on another sheet it is not held.
  const pinned = held && held.department === department ? held.name : null;
  const askedTerm = params.get("term");
  const openTerm: TermKey | null = isTermKey(askedTerm) ? askedTerm : null;
  const change = (changes: Record<string, string | null>) =>
    setParams(
      (now) => {
        const next = new URLSearchParams(now);
        for (const [key, value] of Object.entries(changes)) {
          if (value === null) next.delete(key);
          else next.set(key, value);
        }
        return next;
      },
      { replace: true },
    );

  // ?seed=1 takes the offer without a click, for a screenshot or a link; it is gone from the address once taken.
  const wantsSeed = params.get("seed") !== null;
  useEffect(() => {
    if (!wantsSeed) return;
    if (zamong.recordCount === 0 && !zamong.seeded) zamong.applySeed(true);
    setParams(
      (now) => {
        const next = new URLSearchParams(now);
        next.delete("seed");
        return next;
      },
      { replace: true },
    );
  }, [wantsSeed, zamong, setParams]);

  const shown = hovered ?? pinned;
  const info = DEPARTMENTS.find((item) => item.name === department);
  const inDepartment = (name: string) => Object.keys(entries).filter((key) => COURSE_BY_NAME.get(key)?.department === name).length;
  const total = boardOf(department).courses.length;
  const hoursEmpty = summary.hoursTotal === 0;

  // A course named on the roadmap opens on its department's sheet, held for its detail.
  const openCourse = (name: string) => {
    const course = COURSE_BY_NAME.get(name);
    if (!course) return;
    change({ dept: course.department, course: name });
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    board.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  };

  // The semester the account is in now is the school's latest term, whichever term the top bar is looking at.
  const latest = TERMS[0]!;
  const slot = termSlotOf(me.stuId, latest.year, latest.semester);

  return (
    <>
      <PageHeader
        eyebrow={`${me.stuId.split("-")[0]}학번${slot ? ` · 입학 후 ${slot}학기째` : ""}`}
        title="자몽"
        description="학교의 Zamong 워크북을 앱으로 옮겼습니다. 카드마다 학기를 고르면 들은 과목으로 잡히고, 졸업 요건이 바로 계산됩니다."
        actions={
          <Button variant="hairline" disabled={zamong.recordCount === 0 && hoursEmpty && !zamong.seeded} onClick={() => setAsking(true)}>
            <Glyph name="rotate-ccw" />처음 상태로
          </Button>
        }
      />

      {zamong.recordCount === 0 && !zamong.seeded ? (
        <Tint accent="info" radius="lg" padding="lg">
          <Inline justify="between" align="center" gap="lg" wrap>
            <Stack gap="xs" minWidth={0}>
              <Text as="h2" variant="subheading" ink="inherit">자몽을 채워 둘까요?</Text>
              <Text ink="inherit">이 학교의 수강 이력으로 밑칠하면 1~4학기 과목과 평어가 카드에 들어갑니다. 재수강한 과목은 한 칸뿐이라 나중 학기로 들어가니, 틀린 곳은 카드에서 고쳐 주세요. 받아들인 뒤에는 직접 적은 값만 남습니다.</Text>
            </Stack>
            <Inline gap="sm" wrap>
              <Button variant="solid" onClick={() => zamong.applySeed()}>
                <Glyph name="wand-sparkles" />이 학교 수강 이력으로 채우기
              </Button>
              <Button variant="ghost" onClick={zamong.skipSeed}>직접 채우기</Button>
            </Inline>
          </Inline>
        </Tint>
      ) : null}

      <Roadmap
        summary={summary}
        hours={zamong.hours}
        nowSlot={slot}
        placed={entries}
        onHour={zamong.setHour}
        onOpenTerm={(key) => change({ term: key })}
        onOpenCourse={openCourse}
        onPlace={(course, key) => zamong.choose(course, key, true)}
      />

      <Box ref={board}>
        <Card label="학과 판" gap="lg">
          <ScrollTabs selected={department}>
            <Tabs
              label="학과"
              items={DEPARTMENT_ORDER.map((name) => ({ id: name, label: name, count: inDepartment(name) || undefined }))}
              value={department}
              onChange={(id) => change({ dept: id, course: null })}
            />
          </ScrollTabs>

          <Stack gap="sm">
            <Heading title={department} description={`${info ? CATEGORY_LABEL[info.category] : ""} · ${total}과목 중 ${inDepartment(department)}과목을 적었습니다`} />
            {info?.track ? (
              <Inline gap="sm" align="start">
                <Glyph name="info" ink="tertiary" />
                <Stack gap="xs" minWidth={0}>
                  <Text ink="secondary">트랙 조건 — {info.track}</Text>
                  <Hint>학과마다 규칙이 달라 앱이 판정하지 않습니다. 학교 안내와 함께 직접 확인해 주세요.</Hint>
                </Stack>
              </Inline>
            ) : null}
            {(info?.notes ?? []).map((note) => (
              <Inline key={note} gap="sm" align="start">
                <Glyph name="info" ink="tertiary" />
                <Text variant="caption" ink="secondary">{note}</Text>
              </Inline>
            ))}
            <Hint>형광펜으로 표시한 과목은 트랙필수입니다. 선수 단계가 낮을수록 먼저 듣는 과목이고, 판이 넓으면 옆으로 밀어서 봅니다.</Hint>
          </Stack>

          <Board
            department={department}
            entries={entries}
            taken={zamong.taken}
            inferred={zamong.inferred}
            pinned={pinned}
            onHover={setHovered}
            onPin={(name) => change({ course: pinned === name ? null : name })}
            onChoose={(course, value) => zamong.choose(course, value)}
            onGrade={zamong.grade}
            onEc={zamong.toggleEc}
          />

          <Detail course={shown ? COURSE_BY_NAME.get(shown) : undefined} />
        </Card>
      </Box>

      <TermPanel
        term={openTerm}
        terms={summary.terms}
        entries={entries}
        taken={zamong.taken}
        inferred={zamong.inferred}
        onClose={() => change({ term: null })}
        onChoose={(course, value) => zamong.choose(course, value, true)}
        onGrade={zamong.grade}
        onEc={zamong.toggleEc}
      />

      <Dialog
        open={asking}
        onOpenChange={setAsking}
        title="처음 상태로 돌릴까요?"
        description={`지금 적어 둔 ${zamong.recordCount}과목과 시수를 모두 지우고 처음 상태로 돌립니다. 지운 직후에는 되돌릴 수 있습니다.`}
        size="measure.xs"
        footer={
          <>
            <Button variant="ghost" onClick={() => setAsking(false)}>취소</Button>
            <Button
              variant="solid"
              accent="error"
              onClick={() => {
                setAsking(false);
                zamong.reset();
              }}
            >
              처음 상태로
            </Button>
          </>
        }
      >
        <Hint>처음 상태에서는 수강 이력으로 밑칠하자는 안내가 다시 나옵니다.</Hint>
      </Dialog>
    </>
  );
};
