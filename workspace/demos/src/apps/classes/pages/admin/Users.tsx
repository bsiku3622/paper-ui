import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { Badge, Button, Field, FormField, Grid, IconButton, Inline, Stack, Surface, Switch, Text } from "@studio-baeks/paper-ui";

import { Glyph, Segmented, useToast } from "../../../../kit";
import type { Account } from "../../data/admin";
import { particleRo } from "../../lib/utils";
import { ROLE_RANK, useClasses, type Role } from "../../state";
import { Card, Dialog, Eyebrow, Hint } from "../../ui/parts";
import { dayLabel, Mono, nextId, stamp, StatusDot } from "./parts";
import { useAdmin } from "./store";

const ROLES: readonly Role[] = ["user", "manager", "admin"];
const ROLE_LABEL: Record<Role, string> = { user: "일반", manager: "매니저", admin: "관리자" };
const WEAK = ["12345", "123456", "1234567", "12345678", "password", "qwerty", "111111", "000000", "1234", "abc123", "pass"];

const nameIssue = (name: string, accounts: readonly Account[]) => {
  if (!name) return null;
  if (/[가-힣ㄱ-ㅎㅏ-ㅣ]/.test(name)) return "한글은 username으로 사용할 수 없습니다.";
  if (/\s/.test(name)) return "공백은 쓸 수 없습니다.";
  if (name.length < 2 || name.length > 32) return "username은 2자에서 32자 사이로 정합니다.";
  if (accounts.some((account) => account.username.toLowerCase() === name.toLowerCase())) return "이미 사용 중인 username입니다.";
  return null;
};
const passwordIssue = (password: string) => {
  if (!password) return null;
  if (password.length < 5) return "비밀번호는 5자 이상이어야 합니다.";
  if (new Set(password).size === 1) return "너무 단순한 비밀번호입니다. 같은 문자를 반복했습니다.";
  if (WEAK.includes(password.toLowerCase())) return "너무 단순한 비밀번호입니다.";
  return null;
};

const CreateDialog = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const { me, clock } = useClasses();
  const { accounts, setAccounts } = useAdmin();
  const toast = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("user");
  const [demo, setDemo] = useState(false);

  const name = username.trim();
  const problemName = nameIssue(name, accounts);
  const problemPassword = passwordIssue(password);
  const ready = name !== "" && password !== "" && !problemName && !problemPassword;
  const who = `${me.stuId} ${me.name}`;

  const close = () => {
    setUsername("");
    setPassword("");
    setRole("user");
    setDemo(false);
    onClose();
  };
  const submit = () => {
    if (!ready) return;
    setAccounts((list) => [...list, { id: nextId(list), username: name, role, demoStuId: demo ? me.stuId : null, createdAt: stamp(clock) }]);
    toast(`${name} 계정을 만들었습니다`);
    close();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) close();
      }}
      title="계정 만들기"
      description="이름과 권한만 저장합니다. 비밀번호는 확인한 뒤 어디에도 남기지 않습니다."
      size="measure.xs"
      footer={
        <>
          <Button variant="hairline" onClick={close}>취소</Button>
          <Button variant="solid" type="submit" form="admin-create-user" disabled={!ready}>만들기</Button>
        </>
      }
    >
      <Stack
        as="form"
        id="admin-create-user"
        gap="md"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <FormField label="username" description="영문 소문자, 숫자, 하이픈을 씁니다." invalid={problemName !== null} error={problemName}>
          <Field value={username} placeholder="예: sample-guest" autoComplete="off" autoCapitalize="none" spellCheck={false} onChange={(event) => setUsername(event.target.value)} />
        </FormField>
        <FormField label="비밀번호" description="5자 이상으로, 쉬운 비밀번호는 받지 않습니다." invalid={problemPassword !== null} error={problemPassword}>
          <Field type="password" showPasswordToggle value={password} autoComplete="new-password" onChange={(event) => setPassword(event.target.value)} />
        </FormField>
        <Stack gap="xs">
          <Eyebrow>권한</Eyebrow>
          <Segmented label="새 계정의 권한" value={role} onChange={(id) => setRole(id as Role)} options={ROLES.map((id) => ({ id, label: ROLE_LABEL[id] }))} />
        </Stack>
        <Stack gap="xs">
          <Inline as="label" gap="sm" align="center">
            <Switch checked={demo} onChange={(event) => setDemo(event.target.checked)} />
            <Text as="span" strong>Demo 계정</Text>
          </Inline>
          <Text variant="caption" ink="tertiary">
            {demo ? `구글 연동 없이 바로 들어오고, ${who}${particleRo(who)} 보입니다. 학번은 만드는 사람의 것만 빌릴 수 있습니다.` : "학교 구글 계정이 없는 사람에게 줄 계정이면 켭니다."}
          </Text>
        </Stack>
      </Stack>
    </Dialog>
  );
};

export const UsersPanel = () => {
  const { session, me } = useClasses();
  const { accounts, setAccounts, sessions, setSessions } = useAdmin();
  const toast = useToast();
  const [params] = useSearchParams();
  const [creating, setCreating] = useState(params.get("dialog") === "create");

  const online = useMemo(() => new Set(sessions.map((item) => item.accountId)), [sessions]);
  const rows = useMemo(() => [...accounts].sort((a, b) => ROLE_RANK[b.role] - ROLE_RANK[a.role] || a.username.localeCompare(b.username)), [accounts]);
  const who = `${me.stuId} ${me.name}`;

  const setRole = (account: Account, role: Role) => {
    if (role === account.role) return;
    setAccounts((list) => list.map((item) => (item.id === account.id ? { ...item, role } : item)));
    toast(`${account.username}의 권한을 ${ROLE_LABEL[role]}${particleRo(ROLE_LABEL[role])} 바꿨습니다`);
  };
  const remove = (account: Account) => {
    const accountsBefore = accounts;
    const sessionsBefore = sessions;
    setAccounts((list) => list.filter((item) => item.id !== account.id));
    setSessions((list) => list.filter((item) => item.accountId !== account.id));
    toast(`${account.username} 계정을 지웠습니다`, {
      action: {
        label: "되돌리기",
        onSelect: () => {
          setAccounts(accountsBefore);
          setSessions(sessionsBefore);
        },
      },
    });
  };

  return (
    <Card
      title="계정"
      description={`${accounts.length}개 계정 · 지금 로그인해 둔 계정 ${accounts.filter((item) => online.has(item.id)).length}개`}
      padding="lg"
      actions={<Button variant="solid" size="sm" onClick={() => setCreating(true)}><Glyph name="user-plus" />계정 만들기</Button>}
    >
      <Stack as="ul" aria-label="계정 목록">
        {rows.map((account) => {
          const mine = account.username === session.username;
          return (
            <Surface as="li" key={account.id} border="top" paddingY="md">
              <Grid columns={{ base: 1, md: "minmax(0, 1fr) auto" }} gap="md" align="center">
                <Stack gap="xs" minWidth={0}>
                  <Inline gap="sm" align="center" wrap>
                    <Mono strong>{account.username}</Mono>
                    {mine ? <Badge size="xs" variant="soft">나</Badge> : null}
                    {account.demoStuId ? <Badge size="xs" variant="soft"><Glyph name="flask-conical" />Demo</Badge> : null}
                    <StatusDot on={online.has(account.id)} onLabel="접속 중" offLabel="오프라인" />
                  </Inline>
                  <Text as="span" variant="caption" ink="tertiary">
                    {account.demoStuId ? `${who}${particleRo(who)} 보이는 시연 계정 · ` : ""}{dayLabel(account.createdAt)} 가입
                  </Text>
                </Stack>
                <Inline gap="md" align="center" wrap>
                  {mine ? (
                    <Text as="span" variant="caption" ink="tertiary">내 계정은 권한을 바꾸거나 지울 수 없습니다</Text>
                  ) : (
                    <>
                      <Segmented label={`${account.username}의 권한`} size="xs" value={account.role} onChange={(id) => setRole(account, id as Role)} options={ROLES.map((id) => ({ id, label: ROLE_LABEL[id] }))} />
                      <IconButton variant="ghost" size="sm" aria-label={`${account.username} 계정 삭제`} onClick={() => remove(account)}><Glyph name="trash-2" /></IconButton>
                    </>
                  )}
                </Inline>
              </Grid>
            </Surface>
          );
        })}
      </Stack>
      <Hint>위 단계는 아래 단계가 하는 일을 모두 합니다. 매니저는 학사일정을 올리고 제안을 처리하며, 관리자는 이 화면의 모든 일을 합니다.</Hint>
      <CreateDialog open={creating} onClose={() => setCreating(false)} />
    </Card>
  );
};
