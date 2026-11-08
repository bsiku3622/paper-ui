import "@studio-baeks/paper-ui/styles.css";

import { StrictMode, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

import { PaperProvider } from "@studio-baeks/paper-ui";

import { routes } from "./routes";
import { SiteLocaleProvider, useSiteLocale } from "./site/locale";
import { THEME } from "./theme";

const router = createBrowserRouter(routes, { basename: import.meta.env.BASE_URL });

// Paper takes the site's language: it writes <html lang> and says its own words in it.
const Paper = ({ children }: { children: ReactNode }) => {
  const { locale } = useSiteLocale();
  return <PaperProvider {...THEME} locale={locale}>{children}</PaperProvider>;
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SiteLocaleProvider>
      <Paper>
        <RouterProvider router={router} />
      </Paper>
    </SiteLocaleProvider>
  </StrictMode>,
);
