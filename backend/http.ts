export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export function text(value: unknown, name: string, min = 1, max = 200): string {
  if (typeof value !== 'string' || value.trim().length < min || value.trim().length > max) throw new HttpError(400, `${name} must contain ${min}–${max} characters`);
  return value.trim();
}
export function integer(value: unknown, name: string, min = 0, max = 100000000): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < min || value > max) throw new HttpError(400, `${name} must be an integer between ${min} and ${max}`);
  return value;
}
