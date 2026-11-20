import { resolve } from 'path';
import { build } from 'rolldown';
import { fileURLToPath } from 'url';
import { EDIT_MODE_STYLES } from './ui/inline-edit/styles.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, '..');

const VIRTUAL_ID = 'virtual:horizons-edit-mode';
const RESOLVED_VIRTUAL_ID = `\0${VIRTUAL_ID}`;

async function bundleEditModeScript() {
	const { output } = await build({
		input: resolve(__dirname, 'edit-mode-script.js'),
		platform: 'browser',
		transform: { target: 'es2020' },
		write: false,
		output: { format: 'esm', sourcemap: 'inline' },
	});
	return output[0].code;
}

/**
 * Bundles the multi-file contenteditable edit-mode runtime with Rolldown and
 * exposes it as a Vite virtual module (plus injects edit-mode styles into document.head).
 *
 * @returns {import('vite').Plugin}
 */
export default function inlineEditDevPlugin() {
	return {
		name: 'vite:inline-edit-dev',
		apply: 'serve',

		resolveId(id) {
			if (id === VIRTUAL_ID) {
				return RESOLVED_VIRTUAL_ID;
			}
		},

		async load(id) {
			if (id !== RESOLVED_VIRTUAL_ID) {
				return;
			}

			const bundledScript = await bundleEditModeScript();
			const injectStyles = `
(() => {
	const style = document.createElement('style');
	style.textContent = ${JSON.stringify(EDIT_MODE_STYLES)};
	document.head.appendChild(style);
})();
`;

			return `${injectStyles}\n${bundledScript}`;
		},
	};
}
