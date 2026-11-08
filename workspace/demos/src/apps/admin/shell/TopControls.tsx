// The top bar: the hub's clock on the left; on the right a search that opens the results page, the bell with the latest
// activity, and the account menu.

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link as RouterLink, useLocation, useNavigate, useSearchParams } from "react-router-dom";

import { Badge, Box, Button, Divider, Field, Floating, IconButton, Inline, Stack, Surface, Text } from "@studio-baeks/paper-ui";

import { Glyph, Menu, useToast } from "../../../kit";
import { SERVICE_LABEL } from "../data/activity";
import { formatMoment, since } from "../lib/format";
import { now } from "../lib/clock";
import { useTick } from "../lib/hooks";
import { BASE } from "../registry";
import { useAdmin } from "../store/store";

const Bell = () => {
  const { events, seenAt, markSeen } = useAdmin();
  const [open, setOpen] = useState(false);
  const unread = events.filter((event) => event.at > seenAt).length;
  const latest = events.slice(0, 5);
  return (
    <Floating open={open} onOpenChange={(next) => { setOpen(next); if (next) markSeen(); }}>
      <IconButton
        as={Floating.Trigger}
        variant="muted"
        shape="pill"
        aria-label={unread > 0 ? `알림 ${unread}개` : "알림"}
        badge={unread > 0 ? <Badge accent="info" variant="solid" size="xs">{unread > 9 ? "9+" : unread}</Badge> : undefined}
      >
        <Glyph name="bell" />
      </IconButton>
      <Floating.Content as={Surface} fill="raised" border radius="lg" padding="md" placement="bottom end" width="xl" maxWidth="full" aria-label="최근 활동">
        <Stack gap="md">
          <Inline justify="between" align="center" paddingX="sm">
            <Text as="h2" variant="subheading">최근 활동</Text>
            <Button as={RouterLink} to={`${BASE}/activity`} size="xs" variant="ghost" onClick={() => setOpen(false)}>모두 보기</Button>
          </Inline>
          <Divider />
          <Stack as="ul" gap="xs">
            {latest.map((event) => (
              <Stack key={event.id} as="li" paddingX="sm" paddingY="xs">
                <Inline justify="between" gap="md" align="baseline">
                  <Text as="span" truncate>{event.title}</Text>
                  <Text as="span" variant="label" strong={false} ink="tertiary" numeric>{since(event.at)}</Text>
                </Inline>
                <Text as="span" variant="label" strong={false} ink={event.level === "warning" ? "warning" : "tertiary"} truncate>
                  {SERVICE_LABEL[event.service]}{event.detail ? ` · ${event.detail}` : ""}
                </Text>
              </Stack>
            ))}
          </Stack>
        </Stack>
      </Floating.Content>
    </Floating>
  );
};

export const TopControls = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { pathname } = useLocation();
  const [params] = useSearchParams();
  const { setSignedIn, log, reset } = useAdmin();
  useTick(30_000);
  const onSearchPage = pathname === `${BASE}/search`;
  const [typed, setTyped] = useState<string | null>(null);
  const query = typed ?? (onSearchPage ? params.get("q") ?? "" : "");
  const input = useRef<HTMLInputElement>(null);

  // "/" jumps to the search from anywhere that is not already a text box.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target && (/^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName) || target.isContentEditable)) return;
      event.preventDefault();
      input.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const search = (event: FormEvent) => {
    event.preventDefault();
    const text = query.trim();
    setTyped(null);
    navigate(text ? `${BASE}/search?q=${encodeURIComponent(text)}` : `${BASE}/search`);
  };

  // The kit's TopBar keeps its left cell even when it is empty, and on a phone that leaves a gap before the search; this row
  // hides its left cell outright (a hidden Box takes no place) so the search starts at the page's edge.
  return (
    <Inline as="header" justify="between" align="center" gap="md" wrap>
      <Inline gap="sm" hideBelow="md">
        <Badge variant="hairline" size="sm">데모</Badge>
        <Text as="span" variant="label" strong={false} ink="tertiary" numeric>서버 시각 {formatMoment(now())}</Text>
      </Inline>
      <Inline gap="sm" wrap>
        <Box as="form" role="search" width="lg" maxWidth="full" onSubmit={search}>
          <Field
            ref={input}
            shape="pill"
            fill="sunken"
            aria-label="서비스, 파일, 기기 찾기"
            placeholder="서비스, 파일, 기기 찾기"
            leading={<Glyph name="search" />}
            trailing={query ? undefined : <Badge size="xs" variant="hairline" shape="rounded"><Text as="kbd" variant="caption" ink="inherit">/</Text></Badge>}
            value={query}
            clearable
            onClear={() => setTyped("")}
            onChange={(event) => setTyped(event.currentTarget.value)}
          />
        </Box>
        <Bell />
        <Menu
          label="계정"
          glyph="circle-user"
          variant="muted"
          size="md"
          items={[
            { id: "who", heading: "관리자 · 10.20.10.2" },
            { id: "activity", label: "활동 기록", glyph: "history", onSelect: () => navigate(`${BASE}/activity`) },
            { id: "reset", label: "데모를 처음 상태로", glyph: "rotate-ccw", onSelect: () => { reset(); toast("처음 상태로 되돌렸습니다"); } },
            { id: "divider", divider: true },
            {
              id: "signout",
              label: "로그아웃",
              glyph: "log-out",
              danger: true,
              onSelect: () => {
                log({ service: "hub", level: "info", title: "로그아웃했습니다", actor: "관리자" });
                setSignedIn(false);
              },
            },
          ]}
        />
      </Inline>
    </Inline>
  );
};
