import { useMemo, useState } from "react";
import { Badge, Box, Button, Checkbox, Divider, Field, Icon, IconButton, Inline, PageHeader, Stack, Text } from "@studio-baeks/paper-ui";
import * as s from "./Demo.css";

type Task = { id: number; code: string; title: string; project: string; status: "진행 중" | "검토" | "할 일" | "완료"; priority: "긴급" | "높음" | "보통" | "낮음"; owner: string; due: string };
const initialTasks: Task[] = [
  { id: 1, code: "WEB-24", title: "랜딩 페이지 정보 구조 확정", project: "기획", status: "진행 중", priority: "긴급", owner: "재원", due: "오늘" },
  { id: 2, code: "WEB-23", title: "메인 비주얼 시안 검토", project: "디자인", status: "검토", priority: "높음", owner: "민주", due: "오늘" },
  { id: 3, code: "WEB-22", title: "모바일 내비게이션 프로토타입", project: "디자인", status: "할 일", priority: "높음", owner: "지현", due: "9월 28일" },
  { id: 4, code: "WEB-21", title: "제품 소개 카피 초안 작성", project: "콘텐츠", status: "진행 중", priority: "보통", owner: "재원", due: "9월 29일" },
  { id: 5, code: "WEB-20", title: "분석 이벤트 목록 정리", project: "개발", status: "할 일", priority: "보통", owner: "도윤", due: "9월 30일" },
  { id: 6, code: "WEB-19", title: "컴포넌트 간격 검토", project: "디자인", status: "완료", priority: "낮음", owner: "민주", due: "9월 24일" },
];

const Glyph = ({ name }: { name: "grid" | "check" | "inbox" | "layers" | "search" | "calendar" | "plus" | "more" | "chevron" | "spark" | "arrow" | "clock" | "filter" }) => {
  const paths = {
    grid: <><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" /></>,
    check: <><circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16.5 9"/></>, inbox: <><path d="M4 5h16v14H4z"/><path d="M4 13h4l2 2h4l2-2h4"/></>,
    layers: <><path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 16l9 5 9-5"/></>,
    search: <><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/></>, calendar: <><rect x="4" y="5" width="16" height="16" rx="2"/><path d="M8 3v4m8-4v4M4 10h16"/></>,
    plus: <path d="M12 5v14M5 12h14"/>, more: <><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></>,
    chevron: <path d="m9 18 6-6-6-6"/>, spark: <path d="m12 3 2 7 7 2-7 2-2 7-2-7-7-2 7-2 2-7Z"/>, arrow: <><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>, filter: <path d="M4 5h16l-6.5 7v5l-3 2v-7L4 5Z"/>,
  };
  return <Icon size="body">{paths[name]}</Icon>;
};

const statusAccent = (status: Task["status"]) => status === "진행 중" ? "info" : status === "검토" ? "warning" : status === "완료" ? "success" : "primary";

export const Demo = () => {
  const [tasks, setTasks] = useState(initialTasks);
  const [filter, setFilter] = useState("전체");
  const [query, setQuery] = useState("");
  const [showDone, setShowDone] = useState(false);
  const [notice, setNotice] = useState("");
  const doneCount = tasks.filter((task) => task.status === "완료").length;
  const visibleTasks = useMemo(() => tasks.filter((task) => (filter === "전체" || task.status === filter)
    && `${task.title} ${task.code} ${task.owner}`.toLowerCase().includes(query.toLowerCase())
    && (showDone || task.status !== "완료")), [tasks, filter, query, showDone]);
  const toggleTask = (task: Task) => {
    setTasks((current) => current.map((item) => item.id === task.id ? { ...item, status: item.status === "완료" ? "할 일" : "완료" } : item));
    setNotice(task.status === "완료" ? "작업을 다시 열었습니다" : "작업을 완료했습니다");
    window.setTimeout(() => setNotice(""), 2200);
  };
  const addTask = () => {
    const title = window.prompt("새 작업 이름을 입력하세요");
    if (!title?.trim()) return;
    setTasks((current) => [{ id: Date.now(), code: `WEB-${24 + current.length}`, title: title.trim(), project: "기획", status: "할 일", priority: "보통", owner: "재원", due: "날짜 없음" }, ...current]);
    setNotice("새 작업을 추가했습니다");
    window.setTimeout(() => setNotice(""), 2200);
  };

  return <Box className={s.app}>
    <Box as="header" className={s.topbar}>
      <Inline className={s.brand}><Box className={s.brandMark}><Glyph name="layers"/></Box><Text variant="subheading">fieldnote</Text><Divider axis="vertical"/><Text variant="body" ink="soft">내 작업 공간</Text></Inline>
      <Inline gap="sm" className={s.topActions}><Field className={s.search} aria-label="전체 검색" placeholder="작업 검색..." leading={<Glyph name="search"/>} value={query} onChange={(event) => setQuery(event.target.value)}/><Button variant="soft" shape="pill" aria-label="계정 메뉴">재</Button></Inline>
    </Box>
    <Box className={s.layout}>
      <Box as="nav" className={s.sidebar} aria-label="주요 메뉴">
        <Inline className={s.workspacePicker}><Badge fontSize="body" shape="rounded">S</Badge><Text variant="body">Studio Baeks</Text><Glyph name="chevron"/></Inline>
        <Stack gap="sm"><Text variant="body" ink="faint">WORKSPACE</Text><Button variant="ghost" className={s.navItem}><Glyph name="grid"/> 프로젝트 개요</Button><Button variant="ghost" className={s.navItem}><Glyph name="check"/> 내 작업 <Badge fontSize="body">4</Badge></Button><Button variant="ghost" className={s.navItem}><Glyph name="inbox"/> 받은 알림 <Badge fontSize="body">2</Badge></Button></Stack>
        <Stack gap="sm"><Text variant="body" ink="faint">PROJECTS</Text><Button variant="soft" className={s.navItem}><Glyph name="layers"/> 웹사이트 리뉴얼</Button><Button variant="ghost" className={s.navItem}><Glyph name="layers"/> 모바일 앱</Button><Button variant="ghost" className={s.navItem}><Glyph name="layers"/> 브랜드 정리</Button><Button variant="ghost" className={s.navItem}><Glyph name="plus"/> 프로젝트 추가</Button></Stack>
        <Box className={s.user}><Badge fontSize="body" shape="pill">재</Badge><Stack gap="xs"><Text variant="body">백재원</Text><Text variant="body" ink="faint">Studio Baeks</Text></Stack><IconButton aria-label="계정 옵션" variant="ghost"><Glyph name="more"/></IconButton></Box>
      </Box>
      <Stack as="main" className={s.main} gap="lg">
        <Inline className={s.breadcrumb}><Text variant="body" ink="faint">프로젝트</Text><Glyph name="chevron"/><Text variant="body">웹사이트 리뉴얼</Text></Inline>
        <PageHeader className={s.projectHeading}>
          <PageHeader.Content>
            <Inline gap="xs"><PageHeader.Title>웹사이트 리뉴얼</PageHeader.Title><Badge fontSize="body" accent="info" dot>진행 중</Badge></Inline>
            <PageHeader.Description>새로운 브랜드 경험을 위한 웹사이트 개편 프로젝트</PageHeader.Description>
          </PageHeader.Content>
          <PageHeader.Actions><Badge fontSize="body" shape="pill">재</Badge><Badge fontSize="body" shape="pill">민</Badge><Badge fontSize="body" shape="pill">지</Badge><Button variant="soft">공유 <Glyph name="arrow"/></Button></PageHeader.Actions>
        </PageHeader>
        <Box className={s.sprint} border radius="md" padding="lg">
          <Inline justify="between"><Stack gap="sm"><Inline><Glyph name="spark"/><Text variant="body" ink="soft">SPRINT 04　/　9월 21일 — 10월 4일</Text></Inline><Text as="h2" variant="heading">이번 주, 출시 경험을 다듬어요.</Text><Text ink="soft">핵심 화면을 마무리하고 첫 사용자 테스트를 준비합니다.</Text></Stack><Stack className={s.percent} align="center"><Text variant="heading">{Math.round(doneCount / tasks.length * 100)}%</Text><Text variant="body" ink="faint">완료</Text></Stack></Inline>
          <Box className={s.progress}><Box className={s.progressFill} style={{ width: `${Math.max(18, doneCount / tasks.length * 100)}%` }}/></Box>
          <Inline justify="between"><Text variant="body">{doneCount} / {tasks.length}개 작업 완료</Text><Text variant="body" ink="soft">다음 마일스톤　<b>디자인 확정</b>　10월 1일</Text><Text variant="body" ink="faint">스프린트 종료까지 <b>9일</b></Text></Inline>
        </Box>
        <Stack className={s.work} gap="sm">
          <Inline justify="between"><Inline><Text as="h2" variant="heading">작업</Text><Badge fontSize="body">{tasks.length}</Badge></Inline><Button onClick={addTask}><Glyph name="plus"/> 새 작업</Button></Inline>
          <Inline justify="between" className={s.toolbar}><Inline>{["전체", "할 일", "진행 중", "검토", "완료"].map((item) => <Button key={item} size="sm" variant={filter === item ? "soft" : "ghost"} onClick={() => setFilter(item)}>{item} <Text as="span" variant="body" ink="faint">{item === "전체" ? tasks.length : tasks.filter((task) => task.status === item).length}</Text></Button>)}</Inline><Inline><Field className={s.filterSearch} aria-label="작업 찾기" placeholder="작업 찾기" leading={<Glyph name="search"/>} value={query} onChange={(event) => setQuery(event.target.value)}/><Button size="sm" variant={showDone ? "soft" : "ghost"} aria-pressed={showDone} onClick={() => setShowDone((value) => !value)}><Glyph name="filter"/> 완료 포함</Button></Inline></Inline>
          <Box className={s.taskList} border radius="md" overflowX="auto">
            <Box as="table" className={s.taskTable}><Box as="thead"><Box as="tr"><Box as="th">완료</Box><Box as="th">작업</Box><Box as="th">상태</Box><Box as="th">우선순위</Box><Box as="th">담당자</Box><Box as="th">기한</Box></Box></Box><Box as="tbody">{visibleTasks.map((task) => <Box as="tr" key={task.id}><Box as="td"><Checkbox aria-label={`${task.title} 완료 처리`} checked={task.status === "완료"} onChange={() => toggleTask(task)}/></Box><Box as="td"><Stack gap="xs"><Inline><Text family="mono" variant="body" ink="faint">{task.code}</Text><Text variant="body">{task.title}</Text></Inline><Text variant="body" ink="faint">{task.project}</Text></Stack></Box><Box as="td"><Badge fontSize="body" accent={statusAccent(task.status)}>{task.status}</Badge></Box><Box as="td"><Badge fontSize="body" accent={task.priority === "긴급" ? "error" : task.priority === "높음" ? "warning" : "primary"} variant="muted">{task.priority}</Badge></Box><Box as="td"><Inline><Badge fontSize="body" shape="pill">{task.owner.slice(0, 1)}</Badge><Text variant="body">{task.owner}</Text></Inline></Box><Box as="td"><Text variant="body" ink="soft">{task.due}</Text></Box></Box>)}</Box></Box>
            {visibleTasks.length === 0 && <Text className={s.empty} ink="faint">조건에 맞는 작업이 없습니다.</Text>}
            <Inline className={s.tableFooter} justify="between"><Text variant="body" ink="faint">{visibleTasks.length}개 작업 표시</Text><Button size="sm" variant="ghost">모든 작업 보기 <Glyph name="chevron"/></Button></Inline>
          </Box>
        </Stack>
      </Stack>
      <Stack className={s.rightRail} gap="md">
        <Box border radius="md" padding="md"><Inline justify="between"><Stack gap="xs"><Text variant="subheading">이번 주</Text><Text variant="body" ink="faint">9월 24일 — 30일</Text></Stack><IconButton aria-label="캘린더 열기" variant="ghost"><Glyph name="calendar"/></IconButton></Inline><Inline className={s.weekDays} justify="between">{([["월", "23"], ["화", "24"], ["수", "25"], ["목", "26"], ["금", "27"], ["토", "28"], ["일", "29"]] as const).map(([day, date]) => <Stack key={date} align="center" gap="xs"><Text variant="body" ink="faint">{day}</Text><Badge fontSize="body" variant={date === "25" ? "solid" : "ghost"} shape="pill">{date}</Badge></Stack>)}</Inline></Box>
        <Box border radius="md" padding="md"><Inline justify="between"><Text variant="subheading">다가오는 일정</Text><Button size="sm" variant="ghost">전체 보기</Button></Inline><Stack className={s.agenda} gap="sm">{[["오늘", "14:00", "홈 화면 시안 리뷰", "디자인 팀 · 회의", "info"], ["내일", "10:30", "콘텐츠 킥오프", "콘텐츠 팀 · 회의", "success"], ["월요일", "16:00", "개발 체크인", "제품 팀 · 체크인", "warning"]].map(([day, time, title, detail, accent]) => <Inline key={title} className={s.agendaItem}><Stack gap="xs"><Text variant="body">{day}</Text><Text variant="body" ink="faint">{time}</Text></Stack><Stack gap="xs"><Text variant="body">{title}</Text><Badge fontSize="body" accent={accent as "info" | "success" | "warning"} variant="muted">{detail}</Badge></Stack></Inline>)}</Stack></Box>
        <Box className={s.activity} padding="sm"><Text variant="subheading">최근 활동</Text><Stack gap="md">{[["민", "민주", "메인 비주얼 시안", "을 검토로 옮겼습니다.", "12분 전"], ["지", "지현", "모바일 내비게이션", " 작업을 추가했습니다.", "1시간 전"], ["재", "재원", "프로젝트 설명", "을 수정했습니다.", "어제"]].map(([initial, name, item, action, time]) => <Inline key={name}><Badge fontSize="body" shape="pill">{initial}</Badge><Stack gap="xs"><Text variant="body"><b>{name}</b>님이 <b>{item}</b>{action}</Text><Text variant="body" ink="faint">{time}</Text></Stack></Inline>)}</Stack></Box>
        <Box border radius="md" padding="md"><Inline><Glyph name="spark"/><Text variant="body" ink="soft">다음 마일스톤</Text></Inline><Text as="h3" variant="subheading">디자인 확정</Text><Inline><Glyph name="clock"/><Text variant="body" ink="soft">10월 1일까지 · 6일 남음</Text></Inline><Box className={s.milestoneProgress}><Box className={s.progressFill}/></Box><Text variant="body" ink="soft">검토할 작업 <b>2개</b></Text></Box>
      </Stack>
    </Box>
    {notice && <Box className={s.toast} role="status"><Badge fontSize="body" accent="success" variant="ghost">✓</Badge><Text variant="body">{notice}</Text></Box>}
  </Box>;
};

export default Demo;
