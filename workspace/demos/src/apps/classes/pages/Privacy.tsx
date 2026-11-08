import { useEffect, useState, type ReactNode } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";

import { Box, Button, Divider, Grid, IconButton, Inline, Stack, Surface, Text } from "@studio-baeks/paper-ui";

import { AppShell, Glyph, PageHeader, TopBar, useToast, type GlyphName } from "../../../kit";
import { path, useClasses } from "../state";

const UPDATED = "2026년 11월 4일";
const CONTACT = "privacy@classes.example";

const P = ({ children }: { children: ReactNode }) => <Text variant="lead">{children}</Text>;
const B = ({ children }: { children: ReactNode }) => <Text as="span" variant="lead" strong>{children}</Text>;
const Note = ({ children }: { children: ReactNode }) => <Text variant="caption" ink="tertiary">{children}</Text>;

const List = ({ items }: { items: readonly ReactNode[] }) => (
  <Stack as="ul" gap="sm">
    {items.map((item, index) => (
      <Inline as="li" key={index} gap="sm" align="start">
        <Text as="span" variant="lead" ink="tertiary" aria-hidden>•</Text>
        <Box minWidth={0}><Text variant="lead">{item}</Text></Box>
      </Inline>
    ))}
  </Stack>
);

type Entry = { name: string; body: ReactNode; note?: ReactNode };

const Entries = ({ label, rows, tracks = "10rem minmax(0, 1fr)" }: { label: string; rows: readonly Entry[]; tracks?: string }) => (
  <Stack as="ul" aria-label={label}>
    {rows.map((row) => (
      <Surface as="li" key={row.name} border="top" paddingY="md">
        <Grid columns={{ base: 1, md: tracks }} gap="sm" align="start">
          <Text strong>{row.name}</Text>
          <Stack gap="xs" minWidth={0}>
            <Text>{row.body}</Text>
            {row.note ? <Text variant="caption" ink="tertiary">{row.note}</Text> : null}
          </Stack>
        </Grid>
      </Surface>
    ))}
  </Stack>
);

type Stored = { key: string; holds: string; keeps: string };
const STORAGE: readonly Stored[] = [
  { key: "classes:session", holds: "로그인 표시, 아이디, 권한, 학교 계정 연결 여부. 비밀번호는 없습니다.", keeps: "로그아웃하면 로그인 표시만 꺼지고, 나머지는 저장 공간을 비울 때까지 남습니다." },
  { key: "classes:term", holds: "보고 있는 학기", keeps: "저장 공간을 비울 때까지" },
  { key: "classes:home-timetable", holds: "홈에서 고른 보기(지금 시간표 또는 수강 변경 계획)", keeps: "다시 고르거나 저장 공간을 비울 때까지" },
  { key: "classes:major", holds: "내 전공 트랙(또는 미정)과 답했는지 여부", keeps: "설정에서 바꾸거나 저장 공간을 비울 때까지" },
  { key: "classes:major-snoozed", holds: "전공을 묻는 창을 미룬 날짜", keeps: "그 날이 지나 다시 답할 때까지" },
  { key: "classes:friends", holds: "친구로 넣은 학번 목록", keeps: "친구를 지울 때까지" },
  { key: "classes:personal-events", holds: "내 일정", keeps: "직접 지울 때까지" },
  { key: "classes:shared-events", holds: "매니저가 학사일정에 직접 넣은 일정", keeps: "매니저가 지울 때까지" },
  { key: "classes:event-requests", holds: "일정 제안과 처리 결과, 제안한 사람의 이름", keeps: "저장 공간을 비울 때까지" },
  { key: "classes:trade-config", holds: "수강 정정 탐색의 스위치, 마감일, 학기", keeps: "관리자가 바꿀 때까지" },
  { key: "classes:trade-plan", holds: "수강 변경 계획과 트레이드 조합", keeps: "직접 지울 때까지" },
  { key: "classes:zamong", holds: "자몽에 적은 이수 기록(과목, 학기, 평어)", keeps: "직접 지울 때까지" },
  { key: "classes:zamong-hours", holds: "자몽에 직접 적은 시수", keeps: "직접 고칠 때까지" },
  { key: "classes:zamong-seeded", holds: "미리 만든 이수 기록을 불러올지 답했는지 여부", keeps: "저장 공간을 비울 때까지" },
  { key: "classes:materials", holds: "자료실의 자료: 제목, 파일 이름과 크기, 검수 상태, 올린 계정과 학번", keeps: "올린 사람이 철회하거나 관리자가 지울 때까지" },
  { key: "classes:devices", holds: "설정 화면의 로그인한 기기 목록: 기기 이름과 마지막으로 쓴 시각(지어낸 값)", keeps: "기기를 끊을 때까지" },
  { key: "classes:ask-model", holds: "Ask에서 고른 모델 이름", keeps: "저장 공간을 비울 때까지" },
  { key: "classes:admin:…", holds: "관리 화면의 시연용 목록: 계정, 로그인한 기기, 데이터 회차, 백업, Ask의 기억, 대체 시간표, 고친 이름. 비밀번호는 없습니다.", keeps: "관리자가 지울 때까지" },
];
const STORAGE_TRACKS = "minmax(0, 12.5rem) minmax(0, 1fr) minmax(0, 12rem)";

const StorageTable = () => (
  <Stack>
    <Grid columns={{ base: 1, md: STORAGE_TRACKS }} columnGap="md" paddingY="sm" hideBelow="md" aria-hidden>
      <Text as="span" variant="label" strong={false} ink="tertiary">키</Text>
      <Text as="span" variant="label" strong={false} ink="tertiary">담는 것</Text>
      <Text as="span" variant="label" strong={false} ink="tertiary">남는 기간</Text>
    </Grid>
    <Stack as="ul" aria-label="브라우저 저장 공간의 키">
      {STORAGE.map((row) => (
        <Surface as="li" key={row.key} border="top" paddingY="md">
          <Grid columns={{ base: 1, md: STORAGE_TRACKS }} rowGap="xs" columnGap="md" align="start">
            <Text as="span" family="mono" variant="caption" strong>{row.key}</Text>
            <Text>{row.holds}</Text>
            <Text variant="caption" ink="tertiary">{row.keeps}</Text>
          </Grid>
        </Surface>
      ))}
    </Stack>
  </Stack>
);

const Contact = () => {
  const toast = useToast();
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT);
      toast("주소를 복사했습니다");
    } catch {
      toast("복사하지 못했습니다. 주소를 직접 선택해 주세요", { tone: "error" });
    }
  };
  return (
    <Surface fill="raised" border radius="lg" padding="lg">
      <Stack gap="md">
        <Stack gap="xs">
          <Text as="span" variant="label" strong={false} ink="tertiary">개인정보 보호책임자 · 운영자</Text>
          <Text as="span" variant="subheading">Class Explorer 시연 운영자</Text>
        </Stack>
        <Inline gap="sm" align="center" wrap>
          <Text as="span" family="mono">{CONTACT}</Text>
          <Button variant="hairline" size="sm" onClick={() => { void copy(); }}><Glyph name="copy" />복사</Button>
        </Inline>
        <Note>이 주소는 시연용이라 실제로 메일을 받지 않습니다.</Note>
      </Stack>
    </Surface>
  );
};

const ITEMS: readonly Entry[] = [
  { name: "계정", body: "아이디와 권한 등급(일반·매니저·관리자). 비밀번호는 저장하지 않습니다.", note: "수집 방법 · 로그인할 때, 그리고 관리자가 계정을 만들 때" },
  { name: "본인 확인", body: "학교 구글 계정 주소와 학번", note: "수집 방법 · 학교 구글 계정을 한 번 연결할 때" },
  { name: "접속 기록", body: "로그인한 기기의 종류, 브라우저와 운영체제 이름, 접속 주소, 마지막으로 쓴 시각", note: "수집 방법 · 로그인할 때 자동으로" },
  { name: "학사 정보", body: "이름, 학번, 수강 과목과 분반, 시간표, 담당 교사, 강의실", note: "수집 방법 · 학교 학사 시스템에서 학기 단위로" },
  { name: "시험 응시 정보", body: "시험별 응시 과목, 일시, 시험실", note: "수집 방법 · 학교가 공지한 시험 시간표에서 시험 회차마다" },
  { name: "이용자 입력", body: "이수 기록(과목·학기·평어), 개인 일정, 친구 목록, 수강 변경 계획, 학사일정 제안", note: "수집 방법 · 이용자가 화면에서 직접" },
  { name: "전공", body: "심화필수 전공 트랙(수학·정보과학·물리학·지구과학·화학·생물학 중 하나, 또는 미정)과 답했는지 여부", note: "수집 방법 · 전공을 묻는 창이나 설정 화면에서 직접 고를 때" },
  { name: "자료실 제출", body: "파일의 이름·형식·크기, 제목과 설명, 연결한 학기와 과목, 올린 계정, 검수 상태", note: "수집 방법 · 이용자가 자료를 올릴 때" },
  { name: "Ask 질문", body: "입력한 질문과 같은 대화의 앞선 질문·답. 저장하지 않습니다.", note: "수집 방법 · Ask에 질문할 때" },
];

const KEEP: readonly Entry[] = [
  { name: "계정 정보", body: "계정을 지울 때까지. 아이디, 권한, 학번, 구글 계정 주소가 여기에 듭니다." },
  { name: "이용자가 입력한 기록", body: "계정을 지울 때까지. 이수 기록, 일정, 친구, 계획, 제안은 화면에서 직접 지울 수 있고, 계정을 지우면 함께 지웁니다." },
  { name: "전공과 답한 때", body: "계정을 지울 때까지. 설정 화면에서 언제든 바꾸거나 미정으로 되돌릴 수 있습니다." },
  { name: "자료실 제출", body: "올린 사람이 철회하거나 관리자가 지울 때까지. 계정을 지우면 그 계정이 올린 자료도 함께 지웁니다." },
  { name: "접속 기록", body: "마지막으로 쓴 지 30일이 지나면 저절로 끊고 지웁니다. 이용자가 직접 끊으면 바로 지웁니다." },
  { name: "학사 정보", body: "학기 단위로 보관합니다. 받을 때마다 덮어쓰지 않고 회차로 쌓아 두어서, 지난 시간표를 되돌려 볼 수 있습니다." },
  { name: "시험 응시 정보", body: "시험 회차 단위로 보관합니다. 같은 회차를 다시 받으면 그 회차만 바꿉니다." },
  { name: "공지에서 뽑은 사실", body: "서비스를 운영하는 동안 보관합니다. 원문이 지워지면 그 글에서 뽑은 사실도 지웁니다." },
  { name: "데이터베이스 백업", body: "1년이 지나면 저절로 지웁니다. 백업에는 로그인한 기기의 정보를 넣지 않습니다." },
  { name: "Ask 질문", body: "저장하지 않습니다. 질문과 답은 이 탭의 메모리에만 있고, 새로고침하거나 ‘새 대화’를 누르면 사라집니다." },
];

const SEEN: readonly Entry[] = [
  { name: "로그인한 이용자", body: "같은 학교 구성원의 시간표와 분반 명단, 학사일정, 승인된 자료(올린 사람은 나오지 않습니다). 친구 화면은 과목 이름 없이 언제 비는지만 보여 줍니다." },
  { name: "매니저", body: "위의 것에 더해 학사일정 제안과, 제안한 사람의 이름" },
  { name: "관리자", body: "위의 것에 더해 계정과 로그인한 기기의 목록, 자료를 검수할 때 올린 사람의 아이디와 학번, 전공 조사의 인원 수. 누가 어떤 전공을 골랐는지는 보지 않습니다." },
  { name: "로그인하지 않은 사람", body: "소개 화면과 이 방침, 로그인 화면뿐입니다. 이름이나 시간표는 하나도 보이지 않습니다." },
];

const OUTSIDE: readonly Entry[] = [
  { name: "학교 구글 계정", body: "연결 화면은 모양만 흉내 냅니다. 구글에 요청을 보내지 않고, 학교 계정 주소를 받지도 않습니다." },
  { name: "학교 학사 시스템", body: "관리 화면의 ‘다시 받기’는 시간만 흉내 냅니다. 아무것도 받아 오지 않습니다." },
  { name: "AI 언어 모델", body: "Ask의 답은 이 브라우저 안에서 만듭니다. 질문이 외부 AI 사업자에게 가지 않습니다." },
  { name: "글꼴 전송", body: "글꼴(Pretendard) 파일은 공개 전송망(jsDelivr)에서 받아 옵니다. 화면을 열 때마다 접속 주소와 브라우저 정보가 그 전송망에 닿을 수 있습니다. 글꼴 요청을 막아도 화면은 시스템 글꼴로 동작합니다." },
];

const REMEDY: readonly Entry[] = [
  { name: "개인정보 침해신고센터", body: "국번 없이 118 · privacy.kisa.or.kr" },
  { name: "개인정보 분쟁조정위원회", body: "1833-6972 · kopico.go.kr" },
  { name: "대검찰청 사이버수사과", body: "국번 없이 1301 · spo.go.kr" },
  { name: "경찰청 사이버수사국", body: "국번 없이 182 · ecrm.police.go.kr" },
];

type Section = { id: string; short: string; title: string; body: ReactNode };

const DOC: readonly Section[] = [
  {
    id: "items",
    short: "처리하는 항목",
    title: "처리하는 개인정보 항목",
    body: (
      <>
        <P>서비스는 아래 항목을 처리합니다. 학교 학사 시스템에서 받아 오는 항목은 이용자가 직접 입력하지 않으며, 그 출처는 3항에 적었습니다.</P>
        <Entries label="처리하는 개인정보 항목" rows={ITEMS} />
        <P>결제 정보나 주민등록번호처럼 민감한 항목은 받지 않습니다. 비밀번호는 입력하는 순간에만 쓰고 어디에도 남기지 않습니다.</P>
      </>
    ),
  },
  {
    id: "purposes",
    short: "처리 목적",
    title: "개인정보의 처리 목적",
    body: (
      <List
        items={[
          <><B>로그인과 본인 확인</B> — 계정을 구별하고, 그 계정이 어느 학번의 사람인지 확인합니다. 학번을 확인해야 이수 기록처럼 본인만의 정보를 다룰 수 있습니다.</>,
          <><B>시간표 조회</B> — 수업, 담당 교사, 강의실, 빈 강의실을 찾아 보여 줍니다.</>,
          <><B>개인 기록 보관</B> — 이수 기록, 개인 일정, 친구 목록, 수강 변경 계획을 계정에 묶어 둡니다.</>,
          <><B>전공에 맞춘 안내</B> — 고른 전공 트랙으로 학사일정에서 내 학년과 전공에 해당하는 일정만 거르고, Ask가 내 전공이 대상인 공지를 가려 답하게 합니다. 아직 고르지 않았다면 수강 이력으로 짐작한 트랙을 추천으로만 보여 주고, 그 값은 저장하지 않습니다. 관리자는 트랙별 인원 수만 보며, 누가 무엇을 골랐는지는 보지 않습니다.</>,
          <><B>접속 기기 관리</B> — 로그인해 둔 기기를 이용자가 직접 확인하고 끊을 수 있게 합니다. 낯선 기기를 알아채는 수단이기도 합니다.</>,
          <><B>자료 공유</B> — 이용자가 올린 강의 자료를 관리자가 검수한 뒤 로그인한 구성원이 볼 수 있게 합니다.</>,
          <><B>시험 시간표 안내</B> — 이용자 본인의 시험 일시와 시험실을 보여 줍니다.</>,
          <><B>공지 정리와 Ask의 기억</B> — 학교 공지에서 규칙, 일정, 대상 같은 사실을 짧은 문장으로 뽑아 두고, Ask가 질문에 맞는 사실을 찾아 답에 씁니다. 사실에는 출처 공지가 붙고, 이름·학번·연락처는 남기지 않습니다.</>,
          <><B>Ask 질문 답변</B> — 질문에 답하려고 시간표, 학사일정, 급식, 정리해 둔 사실을 찾아 씁니다. 답이 ‘내 일정’처럼 본인에게 맞도록, 질문한 사람의 이름, 학번, 학년, 전공 트랙, 이번 학기 수강 과목을 함께 읽습니다.</>,
          <><B>서비스 운영과 보안</B> — 접속 기록은 장애와 오용을 알아보는 데만 씁니다.</>,
        ]}
      />
    ),
  },
  {
    id: "sources",
    short: "수집 출처",
    title: "정보주체 이외로부터 수집한 개인정보의 출처",
    body: (
      <>
        <P>이름, 학번, 수강 내역, 시간표는 이용자가 직접 입력한 것이 아니라 학교 학사 시스템에서 가져옵니다. 시험 응시 정보는 학교가 공지한 시험 시간표 파일에서, 학교 공지는 학교 게시판의 공개 글에서 가져옵니다.</P>
        <P>이 시연에서는 이 모든 값을 지어내어 미리 넣어 두었고, 실제로 어디에서도 가져오지 않습니다. 정보주체가 요구하면 수집 출처와 처리 목적을 알려 드립니다. 요구는 9항의 연락처로 해 주세요.</P>
      </>
    ),
  },
  {
    id: "retention",
    short: "보유 기간",
    title: "개인정보의 보유 기간",
    body: <Entries label="개인정보의 보유 기간" rows={KEEP} tracks="12rem minmax(0, 1fr)" />,
  },
  {
    id: "sharing",
    short: "누가 무엇을 보는가",
    title: "누가 무엇을 보는가와 제3자 제공",
    body: (
      <>
        <P>서비스는 이용자의 개인정보를 <B>제3자에게 제공하지 않습니다.</B> 법령에 따라 제출할 의무가 생기거나 수사기관이 적법한 절차로 요구하는 경우만 예외입니다.</P>
        <P>같은 학교 구성원끼리는 서비스 안에서 서로의 시간표를 조회할 수 있습니다. 이것은 서비스의 기능이고, 로그인한 사람에게만 열립니다. 무엇을 누가 보는지는 아래와 같습니다.</P>
        <Entries label="누가 무엇을 보는가" rows={SEEN} />
      </>
    ),
  },
  {
    id: "outside",
    short: "외부 사업자",
    title: "외부 사업자와 국외 이전",
    body: (
      <>
        <P>이 시연은 개인정보를 외부 사업자에게 맡기거나 해외로 보내지 않습니다. 서비스가 스스로 보내는 요청은 없고, 아래는 바깥과 닿을 수 있는 자리를 하나씩 짚은 것입니다.</P>
        <Entries label="외부 사업자" rows={OUTSIDE} />
      </>
    ),
  },
  {
    id: "storage",
    short: "브라우저 저장 공간",
    title: "브라우저 저장 공간에 남는 값",
    body: (
      <>
        <P>서비스는 쿠키를 쓰지 않습니다. 대신 브라우저의 저장 공간(localStorage)에 아래 값을 두며, 광고나 분석에는 쓰지 않습니다.</P>
        <StorageTable />
        <P>Ask의 대화는 저장 공간에 두지 않고 화면의 메모리에만 있다가, 새로고침하거나 ‘새 대화’를 누르면 사라집니다. 모든 키 앞에는 <B>paper-apps:</B>가 붙고, 테마도 같은 저장 공간에 남습니다.</P>
      </>
    ),
  },
  {
    id: "rights",
    short: "정보주체의 권리",
    title: "정보주체의 권리와 행사 방법",
    body: (
      <>
        <P>이용자는 언제든 자신의 개인정보에 대해 열람, 정정, 삭제, 처리정지를 요구할 수 있습니다. 만 14세 미만 아동의 개인정보는 법정대리인의 동의를 받아 처리하며, 법정대리인이 같은 권리를 행사할 수 있습니다.</P>
        <List
          items={[
            "이수 기록, 개인 일정, 친구 목록, 전공은 화면에서 직접 고치거나 지울 수 있습니다.",
            "로그인해 둔 기기는 설정 화면에서 직접 끊을 수 있습니다.",
            "브라우저의 사이트 데이터를 지우면 이 시연이 남긴 값이 모두 사라집니다.",
            "계정 삭제처럼 화면에서 할 수 없는 요구는 9항의 연락처로 보내 주세요. 접수한 날부터 10일 안에 처리하고 결과를 알립니다. 계정을 지우면 그 계정의 이수 기록, 일정, 친구, 계획, 제안, 전공도 함께 지웁니다.",
          ]}
        />
      </>
    ),
  },
  {
    id: "contact",
    short: "보호책임자",
    title: "개인정보 보호책임자",
    body: (
      <>
        <P>서비스의 개인정보 처리에 관한 일을 맡아 책임지고, 문의와 불만과 피해 구제 요청을 접수합니다.</P>
        <Contact />
      </>
    ),
  },
  {
    id: "safety",
    short: "안전성 확보 조치",
    title: "안전성 확보 조치",
    body: (
      <List
        items={[
          "서버가 없습니다. 이용자가 입력한 값은 이 브라우저의 저장 공간에만 남고, 운영자도 볼 수 없습니다.",
          "비밀번호는 입력한 순간에만 쓰고 저장하지 않습니다. 이 시연의 로그인 화면은 아무 값이나 받습니다.",
          "관리 화면과 자료 검수는 관리자 권한을 가진 계정에만 열리고, 권한이 없으면 첫 화면으로 돌려보냅니다.",
          "학번은 관리자가 자료를 검수할 때만 보이고, 전공은 인원 수로만 모아 봅니다.",
          "로그인하지 않으면 이 방침과 소개, 로그인 화면 말고는 열리지 않습니다.",
          "화면에 보이는 이름, 학번, 시간표는 모두 지어낸 값이라 실제 사람의 정보가 들어 있지 않습니다.",
        ]}
      />
    ),
  },
  {
    id: "disposal",
    short: "파기",
    title: "개인정보의 파기",
    body: (
      <P>보유 기간이 지나거나 처리 목적이 끝난 정보는 지체 없이 지웁니다. 이 시연에서는 브라우저의 사이트 데이터를 지우면 모두 사라지고, 각 화면에서 직접 지울 수도 있습니다. 백업은 1년, 접속 기록은 30일이 지나면 저절로 지웁니다.</P>
    ),
  },
  {
    id: "remedy",
    short: "권익침해 구제",
    title: "권익침해 구제 방법",
    body: (
      <>
        <P>개인정보 침해로 신고나 상담이 필요하면 아래 기관에 문의할 수 있습니다.</P>
        <Entries label="권익침해 구제 기관" rows={REMEDY} tracks="14rem minmax(0, 1fr)" />
        <Note>실제 기관의 연락처입니다.</Note>
      </>
    ),
  },
  {
    id: "changes",
    short: "방침의 변경",
    title: "방침의 변경",
    body: <P>이 방침을 바꾸면 이 화면에 시행일과 함께 고쳐 싣고, 고쳐 싣는 날부터 바로 시행합니다.</P>,
  },
];

const GLANCE: readonly { glyph: GlyphName; text: string }[] = [
  { glyph: "hard-drive", text: "서버가 없습니다. 입력한 값은 이 브라우저의 저장 공간에만 남습니다." },
  { glyph: "shield-check", text: "학교 구글 계정 연결은 화면만 흉내 냅니다. 구글에 요청을 보내지 않습니다." },
  { glyph: "message-circle", text: "Ask의 대화는 이 탭의 메모리에만 있다가 새로고침하면 사라집니다." },
];

const Contents = ({ active }: { active: string }) => (
  <Surface as="nav" aria-label="목차" elevation="sticky" top="lg" overflowY="auto" hideBelow="lg">
    <Stack gap="xs">
      <Box paddingX="md" paddingY="xs"><Text as="span" variant="label" strong={false} ink="tertiary">목차</Text></Box>
      {DOC.map((section, index) => (
        <Button key={section.id} as="a" href={`#${section.id}`} variant="ghost" size="sm" fontSize="body" fullWidth justify="start" aria-current={active === section.id ? "location" : undefined}>
          <Text as="span" ink="inherit" truncate>{index + 1}. {section.short}</Text>
        </Button>
      ))}
    </Stack>
  </Surface>
);

export const PrivacyPage = () => {
  const { session } = useClasses();
  const { hash } = useLocation();
  const [active, setActive] = useState(DOC[0]?.id ?? "");
  const back = session.signedIn ? path("/") : path("/welcome");

  useEffect(() => {
    const id = hash.slice(1).split(/[&?]/)[0];
    if (id) document.getElementById(id)?.scrollIntoView();
  }, [hash]);

  useEffect(() => {
    const update = () => {
      let current = DOC[0]?.id ?? "";
      for (const section of DOC) {
        const element = document.getElementById(section.id);
        if (element && element.getBoundingClientRect().top <= 160) current = section.id;
      }
      setActive(current);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <AppShell
      kind="page"
      name="Class Explorer"
      top={
        <Stack align="center">
          <Box width="full" maxWidth="container.content">
            <TopBar
              start={
                <>
                  <Button as={RouterLink} to={back} variant="ghost" size="sm"><Glyph name="arrow-left" />돌아가기</Button>
                  <Inline gap="sm" align="center">
                    <IconButton as={RouterLink} to={path("/welcome")} size="xs" aria-label="Class Explorer 소개 화면"><Glyph name="graduation-cap" /></IconButton>
                    <Text as="span" variant="subheading" truncate>Class Explorer</Text>
                  </Inline>
                </>
              }
              end={<Button as="a" href={`#contact`} variant="ghost" size="sm"><Glyph name="mail" />문의</Button>}
            />
          </Box>
        </Stack>
      }
    >
      <Stack align="center">
        <Box width="full" maxWidth="container.content">
          <Grid columns={{ base: "minmax(0, 42rem)", lg: "14rem minmax(0, 42rem)" }} justify="center" gap="3xl" align="start">
            <Contents active={active} />
            <Stack as="article" gap="3xl" maxWidth="measure.lg" paddingY="xl">
              <PageHeader
                eyebrow="Class Explorer"
                title="개인정보처리방침"
                description="Class Explorer는 학교 시간표와 학사일정을 찾아보는 서비스를 본떠 만든 시연입니다. 이 방침은 그 시연이 무엇을, 왜, 어디에 얼마나 남기는지 적은 것입니다."
                meta={<Text as="span" ink="tertiary">시행일 {UPDATED}</Text>}
              />

              <Surface as="section" aria-label="한눈에 보기" fill="raised" border radius="lg" padding="lg">
                <Stack gap="md">
                  <Text as="span" variant="label" strong={false} ink="tertiary">한눈에 보기</Text>
                  <Stack as="ul" gap="md">
                    {GLANCE.map((item) => (
                      <Inline as="li" key={item.text} gap="md" align="start">
                        <Glyph name={item.glyph} ink="secondary" />
                        <Box minWidth={0}><Text variant="lead">{item.text}</Text></Box>
                      </Inline>
                    ))}
                  </Stack>
                </Stack>
              </Surface>

              {DOC.map((section, index) => (
                <Stack as="section" key={section.id} id={section.id} aria-labelledby={`${section.id}-title`} gap="lg">
                  <Text as="h2" variant="heading" id={`${section.id}-title`}>{index + 1}. {section.title}</Text>
                  {section.body}
                </Stack>
              ))}

              <Stack gap="md">
                <Divider />
                <Inline justify="between" align="center" gap="md" wrap>
                  <Text as="span" variant="caption" ink="tertiary">이 방침은 {UPDATED}부터 적용됩니다.</Text>
                  <Text as="span" variant="caption" ink="tertiary">Class Explorer · KSA 수업 탐색 시연</Text>
                </Inline>
              </Stack>
            </Stack>
          </Grid>
        </Box>
      </Stack>
    </AppShell>
  );
};
