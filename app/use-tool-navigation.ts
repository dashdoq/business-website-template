'use client';
import {useCallback, useEffect, useState} from 'react';
import {languageFromPath,languagePath} from './seo-data';
import {safeReturnPath, toolFromPath, TOOL_PATHS, type ToolId} from './tool-routing';

export function useToolNavigation(initialTool?: ToolId) {
  const [activeTool, setActiveTool] = useState<ToolId>(initialTool ?? 'renculator');
  const [open, setOpen] = useState(Boolean(initialTool));
  useEffect(() => {
    const sync = () => {
      const tool = toolFromPath(window.location.pathname);
      if (tool) setActiveTool(tool);
      setOpen(Boolean(tool));
    };
    sync();
    window.addEventListener('popstate', sync);window.addEventListener('ingbelg-route-change', sync);
    return () => {window.removeEventListener('popstate', sync);window.removeEventListener('ingbelg-route-change', sync)};
  }, []);
  const showTool = useCallback((tool: ToolId) => {
    const current = toolFromPath(window.location.pathname);
    const returnTo = current ? safeReturnPath(history.state?.zotteReturnTo) : safeReturnPath(location.pathname+location.search+location.hash);
    if (current !== tool) history.pushState({...history.state, zotteReturnTo:returnTo}, '', languagePath(TOOL_PATHS[tool],languageFromPath(location.pathname)));
    setActiveTool(tool);
    setOpen(true);
  }, []);
  const close = useCallback(() => {
    if (toolFromPath(location.pathname)) {const language=languageFromPath(location.pathname),target=new URL(safeReturnPath(history.state?.zotteReturnTo),location.origin);history.pushState({...history.state,zotteReturnTo:undefined},'',languagePath(target.pathname,language)+target.search+target.hash)}
    setOpen(false);
  }, []);
  return {activeTool, open, showTool, close};
}
