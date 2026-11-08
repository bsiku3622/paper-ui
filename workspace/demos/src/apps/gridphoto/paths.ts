// Where each screen lives. The document's current page and the mode it is in (the scan, the original, the corners) are in
// the address, so each can be linked to and looked at on its own.

export const BASE = "/gridphoto";

export const paths = {
  home: BASE,
  page: (id: string) => `${BASE}/page/${id}`,
  original: (id: string) => `${BASE}/page/${id}/original`,
  corners: (id: string) => `${BASE}/page/${id}/corners`,
} as const;
