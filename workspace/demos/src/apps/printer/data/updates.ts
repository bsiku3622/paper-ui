// Snapshot of machine.update.status. Hashes, remote URLs and local paths are dropped.

export type UpdateComponent = {
  name: string;
  kind: string;
  channel: string | null;
  // false: the git checkout is not on the expected remote or branch, so Moonraker refuses to update it.
  valid: boolean;
  version: string | null;
  remote: string | null;
  behind: number;
  packages: number | null;
};

export const UPDATE_COMPONENTS: readonly UpdateComponent[] = [
  {
    "name": "system",
    "kind": "system",
    "channel": null,
    "valid": true,
    "version": null,
    "remote": null,
    "behind": 0,
    "packages": 81
  },
  {
    "name": "moonraker",
    "kind": "git_repo",
    "channel": "dev",
    "valid": false,
    "version": "v0.10.0-19",
    "remote": "v0.11.0-3",
    "behind": 22,
    "packages": null
  },
  {
    "name": "klipper",
    "kind": "git_repo",
    "channel": "dev",
    "valid": false,
    "version": "v0.13.0-593",
    "remote": "v0.13.0-809",
    "behind": 216,
    "packages": null
  },
  {
    "name": "mainsail",
    "kind": "web",
    "channel": "stable",
    "valid": true,
    "version": "v2.17.0",
    "remote": "v2.19.0",
    "behind": 0,
    "packages": null
  },
  {
    "name": "mainsail-config",
    "kind": "git_repo",
    "channel": "dev",
    "valid": false,
    "version": "v1.2.1-1",
    "remote": "v1.2.1-1",
    "behind": 0,
    "packages": null
  },
  {
    "name": "crowsnest",
    "kind": "git_repo",
    "channel": "dev",
    "valid": false,
    "version": "v4.1.17-1",
    "remote": "v4.2.0-1",
    "behind": 5,
    "packages": null
  },
  {
    "name": "sonar",
    "kind": "git_repo",
    "channel": "dev",
    "valid": false,
    "version": "v0.2.0-1",
    "remote": "v0.2.0-2",
    "behind": 1,
    "packages": null
  }
];
