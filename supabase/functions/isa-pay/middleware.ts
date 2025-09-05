export function rateLimit(ip: string, limit = 60, windowMs = 60_000) {
  const now = Date.now();
  const key = `rl:${ip}`;
  // @ts-ignore
  const store = (globalThis as any).__rl || ((globalThis as any).__rl = new Map());
  const rec = store.get(key) as { count: number; reset: number } | undefined;
  if (!rec || rec.reset < now) {
    store.set(key, { count: 1, reset: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }
  if (rec.count >= limit) return { allowed: false, remaining: 0, retryAfter: Math.max(0, rec.reset - now) } as const;
  rec.count += 1;
  return { allowed: true, remaining: limit - rec.count };
}


