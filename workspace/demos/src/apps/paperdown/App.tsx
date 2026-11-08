// Paperdown: a Markdown-to-paper typesetter, drawn with the kit and Paper alone. The routes are the home, a document, and a page
// that is not there.
//
//   /paperdown                  the home: a guest's "이 기기의 문서", or a signed-in account's documents
//   /paperdown/documents/:id    the editor (`local` is the document this browser keeps)
//   anything else               a page that is not there

import { Route, Routes } from "react-router-dom";

import { StoreProvider, useStore } from "./lib/store";
import { EditorPage } from "./pages/Editor";
import { Landing } from "./pages/Landing";
import { Library } from "./pages/Library";
import { NotFound } from "./pages/NotFound";
import { AuthDialog } from "./parts/AuthDialog";

const Home = () => {
  const { user } = useStore();
  return user ? <Library /> : <Landing />;
};

export default function App() {
  return (
    <StoreProvider>
      <Routes>
        <Route index element={<Home />} />
        <Route path="documents/:id" element={<EditorPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <AuthDialog />
    </StoreProvider>
  );
}
