// Where the demo keeps what it remembers in the browser. The number changes when the shape of the stored rows does, so an
// old copy is left behind instead of being read as the new one.

export const storageKey = (name: string) => `admin:v2:${name}`;
