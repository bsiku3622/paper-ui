import "@studio-baeks/paper-ui/styles.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

import { PaperProvider } from "@studio-baeks/paper-ui";

import { detectEmbedded } from "./pages/studio/protocol";
import { routes } from "./routes";
import { THEME } from "./theme";

const router = createBrowserRouter(routes, { basename: import.meta.env.BASE_URL });
const root = createRoot(document.getElementById("root")!);

if (detectEmbedded()) {
  // In the frame of the studio (/demo) the site is drawn through the studio's end of the bridge.
  void import("./pages/studio/embed").then(({ EmbeddedRoot }) => {
    root.render(
      <StrictMode>
        <EmbeddedRoot router={router} />
      </StrictMode>,
    );
  });
} else {
  root.render(
    <StrictMode>
      <PaperProvider {...THEME}>
        <RouterProvider router={router} />
      </PaperProvider>
    </StrictMode>,
  );
}
