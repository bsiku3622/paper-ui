// A sign-in screen laid out as a product: the pitch on the canvas and the form on a raised face. The server is not there: everything
// answers after a short delay and accepts what it is given, and a few addresses stand for the cases that go wrong or go another way
// (listed on the left). A step is a place in the flow and lives in the address (?step=), so each can be opened and shared by itself.
// A password is held in its field while the form is on the screen and is gone with it: nothing here is stored.

import { useEffect, useRef, useState, type ClipboardEvent, type FormEvent, type KeyboardEvent, type RefObject } from "react";
import { Link as RouterLink } from "react-router-dom";

import { Box, Button, Checkbox, Divider, Field, Floating, FormField, Grid, Inline, Link, LiveRegion, Marker, Radio, Spinner, Stack, Surface, Text, announce } from "@studio-baeks/paper-ui";

import { ArrowLeftIcon, CheckIcon } from "../../compositions/icons";
import { Dialog, DialogFooter, EMAIL, MAIN, Notice, ScreenBar, StrengthMeter, useParam, useWide, wait } from "./parts";

const STEPS = ["signin", "signup", "verify", "sso", "reset", "done"] as const;
type Step = (typeof STEPS)[number];
type Outcome = { how: "signin" | "signup" | "sso" | "reset"; who: string; provider?: string };

const FAILING_EMAIL = "wrong@paper.ui";
const DEMO_ACCOUNTS: readonly (readonly [string, string])[] = [
  ["아무 이메일과 비밀번호", "로그인합니다"],
  [FAILING_EMAIL, "계속 틀립니다. 세 번이면 잠시 멈춥니다"],
  ["locked@paper.ui", "잠긴 계정입니다"],
  ["offline@paper.ui", "서버에 연결하지 못합니다. 세 번째에 됩니다"],
  ["2fa@paper.ui", "인증 코드를 거칩니다"],
  ["taken@paper.ui", "이미 가입한 이메일입니다 (회원가입)"],
  ["name@arcfield.example", "회사 SSO로 안내합니다"],
];

const emailError = (value: string) => {
  if (!value.trim()) return "이메일을 입력해주세요.";
  return EMAIL.test(value.trim()) ? undefined : "이메일 형식을 확인해주세요. 예: name@paper.ui";
};

// Seconds left until a moment that starts when it is made and can be started over.
const useCountdown = (seconds: number) => {
  const [deadline, setDeadline] = useState(() => Date.now() + seconds * 1000);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  return [Math.max(0, Math.ceil((deadline - now) / 1000)), () => { setDeadline(Date.now() + seconds * 1000); setNow(Date.now()); }] as const;
};

const minutesAndSeconds = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

// ─── Sign in ─────────────────────────────────────────────────────────────────────────────────────────────────────────

type Phase = "idle" | "loading" | "failed" | "throttled" | "locked" | "offline" | "sso";

const PROVIDERS = ["Google", "GitHub"] as const;

const SignIn = ({ email, onEmail, onForgot, onVerify, onSso, onDone }: { email: string; onEmail: (value: string) => void; onForgot: () => void; onVerify: () => void; onSso: (domain?: string) => void; onDone: (outcome: Outcome) => void }) => {
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [fails, setFails] = useState(0);
  const [tries, setTries] = useState(0);
  const [cooldown, restart] = useCountdown(30);
  const [paused, setPaused] = useState(false);
  const [redirecting, setRedirecting] = useState<string | null>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const errors = { email: emailError(email), password: password ? undefined : "비밀번호를 입력해주세요." };
  const waiting = paused && cooldown > 0;

  // Once the pause is over the failures are forgotten and the form is as it was.
  useEffect(() => {
    if (paused && cooldown === 0) {
      setPaused(false);
      setFails(0);
      setPhase("idle");
    }
  }, [paused, cooldown]);

  const submit = async (event?: FormEvent) => {
    event?.preventDefault();
    if (phase === "loading" || waiting) return;
    setSubmitted(true);
    if (errors.email || errors.password) {
      (errors.email ? emailRef : passwordRef).current?.focus();
      announce("입력을 확인해주세요.", { politeness: "assertive" });
      return;
    }
    setPhase("loading");
    await wait(900);
    const address = email.trim().toLowerCase();
    const domain = address.split("@")[1] ?? "";
    if (address === FAILING_EMAIL) {
      const next = fails + 1;
      setFails(next);
      if (next >= 3) {
        restart();
        setPaused(true);
        setPhase("throttled");
      } else setPhase("failed");
      return;
    }
    if (address === "locked@paper.ui") return setPhase("locked");
    if (address === "offline@paper.ui" && tries < 2) {
      setTries(tries + 1);
      return setPhase("offline");
    }
    if (domain === "arcfield.example") return setPhase("sso");
    if (address === "2fa@paper.ui") return onVerify();
    onDone({ how: "signin", who: address.split("@")[0]! });
  };

  const provider = async (name: string) => {
    setRedirecting(name);
    await wait(1400);
    onDone({ how: "sso", who: "name", provider: name });
  };

  const domain = email.trim().split("@")[1] ?? "";
  return (
    <Box>
      <LiveRegion politeness="assertive">
        {phase === "failed" ? <Box paddingY="sm"><Notice accent="error" title="이메일 또는 비밀번호가 맞지 않습니다" onDismiss={() => setPhase("idle")}>입력한 내용을 다시 확인해주세요. {fails}/3번째 시도입니다.</Notice></Box> : null}
        {phase === "throttled" ? <Box paddingY="sm"><Notice accent="error" title="시도가 너무 많습니다" onDismiss={waiting ? undefined : () => setPhase("idle")}>보안을 위해 잠시 멈춥니다. {cooldown}초 뒤에 다시 시도해주세요.</Notice></Box> : null}
        {phase === "locked" ? (
          <Box paddingY="sm">
            <Notice accent="error" title="계정이 잠겼습니다" onDismiss={() => setPhase("idle")}>
              비밀번호를 여러 번 틀려 계정을 잠갔습니다. 메일로 잠금을 풀 수 있습니다.{" "}
              <Button size="xs" variant="hairline" onClick={onForgot}>잠금 해제 메일 받기</Button>
            </Notice>
          </Box>
        ) : null}
        {phase === "offline" ? (
          <Box paddingY="sm">
            <Notice accent="error" title="서버에 연결하지 못했습니다" onDismiss={() => setPhase("idle")}>
              네트워크를 확인하고 다시 시도해주세요.{" "}
              <Button size="xs" variant="hairline" onClick={() => submit()}>다시 시도</Button>
            </Notice>
          </Box>
        ) : null}
        {phase === "sso" ? (
          <Box paddingY="sm">
            <Notice accent="info" title="회사 계정은 SSO로 로그인합니다" onDismiss={() => setPhase("idle")}>
              {domain}은(는) 조직의 SSO를 쓰고 있어 비밀번호로 로그인할 수 없습니다.{" "}
              <Button size="xs" variant="hairline" onClick={() => onSso(domain)}>SSO로 계속하기</Button>
            </Notice>
          </Box>
        ) : null}
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
        <Button type="submit" size="lg" fullWidth disabled={waiting} loading={phase === "loading"} loadingLabel="로그인하는 중">{waiting ? `${cooldown}초 뒤에 다시 시도` : "로그인"}</Button>
        <Grid columns="1fr auto 1fr" align="center" gap="md">
          <Divider />
          <Text as="span" variant="label" strong={false} ink="tertiary">또는</Text>
          <Divider />
        </Grid>
        {PROVIDERS.map((name) => (
          <Button key={name} type="button" size="lg" variant="hairline" fullWidth loading={redirecting === name} loadingLabel={`${name}로 이동하는 중`} disabled={redirecting !== null && redirecting !== name} onClick={() => provider(name)}>{name}로 계속하기</Button>
        ))}
        <Button type="button" size="lg" variant="hairline" fullWidth disabled={redirecting !== null} onClick={() => onSso()}>회사 계정(SSO)으로 계속하기</Button>
      </Stack>
    </Box>
  );
};

// ─── Sign up ─────────────────────────────────────────────────────────────────────────────────────────────────────────

const SignUp = ({ email, onEmail, onSignIn, onDone }: { email: string; onEmail: (value: string) => void; onSignIn: () => void; onDone: () => void }) => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [terms, setTerms] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [phase, setPhase] = useState<"idle" | "loading" | "taken">("idle");
  const errors = {
    email: emailError(email) ?? (phase === "taken" ? "이미 가입한 이메일입니다." : undefined),
    password: password.length >= 8 ? undefined : "비밀번호는 8자 이상으로 정해주세요.",
    confirm: confirm === password ? undefined : "비밀번호가 서로 다릅니다.",
    terms: terms ? undefined : "약관에 동의해야 가입할 수 있습니다.",
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (phase === "loading") return;
    setSubmitted(true);
    if (emailError(email) || errors.password || errors.confirm || errors.terms) {
      announce("입력을 확인해주세요.", { politeness: "assertive" });
      return;
    }
    setPhase("loading");
    await wait(900);
    if (email.trim().toLowerCase() === "taken@paper.ui") {
      setPhase("taken");
      announce("이미 가입한 이메일입니다.", { politeness: "assertive" });
      return;
    }
    onDone();
  };
  return (
    <Stack as="form" noValidate onSubmit={submit} aria-label="회원가입" gap="lg">
      <FormField label="이메일" required invalid={(submitted || phase === "taken") && Boolean(errors.email)} error={errors.email}>
        <Field size="lg" type="email" autoComplete="email" placeholder="name@studiobaeks.com" value={email} onChange={(event) => { onEmail(event.target.value); if (phase === "taken") setPhase("idle"); }} />
      </FormField>
      {phase === "taken" ? <Text as="p" ink="secondary">이미 계정이 있다면 <Link as="button" type="button" underline="hover" onClick={onSignIn}>로그인</Link>해주세요.</Text> : null}
      <FormField label="비밀번호" required invalid={submitted && Boolean(errors.password)} error={errors.password}>
        <Field size="lg" type="password" autoComplete="new-password" showPasswordToggle value={password} onChange={(event) => setPassword(event.target.value)} />
      </FormField>
      <StrengthMeter value={password} />
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
  );
};

// ─── The code ────────────────────────────────────────────────────────────────────────────────────────────────────────

// Six boxes for six digits: typing moves on, backspace moves back, and a pasted code fills them all.
const CodeInput = ({ value, onChange, invalid, disabled }: { value: string; onChange: (next: string) => void; invalid?: boolean; disabled?: boolean }) => {
  const boxes = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: 6 }, (_, index) => value[index] ?? "");
  const focus = (index: number) => boxes.current[Math.max(0, Math.min(5, index))]?.focus();
  const write = (index: number, text: string) => {
    const next = digits.slice();
    const clean = text.replace(/\D/g, "");
    if (!clean) {
      next[index] = "";
      onChange(next.join(""));
      return;
    }
    Array.from(clean).forEach((digit, offset) => { if (index + offset < 6) next[index + offset] = digit; });
    onChange(next.join(""));
    focus(index + clean.length);
  };
  const keys = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !digits[index]) {
      event.preventDefault();
      write(index - 1, "");
      focus(index - 1);
    } else if (event.key === "ArrowLeft") focus(index - 1);
    else if (event.key === "ArrowRight") focus(index + 1);
  };
  const paste = (index: number, event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    write(index, event.clipboardData.getData("text"));
  };
  return (
    <Grid role="group" aria-label="인증 코드" columns={6} gap="sm">
      {digits.map((digit, index) => (
        <Field key={index} ref={(element) => { boxes.current[index] = element; }} size="lg" textAlign="center" numeric inputMode="numeric" autoComplete={index === 0 ? "one-time-code" : "off"} aria-label={`인증 코드 ${index + 1}번째 숫자`}
          status={invalid ? "error" : undefined} disabled={disabled} value={digit} onFocus={(event) => event.target.select()} onChange={(event) => write(index, event.target.value.slice(-1))} onKeyDown={(event) => keys(index, event)} onPaste={(event) => paste(index, event)} />
      ))}
    </Grid>
  );
};

const Verify = ({ email, purpose, onDone }: { email: string; purpose: "signin" | "signup"; onDone: () => void }) => {
  const [code, setCode] = useState("");
  const [phase, setPhase] = useState<"idle" | "checking" | "wrong" | "locked" | "expired">("idle");
  const [wrongs, setWrongs] = useState(0);
  const [resent, setResent] = useState(false);
  const [expires, restartExpiry] = useCountdown(300);
  const [again, restartAgain] = useCountdown(30);

  const check = async (value: string) => {
    if (phase === "checking" || phase === "locked" || value.length !== 6) return;
    setPhase("checking");
    await wait(800);
    if (expires === 0) return setPhase("expired");
    if (value === "000000") {
      const next = wrongs + 1;
      setWrongs(next);
      setCode("");
      return setPhase(next >= 3 ? "locked" : "wrong");
    }
    onDone();
  };
  const change = (next: string) => {
    setCode(next);
    if (phase === "wrong") setPhase("idle");
    if (next.length === 6) void check(next);
  };
  const resend = () => {
    restartAgain();
    restartExpiry();
    setWrongs(0);
    setCode("");
    setPhase("idle");
    setResent(true);
    announce("새 인증 코드를 보냈습니다.");
  };
  const message = phase === "wrong" ? `인증 코드가 맞지 않습니다. 남은 시도는 ${3 - wrongs}번입니다.` : phase === "locked" ? "시도 횟수를 넘었습니다. 새 코드를 받아주세요." : phase === "expired" ? "코드의 유효 시간이 지났습니다. 새 코드를 받아주세요." : undefined;

  return (
    <Stack gap="lg">
      <Stack gap="xs">
        <Text as="h2" variant="heading">{purpose === "signup" ? "가입을 마쳤습니다" : "인증 코드를 입력해주세요"}</Text>
        <Text as="p" ink="secondary">{purpose === "signup" ? `${email}로 보낸 6자리 인증 코드를 입력하면 이메일 인증이 끝납니다.` : `${email}의 인증 앱에 보이는 6자리 코드를 입력해주세요.`}</Text>
      </Stack>
      <Stack gap="sm">
        <CodeInput value={code} onChange={change} invalid={Boolean(message)} disabled={phase === "checking" || phase === "locked" || phase === "expired"} />
        <LiveRegion politeness="assertive"><Text as="p" variant="caption" ink="error">{message}</Text></LiveRegion>
        <Inline justify="between" gap="sm" wrap>
          <Inline gap="xs">
            {phase === "checking" ? <><Spinner size="inline" label="코드를 확인하는 중" /><Text as="span" variant="caption" ink="tertiary">확인하는 중</Text></> : null}
            {phase !== "checking" ? <Text as="span" variant="caption" ink="tertiary" numeric>{expires > 0 ? `${minutesAndSeconds(expires)} 동안 유효합니다` : "코드가 만료되었습니다"}</Text> : null}
          </Inline>
          <Button size="sm" variant="ghost" disabled={again > 0} onClick={resend}>{again > 0 ? `코드 다시 받기 (${again}초)` : "코드 다시 받기"}</Button>
        </Inline>
        {resent ? <Text as="p" variant="caption" ink="success">새 코드를 보냈습니다.</Text> : null}
      </Stack>
      <Button size="lg" fullWidth disabled={code.length !== 6} loading={phase === "checking"} loadingLabel="확인하는 중" onClick={() => check(code)}>확인</Button>
      <Text as="p" variant="label" strong={false} ink="tertiary">데모에서는 000000을 뺀 숫자 여섯 자리를 입력하면 통과합니다.</Text>
    </Stack>
  );
};

// ─── Company sign-in ─────────────────────────────────────────────────────────────────────────────────────────────────

const IDPS = [
  { id: "google", name: "Google Workspace", detail: "회사의 Google 계정으로 로그인합니다." },
  { id: "microsoft", name: "Microsoft Entra ID", detail: "회사의 Microsoft 계정으로 로그인합니다." },
  { id: "okta", name: "Okta", detail: "Okta 대시보드에서 로그인합니다." },
  { id: "saml", name: "SAML 직접 설정", detail: "조직이 설정한 SAML 공급자로 로그인합니다." },
] as const;

const Sso = ({ initialDomain, onDone }: { initialDomain: string; onDone: (outcome: Outcome) => void }) => {
  const [idp, setIdp] = useState<string>("google");
  const [domain, setDomain] = useState(initialDomain);
  const [submitted, setSubmitted] = useState(false);
  const [phase, setPhase] = useState<"idle" | "checking" | "redirecting" | "blocked">("idle");
  const input = useRef<HTMLInputElement>(null);
  const clean = domain.trim().toLowerCase();
  const error = !clean ? "회사 도메인을 입력해주세요." : !/^([a-z0-9-]+\.)+[a-z]{2,}$/.test(clean) ? "도메인 형식을 확인해주세요. 예: arcfield.example" : undefined;
  const name = IDPS.find((entry) => entry.id === idp)?.name ?? "";
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (phase === "checking" || phase === "redirecting") return;
    setSubmitted(true);
    if (error) {
      input.current?.focus();
      return;
    }
    setPhase("checking");
    await wait(800);
    if (clean === "blocked.example") return setPhase("blocked");
    setPhase("redirecting");
    await wait(1600);
    onDone({ how: "sso", who: "name", provider: name });
  };
  if (phase === "redirecting") {
    return (
      <Stack gap="lg" align="center" paddingY="2xl">
        <Spinner size="lg" label="로그인 페이지로 이동하는 중" />
        <Stack gap="xs" align="center">
          <Text as="h2" variant="heading">{name}로 이동하는 중입니다</Text>
          <Text as="p" ink="secondary">{clean}의 로그인 화면으로 넘어갑니다. 잠시만 기다려주세요.</Text>
        </Stack>
      </Stack>
    );
  }
  return (
    <Stack as="form" noValidate gap="lg" onSubmit={submit} aria-label="회사 계정 로그인">
      <Stack gap="xs">
        <Text as="h2" variant="heading">회사 계정으로 계속하기</Text>
        <Text as="p" ink="secondary">조직에서 쓰는 로그인 방식을 고르고 회사 도메인을 입력해주세요.</Text>
      </Stack>
      <Stack gap="sm" role="radiogroup" aria-label="로그인 방식">
        {IDPS.map((entry) => (
          <Grid key={entry.id} as="label" columns="auto minmax(0, 1fr)" columnGap="sm" rowGap="xs" align="center">
            <Radio name="idp" checked={idp === entry.id} onChange={() => setIdp(entry.id)} />
            <Text as="span" strong>{entry.name}</Text>
            <Box />
            <Text as="span" variant="label" strong={false} ink="tertiary">{entry.detail}</Text>
          </Grid>
        ))}
      </Stack>
      <FormField label="회사 도메인" required description="데모에서는 blocked.example만 SSO가 설정되어 있지 않은 도메인입니다." invalid={submitted && Boolean(error)} error={error}>
        <Field ref={input} size="lg" autoComplete="off" placeholder="arcfield.example" value={domain} onChange={(event) => { setDomain(event.target.value); if (phase === "blocked") setPhase("idle"); }} />
      </FormField>
      {phase === "blocked" ? <Notice accent="error" title="이 도메인에는 SSO가 설정되어 있지 않습니다" onDismiss={() => setPhase("idle")}>{clean}의 관리자에게 SSO를 켜 달라고 요청하거나, 이메일과 비밀번호로 로그인해주세요.</Notice> : null}
      <Button type="submit" size="lg" fullWidth loading={phase === "checking"} loadingLabel="확인하는 중">계속</Button>
    </Stack>
  );
};

// ─── A new password ──────────────────────────────────────────────────────────────────────────────────────────────────

const Reset = ({ onDone }: { onDone: (outcome: Outcome) => void }) => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const errors = { password: password.length >= 8 ? undefined : "비밀번호는 8자 이상으로 정해주세요.", confirm: confirm === password ? undefined : "비밀번호가 서로 다릅니다." };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    if (errors.password || errors.confirm || busy) return;
    setBusy(true);
    await wait(900);
    onDone({ how: "reset", who: "name" });
  };
  return (
    <Stack as="form" noValidate gap="lg" onSubmit={submit} aria-label="새 비밀번호">
      <Stack gap="xs">
        <Text as="h2" variant="heading">새 비밀번호 정하기</Text>
        <Text as="p" ink="secondary">메일의 링크로 들어오셨습니다. 앞으로 쓸 비밀번호를 정해주세요.</Text>
      </Stack>
      <FormField label="새 비밀번호" required invalid={submitted && Boolean(errors.password)} error={errors.password}>
        <Field size="lg" type="password" autoComplete="new-password" showPasswordToggle value={password} onChange={(event) => setPassword(event.target.value)} />
      </FormField>
      <StrengthMeter value={password} />
      <FormField label="새 비밀번호 확인" required invalid={submitted && Boolean(errors.confirm)} error={errors.confirm}>
        <Field size="lg" type="password" autoComplete="new-password" value={confirm} onChange={(event) => setConfirm(event.target.value)} />
      </FormField>
      <Button type="submit" size="lg" fullWidth loading={busy} loadingLabel="바꾸는 중">비밀번호 바꾸기</Button>
    </Stack>
  );
};

// ─── Where it ends ───────────────────────────────────────────────────────────────────────────────────────────────────

const Done = ({ outcome, email, onRestart }: { outcome: Outcome; email: string; onRestart: () => void }) => {
  const copy = {
    signin: { title: "로그인했습니다", text: `${outcome.who}님, 다시 만나서 반갑습니다.` },
    signup: { title: "이메일 인증을 마쳤습니다", text: `${email || "새 계정"}으로 시작할 수 있습니다.` },
    sso: { title: "회사 계정으로 로그인했습니다", text: `${outcome.provider ?? "SSO"}로 인증했습니다. ${outcome.who}님, 반갑습니다.` },
    reset: { title: "비밀번호를 바꿨습니다", text: "새 비밀번호로 로그인할 수 있습니다." },
  }[outcome.how];
  // The end of a flow is said once, aloud, as it arrives.
  useEffect(() => {
    announce(copy.title);
  }, [copy.title]);
  return (
    <Stack gap="lg" align="center" paddingY="xl">
      <Surface fill="sunken" radius="full" padding="md"><CheckIcon size="subheading" ink="success" /></Surface>
      <Stack gap="xs" align="center">
        <Text as="h2" variant="heading">{copy.title}</Text>
        <Text as="p" ink="secondary">{copy.text}</Text>
      </Stack>
      <Stack gap="sm" width="full">
        {outcome.how === "reset" ? <Button size="lg" fullWidth onClick={onRestart}>로그인하러 가기</Button> : <Button as={RouterLink} to="/demo/arcfield" size="lg" fullWidth>대시보드로 가기</Button>}
        {outcome.how === "reset" ? null : <Button variant="ghost" fullWidth onClick={onRestart}>처음으로</Button>}
      </Stack>
    </Stack>
  );
};

// ─── Passwords forgotten ─────────────────────────────────────────────────────────────────────────────────────────────

const ForgotPassword = ({ open, onOpenChange, initialEmail, onLink }: { open: boolean; onOpenChange: (open: boolean) => void; initialEmail: string; onLink: () => void }) => {
  const input = useRef<HTMLInputElement>(null);
  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="비밀번호 찾기" description="가입한 이메일로 비밀번호를 새로 정할 수 있는 링크를 보냅니다." initialFocusRef={input}>
      <ForgotBody input={input} initialEmail={initialEmail} onLink={() => { onOpenChange(false); onLink(); }} />
    </Dialog>
  );
};

const ForgotBody = ({ input, initialEmail, onLink }: { input: RefObject<HTMLInputElement | null>; initialEmail: string; onLink: () => void }) => {
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
    announce(`${email}로 재설정 메일을 보냈습니다.`);
  };
  if (phase === "sent") {
    return (
      <Stack gap="lg">
        <Text as="h3" variant="subheading">메일을 보냈습니다</Text>
        <Text as="p" ink="secondary">{email}로 재설정 링크를 보냈습니다. 몇 분이 지나도 메일이 없다면 스팸함을 확인해주세요.</Text>
        <DialogFooter>
          <Button variant="hairline" onClick={onLink}>메일의 링크 열기 (데모)</Button>
          <Button as={Floating.Close}>확인</Button>
        </DialogFooter>
      </Stack>
    );
  }
  return (
    <Stack as="form" noValidate onSubmit={submit} gap="lg">
      <FormField label="이메일" required invalid={Boolean(error)} error={error}>
        <Field ref={input} type="email" autoComplete="email" placeholder="name@studiobaeks.com" value={email} onChange={(event) => setEmail(event.target.value)} />
      </FormField>
      <DialogFooter>
        <Button as={Floating.Close} variant="ghost">취소</Button>
        <Button type="submit" loading={phase === "sending"} loadingLabel="메일을 보내는 중">재설정 메일 보내기</Button>
      </DialogFooter>
    </Stack>
  );
};

// ─── The screen ──────────────────────────────────────────────────────────────────────────────────────────────────────

// The addresses that stand for the cases, as a quiet list: on the pitch where there is room, under the form where there is not.
const DemoAccounts = () => (
  <Stack as="section" aria-label="데모 계정" gap="sm">
    <Text as="span" variant="label" strong={false} ink="tertiary">데모 계정 · 입력한 비밀번호는 저장되지 않습니다</Text>
    <Stack as="ul" gap="xs">
      {DEMO_ACCOUNTS.map(([account, what]) => (
        <Inline as="li" key={account} gap="sm" wrap>
          <Text as="span" variant="caption" family={account.includes("@") ? "mono" : undefined} ink="secondary">{account}</Text>
          <Text as="span" variant="caption" ink="tertiary">{what}</Text>
        </Inline>
      ))}
    </Stack>
  </Stack>
);

export const LoginScreen = () => {
  const wide = useWide();
  const [step, setStep] = useParam("step", "signin", STEPS);
  const [email, setEmail] = useState("");
  const [forgot, setForgot] = useState(false);
  const [purpose, setPurpose] = useState<"signin" | "signup">("signin");
  const [domain, setDomain] = useState("");
  const [outcome, setOutcome] = useState<Outcome>({ how: "signin", who: "name" });
  const here = step as Step;
  const finish = (next: Outcome) => { setOutcome(next); setStep("done"); };
  const restart = () => { setStep("signin"); };

  return (
    <Grid rows="auto minmax(0, 1fr)" gap="lg" minHeight="viewport" padding="lg">
      <ScreenBar />
      <Grid {...MAIN} columns={{ base: "minmax(0, 1fr)", md: "minmax(0, 1fr) minmax(0, 35rem)" }} gap="lg">
        <Stack justify="between" gap="xl" padding="xl">
          <Text as="p" variant="subheading">Studio Baeks</Text>
          <Stack gap="lg" maxWidth="measure.md">
            <Text as="h1" variant="hero">다시 <Marker>이어서</Marker>{" "}<Box as="br" />만들어 볼까요?</Text>
            <Text as="p" ink="secondary">Studio Baeks의 도구를 한 계정으로 씁니다.</Text>
          </Stack>
          {wide ? <DemoAccounts /> : <Box />}
        </Stack>
        <Surface as={Grid} fill="raised" radius="lg" shadow justifyItems="center" align="center" padding="xl">
          <Stack gap="xl" width="full" maxWidth="xl">
            {here === "signin" || here === "signup" ? (
              <>
                {/* No tabs over the form: signing in is what the screen is for, and the way to the other form is a line under it. */}
                {here === "signin" ? (
                  <SignIn email={email} onEmail={setEmail} onForgot={() => setForgot(true)} onVerify={() => { setPurpose("signin"); setStep("verify"); }} onSso={(next) => { setDomain(next ?? ""); setStep("sso"); }} onDone={finish} />
                ) : (
                  <SignUp email={email} onEmail={setEmail} onSignIn={() => setStep("signin")} onDone={() => { setPurpose("signup"); setStep("verify"); }} />
                )}
                <Stack gap="sm">
                  <Text as="p" variant="caption" ink="secondary">
                    {here === "signin" ? "계정이 없으신가요? " : "이미 계정이 있으신가요? "}
                    <Link as="button" type="button" underline="hover" onClick={() => setStep(here === "signin" ? "signup" : "signin")}>{here === "signin" ? "회원가입하기" : "로그인하기"}</Link>
                  </Text>
                  <Text as="p" variant="label" strong={false} ink="tertiary">계속하면 이용약관과 개인정보 처리방침에 동의하게 됩니다.</Text>
                </Stack>
                {wide ? null : <DemoAccounts />}
              </>
            ) : (
              <>
                {here === "done" ? null : <Inline><Button size="sm" variant="ghost" onClick={restart}><ArrowLeftIcon />로그인으로 돌아가기</Button></Inline>}
                {here === "verify" ? <Verify email={email || "name@paper.ui"} purpose={purpose} onDone={() => finish({ how: purpose === "signup" ? "signup" : "signin", who: (email || "name@paper.ui").split("@")[0]! })} /> : null}
                {here === "sso" ? <Sso initialDomain={domain} onDone={finish} /> : null}
                {here === "reset" ? <Reset onDone={finish} /> : null}
                {here === "done" ? <Done outcome={outcome} email={email} onRestart={restart} /> : null}
              </>
            )}
          </Stack>
        </Surface>
      </Grid>
      <ForgotPassword open={forgot} onOpenChange={setForgot} initialEmail={email} onLink={() => setStep("reset")} />
    </Grid>
  );
};
