class Status {
  code: StatusCode = StatusCode.success;
  error: string | null = null;
}

enum StatusCode {
  success,
  error,
}

export { Status, StatusCode };
