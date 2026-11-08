import { Badge, Button, Divider, Floating, IconButton, Inline, Stack, Surface, Text } from "@studio-baeks/paper-ui";

import { Glyph, Menu, useStored, useToast, relative, type MenuItem } from "../../../kit";
import { NOTICES, SERVICES } from "../catalog";
import { clockText } from "../format";
import { printing } from "../model";
import { addLog } from "../sim/engine";
import { useActions, useSim } from "../sim/Provider";
import { useSettings } from "../settings";
import { ConfirmDialog } from "../ui/Dialog";
import { useQueryState } from "../ui/useQueryState";

type PowerAction = "firmware" | "klipper" | "moonraker" | "crowsnest" | "sonar" | "reboot" | "shutdown";

const POWER: Record<PowerAction, { title: string; body: string; done: string }> = {
  firmware: { title: "펌웨어를 다시 시작할까요?", body: "MCU와 Klipper를 모두 다시 시작합니다. 히터가 꺼지고 원점 정보가 사라집니다.", done: "펌웨어를 다시 시작했습니다" },
  klipper: { title: "Klipper를 다시 시작할까요?", body: "Klipper 호스트 소프트웨어를 다시 시작합니다. 설정 파일을 다시 읽습니다.", done: "Klipper를 다시 시작했습니다" },
  moonraker: { title: "Moonraker를 다시 시작할까요?", body: "API 서버가 몇 초 동안 응답하지 않습니다. 출력에는 영향이 없습니다.", done: "Moonraker를 다시 시작했습니다" },
  crowsnest: { title: "Crowsnest를 다시 시작할까요?", body: "웹캠 서비스를 다시 시작합니다. 화면이 잠시 끊깁니다.", done: "Crowsnest를 다시 시작했습니다" },
  sonar: { title: "Sonar를 다시 시작할까요?", body: "Wi-Fi 연결 감시 서비스를 다시 시작합니다.", done: "Sonar를 다시 시작했습니다" },
  reboot: { title: "호스트를 재부팅할까요?", body: "프린터를 제어하는 컴퓨터가 꺼졌다 켜집니다. 출력 중이면 출력이 실패합니다.", done: "호스트 재부팅을 요청했습니다" },
  shutdown: { title: "호스트를 종료할까요?", body: "프린터를 제어하는 컴퓨터가 꺼집니다. 다시 켜려면 전원을 직접 눌러야 합니다.", done: "호스트 종료를 요청했습니다" },
};

const isPower = (value: string | null): value is PowerAction => value !== null && value in POWER;

const HOLD: readonly PowerAction[] = ["firmware", "klipper", "reboot", "shutdown"];

export const EmergencyStop = () => {
  const { send } = useActions();
  const { settings } = useSettings();
  const toast = useToast();
  const [dialog, setDialog] = useQueryState("dialog");
  const stop = () => {
    send("M112");
    toast("모의 콘솔에 M112를 남겼습니다. 실제 프린터에는 아무것도 보내지 않았습니다");
  };
  return (
    <>
      <Button accent="error" variant="soft" size="sm" onClick={() => (settings.general.confirmEstop ? setDialog("estop") : stop())}>
        <Glyph name="octagon-alert" />
        긴급 정지
      </Button>
      <ConfirmDialog
        open={dialog === "estop"}
        onClose={() => setDialog(null)}
        title="긴급 정지를 보낼까요?"
        description="M112를 보내면 Klipper가 즉시 멈추고 히터가 꺼집니다. 출력 중이던 작업은 실패합니다."
        confirmLabel="긴급 정지"
        danger
        onConfirm={stop}
      >
        <Text ink="tertiary" variant="caption">이 화면은 모의 콘솔입니다. 확인하면 콘솔에 M112 한 줄만 남고, 실제 프린터에는 아무것도 보내지 않습니다.</Text>
      </ConfirmDialog>
    </>
  );
};

export const Notifications = () => {
  const [dismissed, setDismissed] = useStored<string[]>("printer:dismissed", []);
  const [dialog, setDialog] = useQueryState("dialog");
  const notices = NOTICES.filter((notice) => !dismissed.includes(notice.id));
  const sim = useSim();
  return (
    <Floating open={dialog === "notifications"} onOpenChange={(next) => setDialog(next ? "notifications" : null)}>
      <IconButton
        as={Floating.Trigger}
        variant="muted"
        shape="pill"
        size="sm"
        aria-label={`알림 ${notices.length}개`}
        badge={notices.length > 0 ? <Badge accent="info" variant="solid" size="xs">{notices.length}</Badge> : undefined}
      >
        <Glyph name="bell" />
      </IconButton>
      <Floating.Content as={Surface} fill="raised" border radius="lg" padding="md" placement="bottom end" width="xl" maxWidth="full" aria-label="알림">
        <Stack gap="sm">
          <Inline justify="between" align="center" paddingX="xs">
            <Text as="h2" variant="subheading">알림</Text>
            {notices.length > 0 ? <Button variant="ghost" size="xs" onClick={() => setDismissed(NOTICES.map((notice) => notice.id))}>모두 지우기</Button> : null}
          </Inline>
          {notices.length === 0 ? (
            <Stack align="center" gap="xs" paddingY="xl">
              <Glyph name="bell" size="subheading" ink="tertiary" />
              <Text ink="tertiary">새 알림이 없습니다</Text>
            </Stack>
          ) : (
            <Stack>
              {notices.map((notice, index) => (
                <Stack key={notice.id}>
                  {index > 0 ? <Divider /> : null}
                  <Inline gap="sm" align="start" paddingY="sm" justify="between" wrap={false}>
                    <Inline gap="sm" align="start" minWidth={0}>
                      <Glyph name={notice.tone === "info" ? "info" : "triangle-alert"} ink={notice.tone === "info" ? "info" : "warning"} />
                      <Stack gap="xs" minWidth={0}>
                        <Text as="span" strong>{notice.title}</Text>
                        <Text as="span" variant="caption" ink="secondary">{notice.body}</Text>
                        <Text as="span" variant="label" strong={false} ink="tertiary">{relative(new Date(notice.at))}</Text>
                      </Stack>
                    </Inline>
                    <IconButton variant="ghost" size="xs" aria-label={`${notice.title} 지우기`} onClick={() => setDismissed((list) => [...list, notice.id])}><Glyph name="x" /></IconButton>
                  </Inline>
                </Stack>
              ))}
            </Stack>
          )}
          <Text as="span" variant="label" strong={false} ink="tertiary">마지막 확인 {clockText(sim.clock, true)} · 업데이트 관리자 기준</Text>
        </Stack>
      </Floating.Content>
    </Floating>
  );
};

export const PowerMenu = () => {
  const sim = useSim();
  const { send, update } = useActions();
  const { settings } = useSettings();
  const toast = useToast();
  const [dialog, setDialog] = useQueryState("dialog");
  const busy = printing(sim.print.state);
  const ask = (action: PowerAction) => (settings.general.confirmPower ? setDialog(`power:${action}`) : run(action));
  const run = (action: PowerAction) => {
    if (action === "firmware") send("FIRMWARE_RESTART");
    else if (action === "klipper") send("RESTART");
    else update((s) => ({ ...addLog(s, "info", `// ${POWER[action].done} (모의)`), restarted: { ...s.restarted, [action]: s.clock } }));
    toast(`${POWER[action].done} (모의)`);
  };
  const hold = busy ? "출력 중" : undefined;
  const items: MenuItem[] = [
    { id: "h-printer", heading: "프린터" },
    { id: "firmware", label: "펌웨어 재시작", glyph: "rotate-ccw", disabled: busy, hint: hold, onSelect: () => ask("firmware") },
    { id: "klipper", label: "Klipper 재시작", glyph: "refresh-cw", disabled: busy, hint: hold, onSelect: () => ask("klipper") },
    { id: "d1", divider: true },
    { id: "h-services", heading: "서비스" },
    ...SERVICES.filter((service) => service.id !== "klipper").map<MenuItem>((service) => ({ id: service.id, label: `${service.label} 재시작`, glyph: "refresh-cw", onSelect: () => ask(service.id as PowerAction) })),
    { id: "d2", divider: true },
    { id: "h-host", heading: "호스트" },
    { id: "reboot", label: "재부팅", glyph: "rotate-cw", disabled: busy, hint: hold, onSelect: () => ask("reboot") },
    { id: "shutdown", label: "종료", glyph: "power", danger: true, disabled: busy, hint: hold, onSelect: () => ask("shutdown") },
  ];
  const action = dialog?.startsWith("power:") ? dialog.slice(6) : null;
  const pending = isPower(action) ? action : null;
  return (
    <>
      <Menu label="전원과 서비스" glyph="power" items={items} size="sm" />
      {pending ? (
        <ConfirmDialog
          open
          onClose={() => setDialog(null)}
          title={POWER[pending].title}
          description={busy && HOLD.includes(pending) ? "지금 출력 중이라 보낼 수 없습니다. 출력이 끝난 뒤에 다시 하세요." : POWER[pending].body}
          confirmLabel="확인"
          disabled={busy && HOLD.includes(pending)}
          danger={pending === "reboot" || pending === "shutdown"}
          onConfirm={() => run(pending)}
        />
      ) : null}
    </>
  );
};

export const TopActions = () => {
  const [, setSettings] = useQueryState("settings");
  return (
    <>
      <EmergencyStop />
      <Notifications />
      <IconButton variant="muted" shape="pill" size="sm" aria-label="설정" onClick={() => setSettings("general")}><Glyph name="settings" /></IconButton>
      <PowerMenu />
    </>
  );
};
