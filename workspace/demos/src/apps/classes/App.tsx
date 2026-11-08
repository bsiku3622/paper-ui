import { Navigate, Route, Routes } from "react-router-dom";

import { ClassesProvider, hasRole, path, useClasses } from "./state";
import { AboutPage } from "./pages/About";
import { AdminPage } from "./pages/Admin";
import { AnalysisPage } from "./pages/Analysis";
import { AskPage } from "./pages/Ask";
import { BrowsePage } from "./pages/Browse";
import { CalendarPage } from "./pages/Calendar";
import { ExamsPage } from "./pages/Exams";
import { FilesPage } from "./pages/Files";
import { GoogleLinkPage } from "./pages/GoogleLink";
import { Home } from "./pages/Home";
import { LandingPage } from "./pages/Landing";
import { LoginPage } from "./pages/Login";
import { PrivacyPage } from "./pages/Privacy";
import { RoomsPage } from "./pages/Rooms";
import { SearchPage } from "./pages/Search";
import { TradePage } from "./pages/Trade";
import { UploadPage } from "./pages/Upload";
import { ZamongPage } from "./pages/Zamong";
import { Shell } from "./Shell";

const Gate = () => {
  const { session } = useClasses();
  if (!session.signedIn) return <Navigate to={path("/welcome")} replace />;
  if (!session.linked) return <GoogleLinkPage />;
  return <Shell />;
};

const AdminOnly = () => {
  const { session } = useClasses();
  return hasRole(session.role, "admin") ? <AdminPage /> : <Navigate to={path()} replace />;
};

export default function App() {
  return (
    <ClassesProvider>
      <Routes>
        <Route path="welcome" element={<LandingPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="privacy" element={<PrivacyPage />} />
        <Route element={<Gate />}>
          <Route index element={<Home />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="rooms" element={<RoomsPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="ask" element={<AskPage />} />
          <Route path="browse" element={<BrowsePage />} />
          <Route path="analysis" element={<AnalysisPage />} />
          <Route path="files" element={<FilesPage />} />
          <Route path="upload" element={<UploadPage />} />
          <Route path="zamong" element={<ZamongPage />} />
          <Route path="trade" element={<TradePage />} />
          <Route path="exams" element={<ExamsPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="admin" element={<AdminOnly />} />
        </Route>
        <Route path="*" element={<Navigate to={path()} replace />} />
      </Routes>
    </ClassesProvider>
  );
}
