// 소개 — what a visitor who is not signed in sees at /classes/welcome, and where signing out leads. The app is closed to
// anyone without an account, so this is the only page that explains it from outside.
//
// Nothing real goes on this screen: it lies in front of the sign-in, so anyone can read it. The two samples in the first
// view (the class you are in, a search) use made-up subjects, rooms and times — no student, no teacher, no real timetable.

import { Link as RouterLink } from "react-router-dom";

import { Badge, Box, Button, Divider, Grid, Inline, Stack, Surface, Text } from "@studio-baeks/paper-ui";

import { Glyph, Meter, useFace, type GlyphName } from "../../../kit";
import { path } from "../state";
import { Eyebrow } from "../ui/parts";
import { Frame } from "./auth/Frame";

// ── the two samples ──────────────────────────────────────────────────────────

// The home screen's first answer: the class you are in, the room, how long is left, what comes next.
const SampleNow = () => {
  const face = useFace();
  return (
    <Surface as="section" {...face} radius="lg" padding="xl" aria-label="예시 화면: 지금 수업">
      <Stack gap="lg">
        <Inline justify="between" align="center">
          <Eyebrow>지금</Eyebrow>
          <Badge variant="solid" size="sm">6–7교시</Badge>
        </Inline>
        <Stack gap="xs">
          <Text as="p" variant="title">일반물리학2</Text>
          <Inline gap="xs" align="center">
            <Glyph name="map-pin" ink="tertiary" />
            <Text as="span" ink="secondary">형3204 · 2분반</Text>
          </Inline>
        </Stack>
        <Meter value={0.5} label="14:40 – 16:30" valueText="55분 남음" />
        <Divider />
        <Inline gap="sm" align="baseline" wrap>
          <Eyebrow>다음</Eyebrow>
          <Text as="span">9교시 확률및통계</Text>
          <Text as="span" ink="tertiary">형3301</Text>
        </Inline>
      </Stack>
    </Surface>
  );
};

// The search box: initials and logic work in it; the answer is the subjects that are left.
const SampleSearch = () => {
  const face = useFace();
  return (
    <Surface as="section" {...face} radius="lg" padding="lg" aria-label="예시 화면: 검색">
      <Stack gap="md">
        <Surface fill="sunken" radius="md" paddingX="md" paddingY="sm">
          <Inline gap="sm" align="center">
            <Glyph name="search" ink="tertiary" />
            <Text as="span">{"월1 & 물리"}</Text>
          </Inline>
        </Surface>
        <Inline gap="xs" wrap>
          {["일반물리학1", "일반물리학실험1", "고급물리학"].map((name) => (
            <Badge key={name} variant="soft" size="md">{name}</Badge>
          ))}
        </Inline>
        <Text variant="caption" ink="tertiary">월요일 1교시 수업 가운데 이름에 ‘물리’가 들어간 과목만 남습니다.</Text>
      </Stack>
    </Surface>
  );
};

// ── what it says ─────────────────────────────────────────────────────────────

const FEATURES: readonly { glyph: GlyphName; title: string; body: string }[] = [
  { glyph: "house", title: "오늘의 시간표", body: "지금 몇 교시이고 어느 교실로 가야 하는지가 맨 위에 보입니다. 오늘의 수업과 급식은 그 아래로 이어집니다." },
  { glyph: "search", title: "한 칸으로 검색", body: "이름, 학번, 과목, 교사, 강의실을 한 칸에서 찾습니다. ㅈㅂㄱㅎ처럼 초성만 넣어도 찾고, + & ! 로 조건을 이어 붙일 수도 있습니다." },
  { glyph: "map", title: "빈 강의실", body: "요일과 교시를 고르면 그때 비어 있는 교실만 남습니다. 여러 교시를 한꺼번에 골라도 됩니다." },
  { glyph: "users", title: "친구와 같이 비는 교시", body: "친구들의 시간표를 겹쳐서 모두가 비는 교시를 찾습니다. 서로 다른 수업 때문에 만나지 못하는 교시도 따로 알려 줍니다." },
  { glyph: "graduation-cap", title: "졸업 요건 계산", body: "들은 과목을 채워 두면 남은 학점을 계산합니다. 쓰던 엑셀 파일이 있으면 그대로 올려도 됩니다." },
  { glyph: "folder-open", title: "자료 나눔", body: "강의계획서와 정리 자료를 과목별로 모아 보고, 내가 가진 자료도 올려서 나눕니다." },
];

const STEPS = [
  { title: "계정으로 들어옵니다", body: "계정은 관리자가 만들어 줍니다. 받은 아이디와 비밀번호로 로그인합니다." },
  { title: "학번을 한 번 확인합니다", body: "처음 들어오면 학교 구글 계정으로 학번을 확인합니다. 구글 계정은 로그인이 아니라 이 확인에만 씁니다." },
  { title: "오늘의 시간표를 봅니다", body: "홈에서 지금 갈 교실과 오늘의 하루가 바로 보입니다. 검색도 거기서 시작합니다." },
] as const;

const POINTS: readonly { glyph: GlyphName; title: string; body: string }[] = [
  { glyph: "shield-check", title: "로그인 전에는 이름 하나 보이지 않습니다.", body: "이 화면 밖은 모두 계정을 요구합니다. 계정은 관리자가 만들고, 학번은 학교 구글 계정으로 한 번 확인합니다." },
  { glyph: "book-open", title: "수업 데이터는 학교 학사 시스템에서 옵니다.", body: "학기 단위로 받아 오고, 바뀌었을 때만 새 회차를 올립니다. 급식은 따로 가져옵니다." },
  { glyph: "users", title: "친구의 빈 교시에는 과목 이름이 없습니다.", body: "언제 비는지만 보입니다. 남의 하루를 통째로 펼쳐 놓을 이유가 없기 때문입니다." },
];

const FAQ = [
  { q: "누가 쓸 수 있나요?", a: "한국과학영재학교 구성원입니다. 계정은 관리자가 만들어 주고, 처음 들어오면 학교 구글 계정으로 학번을 한 번 확인합니다." },
  { q: "시간표는 어디서 오나요?", a: "학교 학사 시스템에서 학기 단위로 받아 옵니다. 급식은 급식 정보에서 따로 가져옵니다." },
  { q: "로그인하지 않으면 무엇이 보이나요?", a: "이 화면이 전부입니다. 이름이나 시간표가 들어간 곳은 모두 로그인 뒤에 있습니다." },
  { q: "폰에서도 되나요?", a: "웹 그대로 쓸 수 있습니다. 안드로이드에는 지금 교시와 급식을 홈 화면에 올리는 위젯이 따로 있습니다." },
] as const;

export const LandingPage = () => (
  <Frame
    wide
    end={
      <>
        <Box hideBelow="sm">
          <Button as={RouterLink} to={path("/privacy")} variant="ghost" size="sm">개인정보처리방침</Button>
        </Box>
        <Button as={RouterLink} to={path("/login")} variant="hairline" size="sm">로그인</Button>
      </>
    }
  >
    <Stack gap="3xl" paddingY="2xl">
      <Grid columns={{ base: 1, lg: "minmax(0, 1fr) minmax(0, 24rem)" }} gap="3xl" align="center">
        <Stack gap="xl">
          <Stack gap="md">
            <Eyebrow>한국과학영재학교 · 수업 탐색</Eyebrow>
            <Text as="h1" variant="headline">시간표를 검색합니다.</Text>
          </Stack>
          <Text variant="lead" ink="secondary">
            이름을 넣으면 그 사람의 시간표가, 교실을 넣으면 그 교실의 하루가 나옵니다. 비어 있는 강의실도, 친구들이 함께 비는 교시도 같은 칸에서 찾습니다.
          </Text>
          <Inline gap="sm" wrap>
            <Button as={RouterLink} to={path("/login")} size="lg">시작하기<Glyph name="arrow-right" /></Button>
            <Button as="a" href="#features" variant="hairline" size="lg">기능 보기</Button>
          </Inline>
          <Text variant="caption" ink="tertiary">계정은 학교 구성원에게만 발급됩니다. 이 화면의 예시는 모두 지어낸 내용입니다.</Text>
        </Stack>
        <Stack gap="md">
          <SampleNow />
          <SampleSearch />
        </Stack>
      </Grid>

      <Stack as="section" id="features" gap="xl" aria-labelledby="features-title">
        <Stack gap="xs">
          <Eyebrow>기능</Eyebrow>
          <Text as="h2" variant="title" id="features-title">이런 일을 합니다.</Text>
        </Stack>
        <Grid columns={{ base: 1, md: 2, lg: 3 }} gap="2xl">
          {FEATURES.map((feature) => (
            <Stack key={feature.title} gap="sm">
              <Inline gap="sm" align="center">
                <Glyph name={feature.glyph} />
                <Text as="h3" variant="subheading">{feature.title}</Text>
              </Inline>
              <Text ink="secondary">{feature.body}</Text>
            </Stack>
          ))}
        </Grid>
        <Text ink="tertiary">그 밖에 학사일정, 교육과정 지도, 수강 정정 탐색, 학사 통계가 있습니다.</Text>
      </Stack>

      <Stack as="section" gap="xl" aria-labelledby="steps-title">
        <Stack gap="xs">
          <Eyebrow>시작하는 법</Eyebrow>
          <Text as="h2" variant="title" id="steps-title">세 걸음이면 됩니다.</Text>
        </Stack>
        <Grid columns={{ base: 1, md: 3 }} gap="2xl">
          {STEPS.map((step, index) => (
            <Stack key={step.title} gap="md">
              <Divider />
              <Stack gap="sm">
                <Eyebrow>{index + 1}단계</Eyebrow>
                <Text as="h3" variant="subheading">{step.title}</Text>
                <Text ink="secondary">{step.body}</Text>
              </Stack>
            </Stack>
          ))}
        </Grid>
      </Stack>

      <Surface as="section" fill="sunken" radius="lg" padding="2xl" aria-labelledby="privacy-title">
        <Grid columns={{ base: 1, lg: "minmax(0, 5fr) minmax(0, 7fr)" }} gap="2xl" align="start">
          <Stack gap="md">
            <Eyebrow>데이터</Eyebrow>
            <Text as="h2" variant="title" id="privacy-title">명단은 로그인 뒤에 있습니다.</Text>
            <Text ink="secondary">무엇을 왜 모으는지, 어디에 두는지는 개인정보처리방침에 적어 두었습니다.</Text>
            <Inline>
              <Button as={RouterLink} to={path("/privacy")} variant="hairline">개인정보처리방침 읽기<Glyph name="arrow-right" /></Button>
            </Inline>
          </Stack>
          <Stack as="ul" gap="lg">
            {POINTS.map((point) => (
              <Inline as="li" key={point.title} gap="md" align="start">
                <Glyph name={point.glyph} ink="secondary" />
                <Stack gap="xs" minWidth={0}>
                  <Text as="h3" variant="subheading">{point.title}</Text>
                  <Text ink="secondary">{point.body}</Text>
                </Stack>
              </Inline>
            ))}
          </Stack>
        </Grid>
      </Surface>

      <Stack as="section" gap="xl" aria-labelledby="faq-title">
        <Stack gap="xs">
          <Eyebrow>자주 묻는 것</Eyebrow>
          <Text as="h2" variant="title" id="faq-title">미리 답해 둡니다.</Text>
        </Stack>
        <Grid columns={{ base: 1, md: 2 }} gap="xl">
          {FAQ.map((item) => (
            <Stack key={item.q} gap="xs">
              <Text as="h3" variant="subheading">{item.q}</Text>
              <Text ink="secondary">{item.a}</Text>
            </Stack>
          ))}
        </Grid>
      </Stack>

      <Stack align="center" gap="lg" paddingY="2xl">
        <Text as="h2" variant="title">이제 여러 곳을 뒤지지 않아도 됩니다.</Text>
        <Button as={RouterLink} to={path("/login")} size="lg">시작하기<Glyph name="arrow-right" /></Button>
      </Stack>

      <Stack gap="md">
        <Divider />
        <Inline justify="between" gap="md" wrap>
          <Text as="span" variant="caption" ink="tertiary">Class Explorer · 한국과학영재학교 수업 탐색</Text>
          <Inline gap="xs" wrap>
            <Button as={RouterLink} to={path("/privacy")} variant="ghost" size="sm">개인정보처리방침</Button>
            <Button as={RouterLink} to={path("/login")} variant="ghost" size="sm">로그인</Button>
          </Inline>
        </Inline>
      </Stack>
    </Stack>
  </Frame>
);
