/**
 * Browser side of the `/ws` realtime server: one connection to one room,
 * reconnecting on its own when the connection drops or the server's code
 * changed in the preview.
 *
 * Messages are JSON objects with a string `type`. The transport's own
 * messages are `welcome` (carries this client's `clientId`), `joined` and
 * `left`; everything else comes from the room handler or, in relay mode, from
 * another client with a `from` field.
 */
export type RealtimeClientMessage = { type: string } & Record<string, unknown>;

export type RealtimeStatus = 'connecting' | 'open' | 'closed';

export interface RealtimeConnection {
	readonly clientId: string | null;
	readonly status: RealtimeStatus;
	send(message: RealtimeClientMessage): void;
	close(): void;
}

const REALTIME_PATH = '/ws';
const ROOM_QUERY_PARAM = 'room';
const WELCOME_TYPE = 'welcome';
const RECONNECT_MIN_MS = 500;
const RECONNECT_MAX_MS = 8_000;
const CODE_CHANGED = 4000;
const KEEPALIVE_PATH = '/api/health';
// The host puts the site to sleep after minutes without an HTTP request, and an open socket does
// not count; a POST does, and is never cached on the way.
const KEEPALIVE_INTERVAL_MS = 4 * 60 * 1000; // 4 minutes
/** Server-side refusals: the room is full or the client is over a limit. Retrying would not change that. */
const FINAL_CLOSE_CODES = new Set([4001, 4003]);
// A refusal at the handshake (realtime off, a bad room id, a server limit) reaches the browser as a
// plain 1006 close, so a run of closes that never opened is treated as one. A minute covers a host
// waking from sleep, which the first attempts of the run hit.
const HANDSHAKE_FAILURE_WINDOW_MS = 60 * 1000; // 1 minute

export const connectRealtime = ({
	roomId,
	onMessage,
	onStatus,
}: {
	roomId: string;
	onMessage: (message: RealtimeClientMessage) => void;
	onStatus?: (status: RealtimeStatus) => void;
}): RealtimeConnection => {
	let socket: WebSocket | null = null;
	let clientId: string | null = null;
	let status: RealtimeStatus = 'connecting';
	let attempts = 0;
	let failingSince: number | null = null;
	let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
	let keepaliveTimer: ReturnType<typeof setInterval> | undefined;
	let isClosed = false;

	const stopKeepalive = () => {
		clearInterval(keepaliveTimer);
		keepaliveTimer = undefined;
	};

	const startKeepalive = () => {
		stopKeepalive();
		keepaliveTimer = setInterval(() => {
			fetch(KEEPALIVE_PATH, { method: 'POST', cache: 'no-store', keepalive: true }).catch(() => {});
		}, KEEPALIVE_INTERVAL_MS);
	};

	const setStatus = (next: RealtimeStatus) => {
		if (status !== next) {
			status = next;
			onStatus?.(next);
		}
	};

	const scheduleReconnect = (delay: number) => {
		if (isClosed) {
			return;
		}

		clearTimeout(reconnectTimer);
		reconnectTimer = setTimeout(open, delay);
	};

	const open = () => {
		const scheme = location.protocol === 'https:' ? 'wss:' : 'ws:';
		const url = new URL(`${scheme}//${location.host}${REALTIME_PATH}`);
		url.searchParams.set(ROOM_QUERY_PARAM, roomId);

		let hasOpened = false;

		setStatus('connecting');
		socket = new WebSocket(url);

		socket.addEventListener('open', () => {
			hasOpened = true;
			attempts = 0;
			failingSince = null;
			setStatus('open');
			startKeepalive();
		});

		socket.addEventListener('message', event => {
			let message: RealtimeClientMessage;

			try {
				message = JSON.parse(String(event.data)) as RealtimeClientMessage;
			} catch {
				return;
			}

			if (message.type === WELCOME_TYPE && typeof message.clientId === 'string') {
				clientId = message.clientId;
			}

			onMessage(message);
		});

		socket.addEventListener('close', event => {
			socket = null;
			stopKeepalive();
			setStatus('closed');

			if (isClosed || FINAL_CLOSE_CODES.has(event.code)) {
				return;
			}

			if (!hasOpened) {
				failingSince ??= Date.now();

				if (Date.now() - failingSince >= HANDSHAKE_FAILURE_WINDOW_MS) {
					return;
				}
			}

			if (event.code === CODE_CHANGED) {
				scheduleReconnect(RECONNECT_MIN_MS);

				return;
			}

			attempts += 1;
			scheduleReconnect(Math.min(RECONNECT_MIN_MS * 2 ** attempts, RECONNECT_MAX_MS));
		});
	};

	open();

	return {
		get clientId() {
			return clientId;
		},
		get status() {
			return status;
		},
		send: message => {
			if (socket?.readyState === WebSocket.OPEN) {
				socket.send(JSON.stringify(message));
			}
		},
		close: () => {
			isClosed = true;
			clearTimeout(reconnectTimer);
			stopKeepalive();
			socket?.close();
			socket = null;
			setStatus('closed');
		},
	};
};
