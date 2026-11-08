import { useState } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";

import { Badge, Box, Button, Divider, Field, FormField, Grid, Inline, Link, Stack, Surface, Text, Textarea } from "@studio-baeks/paper-ui";

import { ArrowLeftIcon, ArrowRightIcon, SearchIcon } from "../../compositions/icons";
import { DOCS, DOC_CATEGORIES, EmptyState, Notice, PageTitle, Panel, Segmented, relative, useParam, useStore, wait, type DocCategory, type DocMeta } from "./parts";

type Section = { heading: string; text?: readonly string[]; steps?: readonly string[]; code?: string; note?: string };

const BODIES: Record<string, readonly Section[]> = {
  tour: [
    { heading: "사이드바의 여덟 곳", text: ["왼쪽 사이드바에는 개요, 프로젝트와 자원, 배포, 모니터링, 비용과 결제, 보안과 접근이 있고, 아래쪽에 설정과 문서가 있습니다.", "개요는 오늘 먼저 볼 것을 모은 첫 화면입니다. 서비스 상태와 최근 배포, 처리가 필요한 항목, 이번 달 비용을 한 화면에서 봅니다. 나머지 일곱 곳은 각자의 일을 깊이 다룹니다."] },
    { heading: "범위를 한 번에 좁히기", text: ["화면 위쪽의 프로젝트와 환경 버튼은 모든 페이지가 보여 주는 범위를 정합니다. 배송 추적과 production을 고르면 배포, 모니터링, 점검 결과, 비용이 모두 그 범위로 줄어듭니다.", "범위는 페이지를 옮겨도 유지됩니다. 전체를 다시 보려면 두 버튼을 모두 '모든'으로 되돌리세요."] },
    { heading: "빠르게 찾기", text: ["어느 화면에서든 / 키를 누르면 검색 칸으로 이동합니다. 자원, 배포, 프로젝트, 점검 항목, 알림, 멤버, 문서를 한꺼번에 찾고, 결과를 누르면 그 항목으로 바로 갑니다."] },
  ],
  "first-project": [
    { heading: "만들기 전에", text: ["프로젝트는 자원과 배포, 비용을 묶는 가장 큰 단위입니다. 이름은 팀이 부르는 말로, ID는 자원 이름과 주소에 쓰이므로 짧고 오래 갈 이름으로 정하세요."] },
    { heading: "만드는 순서", steps: ["프로젝트와 자원에서 새 프로젝트를 누릅니다.", "이름과 프로젝트 ID를 입력합니다. ID는 영문 소문자로 시작하는 3~32자이고, 만든 뒤에는 바꿀 수 없습니다.", "리전과 담당자를 고르고 쓸 환경을 체크합니다.", "프로젝트 만들기를 누르면 새 프로젝트의 페이지로 이동합니다."], note: "리전은 자원이 놓이는 지역입니다. 지연 시간과 데이터 규정을 함께 고려해 고르세요." },
    { heading: "다음에 할 일", text: ["첫 자원을 만들고, 배포를 한 번 해 보고, 알림 규칙을 하나 정하세요. 각 단계는 배포와 모니터링 문서에서 이어집니다."] },
  ],
  environments: [
    { heading: "환경이란", text: ["환경은 같은 프로젝트를 용도에 따라 나눈 사본입니다. 이 콘솔은 production, staging, dev 세 가지를 씁니다."] },
    { heading: "나누는 기준", steps: ["production은 실제 고객이 쓰는 곳입니다. 변경과 접근을 가장 엄격하게 다룹니다.", "staging은 production과 같은 구성으로 배포 직전에 마지막 확인을 하는 곳입니다.", "dev는 팀이 자유롭게 실험하는 곳입니다. 비용을 아끼려 밤에는 중지해도 됩니다."] },
    { heading: "권한 나누기", text: ["개발자 역할은 dev와 staging을 바꾸고 production은 배포만 하게 두는 것을 권합니다. 역할은 보안과 접근의 접근 탭에서 바꿉니다."] },
  ],
  "resource-kinds": [
    { heading: "일곱 가지 자원", steps: ["컨테이너 서비스: 애플리케이션을 이미지로 실행합니다.", "관리형 데이터베이스: 백업과 복구가 포함된 데이터베이스입니다.", "스토리지 버킷: 파일을 보관합니다.", "컴퓨트 인스턴스: 직접 설정해 쓰는 서버입니다.", "로드 밸런서: 요청을 여러 인스턴스에 나눕니다.", "메시지 큐: 서비스끼리 메시지를 주고받는 통로입니다.", "스냅샷: 어느 한 시점의 데이터베이스나 디스크를 복사해 둔 것입니다."] },
    { heading: "이름 규칙", text: ["자원 이름은 서비스, 역할, 환경 순으로 짓는 것을 권합니다."], code: "tracking-api\ntracking-api-stg\ntracking-db-prod\nwarehouse-labels", note: "production이 기본이면 환경을 이름에 넣지 않고 다른 환경에만 -stg, -dev를 붙이는 팀도 있습니다. 중요한 것은 한 프로젝트 안에서 같은 규칙을 쓰는 것입니다." },
  ],
  "bucket-access": [
    { heading: "공개 읽기를 켜기 전에", text: ["공개 읽기를 켜면 주소를 아는 누구나 버킷의 파일을 내려받을 수 있습니다. 고객의 배송 정보나 내부 문서가 들어 있다면 켜지 마세요. 점검 결과에서 공개 읽기가 허용된 버킷은 심각 항목으로 분류됩니다."] },
    { heading: "안전하게 나누기", steps: ["파일을 받을 상대가 정해져 있다면 공개 읽기 대신 기한이 있는 공유 링크를 만드세요.", "정말 공개해야 하는 파일은 따로 버킷을 만들어 그 파일만 두세요.", "공개 버킷에는 접근 로그를 켜 두세요. 비정상적인 다운로드를 찾는 데 쓰입니다."], note: "버킷의 공개 범위를 바꾸면 감사 기록에 남습니다." },
  ],
  "database-backup": [
    { heading: "자동 백업", text: ["관리형 데이터베이스는 매일 새벽 3시(서울)에 자동으로 백업됩니다. 기본 보존 기간은 7일이고 35일까지 늘릴 수 있습니다."] },
    { heading: "특정 시점으로 복구하기", steps: ["프로젝트와 자원에서 복구할 데이터베이스를 엽니다.", "스냅샷 만들기로 지금 상태를 먼저 보관합니다.", "복구할 시점을 정하고 새 데이터베이스로 복구합니다. 기존 데이터베이스는 그대로 둡니다.", "새 데이터베이스에서 데이터를 확인한 뒤 서비스의 연결을 옮깁니다."], note: "복구는 언제나 새 자원으로 만들어집니다. 원본을 덮어쓰지 않으므로 잘못 골랐더라도 다시 시도할 수 있습니다." },
  ],
  snapshots: [
    { heading: "스냅샷이란", text: ["스냅샷은 데이터베이스나 디스크의 한 시점을 복사해 둔 것입니다. 큰 변경 전에 만들어 두면 언제든 그 시점으로 돌아갈 수 있습니다."] },
    { heading: "공유 범위", text: ["스냅샷은 만든 프로젝트 안에서만 보이는 것이 기본입니다. 다른 프로젝트나 외부와 공유하면 데이터가 함께 넘어가므로, 꼭 필요하다면 개인정보가 없는 데이터인지 확인하고 기간을 정해서 공유하세요."] },
    { heading: "비용", text: ["스냅샷은 저장 용량만큼 월 비용이 나옵니다. 쓰지 않는 오래된 스냅샷은 지우세요."] },
  ],
  pipeline: [
    { heading: "일곱 단계", steps: ["소스 가져오기: 저장소에서 지정한 브랜치나 태그를 가져옵니다.", "의존성 설치: 패키지를 내려받고 알려진 취약점을 점검합니다.", "빌드: 컨테이너 이미지를 만듭니다.", "테스트: 단위 테스트와 통합 테스트를 실행합니다.", "이미지 올리기: 이미지를 버전 태그와 함께 레지스트리에 올립니다.", "배포: 새 버전의 인스턴스로 하나씩 교체합니다.", "상태 확인: 새 버전이 응답하면 트래픽을 옮깁니다."] },
    { heading: "실패하면", text: ["한 단계가 실패하면 뒤의 단계는 건너뛰고, 서비스는 이전 버전으로 계속 동작합니다. 보통 3~6분이 걸리고 테스트가 가장 오래 걸립니다."] },
  ],
  rollback: [
    { heading: "되돌리는 순서", steps: ["배포에서 되돌릴 서비스의 배포를 엽니다.", "롤백을 누르고 이전에 성공한 버전을 고릅니다.", "이 버전으로 되돌리기를 누르면 새 배포가 시작됩니다.", "끝나면 모니터링에서 응답 시간과 오류율이 돌아왔는지 확인합니다."] },
    { heading: "되돌리기 전에 확인할 것", text: ["롤백은 코드만 되돌립니다. 데이터베이스 스키마를 바꾼 배포였다면 이전 버전이 새 스키마에서 시작하는지 먼저 확인하세요. 지난 사건 기록에도 스키마가 맞지 않아 롤백이 5분 동안 서비스를 멈춘 사례가 있습니다."] },
  ],
  "failed-deploy": [
    { heading: "먼저 어느 단계인지", text: ["배포 페이지의 단계 목록에서 멈춘 단계를 찾으세요. 그 단계에 따라 원인이 다릅니다."], steps: ["빌드: 컴파일이나 타입 오류입니다. 로그의 첫 오류 줄을 보세요.", "테스트: 실패한 테스트의 이름이 로그에 나옵니다. 같은 커밋을 로컬에서 실행해 보세요.", "배포: 새 인스턴스가 시작하지 못한 것입니다. 환경 변수와 포트를 확인하세요.", "상태 확인: 헬스 체크 경로가 응답하지 않는 것입니다. 시작 직후 의존하는 서비스에 연결되는지 보세요."] },
    { heading: "급할 때", text: ["원인을 찾는 동안 서비스는 이전 버전으로 동작하고 있으니 서두르지 않아도 됩니다. 이미 나간 버전이 문제라면 롤백을 먼저 하세요."] },
  ],
  "alert-rules": [
    { heading: "규칙의 세 부분", text: ["알림 규칙은 지표, 기준값, 지속 시간으로 이루어집니다. 지속 시간 동안 기준을 넘어 있어야 알림이 발생합니다."], code: "latency_p95 > 2000ms for 5m\nerror_rate > 1% for 5m\ncpu > 85% for 10m" },
    { heading: "만드는 요령", steps: ["사용자에게 영향이 가는 지표인 응답 시간과 오류율부터 정하세요.", "기준값은 평소의 두 배쯤에서 시작하고, 알림이 너무 잦거나 드물면 조정하세요.", "지속 시간을 5분 이상으로 두어 순간적인 튐에는 알림이 가지 않게 하세요.", "알림마다 담당자를 정해 두세요. 담당자가 없는 알림은 누구도 보지 않습니다."] },
  ],
  "reading-p95": [
    { heading: "평균 대신 p95", text: ["평균 응답 시간은 느린 요청을 가립니다. p95는 요청 100개 중 95개가 이 시간 안에 끝났다는 뜻이라, 사용자가 겪는 느림에 더 가깝습니다."] },
    { heading: "그래프에서 먼저 볼 것", steps: ["막대가 갑자기 올랐다면 같은 시각의 배포가 있었는지 배포 기록과 맞춰 보세요.", "요청 수가 함께 늘었다면 용량 문제이고, 그대로라면 코드나 외부 서비스 문제입니다.", "오류율도 함께 올랐다면 느린 것이 아니라 실패하고 있는 것입니다."] },
  ],
  postmortem: [
    { heading: "사건이 끝나면", text: ["사건을 종료한 뒤 가능한 한 빨리 사후 분석을 씁니다. 목적은 누구의 잘못인지 찾는 것이 아니라, 같은 일이 다시 생기지 않게 시스템과 절차를 고치는 것입니다."] },
    { heading: "담을 내용", steps: ["개요: 무슨 일이 있었는지 두 문장으로 씁니다.", "영향: 누가, 얼마나, 얼마 동안 영향을 받았는지 씁니다.", "타임라인: 알림이 발생한 때부터 종료까지 분 단위로 정리합니다.", "원인: 직접 원인과, 그것이 가능했던 구조를 함께 씁니다.", "조치와 재발 방지: 담당자와 기한이 있는 항목으로 남깁니다."] },
  ],
  "read-invoice": [
    { heading: "청구서가 만들어지는 방식", text: ["청구서는 매달 1일에 지난달 사용량으로 발행됩니다. 자원 종류별 비용, 네트워크 전송, 지원 플랜이 항목으로 나뉘고, 합계에 부가세 10%가 더해집니다."] },
    { heading: "이번 달 비용이 늘었다면", steps: ["비용과 결제의 사용량에서 종류별 비용의 지난달 대비를 확인합니다.", "프로젝트별 비용에서 가장 큰 자원이 무엇인지 봅니다.", "쓰지 않는 자원은 중지하거나 삭제합니다. 중지한 인스턴스는 디스크 비용만 나옵니다."] },
  ],
  "budget-alerts": [
    { heading: "예산 정하기", text: ["비용과 결제에서 예산 설정을 눌러 월 예산을 정합니다. 예상 비용이 예산의 80%와 100%에 닿으면 메일로 알려드립니다."], note: "예산은 비용을 막는 장치가 아니라 알리는 장치입니다. 예산을 넘겨도 자원은 멈추지 않습니다." },
    { heading: "알림을 받았다면", text: ["먼저 사용량의 프로젝트별 비용에서 갑자기 커진 항목을 찾으세요. 의도한 증가라면 예산을 올리고, 아니라면 자원을 정리하세요."] },
  ],
  roles: [
    { heading: "다섯 가지 역할", steps: ["소유자: 모든 설정과 결제, 작업 공간 삭제. 작업 공간에 한 명입니다.", "관리자: 멤버와 키, 프로젝트를 관리합니다. 결제 정보는 읽기만 합니다.", "개발자: 맡은 프로젝트의 자원과 배포를 다룹니다.", "결제 담당: 비용과 청구서, 결제 수단을 다룹니다.", "읽기 전용: 모든 화면을 볼 수 있지만 아무것도 바꿀 수 없습니다."] },
    { heading: "역할을 정하는 원칙", text: ["필요한 만큼만 주세요. 처음에는 읽기 전용으로 초대하고, 필요해지면 올리는 편이 안전합니다. 역할을 바꾸면 감사 기록에 남습니다."] },
  ],
  "require-mfa": [
    { heading: "모두에게 요구하기", steps: ["보안과 접근의 접근 탭에서 2단계 인증이 꺼진 멤버를 찾습니다.", "인증 요구를 누르면 그 멤버는 다음 로그인 때 설정 화면을 만납니다.", "모든 멤버가 켜면 점검 결과의 MFA 항목이 해결됩니다."] },
    { heading: "복구 코드", text: ["인증 앱을 잃어버렸을 때를 위해 복구 코드를 안전한 곳에 보관하세요. 복구 코드는 한 번만 쓸 수 있습니다."] },
  ],
  "rotate-keys": [
    { heading: "키를 바꾸는 순서", steps: ["새 키를 만듭니다. 권한 범위는 꼭 필요한 만큼만 줍니다.", "키를 쓰는 프로그램의 설정을 새 키로 바꾸고 동작을 확인합니다.", "이전 키를 폐기합니다. 폐기하면 바로 접근이 막힙니다."], note: "키는 만들 때 한 번만 보입니다. 이 화면의 키는 모두 데모용 가짜 값입니다." },
    { heading: "쓰지 않는 키 찾기", text: ["키 목록에서 마지막 사용이 90일을 넘은 키는 따로 표시됩니다. 쓰지 않는 관리자 키는 가장 먼저 폐기할 후보입니다."] },
  ],
  "audit-export": [
    { heading: "기간과 행위자 고르기", text: ["보안과 접근의 감사 기록에서 기간과 행위자, 동작, 결과로 범위를 좁힌 뒤 내보내기를 누릅니다. 화면에 보이는 조건 그대로 내보내집니다."] },
    { heading: "보존 기간", text: ["감사 기록은 플랜에 따라 Team은 90일, Business는 1년, Enterprise는 무기한 보관됩니다. 그보다 오래 필요하다면 정기적으로 내보내 따로 보관하세요."] },
  ],
  "rest-start": [
    { heading: "첫 요청", text: ["API 키를 만든 뒤 Authorization 헤더에 담아 요청합니다. 아래 주소와 키는 예시이며 실제로 동작하지 않습니다."], code: "curl https://api.arcfield.example/v1/projects \\\n  -H \"Authorization: Bearer arc_demo_0000_NOT-A-REAL-KEY\"" },
    { heading: "응답", text: ["목록은 data 배열과 다음 페이지를 가리키는 next로 돌아옵니다."], code: "{\n  \"data\": [\n    { \"id\": \"shipment-tracking\", \"name\": \"배송 추적\", \"region\": \"seoul\" }\n  ],\n  \"next\": null\n}" },
    { heading: "오류", steps: ["401: 키가 없거나 폐기되었습니다.", "403: 키의 권한 범위가 모자랍니다.", "429: 요청이 너무 많습니다. 응답의 Retry-After 초만큼 기다린 뒤 다시 보내세요."] },
  ],
};

const TEXT: Record<string, string> = Object.fromEntries(
  Object.entries(BODIES).map(([slug, sections]) => [slug, sections.map((section) => [section.heading, ...(section.text ?? []), ...(section.steps ?? []), section.note ?? ""].join(" ")).join(" ")]),
);

const Row = ({ doc }: { doc: DocMeta }) => (
  <Stack gap="xs" paddingY="md">
    <Link as={RouterLink} to={`/demo/arcfield/docs/${doc.slug}`} underline="hover">{doc.title}</Link>
    <Text as="span" ink="secondary">{doc.summary}</Text>
    <Text as="span" variant="label" strong={false} ink="tertiary">읽는 데 {doc.minutes}분 · {relative(doc.updated)} 수정</Text>
  </Stack>
);

const Group = ({ title, docs }: { title: string; docs: readonly DocMeta[] }) => (
  <Panel title={title} description={`${docs.length}개의 문서`}>
    <Stack as="ul" paddingX="xl" paddingY="sm">
      {docs.map((doc, index) => (
        <Box as="li" key={doc.slug}>
          {index > 0 ? <Divider aria-hidden /> : null}
          <Row doc={doc} />
        </Box>
      ))}
    </Stack>
  </Panel>
);

export const DocsScreen = () => {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useParam("category", "all", ["all", ...DOC_CATEGORIES]);
  const words = query.trim().toLowerCase();
  const found = DOCS.filter((doc) => (category === "all" || doc.category === category) && (!words || `${doc.title} ${doc.summary} ${doc.category} ${doc.keywords} ${TEXT[doc.slug] ?? ""}`.toLowerCase().includes(words)));
  const grouped = category === "all" && !words;

  return (
    <Stack gap="xl">
      <PageTitle title="문서" description="콘솔을 쓰는 방법을 주제별로 정리했습니다." />
      <Stack gap="md">
        <Box width="measure.xs" maxWidth="full">
          <Field size="lg" shape="pill" type="search" aria-label="문서 검색" placeholder="문서 검색" leading={<SearchIcon />} clearable value={query} onChange={(event) => setQuery(event.target.value)} />
        </Box>
        <Segmented label="주제" value={category} onChange={setCategory} options={[{ id: "all", label: "전체" }, ...DOC_CATEGORIES.map((entry) => ({ id: entry, label: entry }))]} />
      </Stack>
      {found.length === 0 ? (
        <Panel><EmptyState title="찾는 문서가 없습니다" action={<Button variant="hairline" onClick={() => { setQuery(""); setCategory("all"); }}>검색 초기화</Button>}>다른 낱말로 찾아보거나, 도움말 메뉴의 지원 문의로 물어보세요.</EmptyState></Panel>
      ) : grouped ? (
        <Grid columns={{ base: "minmax(0, 1fr)", xl: "repeat(2, minmax(0, 1fr))" }} gap="xl" align="start">
          {DOC_CATEGORIES.map((entry) => <Group key={entry} title={entry} docs={found.filter((doc) => doc.category === (entry as DocCategory))} />)}
        </Grid>
      ) : <Group title={category === "all" ? `“${query.trim()}” 검색 결과` : category} docs={found} />}
    </Stack>
  );
};

const Part = ({ section, index }: { section: Section; index: number }) => (
  <Stack as="section" id={`s${index + 1}`} gap="md">
    <Text as="h2" variant="heading">{section.heading}</Text>
    {section.text?.map((paragraph) => <Text key={paragraph} as="p" variant="lead">{paragraph}</Text>)}
    {section.steps ? (
      <Stack as="ol" gap="sm">
        {section.steps.map((step, order) => (
          <Inline as="li" key={step} gap="md" align="start">
            <Badge size="sm" variant="soft">{order + 1}</Badge>
            <Text as="span" variant="lead">{step}</Text>
          </Inline>
        ))}
      </Stack>
    ) : null}
    {section.code ? (
      <Surface fill="sunken" radius="md" padding="md" overflowX="auto">
        <Stack>{section.code.split("\n").map((line, order) => <Text key={order} as="span" family="mono" variant="caption">{line.replace(/^ +/, (spaces) => " ".repeat(spaces.length)) || " "}</Text>)}</Stack>
      </Surface>
    ) : null}
    {section.note ? <Notice accent="info" title="참고">{section.note}</Notice> : null}
  </Stack>
);

const Helpful = () => {
  const { notify } = useStore();
  const [answer, setAnswer] = useState<"yes" | "no" | null>(null);
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const send = async () => {
    setBusy(true);
    await wait(600);
    setSent(true);
    setBusy(false);
    notify("success", "의견을 보냈습니다", "고맙습니다. 문서를 고칠 때 참고하겠습니다.");
  };
  if (sent || answer === "yes") {
    return (
      <Stack gap="sm">
        <Text as="p" strong>{answer === "yes" ? "도움이 되었다니 다행입니다." : "의견을 보냈습니다."}</Text>
        {answer === "yes" && !sent ? <Box><Button size="sm" variant="ghost" loading={busy} loadingLabel="보내는 중" onClick={send}>의견 보내기</Button></Box> : <Text as="p" ink="tertiary">고맙습니다.</Text>}
      </Stack>
    );
  }
  return (
    <Stack gap="md">
      <Text as="p" strong>이 문서가 도움이 되었나요?</Text>
      {answer === "no" ? (
        <Stack gap="md" align="start">
          <FormField label="무엇이 아쉬웠나요?">
            <Textarea rows={3} value={text} placeholder="빠진 내용이나 헷갈린 부분을 적어주세요." onChange={(event) => setText(event.target.value)} />
          </FormField>
          <Inline gap="sm"><Button variant="ghost" onClick={() => setAnswer(null)}>취소</Button><Button loading={busy} loadingLabel="보내는 중" onClick={send}>보내기</Button></Inline>
        </Stack>
      ) : (
        <Inline gap="sm"><Button variant="hairline" onClick={() => setAnswer("yes")}>도움이 되었습니다</Button><Button variant="hairline" onClick={() => setAnswer("no")}>아쉬웠습니다</Button></Inline>
      )}
    </Stack>
  );
};

export const ArticleScreen = () => {
  const { slug = "" } = useParams();
  const index = DOCS.findIndex((entry) => entry.slug === slug);
  const doc = DOCS[index];
  const body = BODIES[slug];

  if (!doc || !body) {
    return (
      <Stack gap="xl">
        <PageTitle title="문서" back={{ to: "/demo/arcfield/docs", label: "문서" }} />
        <Panel><EmptyState title="문서를 찾을 수 없습니다" action={<Button as={RouterLink} to="/demo/arcfield/docs" variant="hairline">문서 목록으로</Button>}>주소가 맞지 않거나 옮겨진 문서입니다.</EmptyState></Panel>
      </Stack>
    );
  }

  const related = DOCS.filter((entry) => entry.category === doc.category && entry.slug !== slug).slice(0, 3);
  const previous = DOCS[index - 1];
  const next = DOCS[index + 1];

  return (
    <Stack gap="xl">
      <PageTitle
        title={doc.title}
        back={{ to: "/demo/arcfield/docs", label: "문서" }}
        description={doc.summary}
        aside={<Inline gap="sm" wrap><Badge variant="soft">{doc.category}</Badge><Text as="span" variant="label" strong={false} ink="tertiary">읽는 데 {doc.minutes}분 · {relative(doc.updated)} 수정</Text></Inline>}
      />
      <Grid columns={{ base: "minmax(0, 1fr)", xl: "minmax(0, 46rem) 15rem" }} gap="xl" align="start">
        <Panel>
          <Stack gap="2xl" padding="2xl" maxWidth="measure.md">
            {body.map((section, order) => <Part key={section.heading} section={section} index={order} />)}
            <Divider />
            <Helpful />
          </Stack>
        </Panel>
        <Surface as="nav" aria-label="이 문서의 구성" elevation="sticky" top="lg" hideBelow="xl">
          <Stack gap="lg">
            <Stack gap="sm">
              <Text as="span" variant="label" strong={false} ink="tertiary">이 문서의 구성</Text>
              {body.map((section, order) => <Link key={section.heading} href={`#s${order + 1}`} underline="hover">{section.heading}</Link>)}
            </Stack>
            {related.length > 0 ? (
              <Stack gap="sm">
                <Text as="span" variant="label" strong={false} ink="tertiary">같은 주제의 문서</Text>
                {related.map((entry) => <Link key={entry.slug} as={RouterLink} to={`/demo/arcfield/docs/${entry.slug}`} underline="hover">{entry.title}</Link>)}
              </Stack>
            ) : null}
          </Stack>
        </Surface>
      </Grid>
      <Inline justify="between" gap="md" wrap>
        {previous ? <Button as={RouterLink} to={`/demo/arcfield/docs/${previous.slug}`} variant="hairline"><ArrowLeftIcon />{previous.title}</Button> : <Box />}
        {next ? <Button as={RouterLink} to={`/demo/arcfield/docs/${next.slug}`} variant="hairline">{next.title}<ArrowRightIcon /></Button> : null}
      </Inline>
    </Stack>
  );
};
