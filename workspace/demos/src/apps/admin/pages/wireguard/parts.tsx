// What the WireGuard screens say about a peer the same way everywhere: whether it is connected, its speed limit, and the
// config a person pastes into the WireGuard app.

import { Badge } from "@studio-baeks/paper-ui";

import { KIND_LABEL, WG, kindOf } from "../../data/wireguard";
import type { PeerRow, RateLimit, WireGuardPeer } from "../../data/types";
import { formatIec, since } from "../../lib/format";

export const statusText = (peer: WireGuardPeer, online: boolean) => {
  if (!peer.handshake) return "아직 연결 안 됨";
  return online ? "최근 연결" : `마지막 연결 ${since(peer.handshake * 1000)}`;
};

export const StatusBadge = ({ peer, online }: { peer: WireGuardPeer; online: boolean }) =>
  online ? <Badge accent="success" dot>{statusText(peer, online)}</Badge> : <Badge>{statusText(peer, online)}</Badge>;

export const limitLabel = (limit: RateLimit) => (limit === null ? "–" : limit === "unlimited" ? "제한 없음" : limit === 0 ? "차단" : `${limit} Mbps`);

export const kindLabel = (allowedIp: string) => KIND_LABEL[kindOf(allowedIp)];

export const traffic = (peer: WireGuardPeer) => ({ up: `↑ ${formatIec(peer.received)}`, down: `↓ ${formatIec(peer.sent)}` });

// What "정보 복사" puts on the clipboard, as the original did.
export const peerInfo = (peer: WireGuardPeer) => `${peer.name}\n${peer.allowedIp}\n${peer.publicKey}`;

// The client's config. The server never knows a device's private key, so that line is a blank for the person to fill.
export const peerConfig = (row: Pick<PeerRow, "allowedIp">): string[] => {
  const friend = kindOf(row.allowedIp) !== "personal";
  return [
    "[Interface]",
    "PrivateKey = <이 기기에서 만든 private key>",
    `Address = ${row.allowedIp}/32`,
    `DNS = ${WG.dns}`,
    "",
    "[Peer]",
    `PublicKey = ${WG.serverKey}`,
    `Endpoint = ${WG.endpoint}`,
    `AllowedIPs = ${friend ? WG.subnet : WG.allowed}`,
    "PersistentKeepalive = 25",
  ];
};
