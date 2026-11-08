// What the Wake-on-LAN screens say about a device the same way everywhere: whether it answers, how a signal ended, and the
// button that sends one (with the pause between two signals counted down).

import { useState, type ReactNode } from "react";

import { Badge, Button, Inline, Spinner, Stack, Text } from "@studio-baeks/paper-ui";

import { Glyph } from "../../../../kit";
import type { WakeResult, WolDevice } from "../../data/types";
import { cooldownLeft, isReachable } from "../../data/wol";
import { now } from "../../lib/clock";
import { messageOf } from "../../lib/errors";
import { useTick } from "../../lib/hooks";
import { useWolApi } from "../../store/api";
import { Alert } from "../../ui/Parts";

export const ReachBadge = ({ device }: { device: WolDevice }) => {
  const up = isReachable(device);
  return <Badge accent={up ? "success" : "warning"} dot>{up ? "응답 있음" : "응답 없음"}</Badge>;
};

export const ResultBadge = ({ result }: { result: WakeResult }) => {
  if (result === "응답 확인") return <Badge accent="success" variant="soft" dot>{result}</Badge>;
  if (result === "응답 없음") return <Badge accent="warning" variant="soft" dot>{result}</Badge>;
  if (result === "대기 중") return <Badge accent="info" variant="soft" dot>{result}</Badge>;
  return <Badge>{result}</Badge>;
};

// The signal button, the notice under it while the device wakes, and what went wrong if the signal could not be sent.
export const WakeControl = ({ device, size = "md", extra }: { device: WolDevice; size?: "sm" | "md"; extra?: ReactNode }) => {
  const { wake } = useWolApi();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useTick(1000);
  const at = now();
  const left = cooldownLeft(device, at);
  const waiting = device.bootsAt !== null && at < device.bootsAt;
  const answered = device.bootsAt !== null && at >= device.bootsAt && at < device.bootsAt + 12_000 && isReachable(device, at);

  const send = async () => {
    setBusy(true);
    setError(null);
    try {
      await wake(device.id);
    } catch (reason) {
      setError(messageOf(reason, "깨우기 신호를 보내지 못했습니다."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Stack gap="md">
      <Inline gap="sm" wrap>
        <Button size={size} loading={busy} loadingLabel="보내는 중" disabled={left > 0} onClick={() => void send()}>
          <Glyph name="power" />
          {left > 0 ? `${left}초 뒤 다시 전송` : "깨우기"}
        </Button>
        {extra}
      </Inline>
      {waiting ? (
        <Inline gap="sm" align="start">
          <Spinner size="inline" label="응답을 기다리는 중" />
          <Text role="status" variant="caption" ink="secondary">깨우기 신호를 보냈습니다. 응답을 10초마다 확인합니다.</Text>
        </Inline>
      ) : null}
      {answered ? <Text role="status" variant="caption" ink="success">{device.name}이(가) 응답했습니다.</Text> : null}
      {error ? <Alert>{error}</Alert> : null}
    </Stack>
  );
};
