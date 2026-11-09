import {stripLanguage} from './seo-data.ts';
export const TOOL_IDS = ['renculator', 'premculator', 'wijculator'] as const;
export type ToolId = typeof TOOL_IDS[number];
export const TOOL_PATHS: Record<ToolId, string> = {
  renculator: '/zottetools/renculator',
  premculator: '/zottetools/premculator',
  wijculator: '/zottetools/wijculator',
};
export function toolFromPath(pathname: string): ToolId | null {
  const path = stripLanguage(pathname);
  return TOOL_IDS.find(id => TOOL_PATHS[id] === path) ?? null;
}
export function safeReturnPath(value: unknown): string {
  return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') && !/[\\\r\n]/.test(value) && !toolFromPath(value.split(/[?#]/)[0]) ? value : '/';
}
