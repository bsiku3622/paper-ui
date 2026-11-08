// Snapshot of machine.proc_stats: Moonraker's CPU usage per second (30 samples) and the host's totals. Addresses are dropped.

export const MOONRAKER_CPU: readonly number[] = [0.73,0.7,0.81,0.92,2.06,1.33,2.41,1.52,1.37,1.26,8.41,1.41,1.34,1.17,0.7,0.68,1.32,0.87,1.48,1.3,1.3,1.35,1.22,6.67,2.79,0.84,4.32,1.47,0.74,1.33];
export const HOST_LOAD = {
  cpuTemp: 42.4,
  cpu: 4.57,
  cores: [5.15, 4.04, 8, 2.02],
  // kB
  memTotal: 7828624,
  memAvailable: 7499768,
  memUsed: 328856,
  uptime: 336650,
  wlanBandwidth: 70398,
  wlanRx: 3508813009,
  wlanTx: 42667169421,
} as const;
