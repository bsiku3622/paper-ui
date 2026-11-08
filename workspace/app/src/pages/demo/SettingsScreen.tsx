// A settings page: the same md controls, many of them, in rows. It is where radius and height meet density.
//
// One centered column of raised cards under the bar, as it has always been. The first three cards (the profile, the notifications, the
// scope) are one form with one save at the end; each card after them is about one thing and has its own buttons. It checks its fields
// when you leave them and again when you save, and answers a save with a line beside the button. Nothing is stored: a password typed
// here is held in its field and is gone with the form.

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";

import { Badge, Box, Button, Checkbox, Divider, Field, Floating, FormField, Grid, Inline, Radio, Select, Stack, Surface, Switch, Text, Textarea, announce } from "@studio-baeks/paper-ui";

import { ArrowLeftIcon, CheckIcon } from "../../compositions/icons";
import { ConfirmDialog, DAY, Dialog, DialogFooter, EMAIL, HOUR, KeyRows, MAIN, MemberRows, Notice, NoticeBar, ScreenBar, StrengthMeter, clock, formatWon, relative, useStore, wait } from "./parts";

// ─── What every form does the same ──────────────────────────────────────────────────────────────────────────────────

// A form's two states: what was saved, and what is on the screen. The difference is what the save button is for.
const useDraft = <T extends object>(initial: T) => {
  const [saved, setSaved] = useState(initial);
  const [draft, setDraft] = useState(initial);
  return {
    draft, saved,
    dirty: JSON.stringify(saved) !== JSON.stringify(draft),
    set: (patch: Partial<T>) => setDraft((previous) => ({ ...previous, ...patch })),
    commit: () => setSaved(draft),
    revert: () => setDraft(saved),
  };
};

// A line that says "saved" for a few seconds.
const useFlash = () => {
  const [stamp, setStamp] = useState<number | null>(null);
  useEffect(() => {
    if (stamp === null) return;
    const timer = window.setTimeout(() => setStamp(null), 6000);
    return () => window.clearTimeout(timer);
  }, [stamp]);
  return [stamp !== null, () => setStamp(Date.now())] as const;
};

const TWO_COLUMNS = "repeat(auto-fit, minmax(min(100%, 16rem), 1fr))";

// ─── 프로필, 알림, 공개 범위 ───────────────────────────────────────────────────────────────────────────────────────────

const NOTIFICATIONS = [
  { id: "deploy", title: "배포가 끝나면 알리기", detail: "성공과 실패를 모두 메일로 받습니다.", on: true },
  { id: "weekly", title: "주간 요약 받기", detail: "월요일 아침에 한 번 보냅니다.", on: true },
  { id: "device", title: "새 기기 로그인 알리기", detail: "처음 보는 기기에서 로그인하면 알립니다.", on: false },
  { id: "firing", title: "모니터링 알림이 발생하면 알리기", detail: "긴급은 바로, 경고는 10분 단위로 묶어서 보냅니다.", on: true },
  { id: "budget", title: "예산에 가까워지면 알리기", detail: "월 예산의 80%와 100%에서 한 번씩 보냅니다.", on: true },
  { id: "due", title: "점검 항목의 기한이 다가오면 알리기", detail: "기한 하루 전에 담당자에게 알립니다.", on: true },
];

const SCOPES = [
  { id: "team", label: "팀 전체에 공개" },
  { id: "invited", label: "초대한 사람만" },
  { id: "me", label: "나만 보기" },
];

const URL_PATTERN = /^(https?:\/\/)?([\w-]+\.)+[a-z]{2,}(\/\S*)?$/i;

type FieldKey = "name" | "email" | "website" | "bio";

const INITIAL = {
  name: "한서윤", email: "name@studiobaeks.com", language: "ko", website: "studiobaeks", bio: "",
  alerts: Object.fromEntries(NOTIFICATIONS.map((item) => [item.id, item.on])) as Record<string, boolean>,
  scope: "team", searchable: true,
};

const ProfileForm = () => {
  const { record } = useStore();
  const form = useDraft(INITIAL);
  const [touched, setTouched] = useState<Partial<Record<FieldKey, boolean>>>({ website: true });
  const [busy, setBusy] = useState(false);
  const [flash, showFlash] = useFlash();
  const name = useRef<HTMLInputElement>(null);
  const email = useRef<HTMLInputElement>(null);
  const website = useRef<HTMLInputElement>(null);
  const bio = useRef<HTMLTextAreaElement>(null);
  const refs = { name, email, website, bio };
  const { draft, saved } = form;
  const errors: Record<FieldKey, string | undefined> = {
    name: draft.name.trim().length >= 2 ? undefined : "이름은 두 글자 이상이어야 합니다.",
    email: EMAIL.test(draft.email.trim()) ? undefined : "이메일 형식을 확인해주세요. 예: name@studiobaeks.com",
    website: !draft.website.trim() || URL_PATTERN.test(draft.website.trim()) ? undefined : "주소 형식이 맞지 않습니다.",
    bio: draft.bio.length <= 160 ? undefined : "소개는 160자 이하로 적어주세요.",
  };
  const shown = (key: FieldKey) => (touched[key] ? errors[key] : undefined);
  const touch = (key: FieldKey) => setTouched((previous) => ({ ...previous, [key]: true }));

  // Which of the three cards the unsaved changes are in, so the save row can say.
  const groups: [string, boolean][] = [
    ["프로필", (["name", "email", "language", "website", "bio"] as const).some((key) => draft[key] !== saved[key])],
    ["알림", JSON.stringify(draft.alerts) !== JSON.stringify(saved.alerts)],
    ["공개 범위", draft.scope !== saved.scope || draft.searchable !== saved.searchable],
  ];
  const changed = groups.filter(([, on]) => on).map(([label]) => label);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;
    setTouched({ name: true, email: true, website: true, bio: true });
    const first = (["name", "email", "website", "bio"] as const).find((key) => errors[key]);
    if (first) {
      refs[first].current?.focus();
      announce("입력을 확인해주세요.", { politeness: "assertive" });
      return;
    }
    setBusy(true);
    await wait(700);
    form.commit();
    setBusy(false);
    showFlash();
    announce("설정을 저장했습니다.");
    record({ code: "settings.update", action: "프로필과 알림 설정을 고쳤습니다", target: draft.name.trim() });
  };

  return (
    <Stack as="form" noValidate gap="xl" onSubmit={submit} aria-label="설정">
      <Stack gap="lg">
        <Surface fill="raised" radius="lg" shadow padding="xl">
          <Stack gap="lg">
            <Text as="h2" variant="subheading">프로필</Text>
            <Grid columns={TWO_COLUMNS} gap="lg">
              <FormField label="이름" invalid={Boolean(shown("name"))} error={shown("name")}>
                <Field ref={name} value={draft.name} onChange={(event) => form.set({ name: event.target.value })} onBlur={() => touch("name")} />
              </FormField>
              <FormField label="이메일" invalid={Boolean(shown("email"))} error={shown("email")}>
                <Field ref={email} type="email" value={draft.email} onChange={(event) => form.set({ email: event.target.value })} onBlur={() => touch("email")} />
              </FormField>
              <FormField label="언어">
                <Select value={draft.language} onChange={(event) => form.set({ language: event.target.value })}>
                  <Select.Option value="ko">한국어</Select.Option>
                  <Select.Option value="en">English</Select.Option>
                </Select>
              </FormField>
              <FormField label="웹사이트" invalid={Boolean(shown("website"))} error={shown("website")}>
                <Field ref={website} value={draft.website} onChange={(event) => form.set({ website: event.target.value })} onBlur={() => touch("website")} />
              </FormField>
            </Grid>
            <FormField label="소개" description={draft.bio ? `${draft.bio.length} / 160` : undefined} invalid={Boolean(shown("bio"))} error={shown("bio")}>
              <Textarea ref={bio} rows={3} placeholder="한두 줄로 소개해 주세요." value={draft.bio} onChange={(event) => form.set({ bio: event.target.value })} onBlur={() => touch("bio")} />
            </FormField>
          </Stack>
        </Surface>
        <Surface fill="raised" radius="lg" shadow padding="xl">
          <Stack gap="sm">
            <Text as="h2" variant="subheading">알림</Text>
            <Stack>
              {NOTIFICATIONS.map((item, index) => (
                <Stack key={item.id}>
                  {index > 0 ? <Divider /> : null}
                  <Inline justify="between" gap="lg" paddingY="md">
                    <Stack>
                      <Text as="span" strong>{item.title}</Text>
                      <Text as="span" variant="label" strong={false} ink="tertiary">{item.detail}</Text>
                    </Stack>
                    <Switch aria-label={item.title} checked={draft.alerts[item.id] ?? false} onChange={(event) => form.set({ alerts: { ...draft.alerts, [item.id]: event.target.checked } })} />
                  </Inline>
                </Stack>
              ))}
            </Stack>
          </Stack>
        </Surface>
        <Surface fill="raised" radius="lg" shadow padding="xl">
          <Stack gap="lg">
            <Text as="h2" variant="subheading">공개 범위</Text>
            <Stack gap="sm" role="radiogroup" aria-label="공개 범위">
              {SCOPES.map((scope) => (
                <Inline key={scope.id} as="label" gap="sm">
                  <Radio name="scope" checked={draft.scope === scope.id} onChange={() => form.set({ scope: scope.id })} />
                  <Text as="span">{scope.label}</Text>
                </Inline>
              ))}
            </Stack>
            <Divider />
            <Inline as="label" gap="sm">
              <Checkbox checked={draft.searchable} onChange={(event) => form.set({ searchable: event.target.checked })} />
              <Text as="span">검색 결과에 프로필 표시</Text>
            </Inline>
          </Stack>
        </Surface>
      </Stack>
      <Inline justify="between" gap="md" wrap>
        <Inline gap="xs" role="status">
          {flash ? <><CheckIcon ink="success" /><Text as="span" ink="success">저장했습니다</Text></> : form.dirty ? <Text as="span" ink="tertiary">저장하지 않은 변경이 있습니다: {changed.join(", ")}</Text> : null}
        </Inline>
        <Inline gap="sm">
          <Button variant="ghost" disabled={!form.dirty || busy} onClick={() => { form.revert(); setTouched({ website: true }); }}>취소</Button>
          <Button type="submit" disabled={!form.dirty} loading={busy} loadingLabel="저장하는 중">저장</Button>
        </Inline>
      </Inline>
    </Stack>
  );
};

// ─── 보안 ────────────────────────────────────────────────────────────────────────────────────────────────────────────

const PasswordForm = () => {
  const { record } = useStore();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [again, setAgain] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [flash, showFlash] = useFlash();
  const currentRef = useRef<HTMLInputElement>(null);
  const nextRef = useRef<HTMLInputElement>(null);
  const againRef = useRef<HTMLInputElement>(null);
  const errors = {
    current: current ? undefined : "현재 비밀번호를 입력해주세요.",
    next: next.length < 10 ? "비밀번호는 10자 이상으로 정해주세요." : !/[A-Za-z]/.test(next) || !/\d/.test(next) ? "영문과 숫자를 함께 써주세요." : next === current ? "현재 비밀번호와 다르게 정해주세요." : undefined,
    again: again === next ? undefined : "새 비밀번호와 서로 달라요.",
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;
    setSubmitted(true);
    const first = errors.current ? currentRef : errors.next ? nextRef : errors.again ? againRef : null;
    if (first) {
      first.current?.focus();
      announce("입력을 확인해주세요.", { politeness: "assertive" });
      return;
    }
    setBusy(true);
    await wait(900);
    setCurrent("");
    setNext("");
    setAgain("");
    setSubmitted(false);
    setBusy(false);
    showFlash();
    announce("비밀번호를 바꿨습니다.");
    record({ code: "password.update", action: "비밀번호를 바꿨습니다", target: "내 계정" });
  };
  return (
    <Stack as="form" noValidate gap="lg" onSubmit={submit} aria-label="비밀번호 변경">
      <Stack gap="xs">
        <Text as="h3" strong>비밀번호</Text>
        <Text as="span" variant="label" strong={false} ink="tertiary">비밀번호는 저장하지 않습니다. 이 화면에서 입력한 값은 보내는 즉시 사라집니다.</Text>
      </Stack>
      <Grid columns={TWO_COLUMNS} gap="lg" align="start">
        <FormField label="현재 비밀번호" invalid={submitted && Boolean(errors.current)} error={errors.current}>
          <Field ref={currentRef} type="password" autoComplete="current-password" showPasswordToggle value={current} onChange={(event) => setCurrent(event.target.value)} />
        </FormField>
        <FormField label="새 비밀번호" description="10자 이상, 영문과 숫자를 함께 씁니다." invalid={submitted && Boolean(errors.next)} error={errors.next}>
          <Field ref={nextRef} type="password" autoComplete="new-password" showPasswordToggle value={next} onChange={(event) => setNext(event.target.value)} />
        </FormField>
        <FormField label="새 비밀번호 확인" invalid={submitted && Boolean(errors.again)} error={errors.again}>
          <Field ref={againRef} type="password" autoComplete="new-password" value={again} onChange={(event) => setAgain(event.target.value)} />
        </FormField>
      </Grid>
      <StrengthMeter value={next} />
      <Inline justify="between" gap="md" wrap>
        <Inline gap="xs" role="status">{flash ? <><CheckIcon ink="success" /><Text as="span" ink="success">비밀번호를 바꿨습니다</Text></> : null}</Inline>
        <Button type="submit" variant="hairline" loading={busy} loadingLabel="바꾸는 중">비밀번호 바꾸기</Button>
      </Inline>
    </Stack>
  );
};

const CodeStep = ({ onDone }: { onDone: () => void }) => {
  const [code, setCode] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const error = /^\d{6}$/.test(code) ? undefined : "숫자 6자리를 입력해주세요.";
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    if (error || busy) return;
    setBusy(true);
    await wait(700);
    onDone();
  };
  return (
    <Stack as="form" noValidate gap="lg" onSubmit={submit}>
      <Text as="p" ink="secondary">인증 앱에 보이는 6자리 숫자를 입력해주세요. 데모에서는 아무 6자리 숫자나 통과합니다.</Text>
      <FormField label="인증 코드" required invalid={submitted && Boolean(error)} error={error}>
        <Field inputMode="numeric" autoComplete="one-time-code" numeric textAlign="center" placeholder="000000" maxLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))} />
      </FormField>
      <DialogFooter>
        <Button as={Floating.Close} variant="ghost">취소</Button>
        <Button type="submit" loading={busy} loadingLabel="확인하는 중">확인</Button>
      </DialogFooter>
    </Stack>
  );
};

type Session = { id: string; device: string; place: string; seen: number; here?: boolean };

const Sessions = () => {
  const { notify, record } = useStore();
  const at = clock();
  const [sessions, setSessions] = useState<readonly Session[]>([
    { id: "mac", device: "MacBook Air · Chrome", place: "서울", seen: at, here: true },
    { id: "phone", device: "iPhone · Safari", place: "서울", seen: at - 3 * HOUR },
    { id: "desk", device: "Windows 데스크탑 · Edge", place: "대전", seen: at - 2 * DAY },
  ]);
  const [asking, setAsking] = useState(false);
  const end = (session: Session) => {
    setSessions((list) => list.filter((entry) => entry.id !== session.id));
    record({ code: "session.end", action: "세션을 종료했습니다", target: session.device });
    notify("success", "세션을 종료했습니다", session.device);
  };
  return (
    <Stack gap="md">
      <Inline justify="between" gap="md" wrap>
        <Stack gap="xs">
          <Text as="h3" strong>로그인된 기기</Text>
          <Text as="span" variant="label" strong={false} ink="tertiary">모르는 기기가 있으면 바로 로그아웃하고 비밀번호를 바꾸세요.</Text>
        </Stack>
        <Button variant="hairline" disabled={sessions.length < 2} onClick={() => setAsking(true)}>다른 모든 기기에서 로그아웃</Button>
      </Inline>
      <Stack as="ul">
        {sessions.map((session, index) => (
          <Box as="li" key={session.id}>
            {index > 0 ? <Divider aria-hidden /> : null}
            <Inline justify="between" gap="md" paddingY="md" wrap>
              <Stack>
                <Inline gap="sm"><Text as="span" strong>{session.device}</Text>{session.here ? <Badge size="sm" variant="soft">이 기기</Badge> : null}</Inline>
                <Text as="span" variant="label" strong={false} ink="tertiary">{session.place} · {session.here ? "지금 사용 중" : relative(session.seen, at)}</Text>
              </Stack>
              {session.here ? null : <Button size="sm" variant="ghost" onClick={() => end(session)}>로그아웃</Button>}
            </Inline>
          </Box>
        ))}
      </Stack>
      <ConfirmDialog open={asking} onOpenChange={setAsking} title="다른 기기에서 모두 로그아웃할까요?" description="이 기기를 뺀 모든 기기의 로그인이 끊어집니다." confirmLabel="로그아웃"
        onConfirm={() => { setSessions((list) => list.filter((entry) => entry.here)); record({ code: "session.end", action: "다른 모든 세션을 종료했습니다", target: "내 계정" }); notify("success", "다른 기기에서 로그아웃했습니다"); }} />
    </Stack>
  );
};

const SecurityCard = () => {
  const { record, notify } = useStore();
  const [twoFactor, setTwoFactor] = useState(true);
  const [mode, setMode] = useState<"on" | "off" | null>(null);
  return (
    <Surface id="security" fill="raised" radius="lg" shadow padding="xl">
      <Stack gap="lg">
        <Text as="h2" variant="subheading">보안</Text>
        <PasswordForm />
        <Divider />
        <Inline justify="between" gap="lg">
          <Stack gap="xs">
            <Text as="h3" strong>2단계 인증</Text>
            <Text as="span" variant="label" strong={false} ink="tertiary">{twoFactor ? "로그인할 때 인증 앱의 코드를 한 번 더 입력합니다." : "지금은 꺼져 있습니다. 켜면 계정이 훨씬 안전해집니다."}</Text>
          </Stack>
          <Switch aria-label="2단계 인증 사용" checked={twoFactor} onChange={(event) => setMode(event.target.checked ? "on" : "off")} />
        </Inline>
        <Divider />
        <Sessions />
      </Stack>
      <Dialog open={mode === "on"} onOpenChange={(open) => { if (!open) setMode(null); }} title="2단계 인증 켜기" description="인증 앱을 연결합니다.">
        <CodeStep onDone={() => { setTwoFactor(true); setMode(null); record({ code: "mfa.enable", action: "2단계 인증을 켰습니다", target: "내 계정" }); notify("success", "2단계 인증을 켰습니다"); }} />
      </Dialog>
      <ConfirmDialog open={mode === "off"} onOpenChange={(open) => { if (!open) setMode(null); }} title="2단계 인증을 끌까요?" description="끄면 비밀번호만으로 로그인할 수 있어 계정이 덜 안전해집니다." confirmLabel="끄기" tone="error"
        onConfirm={() => { setTwoFactor(false); record({ code: "mfa.disable", action: "2단계 인증을 껐습니다", target: "내 계정" }); notify("info", "2단계 인증을 껐습니다", "다시 켜는 것을 권합니다."); }} />
    </Surface>
  );
};

// ─── 결제 ────────────────────────────────────────────────────────────────────────────────────────────────────────────

type BillingKey = "email" | "company" | "regNo" | "taxEmail";

const BillingCard = () => {
  const { record, plan, cards } = useStore();
  const form = useDraft({ email: "billing@arcfield.example", company: "아크필드로지스틱스(주)", regNo: "123-45-67890", taxEmail: "" });
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [flash, showFlash] = useFlash();
  const { draft } = form;
  const errors: Record<BillingKey, string | undefined> = {
    email: EMAIL.test(draft.email.trim()) ? undefined : "이메일 형식을 확인해주세요.",
    company: draft.company.trim() ? undefined : "회사 이름을 입력해주세요.",
    regNo: /^\d{3}-\d{2}-\d{5}$/.test(draft.regNo) ? undefined : "000-00-00000 형식으로 입력해주세요.",
    taxEmail: !draft.taxEmail.trim() || EMAIL.test(draft.taxEmail.trim()) ? undefined : "이메일 형식을 확인해주세요.",
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;
    setSubmitted(true);
    if (Object.values(errors).some(Boolean)) {
      announce("입력을 확인해주세요.", { politeness: "assertive" });
      return;
    }
    setBusy(true);
    await wait(700);
    form.commit();
    setBusy(false);
    setSubmitted(false);
    showFlash();
    announce("결제 정보를 저장했습니다.");
    record({ code: "settings.update", action: "청구 정보를 고쳤습니다", target: draft.company });
  };
  const primary = cards.find((card) => card.primary);
  return (
    <Surface id="billing" fill="raised" radius="lg" shadow padding="xl">
      <Stack as="form" noValidate gap="lg" onSubmit={submit} aria-label="결제 정보">
        <Text as="h2" variant="subheading">결제</Text>
        <Grid columns={TWO_COLUMNS} gap="lg" align="start">
          <FormField label="청구 이메일" invalid={submitted && Boolean(errors.email)} error={errors.email}>
            <Field type="email" value={draft.email} onChange={(event) => form.set({ email: event.target.value })} />
          </FormField>
          <FormField label="세금계산서 이메일" description="비워두면 청구 이메일로 보냅니다." invalid={submitted && Boolean(errors.taxEmail)} error={errors.taxEmail}>
            <Field type="email" value={draft.taxEmail} onChange={(event) => form.set({ taxEmail: event.target.value })} />
          </FormField>
          <FormField label="회사" invalid={submitted && Boolean(errors.company)} error={errors.company}>
            <Field value={draft.company} onChange={(event) => form.set({ company: event.target.value })} />
          </FormField>
          <FormField label="사업자등록번호" invalid={submitted && Boolean(errors.regNo)} error={errors.regNo}>
            <Field inputMode="numeric" numeric placeholder="000-00-00000" value={draft.regNo} onChange={(event) => form.set({ regNo: event.target.value.replace(/[^\d-]/g, "").slice(0, 12) })} />
          </FormField>
        </Grid>
        <Divider />
        <Inline justify="between" gap="md" wrap>
          <Stack gap="xs">
            <Text as="span" strong>플랜 {plan === "business" ? "Business" : plan === "team" ? "Team" : "Enterprise"}</Text>
            <Text as="span" variant="label" strong={false} ink="tertiary">기본 결제 수단 {primary ? `${primary.brand} •••• ${primary.last4}` : "없음"}</Text>
          </Stack>
          <Button as={RouterLink} to="/demo/arcfield/billing?tab=payment" variant="hairline">비용과 결제에서 바꾸기</Button>
        </Inline>
        <Inline justify="between" gap="md" wrap>
          <Inline gap="xs" role="status">
            {flash ? <><CheckIcon ink="success" /><Text as="span" ink="success">저장했습니다</Text></> : form.dirty ? <Text as="span" ink="tertiary">저장하지 않은 변경이 있습니다</Text> : null}
          </Inline>
          <Inline gap="sm">
            <Button variant="ghost" disabled={!form.dirty || busy} onClick={() => { form.revert(); setSubmitted(false); }}>취소</Button>
            <Button type="submit" disabled={!form.dirty} loading={busy} loadingLabel="저장하는 중">저장</Button>
          </Inline>
        </Inline>
      </Stack>
    </Surface>
  );
};

// ─── 위험 구역 ───────────────────────────────────────────────────────────────────────────────────────────────────────

const WORKSPACE = "arcfield-logistics";

const DangerCard = () => {
  const { notify, record, budget } = useStore();
  const [asking, setAsking] = useState<"export" | "delete" | null>(null);
  const [scheduled, setScheduled] = useState(false);
  return (
    <Surface id="danger" fill="raised" radius="lg" shadow padding="xl">
      <Stack gap="lg">
        <Text as="h2" variant="subheading">위험 구역</Text>
        {scheduled ? (
          <Notice accent="error" title="작업 공간이 7일 뒤에 삭제됩니다">그 전에는 언제든 취소할 수 있습니다. 취소하지 않으면 모든 프로젝트와 자원, 청구 기록이 사라집니다.{" "}
            <Button size="xs" variant="hairline" onClick={() => { setScheduled(false); record({ code: "workspace.restore", action: "작업 공간 삭제를 취소했습니다", target: WORKSPACE }); notify("success", "삭제를 취소했습니다", "작업 공간이 그대로 남습니다."); }}>삭제 취소</Button>
          </Notice>
        ) : null}
        <Inline justify="between" gap="lg" wrap>
          <Stack>
            <Text as="span" strong>모든 데이터 내보내기</Text>
            <Text as="span" variant="label" strong={false} ink="tertiary">프로젝트, 자원 목록, 감사 기록, 청구서를 한 묶음으로 받습니다. 준비되면 메일로 알립니다.</Text>
          </Stack>
          <Button variant="hairline" onClick={() => setAsking("export")}>내보내기</Button>
        </Inline>
        <Divider />
        <Inline justify="between" gap="lg" wrap>
          <Stack>
            <Text as="span" strong>작업 공간 삭제</Text>
            <Text as="span" variant="label" strong={false} ink="tertiary">모든 프로젝트와 자원을 지웁니다. 월 예산 {formatWon(budget)} 규모의 작업 공간입니다.</Text>
          </Stack>
          <Button accent="error" variant="hairline" disabled={scheduled} onClick={() => setAsking("delete")}>작업 공간 삭제</Button>
        </Inline>
      </Stack>
      <ConfirmDialog open={asking === "export"} onOpenChange={(open) => { if (!open) setAsking(null); }} title="데이터를 내보낼까요?" description="규모에 따라 몇 분 걸릴 수 있습니다." confirmLabel="내보내기 시작"
        onConfirm={() => { record({ code: "workspace.export", action: "데이터 내보내기를 시작했습니다", target: WORKSPACE }); notify("info", "내보내기를 시작했습니다", "준비되면 메일로 알려드립니다. (데모에서는 파일이 만들어지지 않습니다.)"); }} />
      <ConfirmDialog open={asking === "delete"} onOpenChange={(open) => { if (!open) setAsking(null); }} title="작업 공간을 삭제할까요?" description="7일 안에는 취소할 수 있고, 그 뒤에는 되돌릴 수 없습니다." confirmLabel="삭제 예약" tone="error" confirmText={WORKSPACE}
        onConfirm={() => { setScheduled(true); record({ code: "workspace.delete", action: "작업 공간 삭제를 예약했습니다", target: WORKSPACE }); notify("error", "작업 공간 삭제를 예약했습니다", "7일 뒤에 삭제됩니다."); }} />
    </Surface>
  );
};

// ─── The page ────────────────────────────────────────────────────────────────────────────────────────────────────────

// A link into a card (billing's "설정으로 가기" lands on #billing) has to wait for the page, which loads when it is asked for: the
// browser looks for the card before it exists, so the page scrolls to it once it is there.
const useHashScroll = () => {
  const { hash } = useLocation();
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ block: "start" });
  }, [hash]);
};

export const SettingsScreen = () => {
  useHashScroll();
  return (
  <Stack gap="lg" padding="lg">
    {/* The settings are opened from the dashboard (the sidebar's 설정, the account menu), so the way back leads there. */}
    <ScreenBar start={<Button as={RouterLink} to="/demo/arcfield" size="sm" variant="ghost"><ArrowLeftIcon />대시보드</Button>} />
    <Grid {...MAIN} justifyItems="center">
      <Stack gap="xl" width="full" maxWidth="measure.xl" paddingY="lg">
        <Text as="h1" variant="display">설정</Text>
        <NoticeBar />
        <ProfileForm />
        <Stack gap="lg">
          <SecurityCard />
          <BillingCard />
          <Surface id="team" fill="raised" radius="lg" shadow padding="xl">
            <Stack gap="lg">
              <Stack gap="xs">
                <Text as="h2" variant="subheading">팀</Text>
                <Text as="span" variant="label" strong={false} ink="tertiary">함께 일하는 사람과 그 역할입니다. 역할은 여기서 바로 바꿉니다.</Text>
              </Stack>
              <MemberRows />
            </Stack>
          </Surface>
          <Surface id="keys" fill="raised" radius="lg" shadow padding="xl">
            <Stack gap="lg">
              <Stack gap="xs">
                <Text as="h2" variant="subheading">API 키</Text>
                <Text as="span" variant="label" strong={false} ink="tertiary">프로그램이 이 작업 공간에 들어오는 열쇠입니다. 지금은 가짜 값만 쓰입니다.</Text>
              </Stack>
              <KeyRows />
            </Stack>
          </Surface>
          <DangerCard />
        </Stack>
      </Stack>
    </Grid>
  </Stack>
  );
};
