import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import { AppShell } from "../../kit";
import { homePath } from "./lib/paths";
import { ArticlePage } from "./pages/ArticlePage";
import { CategoryPage } from "./pages/CategoryPage";
import { DiffPage } from "./pages/DiffPage";
import { DiscussPage } from "./pages/DiscussPage";
import { EditPage } from "./pages/EditPage";
import { HistoryPage } from "./pages/HistoryPage";
import { LoginPage } from "./pages/LoginPage";
import { BacklinksPage, NotFoundPage, StarredPage } from "./pages/MiscPages";
import { RandomPage } from "./pages/RandomPage";
import { RecentDiscussPage } from "./pages/RecentDiscussPage";
import { RecentPage } from "./pages/RecentPage";
import { SearchPage } from "./pages/SearchPage";
import { SpecialIndex, SpecialList } from "./pages/SpecialPages";
import { ThreadPage } from "./pages/ThreadPage";
import { UserPage } from "./pages/UserPage";
import { Aside } from "./parts/Aside";
import { Bar } from "./parts/Bar";
import { jump } from "./render/jump";
import { WikiProvider } from "./state/store";

const ScrollToTop = () => {
  const { pathname, search, hash } = useLocation();
  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0 });
      return undefined;
    }
    const timer = window.setTimeout(() => jump(decodeURIComponent(hash.slice(1))), 120);
    return () => window.clearTimeout(timer);
  }, [pathname, search, hash]);
  return null;
};

export default function App() {
  return (
    <WikiProvider>
      <AppShell name="돌담위키" kind="page" top={<Bar />} topSpan="full" aside={<Aside />}>
        <ScrollToTop />
        <Routes>
          <Route index element={<Navigate to={homePath()} replace />} />
          <Route path="w/*" element={<ArticlePage />} />
          <Route path="edit/*" element={<EditPage />} />
          <Route path="history/*" element={<HistoryPage />} />
          <Route path="diff/*" element={<DiffPage />} />
          <Route path="discuss/*" element={<DiscussPage />} />
          <Route path="thread/:id" element={<ThreadPage />} />
          <Route path="backlinks/*" element={<BacklinksPage />} />
          <Route path="recent" element={<RecentPage />} />
          <Route path="recent-discuss" element={<RecentDiscussPage />} />
          <Route path="random" element={<RandomPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="category/*" element={<CategoryPage />} />
          <Route path="special" element={<SpecialIndex />} />
          <Route path="special/:kind" element={<SpecialList />} />
          <Route path="user/:name" element={<UserPage />} />
          <Route path="starred" element={<StarredPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AppShell>
    </WikiProvider>
  );
}
