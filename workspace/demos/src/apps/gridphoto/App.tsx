// GridPhoto: photograph sheets of paper, and get a scanned PDF. It finds each sheet's four corners, pulls
// it into an exact rectangle, evens out shadows and light; a sheet with a grid or lines of its own is pulled along them.
// Pages can be added, reordered and removed, and each keeps its own filter, shape and rotation.
//
// Here the engine is a stand-in: a photo is a name, the steps are timers, and a save is a bar that fills (see model/mock.ts).
//
//   /gridphoto                         the document's current page, or the first screen when there is nothing in it
//   /gridphoto/page/:id                a page as a scan
//   /gridphoto/page/:id/original       the photo it came from, with what was found traced over it
//   /gridphoto/page/:id/corners        placing the four corners by hand

import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { AppShell } from "../../kit";
import { paths } from "./paths";
import { DocumentProvider, useGridphoto } from "./state/document";
import { Editor } from "./screens/Editor";
import { Header } from "./screens/Header";
import { Start } from "./screens/Start";

const Home = () => {
  const { pages, current } = useGridphoto();
  if (pages.length === 0) return <Start />;
  return <Navigate to={paths.page((current ?? pages[0]!).id)} replace />;
};

const Frame = () => {
  const { addFiles } = useGridphoto();

  // A picture pasted anywhere in the window is a photo to add.
  useEffect(() => {
    const paste = (event: ClipboardEvent) => {
      const files = [...(event.clipboardData?.files ?? [])].filter((file) => file.type.startsWith("image/"));
      if (files.length > 0) addFiles(files.map((file) => file.name || "붙여넣은 사진"));
    };
    window.addEventListener("paste", paste);
    return () => window.removeEventListener("paste", paste);
  }, [addFiles]);

  return (
    <AppShell kind="page" name="GridPhoto" top={<Header />}>
      <Routes>
        <Route index element={<Home />} />
        <Route path="page/:pageId" element={<Editor view="result" />} />
        <Route path="page/:pageId/original" element={<Editor view="source" />} />
        <Route path="page/:pageId/corners" element={<Editor view="corners" />} />
        <Route path="*" element={<Navigate to={paths.home} replace />} />
      </Routes>
    </AppShell>
  );
};

export default function App() {
  return (
    <DocumentProvider>
      <Frame />
    </DocumentProvider>
  );
}
