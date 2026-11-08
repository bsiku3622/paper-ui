import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

import { AddToPlaylistDialog } from "../parts/AddToPlaylistDialog";
import { PlaylistDialog } from "../parts/PlaylistDialog";

type Open = { kind: "edit"; id?: string; seed: readonly string[]; key: number } | { kind: "add"; ids: readonly string[]; key: number } | null;

type Dialogs = {
  editPlaylist: (id?: string, seed?: readonly string[]) => void;
  addToPlaylist: (trackIds: readonly string[]) => void;
};

const Ctx = createContext<Dialogs | null>(null);

export const DialogProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState<Open>(null);
  const value = useMemo<Dialogs>(() => ({
    editPlaylist: (id, seed = []) => setOpen({ kind: "edit", id, seed, key: Date.now() }),
    addToPlaylist: (ids) => setOpen({ kind: "add", ids, key: Date.now() }),
  }), []);
  const close = () => setOpen(null);
  return (
    <Ctx.Provider value={value}>
      {children}
      {open?.kind === "edit" ? <PlaylistDialog key={open.key} id={open.id} seed={open.seed} onClose={close} /> : null}
      {open?.kind === "add" ? <AddToPlaylistDialog key={open.key} trackIds={open.ids} onClose={close} onCreate={(ids) => setOpen({ kind: "edit", seed: ids, key: Date.now() })} /> : null}
    </Ctx.Provider>
  );
};

export const useDialogs = () => {
  const value = useContext(Ctx);
  if (!value) throw new Error("useDialogs needs DialogProvider");
  return value;
};
