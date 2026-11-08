import type { ReactNode } from "react";

import { Badge, Box, Button, Divider, Grid, IconButton, Inline, Stack, Surface, Text } from "@studio-baeks/paper-ui";

import { Glyph, Segmented, type SegmentOption } from "../../../../kit";
import { buildTradePost, evaluateAddCandidates, findBlockers, findTradePartners, type AddSelection, type PlanAction, type SectionInfo } from "../../lib/trade";
import { formatTimes, koreanName, sectionNumber } from "../../lib/utils";
import { Card } from "../../ui/parts";
import type { TradeModel } from "./model";
import { CopyPost, MarkDot, sectionText } from "./parts";

const ACTIONS: readonly SegmentOption[] = [
  { id: "keep", label: "유지" },
  { id: "move", label: "이동" },
  { id: "drop", label: "드랍" },
];

const names = (blockers: readonly SectionInfo[]) => blockers.map((blocker) => koreanName(blocker.subject)).join(", ");

type FacesProps = {
  model: TradeModel;
  siblings: SectionInfo[];
  current: SectionInfo | null;
  others: SectionInfo[];
  chosenId: number | null;
  pickLabel: string;
  onPick: (section: SectionInfo) => void;
};

const SectionFaces = ({ model, siblings, current, others, chosenId, pickLabel, onPick }: FacesProps) => (
  <Grid columns={{ base: 1, md: 2 }} gap="sm">
    {siblings.map((section) => {
      const here = current?.id === section.id;
      const blockers = here ? [] : findBlockers(others, section);
      const partners = current && !here && blockers.length === 0 ? findTradePartners(model.index.students, model.stuId, current, section).length : null;
      const picked = chosenId === section.id;
      return (
        <Surface key={section.id} fill="sunken" radius="md" padding="md">
          <Stack gap="sm">
            <Inline gap="sm" align="center" wrap>
              <Badge variant={here ? "solid" : "soft"} size="sm">{sectionNumber(section.section)}분반</Badge>
              <Text as="span">{section.teacher}</Text>
              <Text as="span" variant="caption" ink="tertiary" numeric>{section.room} · {section.studentCount}명</Text>
            </Inline>
            <Text as="span" variant="caption" ink="secondary" numeric>{formatTimes(section.times) || "시간이 정해지지 않았습니다"}</Text>
            <Inline gap="sm" align="center" justify="between" wrap>
              {here ? (
                <Text as="span" variant="caption" ink="secondary">지금 듣는 분반</Text>
              ) : blockers.length > 0 ? (
                <Text as="span" variant="caption" ink="warning">{names(blockers)} 비워야 함</Text>
              ) : (
                <Inline as="span" gap="sm" align="center" wrap>
                  <Text as="span" variant="caption" ink="success">{current ? "바로 이동 가능" : "바로 추가 가능"}</Text>
                  {partners !== null ? <Text as="span" variant="caption" ink="tertiary">교환 상대 {partners}명</Text> : null}
                </Inline>
              )}
              {here ? null : (
                <Button size="xs" variant="hairline" selected={picked} onClick={() => onPick(section)}>
                  {picked ? <Glyph name="check" /> : null}
                  {picked ? "선택됨" : pickLabel}
                </Button>
              )}
            </Inline>
          </Stack>
        </Surface>
      );
    })}
  </Grid>
);

const sectionOptions = (siblings: readonly SectionInfo[], blocked: (section: SectionInfo) => boolean): SegmentOption[] => [
  { id: "auto", label: "자동" },
  ...siblings.map((section) => ({
    id: String(section.id),
    label: (
      <Inline as="span" gap="xs" align="center">
        {sectionNumber(section.section)}분반
        {blocked(section) ? <Glyph name="triangle-alert" ink="warning" label="다른 과목과 겹칩니다" /> : null}
      </Inline>
    ),
  })),
];

const NameButton = ({ open, onToggle, lead, title, muted = false, children }: { open: boolean; onToggle: () => void; lead?: ReactNode; title: string; muted?: boolean; children: ReactNode }) => (
  <Button variant="ghost" size="lg" fontSize="body" strong={false} fullWidth justify="between" aria-expanded={open} onClick={onToggle}>
    <Stack as="span" gap="xs" align="stretch" minWidth={0}>
      <Inline as="span" gap="sm" align="center" minWidth={0}>
        {lead}
        <Text as="span" strong truncate ink={muted ? "tertiary" : "primary"}>{title}</Text>
      </Inline>
      <Text as="span" variant="caption" ink="tertiary" truncate>{children}</Text>
    </Stack>
    <Glyph name={open ? "chevron-up" : "chevron-down"} ink="tertiary" />
  </Button>
);

const Scroll = ({ children }: { children: ReactNode }) => (
  <Box maxWidth="full" overflowX="auto">
    {children}
  </Box>
);

const pointing = (model: TradeModel, subject: string) => ({
  onMouseEnter: () => model.setHovered(subject),
  onMouseLeave: () => model.setHovered(null),
  onFocus: () => model.setHovered(subject),
  onBlur: () => model.setHovered(null),
});

const CurrentRow = ({ model, section }: { model: TradeModel; section: SectionInfo }) => {
  const { state, planned, index } = model;
  const subject = section.subject;
  const action = state.actions[subject] ?? "keep";
  const open = model.openSubject === subject;
  const siblings = index.subjects.get(subject) ?? [section];
  const others = planned.sections.filter((item) => item.subject !== subject);
  const blockersOf = (target: SectionInfo) => findBlockers(others, target);
  const targetId = state.moveTargets[subject] ?? null;
  const target = action === "move" && targetId !== null ? siblings.find((item) => item.id === targetId) : undefined;
  const movable = siblings.filter((item) => item.id !== section.id && blockersOf(item).length === 0).length;
  const targetBlockers = target ? blockersOf(target) : [];
  const partners = target && targetBlockers.length === 0 ? findTradePartners(index.students, model.stuId, section, target).length : 0;
  const credits = section.credits != null ? ` · ${section.credits}학점` : "";

  const line =
    action === "drop"
      ? `드랍 — 시간표에서 빠집니다${credits}`
      : action === "move"
        ? target
          ? `${sectionNumber(section.section)}분반 → ${sectionText(target)}`
          : `${sectionNumber(section.section)}분반에서 옮깁니다 · 지금 바로 갈 수 있는 분반 ${movable}개`
        : `${sectionText(section)}${credits}`;

  return (
    <Stack gap="sm" {...pointing(model, subject)}>
      <Grid columns={{ base: 1, md: "minmax(0, 1fr) auto" }} gap="sm" align="center">
        <NameButton open={open} onToggle={() => model.toggleOpen(subject)} lead={<MarkDot model={model} subject={subject} />} title={koreanName(subject)} muted={action === "drop"}>{line}</NameButton>
        <Segmented label={`${koreanName(subject)} 처리`} options={ACTIONS} value={action} stretch onChange={(id) => model.setAction(subject, id as PlanAction)} />
      </Grid>

      {action === "move" ? (
        <Stack gap="sm" paddingX="lg">
          <Inline gap="sm" align="center" wrap>
            <Text as="span" variant="label" strong={false} ink="tertiary">옮길 분반</Text>
            <Scroll>
              <Segmented
                label={`${koreanName(subject)}을 옮길 분반`}
                options={sectionOptions(siblings.filter((item) => item.id !== section.id), (item) => blockersOf(item).length > 0)}
                value={target ? String(target.id) : "auto"}
                onChange={(id) => model.setMoveTarget(subject, id === "auto" ? null : Number(id))}
              />
            </Scroll>
          </Inline>
          <Inline gap="md" align="center" wrap>
            {!target ? (
              <Text as="span" variant="caption" ink="tertiary">자동 — 갈 수 있는 분반을 아래 가능한 조합에서 찾습니다.</Text>
            ) : targetBlockers.length > 0 ? (
              <Text as="span" variant="caption" ink="warning">{names(targetBlockers)} 비워야 함</Text>
            ) : (
              <Text as="span" variant="caption" ink="success">바로 이동할 수 있습니다 · 교환 상대 {partners}명</Text>
            )}
            {target ? <CopyPost size="xs" text={buildTradePost(subject, section, target)} /> : null}
          </Inline>
        </Stack>
      ) : null}

      {open ? (
        <Box paddingX="lg" paddingY="sm">
          <SectionFaces
            model={model}
            siblings={siblings}
            current={section}
            others={others}
            chosenId={target?.id ?? null}
            pickLabel="이 분반으로 이동"
            onPick={(picked) => model.moveTo(subject, picked.id)}
          />
        </Box>
      ) : null}
    </Stack>
  );
};

const AddedRow = ({ model, add }: { model: TradeModel; add: AddSelection }) => {
  const { planned, index } = model;
  const subject = add.subject;
  const open = model.openSubject === subject;
  const siblings = index.subjects.get(subject) ?? [];
  const candidates = evaluateAddCandidates(planned.sections, index.subjects, subject);
  const blockersOf = (section: SectionInfo) => candidates.find((candidate) => candidate.section.id === section.id)?.blockers ?? [];
  const chosen = siblings.find((item) => item.id === add.sectionId);
  const chosenBlockers = chosen ? blockersOf(chosen) : [];
  const free = candidates.filter((candidate) => candidate.blockers.length === 0).length;

  const line: ReactNode = chosen ? (
    <>
      {sectionText(chosen)}
      {chosenBlockers.length > 0 ? ` — ${names(chosenBlockers)} 비워야 함` : ""}
    </>
  ) : free > 0 ? (
    `분반 미지정 — 바로 들어갈 수 있는 분반 ${free}/${candidates.length}개`
  ) : (
    "지금 그대로는 들어갈 분반이 없습니다 — 다른 과목을 이동하거나 드랍해 보세요"
  );

  return (
    <Stack gap="sm" {...pointing(model, subject)}>
      <Grid columns={{ base: 1, md: "minmax(0, 1fr) auto" }} gap="sm" align="center">
        <NameButton open={open} onToggle={() => model.toggleOpen(subject)} lead={<Badge size="xs" variant="soft" accent="success">추가</Badge>} title={koreanName(subject)}>{line}</NameButton>
        <Inline gap="sm" align="center">
          <Scroll>
            <Segmented
              label={`${koreanName(subject)} 분반`}
              options={sectionOptions(siblings, (item) => blockersOf(item).length > 0)}
              value={chosen ? String(chosen.id) : "auto"}
              onChange={(id) => model.setAddSection(subject, id === "auto" ? null : Number(id))}
            />
          </Scroll>
          <IconButton variant="ghost" size="sm" aria-label={`${koreanName(subject)} 추가 취소`} onClick={() => model.toggleAdd(subject)}>
            <Glyph name="trash-2" />
          </IconButton>
        </Inline>
      </Grid>
      {open ? (
        <Box paddingX="lg" paddingY="sm">
          <SectionFaces
            model={model}
            siblings={siblings}
            current={null}
            others={planned.sections.filter((item) => item.subject !== subject)}
            chosenId={chosen?.id ?? null}
            pickLabel="이 분반으로"
            onPick={(picked) => model.setAddSection(subject, picked.id)}
          />
        </Box>
      ) : null}
    </Stack>
  );
};

export const SubjectsCard = ({ model }: { model: TradeModel }) => {
  const dropped = new Set(model.dropped);
  const ordered = [...model.schedule.filter((section) => !dropped.has(section.subject)), ...model.schedule.filter((section) => dropped.has(section.subject))];
  const adds = model.state.addSelections.filter((add) => !model.enrolled.has(add.subject));
  const items = [
    ...adds.map((add) => ({ key: `add-${add.subject}`, node: <AddedRow model={model} add={add} /> })),
    ...ordered.map((section) => ({ key: section.subject, node: <CurrentRow model={model} section={section} /> })),
  ];
  return (
    <Card title="내 과목" description={`${model.name}님이 듣는 ${model.schedule.length}과목입니다. 유지·이동·드랍을 고르면 시간이 겹치지 않는 조합을 찾습니다. 과목을 누르면 분반을 모두 봅니다.`}>
      <Stack as="ul" gap="md">
        {items.map((item, index) => (
          <Stack as="li" key={item.key} gap="md">
            {index > 0 ? <Divider /> : null}
            {item.node}
          </Stack>
        ))}
      </Stack>
    </Card>
  );
};
