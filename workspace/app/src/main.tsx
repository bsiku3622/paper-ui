import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { PaperProvider } from "@studio-baeks/paper-ui";

import { App } from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <PaperProvider>
        <App />
      </PaperProvider>
    </BrowserRouter>
  </StrictMode>,
);
