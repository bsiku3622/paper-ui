import { Route, Routes } from "react-router-dom";

import { LoginGate } from "./auth/LoginGate";
import { ActivityPage } from "./pages/activity/ActivityPage";
import { FileDetailPage } from "./pages/files/FileDetailPage";
import { FilesPage } from "./pages/files/FilesPage";
import { GalaxyPage } from "./pages/galaxy/GalaxyPage";
import { HomePage } from "./pages/HomePage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { SearchPage } from "./pages/SearchPage";
import { PeerDetailPage } from "./pages/wireguard/PeerDetailPage";
import { WireGuardPage } from "./pages/wireguard/WireGuardPage";
import { WolDevicePage } from "./pages/wol/WolDevicePage";
import { WolPage } from "./pages/wol/WolPage";
import { Shell } from "./shell/Shell";
import { AdminStore } from "./store/store";

export default function App() {
  return (
    <AdminStore>
      <LoginGate>
        <Shell>
          <Routes>
            <Route index element={<HomePage />} />
            <Route path="s/files" element={<FilesPage />} />
            <Route path="s/files/:fileId" element={<FileDetailPage />} />
            <Route path="s/wireguard" element={<WireGuardPage />} />
            <Route path="s/wireguard/:peerId" element={<PeerDetailPage />} />
            <Route path="s/wol" element={<WolPage />} />
            <Route path="s/wol/:deviceId" element={<WolDevicePage />} />
            <Route path="s/galaxy" element={<GalaxyPage />} />
            <Route path="activity" element={<ActivityPage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="s/*" element={<NotFoundPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Shell>
      </LoginGate>
    </AdminStore>
  );
}
