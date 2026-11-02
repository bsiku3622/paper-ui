// A settings page: the same md controls, many of them, in rows. It is where radius and height meet density.

import { Button, Checkbox, Divider, Field, FormField, Grid, Inline, Radio, Select, Stack, Surface, Switch, Text, Textarea } from "@studio-baeks/paper-ui";

import { DemoBar, MAIN } from "./parts";

const NOTIFICATIONS = [
  { title: "배포가 끝나면 알리기", detail: "성공과 실패를 모두 메일로 받습니다.", on: true },
  { title: "주간 요약 받기", detail: "월요일 아침에 한 번 보냅니다.", on: true },
  { title: "새 기기 로그인 알리기", detail: "처음 보는 기기에서 로그인하면 알립니다.", on: false },
];

const SCOPES = [
  { label: "팀 전체에 공개", on: true },
  { label: "초대한 사람만", on: false },
  { label: "나만 보기", on: false },
];

export const SettingsScreen = () => (
  <Stack gap="lg" padding="lg">
    <DemoBar />
    <Grid {...MAIN} justifyItems="center">
      <Stack gap="xl" width="full" maxWidth="measure.xl" paddingY="lg">
        <Text as="h1" variant="display">설정</Text>
        <Stack gap="lg">
          <Surface fill="raised" radius="lg" shadow padding="xl">
            <Stack gap="lg">
              <Text as="h2" variant="subheading">프로필</Text>
              <Grid columns="repeat(auto-fit, minmax(min(100%, 16rem), 1fr))" gap="lg">
                <FormField label="이름"><Field defaultValue="백재원" /></FormField>
                <FormField label="이메일"><Field type="email" defaultValue="name@studiobaeks.com" /></FormField>
                <FormField label="언어">
                  <Select defaultValue="ko">
                    <Select.Option value="ko">한국어</Select.Option>
                    <Select.Option value="en">English</Select.Option>
                  </Select>
                </FormField>
                <FormField label="웹사이트" invalid error="주소 형식이 맞지 않습니다."><Field defaultValue="studiobaeks" /></FormField>
              </Grid>
              <FormField label="소개"><Textarea rows={3} placeholder="한두 줄로 소개해 주세요." /></FormField>
            </Stack>
          </Surface>
          <Surface fill="raised" radius="lg" shadow padding="xl">
            <Stack gap="sm">
              <Text as="h2" variant="subheading">알림</Text>
              <Stack>
                {NOTIFICATIONS.map((item, index) => (
                  <Stack key={item.title}>
                    {index > 0 ? <Divider /> : null}
                    <Inline justify="between" gap="lg" paddingY="md">
                      <Stack>
                        <Text as="span" strong>{item.title}</Text>
                        <Text as="span" variant="label" strong={false} ink="tertiary">{item.detail}</Text>
                      </Stack>
                      <Switch aria-label={item.title} defaultChecked={item.on} />
                    </Inline>
                  </Stack>
                ))}
              </Stack>
            </Stack>
          </Surface>
          <Surface fill="raised" radius="lg" shadow padding="xl">
            <Stack gap="lg">
              <Text as="h2" variant="subheading">공개 범위</Text>
              <Stack gap="sm">
                {SCOPES.map((scope) => (
                  <Inline key={scope.label} as="label" gap="sm">
                    <Radio name="scope" defaultChecked={scope.on} />
                    <Text as="span">{scope.label}</Text>
                  </Inline>
                ))}
              </Stack>
              <Divider />
              <Inline as="label" gap="sm">
                <Checkbox defaultChecked />
                <Text as="span">검색 결과에 프로필 표시</Text>
              </Inline>
            </Stack>
          </Surface>
        </Stack>
        <Inline justify="end" gap="sm">
          <Button variant="ghost">취소</Button>
          <Button>저장</Button>
        </Inline>
      </Stack>
    </Grid>
  </Stack>
);
