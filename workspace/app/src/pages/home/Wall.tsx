import type { ReactNode } from "react";

import { Badge, Button, Checkbox, Divider, Field, Inline, Paint, SegmentControl, Select, Slider, Stack, Surface, Switch, Text, reveal } from "@studio-baeks/paper-ui";
import type { Status } from "@studio-baeks/paper-ui/tokens";

import { BoxIcon, DeployIcon, SearchIcon } from "../../compositions/icons";
import { joinClass } from "../../joinClass";
import { useWords } from "../../site/locale";
import * as w from "../../site/home-wall.css";

const WALL = {
  ko: {
    section: "Paper 컴포넌트로 만든 화면 조각",
    notifications: { title: "알림", note: "받고 싶은 소식만 고릅니다.", mention: "나를 언급하면", issue: "새 이슈가 열리면", weekly: "주간 요약", digest: "요약 주기", day: "매일", week: "매주", month: "매달" },
    invite: { title: "멤버 초대", note: "초대한 사람은 이메일로 링크를 받습니다.", email: "초대할 이메일", placeholder: "name@example.com", role: "역할", viewer: "보기만", editor: "편집자", admin: "관리자", send: "초대 보내기" },
    week: { title: "이번 주", note: "닫힌 이슈" },
    plan: { title: "Team 플랜", note: "팀이 커지면 언제든 바꿀 수 있습니다.", billing: "결제 주기", monthly: "월간", yearly: "연간", price: "₩9,900", per: "/ 사람 · 월", features: ["무제한 프로젝트", "역할별 권한", "감사 기록"], change: "플랜 바꾸기" },
    search: { title: "찾기", field: "이슈와 배포 찾기", placeholder: "이슈, 배포, 사람", results: ["STU-142 토큰 트리 emit", "배포 318번 — production", "STU-139 Select 포커스 링"], labels: ["진행", "완료", "막힘"] },
    tasks: { title: "출시 전 확인", note: "세 가지 중 둘을 마쳤습니다.", items: ["접근성 검사", "다크 테마 확인", "릴리즈 노트"], progress: "진행률" },
    faces: { title: "면의 깊이", note: "앞에서 뒤로, 흰 면 · 바탕 · 가라앉은 면" },
    type: { title: "글자의 역할", display: "조용한 바탕", heading: "역할로 고르는 글자", body: "크기는 숫자가 아니라 역할로 고르고, 색은 잉크의 이름이 정합니다." },
    signIn: { title: "로그인", note: "Studio 계정으로 계속합니다.", email: "로그인 이메일", emailPlaceholder: "이메일", password: "비밀번호", keep: "로그인 유지", go: "계속" },
  },
  en: {
    section: "Pieces of screens built with Paper components",
    notifications: { title: "Notifications", note: "Only the news you want.", mention: "When I'm mentioned", issue: "When an issue opens", weekly: "Weekly digest", digest: "Digest", day: "Daily", week: "Weekly", month: "Monthly" },
    invite: { title: "Invite a member", note: "They get a link by email.", email: "Email to invite", placeholder: "name@example.com", role: "Role", viewer: "Viewer", editor: "Editor", admin: "Admin", send: "Send invite" },
    week: { title: "This week", note: "Issues closed" },
    plan: { title: "Team plan", note: "Change it whenever the team grows.", billing: "Billing", monthly: "Monthly", yearly: "Yearly", price: "$8", per: "/ seat · month", features: ["Unlimited projects", "Role-based access", "Audit log"], change: "Change plan" },
    search: { title: "Search", field: "Search issues and deploys", placeholder: "Issues, deploys, people", results: ["STU-142 Emit the token tree", "Deploy 318 — production", "STU-139 Select focus ring"], labels: ["In progress", "Done", "Blocked"] },
    tasks: { title: "Before release", note: "Two of three done.", items: ["Accessibility audit", "Dark theme pass", "Release notes"], progress: "Progress" },
    faces: { title: "Surface depth", note: "Front to back: raised · canvas · sunken" },
    type: { title: "Type roles", display: "Quiet ground", heading: "Type picked by role", body: "Size comes from a role, not a number. Color comes from the ink's name." },
    signIn: { title: "Sign in", note: "Continue with your Studio account.", email: "Sign-in email", emailPlaceholder: "Email", password: "Password", keep: "Keep me signed in", go: "Continue" },
  },
} as const;

const Card = ({ title, note, children }: { title: string; note?: string; children: ReactNode }) => (
  <Surface fill="raised" radius="lg" padding="lg" shadow className={reveal.scroll}>
    <Stack gap="xs" className={w.cardHead}>
      <Text variant="subheading" as="p">{title}</Text>
      {note ? <Text variant="caption" ink="secondary" as="p">{note}</Text> : null}
    </Stack>
    {children}
  </Surface>
);

const Setting = ({ label, checked }: { label: string; checked?: boolean }) => (
  <label className={w.settingRow}>
    <Text variant="body" as="span">{label}</Text>
    <Switch defaultChecked={checked} />
  </label>
);

const Notifications = () => {
  const t = useWords(WALL).notifications;
  return (
    <Card title={t.title} note={t.note}>
      <Stack gap="md">
        <Setting label={t.mention} checked />
        <Setting label={t.issue} checked />
        <Setting label={t.weekly} />
        <Divider />
        <Stack gap="xs">
          <Text variant="label" as="p" ink="secondary">{t.digest}</Text>
          <SegmentControl aria-label={t.digest} variant="outline" shape="rounded" size="sm" defaultValue="week" fullWidth>
            <SegmentControl.Item value="day">{t.day}</SegmentControl.Item>
            <SegmentControl.Item value="week">{t.week}</SegmentControl.Item>
            <SegmentControl.Item value="month">{t.month}</SegmentControl.Item>
          </SegmentControl>
        </Stack>
      </Stack>
    </Card>
  );
};

const Invite = () => {
  const t = useWords(WALL).invite;
  return (
    <Card title={t.title} note={t.note}>
      <Stack gap="sm">
        <Field aria-label={t.email} placeholder={t.placeholder} />
        <Select aria-label={t.role} defaultValue="editor">
          <Select.Option value="viewer">{t.viewer}</Select.Option>
          <Select.Option value="editor">{t.editor}</Select.Option>
          <Select.Option value="admin">{t.admin}</Select.Option>
        </Select>
        <Button fullWidth>{t.send}</Button>
      </Stack>
    </Card>
  );
};

const WEEK = ["2.25rem", "3rem", "1.75rem", "3.5rem", "2.75rem", "4rem", "3.25rem"];
const Throughput = () => {
  const t = useWords(WALL).week;
  return (
    <Card title={t.title} note={t.note}>
      <Stack gap="md">
        <Inline gap="sm" align="center">
          <Text variant="headline" as="span" numeric>128</Text>
          <Badge accent="success">+12%</Badge>
        </Inline>
        <div className={w.bars} aria-hidden="true">
          {WEEK.map((height, index) => index === WEEK.length - 1
            ? <Paint key={height} accent="primary" variant="solid" className={w.bar} style={{ height }} />
            : <Surface key={height} fill="sunken" className={w.bar} style={{ height }} />)}
        </div>
      </Stack>
    </Card>
  );
};

const Plan = () => {
  const t = useWords(WALL).plan;
  return (
    <Card title={t.title} note={t.note}>
      <Stack gap="md">
        <SegmentControl aria-label={t.billing} size="sm" defaultValue="year" fullWidth>
          <SegmentControl.Item value="month">{t.monthly}</SegmentControl.Item>
          <SegmentControl.Item value="year">{t.yearly}</SegmentControl.Item>
        </SegmentControl>
        <Inline gap="xs" align="baseline">
          <Text variant="display" as="span" numeric>{t.price}</Text>
          <Text variant="caption" ink="secondary" as="span">{t.per}</Text>
        </Inline>
        <Stack gap="sm">
          {t.features.map((feature) => (
            <Inline key={feature} as="label" gap="sm" align="center">
              <Checkbox defaultChecked />
              <Text variant="body" as="span">{feature}</Text>
            </Inline>
          ))}
        </Stack>
        <Button variant="hairline" fullWidth>{t.change}</Button>
      </Stack>
    </Card>
  );
};

const RESULTS: { icon: ReactNode; status: Status }[] = [
  { icon: <BoxIcon size="body" ink="secondary" />, status: "info" },
  { icon: <DeployIcon size="body" ink="secondary" />, status: "success" },
  { icon: <BoxIcon size="body" ink="secondary" />, status: "error" },
];
const Search = () => {
  const t = useWords(WALL).search;
  return (
    <Card title={t.title}>
      <Stack gap="sm">
        <Field aria-label={t.field} placeholder={t.placeholder} leading={<SearchIcon />} />
        <Stack gap="xs">
          {RESULTS.map((result, index) => (
            <div key={t.results[index]} className={w.result}>
              {result.icon}
              <Text variant="body" as="span" className={w.resultWords}>{t.results[index]}</Text>
              <Badge accent={result.status}>{t.labels[index]}</Badge>
            </div>
          ))}
        </Stack>
      </Stack>
    </Card>
  );
};

const DONE = [true, true, false] as const;
const Tasks = () => {
  const t = useWords(WALL).tasks;
  return (
    <Card title={t.title} note={t.note}>
      <Stack gap="md">
        <Stack gap="sm">
          {t.items.map((task, index) => (
            <Inline key={task} as="label" gap="sm" align="center">
              <Checkbox defaultChecked={DONE[index]} />
              <Text variant="body" as="span" ink={DONE[index] ? "secondary" : "primary"}>{task}</Text>
            </Inline>
          ))}
        </Stack>
        <Stack gap="xs">
          <Inline justify="between" align="center">
            <Text variant="label" as="span" ink="secondary">{t.progress}</Text>
            <Text variant="label" as="span" numeric>66%</Text>
          </Inline>
          <Slider aria-label={t.progress} defaultValue={66} />
        </Stack>
      </Stack>
    </Card>
  );
};

const Faces = () => {
  const t = useWords(WALL).faces;
  return (
    <Card title={t.title} note={t.note}>
      <div className={w.swatches}>
        {(["raised", "canvas", "sunken"] as const).map((fill) => (
          <Stack key={fill} gap="xs">
            <Surface fill={fill} border radius="md" className={w.swatch} />
            <Text variant="caption" family="mono" ink="secondary" as="span">{fill}</Text>
          </Stack>
        ))}
      </div>
    </Card>
  );
};

const Type = () => {
  const t = useWords(WALL).type;
  return (
    <Card title={t.title}>
      <Stack gap="xs">
        <Text variant="display" as="p">{t.display}</Text>
        <Text variant="heading" as="p">{t.heading}</Text>
        <Text variant="body" as="p" ink="secondary">{t.body}</Text>
        <Text variant="caption" family="mono" ink="tertiary" as="p">display · heading · body · caption</Text>
      </Stack>
    </Card>
  );
};

const SignIn = () => {
  const t = useWords(WALL).signIn;
  return (
    <Card title={t.title} note={t.note}>
      <Stack gap="sm">
        <Field aria-label={t.email} placeholder={t.emailPlaceholder} type="email" />
        <Field aria-label={t.password} placeholder={t.password} type="password" showPasswordToggle />
        <Inline as="label" gap="sm" align="center">
          <Checkbox />
          <Text variant="body" as="span">{t.keep}</Text>
        </Inline>
        <Button fullWidth>{t.go}</Button>
      </Stack>
    </Card>
  );
};

const COLUMNS: ReactNode[][] = [
  [<Notifications key="notifications" />, <Invite key="invite" />],
  [<Throughput key="throughput" />, <Plan key="plan" />],
  [<Search key="search" />, <Tasks key="tasks" />],
  [<Faces key="faces" />, <Type key="type" />, <SignIn key="sign-in" />],
];

export const Wall = () => (
  <section className={w.wallSection} aria-label={useWords(WALL).section}>
    <div className={w.wall} data-testid="home-wall">
      {COLUMNS.map((cards, index) => (
        <div key={index} className={joinClass(w.column, index % 2 === 1 && w.columnAgainst)}>{cards}</div>
      ))}
    </div>
  </section>
);
