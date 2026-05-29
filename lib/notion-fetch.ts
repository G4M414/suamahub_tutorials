import { Agent, fetch as undiciFetch } from 'undici';

const devAgent =
  process.env.NODE_ENV !== 'production'
    ? new Agent({ connect: { rejectUnauthorized: false } })
    : undefined;

export async function nfetch(
  url: string,
  options?: RequestInit,
): Promise<Response> {
  if (devAgent) {
    return undiciFetch(url, {
      ...(options as Parameters<typeof undiciFetch>[1]),
      dispatcher: devAgent,
    }) as unknown as Response;
  }
  return fetch(url, options);
}
