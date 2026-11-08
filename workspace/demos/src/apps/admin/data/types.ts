export type Visibility = "public" | "password";
export type FileState = "live" | "expired" | "exhausted";

export type FileRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  originalName: string;
  mime: string;
  size: number;
  visibility: Visibility;
  expiresAt: number | null;
  maxDownloads: number | null;
  downloadCount: number;
  createdAt: number;
  updatedAt: number;
};

export type AdminFile = FileRow & {
  locked: boolean;
  remainingDownloads: number | null;
  state: FileState;
};

export type DownloadResult = "완료" | "비밀번호 오류" | "만료됨" | "횟수 소진";
export type DownloadEvent = {
  id: string;
  fileId: string;
  at: number;
  address: string;
  client: string;
  place: string;
  result: DownloadResult;
};

export type RateLimit = number | "unlimited" | null;
export type PeerKind = "personal" | "friend" | "other";

export type PeerRow = {
  name: string;
  publicKey: string;
  allowedIp: string;
  endpoint: string | null;
  online: boolean;
  lastSeen: number;
  received: number;
  sent: number;
  kbps: number;
  rateLimitMbps: RateLimit;
  addedAt: number;
  connectsAt?: number;
};

export type WireGuardPeer = {
  name: string;
  publicKey: string;
  allowedIp: string;
  endpoint: string | null;
  handshake: number;
  received: number;
  sent: number;
  rateLimitMbps: RateLimit;
};

export type WakeResult = "대기 중" | "응답 확인" | "응답 없음" | "이미 켜져 있음";
export type WakeRecord = {
  id: string;
  at: number;
  by: string;
  result: WakeResult;
  bootsAt: number | null;
  seconds: number | null;
};

export type WolDevice = {
  id: string;
  name: string;
  host: string;
  mac: string;
  address: string;
  description: string;
  awake: boolean;
  bootsAt: number | null;
  awakeUntil: number | null;
  lastSentAt: number | null;
  cooldownUntil: number | null;
  history: WakeRecord[];
};

export type MediaRow = {
  id: string;
  name: string;
  kind: "photo" | "video";
  takenAt: number;
  size: number;
  duration: number | null;
  shared: boolean;
};

export type ServiceId = "files" | "wireguard" | "wol" | "galaxy" | "hub";
export type Level = "info" | "warning" | "error";

export type ActivityEvent = {
  id: string;
  at: number;
  service: ServiceId;
  level: Level;
  title: string;
  detail?: string;
  actor: string;
};
