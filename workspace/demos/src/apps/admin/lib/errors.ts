// What the mock server answers when it says no. The original hub's ApiError carried a message, a code and a status.

export class ApiError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(message: string, code = "unknown", status = 400) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export const messageOf = (error: unknown, fallback: string) => (error instanceof Error && error.message ? error.message : fallback);
