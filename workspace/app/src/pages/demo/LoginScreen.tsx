// A sign-in screen laid out as a product: the pitch on the canvas and the form on a raised face. The server is not there:
// everything answers after a short delay, and wrong@paper.ui is the account that always fails.

import { useRef, useState, type FormEvent, type ReactNode } from "react";

import { Box, Button, Checkbox, Divider, Field, Floating, FormField, Grid, IconButton, Inline, Link, LiveRegion, Marker, Stack, Surface, Text, announce } from "@studio-baeks/paper-ui";

import { CloseIcon } from "../../compositions/icons";
import { DemoBar, MAIN, Tabs } from "./parts";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const FAILING_EMAIL = "wrong@paper.ui";
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const emailError = (value: string) => {
  if (!value.trim()) return "이메일을 입력해주세요.";
  return EMAIL.test(value.trim()) ? undefined : "이메일 형식을 확인해주세요. 예: name@paper.ui";
};

// What came back from the server, in the region that was there before it did.
const Notice = ({ accent, title, children, onDismiss }: { accent: "error" | "success"; title: string; children: ReactNode; onDismiss: () => void }) => (
  <Box paddingY="sm">
    <Surface fill="sunken" radius="md" padding="md">
      <Inline align="start" justify="between" gap="sm">
        <Stack gap="xs">
          <Text as="p" strong ink={accent}>{title}</Text>
          <Text as="p" ink="secondary">{children}</Text>
        </Stack>
        <IconButton size="xs" variant="ghost" accent={accent} aria-label="알림 닫기" onClick={onDismiss}><CloseIcon /></IconButton>
      </Inline>
    </Surface>
  </Box>
);

const SignIn = ({ onForgot, email, onEmail }: { onForgot: () => void; email: string; onEmail: (value: string) => void }) => {
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [phase, setPhase] = useState<"idle" | "loading" | "failed" | "done">("idle");
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const errors = { email: emailError(email), password: password ? undefined : "비밀번호를 입력해주세요." };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (phase === "loading") return;
    setSubmitted(true);
    if (errors.email || errors.password) {
      (errors.email ? emailRef : passwordRef).current?.focus();
      announce("입력을 확인해주세요.", { politeness: "assertive" });
      return;
    }
    setPhase("loading");
    await wait(900);
    setPhase(email.trim().toLowerCase() === FAILING_EMAIL ? "failed" : "done");
  };

  return (
    <Box>
      <LiveRegion politeness="assertive">
        {phase === "failed" ? <Notice accent="error" title="이메일 또는 비밀번호가 맞지 않아요" onDismiss={() => setPhase("idle")}>입력한 내용을 다시 확인해주세요.</Notice> : null}
        {phase === "done" ? <Notice accent="success" title="로그인했어요" onDismiss={() => setPhase("idle")}>{email.split("@")[0]}님, 다시 만나서 반가워요.</Notice> : null}
      </LiveRegion>
      <Stack as="form" noValidate onSubmit={submit} aria-label="로그인" gap="lg">
        <FormField label="이메일" required invalid={submitted && Boolean(errors.email)} error={errors.email}>
          <Field ref={emailRef} size="lg" type="email" name="email" autoComplete="email" placeholder="name@studiobaeks.com" value={email} onChange={(event) => onEmail(event.target.value)} />
        </FormField>
        <FormField label="비밀번호" required invalid={submitted && Boolean(errors.password)} error={errors.password}>
          <Field ref={passwordRef} size="lg" type="password" name="password" autoComplete="current-password" showPasswordToggle value={password} onChange={(event) => setPassword(event.target.value)} />
        </FormField>
        <Inline justify="between" gap="sm" wrap>
          <Inline as="label" gap="sm">
            <Checkbox name="remember" defaultChecked />
            <Text as="span">로그인 상태 유지</Text>
          </Inline>
          <Link as="button" type="button" underline="hover" onClick={onForgot}>비밀번호 찾기</Link>
        </Inline>
        <Button type="submit" size="lg" fullWidth loading={phase === "loading"} loadingLabel="로그인하는 중">로그인</Button>
        <Grid columns="1fr auto 1fr" align="center" gap="md">
          <Divider />
          <Text as="span" variant="label" strong={false} ink="tertiary">또는</Text>
          <Divider />
        </Grid>
        <Button type="button" size="lg" variant="hairline" fullWidth>Google로 계속하기</Button>
      </Stack>
    </Box>
  );
};

const SignUp = ({ email, onEmail }: { email: string; onEmail: (value: string) => void }) => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [terms, setTerms] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [phase, setPhase] = useState<"idle" | "loading" | "done">("idle");
  const errors = {
    email: emailError(email),
    password: password.length >= 8 ? undefined : "비밀번호는 8자 이상으로 정해주세요.",
    confirm: confirm === password ? undefined : "비밀번호가 서로 달라요.",
    terms: terms ? undefined : "약관에 동의해야 가입할 수 있어요.",
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (phase === "loading") return;
    setSubmitted(true);
    if (Object.values(errors).some(Boolean)) {
      announce("입력을 확인해주세요.", { politeness: "assertive" });
      return;
    }
    setPhase("loading");
    await wait(900);
    setPhase("done");
  };
  return (
    <Box>
      <LiveRegion>
        {phase === "done" ? <Notice accent="success" title="가입을 마쳤어요" onDismiss={() => setPhase("idle")}>{email}로 시작할 수 있어요.</Notice> : null}
      </LiveRegion>
      <Stack as="form" noValidate onSubmit={submit} aria-label="회원가입" gap="lg">
        <FormField label="이메일" required invalid={submitted && Boolean(errors.email)} error={errors.email}>
          <Field size="lg" type="email" autoComplete="email" placeholder="name@studiobaeks.com" value={email} onChange={(event) => onEmail(event.target.value)} />
        </FormField>
        <FormField label="비밀번호" required invalid={submitted && Boolean(errors.password)} error={errors.password}>
          <Field size="lg" type="password" autoComplete="new-password" showPasswordToggle value={password} onChange={(event) => setPassword(event.target.value)} />
        </FormField>
        <FormField label="비밀번호 확인" required invalid={submitted && Boolean(errors.confirm)} error={errors.confirm}>
          <Field size="lg" type="password" autoComplete="new-password" value={confirm} onChange={(event) => setConfirm(event.target.value)} />
        </FormField>
        <Stack gap="xs">
          <Inline as="label" gap="sm">
            <Checkbox status={submitted && errors.terms ? "error" : undefined} checked={terms} onChange={(event) => setTerms(event.target.checked)} />
            <Text as="span">이용약관에 동의합니다</Text>
          </Inline>
          {submitted && errors.terms ? <Text variant="caption" ink="error">{errors.terms}</Text> : null}
        </Stack>
        <Button type="submit" size="lg" fullWidth loading={phase === "loading"} loadingLabel="가입하는 중">가입하기</Button>
      </Stack>
    </Box>
  );
};

const ForgotPassword = ({ open, onOpenChange, initialEmail }: { open: boolean; onOpenChange: (open: boolean) => void; initialEmail: string }) => {
  const input = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState(initialEmail);
  const [error, setError] = useState<string>();
  const [phase, setPhase] = useState<"asking" | "sending" | "sent">("asking");
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (phase === "sending") return;
    const problem = emailError(email);
    setError(problem);
    if (problem) {
      input.current?.focus();
      return;
    }
    setPhase("sending");
    await wait(900);
    setPhase("sent");
    announce(`${email}로 재설정 메일을 보냈어요.`);
  };
  const change = (next: boolean) => {
    if (next) {
      setEmail(initialEmail);
      setError(undefined);
      setPhase("asking");
    }
    onOpenChange(next);
  };
  return (
    <Floating open={open} onOpenChange={change}>
      <Floating.Content as={Surface} fill="raised" radius="lg" padding="xl" width="xl" maxWidth="full" presentation="modal" aria-label="비밀번호 찾기" initialFocusRef={input}>
        {phase === "sent" ? (
          <Stack gap="lg">
            <Text as="h2" variant="heading">메일을 보냈어요</Text>
            <Text as="p" ink="secondary">{email}로 재설정 링크를 보냈어요. 몇 분이 지나도 메일이 없다면 스팸함을 확인해주세요.</Text>
            <Inline justify="end"><Button as={Floating.Close}>확인</Button></Inline>
          </Stack>
        ) : (
          <Stack as="form" noValidate onSubmit={submit} gap="lg">
            <Stack gap="xs">
              <Text as="h2" variant="heading">비밀번호 찾기</Text>
              <Text as="p" ink="secondary">가입한 이메일로 비밀번호를 새로 정할 수 있는 링크를 보내드려요.</Text>
            </Stack>
            <FormField label="이메일" required invalid={Boolean(error)} error={error}>
              <Field ref={input} type="email" autoComplete="email" placeholder="name@studiobaeks.com" value={email} onChange={(event) => setEmail(event.target.value)} />
            </FormField>
            <Inline justify="end" gap="sm">
              <Button as={Floating.Close} variant="ghost">취소</Button>
              <Button type="submit" loading={phase === "sending"} loadingLabel="메일을 보내는 중">재설정 메일 보내기</Button>
            </Inline>
          </Stack>
        )}
      </Floating.Content>
    </Floating>
  );
};

export const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [forgot, setForgot] = useState(false);
  return (
    <Grid rows="auto minmax(0, 1fr)" gap="lg" minHeight="viewport" padding="lg">
      <DemoBar />
      <Grid {...MAIN} columns={{ base: "minmax(0, 1fr)", md: "minmax(0, 1fr) minmax(0, 35rem)" }} gap="lg">
        <Stack justify="between" gap="xl" padding="xl">
          <Text as="p" variant="subheading">Studio Baeks</Text>
          <Stack gap="lg" maxWidth="measure.md">
            <Text as="h1" variant="hero">다시 <Marker>이어서</Marker>{" "}<Box as="br" />만들어 볼까요?</Text>
            <Text as="p" ink="secondary">Studio Baeks의 도구를 한 계정으로 씁니다.</Text>
          </Stack>
          <Box />
        </Stack>
        <Surface as={Grid} fill="raised" radius="lg" shadow justifyItems="center" align="center" padding="xl">
          <Stack gap="xl" width="full" maxWidth="xl">
            <Tabs
              label="로그인 방식"
              stretch
              tabs={[
                { id: "signin", label: "로그인", panel: <SignIn onForgot={() => setForgot(true)} email={email} onEmail={setEmail} /> },
                { id: "signup", label: "회원가입", panel: <SignUp email={email} onEmail={setEmail} /> },
              ]}
            />
            <Text as="p" variant="label" strong={false} ink="tertiary">계속하면 이용약관과 개인정보 처리방침에 동의하게 됩니다.</Text>
          </Stack>
        </Surface>
      </Grid>
      <ForgotPassword open={forgot} onOpenChange={setForgot} initialEmail={email} />
    </Grid>
  );
};
