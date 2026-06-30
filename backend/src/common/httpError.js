export class HttpError extends Error {
  constructor(status, message, details = null) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export function assertFound(value, message = 'Resource not found') {
  if (!value) throw new HttpError(404, message);
  return value;
}

