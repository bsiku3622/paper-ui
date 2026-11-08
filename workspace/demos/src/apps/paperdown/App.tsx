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
