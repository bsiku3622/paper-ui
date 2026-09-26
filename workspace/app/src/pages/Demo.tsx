import { useMemo, useState } from "react";
import { Button, tokens } from "@studio-baeks/paper-ui";
import * as s from "./Demo.css";

type Task = { id: number; code: string; title: string; project: string; status: "진행 중" | "검토" | "할 일" | "완료"; priority: "긴급" | "높음" | "보통" | "낮음"; owner: string; initials: string; due: string };

const initialTasks: Task[] = [
  { id: 1, code: "WEB-24", title: "랜딩 페이지 정보 구조 확정", project: "기획", status: "진행 중", priority: "긴급", owner: "재원", initials: "재", due: "오늘" },
  { id: 2, code: "WEB-23", title: "메인 비주얼 시안 검토", project: "디자인", status: "검토", priority: "높음", owner: "민주", initials: "민", due: "오늘" },
  { id: 3, code: "WEB-22", title: "모바일 내비게이션 프로토타입", project: "디자인", status: "할 일", priority: "높음", owner: "지현", initials: "지", due: "9월 28일" },
  { id: 4, code: "WEB-21", title: "제품 소개 카피 초안 작성", project: "콘텐츠", status: "진행 중", priority: "보통", owner: "재원", initials: "재", due: "9월 29일" },
  { id: 5, code: "WEB-20", title: "분석 이벤트 목록 정리", project: "개발", status: "할 일", priority: "보통", owner: "도윤", initials: "도", due: "9월 30일" },
  { id: 6, code: "WEB-19", title: "컴포넌트 간격 검토", project: "디자인", status: "완료", priority: "낮음", owner: "민주", initials: "민", due: "9월 24일" },
];

const Icon = ({ name, size = 18 }: { name: string; size?: number }) => {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true as const };
  const paths: Record<string, React.ReactNode> = {
    grid: <><rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/></>,
    check: <><circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16.5 9"/></>,
    inbox: <><path d="M4 4.5h16v15H4z"/><path d="M4 13h4l1.5 2h5L16 13h4"/></>,
    layers: <><path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 16l9 5 9-5"/></>,
    search: <><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.5 4.5"/></>,
    calendar: <><rect x="3.5" y="5" width="17" height="16" rx="2"/><path d="M7.5 3v4M16.5 3v4M3.5 9h17"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    more: <><circle cx="5" cy="12" r=".8"/><circle cx="12" cy="12" r=".8"/><circle cx="19" cy="12" r=".8"/></>,
    chevron: <path d="m9 18 6-6-6-6"/>,
    "chevron-down": <path d="m7 10 5 5 5-5"/>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    filter: <><path d="M4 5h16l-6.5 7.5v5l-3 1v-6L4 5Z"/></>,
    board: <><rect x="3.5" y="4" width="17" height="16" rx="2"/><path d="M9 4v16M15 4v16"/></>,
    spark: <path d="m12 2.5 2.1 7.4 7.4 2.1-7.4 2.1-2.1 7.4-2.1-7.4-7.4-2.1 7.4-2.1L12 2.5Z" fill="currentColor" stroke="none"/>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6"/></>,
  };
  return <svg {...common}>{paths[name] ?? paths.grid}</svg>;
};

const navGroups: { label: string; items: [string, string][] }[] = [
  { label: "WORKSPACE", items: [["grid", "프로젝트 개요"], ["check", "내 작업"], ["inbox", "받은 알림"]] },
  { label: "PROJECTS", items: [["layers", "웹사이트 리뉴얼"], ["layers", "모바일 앱"], ["layers", "브랜드 정리"]] },
];

export const Demo = () => {
  const [tasks, setTasks] = useState(initialTasks);
  const [filter, setFilter] = useState("전체");
  const [query, setQuery] = useState("");
  const [view, setView] = useState("작업 목록");
  const [showDone, setShowDone] = useState(false);
  const [notice, setNotice] = useState("");
  const doneCount = tasks.filter((t) => t.status === "완료").length;
  const visibleTasks = useMemo(() => tasks.filter((task) => {
    const matchesFilter = filter === "전체" || task.status === filter;
    const matchesQuery = `${task.title} ${task.code} ${task.owner}`.toLowerCase().includes(query.toLowerCase());
    return matchesFilter && matchesQuery && (showDone || task.status !== "완료");
  }), [tasks, filter, query, showDone]);

  const completeTask = (task: Task) => {
    setTasks((current) => current.map((item) => item.id === task.id ? { ...item, status: item.status === "완료" ? "할 일" : "완료" } : item));
    setNotice(task.status === "완료" ? "작업을 다시 열었습니다" : "작업을 완료했습니다");
    window.setTimeout(() => setNotice(""), 2200);
  };
  const addTask = () => {
    const title = window.prompt("새 작업 이름을 입력하세요");
    if (!title?.trim()) return;
    setTasks((current) => [{ id: Date.now(), code: `WEB-${24 + current.length}`, title: title.trim(), project: "기획", status: "할 일", priority: "보통", owner: "재원", initials: "재", due: "날짜 없음" }, ...current]);
    setNotice("새 작업을 추가했습니다");
    window.setTimeout(() => setNotice(""), 2200);
  };

  return <div className={s.app} style={({ "--demo-canvas": tokens.color.bg.canvas, "--demo-raised": tokens.color.bg.raised, "--demo-sunken": tokens.color.bg.sunken, "--demo-well": tokens.color.bg.well, "--demo-ink": tokens.color.ink.primary, "--demo-secondary": tokens.color.ink.secondary, "--demo-tertiary": tokens.color.ink.tertiary, "--demo-border": tokens.color.border.base, "--demo-strong-border": tokens.color.border.strong, "--demo-info": tokens.color.accent.info.solid, "--demo-info-wash": tokens.color.accent.info.wash, "--demo-info-soft": tokens.color.accent.info.soft, "--demo-success": tokens.color.accent.success.solid, "--demo-success-wash": tokens.color.accent.success.wash, "--demo-success-soft": tokens.color.accent.success.soft, "--demo-warning": tokens.color.accent.warning.solid, "--demo-warning-wash": tokens.color.accent.warning.wash, "--demo-warning-soft": tokens.color.accent.warning.soft, "--demo-error": tokens.color.accent.error.solid, "--demo-error-wash": tokens.color.accent.error.wash, "--demo-error-soft": tokens.color.accent.error.soft, "--demo-focus": tokens.color.interaction.focus, "--demo-hover": tokens.color.interaction.bgHover.onSurface, "--demo-shadow": tokens.color.shadow.overlay } as React.CSSProperties)}>
    <header className={s.topbar}>
      <a className={s.brand} href="#home" aria-label="Fieldnote 홈"><span className={s.brandMark}><Icon name="layers" size={17}/></span><span>fieldnote</span><span className={s.brandDivider}/><span className={s.workspaceName}>내 작업 공간</span></a>
      <div className={s.topActions}><label className={s.search}><Icon name="search" size={17}/><input className={s.searchInput} aria-label="전체 검색" placeholder="작업 검색..." value={query} onChange={(e) => setQuery(e.target.value)}/><kbd className={s.searchShortcut}>⌘ K</kbd></label><button className={s.avatar} aria-label="계정 메뉴">재</button></div>
    </header>
    <div className={s.layout}>
      <aside className={s.sidebar}>
        <div className={s.workspacePicker}><span className={s.workspaceGlyph}>S</span><span className={s.workspaceTitle}>Studio Baeks</span><span className={s.downCaret} aria-hidden="true"><Icon name="chevron-down" size={16}/></span></div>
        {navGroups.map((group, index) => <div className={s.navGroup} key={group.label}><p className={s.navLabel}>{group.label}</p>{group.items.map(([icon, label], itemIndex) => <button className={`${s.navItem} ${index === 1 && itemIndex === 0 ? s.navActive : ""}`} key={label}><Icon name={icon}/><span>{label}</span>{label === "내 작업" && <span className={s.navCount}>4</span>}{label === "받은 알림" && <span className={s.navCount}>2</span>}</button>)}</div>)}
        <button className={s.projectAdd}><Icon name="plus" size={16}/> 프로젝트 추가</button>
        <div className={s.sidebarBottom}><div className={s.userFace}>재</div><div><strong>백재원</strong><small>Studio Baeks</small></div><button aria-label="계정 옵션"><Icon name="more" size={17}/></button></div>
      </aside>
      <main className={s.main}>
        <div className={s.breadcrumb}><span>프로젝트</span><Icon name="chevron" size={13}/><span>웹사이트 리뉴얼</span></div>
        <section className={s.projectHeading}><div><div className={s.titleLine}><h1>웹사이트 리뉴얼</h1><span className={s.statusPill}><i/> 진행 중</span></div><p>새로운 브랜드 경험을 위한 웹사이트 개편 프로젝트</p></div><div className={s.projectActions}><div className={s.avatarStack}><span>재</span><span>민</span><span>지</span><button aria-label="멤버 추가"><Icon name="plus" size={15}/></button></div><button className={s.shareButton}>공유 <Icon name="arrow" size={15}/></button></div></section>

        <section className={s.sprint} aria-label="스프린트 현황">
          <div className={s.sprintTop}><div><div className={s.eyebrow}><span className={s.spark}><Icon name="spark" size={16}/></span> SPRINT 04 <span className={s.dotSep}>/</span> 9월 21일 — 10월 4일</div><h2>이번 주, 출시 경험을 다듬어요.</h2><p>핵심 화면을 마무리하고 첫 사용자 테스트를 준비합니다.</p></div><div className={s.progressPercent}><strong>{Math.round(doneCount / tasks.length * 100)}<small>%</small></strong><span>완료</span></div></div>
          <div className={s.progressTrack}><span style={{ width: `${Math.max(18, doneCount / tasks.length * 100)}%` }}/></div>
          <div className={s.sprintFoot}><span><b>{doneCount}</b> / {tasks.length}개 작업 완료</span><span className={s.milestone}><i/> 다음 마일스톤 <b>디자인 확정</b><span className={s.milestoneDate}>10월 1일</span></span><span className={s.daysLeft}>스프린트 종료까지 <b>9일</b></span></div>
        </section>

        <section className={s.workSection}>
          <div className={s.sectionHeader}><div><h2>작업</h2><span className={s.sectionCount}>{tasks.length}</span></div><Button onClick={addTask}><Icon name="plus" size={16}/> 새 작업</Button></div>
          <div className={s.toolbar}><div className={s.tabs} role="tablist" aria-label="작업 보기">{["작업 목록", "보드", "타임라인"].map((item) => <button key={item} type="button" role="tab" aria-selected={view === item} className={view === item ? s.tabActive : ""} onClick={() => setView(item)}>{item === "보드" && <Icon name="board" size={15}/>} {item}</button>)}</div><div className={s.controls}><label className={s.compactSearch}><Icon name="search" size={16}/><input aria-label="작업 필터" placeholder="작업 찾기" value={query} onChange={(e) => setQuery(e.target.value)}/></label><button className={`${s.filterButton} ${showDone ? s.filterOn : ""}`} aria-pressed={showDone} onClick={() => setShowDone((value) => !value)}><Icon name="filter" size={16}/> 완료 포함</button></div></div>
          <div className={s.filters} aria-label="작업 상태 필터">{["전체", "할 일", "진행 중", "검토", "완료"].map((item) => <button key={item} type="button" aria-pressed={filter === item} className={filter === item ? s.filterActive : ""} onClick={() => setFilter(item)}>{item}<span>{item === "전체" ? tasks.length : tasks.filter((t) => t.status === item).length}</span></button>)}</div>
          {view === "작업 목록" ? <div className={s.taskTableWrap}><table className={s.taskTable}><thead><tr><th className={s.doneCol}>완료</th><th>작업</th><th>상태</th><th className={s.priorityCol}>우선순위</th><th className={s.ownerCol}>담당자</th><th className={s.dueCol}>기한</th><th/></tr></thead><tbody>{visibleTasks.map((task) => <tr key={task.id}><td><button aria-label={`${task.title} ${task.status === "완료" ? "다시 열기" : "완료 처리"}`} className={`${s.checkButton} ${task.status === "완료" ? s.checked : ""}`} onClick={() => completeTask(task)}>{task.status === "완료" && <span>✓</span>}</button></td><td><div className={s.taskName}><span className={s.taskCode}>{task.code}</span><strong className={task.status === "완료" ? s.struck : ""}>{task.title}</strong><small>{task.project}</small></div></td><td><span className={`${s.taskStatus} ${task.status === "할 일" ? s.statusTodo : task.status === "진행 중" ? s.statusInProgress : task.status === "검토" ? s.statusReview : s.statusDone}`}>{task.status}</span></td><td className={s.priorityCol}><span className={`${s.priority} ${task.priority === "긴급" ? s.urgent : task.priority === "높음" ? s.high : ""}`}>{task.priority}</span></td><td className={s.ownerCol}><span className={s.assignee}><i>{task.initials}</i>{task.owner}</span></td><td className={`${s.due} ${s.dueCol}`}>{task.due}</td><td><button className={s.rowMore} aria-label={`${task.title} 옵션`}><Icon name="more" size={17}/></button></td></tr>)}</tbody></table>{visibleTasks.length === 0 && <div className={s.empty}>조건에 맞는 작업이 없습니다.</div>}</div> : <div className={s.altView}><div className={s.altTitle}><Icon name={view === "보드" ? "board" : "calendar"}/>{view === "보드" ? "상태별 작업 보드" : "스프린트 타임라인"}</div><div className={s.altColumns}>{["할 일", "진행 중", "검토"].map((col) => <div className={s.altColumn} key={col}><h3>{col}<span>{tasks.filter(t => t.status === col).length}</span></h3>{tasks.filter(t => t.status === col).map(t => <article key={t.id}><small>{t.code}</small><strong>{t.title}</strong><span>{t.owner} · {t.due}</span></article>)}</div>)}</div></div>}
          <div className={s.tableFooter}><span>{visibleTasks.length}개 작업 표시</span><button>모든 작업 보기 <Icon name="chevron" size={14}/></button></div>
        </section>
      </main>
      <aside className={s.rightRail}>
        <section className={s.railSection}><div className={s.railHeading}><div><h2>이번 주</h2><p>9월 24일 — 30일</p></div><button aria-label="캘린더 열기"><Icon name="calendar" size={17}/></button></div><div className={s.weekDays}>{([["월","23"],["화","24"],["수","25"],["목","26"],["금","27"],["토","28"],["일","29"]] as const).map(([day,date]) => <button key={date} className={date === "25" ? s.today : ""}><small>{day}</small><span>{date}</span>{["24","26","29"].includes(date) && <i/>}</button>)}</div></section>
        <section className={s.railSection}><div className={s.railTitle}><h2>다가오는 일정</h2><button>전체 보기 <Icon name="chevron" size={13}/></button></div><div className={s.agenda}><article><time><b>오늘</b><span>14:00</span></time><div className={s.agendaContent}><strong>홈 화면 시안 리뷰</strong><small><i className={s.blueDot}/> 디자인 팀 · 회의</small></div></article><article><time><b>내일</b><span>10:30</span></time><div className={s.agendaContent}><strong>콘텐츠 킥오프</strong><small><i className={s.greenDot}/> 콘텐츠 팀 · 회의</small></div></article><article><time><b>월요일</b><span>16:00</span></time><div className={s.agendaContent}><strong>개발 체크인</strong><small><i className={s.orangeDot}/> 제품 팀 · 체크인</small></div></article></div></section>
        <section className={s.activitySection}><div className={s.railTitle}><h2>최근 활동</h2><button aria-label="활동 더보기"><Icon name="more" size={17}/></button></div><div className={s.activity}><div className={s.activityAvatar}>민</div><p><strong>민주</strong>님이 <b>메인 비주얼 시안</b>을 검토로 옮겼습니다.<small>12분 전</small></p></div><div className={s.activity}><div className={`${s.activityAvatar} ${s.greenAvatar}`}>지</div><p><strong>지현</strong>님이 모바일 내비게이션 작업을 추가했습니다.<small>1시간 전</small></p></div><div className={s.activity}><div className={`${s.activityAvatar} ${s.darkAvatar}`}>재</div><p><strong>재원</strong>님이 프로젝트 설명을 수정했습니다.<small>어제</small></p></div></section>
        <section className={s.milestoneCard}><div className={s.milestoneIcon}><Icon name="spark" size={16}/></div><div className={s.eyebrow}>다음 마일스톤</div><h3>디자인 확정</h3><p><Icon name="clock" size={14}/> 10월 1일까지 · 6일 남음</p><div className={s.milestoneProgress}><span/></div><small>검토할 작업 <b>2개</b></small></section>
      </aside>
    </div>
    {notice && <div className={s.toast} role="status"><span>✓</span>{notice}</div>}
  </div>;
};

export default Demo;
