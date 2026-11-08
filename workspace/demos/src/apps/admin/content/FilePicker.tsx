// Paper has no file input. This is the native one, hidden, with a render prop that hands the screen an `open` function to
// call from any Paper button. It keeps only what the hub shows of a file (its name, its path inside a folder, its size);
// the bytes are never read and nothing is sent anywhere.

import type { ReactNode } from "react";
import { useRef } from "react";

export type PickedFile = { name: string; path: string; size: number };

type Props = {
  directory?: boolean;
  disabled?: boolean;
  onPick: (files: PickedFile[]) => void;
  children: (open: () => void) => ReactNode;
};

export const FilePicker = ({ directory = false, disabled = false, onPick, children }: Props) => {
  const input = useRef<HTMLInputElement>(null);
  const folder: Record<string, string> = directory ? { webkitdirectory: "", directory: "" } : {};
  return (
    <>
      <input
        ref={input}
        type="file"
        hidden
        multiple
        disabled={disabled}
        {...folder}
        onChange={(event) => {
          const chosen = Array.from(event.currentTarget.files ?? []);
          if (chosen.length) onPick(chosen.map((file) => ({ name: file.name, path: file.webkitRelativePath || file.name, size: file.size })));
          event.currentTarget.value = "";
        }}
      />
      {children(() => input.current?.click())}
    </>
  );
};
