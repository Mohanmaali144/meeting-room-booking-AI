export function createError(status: number, code: string, message: string, details?: any) {
  const error: any = new Error(message);
  error.status = status;
  error.code = code;
  error.details = details;
  return error;
}
