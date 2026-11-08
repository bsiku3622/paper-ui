import "@studio-baeks/paper-ui/styles.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { PaperProvider } from "@studio-baeks/paper-ui";

import { App } from "./App";
import { ToastProvider } from "./kit";

const framed = window.self !== window.top;
const asked = new URLSearchParams(window.location.search).get("theme");
const theme = asked === "dark" || asked === "light" ? asked : undefined;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter basename="/demos">
      <PaperProvider locale="ko" {...(framed ? { storageKey: null } : {})} {...(theme ? { defaultTheme: theme } : {})}>
        <ToastProvider>
          <App />
        </ToastProvider>
      </PaperProvider>
    </BrowserRouter>
  </StrictMode>,
);
