// 프린터 콘솔: Mainsail's pages for a Klipper printer, drawn with Paper. The printer here is a mock that starts in the
// middle of a print (at 95%) and keeps going; nothing reaches a real machine.

import { Route, Routes } from "react-router-dom";

import { Console } from "./pages/Console";
import { Dashboard } from "./pages/Dashboard";
import { Files } from "./pages/Files";
import { Heightmap } from "./pages/Heightmap";
import { History } from "./pages/History";
import { Machine } from "./pages/Machine";
import { Viewer } from "./pages/Viewer";
import { WebcamPage } from "./pages/Webcam";
import { SettingsProvider } from "./settings";
import { Shell } from "./shell/Shell";
import { PrinterProvider } from "./sim/Provider";

export default function App() {
  return (
    <SettingsProvider>
      <PrinterProvider>
        <Shell>
          <Routes>
            <Route index element={<Dashboard />} />
            <Route path="cam" element={<WebcamPage />} />
            <Route path="console" element={<Console />} />
            <Route path="heightmap" element={<Heightmap />} />
            <Route path="files" element={<Files />} />
            <Route path="viewer" element={<Viewer />} />
            <Route path="history" element={<History />} />
            <Route path="machine" element={<Machine />} />
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </Shell>
      </PrinterProvider>
    </SettingsProvider>
  );
}
