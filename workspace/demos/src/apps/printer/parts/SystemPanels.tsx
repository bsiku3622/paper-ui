// What the Machine page says about the printer's computer and its software: the loads of the MCU and the host, the update
// manager, the endstops and the log files. The numbers are sample ones moving a little with the mock's clock; an update
// is refused while a print runs (as on the real printer) and otherwise "installs" on a timer; the logs are small mock files.

import { useEffect, useState } from "react";

import { Badge, Button, Divider, Floating, Grid, IconButton, Inline, Stack, Surface, Text } from "@studio-baeks/paper-ui";

import { Glyph, Meter, useToast } from "../../../kit";
import { Ring } from "../content/Ring";
import { downloadText } from "../content/files";
import { HOST_LOAD } from "../data/load";
import { logText } from "../data/configs";
import { UPDATE_COMPONENTS, type UpdateComponent } from "../data/updates";
import { degrees } from "../format";
import { printing } from "../model";
import { noise } from "../sim/engine";
import { useActions, useSim } from "../sim/Provider";
import { Panel } from "../ui/Panel";
import { ConfirmDialog } from "../ui/Dialog";

const Line = ({ label, children }: { label: string; children: string }) => (
  <Text as="span" variant="caption" ink="secondary">
    <Text as="span" variant="caption" ink="tertiary">{label} </Text>
    <Text as="span" variant="caption" numeric>{children}</Text>
  </Text>
);

export const LoadsPanel = () => {
  const sim = useSim();
  const cpu = Math.max(0.5, HOST_LOAD.cpu + (noise(sim.tick, 11) - 0.5) * 3);
  const mem = HOST_LOAD.memUsed / HOST_LOAD.memTotal + (noise(sim.tick, 12) - 0.5) * 0.002;
  const temperature = HOST_LOAD.cpuTemp + (noise(sim.tick, 13) - 0.5) * 1.2;
  const load = 0.27 + (noise(sim.tick, 14) - 0.5) * 0.08;
  const usedMb = mem * (HOST_LOAD.memTotal / 1024);
  return (
    <Panel
      id="loads"
      title="시스템 부하"
      glyph="cpu"
      actions={
        <Floating>
          <Button as={Floating.Trigger} variant="ghost" size="xs"><Glyph name="plug" />장치</Button>
          <Floating.Content as={Surface} fill="raised" border radius="md" padding="md" placement="bottom end" width="lg" maxWidth="full" aria-label="연결된 장치">
            <Stack gap="sm">
              <Text as="h3" variant="subheading">연결된 장치</Text>
              {[
                { name: "USB 직렬 장치", note: "MCU (stm32f103xe)에 연결" },
                { name: "UVC 카메라", note: "Crowsnest 웹캠 (/dev/video0)" },
              ].map((device, index) => (
                <Stack key={device.name}>
                  {index > 0 ? <Divider aria-hidden /> : null}
                  <Stack gap="xs" paddingY="sm">
                    <Text as="span" strong>{device.name}</Text>
                    <Text as="span" variant="caption" ink="tertiary">{device.note}</Text>
                  </Stack>
                </Stack>
              ))}
            </Stack>
          </Floating.Content>
        </Floating>
      }
    >
      <Stack gap="lg">
        <Grid columns="minmax(0, 1fr) auto" gap="md" align="start">
          <Stack gap="xs" minWidth={0}>
            <Inline gap="sm" align="baseline" wrap>
              <Text as="span" strong>mcu</Text>
              <Text as="span" variant="caption" ink="tertiary">(stm32f103xe)</Text>
            </Inline>
            <Line label="버전">v0.13.0-320-gc80324946</Line>
            <Line label="부하">{`0.02 · 깨어 있음 0.00 · 클럭 72 MHz`}</Line>
          </Stack>
          <Ring value={0.02} size="lg" tone="info" label="MCU 부하 2%">2</Ring>
        </Grid>
        <Divider />
        <Grid columns="minmax(0, 1fr) auto" gap="md" align="start">
          <Stack gap="xs" minWidth={0}>
            <Inline gap="sm" align="baseline" wrap>
              <Text as="span" strong>호스트</Text>
              <Text as="span" variant="caption" ink="tertiary">(aarch64, 64bit)</Text>
            </Inline>
            <Line label="버전">v0.13.0-593-g2f05309d5</Line>
            <Line label="OS">Debian GNU/Linux 12 (bookworm)</Line>
            <Line label="배포판">MainsailOS 2.2.2 (bookworm)</Line>
            <Line label="부하">{`${load.toFixed(2)} · 메모리 ${usedMb.toFixed(1)} MB / 7.5 GB · 온도 ${degrees(temperature, 0)}`}</Line>
            <Line label="wlan0">{`대역폭 ${(20 + (noise(sim.tick, 15) - 0.5) * 2).toFixed(1)} kB/s · 받음 3.3 GB · 보냄 39.7 GB`}</Line>
          </Stack>
          <Inline gap="md" align="start">
            <Stack align="center" gap="xs"><Ring value={cpu / 100} size="lg" tone="info" label={`CPU ${cpu.toFixed(0)}%`}>{Math.round(cpu)}</Ring><Text as="span" variant="label" strong={false} ink="tertiary">CPU</Text></Stack>
            <Stack align="center" gap="xs"><Ring value={mem} size="lg" tone="info" label={`메모리 ${(mem * 100).toFixed(0)}%`}>{Math.round(mem * 100)}</Ring><Text as="span" variant="label" strong={false} ink="tertiary">메모리</Text></Stack>
          </Inline>
        </Grid>
      </Stack>
    </Panel>
  );
};

type Progress = { name: string; value: number } | null;

export const UpdatesPanel = () => {
  const sim = useSim();
  const { update } = useActions();
  const toast = useToast();
  const [done, setDone] = useState<readonly string[]>([]);
  const [asking, setAsking] = useState<UpdateComponent | "all" | null>(null);
  const [progress, setProgress] = useState<Progress>(null);
  const busy = printing(sim.print.state);
  useEffect(() => {
    if (!progress) return;
    const timer = window.setTimeout(() => {
      if (progress.value >= 1) {
        const names = progress.name === "all" ? UPDATE_COMPONENTS.filter((item) => item.valid && item.remote && item.version !== item.remote).map((item) => item.name) : [progress.name];
        setDone((now) => [...now, ...names]);
        update((s) => ({ ...s, restarted: { ...s.restarted, ...Object.fromEntries(names.map((name) => [name, s.clock])) } }));
        toast(progress.name === "all" ? "모든 구성 요소를 업데이트했습니다 (모의)" : `${progress.name}을 업데이트했습니다 (모의)`);
        setProgress(null);
      } else setProgress({ ...progress, value: Math.min(1, progress.value + 0.2) });
    }, 450);
    return () => window.clearTimeout(timer);
  }, [progress, toast, update]);
  const pending = UPDATE_COMPONENTS.filter((item) => item.valid && item.remote && item.version !== item.remote && !done.includes(item.name)).length;
  return (
    <Panel id="updates" title="업데이트 관리자" glyph="refresh-cw" actions={<IconButton variant="ghost" size="sm" aria-label="업데이트 확인" onClick={() => toast("업데이트를 확인했습니다 (모의: 새 소식 없음)")}><Glyph name="refresh-cw" /></IconButton>}>
      <Stack gap="md">
        <Stack as="ul" aria-label="구성 요소">
          {UPDATE_COMPONENTS.map((item, index) => {
            const upToDate = done.includes(item.name) || (item.name !== "system" && item.version === item.remote);
            const system = item.name === "system";
            return (
              <Stack as="li" key={item.name}>
                {index > 0 ? <Divider aria-hidden /> : null}
                <Grid columns="minmax(0, 1fr) auto" gap="md" align="center" paddingY="sm">
                  <Stack gap="xs" minWidth={0}>
                    <Text as="span" strong>{system ? "시스템" : item.name}</Text>
                    {system ? (
                      <Text as="span" variant="caption" ink="info">{done.includes("system") ? "패키지가 모두 최신입니다" : `패키지 ${item.packages}개를 올릴 수 있습니다`}</Text>
                    ) : upToDate ? (
                      <Text as="span" variant="caption" ink="tertiary" numeric>{done.includes(item.name) ? item.remote : item.version}</Text>
                    ) : (
                      <Text as="span" variant="caption" ink="info" numeric>{item.version} → {item.remote}{item.behind > 0 ? ` · 커밋 ${item.behind}개 뒤` : ""}</Text>
                    )}
                  </Stack>
                  {system ? (
                    <Button variant="hairline" size="sm" disabled={busy || done.includes("system") || progress !== null} onClick={() => setAsking(item)}>업그레이드</Button>
                  ) : upToDate ? (
                    <Badge variant="soft" accent="success" size="sm">최신</Badge>
                  ) : item.valid ? (
                    <Button variant="hairline" size="sm" disabled={busy || progress !== null} onClick={() => setAsking(item)}>업데이트</Button>
                  ) : (
                    <Badge variant="soft" accent="warning" size="sm" title="저장소가 기대한 상태가 아니라 업데이트를 거부합니다">유효하지 않음</Badge>
                  )}
                </Grid>
              </Stack>
            );
          })}
        </Stack>
        {progress ? <Meter value={progress.value} tone="info" weight="thin" label={`${progress.name === "all" ? "모든 구성 요소" : progress.name} 업데이트 중`} valueText={`${Math.round(progress.value * 100)}%`} /> : null}
        <Divider />
        <Inline justify="between" align="center" gap="md" wrap>
          <Text as="span" variant="caption" ink="tertiary">{busy ? "출력 중에는 업데이트할 수 없습니다." : pending > 0 ? `올릴 수 있는 구성 요소 ${pending}개` : "모두 최신입니다."}</Text>
          <Button size="sm" disabled={busy || pending === 0 || progress !== null} onClick={() => setAsking("all")}><Glyph name="download" />모두 업데이트</Button>
        </Inline>
      </Stack>
      <ConfirmDialog
        open={asking !== null}
        onClose={() => setAsking(null)}
        title={asking === "all" ? "모든 구성 요소를 업데이트할까요?" : `${asking ? (asking.name === "system" ? "시스템 패키지" : asking.name) : ""}을 업데이트할까요?`}
        description="업데이트하는 동안 서비스가 몇 번 다시 시작됩니다. 모의 프린터라 실제로는 아무것도 바뀌지 않습니다."
        confirmLabel="업데이트"
        onConfirm={() => asking && setProgress({ name: asking === "all" ? "all" : asking.name, value: 0.1 })}
      />
    </Panel>
  );
};

export const EndstopsPanel = () => {
  const { endstops } = useSim();
  const { send } = useActions();
  return (
    <Panel
      id="endstops"
      title="엔드스톱"
      glyph="arrow-up-to-line"
      actions={<IconButton variant="ghost" size="sm" aria-label="엔드스톱 읽기" onClick={() => send("QUERY_ENDSTOPS")}><Glyph name="refresh-cw" /></IconButton>}
    >
      {endstops ? (
        <Inline gap="sm" wrap>
          {(["x", "y", "z"] as const).map((axis) => (
            <Badge key={axis} variant="soft" accent={endstops[axis] === "open" ? "primary" : "warning"} size="md">{axis.toUpperCase()} {endstops[axis] === "open" ? "열림" : "눌림"}</Badge>
          ))}
        </Inline>
      ) : (
        <Text ink="tertiary">현재 엔드스톱 상태를 읽으려면 오른쪽 위의 새로 고침을 누르세요.</Text>
      )}
    </Panel>
  );
};

export const LogsPanel = () => {
  const toast = useToast();
  const logs = [
    { id: "klippy", label: "Klippy" },
    { id: "moonraker", label: "Moonraker" },
    { id: "crowsnest", label: "Crowsnest" },
  ] as const;
  return (
    <Panel id="logs" title="로그 파일" glyph="file-text">
      <Stack gap="sm">
        {logs.map((log) => (
          <Button key={log.id} variant="hairline" fullWidth onClick={() => { downloadText(`${log.id}.log`, logText(log.id)); toast(`${log.label} 로그를 내려받았습니다 (모의 내용)`); }}><Glyph name="download" />{log.label}</Button>
        ))}
      </Stack>
    </Panel>
  );
};
