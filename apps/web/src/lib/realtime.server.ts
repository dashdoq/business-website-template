/**
 * Realtime rooms over one WebSocket endpoint, `/ws?room=<id>`.
 *
 * The transport is template-owned: the handshake, rooms, per-client
 * delivery, the keepalive, and the limits that keep one visitor from
 * taking the process down live here. What happens inside a room is the
 * app's: `src/realtime/handler.server.ts` exports a definition from
 * `defineRealtime` (one kind of room) or `defineRealtimeChannels` (several,
 * told apart by the room id's `<channel>:` prefix), and `server/app.ts`
 * hands it to `createRealtimeServer`. A `null` definition keeps `/ws` closed.
 *
 * Without an `onMessage` handler a room is a relay: every message a client
 * sends reaches the other clients with a `from` field. With `onMessage` and
 * `tick` the server owns the state and decides what to send.
 */
import type { IncomingMessage } from 'node:http';
import type { Duplex } from 'node:stream';
import { randomBytes, randomUUID } from 'node:crypto';
import { WebSocket, WebSocketServer } from 'ws';
import logger from '@/lib/logger.server';
import { addressBucket } from '@/lib/rate-limit.server';

export const REALTIME_PATH = '/ws';
export const ROOM_QUERY_PARAM = 'room';
export const CHANNEL_SEPARATOR = ':';

const ROOM_PARAM_PATTERN = /^[A-Za-z0-9_-]{1,32}(?::[A-Za-z0-9_.-]{1,64})?$/;
const MAX_PAYLOAD_BYTES = 16 * 1024;
const MAX_BUFFERED_BYTES = 1024 * 1024;
const PING_INTERVAL_MS = 25 * 1000; // 25 seconds, under the edge's 60 s idle timeout
const PING_PAYLOAD_BYTES = 8;
const MESSAGE_RATE_WINDOW_MS = 1000;
const MAX_TICK_HZ = 60;
const WEBSOCKET_PROTOCOL_HEADER = 'sec-websocket-protocol';
const VITE_HMR_PROTOCOLS = new Set(['vite-hmr', 'vite-ping']);
/** RFC 6455 "unexpected condition": the room could not be set up after the handshake. */
const ROOM_UNAVAILABLE_CLOSE_CODE = 1011;

/** Close codes the client helper understands; 4xxx is the application range. */
export const RealtimeCloseCode = {
	codeChanged: 4000,
	roomFull: 4001,
	rateLimited: 4003,
	serverStopping: 4004,
} as const;

export type RealtimeCloseReason = 'code changed' | 'server stopping';

const CLOSE_CODE_BY_REASON: Record<RealtimeCloseReason, number> = {
	'code changed': RealtimeCloseCode.codeChanged,
	'server stopping': RealtimeCloseCode.serverStopping,
};

/** Message types the transport itself sends; app messages use any other `type`. */
export const RealtimeSystemMessage = {
	welcome: 'welcome',
	joined: 'joined',
	left: 'left',
} as const;

const SYSTEM_MESSAGE_TYPES = new Set<string>(Object.values(RealtimeSystemMessage));

export type RealtimeMessage = { type: string } & Record<string, unknown>;

export interface RealtimeClient {
	readonly id: string;
	/** Visitor address, for per-client logging or limits in a handler; not a trusted identity. */
	readonly address: string;
	/** Room for whatever a handler learns about the client, such as a verified user; empty on join. */
	readonly data: Record<string, unknown>;
	send(message: RealtimeMessage): void;
	close(code?: number, reason?: string): void;
}

export interface RealtimeRoom<State> {
	/** The full room id, `<channel>:<name>` when channels are defined. */
	readonly id: string;
	/** The channel the room belongs to; `null` for a single-kind definition. */
	readonly channel: string | null;
	state: State;
	readonly clients: ReadonlyMap<string, RealtimeClient>;
	broadcast(message: RealtimeMessage, options?: { except?: string }): void;
}

export interface RealtimeRoomLimits {
	maxClientsPerRoom: number;
	maxMessagesPerSecond: number;
}

export interface RealtimeServerLimits {
	maxRooms: number;
	maxConnectionsPerAddress: number;
}

export interface RealtimeHandlers<State = Record<string, never>> {
	/** State for a room when its first client joins; a plain object the handlers mutate. */
	createState?(room: { id: string; channel: string | null }): State;
	onJoin?(room: RealtimeRoom<State>, client: RealtimeClient): void | Promise<void>;
	onLeave?(room: RealtimeRoom<State>, client: RealtimeClient): void | Promise<void>;
	/** Without it, every message is relayed to the other clients with `from`. */
	onMessage?(room: RealtimeRoom<State>, client: RealtimeClient, message: RealtimeMessage): void | Promise<void>;
	/** Runs `hz` times a second while the room has clients; `dt` is seconds since the previous run. */
	tick?: { hz: number; run(room: RealtimeRoom<State>, dt: number): void | Promise<void> };
	limits?: Partial<RealtimeRoomLimits>;
}

// Channel handlers are checked against `any` state: a channel's `createState` annotation types the
// object it builds, and the handlers read `room.state` without a cast.
export type AnyRealtimeHandlers = RealtimeHandlers<any>;

export interface RealtimeDefinition {
	/** Handlers by channel name, or a single entry under `null` when the app has one kind of room. */
	readonly channels: ReadonlyMap<string | null, AnyRealtimeHandlers>;
	readonly limits: Partial<RealtimeServerLimits>;
}

export interface RealtimeServer {
	/** Returns false for an upgrade that is not for `/ws`, leaving the socket untouched. */
	handleUpgrade(upgrade: { request: IncomingMessage; socket: Duplex; head: Buffer }): boolean;
	close(options: { reason: RealtimeCloseReason }): void;
}

const DEFAULT_ROOM_LIMITS: RealtimeRoomLimits = {
	maxClientsPerRoom: 16,
	maxMessagesPerSecond: 60,
};

const DEFAULT_SERVER_LIMITS: RealtimeServerLimits = {
	maxRooms: 200,
	maxConnectionsPerAddress: 16,
};

interface Connection {
	socket: WebSocket;
	client: RealtimeClient;
	roomId: string;
	/** The bucket the per-visitor connection cap counts this socket under. */
	addressKey: string;
	/** Payload of the ping still waiting for its Pong; `null` once it was answered. */
	pendingPing: Buffer | null;
	messageWindowStartedAt: number;
	messagesInWindow: number;
}

interface Room extends RealtimeRoom<unknown> {
	readonly clients: Map<string, RealtimeClient>;
	readonly sockets: Map<string, WebSocket>;
	readonly handlers: AnyRealtimeHandlers;
	readonly limits: RealtimeRoomLimits;
	tickTimer?: ReturnType<typeof setInterval>;
	lastTickAt: number;
	isTickRunning: boolean;
}

/** One kind of room: every `room` id is accepted as is. */
export const defineRealtime = <State>(
	handlers: RealtimeHandlers<State>,
	options: { limits?: Partial<RealtimeServerLimits> } = {},
): RealtimeDefinition => ({
	channels: new Map<string | null, AnyRealtimeHandlers>([[null, handlers as AnyRealtimeHandlers]]),
	limits: options.limits ?? {},
});

/** Several kinds of room: a client joins `<channel>:<name>` and the channel's handlers take it. */
export const defineRealtimeChannels = (
	channels: Record<string, AnyRealtimeHandlers>,
	options: { limits?: Partial<RealtimeServerLimits> } = {},
): RealtimeDefinition => ({
	channels: new Map<string | null, AnyRealtimeHandlers>(Object.entries(channels)),
	limits: options.limits ?? {},
});

const serialize = (message: RealtimeMessage): string => JSON.stringify(message);

const parseMessage = (raw: unknown): RealtimeMessage | null => {
	let parsed: unknown;

	try {
		parsed = JSON.parse(String(raw));
	} catch {
		return null;
	}

	if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
		return null;
	}

	const { type } = parsed as Record<string, unknown>;

	return typeof type === 'string' && type.length > 0 ? (parsed as RealtimeMessage) : null;
};

/** `X-Real-IP` is set by the proxy; `X-Forwarded-For` is appended to, so its left-most entry is visitor-controlled. */
const clientAddress = (request: IncomingMessage): string =>
	request.headers['x-real-ip']?.toString().trim() || request.socket.remoteAddress || 'unknown';

/** Browsers always send `Origin` on a WebSocket handshake; it must be this site. */
const isSameOrigin = (request: IncomingMessage): boolean => {
	const origin = request.headers.origin;
	const host = request.headers.host;

	if (!origin || !host) {
		return false;
	}

	try {
		return new URL(origin).host === host;
	} catch {
		return false;
	}
};

const rejectUpgrade = (socket: Duplex, status: number, reason: string) => {
	socket.end(`HTTP/1.1 ${status} ${reason}\r\nConnection: close\r\nContent-Length: 0\r\n\r\n`);
};

const logHandlerFailure = (name: string, error: unknown) => {
	logger.error(`realtime ${name} handler failed`, error instanceof Error ? error.stack : error);
};

const isPromiseLike = (value: unknown): value is PromiseLike<unknown> =>
	typeof (value as PromiseLike<unknown> | null | undefined)?.then === 'function';

/** For an async handler, the promise that settles (never rejects) once it is done. */
const runHandler = (name: string, run: () => unknown): Promise<void> | undefined => {
	try {
		const result = run();

		if (isPromiseLike(result)) {
			return Promise.resolve(result).then(
				() => undefined,
				error => logHandlerFailure(name, error),
			);
		}
	} catch (error) {
		logHandlerFailure(name, error);
	}

	return undefined;
};

// A peer that stops reading leaves every frame sent to it in this process's memory,
// so a socket whose backlog passes the cap is dropped instead of queued for.
const deliver = (socket: WebSocket, payload: string, roomId: string | undefined) => {
	if (socket.readyState !== WebSocket.OPEN) {
		return;
	}

	if (socket.bufferedAmount > MAX_BUFFERED_BYTES) {
		logger.warn('realtime socket dropped: client is not reading', {
			roomId,
			bufferedAmount: socket.bufferedAmount,
			limit: MAX_BUFFERED_BYTES,
		});
		socket.terminate();

		return;
	}

	socket.send(payload);
};

const logSocketError = (error: unknown) => {
	logger.warn('realtime socket error', error instanceof Error ? error.message : error);
};

/** The handlers a room id selects, or null when the id names no known channel. */
const resolveHandlers = (
	definition: RealtimeDefinition,
	roomId: string,
): { channel: string | null; handlers: AnyRealtimeHandlers } | null => {
	const single = definition.channels.get(null);

	if (single) {
		return { channel: null, handlers: single };
	}

	const separatorIndex = roomId.indexOf(CHANNEL_SEPARATOR);

	if (separatorIndex <= 0) {
		return null;
	}

	const channel = roomId.slice(0, separatorIndex);
	const handlers = definition.channels.get(channel);

	return handlers ? { channel, handlers } : null;
};

export const createRealtimeServer = ({ definition }: { definition: RealtimeDefinition | null }): RealtimeServer => {
	const serverLimits: RealtimeServerLimits = { ...DEFAULT_SERVER_LIMITS, ...definition?.limits };
	const webSocketServer = new WebSocketServer({ noServer: true, maxPayload: MAX_PAYLOAD_BYTES });
	const rooms = new Map<string, Room>();
	const connections = new Map<WebSocket, Connection>();
	const connectionsPerAddress = new Map<string, number>();

	const sendTo = (socket: WebSocket, message: RealtimeMessage) => {
		deliver(socket, serialize(message), connections.get(socket)?.roomId);
	};

	const broadcast = (room: Room, message: RealtimeMessage, except?: string) => {
		const payload = serialize(message);

		for (const [clientId, socket] of room.sockets) {
			if (clientId !== except) {
				deliver(socket, payload, room.id);
			}
		}
	};

	const stopTick = (room: Room) => {
		if (room.tickTimer) {
			clearInterval(room.tickTimer);
			room.tickTimer = undefined;
		}
	};

	const startTick = (room: Room) => {
		const { tick } = room.handlers;

		if (!tick || room.tickTimer) {
			return;
		}

		const hz = Math.min(Math.max(tick.hz, 1), MAX_TICK_HZ);
		room.lastTickAt = Date.now();
		room.tickTimer = setInterval(() => {
			// An async run slower than the interval would otherwise overlap itself and pile up.
			if (room.isTickRunning) {
				return;
			}

			const now = Date.now();
			const dt = (now - room.lastTickAt) / 1000;
			room.lastTickAt = now;

			const running = runHandler('tick', () => tick.run(room, dt));

			if (running) {
				room.isTickRunning = true;
				running.then(() => {
					room.isTickRunning = false;
				});
			}
		}, 1000 / hz);
	};

	const getOrCreateRoom = (roomId: string, channel: string | null, handlers: AnyRealtimeHandlers): Room | null => {
		const existing = rooms.get(roomId);

		if (existing) {
			return existing;
		}

		let state: unknown = {};

		if (handlers.createState) {
			try {
				state = handlers.createState({ id: roomId, channel });
			} catch (error) {
				logHandlerFailure('createState', error);

				return null;
			}
		}

		const room: Room = {
			id: roomId,
			channel,
			handlers,
			limits: { ...DEFAULT_ROOM_LIMITS, ...handlers.limits },
			state,
			clients: new Map(),
			sockets: new Map(),
			lastTickAt: Date.now(),
			isTickRunning: false,
			broadcast: (message, options) => broadcast(room, message, options?.except),
		};
		rooms.set(roomId, room);

		return room;
	};

	const removeConnection = (socket: WebSocket) => {
		const connection = connections.get(socket);

		if (!connection) {
			return;
		}

		connections.delete(socket);

		const addressCount = (connectionsPerAddress.get(connection.addressKey) ?? 1) - 1;

		if (addressCount > 0) {
			connectionsPerAddress.set(connection.addressKey, addressCount);
		} else {
			connectionsPerAddress.delete(connection.addressKey);
		}

		const room = rooms.get(connection.roomId);

		if (!room || !room.clients.has(connection.client.id)) {
			return;
		}

		room.clients.delete(connection.client.id);
		room.sockets.delete(connection.client.id);
		runHandler('onLeave', () => room.handlers.onLeave?.(room, connection.client));
		broadcast(room, { type: RealtimeSystemMessage.left, clientId: connection.client.id });

		if (room.clients.size === 0) {
			stopTick(room);
			rooms.delete(room.id);
		}
	};

	const isWithinMessageRate = (connection: Connection, room: Room, now: number): boolean => {
		if (now - connection.messageWindowStartedAt >= MESSAGE_RATE_WINDOW_MS) {
			connection.messageWindowStartedAt = now;
			connection.messagesInWindow = 0;
		}

		connection.messagesInWindow += 1;

		return connection.messagesInWindow <= room.limits.maxMessagesPerSecond;
	};

	const handleMessage = (socket: WebSocket, raw: unknown) => {
		const connection = connections.get(socket);
		const room = connection && rooms.get(connection.roomId);

		if (!connection || !room) {
			return;
		}

		if (!isWithinMessageRate(connection, room, Date.now())) {
			socket.close(RealtimeCloseCode.rateLimited, 'Too many messages');

			return;
		}

		const message = parseMessage(raw);

		if (!message || SYSTEM_MESSAGE_TYPES.has(message.type)) {
			return;
		}

		if (room.handlers.onMessage) {
			runHandler('onMessage', () => room.handlers.onMessage?.(room, connection.client, message));

			return;
		}

		broadcast(room, { ...message, from: connection.client.id }, connection.client.id);
	};

	const acceptConnection = (socket: WebSocket, room: Room, address: string, addressKey: string) => {
		socket.on('error', logSocketError);

		if (room.clients.size >= room.limits.maxClientsPerRoom) {
			socket.close(RealtimeCloseCode.roomFull, 'Room is full');

			if (room.clients.size === 0) {
				rooms.delete(room.id);
			}

			return;
		}

		const client: RealtimeClient = {
			id: randomUUID(),
			address,
			data: {},
			send: message => sendTo(socket, message),
			close: (code, reason) => socket.close(code, reason),
		};
		const connection: Connection = {
			socket,
			client,
			roomId: room.id,
			addressKey,
			pendingPing: null,
			messageWindowStartedAt: Date.now(),
			messagesInWindow: 0,
		};

		connections.set(socket, connection);
		connectionsPerAddress.set(addressKey, (connectionsPerAddress.get(addressKey) ?? 0) + 1);
		room.clients.set(client.id, client);
		room.sockets.set(client.id, socket);

		// Only the echo of the latest ping counts: a peer can send Pongs without reading,
		// but it reaches the ping's payload only by reading everything queued before it.
		socket.on('pong', data => {
			if (connection.pendingPing?.equals(data)) {
				connection.pendingPing = null;
			}
		});
		socket.on('message', raw => handleMessage(socket, raw));
		socket.on('close', () => removeConnection(socket));

		sendTo(socket, {
			type: RealtimeSystemMessage.welcome,
			clientId: client.id,
			roomId: room.id,
			channel: room.channel,
			clients: [...room.clients.keys()].filter(id => id !== client.id),
		});
		runHandler('onJoin', () => room.handlers.onJoin?.(room, client));
		broadcast(room, { type: RealtimeSystemMessage.joined, clientId: client.id }, client.id);
		startTick(room);
	};

	// A socket that misses one ping is gone: the proxy chain drops idle
	// connections well before a TCP timeout would tell us.
	const keepaliveTimer = setInterval(() => {
		for (const [socket, connection] of connections) {
			if (connection.pendingPing) {
				socket.terminate();
				continue;
			}

			connection.pendingPing = randomBytes(PING_PAYLOAD_BYTES);
			socket.ping(connection.pendingPing);
		}
	}, PING_INTERVAL_MS);

	const handleUpgrade: RealtimeServer['handleUpgrade'] = ({ request, socket, head }) => {
		// Node detaches its own error listener from the socket before it emits `upgrade`, so a peer
		// reset while a refusal is written would otherwise be an uncaught exception.
		let url: URL;

		try {
			url = new URL(request.url ?? '/', 'http://localhost');
		} catch {
			socket.on('error', logSocketError);
			rejectUpgrade(socket, 400, 'Bad Request');

			return true;
		}

		const protocol = request.headers[WEBSOCKET_PROTOCOL_HEADER]?.toString() ?? '';

		if (url.pathname !== REALTIME_PATH || VITE_HMR_PROTOCOLS.has(protocol)) {
			return false;
		}

		socket.on('error', logSocketError);

		if (!definition) {
			rejectUpgrade(socket, 404, 'Not Found');

			return true;
		}

		const roomId = url.searchParams.get(ROOM_QUERY_PARAM) ?? '';
		const address = clientAddress(request);
		const addressKey = addressBucket(address);

		if (!isSameOrigin(request)) {
			rejectUpgrade(socket, 403, 'Forbidden');

			return true;
		}

		if (!ROOM_PARAM_PATTERN.test(roomId)) {
			rejectUpgrade(socket, 400, 'Bad Request');

			return true;
		}

		const resolved = resolveHandlers(definition, roomId);

		if (!resolved) {
			rejectUpgrade(socket, 404, 'Not Found');

			return true;
		}

		if ((connectionsPerAddress.get(addressKey) ?? 0) >= serverLimits.maxConnectionsPerAddress) {
			rejectUpgrade(socket, 429, 'Too Many Requests');

			return true;
		}

		if (!rooms.has(roomId) && rooms.size >= serverLimits.maxRooms) {
			rejectUpgrade(socket, 503, 'Service Unavailable');

			return true;
		}

		// `ws` aborts a bad handshake without calling back, so the room only exists once a socket is in it.
		webSocketServer.handleUpgrade(request, socket, head, webSocket => {
			const room = getOrCreateRoom(roomId, resolved.channel, resolved.handlers);

			if (!room) {
				webSocket.on('error', logSocketError);
				webSocket.close(ROOM_UNAVAILABLE_CLOSE_CODE, 'Room unavailable');

				return;
			}

			acceptConnection(webSocket, room, address, addressKey);
		});

		return true;
	};

	const close: RealtimeServer['close'] = ({ reason }) => {
		clearInterval(keepaliveTimer);

		const code = CLOSE_CODE_BY_REASON[reason];

		for (const room of rooms.values()) {
			stopTick(room);
		}

		for (const socket of connections.keys()) {
			socket.close(code, reason);
		}

		rooms.clear();
		connections.clear();
		connectionsPerAddress.clear();
		webSocketServer.close();
	};

	return { handleUpgrade, close };
};
