import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { transformWithOxc, type Plugin } from 'vite';
import { getTemplateBannerAttrs } from './banner.js';
import { getEcommerceTrackingScript, getGoogleTag } from './ecommerce-tracking.js';

const PLUGIN_DIR = path.dirname(fileURLToPath(import.meta.url));
const CLIENT_PATH = path.resolve(PLUGIN_DIR, 'client.ts');
const EDITOR_CHANNEL_PATH = path.resolve(PLUGIN_DIR, 'editor-channel.ts');

const RUNTIME_ID = 'virtual:horizons-runtime';
const RESOLVED_RUNTIME_ID = `\0${RUNTIME_ID}`;
const BANNER_ID = 'virtual:horizons-banner';
const RESOLVED_BANNER_ID = `\0${BANNER_ID}`;
const EDITOR_CHANNEL_ID = 'virtual:horizons-editor-channel';
const ECOMMERCE_TRACKING_ID = 'virtual:horizons-ecommerce-tracking';
const RESOLVED_ECOMMERCE_TRACKING_ID = `\0${ECOMMERCE_TRACKING_ID}`;

export default function horizonsRuntimePlugin(): Plugin {
	return {
		name: 'vite:horizons-runtime',

		resolveId(id) {
			if (id === RUNTIME_ID) {
				return RESOLVED_RUNTIME_ID;
			}

			// The file itself, not a `\0` module: its relative import has to resolve.
			if (id === EDITOR_CHANNEL_ID) {
				return EDITOR_CHANNEL_PATH;
			}

			if (id === BANNER_ID) {
				return RESOLVED_BANNER_ID;
			}

			if (id === ECOMMERCE_TRACKING_ID) {
				return RESOLVED_ECOMMERCE_TRACKING_ID;
			}
		},

		async load(id) {
			if (id === RESOLVED_RUNTIME_ID) {
				const code = await fs.readFile(CLIENT_PATH, 'utf-8');
				const result = await transformWithOxc(code, CLIENT_PATH);
				return result.code;
			}

			if (id === RESOLVED_BANNER_ID) {
				return `export const bannerAttrs = ${JSON.stringify(getTemplateBannerAttrs())};\nexport const isDev = ${JSON.stringify(process.env.NODE_ENV !== 'production')};\n`;
			}

			if (id === RESOLVED_ECOMMERCE_TRACKING_ID) {
				return `export const ecommerceTrackingScript = ${JSON.stringify(getEcommerceTrackingScript())};\nexport const googleTag = ${JSON.stringify(getGoogleTag())};\n`;
			}
		},
	};
}
