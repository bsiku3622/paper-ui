import { createContext, useCallback, useContext, useMemo, type Dispatch, type ReactNode, type SetStateAction } from "react";

import { useStored } from "../../../kit";
import { seedEvents } from "../data/activity";
import { seedFiles } from "../data/files";
import { seedMedia } from "../data/galaxy";
import type { ActivityEvent, FileRow, MediaRow, PeerRow, WolDevice } from "../data/types";
import { seedPeers } from "../data/wireguard";
import { seedDevices } from "../data/wol";
import { before, HOUR, now, startClock } from "../lib/clock";
import { makeId } from "../lib/fake";
import { storageKey } from "./keys";

type Setter<T> = Dispatch<SetStateAction<T>>;
export type NewEvent = Omit<ActivityEvent, "id" | "at">;

export type Store = {
  signedIn: boolean;
  setSignedIn: Setter<boolean>;
  files: FileRow[];
  setFiles: Setter<FileRow[]>;
  peers: PeerRow[];
  setPeers: Setter<PeerRow[]>;
  devices: WolDevice[];
  setDevices: Setter<WolDevice[]>;
  media: MediaRow[];
  setMedia: Setter<MediaRow[]>;
  events: ActivityEvent[];
  log: (event: NewEvent) => void;
  seenAt: number;
  markSeen: () => void;
  reset: () => void;
};

const Context = createContext<Store | null>(null);

const firstVisit = () => Date.now();
const firstSeen = () => before(9 * HOUR);

export const useAdmin = () => {
  const store = useContext(Context);
  if (!store) throw new Error("useAdmin needs the AdminStore around it");
  return store;
};

export const AdminStore = ({ children }: { children: ReactNode }) => {
  const [startedAt, , resetStart] = useStored<number>(storageKey("clock"), firstVisit);
  startClock(startedAt);

  const [signedIn, setSignedIn, resetSession] = useStored<boolean>(storageKey("session"), true);
  const [files, setFiles, resetFiles] = useStored<FileRow[]>(storageKey("files"), seedFiles);
  const [peers, setPeers, resetPeers] = useStored<PeerRow[]>(storageKey("peers"), seedPeers);
  const [devices, setDevices, resetDevices] = useStored<WolDevice[]>(storageKey("devices"), seedDevices);
  const [media, setMedia, resetMedia] = useStored<MediaRow[]>(storageKey("media"), seedMedia);
  const [events, setEvents, resetEvents] = useStored<ActivityEvent[]>(storageKey("events"), seedEvents);
  const [seenAt, setSeenAt, resetSeen] = useStored<number>(storageKey("seen"), firstSeen);

  const log = useCallback((event: NewEvent) => {
    setEvents((list) => [{ id: makeId("ev"), at: now(), ...event }, ...list].slice(0, 500));
  }, [setEvents]);

  const markSeen = useCallback(() => setSeenAt(now()), [setSeenAt]);

  const reset = useCallback(() => {
    resetStart();
    resetSession();
    resetFiles();
    resetPeers();
    resetDevices();
    resetMedia();
    resetEvents();
    resetSeen();
  }, [resetStart, resetSession, resetFiles, resetPeers, resetDevices, resetMedia, resetEvents, resetSeen]);

  const value = useMemo<Store>(
    () => ({ signedIn, setSignedIn, files, setFiles, peers, setPeers, devices, setDevices, media, setMedia, events, log, seenAt, markSeen, reset }),
    [signedIn, setSignedIn, files, setFiles, peers, setPeers, devices, setDevices, media, setMedia, events, log, seenAt, markSeen, reset],
  );
  return <Context.Provider value={value}>{children}</Context.Provider>;
};
