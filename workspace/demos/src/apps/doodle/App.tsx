// Doodle — an infinite workspace for thoughts, and it is one screen: the canvas. Markdown documents lie side by side on it,
// text boxes, pictures and videos are put anywhere, the pen draws over them, and the day's to-dos, routines and calendar
// stand in a panel at the right.
//
//   /doodle    the workspace

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
