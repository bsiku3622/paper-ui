// 학교 구글 계정 연결 — the step an account without a linked school Google account is stopped at, instead of the app. The
// Gate in App.tsx draws this screen wherever the visitor stood, and nothing else, until it is done or they sign out.
//
// Google is not a way to sign in here. It confirms one thing, the student ID: the school's account address is the ID, so the
// app asks Google only for the address, never a name or a photo. Linking turns an old account (one that signed in by ID and
// password alone) into one that knows whose it is.
//
// The step is mocked. "확인하기" waits a moment, then either finds the school account (the demo account, 한지우) or fails —
// the 시연 switch under the card picks which. A found account is shown for a few seconds and then the account is linked, as
// the original does the moment Google answers; "계속하기" does not wait. For screenshots: ?google=checking|found|failed holds
// the step in that state (and holds it: nothing moves on by itself).

import { useEffect, useRef, useState } from "react";
import { Link as RouterLink, useNavigate, useSearchParams } from "react-router-dom";

import { Badge, Button, Divider, Inline, Spinner, Stack, Surface, Text, announce } from "@studio-baeks/paper-ui";

import { Avatar, Glyph, Segmented, useFace, useToast } from "../../../kit";
import { ME_EMAIL } from "../data/people";
import { path, useClasses } from "../state";
import { Eyebrow, Notice } from "../ui/parts";
import { Frame } from "./auth/Frame";

type Phase = "idle" | "checking" | "found" | "failed";

// How long Google "takes", and how long the account found stays on the screen before the link is made.
const WAIT = 1200;
const SHOWN = 2400;

// Three things the visitor should know before they press the button.
const PROMISES = [
  { glyph: "shield-check", text: "구글 계정은 로그인에 쓰지 않습니다. 학번을 확인하는 데에만 씁니다." },
  { glyph: "mail", text: "학교 계정의 이메일 주소만 받습니다. 이름이나 사진은 받지 않습니다." },
  { glyph: "lock", text: "연결하기 전에는 이수 기록 같은 개인 자료를 다룰 수 없습니다." },
] as const;

export const GoogleLinkPage = () => {
  const { session, me, signOut, linkGoogle } = useClasses();
  const navigate = useNavigate();
  const toast = useToast();
  const face = useFace();
  const [params] = useSearchParams();
  const forced = params.get("google");
  const [phase, setPhase] = useState<Phase>(forced === "checking" || forced === "found" || forced === "failed" ? forced : "idle");
  const [outcome, setOutcome] = useState<"success" | "failure">(forced === "failed" ? "failure" : "success");
  // Whether the account found is about to be linked by itself.
  const [moving, setMoving] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const confirm = () => {
    window.clearTimeout(timer.current);
    linkGoogle();
    toast("학교 계정을 연결했습니다");
    navigate(path(), { replace: true });
  };

  const check = () => {
    window.clearTimeout(timer.current);
    setMoving(false);
    setPhase("checking");
    announce("학교 구글 계정을 확인하는 중입니다.");
    timer.current = window.setTimeout(() => {
      if (outcome === "failure") {
        setPhase("failed");
        announce("학교 계정을 확인하지 못했습니다.", { politeness: "assertive" });
        return;
      }
      setPhase("found");
      setMoving(true);
      announce(`${me.name}님의 학번 ${me.stuId}을 확인했습니다.`);
      timer.current = window.setTimeout(confirm, SHOWN);
    }, WAIT);
  };

  const leave = () => {
    signOut();
    navigate(path("/welcome"));
  };

  return (
    <Frame end={<Button as={RouterLink} to={path("/privacy")} variant="ghost" size="sm"><Glyph name="shield-check" />개인정보처리방침</Button>}>
      <Stack gap="xl" paddingY="3xl">
        <Surface as="section" {...face} radius="lg" padding="xl" aria-label="학교 구글 계정 연결">
          <Stack gap="xl">
            <Stack gap="xs">
              <Eyebrow>계정 연결 · 2 / 3단계</Eyebrow>
              <Text as="h1" variant="title">학교 구글 계정으로 학번을 확인합니다</Text>
              <Text ink="secondary">
                {session.username} 계정은 아직 학교 구글 계정과 이어져 있지 않습니다. 한 번 연결하면 학번이 확인되고, 그동안 기록한 내용은 그대로 남습니다.
              </Text>
            </Stack>

            <Stack as="ul" gap="sm">
              {PROMISES.map((item) => (
                <Inline as="li" key={item.glyph} gap="sm" align="start">
                  <Glyph name={item.glyph} ink="tertiary" />
                  <Text as="span" ink="secondary">{item.text}</Text>
                </Inline>
              ))}
            </Stack>

            {phase === "checking" ? (
              <Surface fill="sunken" radius="md" padding="lg">
                <Inline gap="md" align="center">
                  <Spinner size="md" label="학교 구글 계정을 확인하는 중" />
                  <Stack gap="xs" minWidth={0}>
                    <Text as="span">학교 구글 계정을 확인하는 중입니다</Text>
                    <Text as="span" variant="caption" ink="tertiary">구글 화면에서 학교 계정을 고르면 학번이 확인됩니다.</Text>
                  </Stack>
                </Inline>
              </Surface>
            ) : null}

            {phase === "found" ? (
              <Stack gap="md">
                <Surface fill="sunken" radius="md" padding="lg">
                  <Stack gap="md">
                    <Inline gap="md" align="center">
                      <Avatar name={me.name} size="lg" />
                      <Stack minWidth={0}>
                        <Text as="span" strong>{me.name}</Text>
                        <Text as="span" variant="caption" ink="tertiary" truncate>{ME_EMAIL}</Text>
                      </Stack>
                    </Inline>
                    <Divider />
                    <Inline justify="between" align="center" gap="md" wrap>
                      <Text as="span" ink="secondary">확인한 학번</Text>
                      <Inline gap="sm" align="center">
                        <Badge variant="soft" accent="success" size="sm">확인됨</Badge>
                        <Text as="span" strong numeric>{me.stuId}</Text>
                      </Inline>
                    </Inline>
                  </Stack>
                </Surface>
                <Button size="lg" fullWidth onClick={confirm}>계속하기<Glyph name="arrow-right" /></Button>
                {moving ? <Text as="p" variant="caption" ink="tertiary">잠시 뒤 자동으로 연결하고 시작합니다.</Text> : null}
              </Stack>
            ) : null}

            {phase === "failed" ? (
              <Stack gap="md">
                <Notice tone="error" glyph="triangle-alert">학교 계정을 확인하지 못했습니다. 학교 계정(@students.example.kr)으로 다시 시도해주세요.</Notice>
                <Button size="lg" fullWidth onClick={check}>다시 시도</Button>
              </Stack>
            ) : null}

            {phase === "idle" ? (
              <Button size="lg" fullWidth onClick={check}><Glyph name="id-card" />학교 구글 계정으로 확인하기</Button>
            ) : null}

            <Stack gap="md">
              <Divider />
              <Inline justify="between" align="center" gap="md" wrap>
                <Text as="span" variant="caption" ink="tertiary">연결하기 전에는 이용할 수 없습니다.</Text>
                <Button variant="ghost" size="sm" onClick={leave}><Glyph name="log-out" />로그아웃</Button>
              </Inline>
            </Stack>
          </Stack>
        </Surface>

        <Stack gap="xs">
          <Eyebrow>시연 — 구글 확인 결과를 고릅니다</Eyebrow>
          <Inline>
            <Segmented
              label="구글 확인 결과"
              size="xs"
              value={outcome}
              onChange={(id) => setOutcome(id === "failure" ? "failure" : "success")}
              options={[
                { id: "success", label: "성공" },
                { id: "failure", label: "실패" },
              ]}
            />
          </Inline>
        </Stack>
      </Stack>
    </Frame>
  );
};
