import { useRef, type ReactNode } from "react";

export const FilePicker = ({ accept, multiple = false, onPick, children }: { accept?: string; multiple?: boolean; onPick: (files: File[]) => void; children: (open: () => void) => ReactNode }) => {
  const input = useRef<HTMLInputElement | null>(null);
  return (
    <>
      <input
        ref={input}
        type="file"
        hidden
        accept={accept}
        multiple={multiple}
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          if (files.length > 0) onPick(files);
          event.target.value = "";
        }}
      />
      {children(() => input.current?.click())}
    </>
  );
};

export const downloadText = (name: string, text: string, type = "text/plain") => {
  const url = URL.createObjectURL(new Blob([text], { type: `${type};charset=utf-8` }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};
