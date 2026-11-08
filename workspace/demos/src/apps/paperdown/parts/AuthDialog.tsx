// The sign-in window (Account.tsx's `account-modal`): the name of the app, what signing in is for, a login / register switch,
// the two fields and the button. The account is a stand-in: any user name of the right shape signs in, and the password field
// is never read, held in state or stored.

import { useEffect, useRef, useState, type FormEvent } from "react";

import { Button, Field, Floating, FormField, IconButton, Inline, Stack, Surface, Text } from "@studio-baeks/paper-ui";

import { Glyph, Tabs } from "../../../kit";
import { Serif, Wordmark } from "../content/Serif";
import { useMedia } from "../lib/hooks";
import { useStore } from "../lib/store";

const NAME = /^[a-zA-Z0-9][a-zA-Z0-9_.-]{2,31}$/;

export const AuthDialog = () => {
  const { auth, closeAuth, setRegister, signIn } = useStore();
  const [error, setError] = useState("");
  const [working, setWorking] = useState(false);
  const first = useRef<HTMLInputElement>(null);
  const phone = useMedia("(max-width: 520px)");

  useEffect(() => {
    if (!auth.open) {
      setError("");
      setWorking(false);
    }
  }, [auth.open]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const username = String(new FormData(event.currentTarget).get("username") ?? "").trim();
    if (!NAME.test(username)) {
      setError("아이디는 영문·숫자 3~32자로 입력해주세요.");
      return;
    }
    setError("");
    setWorking(true);
    window.setTimeout(() => signIn(username), 450);
  };

  return (
    <Floating open={auth.open} onOpenChange={(open) => !open && !working && closeAuth()}>
      <Floating.Content
        as={Surface}
        fill="raised"
        radius="md"
        padding="2xl"
        width={phone ? "xl" : "measure.xs"}
        maxWidth="full"
        presentation="modal"
        aria-label={auth.register ? "회원가입" : "로그인"}
        initialFocusRef={first}
      >
        <Stack gap="xl">
          <Inline justify="between" align="start" gap="md">
            <Wordmark />
            <IconButton as={Floating.Close} size="xs" variant="ghost" aria-label="로그인 창 닫기">
              <Glyph name="x" />
            </IconButton>
          </Inline>
          <Stack gap="sm">
            <Serif as="h1" variant="title" strong={false}>{auth.register ? "글이 머무를 계정을 만드세요" : "당신의 글을 이어가세요"}</Serif>
            <Text as="p" variant="caption" ink="secondary">여러 노트를 모아두고, 어느 기기에서든 이어 쓰세요.</Text>
          </Stack>
          <Tabs
            label="로그인 방식"
            look="underline"
            items={[{ id: "login", label: "로그인" }, { id: "register", label: "회원가입" }]}
            value={auth.register ? "register" : "login"}
            onChange={(id) => {
              setRegister(id === "register");
              setError("");
            }}
          />
          <Stack as="form" gap="lg" onSubmit={submit} noValidate>
            <FormField label="아이디">
              <Field ref={first} name="username" size="md" autoComplete="username" placeholder="영문·숫자 3~32자" maxLength={32} />
            </FormField>
            <FormField label="비밀번호">
              <Field type="password" size="md" autoComplete="off" placeholder="10자 이상" />
            </FormField>
            {error ? <Text as="p" variant="caption" ink="error" role="alert">{error}</Text> : null}
            <Button type="submit" size="md" fullWidth loading={working} loadingLabel="잠시만 기다려주세요…">
              {working ? "잠시만 기다려주세요…" : auth.register ? "계정 만들기" : "로그인"}
            </Button>
          </Stack>
          <Stack align="center">
            <Text as="p" variant="label" strong={false} ink="secondary">현재 브라우저의 문서는 그대로 보관됩니다.</Text>
          </Stack>
        </Stack>
      </Floating.Content>
    </Floating>
  );
};
