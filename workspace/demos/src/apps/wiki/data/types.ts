export type RevKind = "create" | "edit" | "revert";

export type Rev = {
  n: number;
  title: string;
  text: string;
  at: number;
  author: string;
  summary: string;
  size: number;
  delta: number;
  minor: boolean;
  kind: RevKind;
  revertOf?: number;
};

export type UserRev = { title: string; text: string; at: number; author: string; summary: string; minor: boolean; kind: RevKind; revertOf?: number };

export type Comment = { n: number; author: string; at: number; text: string };

export type Thread = {
  id: string;
  title: string;
  article: string;
  status: "open" | "closed";
  at: number;
  author: string;
  comments: Comment[];
};

export type Reply = { threadId: string; comment: Comment };

export type WikiUser = { name: string; role: string; joined: number; bio: string };

export type Seed = { title: string; text: string; stars: number };
