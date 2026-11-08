import { random } from "../../../kit";
import { TODAY, dateKey } from "../lib/dates";
import type { Data, Point, Stroke } from "./types";

export const CANVAS_NAME = "자유로운 생각들";
export const WORKSPACE_NAME = "나의 작업 공간";

const run = (id: string, from: Point, to: Point, bend = 0, shake = 0.7): Stroke => {
  const r = random(id);
  const steps = Math.max(8, Math.round(Math.hypot(to.x - from.x, to.y - from.y) / 9));
  const nx = -(to.y - from.y);
  const ny = to.x - from.x;
  const length = Math.hypot(nx, ny) || 1;
  const points: Point[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const arc = 4 * t * (1 - t) * bend;
    points.push({
      x: Math.round((from.x + (to.x - from.x) * t + (nx / length) * arc + (r() - 0.5) * shake * 2) * 10) / 10,
      y: Math.round((from.y + (to.y - from.y) * t + (ny / length) * arc + (r() - 0.5) * shake * 2) * 10) / 10,
    });
  }
  return { id, points };
};

const ring = (id: string, center: Point, rx: number, ry: number, turn = 1.1, start = -2.3): Stroke => {
  const r = random(id);
  const steps = 36;
  const points: Point[] = [];
  for (let i = 0; i <= steps; i++) {
    const angle = start + (i / steps) * Math.PI * 2 * turn;
    const grow = 1 + (i / steps) * 0.05;
    points.push({
      x: Math.round((center.x + Math.cos(angle) * rx * grow + (r() - 0.5) * 1.2) * 10) / 10,
      y: Math.round((center.y + Math.sin(angle) * ry * grow + (r() - 0.5) * 1.2) * 10) / 10,
    });
  }
  return { id, points };
};

const arrow = (id: string, from: Point, to: Point, bend: number, size = 11): Stroke[] => {
  const body = run(`${id}-line`, from, to, bend);
  const tip = body.points[body.points.length - 1]!;
  const before = body.points[body.points.length - 4]!;
  const angle = Math.atan2(tip.y - before.y, tip.x - before.x);
  const side = (turn: number) => ({ x: tip.x + Math.cos(angle + turn) * size, y: tip.y + Math.sin(angle + turn) * size });
  return [body, { id: `${id}-head`, points: [side(Math.PI - 0.5), tip, side(Math.PI + 0.5)] }];
};

const event = (month: string, day: number, title: string) => ({ id: `event-${month}-${day}`, date: dateKey(Number(month.slice(0, 4)), Number(month.slice(5, 7)), day), title });

export const makeSeed = (): Data => {
  const month = TODAY.slice(0, 7);
  return {
    docs: [
      {
        id: "doc-home",
        title: "오늘의 페이지",
        x: 0,
        markdown:
          "# 오늘의 페이지\n\n떠오르는 생각을 여기에 적어보세요. 이 문서는 캔버스 위에 놓여 있고, 양쪽으로 새 페이지를 계속 이어갈 수 있습니다.\n\n## 지금 붙잡아 두고 싶은 것\n\n- 작은 아이디어도 적어두기\n- 생각이 이어지는 방향으로 펼쳐보기\n- 필요하면 펜으로 그 위에 바로 표시하기\n\n> 완벽하게 정리하기 전의 생각도 괜찮아요.\n\n문서 오른쪽 위의 **편집**을 눌러 Markdown으로 작성해 보세요.",
      },
      {
        id: "doc-week",
        title: "이번 주 정리",
        x: 720,
        markdown:
          "# 이번 주 정리\n\n## 해야 할 일\n\n- [x] 포스터 시안 두 개 비교하기\n- [ ] 전시 사진 열 장 고르기\n- [ ] 인쇄소에 파일 형식 물어보기\n\n## 메모\n\n화요일까지 시안을 정하면 수요일에 인쇄소로 넘길 수 있습니다. **색은 두 가지만** 쓰기로 했어요.\n\n> 줄이는 쪽이 늘 더 나았다.",
      },
      {
        id: "doc-reading",
        title: "읽을 글",
        x: 1440,
        markdown:
          "# 읽을 글\n\n1. 종이와 화면 사이에서\n2. 도시의 색 이름들\n3. 손으로 그린 지도 이야기\n\n읽다가 걸리는 문장은 밑줄 대신 `여기에` 옮겨 적어 둡니다.",
      },
    ],
    blocks: [
      { id: "note-call", kind: "text", x: 380, y: 258, content: "수요일 오전,\n인쇄소에 전화하기" },
      { id: "note-poster", kind: "text", x: 372, y: 506, content: "포스터는 사진 먼저,\n글자는 마지막에" },
      { id: "photo-walk", kind: "image", x: 30, y: 498, content: "https://example.com/photos/evening-walk.jpg" },
      { id: "note-reading", kind: "text", x: 1476, y: 430, content: "걸리는 문장은\n바로 여기에 옮겨 적기" },
    ],
    strokes: [
      run("under-title", { x: 46, y: 148 }, { x: 218, y: 145 }, 3),
      ring("ring-edit", { x: 155, y: 457 }, 21, 12),
      ...arrow("note-to-list", { x: 440, y: 496 }, { x: 298, y: 356 }, 30),
      run("under-colours", { x: 1112, y: 433 }, { x: 1198, y: 434 }, 2),
    ],
    todos: [
      { id: "todo-sketch", text: "새 아이디어 스케치하기", done: false },
      { id: "todo-read", text: "읽던 글 마저 보기", done: false },
      { id: "todo-photos", text: "전시 사진 열 장 고르기", done: false },
      { id: "todo-poster", text: "포스터 시안 두 개 비교하기", done: true },
    ],
    routines: [
      { id: "routine-line", text: "오늘의 생각 한 줄", done: false },
      { id: "routine-walk", text: "가볍게 걷기", done: true },
      { id: "routine-stretch", text: "스트레칭 5분", done: false },
    ],
    events: [
      { id: "event-today", date: TODAY, title: "오늘의 기록" },
      event(month, 12, "인쇄소 방문"),
      event(month, 18, "전시 사진 확정"),
      event(month, 26, "포스터 인쇄 마감"),
    ],
  };
};
