'use client';
import {createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode} from 'react';
import {readComfort, saveComfort, type Comfort} from '../consent-storage';

type ComfortState = Comfort & {
  /** True once client preferences are known; the 3D stage waits for it. */
  ready: boolean;
  setComfort: (patch: Partial<Comfort>) => void;
  settingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
};

const ComfortContext = createContext<ComfortState>({
  reduced: false, paused: false, contrast: false, ready: false,
  setComfort: () => {}, settingsOpen: false, setSettingsOpen: () => {},
});

export function ComfortProvider({children}: {children: ReactNode}) {
  const [value, setValue] = useState<Comfort>({reduced: false, paused: false, contrast: false});
  const [ready, setReady] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    const query = matchMedia('(prefers-reduced-motion: reduce)');
    const saved = readComfort();
    setValue({reduced: saved?.reduced ?? query.matches, paused: saved?.paused ?? false, contrast: saved?.contrast ?? false});
    setReady(true);
    const follow = () => setValue(current => ({...current, reduced: query.matches}));
    query.addEventListener('change', follow);
    return () => query.removeEventListener('change', follow);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.motion = value.reduced || value.paused ? 'quiet' : 'full';
    root.dataset.contrast = value.contrast ? 'high' : 'normal';
  }, [value]);

  const setComfort = useCallback((patch: Partial<Comfort>) => {
    setValue(current => {
      const next = {...current, ...patch};
      saveComfort(next);
      return next;
    });
  }, []);

  const state = useMemo(() => ({...value, ready, setComfort, settingsOpen, setSettingsOpen}), [value, ready, setComfort, settingsOpen]);
  return <ComfortContext.Provider value={state}>{children}</ComfortContext.Provider>;
}

export const useComfort = () => useContext(ComfortContext);
