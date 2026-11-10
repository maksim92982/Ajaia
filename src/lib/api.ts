export async function readJson<T>(response: Response): Promise<T> {
  const data = (await response.json().catch(() => null)) as T & { error?: string };
  if (!response.ok) {
    throw new Error((data && typeof data === "object" && "error" in data && data.error) || "Request failed.");
  }
  return data;
}

export function apiFetch(input: string, init: RequestInit = {}): Promise<Response> {
  return fetch(input, { cache: "no-store", credentials: "same-origin", ...init });
}
