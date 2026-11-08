// paths.ts — where every page of the wiki lives.

import { cleanTitle } from "./markup";

export const BASE = "/wiki";

const part = (title: string) => title.split("/").map(encodeURIComponent).join("/");
const query = (params: Record<string, string | number | null | undefined>) => {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) if (value !== null && value !== undefined && value !== "") search.set(key, String(value));
  const text = search.toString();
  return text ? `?${text}` : "";
};

export const homePath = () => `${BASE}/w/대문`;
export const articlePath = (title: string, hash?: string, rev?: number | null) => `${BASE}/w/${part(title)}${query({ rev })}${hash ? `#${hash}` : ""}`;
export const rawPath = (title: string, rev?: number | null) => `${BASE}/w/${part(title)}${query({ rev, raw: 1 })}`;
export const editPath = (title: string, section?: number | null) => `${BASE}/edit/${part(title)}${query({ section })}`;
export const historyPath = (title: string) => `${BASE}/history/${part(title)}`;
export const diffPath = (title: string, oldRev: number, newRev: number) => `${BASE}/diff/${part(title)}${query({ old: oldRev, new: newRev })}`;
export const discussPath = (title: string) => `${BASE}/discuss/${part(title)}`;
export const threadPath = (id: string) => `${BASE}/thread/${encodeURIComponent(id)}`;
export const backlinksPath = (title: string) => `${BASE}/backlinks/${part(title)}`;
export const userPath = (name: string) => `${BASE}/user/${encodeURIComponent(name)}`;
export const categoryPath = (name: string) => `${BASE}/category/${part(name)}`;
export const searchPath = (q: string) => `${BASE}/search${query({ q })}`;
export const specialPath = (kind?: string) => `${BASE}/special${kind ? `/${kind}` : ""}`;
export const recentPath = () => `${BASE}/recent`;
export const recentDiscussPath = () => `${BASE}/recent-discuss`;
export const randomPath = () => `${BASE}/random`;
export const loginPath = (next?: string) => `${BASE}/login${query({ next })}`;
export const starredPath = () => `${BASE}/starred`;

// A route's wildcard back into a title.
export const titleOf = (raw: string | undefined) => {
  const text = raw ?? "";
  try {
    return cleanTitle(text.includes("%") ? decodeURIComponent(text) : text);
  } catch {
    return cleanTitle(text);
  }
};
