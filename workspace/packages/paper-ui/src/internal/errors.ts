// The one constructor of a developer error: English, and prefixed so a message in a console is known to be ours.
export const paperError = (message: string, kind: new (message?: string) => Error = Error): Error => new kind(`[paper-ui] ${message}`);
