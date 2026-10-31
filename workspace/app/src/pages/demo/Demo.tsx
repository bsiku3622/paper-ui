import { useMemo, useState } from "react";
import { Link as RouterLink, useSearchParams } from "react-router-dom";
import { Badge, Box, Button, Checkbox, Divider, Field, IconButton, Inline, Paint, Selectable, SelectableGroup, Stack, Surface, Text } from "@studio-baeks/paper-ui";

import { Avatar } from "../../compositions/Avatar";
import { DayChip } from "../../compositions/DayChip";
import { ArrowRightIcon, CalendarIcon, CircleCheckIcon, ChevronRightIcon, FilterIcon, GridIcon, InboxIcon, LayersIcon, MoreIcon, PlusIcon, SearchIcon, SparkIcon } from "../../compositions/icons";
import { ProgressBar } from "../../compositions/ProgressBar";
import { TASK_ADDED, TaskDialog } from "../../compositions/TaskDialog";
import { Toast } from "../../compositions/Toast";
import * as s from "./demo.css";

type Task = { id: number; code: string; title: string; project: string; status: "진행 중" | "검토" | "할 일" | "완료"; priority: "긴급" | "높음" | "보통" | "낮음"; owner: string; due: string };
const initialTasks: Task[] = [
  { id: 1, code: "WEB-24", title: "랜딩 페이지 정보 구조 확정", project: "기획", status: "진행 중", priority: "긴급", owner: "재원", due: "오늘" },
  { id: 2, code: "WEB-23", title: "메인 비주얼 시안 검토", project: "디자인", status: "검토", priority: "높음", owner: "민주", due: "오늘" },
  { id: 3, code: "WEB-22", title: "모바일 내비게이션 프로토타입", project: "디자인", status: "할 일", priority: "높음", owner: "지현", due: "9월 28일" },
  { id: 4, code: "WEB-21", title: "제품 소개 카피 초안 작성", project: "콘텐츠", status: "진행 중", priority: "보통", owner: "재원", due: "9월 29일" },
  { id: 5, code: "WEB-20", title: "분석 이벤트 목록 정리", project: "개발", status: "할 일", priority: "보통", owner: "도윤", due: "9월 30일" },
  { id: 6, code: "WEB-19", title: "컴포넌트 간격 검토", project: "디자인", status: "완료", priority: "낮음", owner: "민주", due: "9월 24일" },
];

const FILTERS = ["전체", "할 일", "진행 중", "검토", "완료"];
const WEEK = [["월", "23"], ["화", "24"], ["수", "25"], ["목", "26"], ["금", "27"], ["토", "28"], ["일", "29"]] as const;
const TODAY = "25";
const AGENDA = [["오늘", "14:00", "홈 화면 시안 리뷰", "디자인 팀 · 회의"], ["내일", "10:30", "콘텐츠 킥오프", "콘텐츠 팀 · 회의"], ["월요일", "16:00", "개발 체크인", "제품 팀 · 체크인"]] as const;
const ACTIVITY = [["민", "민주", "메인 비주얼 시안", "을 검토로 옮겼습니다.", "12분 전"], ["지", "지현", "모바일 내비게이션", " 작업을 추가했습니다.", "1시간 전"], ["재", "재원", "프로젝트 설명", "을 수정했습니다.", "어제"]] as const;

// The workspace views and the projects of the sidebar. Each is a link that sets one search parameter; the one the
// address names is the current page, and the project is "web" until it names another.
const VIEWS = [["overview", "프로젝트 개요", GridIcon, 0], ["mine", "내 작업", CircleCheckIcon, 4], ["inbox", "받은 알림", InboxIcon, 2]] as const;
const PROJECTS = [["web", "웹사이트 리뉴얼"], ["mobile", "모바일 앱"], ["brand", "브랜드 정리"]] as const;

const statusAccent = (status: Task["status"]) => status === "진행 중" ? "info" : status === "검토" ? "warning" : status === "완료" ? "success" : "primary";

export const Demo = () => {
  const [tasks, setTasks] = useState(initialTasks);
  const [filter, setFilter] = useState("전체");
  const [query, setQuery] = useState("");
  const [showDone, setShowDone] = useState(false);
  const [notice, setNotice] = useState("");
  const [params] = useSearchParams();
  const current = params.get("view") ? `view=${params.get("view")}` : `project=${params.get("project") ?? "web"}`;
  const doneCount = tasks.filter((task) => task.status === "완료").length;
  const percent = Math.round(doneCount / tasks.length * 100);
  const visibleTasks = useMemo(() => tasks.filter((task) => (filter === "전체" || task.status === filter)
    && `${task.title} ${task.code} ${task.owner}`.toLowerCase().includes(query.toLowerCase())
    && (showDone || task.status !== "완료")), [tasks, filter, query, showDone]);
  const say = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2200);
  };
  const toggleTask = (task: Task) => {
    setTasks((currentTasks) => currentTasks.map((item) => item.id === task.id ? { ...item, status: item.status === "완료" ? "할 일" : "완료" } : item));
    say(task.status === "완료" ? "작업을 다시 열었습니다" : "작업을 완료했습니다");
  };
  const addTask = (title: string) => {
    setTasks((currentTasks) => [{ id: Date.now(), code: `WEB-${24 + currentTasks.length}`, title, project: "기획", status: "할 일", priority: "보통", owner: "재원", due: "날짜 없음" }, ...currentTasks]);
    say(TASK_ADDED);
  };

  return <>
    <Box as="header" className={s.topbar}>
      <Inline className={s.brand}><Paint accent="primary" variant="solid" className={s.brandMark}><LayersIcon/></Paint><Text variant="subheading">fieldnote</Text><Divider className={s.workspaceLabel} orientation="vertical"/><Text className={s.workspaceLabel} variant="caption" ink="secondary">내 작업 공간</Text></Inline>
      <Inline gap="sm" className={s.topActions}><Field className={s.search} aria-label="전체 검색" placeholder="작업 검색..." leading={<SearchIcon/>} value={query} onChange={(event) => setQuery(event.target.value)}/><Button variant="soft" shape="pill" aria-label="계정 메뉴">재</Button></Inline>
    </Box>
    <Box className={s.layout}>
      <Surface as="nav" elevation="sticky" className={s.sidebar} aria-label="작업 공간 메뉴">
        <Inline className={s.workspacePicker}><Avatar initial="S" shape="square"/><Text variant="body">Studio Baeks</Text><ChevronRightIcon/></Inline>
        <Stack gap="sm"><Text variant="label" ink="tertiary">Workspace</Text>{VIEWS.map(([view, label, ViewIcon, count]) => <Button key={view} as={RouterLink} to={{ search: `?view=${view}` }} variant="ghost" className={s.navItem} aria-current={current === `view=${view}` ? "page" : undefined}><ViewIcon/> {label} {count ? <Badge>{count}</Badge> : null}</Button>)}</Stack>
        <Stack gap="sm"><Text variant="label" ink="tertiary">Projects</Text>{PROJECTS.map(([project, label]) => <Button key={project} as={RouterLink} to={{ search: `?project=${project}` }} variant="ghost" className={s.navItem} aria-current={current === `project=${project}` ? "page" : undefined}><LayersIcon/> {label}</Button>)}<Button variant="ghost" className={s.navItem}><PlusIcon/> 프로젝트 추가</Button></Stack>
        <Box className={s.user}><Avatar initial="재"/><Stack gap="xs"><Text variant="body">백재원</Text><Text variant="caption" ink="tertiary">Studio Baeks</Text></Stack><IconButton aria-label="계정 옵션" variant="ghost"><MoreIcon/></IconButton></Box>
      </Surface>
      <Stack as="main" id="main" tabIndex={-1} className={s.main} gap="lg">
        <Inline className={s.breadcrumb}><Text variant="caption" ink="tertiary">프로젝트</Text><ChevronRightIcon/><Text variant="caption">웹사이트 리뉴얼</Text></Inline>
        <Inline as="header" className={s.projectHeading} justify="between" align="center">
          <Stack gap="xs">
            <Inline gap="xs" align="center"><Text as="h1" variant="title">웹사이트 리뉴얼</Text><Badge accent="info" dot>진행 중</Badge></Inline>
            <Text variant="body" ink="secondary">새로운 브랜드 경험을 위한 웹사이트 개편 프로젝트</Text>
          </Stack>
          <Inline align="center"><Avatar initial="재"/><Avatar initial="민"/><Avatar initial="지"/><Button variant="soft">공유 <ArrowRightIcon/></Button></Inline>
        </Inline>
        <Surface as={Stack} fill="raised" border radius="md" padding="lg" gap="lg">
          <Inline justify="between"><Stack gap="sm"><Inline><SparkIcon/><Text variant="caption" ink="secondary">Sprint 04 / 9월 21일 — 10월 4일</Text></Inline><Text as="h2" variant="heading">이번 주, 출시 경험을 다듬어요.</Text><Text ink="secondary">핵심 화면을 마무리하고 첫 사용자 테스트를 준비합니다.</Text></Stack><Stack className={s.percent} align="center"><Text variant="heading">{percent}%</Text><Text variant="caption" ink="tertiary">완료</Text></Stack></Inline>
          <ProgressBar value={percent} label="스프린트 진행률" />
          <Inline justify="between"><Text variant="caption">{doneCount} / {tasks.length}개 작업 완료</Text><Text variant="caption" ink="secondary">다음 마일스톤　<b>디자인 확정</b>　10월 1일</Text><Text variant="caption" ink="tertiary">스프린트 종료까지 <b>9일</b></Text></Inline>
        </Surface>
        <Stack className={s.work} gap="sm">
          <Inline justify="between"><Inline><Text as="h2" variant="heading">작업</Text><Badge>{tasks.length}</Badge></Inline><TaskDialog onAdd={addTask}/></Inline>
          <Inline justify="between" className={s.toolbar}>
            <SelectableGroup aria-label="상태 필터" selectionRequired selectedValues={[filter]} onSelectedValuesChange={([next]) => next && setFilter(next)} className={s.filters}>{FILTERS.map((item) => <Button key={item} as={SelectableGroup.Item} value={item} size="sm" variant="ghost">{item} <Text as="span" variant="caption" ink="tertiary">{item === "전체" ? tasks.length : tasks.filter((task) => task.status === item).length}</Text></Button>)}</SelectableGroup>
            <Inline><Field className={s.filterSearch} aria-label="작업 찾기" placeholder="작업 찾기" leading={<SearchIcon/>} value={query} onChange={(event) => setQuery(event.target.value)}/><Button as={Selectable} size="sm" variant="ghost" selected={showDone} onSelectedChange={setShowDone}><FilterIcon/> 완료 포함</Button></Inline>
          </Inline>
          <Surface className={s.taskList} border radius="md" overflowX="auto">
            <Box as="table" className={s.taskTable}><Box as="thead"><Box as="tr"><Box as="th">완료</Box><Box as="th">작업</Box><Box as="th">상태</Box><Box as="th">우선순위</Box><Box as="th">담당자</Box><Box as="th">기한</Box></Box></Box><Box as="tbody">{visibleTasks.map((task) => <Box as="tr" key={task.id}><Box as="td"><Checkbox aria-label={`${task.title} 완료 처리`} checked={task.status === "완료"} onChange={() => toggleTask(task)}/></Box><Box as="td"><Stack gap="xs"><Inline><Text family="mono" variant="body" ink="tertiary">{task.code}</Text><Text variant="body">{task.title}</Text></Inline><Text variant="caption" ink="tertiary">{task.project}</Text></Stack></Box><Box as="td"><Badge accent={statusAccent(task.status)}>{task.status}</Badge></Box><Box as="td"><Badge accent={task.priority === "긴급" ? "error" : task.priority === "높음" ? "warning" : "primary"} variant="muted">{task.priority}</Badge></Box><Box as="td"><Inline><Avatar initial={task.owner.slice(0, 1)}/><Text variant="body">{task.owner}</Text></Inline></Box><Box as="td"><Text variant="caption" ink="secondary">{task.due}</Text></Box></Box>)}</Box></Box>
            {visibleTasks.length === 0 && <Text className={s.empty} ink="tertiary">조건에 맞는 작업이 없습니다.</Text>}
            <Inline className={s.tableFooter} justify="between"><Text variant="caption" ink="tertiary">{visibleTasks.length}개 작업 표시</Text><Button size="sm" variant="ghost">모든 작업 보기 <ChevronRightIcon/></Button></Inline>
          </Surface>
        </Stack>
      </Stack>
      <Surface as={Stack} elevation="sticky" className={s.rightRail} gap="md">
        <Surface border radius="md" padding="md"><Inline justify="between"><Stack gap="xs"><Text variant="subheading">이번 주</Text><Text variant="caption" ink="tertiary">9월 24일 — 30일</Text></Stack><IconButton aria-label="캘린더 열기" variant="ghost"><CalendarIcon/></IconButton></Inline><Inline className={s.weekDays} justify="between">{WEEK.map(([day, date]) => <Stack key={date} align="center" gap="xs"><Text variant="caption" ink="tertiary">{day}</Text><DayChip day={date} selected={date === TODAY}/></Stack>)}</Inline></Surface>
        <Surface border radius="md" padding="md"><Inline justify="between"><Text variant="subheading">다가오는 일정</Text><Button size="sm" variant="ghost">전체 보기</Button></Inline><Stack className={s.agenda} gap="sm">{AGENDA.map(([day, time, title, detail]) => <Inline key={title} className={s.agendaItem}><Stack gap="xs"><Text variant="body">{day}</Text><Text variant="caption" ink="tertiary">{time}</Text></Stack><Stack gap="xs"><Text variant="body">{title}</Text><Badge variant="muted">{detail}</Badge></Stack></Inline>)}</Stack></Surface>
        <Box className={s.activity} padding="sm"><Text variant="subheading">최근 활동</Text><Stack gap="md">{ACTIVITY.map(([initial, name, item, action, time]) => <Inline key={name}><Avatar initial={initial}/><Stack gap="xs"><Text variant="body"><b>{name}</b>님이 <b>{item}</b>{action}</Text><Text variant="caption" ink="tertiary">{time}</Text></Stack></Inline>)}</Stack></Box>
        <Surface as={Stack} theme="inverse" fill="raised" radius="md" padding="lg" gap="md"><Inline gap="xs"><SparkIcon ink="secondary"/><Text as="h3" variant="body" ink="secondary">다음 마일스톤</Text></Inline><Inline gap="xs" align="baseline"><Text as="span" variant="display">6일</Text><Text as="span" variant="body" ink="secondary">남음 · 디자인 확정</Text></Inline><ProgressBar value={40} label="마일스톤까지 지난 기간" accent="warning" /><Text variant="body" ink="secondary">10월 1일까지 디자인을 확정합니다. 검토할 작업이 2개 남았습니다.</Text></Surface>
      </Surface>
    </Box>
    <Toast message={notice} />
  </>;
};

export default Demo;
