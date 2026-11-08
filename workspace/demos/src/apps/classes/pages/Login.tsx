// 로그인 — an ID and a password, nothing else. Accounts are made by the administrator; the school's Google account is not
// a way to sign in but a step after it (the next screen), so there is no "구글로 로그인" here.
//
// The sign-in is mocked: any ID and password go in after a short wait, and the password is kept nowhere. Two IDs are
// special so every state can be seen — `legacy` is an old account with no school Google account linked yet (the Gate then
// stops it at 학교 계정 연결), `wrong` is refused.
//
// For screenshots: ?as=jiwoo fills the ID, ?as=jiwoo&go=1 signs in on arrival, ?state=loading|failed|invalid holds the form
// in that state.

import { useCallback, useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { Link as RouterLink, useNavigate, useSearchParams } from "react-router-dom";

import { Button, Field, FormField, Inline, Stack, Surface, Text, announce } from "@studio-baeks/paper-ui";

import { Glyph, useFace } from "../../../kit";
import { path, useClasses } from "../state";
import { Eyebrow, Notice } from "../ui/parts";
import { carried } from "./auth/carry";
import { Frame } from "./auth/Frame";

type Phase = "idle" | "loading" | "failed";

const DEMO_IDS = ["jiwoo", "legacy", "wrong"] as const;
const WAIT = 800;

// Safari ends a Korean syllable with an Enter that still counts as a keypress: it must not submit the form.
const holdWhileComposing = (event: KeyboardEvent<HTMLInputElement>) => {
  if (event.key === "Enter" && (event.nativeEvent.isComposing || event.keyCode === 229)) event.preventDefault();
};

export const LoginPage = () => {
  const { signIn } = useClasses();
  const navigate = useNavigate();
  const face = useFace();
  const [params] = useSearchParams();
  const forced = params.get("state");
  const preset = params.get("as") ?? (forced === "failed" ? "wrong" : forced === "loading" ? "jiwoo" : "");
  const [username, setUsername] = useState(preset);
  const [password, setPassword] = useState(forced === "failed" || forced === "loading" ? "demo" : "");
  const [submitted, setSubmitted] = useState(forced === "invalid");
  const [phase, setPhase] = useState<Phase>(forced === "loading" ? "loading" : forced === "failed" ? "failed" : "idle");
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const enter = useCallback((name: string) => {
    signIn(name);
    navigate(path() + carried(params), { replace: true });
  }, [signIn, navigate, params]);

  // ?as=…&go=1 signs in as soon as the screen opens.
  const auto = params.get("go") === "1" && preset !== "";
  const arrived = useRef(false);
  useEffect(() => {
    if (!auto || arrived.current) return;
    arrived.current = true;
    enter(preset);
  }, [auto, preset, enter]);

  // Without a preset or a forced state the cursor starts in the first field.
  const startHere = !forced && !preset;
  useEffect(() => {
    if (startHere) usernameRef.current?.focus();
  }, [startHere]);

  const errors = {
    username: username.trim() ? undefined : "아이디를 입력해주세요.",
    password: password ? undefined : "비밀번호를 입력해주세요.",
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (phase === "loading") return;
    setSubmitted(true);
    setPhase("idle");
    if (errors.username || errors.password) {
      (errors.username ? usernameRef : passwordRef).current?.focus();
      announce("입력을 확인해주세요.", { politeness: "assertive" });
      return;
    }
    const name = username.trim();
    setPhase("loading");
    timer.current = window.setTimeout(() => {
      if (name === "wrong") {
        setPhase("failed");
        announce("아이디 또는 비밀번호가 틀렸습니다.", { politeness: "assertive" });
        return;
      }
      enter(name);
    }, WAIT);
  };

  return (
    <Frame end={<Button as={RouterLink} to={path("/welcome")} variant="ghost" size="sm"><Glyph name="arrow-left" />소개 화면</Button>}>
      <Stack gap="xl" paddingY="3xl">
        <Surface as="section" {...face} radius="lg" padding="xl" aria-label="로그인">
          <Stack gap="xl">
            <Stack gap="xs">
              <Text as="h1" variant="title">로그인</Text>
              <Text ink="secondary">Class Explorer는 학교 구성원만 쓸 수 있습니다. 계정은 관리자가 만들어 줍니다.</Text>
            </Stack>

            {phase === "failed" ? <Notice tone="error" glyph="triangle-alert">아이디 또는 비밀번호가 틀렸습니다.</Notice> : null}

            <Stack as="form" noValidate onSubmit={submit} aria-label="로그인 정보" gap="lg">
              <FormField label="아이디" required invalid={submitted && Boolean(errors.username)} error={errors.username}>
                <Field
                  ref={usernameRef}
                  size="lg"
                  name="username"
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  onKeyDown={holdWhileComposing}
                />
              </FormField>
              <FormField label="비밀번호" required invalid={submitted && Boolean(errors.password)} error={errors.password}>
                <Field
                  ref={passwordRef}
                  size="lg"
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  showPasswordToggle
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </FormField>
              <Button type="submit" size="lg" fullWidth loading={phase === "loading"} loadingLabel="로그인하는 중">로그인</Button>
            </Stack>

            <Surface fill="sunken" radius="md" padding="md">
              <Stack gap="sm">
                <Inline gap="sm" align="center">
                  <Glyph name="info" ink="tertiary" />
                  <Text as="span" variant="label" ink="secondary">시연 안내</Text>
                </Inline>
                <Text variant="caption" ink="secondary">
                  시연 화면이라 어떤 아이디와 비밀번호로도 들어가고, 비밀번호는 어디에도 저장하지 않습니다. 아이디가 legacy면 학교 구글 계정이 아직 연결되지 않은 옛 계정으로, wrong이면 로그인에 실패한 것으로 다룹니다.
                </Text>
                <Inline gap="xs" wrap>
                  <Eyebrow>아이디 채우기</Eyebrow>
                  {DEMO_IDS.map((name) => (
                    <Button
                      key={name}
                      size="xs"
                      variant="hairline"
                      onClick={() => {
                        setUsername(name);
                        setPassword("demo");
                        setPhase("idle");
                      }}
                    >
                      {name}
                    </Button>
                  ))}
                </Inline>
              </Stack>
            </Surface>
          </Stack>
        </Surface>

        <Stack gap="sm">
          <Text variant="caption" ink="tertiary">처음 들어오시면 학교 구글 계정으로 학번을 한 번 확인합니다. 구글 계정은 로그인이 아니라 이 확인에만 씁니다.</Text>
          <Inline>
            <Button as={RouterLink} to={path("/privacy")} variant="ghost" size="sm"><Glyph name="shield-check" />개인정보처리방침</Button>
          </Inline>
        </Stack>
      </Stack>
    </Frame>
  );
};
