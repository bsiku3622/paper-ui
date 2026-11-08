// The store read the way the pages read it: files with their derived state, peers with the handshake they have right now,
// a Wake-on-LAN device that is also a VPN peer answering for both. Each call works out "now" again.

import { useMemo } from "react";

import { readFile } from "../data/files";
import type { AdminFile, PeerRow, WireGuardPeer } from "../data/types";
import { isOnline, readPeer, reachFromDevices } from "../data/wireguard";
import { isReachable } from "../data/wol";
import { now } from "../lib/clock";
import { useAdmin } from "./store";

export const useFileList = (): AdminFile[] => {
  const { files } = useAdmin();
  return files.map((row) => readFile(row));
};

export type PeerView = { row: PeerRow; peer: WireGuardPeer; online: boolean };

export const useReach = () => {
  const { devices } = useAdmin();
  return useMemo(() => reachFromDevices(devices, isReachable), [devices]);
};

export const usePeerViews = (): PeerView[] => {
  const { peers } = useAdmin();
  const reach = useReach();
  const at = now();
  return peers.map((row) => {
    const peer = readPeer(row, at, reach);
    return { row, peer, online: isOnline(peer, at) };
  });
};
