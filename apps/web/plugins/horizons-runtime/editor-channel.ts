import { ALLOWED_PARENT_ORIGINS } from '../visual-editor/utils/parent-frame.js';

export { ALLOWED_PARENT_ORIGINS };

let editorOrigin: string | null | undefined;

function readParentOrigin() {
	const ancestorOrigin = window.location.ancestorOrigins?.[0];

	if (ancestorOrigin) {
		return ancestorOrigin;
	}

	try {
		return document.referrer ? new URL(document.referrer).origin : null;
	} catch {
		return null;
	}
}

function resolveEditorOrigin() {
	if (window.parent === window) {
		return null;
	}

	const parentOrigin = readParentOrigin();

	return parentOrigin && ALLOWED_PARENT_ORIGINS.includes(parentOrigin) ? parentOrigin : null;
}

/**
 * Sends a message to the Horizons editor framing this page, and to no other page.
 *
 * The resolved origin is also the postMessage target, so the browser drops the message
 * whenever the real parent is anything else.
 */
export function postToEditor(message: Record<string, unknown>) {
	if (editorOrigin === undefined) {
		editorOrigin = resolveEditorOrigin();
	}

	if (editorOrigin) {
		window.parent.postMessage(message, editorOrigin);
	}
}
