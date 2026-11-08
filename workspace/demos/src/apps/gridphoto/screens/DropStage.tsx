// The well where photos sit, and where photos can be dropped. A file dragged over it turns the well white and outlines the
// place to let go; dropping adds the files to the document (their names only: nothing is read).

import type { ReactNode } from "react";

import { Droppable, Paint, Surface, useResolvedTheme } from "@studio-baeks/paper-ui";

import { useGridphoto } from "../state/document";

const IMAGES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/heic", "image/heif"];

// The well itself. In the dark the well and the page are one step, so a line tells them apart.
export const Well = ({ children, over = false }: { children: ReactNode; over?: boolean }) => {
  const dark = useResolvedTheme() === "dark";
  return (
    <Surface fill={over ? "raised" : "sunken"} border={dark || over} radius="lg" padding="sm">
      <Paint accent={over ? "info" : "primary"} variant={over ? "dashed" : "ghost"} padding="md">
        {children}
      </Paint>
    </Surface>
  );
};

export const DropStage = ({ children }: { children: ReactNode }) => {
  const { addFiles } = useGridphoto();
  return (
    <Droppable
      aria-label="사진을 놓는 곳"
      getDropOperation={(types) => (IMAGES.some((type) => types.has(type)) ? "copy" : "cancel")}
      onDrop={({ items }) => {
        const names = items.flatMap((item) => (item.kind === "file" && (item.type.startsWith("image/") || item.type === "") ? [item.name] : []));
        if (names.length > 0) addFiles(names);
      }}
    >
      {({ isDropTarget }) => <Well over={isDropTarget}>{children}</Well>}
    </Droppable>
  );
};
