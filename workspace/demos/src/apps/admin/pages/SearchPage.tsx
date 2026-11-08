// 찾기: one box for everything the hub holds — services, files, VPN peers, machines to wake, bypass domains, the phone's
// shots and the activity log. The top bar's search lands here. Matches are marked with the highlighter; each result is a
// link to the page that owns it.

import { useEffect, useState, type FormEvent } from "react";
import { Link as RouterLink, useNavigate, useSearchParams } from "react-router-dom";

import { Badge, Button, Divider, Field, Inline, Marker, Stack, Surface, Text } from "@studio-baeks/paper-ui";

import { Empty, Glyph, PageHeader, SectionHeader, SurfaceLink, useFace, useStored, type GlyphName } from "../../../kit";
import { SERVICE_LABEL } from "../data/activity";
import { formatBytes } from "../lib/format";
import { LATENCY, useDelay } from "../lib/hooks";
import { BASE, SERVICES, serviceTo } from "../registry";
import { storageKey } from "../store/keys";
import { useAdmin } from "../store/store";
import { Loading } from "../ui/Parts";

type Hit = { id: string; glyph: GlyphName; title: string; sub?: string; to: string };
type Group = { id: string; label: string; hits: Hit[] };

// The matched part of a line, marked.
const Marked = ({ text, query }: { text: string; query: string }) => {
  const word = query.trim();
  const at = word ? text.toLowerCase().indexOf(word.toLowerCase()) : -1;
  if (at < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, at)}
      <Marker>{text.slice(at, at + word.length)}</Marker>
      {text.slice(at + word.length)}
    </>
  );
};

const EXAMPLES = ["WireGuard", "10.20.0", "pdf", "응답 없음"] as const;

export const SearchPage = () => {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const face = useFace();
  const { files, peers, devices, media, events } = useAdmin();
  const { ready } = useDelay(LATENCY.quick + 100);
  const [recent, setRecent] = useStored<string[]>(storageKey("recent"), []);
  const query = (params.get("q") ?? "").trim();
  const [typed, setTyped] = useState(query);

  useEffect(() => {
    setTyped(query);
    if (query) setRecent((list) => [query, ...list.filter((item) => item !== query)].slice(0, 6));
  }, [query, setRecent]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setParams(typed.trim() ? { q: typed.trim() } : {});
  };

  const needle = query.toLowerCase();
  const has = (...texts: (string | undefined)[]) => texts.some((text) => text?.toLowerCase().includes(needle));

  const groups: Group[] = needle
    ? [
        { id: "services", label: "서비스", hits: SERVICES.filter((service) => has(service.label, service.description, service.id)).map((service) => ({ id: service.id, glyph: service.glyph, title: service.label, sub: service.description, to: serviceTo(service.id) })) },
        { id: "files", label: "파일", hits: files.filter((file) => has(file.title, file.description, file.originalName, file.slug)).map((file) => ({ id: file.id, glyph: "file" as const, title: file.title, sub: `${file.originalName} · ${formatBytes(file.size)}`, to: `${serviceTo("files")}/${file.id}` })) },
        { id: "peers", label: "WireGuard 기기", hits: peers.filter((peer) => has(peer.name, peer.allowedIp)).map((peer) => ({ id: peer.publicKey, glyph: "network" as const, title: peer.name, sub: peer.allowedIp, to: `${serviceTo("wireguard")}/${peer.allowedIp}` })) },
        { id: "devices", label: "깨울 수 있는 기기", hits: devices.filter((device) => has(device.name, device.host, device.mac, device.address)).map((device) => ({ id: device.id, glyph: "monitor" as const, title: device.name, sub: `${device.host} · ${device.address}`, to: `${serviceTo("wol")}/${device.id}` })) },
        { id: "media", label: "Galaxy S23+", hits: media.filter((item) => has(item.name)).map((item) => ({ id: item.id, glyph: item.kind === "video" ? ("video" as const) : ("image" as const), title: item.name, sub: item.shared ? "외부 공개 중" : "공개하지 않음", to: `${serviceTo("galaxy")}?viewer` })) },
        { id: "events", label: "활동 기록", hits: events.filter((event) => has(event.title, event.detail, event.actor)).slice(0, 12).map((event) => ({ id: event.id, glyph: "history" as const, title: event.title, sub: `${SERVICE_LABEL[event.service]}${event.detail ? ` · ${event.detail}` : ""}`, to: `${BASE}/activity?q=${encodeURIComponent(query)}` })) },
      ].filter((group) => group.hits.length > 0)
    : [];
  const total = groups.reduce((sum, group) => sum + group.hits.length, 0);

  return (
    <>
      <PageHeader title="찾기" description={query ? (ready ? `“${query}” 결과 ${total}건` : "찾는 중…") : "서비스, 파일, 기기를 한꺼번에 찾습니다."} />

      <Stack as="form" role="search" gap="sm" onSubmit={submit}>
        <Field size="lg" shape="pill" leading={<Glyph name="search" />} aria-label="찾을 말" placeholder="이름, 주소, 파일 이름" value={typed} clearable onClear={() => setTyped("")} onChange={(event) => setTyped(event.currentTarget.value)} />
      </Stack>

      {!query ? (
        <Stack gap="xl">
          {recent.length > 0 ? (
            <Stack gap="md">
              <SectionHeader title="최근 찾은 말" actions={<Button size="sm" variant="ghost" onClick={() => setRecent([])}>지우기</Button>} />
              <Inline gap="sm" wrap>
                {recent.map((item) => <Button key={item} as={RouterLink} to={`${BASE}/search?q=${encodeURIComponent(item)}`} size="sm" shape="pill" variant="hairline"><Glyph name="history" />{item}</Button>)}
              </Inline>
            </Stack>
          ) : null}
          <Stack gap="md">
            <SectionHeader title="이런 말로 찾아보세요" />
            <Inline gap="sm" wrap>
              {EXAMPLES.map((item) => <Button key={item} size="sm" shape="pill" variant="dashed" onClick={() => navigate(`${BASE}/search?q=${encodeURIComponent(item)}`)}>{item}</Button>)}
            </Inline>
          </Stack>
          <Stack gap="md">
            <SectionHeader title="서비스" />
            <Surface {...face} radius="lg" overflow="hidden">
              <Stack as="ul">
                {SERVICES.map((service, index) => (
                  <Stack key={service.id} as="li">
                    {index > 0 ? <Divider aria-hidden /> : null}
                    <SurfaceLink to={serviceTo(service.id)} paddingX="xl" paddingY="md">
                      <Inline gap="md" align="center">
                        <Glyph name={service.glyph} ink="secondary" />
                        <Stack minWidth={0}>
                          <Text as="span">{service.label}</Text>
                          <Text as="span" variant="label" strong={false} ink="tertiary" truncate>{service.description}</Text>
                        </Stack>
                      </Inline>
                    </SurfaceLink>
                  </Stack>
                ))}
              </Stack>
            </Surface>
          </Stack>
        </Stack>
      ) : !ready ? (
        <Loading label="찾는 중" />
      ) : total === 0 ? (
        <Surface {...face} radius="lg"><Empty glyph="search-x" title={`“${query}”에 맞는 결과가 없습니다`} description="철자를 바꾸거나 더 짧은 말로 찾아보세요." /></Surface>
      ) : (
        <Stack gap="xl">
          {groups.map((group) => (
            <Stack key={group.id} gap="md">
              <SectionHeader title={group.label} description={`${group.hits.length}건`} />
              <Surface {...face} radius="lg" overflow="hidden">
                <Stack as="ul">
                  {group.hits.slice(0, 8).map((hit, index) => (
                    <Stack key={hit.id} as="li">
                      {index > 0 ? <Divider aria-hidden /> : null}
                      <SurfaceLink to={hit.to} paddingX="xl" paddingY="md">
                        <Inline gap="md" align="center">
                          <Glyph name={hit.glyph} ink="secondary" />
                          <Stack minWidth={0}>
                            <Text as="span" truncate><Marked text={hit.title} query={query} /></Text>
                            {hit.sub ? <Text as="span" variant="label" strong={false} ink="tertiary" truncate><Marked text={hit.sub} query={query} /></Text> : null}
                          </Stack>
                        </Inline>
                      </SurfaceLink>
                    </Stack>
                  ))}
                </Stack>
                {group.hits.length > 8 ? <Inline paddingX="xl" paddingY="md"><Badge variant="hairline" size="sm">외 {group.hits.length - 8}건</Badge></Inline> : null}
              </Surface>
            </Stack>
          ))}
        </Stack>
      )}
    </>
  );
};
