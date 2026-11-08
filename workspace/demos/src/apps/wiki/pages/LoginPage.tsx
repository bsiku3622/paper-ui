// LoginPage.tsx — a demo login: any name gets in. The password box is only for show; nothing reads it and nothing stores it.

import { useState, type FormEvent } from "react";
import { Link as RouterLink, useNavigate, useSearchParams } from "react-router-dom";

import { Button, Checkbox, Field, FormField, Inline, Stack, Text } from "@studio-baeks/paper-ui";

import { useToast } from "../../../kit";
import { homePath, userPath } from "../lib/paths";
import { Callout } from "../parts/Callout";
import { Page } from "../parts/Page";
import { useWiki } from "../state/store";

export const LoginPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { loggedIn, user, login, logout } = useWiki();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [tried, setTried] = useState(false);
  const next = params.get("next");
  const problem = name.trim() === "" ? "사용자 이름을 입력해 주세요." : name.trim().length > 20 ? "이름은 20자까지 쓸 수 있습니다." : null;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setTried(true);
    if (problem || busy) return;
    setBusy(true);
    window.setTimeout(() => {
      login(name);
      setBusy(false);
      toast(`${name.trim()}님, 환영합니다`);
      navigate(next && next.startsWith("/wiki") ? next : homePath());
    }, 500);
  };

  return (
    <Page title="로그인" description="로그인하면 편집 기록과 토론에 내 이름이 남습니다.">
      <Stack gap="lg" maxWidth="measure.xs">
        <Callout glyph="info">
          <Text as="p" variant="body">데모라서 아무 이름이나 입력하면 들어갈 수 있습니다. 비밀번호 칸은 모양만 있고, 입력한 값은 읽지도 저장하지도 않습니다.</Text>
        </Callout>

        {loggedIn ? (
          <Stack gap="md">
            <Text as="p" variant="lead">지금 <Text as="span" variant="lead" ink="inherit" strong>{user}</Text>님으로 로그인되어 있습니다.</Text>
            <Inline gap="sm">
              <Button as={RouterLink} to={userPath(user)} variant="hairline">내 사용자 문서</Button>
              <Button
                variant="ghost"
                onClick={() => {
                  logout();
                  toast("로그아웃했습니다");
                }}
              >
                로그아웃
              </Button>
            </Inline>
          </Stack>
        ) : (
          <Stack as="form" gap="lg" onSubmit={submit} noValidate>
            <FormField label="사용자 이름" required invalid={tried && problem !== null} error={tried ? problem : undefined}>
              <Field autoComplete="off" placeholder="예: 돌담지기" value={name} onChange={(event) => setName(event.currentTarget.value)} maxLength={30} />
            </FormField>
            <FormField label="비밀번호" description="데모에서는 비워 두어도 됩니다.">
              <Field type="password" autoComplete="off" showPasswordToggle />
            </FormField>
            <Inline as="label" gap="sm">
              <Checkbox defaultChecked />
              <Text as="span" variant="body">이 기기에서 로그인 상태 유지</Text>
            </Inline>
            <Inline gap="sm">
              <Button type="submit" variant="solid" loading={busy} loadingLabel="로그인하는 중">로그인</Button>
              <Button as={RouterLink} to={next && next.startsWith("/wiki") ? next : homePath()} variant="ghost">나중에 하기</Button>
            </Inline>
          </Stack>
        )}
      </Stack>
    </Page>
  );
};
