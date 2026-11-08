// The shapes the original hub's API spoke (AdminFile, WireGuardPeer), and the rows the mock server keeps
// behind them. A row is what is stored; the API shape adds what is worked out when it is read (a state, a handshake).
// The original's single Wake-on-LAN state became a list of devices, each with its history.

// files ---------------------------------------------------------------------------------------------------------------

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

// wireguard -----------------------------------------------------------------------------------------------------------

export type RateLimit = number | "unlimited" | null;
export type PeerKind = "personal" | "friend" | "other";

export type PeerRow = {
  name: string;
  publicKey: string;
  allowedIp: string;
  endpoint: string | null;
  // Holds a tunnel open right now.
  online: boolean;
  // The last handshake in epoch seconds when it is not online; 0 when it never connected.
  lastSeen: number;
  // Bytes counted up to the first visit: peer to server, and server to peer.
  received: number;
  sent: number;
  // How much it moves while it is online, in kilobits a second.
  kbps: number;
  rateLimitMbps: RateLimit;
  addedAt: number;
  // A peer added in this visit makes its first handshake at this moment, as a real one does once its owner pastes the config.
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

// wake-on-lan ---------------------------------------------------------------------------------------------------------

export type WakeResult = "대기 중" | "응답 확인" | "응답 없음" | "이미 켜져 있음";
export type WakeRecord = {
  id: string;
  at: number;
  by: string;
  // What it came to once it was over. A signal still on its way is "대기 중" until bootsAt passes.
  result: WakeResult;
  // When the device will answer, for a signal sent in this visit.
  bootsAt: number | null;
  // How long the device took to answer, when it did.
  seconds: number | null;
};

export type WolDevice = {
  id: string;
  name: string;
  host: string;
  mac: string;
  address: string;
  description: string;
  // Answering when the hub was opened.
  awake: boolean;
  // After a wake signal it answers from bootsAt until awakeUntil, then goes back to sleep.
  bootsAt: number | null;
  awakeUntil: number | null;
  lastSentAt: number | null;
  cooldownUntil: number | null;
  history: WakeRecord[];
};

// galaxy --------------------------------------------------------------------------------------------------------------

export type MediaRow = {
  id: string;
  name: string;
  kind: "photo" | "video";
  takenAt: number;
  size: number;
  // Seconds, for a video.
  duration: number | null;
  shared: boolean;
};

// activity ------------------------------------------------------------------------------------------------------------

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
