// store.tsx — what a visitor changes: edits, threads and replies, stars, who is logged in. Everything is kept in localStorage
// under “wiki:…”; the seeds in data/ never change, so “처음 상태로” is just clearing these keys.

import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";

import { useStored } from "../../../kit";
import { buildIndex, type WikiIndex } from "../data";
import { SEED_THREADS } from "../data/threads";
import type { Reply, Rev, RevKind, Thread, UserRev } from "../data/types";
import { GUEST } from "../data/users";
import { present, sizeOf } from "../lib/text";

type Status = "open" | "closed";
type Save = { title: string; text: string; summary: string; minor?: boolean; kind?: RevKind; revertOf?: number };

export type Wiki = {
  index: WikiIndex;
  // The name edits and posts are made under: the logged-in name, or “손님”.
  user: string;
  loggedIn: boolean;
  login: (name: string) => void;
  logout: () => void;
  stars: readonly string[];
  toggleStar: (title: string) => boolean;
  save: (input: Save) => Rev;
  threads: Thread[];
  addThread: (input: { article: string; title: string; text: string }) => Thread;
  reply: (threadId: string, text: string) => void;
  setStatus: (threadId: string, status: Status) => void;
  // What this browser keeps of the visitor's work, and a way to forget all of it.
  stored: { edits: number; threads: number; replies: number; stars: number };
  reset: () => void;
};

const Ctx = createContext<Wiki | null>(null);

export const useWiki = () => {
  const value = useContext(Ctx);
  if (!value) throw new Error("useWiki needs a WikiProvider above it");
  return value;
};

export const WikiProvider = ({ children }: { children: ReactNode }) => {
  const [userRevs, setUserRevs] = useStored<UserRev[]>("wiki:revisions", []);
  const [session, setSession] = useStored<{ name: string } | null>("wiki:session", null);
  const [stars, setStars] = useStored<string[]>("wiki:stars", []);
  const [mine, setMine] = useStored<Thread[]>("wiki:threads", []);
  const [replies, setReplies] = useStored<Reply[]>("wiki:replies", []);
  const [statuses, setStatuses] = useStored<Record<string, Status>>("wiki:thread-status", {});

  const index = useMemo(() => buildIndex(userRevs), [userRevs]);
  const user = session?.name ?? GUEST;

  const threads = useMemo<Thread[]>(
    () =>
      [...SEED_THREADS, ...mine].map((thread) => ({
        ...thread,
        status: statuses[thread.id] ?? thread.status,
        comments: [...thread.comments, ...replies.filter((reply) => reply.threadId === thread.id).map((reply) => reply.comment)],
      })),
    [mine, replies, statuses],
  );

  const save = useCallback(
    (input: Save): Rev => {
      const last = index.articles.get(input.title)?.rev;
      const latest = Math.max(last?.at ?? 0, userRevs[userRevs.length - 1]?.at ?? 0);
      const at = Math.max(present(), latest + 1000);
      const summary = input.summary.trim() || (last ? "편집" : "새 문서");
      const kind = input.kind ?? (last ? "edit" : "create");
      setUserRevs((now) => [...now, { title: input.title, text: input.text, at, author: user, summary, minor: input.minor ?? false, kind, revertOf: input.revertOf }]);
      const size = sizeOf(input.text);
      return { n: (last?.n ?? 0) + 1, title: input.title, text: input.text, at, author: user, summary, size, delta: size - (last?.size ?? 0), minor: input.minor ?? false, kind, revertOf: input.revertOf };
    },
    [index, setUserRevs, user, userRevs],
  );

  const addThread = useCallback(
    (input: { article: string; title: string; text: string }): Thread => {
      const at = present();
      const thread: Thread = {
        id: `u${mine.length + 1}`,
        article: input.article,
        title: input.title.trim(),
        status: "open",
        at,
        author: user,
        comments: [{ n: 1, author: user, at, text: input.text.trim() }],
      };
      setMine((now) => [...now, thread]);
      return thread;
    },
    [mine.length, setMine, user],
  );

  const reply = useCallback(
    (threadId: string, text: string) => {
      const thread = threads.find((item) => item.id === threadId);
      if (!thread) return;
      const comment = { n: thread.comments.length + 1, author: user, at: Math.max(present(), (thread.comments[thread.comments.length - 1]?.at ?? 0) + 1000), text: text.trim() };
      setReplies((now) => [...now, { threadId, comment }]);
    },
    [setReplies, threads, user],
  );

  const toggleStar = useCallback(
    (title: string) => {
      const on = !stars.includes(title);
      setStars((now) => (now.includes(title) ? now.filter((item) => item !== title) : [...now, title]));
      return on;
    },
    [setStars, stars],
  );

  const value = useMemo<Wiki>(
    () => ({
      index,
      user,
      loggedIn: session !== null,
      login: (name) => setSession({ name: name.trim() }),
      logout: () => setSession(null),
      stars,
      toggleStar,
      save,
      threads,
      addThread,
      reply,
      setStatus: (threadId, status) => setStatuses((now) => ({ ...now, [threadId]: status })),
      stored: { edits: userRevs.length, threads: mine.length, replies: replies.length, stars: stars.length },
      reset: () => {
        setUserRevs([]);
        setStars([]);
        setMine([]);
        setReplies([]);
        setStatuses({});
      },
    }),
    [index, user, session, setSession, stars, toggleStar, save, threads, addThread, reply, setStatuses, setUserRevs, setStars, setMine, setReplies, userRevs.length, mine.length, replies.length],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};
