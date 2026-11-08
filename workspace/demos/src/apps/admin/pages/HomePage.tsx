// 서비스 관리: the hub's first page. A card for each service with a status line, and the latest activity.
// Each status asks for itself and fills in when it answers. The home has no strip of numbers: what each service is doing is said on
// its own card, and the numbers that belong to a service stay on that service's page.

import type { ReactNode } from "react";
import { Link as RouterLink } from "react-router-dom";

import { Button, Divider, Grid, Inline, Stack, Text } from "@studio-baeks/paper-ui";

import { Glyph, PageHeader, SectionHeader, useToast, type GlyphName } from "../../../kit";
import { SERVICE_LABEL } from "../data/activity";
import { GALAXY } from "../data/galaxy";
import { cooldownLeft, isReachable } from "../data/wol";
import { LATENCY, useDelay, useDemoState } from "../lib/hooks";
import { formatNumber, since } from "../lib/format";
import { BASE, serviceTo } from "../registry";
import { useAdmin } from "../store/store";
import { useFileList, usePeerViews } from "../store/views";
import { Card } from "../ui/Card";

const ServiceCard = ({ glyph, title, description, status, children }: { glyph: GlyphName; title: string; description: string; status?: string; children: ReactNode }) => (
  <Card justify="between" gap="xl">
    <Stack gap="lg">
      <Glyph name={glyph} ink="secondary" />
      <Stack gap="xs">
        <Text as="h2" variant="heading">{title}</Text>
        <Text as="p" ink="secondary">{description}</Text>
      </Stack>
      {status ? <Text variant="caption" ink="secondary" aria-live="polite">{status}</Text> : null}
    </Stack>
    <Inline gap="sm" wrap>{children}</Inline>
  </Card>
);

export const HomePage = () => {
  const { devices, media, events } = useAdmin();
  const files = useFileList();
  const peers = usePeerViews();
  const toast = useToast();
  const demo = useDemoState();
  // Four pretend requests, each answering in its own time.
  const filesAsked = useDelay(LATENCY.quick);
  const networkAsked = useDelay(LATENCY.list + 60);
  const wolAsked = useDelay(LATENCY.quick + 120);
  const galaxyAsked = useDelay(LATENCY.quick + 40);

  const live = files.filter((file) => file.state === "live").length;
  const online = peers.filter((view) => view.online).length;
  const desktop = devices[0];
  const desktopUp = desktop ? isReachable(desktop) : false;
  const shared = media.filter((item) => item.shared).length;
  const waiting = "불러오는 중…";
  const failed = (screen: string) => `${screen} 화면에서 상태를 확인해주세요.`;
  const reloadAll = () => {
    filesAsked.reload();
    networkAsked.reload();
    wolAsked.reload();
    galaxyAsked.reload();
  };

  return (
    <>
      <PageHeader
        title="서비스 관리"
        description="공유 자료와 연결된 기기를 한곳에서 관리합니다."
        actions={<Button variant="ghost" onClick={reloadAll}><Glyph name="refresh-cw" />새로고침</Button>}
      />

      <Stack gap="lg">
        <Grid columns={{ base: "minmax(0, 1fr)", lg: "repeat(2, minmax(0, 1fr))" }} gap="lg">
          <ServiceCard
            glyph="folder"
            title="files"
            description="파일과 폴더를 공유하고, 링크의 공개 범위와 다운로드 제한을 관리합니다."
            status={demo === "error" ? failed("파일") : filesAsked.ready ? `${live}개 공유 중 · 전체 ${files.length}개` : waiting}
          >
            <Button as={RouterLink} to={serviceTo("files")} variant="hairline">파일 관리<Glyph name="arrow-right" /></Button>
            <Button variant="ghost" onClick={() => toast("데모에서는 공개 사이트로 이동하지 않습니다")}>공개 사이트</Button>
          </ServiceCard>

          <ServiceCard
            glyph="network"
            title="WireGuard"
            description="내 기기와 친구의 VPN 연결을 확인하고, 기기별 속도 제한을 조정합니다."
            status={demo === "error" ? failed("네트워크") : networkAsked.ready ? `${peers.length}대 등록 · ${online}대 최근 연결` : waiting}
          >
            <Button as={RouterLink} to={serviceTo("wireguard")} variant="hairline">기기 관리<Glyph name="arrow-right" /></Button>
          </ServiceCard>

          <ServiceCard
            glyph="monitor"
            title="데스크탑 WOL"
            description="집의 데스크탑에 깨우기 신호를 보내고 연결 상태를 확인합니다."
            status={wolAsked.ready && desktop ? `${desktop.name} · ${desktopUp ? "응답 있음" : cooldownLeft(desktop) > 0 ? "신호를 보냈습니다" : "응답 없음"}` : waiting}
          >
            <Button as={RouterLink} to={serviceTo("wol")} variant="hairline">데스크탑 깨우기<Glyph name="arrow-right" /></Button>
          </ServiceCard>

          <ServiceCard
            glyph="film"
            title="Galaxy S23+"
            description="휴대폰 영상과 사진을 보고, 외부 공개 여부를 관리합니다."
            status={galaxyAsked.ready ? `사진 ${formatNumber(GALAXY.photos)}장 · 영상 ${GALAXY.videos}개 · 외부 공개 ${shared + GALAXY.sharedOlder}개` : waiting}
          >
            <Button as={RouterLink} to={serviceTo("galaxy")} variant="hairline">뷰어 열기<Glyph name="arrow-right" /></Button>
          </ServiceCard>
        </Grid>
      </Stack>

      <Stack gap="md">
        <SectionHeader
          title="최근 활동"
          description="서비스에서 일어난 일을 시간순으로 모았습니다."
          actions={<Button as={RouterLink} to={`${BASE}/activity`} variant="ghost">활동 기록<Glyph name="arrow-right" /></Button>}
        />
        <Card padding="lg" gap="md">
          <Stack as="ul" gap="md">
            {events.slice(0, 6).map((event, index) => (
              <Stack key={event.id} as="li" gap="md">
                {index > 0 ? <Divider aria-hidden /> : null}
                <Inline justify="between" gap="md" align="baseline">
                  <Stack minWidth={0}>
                    <Text as="span" truncate>{event.title}</Text>
                    <Text as="span" variant="label" strong={false} ink={event.level === "warning" ? "warning" : "tertiary"} truncate>
                      {SERVICE_LABEL[event.service]}{event.detail ? ` · ${event.detail}` : ""}
                    </Text>
                  </Stack>
                  <Text as="span" variant="label" strong={false} ink="tertiary" numeric>{since(event.at)}</Text>
                </Inline>
              </Stack>
            ))}
          </Stack>
        </Card>
      </Stack>
    </>
  );
};
