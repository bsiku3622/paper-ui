// Toast — a short word after an action ("저장했습니다"), at the bottom of the window for a few seconds, also read aloud.
// const toast = useToast(); toast("복사했습니다"); toast("삭제했습니다", { action: { label: "되돌리기", onSelect } }).

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";

import { announce, Box, Button, elevation, Inline, Portal, Stack, Surface, Text } from "@studio-baeks/paper-ui";

import { toastDock, toastItem } from "./kit.css";

type ToastOptions = { tone?: "error"; action?: { label: string; onSelect: () => void } };
type ToastEntry = ToastOptions & { id: number; message: string };

const Ctx = createContext<(message: string, options?: ToastOptions) => void>(() => {});
export const useToast = () => useContext(Ctx);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [entries, setEntries] = useState<ToastEntry[]>([]);
  const next = useRef(0);
  const dismiss = useCallback((id: number) => setEntries((now) => now.filter((entry) => entry.id !== id)), []);
  const toast = useCallback((message: string, options: ToastOptions = {}) => {
    const id = next.current++;
    setEntries((now) => [...now.slice(-2), { id, message, ...options }]);
    announce(message);
    window.setTimeout(() => dismiss(id), options.action ? 6000 : 3500);
  }, [dismiss]);
  return (
    <Ctx.Provider value={toast}>
      {children}
      {entries.length > 0 ? (
        <Portal>
          <Box className={`${elevation.toast} ${toastDock}`}>
            <Stack gap="sm" align="center">
              {entries.map((entry) => (
                <Surface key={entry.id} theme="inverse" fill="canvas" radius="full" elevation="toast" paddingX="lg" paddingY="sm" className={toastItem}>
                  <Inline gap="md" align="center">
                    <Text as="span" ink={entry.tone === "error" ? "error" : undefined}>{entry.message}</Text>
                    {entry.action ? (
                      <Button size="xs" variant="ghost" onClick={() => { entry.action!.onSelect(); dismiss(entry.id); }}>{entry.action.label}</Button>
                    ) : null}
                  </Inline>
                </Surface>
              ))}
            </Stack>
          </Box>
        </Portal>
      ) : null}
    </Ctx.Provider>
  );
};
