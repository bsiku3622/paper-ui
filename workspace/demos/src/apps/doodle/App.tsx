import { Navigate, Route, Routes } from "react-router-dom";

import { Workspace } from "./screens/Workspace";

export default function App() {
  return (
    <Routes>
      <Route index element={<Workspace />} />
      <Route path="*" element={<Navigate to="/doodle" replace />} />
    </Routes>
  );
}
