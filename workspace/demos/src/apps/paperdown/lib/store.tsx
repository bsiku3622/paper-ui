// What the app remembers: the one document this browser keeps (the guest's), a mocked account with its notes, and the
// small states the pages share (the sign-in window, the notes rail). Everything is in localStorage through the kit's
// useStored, under keys of this version, so a browser that held an earlier build of this demo is not read as this one.
//
// The account is a stand-in. Signing in takes a user name and nothing else: no password is asked for in the code, held in
// state or stored anywhere.

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

import { useStored } from "../../../kit";
import { emptyNote, sampleDocument } from "../data/sample";
import { seedNotes } from "../data/notes";
import type { DocumentData } from "./types";

export type User = { id: string; username: string };
export type Auth = { open: boolean; register: boolean };

export const VALID_ID = /^[a-zA-Z0-9_-]+$/;
export const documentPath = (id: string) => `/paperdown/documents/${encodeURIComponent(id)}`;

type Store = {
  user: User | null;
  guest: DocumentData;
  notes: DocumentData[];
  auth: Auth;
  notesOpen: boolean;
  openAuth: (register?: boolean) => void;
  closeAuth: () => void;
  setRegister: (register: boolean) => void;
  signIn: (username: string) => void;
  signOut: () => void;
  setNotesOpen: (open: boolean) => void;
  save: (doc: DocumentData) => void;
  createNote: (from?: DocumentData) => DocumentData;
  removeNote: (id: string) => void;
  find: (id: string) => DocumentData | undefined;
};

const Ctx = createContext<Store | null>(null);

export const useStore = () => {
  const store = useContext(Ctx);
  if (!store) throw new Error("useStore outside StoreProvider");
  return store;
};

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useStored<User | null>("paperdown:v2:user", null);
  const [guest, setGuest] = useStored<DocumentData>("paperdown:v2:guest", sampleDocument);
  const [notes, setNotes] = useStored<DocumentData[]>("paperdown:v2:notes", seedNotes);
  const [auth, setAuth] = useState<Auth>({ open: false, register: false });
  const [notesOpen, setNotesOpen] = useState(false);

  const openAuth = useCallback((register = false) => setAuth({ open: true, register }), []);
  const closeAuth = useCallback(() => setAuth((now) => ({ ...now, open: false })), []);
  const setRegister = useCallback((register: boolean) => setAuth((now) => ({ ...now, register })), []);
  const signIn = useCallback((username: string) => {
    setUser({ id: "u-demo", username });
    setAuth((now) => ({ ...now, open: false }));
  }, [setUser]);
  const signOut = useCallback(() => {
    setUser(null);
    setNotesOpen(false);
  }, [setUser]);

  const save = useCallback((doc: DocumentData) => {
    if (doc.id === "local") setGuest(doc);
    else setNotes((now) => now.map((note) => (note.id === doc.id ? doc : note)));
  }, [setGuest, setNotes]);
  const createNote = useCallback((from?: DocumentData) => {
    const id = `n-${Date.now().toString(36)}`;
    const note = from ? { ...from, id, updatedAt: Date.now() } : emptyNote(id);
    setNotes((now) => [note, ...now]);
    return note;
  }, [setNotes]);
  const removeNote = useCallback((id: string) => setNotes((now) => now.filter((note) => note.id !== id)), [setNotes]);
  const find = useCallback((id: string) => (id === "local" ? guest : notes.find((note) => note.id === id)), [guest, notes]);

  const value = useMemo<Store>(
    () => ({ user, guest, notes, auth, notesOpen, openAuth, closeAuth, setRegister, signIn, signOut, setNotesOpen, save, createNote, removeNote, find }),
    [user, guest, notes, auth, notesOpen, openAuth, closeAuth, setRegister, signIn, signOut, save, createNote, removeNote, find],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};
