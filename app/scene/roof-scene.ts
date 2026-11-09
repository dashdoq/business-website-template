/*
 * Framework-free renderer for the roof cutaway. React owns the DOM (canvas + label elements);
 * this class owns every GPU resource and disposes them in dispose().
 *
 * Motion vocabulary (all delta-time driven):
 *  - intro: tile rows lift and settle from eaves to ridge, the way a roofer lays them;
 *  - idle: a slow ±6° turntable and damped pointer parallax;
 *  - focus: an exploded axonometric of one layer, tinted with the brand red, others ghosted.
 */
import {
  Color, DirectionalLight, Fog, HemisphereLight, MathUtils, Matrix4, Mesh, NeutralToneMapping, PCFShadowMap,
  PerspectiveCamera, PlaneGeometry, Quaternion, Scene, ShadowMaterial, SRGBColorSpace, Vector3, WebGLRenderer,
} from 'three';
import {buildRoofModel, type AnchorId, type LayerKey, type RoofModel} from './roof-model';

export type SceneFocus = -1 | 0 | 1 | 2 | 3 | 4;
type CameraPose = {target: [number, number, number]; azimuth: number; elevation: number; distance: number};
type FocusDef = {
  camera: CameraPose;
  emphasis: Partial<Record<LayerKey, number>>;
  /** Emphasis for roof layers not listed above (negative = ghosted). */
  rest: number;
  slope?: Partial<Record<LayerKey, number>>;
  annex?: Partial<Record<LayerKey, number>>;
  labels: AnchorId[];
  active?: AnchorId;
};

const LAYER_KEYS: LayerKey[] = ['rafters', 'insulation', 'vapour', 'membrane', 'counter', 'battens', 'tiles', 'ridge', 'fascia', 'gutter', 'window', 'annexDeck', 'annexInsulation', 'annexMembrane', 'shedDeck', 'sheets'];
const SLOPE_KEYS: LayerKey[] = ['insulation', 'membrane', 'counter', 'battens', 'tiles', 'window'];
const ANNEX_KEYS: LayerKey[] = ['annexInsulation', 'annexMembrane'];

const FOCUS: Record<SceneFocus, FocusDef> = {
  [-1]: {camera: {target: [0, 2.2, 0.2], azimuth: -0.6, elevation: 0.36, distance: 20}, emphasis: {}, rest: 0,
    labels: ['tiles', 'battens', 'membrane', 'insulation', 'rafters', 'epdm']},
  0: {camera: {target: [-0.6, 3.9, 1.4], azimuth: -0.5, elevation: 0.42, distance: 13.5}, emphasis: {tiles: 1, window: 0, battens: 0, counter: 0}, rest: -0.45,
    slope: {tiles: 0.75, window: 0.75, battens: 0.42, counter: 0.3, membrane: 0.15}, labels: ['tiles', 'battens', 'membrane', 'window'], active: 'tiles'},
  1: {camera: {target: [4.4, 2.7, 0.6], azimuth: 0.2, elevation: 0.55, distance: 11.5}, emphasis: {annexMembrane: 1, annexInsulation: 0, annexDeck: 0}, rest: -0.55,
    annex: {annexMembrane: 1.1, annexInsulation: 0.5}, labels: ['epdm', 'annexInsulation'], active: 'epdm'},
  2: {camera: {target: [-1.6, 3.9, 1.0], azimuth: -0.82, elevation: 0.34, distance: 12.5}, emphasis: {insulation: 1, rafters: 0, vapour: 0}, rest: -0.6,
    slope: {tiles: 1.35, window: 1.35, battens: 1.0, counter: 0.88, membrane: 0.66, insulation: 0.16}, labels: ['insulation', 'rafters', 'membrane', 'tiles'], active: 'insulation'},
  3: {camera: {target: [1.5, 3.4, 2.2], azimuth: -0.32, elevation: 0.38, distance: 13.5}, emphasis: {fascia: 1, gutter: 0.5, tiles: 0}, rest: -0.3,
    labels: ['patch', 'fascia'], active: 'patch'},
  4: {camera: {target: [-5.3, 1.1, -0.9], azimuth: -0.38, elevation: 0.5, distance: 8}, emphasis: {shedDeck: 1, sheets: 0}, rest: -0.55,
    labels: ['sheets', 'shedDeck'], active: 'sheets'},
};

const ACCENT = new Color('#d83030');
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
/** Ease-out with a very small settle (~1.5%), used when a tile lands. */
const settle = (x: number) => {const c1 = 0.35, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2)};
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

export type RoofSceneOptions = {
  canvas: HTMLCanvasElement;
  labels?: HTMLElement | null;
  focus?: SceneFocus;
  reduced?: boolean;
  paused?: boolean;
  /** Render a single still frame (used to generate the poster images). */
  still?: boolean;
  background?: string;
  onReady?: () => void;
  onFailure?: () => void;
};

export class RoofScene {
  private renderer: WebGLRenderer;
  private scene = new Scene();
  private camera = new PerspectiveCamera(35, 1, 0.5, 120);
  private model: RoofModel;
  private sun: DirectionalLight;
  private ground: Mesh;
  private labels: {el: HTMLElement; anchor: RoofModel['anchors'][number]}[] = [];
  private raf = 0;
  private last = 0;
  private active = false;
  private ready = false;
  private width = 1;
  private height = 1;
  private focus: SceneFocus;
  private reduced: boolean;
  private paused: boolean;
  private readonly still: boolean;
  private time = 0;
  private intro = 0;
  private renovation = 10;
  private unroll = 10;
  private asbestos = 0;
  private pointer = {x: 0, y: 0, tx: 0, ty: 0};
  private pose = {target: new Vector3(), azimuth: 0, elevation: 0, distance: 0};
  private emphasis = new Map<LayerKey, number>();
  private offsets = new Map<LayerKey, number>();
  private quality = {time: 0, frames: 0, done: false};
  private tmp = {v: new Vector3(), m: new Matrix4(), p: new Vector3(), q: new Quaternion(), s: new Vector3(), p2: new Vector3(), q2: new Quaternion(), c: new Color()};
  private onReady?: () => void;
  private onFailure?: () => void;
  private contextLost = (event: Event) => {event.preventDefault(); this.stop(); this.onFailure?.()};

  constructor(options: RoofSceneOptions) {
    this.focus = options.focus ?? -1;
    this.reduced = !!options.reduced;
    this.paused = !!options.paused;
    this.still = !!options.still;
    this.onReady = options.onReady;
    this.onFailure = options.onFailure;
    const coarse = matchMedia('(pointer: coarse)').matches;
    const renderer = new WebGLRenderer({canvas: options.canvas, antialias: true, alpha: true, powerPreference: 'high-performance', preserveDrawingBuffer: this.still});
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.outputColorSpace = SRGBColorSpace;
    renderer.toneMapping = NeutralToneMapping;
    renderer.toneMappingExposure = 1.02;
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFShadowMap;
    this.renderer = renderer;
    options.canvas.addEventListener('webglcontextlost', this.contextLost);

    const background = new Color(options.background ?? '#ffffff');
    this.scene.fog = new Fog(background, 34, 70);

    // Lighting: weak sky fill, one warm low sun with soft shadows, one cool rim from behind.
    this.scene.add(new HemisphereLight('#f6f8fa', '#c2c6c8', 0.75));
    const sun = new DirectionalLight('#fff0da', 2.7);
    sun.position.set(-8, 12, 9);
    sun.castShadow = !coarse || this.still;
    sun.shadow.mapSize.set(this.still ? 2048 : 1024, this.still ? 2048 : 1024);
    Object.assign(sun.shadow.camera, {left: -10, right: 10, top: 9, bottom: -7, near: 2, far: 40});
    sun.shadow.bias = -0.0004;
    sun.shadow.normalBias = 0.025;
    sun.shadow.radius = 3;
    this.sun = sun;
    this.scene.add(sun, sun.target);
    const rim = new DirectionalLight('#d6e3ec', 0.9);
    rim.position.set(9, 6, -10);
    this.scene.add(rim);

    // Shadow-only ground: the CSS paper shows through, the model sits on it like a scale model.
    this.ground = new Mesh(new PlaneGeometry(60, 60), new ShadowMaterial({opacity: 0.13}));
    this.ground.rotation.x = -Math.PI / 2;
    this.ground.receiveShadow = true;
    this.scene.add(this.ground);

    this.model = buildRoofModel();
    this.scene.add(this.model.root);
    if (options.labels) {
      for (const anchor of this.model.anchors) {
        const el = options.labels.querySelector<HTMLElement>(`[data-anchor="${anchor.id}"]`);
        if (el) {el.dataset.side = anchor.side; el.style.setProperty('--leader', anchor.leader + 'px'); this.labels.push({el, anchor})}
      }
    }
    for (const key of LAYER_KEYS) {this.emphasis.set(key, 0); this.offsets.set(key, 0)}
    const start = FOCUS[this.focus].camera;
    this.pose.target.set(...start.target);
    this.pose.azimuth = start.azimuth;
    this.pose.elevation = start.elevation;
    this.pose.distance = start.distance + (this.isStatic ? 0 : 3);
    if (this.isStatic) this.intro = 99;
    this.snapToFocus(this.isStatic);
  }

  private get isStatic() {return this.reduced || this.paused || this.still}

  setFocus(focus: SceneFocus) {
    if (focus === this.focus) return;
    if (focus === 3) this.renovation = 0;
    if (focus === 1) this.unroll = 0;
    this.focus = focus;
    if (this.isStatic) {this.snapToFocus(true); this.renderOnce()}
  }

  setMotion({reduced, paused}: {reduced: boolean; paused: boolean}) {
    this.reduced = reduced; this.paused = paused;
    if (this.isStatic) {this.intro = 99; this.snapToFocus(true); this.stopLoop(); this.renderOnce()}
    else if (this.active) this.startLoop();
  }

  setPointer(x: number, y: number) {this.pointer.tx = x; this.pointer.ty = y}

  setActive(active: boolean) {
    this.active = active;
    if (!active) {this.stopLoop(); return}
    if (this.isStatic) this.renderOnce(); else this.startLoop();
  }

  resize(width: number, height: number) {
    this.width = Math.max(1, width); this.height = Math.max(1, height);
    this.renderer.setSize(this.width, this.height, false);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    if (this.isStatic || !this.raf) this.renderOnce();
  }

  dispose() {
    this.stop();
    this.renderer.domElement.removeEventListener('webglcontextlost', this.contextLost);
    this.model.dispose();
    this.ground.geometry.dispose();
    (this.ground.material as ShadowMaterial).dispose();
    this.renderer.dispose();
  }

  private stop() {this.active = false; this.stopLoop()}
  private stopLoop() {cancelAnimationFrame(this.raf); this.raf = 0}
  private startLoop() {
    if (this.raf) return;
    this.last = performance.now();
    const frame = (now: number) => {
      this.raf = requestAnimationFrame(frame);
      // Once the intro and transitions have settled, the slow idle drift only needs ~30 fps.
      if (this.settled() && now - this.last < 30) return;
      const dt = Math.min(0.05, (now - this.last) / 1000);
      this.last = now;
      this.update(dt);
      this.draw();
      this.measure(dt);
    };
    this.raf = requestAnimationFrame(frame);
  }
  private settled() {
    if (this.intro < 4.4 || (this.focus === 3 && this.renovation < 3.2) || (this.focus === 1 && this.unroll < 1.5)) return false;
    const def = FOCUS[this.focus];
    for (const key of LAYER_KEYS) if (Math.abs(this.emphasis.get(key)! - this.targetEmphasis(key)) > 0.01) return false;
    for (const key of [...SLOPE_KEYS, ...ANNEX_KEYS]) if (Math.abs(this.offsets.get(key)! - (def.slope?.[key] ?? def.annex?.[key] ?? 0)) > 0.005) return false;
    return Math.abs(this.asbestos - (this.focus === 4 ? 1 : 0)) < 0.001 && this.pose.target.distanceToSquared(this.tmp.v.set(...def.camera.target)) < 0.0004;
  }
  private renderOnce() {
    requestAnimationFrame(() => {this.update(0); this.draw()});
  }

  private draw() {
    this.renderer.render(this.scene, this.camera);
    const first = !this.ready;
    this.ready = true;
    this.placeLabels();
    if (first) this.onReady?.();
  }

  /** Lower the cost once if the device cannot hold ~40 fps. */
  private measure(dt: number) {
    const q = this.quality;
    if (q.done || dt <= 0) return;
    q.time += dt; q.frames++;
    if (q.time < 3) return;
    q.done = true;
    if (q.frames / q.time < 40) {this.renderer.setPixelRatio(1); this.sun.castShadow = false; this.resize(this.width, this.height)}
  }

  /** Jump every animated value to the current focus target (reduced motion, pause, posters). */
  private snapToFocus(includeCamera: boolean) {
    const def = FOCUS[this.focus];
    for (const key of LAYER_KEYS) {
      this.emphasis.set(key, this.targetEmphasis(key));
      this.offsets.set(key, def.slope?.[key] ?? def.annex?.[key] ?? 0);
    }
    this.asbestos = this.focus === 4 ? 1 : 0;
    this.sheetsSettled = false; this.tilesDirty = true;
    this.renovation = 10; this.unroll = 10;
    if (includeCamera) {
      this.pose.target.set(...def.camera.target);
      this.pose.azimuth = def.camera.azimuth; this.pose.elevation = def.camera.elevation; this.pose.distance = def.camera.distance;
    }
  }

  private targetEmphasis(key: LayerKey) {
    const def = FOCUS[this.focus];
    return def.emphasis[key] ?? def.rest;
  }

  private update(dt: number) {
    const def = FOCUS[this.focus];
    const animate = !this.isStatic;
    const k = (lambda: number) => (animate ? 1 - Math.exp(-lambda * dt) : 1);
    if (animate) {this.time += dt; this.intro += dt; this.renovation += dt; this.unroll += dt}

    // Camera pose and parallax.
    const pose = this.pose, cam = def.camera;
    pose.target.lerp(this.tmp.v.set(...cam.target), k(3.2));
    pose.azimuth = MathUtils.lerp(pose.azimuth, cam.azimuth, k(3.2));
    pose.elevation = MathUtils.lerp(pose.elevation, cam.elevation, k(3.2));
    pose.distance = MathUtils.lerp(pose.distance, cam.distance, k(this.intro < 2 ? 1.6 : 3.2));
    const p = this.pointer;
    p.x = animate ? MathUtils.lerp(p.x, p.tx, k(4)) : 0;
    p.y = animate ? MathUtils.lerp(p.y, p.ty, k(4)) : 0;
    const aspect = this.width / this.height;
    const fit = Math.max(1, 1.05 / aspect);
    const azimuth = pose.azimuth + p.x * 0.06, elevation = pose.elevation + p.y * 0.035, distance = pose.distance * fit;
    this.camera.position.set(
      pose.target.x + distance * Math.cos(elevation) * Math.sin(azimuth),
      pose.target.y + distance * Math.sin(elevation),
      pose.target.z + distance * Math.cos(elevation) * Math.cos(azimuth),
    );
    this.camera.lookAt(pose.target);
    this.model.root.rotation.y = animate ? Math.sin((this.time / 24) * Math.PI * 2) * (this.focus === -1 ? 0.1 : 0.035) : 0;

    // Layer emphasis (tint/ghost) and exploded offsets.
    for (const key of LAYER_KEYS) {
      const layer = this.model.layers.get(key);
      if (!layer) continue;
      const e = MathUtils.lerp(this.emphasis.get(key)!, this.targetEmphasis(key), k(5));
      this.emphasis.set(key, e);
      for (const material of layer.materials) {
        if (e >= 0) {material.emissive.copy(ACCENT); material.emissiveIntensity = 0.2 * e}
        else {material.emissive.setRGB(0.86, 0.88, 0.9); material.emissiveIntensity = 0.5 * -e}
      }
    }
    for (const key of SLOPE_KEYS) {
      const group = this.model.slopeLayers[key];
      if (!group) continue;
      const o = MathUtils.lerp(this.offsets.get(key)!, def.slope?.[key] ?? 0, k(4.5));
      this.offsets.set(key, o);
      group.position.y = o;
    }
    const insulation = this.model.slopeLayers.insulation;
    if (insulation) insulation.scale.y = 1 + Math.max(0, this.emphasis.get('insulation')!) * 0.3;
    for (const key of ANNEX_KEYS) {
      const group = this.model.annexLayers[key];
      if (!group) continue;
      const o = MathUtils.lerp(this.offsets.get(key)!, def.annex?.[key] ?? 0, k(4.5));
      this.offsets.set(key, o);
      group.position.y = 2.6 + o;
    }
    this.model.epdmSheet.scale.x = this.focus === 1 && animate ? Math.max(0.02, easeOut(clamp01((this.unroll - 0.25) / 1.1))) : 1;

    this.updateTiles(animate);
    this.updateSheets(dt, animate);
  }

  /** Intro wave (eaves → ridge) and the renovation patch swap. */
  private updateTiles(animate: boolean) {
    const tiles = this.model.frontTiles;
    const introActive = animate && this.intro < 4.2;
    const renovating = this.focus === 3 && animate && this.renovation < 3.2;
    if (!introActive && !renovating && !this.tilesDirty) return;
    const {m, p, q, s, c} = this.tmp;
    const normal = this.tmp.v.set(0, 1, 0);
    for (let i = 0; i < tiles.base.length; i++) {
      tiles.base[i].decompose(p, q, s);
      let lift = 0, scale = 1, tilt = 0;
      if (introActive) {
        const phase = (this.intro - 0.9 - tiles.rows[i] * 0.085 - ((i * 7) % 5) * 0.012) / 1.0;
        if (phase > 0 && phase < 1) lift = phase < 0.35 ? 0.3 * easeOut(phase / 0.35) : 0.3 * (1 - settle((phase - 0.35) / 0.65));
      }
      if (renovating && tiles.patch.includes(i)) {
        const r = this.renovation, order = tiles.patch.indexOf(i) * 0.08;
        if (r - order < 0.55) {const a = clamp01((r - order) / 0.55); lift = 0.5 * easeOut(a); tilt = 0.6 * a; scale = 1 - easeInOut(a)}
        else if (r - order < 0.75) scale = 0;
        else {const b = clamp01((r - order - 0.75) / 0.6); lift = 0.35 * (1 - settle(b)); scale = Math.min(1, b * 3)}
        const fade = clamp01((r - 1.6) / 1.4);
        c.copy(this.model.tileColors[i]).lerp(ACCENT, 0.75 * (1 - fade));
        tiles.mesh.setColorAt(i, c);
      }
      p.addScaledVector(normal, lift);
      if (tilt) q.multiply(this.tmp.q2.setFromAxisAngle(this.tmp.p2.set(1, 0, 0), tilt));
      s.setScalar(Math.max(0.0001, scale));
      m.compose(p, q, s);
      tiles.mesh.setMatrixAt(i, m);
    }
    tiles.mesh.instanceMatrix.needsUpdate = true;
    if (renovating || this.tilesDirty) {
      if (!renovating) tiles.patch.forEach(i => tiles.mesh.setColorAt(i, this.model.tileColors[i]));
      tiles.mesh.instanceColor!.needsUpdate = true;
    }
    this.tilesDirty = introActive || renovating;
  }
  private tilesDirty = false;

  /** Old corrugated sheets: lifted whole, one by one, and stacked on the pallet. */
  private updateSheets(dt: number, animate: boolean) {
    const target = this.focus === 4 ? 1 : 0;
    const previous = this.asbestos;
    this.asbestos = animate ? (target > this.asbestos ? Math.min(1, this.asbestos + dt / 2.6) : Math.max(0, this.asbestos - dt / 1.4)) : target;
    if (previous === this.asbestos && this.sheetsSettled) return;
    this.sheetsSettled = previous === this.asbestos;
    const {base, stack, mesh} = this.model.sheets;
    const {m, p, q, s, p2, q2} = this.tmp;
    for (let i = 0; i < base.length; i++) {
      const local = easeInOut(clamp01((this.asbestos - i * 0.11) / 0.42));
      base[i].decompose(p, q, s);
      stack[i].decompose(p2, q2, s);
      p.lerp(p2, local).y += Math.sin(local * Math.PI) * 0.9;
      q.slerp(q2, local);
      m.compose(p, q, s.set(1, 1, 1));
      mesh.setMatrixAt(i, m);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }
  private sheetsSettled = false;

  private placeLabels() {
    if (!this.labels.length) return;
    const def = FOCUS[this.focus];
    const v = this.tmp.p;
    const compact = this.width < 560;
    for (const {el, anchor} of this.labels) {
      // On narrow stages the overview keeps only the five roof layers.
      const visible = def.labels.includes(anchor.id) && !(compact && this.focus === -1 && anchor.id === 'epdm');
      el.classList.toggle('is-visible', visible && this.ready);
      el.classList.toggle('is-active', def.active === anchor.id);
      if (!visible) continue;
      anchor.parent.localToWorld(v.copy(anchor.local)).project(this.camera);
      const x = ((v.x + 1) / 2) * this.width, y = ((1 - v.y) / 2) * this.height;
      // Flip a label to the other side of its anchor when it would be clipped by the stage edge.
      const width = el.offsetWidth;
      let side = anchor.side;
      if (side === 'right' && x + width > this.width - 8) side = 'left';
      else if (side === 'left' && x - width < 8) side = 'right';
      if (el.dataset.side !== side) el.dataset.side = side;
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(${side === 'left' ? '-100%' : '0'}, -50%)`;
    }
  }
}
