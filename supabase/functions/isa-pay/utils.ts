// deno-lint-ignore-file no-explicit-any
import { v4 } from "https://deno.land/std@0.224.0/uuid/mod.ts";

export function routeRequest(url: string, method: string): { name: 'initiate' | 'status' | 'webhook'; params: any } | null {
  const u = new URL(url);
  const pathname = u.pathname.replace(/\\+/g, '/');
  const parts = pathname.split('/').filter(Boolean);
  const idx = parts.findIndex(p => p === 'isa-pay');
  const sub = parts.slice(idx + 1);
  if (sub.length === 1 && sub[0] === 'initiate' && method === 'POST') return { name: 'initiate', params: {} };
  if (sub.length === 2 && sub[0] === 'status' && method === 'GET') return { name: 'status', params: { transaction_id: sub[1] } };
  if (sub.length === 1 && sub[0] === 'webhook' && method === 'POST') return { name: 'webhook', params: {} };
  return null;
}

export function generateIsaTransactionId(): string {
  return crypto.randomUUID();
}

export async function hmacSha256Hex(secret: string, payload: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  return Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join('');
}


