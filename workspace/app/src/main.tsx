import "@studio-baeks/paper-ui/styles.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { PaperProvider } from "@studio-baeks/paper-ui";

import { App } from "./App";
import { THEME } from "./theme";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <PaperProvider {...THEME}>
        <App />
      </PaperProvider>
    </BrowserRouter>
  </StrictMode>,
);
