export const paperError = (message: string, kind: new (message?: string) => Error = Error): Error => new kind(`[paper-ui] ${message}`);
