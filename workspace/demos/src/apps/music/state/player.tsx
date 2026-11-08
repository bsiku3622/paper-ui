import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { random, shuffle, useStored, useToast } from "../../../kit";
import { TRACKS, TRACK_BY_ID, genreOfTrack, type Track } from "../data/catalog";
import { SEED_PLAYLISTS } from "../data/collections";
import { withJosa } from "../data/josa";
import { useLibrary } from "./library";
import { useSettings } from "./settings";

export type Repeat = "off" | "all" | "one";

type Queue = { ids: string[]; index: number; origin?: string[] };
type Prefs = { shuffle: boolean; repeat: Repeat; volume: number; muted: boolean };
type Resume = { id: string; position: number };

const START = SEED_PLAYLISTS[0]!.trackIds;
const DEFAULT_QUEUE: Queue = { ids: [...START], index: 2 };
const DEFAULT_PREFS: Prefs = { shuffle: false, repeat: "off", volume: 0.7, muted: false };
const DEFAULT_RESUME: Resume = { id: START[2]!, position: 41 };

export type Player = {
  current: Track | undefined;
  queue: readonly string[];
  index: number;
  playing: boolean;
  shuffle: boolean;
  repeat: Repeat;
  volume: number;
  muted: boolean;

  play: (ids: readonly string[], start?: number, options?: { shuffle?: boolean }) => void;
  playTrack: (id: string, context: readonly string[]) => void;
  toggle: () => void;
  next: () => void;
  previous: () => void;
  seek: (seconds: number) => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;

  playNext: (ids: readonly string[]) => void;
  playLater: (ids: readonly string[]) => void;
  jump: (index: number) => void;
  removeAt: (index: number) => void;
  move: (from: number, to: number) => void;
  clearUpNext: () => void;
  startRadio: (name: string, ids: readonly string[]) => void;
};

const PlayerCtx = createContext<Player | null>(null);
const PositionCtx = createContext(0);

export const usePlayer = () => {
  const value = useContext(PlayerCtx);
  if (!value) throw new Error("usePlayer needs PlayerProvider");
  return value;
};

export const usePosition = () => useContext(PositionCtx);

const similar = (track: Track, taken: ReadonlySet<string>, count: number) => {
  const r = random(`similar:${track.id}:${taken.size}`);
  const genre = genreOfTrack(track);
  const near = shuffle(r, TRACKS.filter((item) => !taken.has(item.id) && genreOfTrack(item) === genre));
  const far = shuffle(r, TRACKS.filter((item) => !taken.has(item.id) && genreOfTrack(item) !== genre));
  return [...near, ...far].slice(0, count).map((item) => item.id);
};

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const toast = useToast();
  const { pushHistory } = useLibrary();
  const { settings } = useSettings();
  const [queue, setQueue] = useStored<Queue>("music:queue", DEFAULT_QUEUE);
  const [prefs, setPrefs] = useStored<Prefs>("music:prefs", DEFAULT_PREFS);
  const [resume, setResume] = useStored<Resume>("music:resume", DEFAULT_RESUME);
  const [playing, setPlaying] = useState(false);

  const currentId = queue.ids[queue.index];
  const current = currentId ? TRACK_BY_ID.get(currentId) : undefined;

  const clock = useRef(resume.id === currentId ? resume.position : 0);
  const [position, setPosition] = useState(clock.current);

  const live = useRef({ queue, prefs, settings, current, playing });
  live.current = { queue, prefs, settings, current, playing };

  const actions = useMemo(() => {
    const show = (seconds: number) => {
      clock.current = seconds;
      setPosition(seconds);
    };

    const go = (next: Queue, play: boolean) => {
      setQueue(next);
      show(0);
      setPlaying(play);
      const id = next.ids[next.index];
      if (id) {
        setResume({ id, position: 0 });
        if (play) pushHistory(id);
      }
    };

    const step = (direction: 1 | -1) => {
      const { queue: q, prefs: p, settings: s } = live.current;
      const last = q.ids.length - 1;
      if (last < 0) return;
      if (direction === 1) {
        if (q.index < last) return go({ ...q, index: q.index + 1 }, true);
        if (p.repeat === "all") return go({ ...q, index: 0 }, true);
        const track = TRACK_BY_ID.get(q.ids[q.index]!);
        if (s.autoplay && track) {
          const more = similar(track, new Set(q.ids), 12);
          if (more.length) {
            toast("비슷한 곡을 이어서 재생합니다");
            return go({ ids: [...q.ids, ...more], index: q.index + 1, origin: q.origin ? [...q.origin, ...more] : undefined }, true);
          }
        }
        show(0);
        setPlaying(false);
        return;
      }
      if (q.index > 0) return go({ ...q, index: q.index - 1 }, true);
      if (p.repeat === "all") return go({ ...q, index: last }, true);
      show(0);
    };

    const play = (ids: readonly string[], start = 0, options?: { shuffle?: boolean }) => {
      if (ids.length === 0) return;
      const wantShuffle = options?.shuffle ?? live.current.prefs.shuffle;
      if (options?.shuffle !== undefined && options.shuffle !== live.current.prefs.shuffle) setPrefs((now) => ({ ...now, shuffle: options.shuffle! }));
      if (wantShuffle) {
        const first = options?.shuffle && start === 0 ? ids[Math.floor(Math.random() * ids.length)]! : ids[start]!;
        const rest = shuffle(random(Date.now()), ids.filter((id) => id !== first));
        return go({ ids: [first, ...rest], index: 0, origin: [...ids] }, true);
      }
      go({ ids: [...ids], index: Math.min(Math.max(0, start), ids.length - 1) }, true);
    };

    const toggle = () => {
      const { current: track, playing: now } = live.current;
      if (!track) return;
      setPlaying(!now);
      if (!now) pushHistory(track.id);
    };

    const seek = (seconds: number) => {
      const { current: track } = live.current;
      if (!track) return;
      const value = Math.min(Math.max(0, seconds), track.duration);
      show(value);
      setResume({ id: track.id, position: value });
    };

    const insert = (ids: readonly string[], where: "next" | "last") => {
      if (ids.length === 0) return;
      const { queue: q } = live.current;
      if (q.ids.length === 0) return play(ids);
      const at = where === "next" ? q.index + 1 : q.ids.length;
      const ids2 = [...q.ids.slice(0, at), ...ids, ...q.ids.slice(at)];
      setQueue({ ...q, ids: ids2, origin: q.origin ? [...q.origin, ...ids] : undefined });
      toast(where === "next" ? `${ids.length}곡을 다음에 재생합니다` : `${ids.length}곡을 대기열 끝에 추가했습니다`);
    };

    const api: Omit<Player, "current" | "queue" | "index" | "playing" | "shuffle" | "repeat" | "volume" | "muted"> = {
      play,
      playTrack: (id, context) => play(context, Math.max(0, context.indexOf(id))),
      toggle,
      next: () => step(1),
      previous: () => {
        if (clock.current > 3) return show(0);
        step(-1);
      },
      seek,
      toggleShuffle: () => {
        const { queue: q, prefs: p } = live.current;
        if (!p.shuffle) {
          const head = q.ids.slice(0, q.index + 1);
          setQueue({ ids: [...head, ...shuffle(random(Date.now()), q.ids.slice(q.index + 1))], index: q.index, origin: q.origin ?? [...q.ids] });
        } else if (q.origin) {
          const upcoming = new Set(q.ids.slice(q.index + 1));
          const ordered = q.origin.filter((id) => upcoming.has(id));
          const rest = q.ids.slice(q.index + 1).filter((id) => !ordered.includes(id));
          setQueue({ ids: [...q.ids.slice(0, q.index + 1), ...ordered, ...rest], index: q.index });
        }
        setPrefs((now) => ({ ...now, shuffle: !now.shuffle }));
      },
      cycleRepeat: () => setPrefs((now) => ({ ...now, repeat: now.repeat === "off" ? "all" : now.repeat === "all" ? "one" : "off" })),
      setVolume: (volume) => setPrefs((now) => ({ ...now, volume, muted: false })),
      toggleMute: () => setPrefs((now) => ({ ...now, muted: !now.muted })),
      playNext: (ids) => insert(ids, "next"),
      playLater: (ids) => insert(ids, "last"),
      jump: (index) => {
        const { queue: q } = live.current;
        if (index >= 0 && index < q.ids.length) go({ ...q, index }, true);
      },
      removeAt: (index) => {
        const { queue: q } = live.current;
        if (index < 0 || index >= q.ids.length) return;
        const ids = q.ids.filter((_, i) => i !== index);
        const origin = q.origin?.filter((id) => id !== q.ids[index]);
        if (index < q.index) return setQueue({ ids, index: q.index - 1, origin });
        if (index > q.index) return setQueue({ ids, index: q.index, origin });
        if (ids.length === 0) {
          setQueue({ ids, index: 0, origin });
          show(0);
          return setPlaying(false);
        }
        go({ ids, index: Math.min(q.index, ids.length - 1), origin }, live.current.playing);
      },
      move: (from, to) => {
        const { queue: q } = live.current;
        if (from === to || from < 0 || to < 0 || from >= q.ids.length || to >= q.ids.length) return;
        const ids = [...q.ids];
        const [item] = ids.splice(from, 1);
        ids.splice(to, 0, item!);
        let index = q.index;
        if (from === q.index) index = to;
        else if (from < q.index && to >= q.index) index = q.index - 1;
        else if (from > q.index && to <= q.index) index = q.index + 1;
        setQueue({ ...q, ids, index });
      },
      clearUpNext: () => {
        const { queue: q } = live.current;
        setQueue({ ids: q.ids.slice(0, q.index + 1), index: q.index, origin: undefined });
        toast("다음 곡을 비웠습니다");
      },
      startRadio: (name, ids) => {
        if (ids.length === 0) return;
        setPrefs((now) => ({ ...now, shuffle: false }));
        go({ ids: [...ids], index: 0 }, true);
        toast(`${withJosa(name, "을/를")} 시작합니다`);
      },
    };
    return { api, finish: () => {
      if (live.current.prefs.repeat === "one") {
        show(0);
        return;
      }
      step(1);
    }, show };
  }, [setQueue, setPrefs, setResume, toast, pushHistory]);

  const finishRef = useRef(actions.finish);
  finishRef.current = actions.finish;
  useEffect(() => {
    if (!playing || !current) return;
    let last = performance.now();
    const length = current.duration;
    const timer = window.setInterval(() => {
      const now = performance.now();
      clock.current += (now - last) / 1000;
      last = now;
      if (clock.current >= length) finishRef.current();
      else setPosition(clock.current);
    }, 250);
    return () => window.clearInterval(timer);
  }, [playing, current]);

  useEffect(() => {
    if (!current) return;
    const save = () => setResume({ id: current.id, position: Math.floor(clock.current) });
    if (!playing) {
      save();
      return;
    }
    const timer = window.setInterval(save, 4000);
    return () => {
      window.clearInterval(timer);
      save();
    };
  }, [playing, current, setResume]);

  const value = useMemo<Player>(() => ({
    current,
    queue: queue.ids,
    index: queue.index,
    playing,
    shuffle: prefs.shuffle,
    repeat: prefs.repeat,
    volume: prefs.volume,
    muted: prefs.muted,
    ...actions.api,
  }), [current, queue.ids, queue.index, playing, prefs, actions]);

  return (
    <PlayerCtx.Provider value={value}>
      <PositionCtx.Provider value={position}>{children}</PositionCtx.Provider>
    </PlayerCtx.Provider>
  );
};
