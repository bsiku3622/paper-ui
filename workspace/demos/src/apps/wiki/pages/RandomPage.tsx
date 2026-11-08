// RandomPage.tsx — sends the reader to an article picked by chance (not a redirect, not a stub-less page).

import { useState } from "react";
import { Navigate } from "react-router-dom";

import { articlePath, homePath } from "../lib/paths";
import { useWiki } from "../state/store";

export const RandomPage = () => {
  const { index } = useWiki();
  const [title] = useState(() => {
    const titles = [...index.articles.values()].filter((article) => !article.redirect).map((article) => article.title);
    return titles[Math.floor(Math.random() * titles.length)];
  });
  return <Navigate to={title ? articlePath(title) : homePath()} replace />;
};
