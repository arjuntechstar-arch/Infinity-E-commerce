let csrf = '';
export async function request<T>(path: string, method = 'GET', body?: unknown, headers: Record<string, string> = {}): Promise<T> {
  const response = await fetch('/api' + path, { method, credentials: 'same-origin', headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf, ...headers }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
  const data = await response.json().catch(() => ({ message: 'The server returned an unreadable response' }));
  if (!response.ok) throw new Error(data.message || `Request failed (${response.status})`);
  if ('csrf' in data) csrf = data.csrf || '';
  return data as T;
}
