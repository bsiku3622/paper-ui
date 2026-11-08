import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, type ReactNode } from "react";

import { useStored } from "../../../kit";
import type { SimState } from "../model";
import { useSettings } from "../settings";
import { initialState, step } from "./engine";
import { execute } from "./gcode";

type Updater = (state: SimState) => SimState;

const reduce = (state: SimState, change: Updater) => change(state);

type Actions = {
  send: (gcode: string | readonly string[]) => void;
  update: (change: Updater) => void;
  commands: readonly string[];
  remember: (command: string, limit: number) => void;
  forget: () => void;
};

const StateCtx = createContext<SimState | null>(null);
const ActionsCtx = createContext<Actions | null>(null);

export const PrinterProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reduce, undefined, initialState);
  const [commands, setCommands] = useStored<string[]>("printer:commands", []);
  const { settings } = useSettings();
  const speed = settings.general.simSpeed;
  useEffect(() => {
    const timer = window.setInterval(
      () =>
        dispatch((now) => {
          let next = now;
          for (let i = 0; i < speed; i++) next = step(next, 1);
          return next;
        }),
      1000,
    );
    return () => window.clearInterval(timer);
  }, [speed]);
  const send = useCallback((gcode: string | readonly string[]) => {
    const text = typeof gcode === "string" ? gcode : gcode.join("\n");
    dispatch((now) => execute(now, text));
  }, []);
  const update = useCallback((change: Updater) => dispatch(change), []);
  const remember = useCallback(
    (command: string, limit: number) => setCommands((now) => [...now.filter((item) => item !== command), command].slice(-Math.max(1, limit))),
    [setCommands],
  );
  const forget = useCallback(() => setCommands([]), [setCommands]);
  const actions = useMemo<Actions>(() => ({ send, update, commands, remember, forget }), [send, update, commands, remember, forget]);
  return (
    <ActionsCtx.Provider value={actions}>
      <StateCtx.Provider value={state}>{children}</StateCtx.Provider>
    </ActionsCtx.Provider>
  );
};

export const useSim = () => {
  const value = useContext(StateCtx);
  if (!value) throw new Error("useSim needs PrinterProvider");
  return value;
};

export const useActions = () => {
  const value = useContext(ActionsCtx);
  if (!value) throw new Error("useActions needs PrinterProvider");
  return value;
};
