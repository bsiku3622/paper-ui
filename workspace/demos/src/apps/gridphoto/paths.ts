export const BASE = "/gridphoto";

export const paths = {
  home: BASE,
  page: (id: string) => `${BASE}/page/${id}`,
  original: (id: string) => `${BASE}/page/${id}/original`,
  corners: (id: string) => `${BASE}/page/${id}/corners`,
} as const;
