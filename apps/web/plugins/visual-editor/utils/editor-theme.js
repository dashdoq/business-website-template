import { EDITOR_PALETTES, EDITOR_VAR_PREFIX } from '../constants/theme.js';

const STYLE_ID = 'horizons-editor-theme';

export function applyEditorTheme(theme) {
	const palette = Object.hasOwn(EDITOR_PALETTES, theme) ? EDITOR_PALETTES[theme] : EDITOR_PALETTES.dark;
	let style = document.getElementById(STYLE_ID);
	if (!style) {
		style = document.createElement('style');
		style.id = STYLE_ID;
		document.head.appendChild(style);
	}
	const declarations = Object.entries(palette).map(([token, value]) => `${EDITOR_VAR_PREFIX}${token}:${value};`).join('');
	style.textContent = `:root{${declarations}}`;
}
