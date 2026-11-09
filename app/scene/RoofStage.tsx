'use client';
import {useEffect, useRef, useState} from 'react';
import {Pause, Play} from 'lucide-react';
import {useComfort} from '../layout/comfort';
import {UI} from '../content/common';
import type {SiteLanguage} from '../site-language';
import type {AnchorId} from './roof-model';
import type {RoofScene, SceneFocus} from './roof-scene';

export const LABELS: Record<AnchorId, Record<SiteLanguage, string>> = {
  tiles: {nl: 'Dakpannen', fr: 'Tuiles'},
  battens: {nl: 'Panlatten', fr: 'Liteaux'},
  membrane: {nl: 'Onderdak', fr: 'Sous-toiture'},
  insulation: {nl: 'Isolatie', fr: 'Isolation'},
  rafters: {nl: 'Kepers', fr: 'Chevrons'},
  window: {nl: 'Dakraam', fr: 'Fenêtre de toit'},
  fascia: {nl: 'Kroonlijst & goot', fr: 'Corniche & gouttière'},
  patch: {nl: 'Herstelde pannen', fr: 'Tuiles réparées'},
  epdm: {nl: 'EPDM-dakbedekking', fr: 'Couverture EPDM'},
  annexInsulation: {nl: 'Isolatieplaten', fr: 'Panneaux isolants'},
  sheets: {nl: 'Oude golfplaten', fr: 'Anciennes plaques ondulées'},
  shedDeck: {nl: 'Nieuw dak', fr: 'Nouvelle toiture'},
};

/** Poster images rendered from the same scene by scripts/render-posters.mjs (focus posters carry translated labels). */
export const posterFor = (focus: SceneFocus, language: SiteLanguage = 'nl') => `/images/scene/roof-${focus === -1 ? 'hero' : `focus-${focus}-${language}`}.webp`;
export const POSTER_SIZE = {width: 1380, height: 1200};
export const posterSrcSet = (src: string) => `${src.replace(/\.webp$/, '-690.webp')} 690w, ${src} 1380w`;

/**
 * Live 3D needs WebGL2 on real graphics hardware. Software renderers (SwiftShader, llvmpipe) would
 * block the main thread, so those devices keep the poster. `localStorage['ingbelg-force-3d'] = '1'`
 * overrides the check for testing.
 */
function supportsLive3D() {
  try {
    const gl = document.createElement('canvas').getContext('webgl2');
    if (!gl) return false;
    const info = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : '';
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    let forced = false;
    try {forced = localStorage.getItem('ingbelg-force-3d') === '1'} catch {/* storage blocked */}
    return forced || !/swiftshader|llvmpipe|software/i.test(renderer);
  } catch {return false}
}
const hasIdle = () => typeof window.requestIdleCallback === 'function';
const requestIdle = (callback: () => void) => (hasIdle() ? window.requestIdleCallback(callback, {timeout: 1500}) : setTimeout(callback, 300) as unknown as number);
const cancelIdle = (handle: number) => (hasIdle() ? window.cancelIdleCallback(handle) : clearTimeout(handle));

/**
 * The 3D roof cutaway. Renders a poster first (fast LCP, no-WebGL fallback), then lazy-loads
 * three.js once the stage is visible and the browser is idle. Rendering stops when offscreen.
 */
export function RoofStage({language, focus, eager = false, alt}: {language: SiteLanguage; focus: SceneFocus; eager?: boolean; alt: string}) {
  const root = useRef<HTMLDivElement>(null), canvas = useRef<HTMLCanvasElement>(null), labels = useRef<HTMLDivElement>(null);
  const scene = useRef<RoofScene | null>(null);
  const {reduced, paused, ready, setComfort} = useComfort();
  const [live, setLive] = useState(false);
  const latest = useRef({focus, reduced, paused});
  latest.current = {focus, reduced, paused};
  const ui = UI[language].scene;

  useEffect(() => {
    const el = root.current, cv = canvas.current;
    if (!ready || !el || !cv) return;
    const saveData = (navigator as Navigator & {connection?: {saveData?: boolean}}).connection?.saveData;
    if (saveData || !supportsLive3D()) return;
    let disposed = false, visible = false, idle = 0;
    let instance: RoofScene | null = null;
    const activate = () => instance?.setActive(visible && !document.hidden);
    const load = async () => {
      const {RoofScene} = await import('./roof-scene');
      if (disposed) return;
      try {
        const background = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() || undefined;
        instance = new RoofScene({
          canvas: cv, labels: labels.current, background, ...latest.current,
          onReady: () => setLive(true),
          onFailure: () => setLive(false),
        });
      } catch {return}
      scene.current = instance;
      const rect = el.getBoundingClientRect();
      instance.resize(rect.width, rect.height);
      activate();
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !instance && !idle) idle = requestIdle(() => void load());
      activate();
    }, {rootMargin: '160px'});
    observer.observe(el);
    const sizer = new ResizeObserver(([entry]) => instance?.resize(entry.contentRect.width, entry.contentRect.height));
    sizer.observe(el);
    const visibility = () => activate();
    const pointer = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      instance?.setPointer((event.clientX / innerWidth - 0.5) * 2, -(event.clientY / innerHeight - 0.5) * 2);
    };
    document.addEventListener('visibilitychange', visibility);
    addEventListener('pointermove', pointer, {passive: true});
    return () => {
      disposed = true;
      if (idle) cancelIdle(idle);
      observer.disconnect(); sizer.disconnect();
      document.removeEventListener('visibilitychange', visibility);
      removeEventListener('pointermove', pointer);
      instance?.dispose();
      scene.current = null;
      setLive(false);
    };
  }, [ready]);

  useEffect(() => {scene.current?.setFocus(focus)}, [focus]);
  useEffect(() => {scene.current?.setMotion({reduced, paused})}, [reduced, paused]);

  return (
    <div className={`roof-stage${live ? ' is-live' : ''}`} ref={root}>
      <img className="roof-stage__poster" src={posterFor(-1)} srcSet={posterSrcSet(posterFor(-1))} sizes="(min-width: 1100px) 56vw, 100vw" width={POSTER_SIZE.width} height={POSTER_SIZE.height} alt={alt}
        loading={eager ? 'eager' : 'lazy'} decoding="async" />
      <canvas ref={canvas} aria-hidden="true" />
      <div className="roof-stage__annotations" ref={labels} aria-hidden="true">
        {(Object.keys(LABELS) as AnchorId[]).map(id => <span key={id} className="annotation" data-anchor={id}><i /><span>{LABELS[id][language]}</span></span>)}
      </div>
      {live && !reduced && (
        <button type="button" className="icon-button roof-stage__toggle" aria-pressed={paused} onClick={() => setComfort({paused: !paused})}
          aria-label={paused ? ui.play : ui.pause} title={paused ? ui.play : ui.pause}>
          {paused ? <Play size={18} aria-hidden="true" /> : <Pause size={18} aria-hidden="true" />}
        </button>
      )}
    </div>
  );
}
