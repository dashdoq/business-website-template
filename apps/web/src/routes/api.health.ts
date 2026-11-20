import { json, withApi } from '@/lib/api.server';

const health = withApi(async () => json({ ok: true }));

export const loader = health;
// The realtime client posts here while a socket is open: the host counts only HTTP requests as
// activity, and a POST is never served from a cache.
export const action = health;
