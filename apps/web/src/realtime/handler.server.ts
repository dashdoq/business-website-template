import type { RealtimeDefinition } from '@/lib/realtime.server';

/**
 * Realtime rooms on `/ws`. Off until a feature needs them: replace `null`
 * with `defineRealtime({...})` for one kind of room, or
 * `defineRealtimeChannels({...})` when the site has several (a chat, presence,
 * a game), each joined as `<channel>:<name>`. Keep this file and its `realtime`
 * export: `server/app.ts` imports it.
 */
export const realtime: RealtimeDefinition | null = null;
