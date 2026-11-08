import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

import { Badge, Button, Field, FormField, Grid, Inline, Spinner, Stack, Text } from "@studio-baeks/paper-ui";

import { Glyph } from "../../../kit";
import { sleep, LATENCY, useDelay } from "../lib/hooks";
import { BASE, serviceTo } from "../registry";
import { useAdmin } from "../store/store";
import { Card } from "../ui/Card";

const LoginScreen = ({ onEnter }: { onEnter: () => void }) => {
  const [params] = useSearchParams();
  const configured = params.get("state") !== "unconfigured";
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const { log } = useAdmin();

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (busy || !configured) return;
    setBusy(true);
    setError(null);
    const attempt = password;
    setPassword("");
    await sleep(LATENCY.save);
    if (attempt.trim().toLowerCase() === "wrong") {
      log({ service: "hub", level: "warning", title: "로그인에 실패했습니다", detail: "10.20.10.2 · 비밀번호가 맞지 않음", actor: "시스템" });
      setError("비밀번호가 맞지 않습니다.");
      setBusy(false);
      input.current?.focus();
      return;
    }
    log({ service: "hub", level: "info", title: "로그인했습니다", detail: "10.20.10.2", actor: "관리자" });
    setBusy(false);
    onEnter();
  };

  return (
    <Grid as="main" justifyItems="center" align="center" minHeight="viewport" padding="lg">
      <Stack width="full" maxWidth="measure.xs">
        <Card>
          <Stack as="form" gap="xl" onSubmit={submit}>
            <Stack gap="sm">
              <Inline justify="between" align="center" gap="md">
                <Glyph name="shield-check" size="subheading" ink="secondary" />
                <Badge variant="hairline" size="sm">데모</Badge>
              </Inline>
              <Text as="h1" variant="title">관리 콘솔</Text>
              <Text as="p" ink="secondary">
                {configured ? "VPN에 연결한 뒤 관리자 비밀번호로 로그인해주세요." : "관리자 로그인이 아직 설정되지 않았습니다."}
              </Text>
            </Stack>
            <FormField
              label="비밀번호"
              invalid={error !== null}
              error={error}
              disabled={busy || !configured}
              description={configured ? "데모입니다. 아무 값이나 넣으면 들어갑니다. 실패한 모습은 wrong 을 넣으면 볼 수 있습니다." : undefined}
            >
              <Field ref={input} size="lg" type="password" autoComplete="off" showPasswordToggle value={password} onChange={(event) => setPassword(event.currentTarget.value)} />
            </FormField>
            <Button type="submit" size="lg" fullWidth loading={busy} loadingLabel="확인 중" disabled={!configured}>들어가기</Button>
          </Stack>
        </Card>
      </Stack>
    </Grid>
  );
};

export const LoginGate = ({ children }: { children: ReactNode }) => {
  const { signedIn, setSignedIn } = useAdmin();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { ready } = useDelay(LATENCY.quick);
  const forced = pathname === `${BASE}/login`;

  if (!ready) {
    return (
      <Grid justifyItems="center" align="center" minHeight="viewport">
        <Spinner label="로그인 상태 확인 중" />
      </Grid>
    );
  }
  if (signedIn && !forced) return <>{children}</>;
  const enter = () => {
    setSignedIn(true);
    navigate(params.get("next") === "galaxy" ? serviceTo("galaxy") : forced ? BASE : pathname, { replace: true });
  };
  return <LoginScreen onEnter={enter} />;
};
