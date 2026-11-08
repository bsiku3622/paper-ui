// What the operator console keeps between visits, in one place: panels act on each other (a collection adds a revision and a
// backup, deleting an account signs its devices out), so they read and write the same lists. Each list is kept with
// useStored under "classes:admin:…". No password is ever kept — an account is its username, its role and its dates.

import { createContext, useContext, type ReactNode } from "react";

import { useStored } from "../../../../kit";
import {
  firstAccounts, firstBackups, firstFacts, firstOverrides, firstSessions, firstVersions,
  type Account, type Backup, type DeviceSession, type MemoryFact, type Override, type VersionRow,
} from "../../data/admin";

type Setter<T> = (next: T | ((now: T) => T)) => void;

// Names someone changed in the data tables: student ID → name, and a teacher's old name → the new one.
export type Renames = { students: Record<string, string>; teachers: Record<string, string> };

type Store = {
  accounts: Account[];
  setAccounts: Setter<Account[]>;
  sessions: DeviceSession[];
  setSessions: Setter<DeviceSession[]>;
  facts: MemoryFact[];
  setFacts: Setter<MemoryFact[]>;
  versions: VersionRow[];
  setVersions: Setter<VersionRow[]>;
  backups: Backup[];
  setBackups: Setter<Backup[]>;
  overrides: Override[];
  setOverrides: Setter<Override[]>;
  renames: Renames;
  setRenames: Setter<Renames>;
};

const Ctx = createContext<Store | null>(null);

export const useAdmin = () => {
  const value = useContext(Ctx);
  if (!value) throw new Error("useAdmin needs <AdminProvider>");
  return value;
};

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [accounts, setAccounts] = useStored<Account[]>("classes:admin:accounts", firstAccounts);
  const [sessions, setSessions] = useStored<DeviceSession[]>("classes:admin:sessions", firstSessions);
  const [facts, setFacts] = useStored<MemoryFact[]>("classes:admin:facts", firstFacts);
  const [versions, setVersions] = useStored<VersionRow[]>("classes:admin:versions", firstVersions);
  const [backups, setBackups] = useStored<Backup[]>("classes:admin:backups", firstBackups);
  const [overrides, setOverrides] = useStored<Override[]>("classes:admin:overrides", firstOverrides);
  const [renames, setRenames] = useStored<Renames>("classes:admin:renames", { students: {}, teachers: {} });
  const value: Store = { accounts, setAccounts, sessions, setSessions, facts, setFacts, versions, setVersions, backups, setBackups, overrides, setOverrides, renames, setRenames };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};
