// 대화상자: 어디서든 "플레이리스트 만들기 · 고치기"와 "플레이리스트에 추가"를 열 수 있게 하나의 자리에서 들고 있습니다.

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

import { AddToPlaylistDialog } from "../parts/AddToPlaylistDialog";
import { PlaylistDialog } from "../parts/PlaylistDialog";

type Open = { kind: "edit"; id?: string; seed: readonly string[]; key: number } | { kind: "add"; ids: readonly string[]; key: number } | null;

type Dialogs = {
  // id가 없으면 새 플레이리스트입니다. seed는 처음부터 담아 둘 곡입니다.
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
