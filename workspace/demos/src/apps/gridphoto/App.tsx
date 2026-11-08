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
