import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { PaperProvider } from "@studio-baeks/paper-ui";

import { App } from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PaperProvider>
      <App />
    </PaperProvider>
  </StrictMode>,
);
