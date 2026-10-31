import "@studio-baeks/paper-ui/styles.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

import { PaperProvider } from "@studio-baeks/paper-ui";

import { routes } from "./routes";
import { THEME } from "./theme";

const router = createBrowserRouter(routes, { basename: import.meta.env.BASE_URL });

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PaperProvider {...THEME}>
      <RouterProvider router={router} />
    </PaperProvider>
  </StrictMode>,
);
