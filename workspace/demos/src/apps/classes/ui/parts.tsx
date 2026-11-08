import { Fragment, useEffect, useRef, type ReactNode, type RefObject } from "react";
import { Link as RouterLink } from "react-router-dom";

import { Badge, Box, Button, Divider, Floating, Grid, IconButton, Inline, Marker, Paint, Pressable, Stack, Surface, Text } from "@studio-baeks/paper-ui";
import type { Accent, Space } from "@studio-baeks/paper-ui/tokens";

import { Glyph, useFace, type GlyphName } from "../../../kit";
import { DAYS, DAY_LABEL, PERIOD_NUMBERS, type Day } from "../data/periods";
import { subjectQuery, teacherQuery } from "../lib/search";
import { path } from "../state";

export const searchHref = (query: string) => path(`/search?q=${encodeURIComponent(query)}`);

export const Card = ({ title, description, actions, padding = "xl", gap = "lg", label, children }: { title?: ReactNode; description?: ReactNode; actions?: ReactNode; padding?: Space; gap?: Space; label?: string; children: ReactNode }) => {
  const face = useFace();
  return (
    <Surface as="section" {...face} radius="lg" padding={padding} aria-label={typeof title === "string" ? title : label}>
      <Stack gap={gap}>
        {title || actions ? <Heading title={title} description={description} actions={actions} /> : null}
        {children}
      </Stack>
    </Surface>
  );
};

export const Heading = ({ title, description, actions }: { title?: ReactNode; description?: ReactNode; actions?: ReactNode }) => (
  <Inline justify="between" align="center" gap="md" wrap>
    <Stack gap="xs" minWidth={0}>
      {title ? <Text as="h2" variant="subheading">{title}</Text> : null}
      {description ? <Text variant="caption" ink="tertiary">{description}</Text> : null}
    </Stack>
    {actions ? <Inline gap="sm" wrap align="center">{actions}</Inline> : null}
  </Inline>
);

export const ScrollTabs = ({ selected, children }: { selected: string; children: ReactNode }) => {
  const row = useRef<HTMLDivElement>(null);
  useEffect(() => {
    row.current?.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]')?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [selected]);
  return <Box ref={row} overflowX="auto" paddingY="xs">{children}</Box>;
};

export const PlanMark = () => <Badge variant="soft" accent="warning" size="sm">계획</Badge>;

export const Eyebrow = ({ children }: { children: ReactNode }) => (
  <Text as="span" variant="label" strong={false} ink="tertiary">{children}</Text>
);

export const Hint = ({ children }: { children: ReactNode }) => (
  <Text as="p" variant="caption" ink="tertiary">{children}</Text>
);

export const Tint = ({ accent, radius = "md", padding = "md", children }: { accent: Accent; radius?: "sm" | "md" | "lg" | "full"; padding?: Space; children: ReactNode }) => (
  <Surface radius={radius} overflow="hidden">
    <Paint accent={accent} variant="soft" padding={padding}>{children}</Paint>
  </Surface>
);

export const Notice = ({ tone = "info", glyph = "info", children, action }: { tone?: Accent; glyph?: GlyphName; children: ReactNode; action?: ReactNode }) => (
  <Tint accent={tone}>
    <Inline gap="sm" align="center" justify="between" wrap>
      <Inline gap="sm" align="center" minWidth={0}>
        <Glyph name={glyph} />
        <Text as="span" ink="inherit">{children}</Text>
      </Inline>
      {action}
    </Inline>
  </Tint>
);

export const Rows = ({ children }: { children: ReactNode[] }) => (
  <Stack gap="md">
    {children.map((child, index) => (
      <Stack key={index} gap="md">
        {index > 0 ? <Divider /> : null}
        {child}
      </Stack>
    ))}
  </Stack>
);

export const Pair = ({ label, children }: { label: ReactNode; children: ReactNode }) => (
  <Inline justify="between" gap="md" align="baseline">
    <Text as="span" ink="tertiary">{label}</Text>
    <Text as="span">{children}</Text>
  </Inline>
);

export const Dialog = ({ open, onOpenChange, title, description, children, footer, size = "measure.sm", focusRef }: { open: boolean; onOpenChange: (open: boolean) => void; title: string; description?: ReactNode; children: ReactNode; footer?: ReactNode; size?: "measure.xs" | "measure.sm" | "measure.md" | "measure.lg" | "measure.xl"; focusRef?: RefObject<HTMLElement | null> }) => (
  <Floating open={open} onOpenChange={onOpenChange}>
    <Floating.Content as={Surface} fill="raised" radius="lg" padding="xl" presentation="modal" aria-label={title} maxHeight="90dvh" overflowY="auto" initialFocusRef={focusRef}>
      <Stack gap="lg" width={size} maxWidth="full">
        <Inline justify="between" align="start" gap="md">
          <Stack gap="xs" minWidth={0}>
            <Text as="h2" variant="heading">{title}</Text>
            {description ? <Text ink="secondary">{description}</Text> : null}
          </Stack>
          <IconButton as={Floating.Close} variant="ghost" size="sm" aria-label="닫기"><Glyph name="x" /></IconButton>
        </Inline>
        {children}
        {footer ? <Inline justify="end" gap="sm" wrap>{footer}</Inline> : null}
      </Stack>
    </Floating.Content>
  </Floating>
);

const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const Highlight = ({ text, terms }: { text: string; terms: readonly string[] }) => {
  const words = terms.map((term) => term.trim()).filter(Boolean);
  if (words.length === 0) return <>{text}</>;
  const parts = text.split(new RegExp(`(${words.map(escape).join("|")})`, "gi"));
  return (
    <>
      {parts.map((part, index) => (index % 2 === 1 ? <Marker key={index}>{part}</Marker> : <Fragment key={index}>{part}</Fragment>))}
    </>
  );
};

export type Pick = "student" | "teacher" | "room" | "subject";

export const QueryChip = ({ kind, value, label, terms = [], selected = false, hint }: { kind: Pick; value: string; label?: ReactNode; terms?: readonly string[]; selected?: boolean; hint?: string }) => {
  const query = kind === "teacher" ? teacherQuery(value) : kind === "room" ? `room:${value}` : kind === "student" ? `student:${value}` : subjectQuery(value);
  const text = typeof label === "string" ? label : value;
  return (
    <Button as={RouterLink} to={searchHref(query)} size="xs" variant="muted" selected={selected} aria-label={hint ?? `${text} 검색`}>
      {kind === "room" ? <Glyph name="map-pin" /> : null}
      {label ?? <Highlight text={value} terms={terms} />}
    </Button>
  );
};

export const StudentChip = ({ stuId, name, terms = [], selected = false }: { stuId: string; name: string; terms?: readonly string[]; selected?: boolean }) => (
  <QueryChip
    kind="student"
    value={stuId}
    selected={selected}
    hint={`${name} ${stuId} 시간표 보기`}
    label={
      <>
        <Text as="span" variant="label" strong={false} ink="tertiary" numeric>{stuId.split("-")[0]}</Text>
        <Highlight text={name} terms={terms} />
      </>
    }
  />
);

export type Slot = {
  text?: ReactNode;
  sub?: ReactNode;
  tone?: "plain" | "strong" | Accent;
  selected?: boolean;
  onPress?: () => void;
  hint?: string;
};

const SlotFace = ({ slot }: { slot: Slot }) => {
  const inner = (
    <Stack justify="center" gap="xs" height="full" minWidth={0}>
      {slot.text ? <Inline justify="center"><Text as="span" variant="label" strong={slot.tone === "strong"} ink="inherit" truncate>{slot.text}</Text></Inline> : null}
      {slot.sub ? <Inline justify="center"><Text as="span" variant="label" strong={false} ink="inherit" truncate>{slot.sub}</Text></Inline> : null}
    </Stack>
  );
  const tone = slot.tone ?? "plain";
  if (tone === "plain") {
    return slot.onPress ? (
      <Surface as={Pressable} fill="sunken" radius="sm" height="full" minWidth={0} overflow="hidden" hoverable selected={slot.selected} onPress={slot.onPress} aria-pressed={slot.selected ?? false} aria-label={slot.hint}>
        {inner}
      </Surface>
    ) : (
      <Surface fill="sunken" radius="sm" height="full" minWidth={0} overflow="hidden">{inner}</Surface>
    );
  }
  const accent: Accent = tone === "strong" ? "primary" : tone;
  const variant = tone === "strong" ? "solid" : "soft";
  return (
    <Surface radius="sm" overflow="hidden" height="full" minWidth={0}>
      {slot.onPress ? (
        <Paint as={Pressable} accent={accent} variant={variant} hoverable height="full" width="full" onPress={slot.onPress} aria-pressed={slot.selected ?? false} aria-label={slot.hint}>
          {inner}
        </Paint>
      ) : (
        <Paint accent={accent} variant={variant} height="full">{inner}</Paint>
      )}
    </Surface>
  );
};

export const SlotGrid = ({ cell, periods = PERIOD_NUMBERS, rowHeight = "2.5rem", days = DAYS, label }: { cell: (day: Day, period: number) => Slot | undefined; periods?: readonly number[]; rowHeight?: string; days?: readonly Day[]; label: string }) => (
  <Grid columns={`1.5rem repeat(${days.length}, minmax(0, 1fr))`} rows={`1.5rem repeat(${periods.length}, ${rowHeight})`} gap="xs" role="group" aria-label={label}>
    <Box />
    {days.map((day) => (
      <Inline key={day} justify="center" align="center">
        <Text as="span" variant="label" ink="tertiary">{DAY_LABEL[day]}</Text>
      </Inline>
    ))}
    {periods.map((period) => (
      <Fragment key={period}>
        <Inline justify="center" align="center">
          <Text as="span" variant="label" strong={false} ink="tertiary" numeric>{period}</Text>
        </Inline>
        {days.map((day) => {
          const slot = cell(day, period);
          return slot ? <SlotFace key={day} slot={slot} /> : <Box key={day} />;
        })}
      </Fragment>
    ))}
  </Grid>
);

export const Figure = ({ label, value, unit }: { label: string; value: ReactNode; unit?: string }) => (
  <Stack gap="xs" minWidth={0}>
    <Text as="span" variant="label" strong={false} ink="tertiary" truncate>{label}</Text>
    <Inline gap="xs" align="baseline">
      <Text as="span" variant="heading" numeric>{value}</Text>
      {unit ? <Text as="span" ink="tertiary">{unit}</Text> : null}
    </Inline>
  </Stack>
);

export const Count = ({ children }: { children: ReactNode }) => (
  <Badge size="sm" variant="soft">{children}</Badge>
);
