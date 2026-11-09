/*
 * Architectural cutaway of a Flemish house, built procedurally.
 * The left gable is cut open and the front roof slope is stepped back layer by layer
 * (rafters → insulation → underlay → battens → tiles), like a construction drawing.
 * A flat-roof annex (EPDM) and a small shed with old corrugated sheets complete the services story.
 */
import {
  BoxGeometry, BufferGeometry, CanvasTexture, Color, CylinderGeometry, DoubleSide, ExtrudeGeometry, Group, InstancedMesh,
  Matrix4, Mesh, MeshStandardMaterial, Object3D, PlaneGeometry, Quaternion, RepeatWrapping, SRGBColorSpace, Shape, Texture, Vector3,
} from 'three';

export const PALETTE = {
  tile: '#3b4045', timber: '#c9a877', timberDark: '#a98a5f', wool: '#cdb27a', membrane: '#3e4a54', vapour: '#d9d4ca',
  zinc: '#9aa3a8', brick: '#b98a70', mortar: '#d9d0c3', slab: '#d6d0c5', epdm: '#2b2f33', fibreCement: '#b7b4ab',
  frame: '#e9e4da', glass: '#56656e', dark: '#2e3438',
};

export type LayerKey =
  | 'rafters' | 'insulation' | 'vapour' | 'membrane' | 'counter' | 'battens' | 'tiles' | 'ridge' | 'fascia' | 'gutter' | 'window'
  | 'annexDeck' | 'annexInsulation' | 'annexMembrane' | 'shedDeck' | 'sheets';

export type Layer = {key: LayerKey; object: Object3D; materials: MeshStandardMaterial[]};
export type AnchorId = 'tiles' | 'battens' | 'membrane' | 'insulation' | 'rafters' | 'window' | 'fascia' | 'patch' | 'epdm' | 'annexInsulation' | 'sheets' | 'shedDeck';
export type Anchor = {id: AnchorId; parent: Object3D; local: Vector3; side: 'left' | 'right'; leader: number};

export type RoofModel = {
  root: Group;
  layers: Map<LayerKey, Layer>;
  anchors: Anchor[];
  /** Front-slope instances that the scene animates (tile wave, renovation patch). */
  frontTiles: {mesh: InstancedMesh; base: Matrix4[]; rows: number[]; patch: number[]; rowCount: number};
  frontBattens: {mesh: InstancedMesh; base: Matrix4[]; rows: number[]};
  sheets: {mesh: InstancedMesh; base: Matrix4[]; stack: Matrix4[]};
  epdmSheet: Mesh;
  /** Front slope layer groups that separate along the slope normal in exploded views. */
  slopeLayers: Partial<Record<LayerKey, Group>>;
  annexLayers: Partial<Record<LayerKey, Group>>;
  tileColors: Color[];
  dispose: () => void;
};

// Dimensions in metres (roughly 1:1 with a modest terraced house).
const W = 7, D = 5.6, H = 3, PITCH = (40 * Math.PI) / 180;
const X0 = -W / 2, X1 = W / 2;
const SLOPE = D / 2 / Math.cos(PITCH), OVERHANG = 0.4;
const STEP = {membrane: 0.35, battens: 0.8, tiles: 1.3};
const ROW = 0.33, TILE_W = 0.3;

export function buildRoofModel(): RoofModel {
  const root = new Group();
  const layers = new Map<LayerKey, Layer>();
  const anchors: Anchor[] = [];
  const disposables: {dispose: () => void}[] = [];
  const tileColors: Color[] = [];

  const material = (color: string, roughness = 0.8, metalness = 0, extra: Partial<MeshStandardMaterial> = {}) => {
    const m = new MeshStandardMaterial({color, roughness, metalness, ...extra});
    disposables.push(m);
    return m;
  };
  const geometry = <T extends BufferGeometry>(g: T) => {disposables.push(g); return g};
  const box = (w: number, h: number, d: number) => geometry(new BoxGeometry(w, h, d));
  /** Box-projected UVs in metres, so extruded walls show horizontal brick courses on every face. */
  const boxUV = <T extends BufferGeometry>(g: T) => {
    const p = g.attributes.position, n = g.attributes.normal, uv = g.attributes.uv;
    for (let i = 0; i < p.count; i++) {
      const ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i)), az = Math.abs(n.getZ(i));
      if (ax >= ay && ax >= az) uv.setXY(i, p.getZ(i), p.getY(i));
      else if (az >= ay) uv.setXY(i, p.getX(i), p.getY(i));
      else uv.setXY(i, p.getX(i), p.getZ(i));
    }
    uv.needsUpdate = true;
    return g;
  };
  const mesh = (g: BufferGeometry, m: MeshStandardMaterial, x = 0, y = 0, z = 0, shadow = true) => {
    const item = new Mesh(g, m);
    item.position.set(x, y, z);
    item.castShadow = shadow; item.receiveShadow = true;
    return item;
  };
  const register = (key: LayerKey, object: Object3D, ...materials: MeshStandardMaterial[]) => {
    layers.set(key, {key, object, materials});
  };
  const instanced = (g: BufferGeometry, m: MeshStandardMaterial, matrices: Matrix4[]) => {
    const item = new InstancedMesh(g, m, matrices.length);
    matrices.forEach((matrix, i) => item.setMatrixAt(i, matrix));
    item.castShadow = true; item.receiveShadow = true;
    item.instanceMatrix.needsUpdate = true;
    return item;
  };
  const tmp = new Object3D();
  const matrixAt = (x: number, y: number, z: number, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => {
    tmp.position.set(x, y, z); tmp.rotation.set(rx, ry, rz); tmp.scale.set(sx, sy, sz); tmp.updateMatrix();
    return tmp.matrix.clone();
  };

  /* ---------- Brick texture (procedural, no network request) ---------- */
  const brickTexture = (() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = PALETTE.mortar; ctx.fillRect(0, 0, 256, 256);
    const base = new Color(PALETTE.brick), c = new Color();
    for (let row = 0; row < 16; row++) {
      for (let col = -1; col < 5; col++) {
        const seed = Math.sin(row * 91.7 + col * 37.3) * 0.5 + 0.5;
        c.copy(base).offsetHSL(0, (seed - 0.5) * 0.06, (seed - 0.5) * 0.08);
        ctx.fillStyle = '#' + c.getHexString();
        ctx.fillRect(col * 64 + (row % 2) * 32 + 2, row * 16 + 2, 60, 12);
      }
    }
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace; texture.wrapS = texture.wrapT = RepeatWrapping; texture.anisotropy = 4;
    disposables.push(texture);
    return texture;
  })();
  /** One texture tile = 4 bricks (0.84 m) by 16 courses (1.04 m). Pass the face size in metres. */
  const brickMaterial = (width: number, height: number) => {
    const map = brickTexture.clone() as Texture;
    map.repeat.set(width / 0.84, height / 1.04); map.needsUpdate = true;
    disposables.push(map);
    return material('#ffffff', 0.92, 0, {map});
  };

  /* ---------- Ground plinth and house body ---------- */
  const slab = material(PALETTE.slab, 0.95);
  root.add(mesh(box(W + 0.7, 0.24, D + 0.7), slab, 0, 0.12, 0, false));
  const wallH = H - 0.24, wallY = 0.24 + wallH / 2, t = 0.3;
  const longWall = brickMaterial(W, wallH), shortWall = brickMaterial(D, wallH);
  root.add(mesh(box(W, wallH, t), longWall, 0, wallY, D / 2 - t / 2));
  root.add(mesh(box(W, wallH, t), longWall, 0, wallY, -D / 2 + t / 2));
  root.add(mesh(box(t, wallH, D - 2 * t), shortWall, X0 + t / 2, wallY, 0));
  root.add(mesh(box(t, wallH, D - 2 * t), shortWall, X1 - t / 2, wallY, 0));
  // Ceiling / attic floor, visible through the open gable.
  root.add(mesh(box(W - 0.02, 0.18, D - 0.02), material(PALETTE.frame, 0.9), 0, H + 0.09 - 0.18, 0));
  // Right gable triangle.
  const rise = (D / 2) * Math.tan(PITCH);
  const gableShape = new Shape();
  gableShape.moveTo(-D / 2, 0); gableShape.lineTo(D / 2, 0); gableShape.lineTo(0, rise); gableShape.closePath();
  const gableGeometry = boxUV(geometry(new ExtrudeGeometry(gableShape, {depth: t, bevelEnabled: false})));
  const gable = new Mesh(gableGeometry, brickMaterial(1, 1));
  gable.rotation.y = -Math.PI / 2; gable.position.set(X1, H - 0.01, 0);
  gable.castShadow = true; gable.receiveShadow = true;
  root.add(gable);

  // Front openings: door and two windows (frames + glass).
  const frameMat = material(PALETTE.frame, 0.6), glassMat = material(PALETTE.glass, 0.15, 0.4), darkMat = material(PALETTE.dark, 0.5, 0.2);
  const opening = (x: number, y: number, w: number, h: number, door = false) => {
    root.add(mesh(box(w + 0.12, h + 0.12, 0.06), frameMat, x, y, D / 2 + 0.01, false));
    root.add(mesh(box(w, h, 0.04), door ? darkMat : glassMat, x, y, D / 2 + 0.03, false));
    if (!door) root.add(mesh(box(0.04, h, 0.05), frameMat, x, y, D / 2 + 0.05, false));
  };
  opening(-1.6, 1.5, 1.3, 1.25); opening(1.7, 1.5, 1.3, 1.25); opening(0.05, 1.3, 0.95, 2.05, true);

  /* ---------- Roof slopes ---------- */
  const tileShape = new Shape();
  // Flat interlocking tile with a raised side roll: the roll catches the low sun and reads as tile courses.
  tileShape.moveTo(-TILE_W / 2, 0); tileShape.lineTo(TILE_W / 2, 0); tileShape.lineTo(TILE_W / 2, 0.02);
  tileShape.lineTo(TILE_W / 2 - 0.015, 0.05); tileShape.lineTo(TILE_W / 2 - 0.04, 0.056); tileShape.lineTo(TILE_W / 2 - 0.06, 0.036);
  tileShape.lineTo(TILE_W / 2 - 0.07, 0.02); tileShape.lineTo(-TILE_W / 2, 0.02); tileShape.closePath();
  const tileGeometry = geometry(new ExtrudeGeometry(tileShape, {depth: 0.42, bevelEnabled: false}));
  tileGeometry.translate(0, 0, -0.21);

  const mats = {
    rafters: material(PALETTE.timber, 0.82), insulation: material(PALETTE.wool, 0.96), vapour: material(PALETTE.vapour, 0.9),
    membrane: material(PALETTE.membrane, 0.62), counter: material(PALETTE.timberDark, 0.85), battens: material(PALETTE.timber, 0.82),
    tiles: material('#ffffff', 0.5, 0.05), ridge: material(PALETTE.tile, 0.5, 0.05), fascia: material(PALETTE.frame, 0.7),
    gutter: material(PALETTE.zinc, 0.38, 0.55, {side: DoubleSide}), window: material(PALETTE.dark, 0.4, 0.3),
  };
  const slopeLayers: Partial<Record<LayerKey, Group>> = {};
  let frontTiles!: RoofModel['frontTiles'];
  let frontBattens!: RoofModel['frontBattens'];
  const tileBase = new Color(PALETTE.tile);

  for (const side of [1, -1] as const) {
    const slope = new Group();
    slope.position.set(0, H, side * D / 2);
    slope.rotation.x = side * PITCH;
    root.add(slope);
    // Local frame: x along the ridge, y = slope normal, z = -side * distance up the slope.
    const along = (s: number) => -side * s;
    const group = (key: LayerKey) => {
      const g = new Group(); g.name = key; slope.add(g);
      if (side === 1) slopeLayers[key] = g;
      return g;
    };
    const spanStart = -OVERHANG, spanEnd = SLOPE + 0.06, spanLength = spanEnd - spanStart, spanMid = along((spanStart + spanEnd) / 2);

    // Rafters, every 0.6 m.
    const rafterX: number[] = [];
    for (let x = X0 + 0.04; x <= X1 - 0.03; x += 0.6) rafterX.push(x);
    const rafters = group('rafters');
    rafters.add(instanced(box(0.08, 0.2, spanLength), mats.rafters, rafterX.map(x => matrixAt(x, -0.1, spanMid))));
    // Insulation batts between rafters (three per bay).
    const insulation = group('insulation');
    const batts: Matrix4[] = [];
    for (let i = 0; i < rafterX.length - 1; i++) for (let k = 0; k < 3; k++) {
      const s0 = k * (SLOPE / 3);
      batts.push(matrixAt((rafterX[i] + rafterX[i + 1]) / 2, -0.1, along(s0 + SLOPE / 6)));
    }
    insulation.add(instanced(box(0.51, 0.19, SLOPE / 3 - 0.012), mats.insulation, batts));
    const vapour = group('vapour');
    vapour.add(mesh(box(W, 0.006, SLOPE), mats.vapour, 0, -0.205, along(SLOPE / 2), false));
    // Underlay, counter-battens and battens step back from the cut so every layer stays visible.
    const membraneStart = X0 + STEP.membrane, battensStart = X0 + STEP.battens, tilesStart = X0 + STEP.tiles;
    const membrane = group('membrane');
    membrane.add(mesh(box(X1 - membraneStart, 0.012, spanLength), mats.membrane, (membraneStart + X1) / 2, 0.006, spanMid));
    const counter = group('counter');
    counter.add(instanced(box(0.05, 0.03, spanLength), mats.counter, rafterX.filter(x => x > membraneStart).map(x => matrixAt(x, 0.027, spanMid))));
    const battens = group('battens');
    const battenMatrices: Matrix4[] = [], battenRows: number[] = [];
    let rowCount = 0;
    for (let s = spanStart + 0.06; s < SLOPE - 0.05; s += ROW) {
      battenMatrices.push(matrixAt((battensStart + X1) / 2, 0.06, along(s)));
      battenRows.push(rowCount++);
    }
    const battenMesh = instanced(box(X1 - battensStart, 0.035, 0.05), mats.battens, battenMatrices);
    battens.add(battenMesh);

    // Tiles, with a roof window on the front slope.
    const tiles = group('tiles');
    const tileMatrices: Matrix4[] = [], tileRows: number[] = [], patch: number[] = [];
    const windowCols = [12, 13, 14], windowRows = [5, 6, 7, 8];
    const cols = Math.floor((X1 - tilesStart) / TILE_W);
    for (let r = 0; r < rowCount; r++) for (let c = 0; c < cols; c++) {
      if (side === 1 && windowCols.includes(c) && windowRows.includes(r)) continue;
      const s = spanStart + 0.06 + r * ROW;
      tileMatrices.push(matrixAt(tilesStart + TILE_W / 2 + c * TILE_W, 0.09, along(s + 0.13), side * 0.1));
      tileRows.push(r);
      // Renovation patch: a small cluster on the right of the front slope.
      if (side === 1 && r >= 3 && r <= 4 && c >= 16 && c <= 18) patch.push(tileMatrices.length - 1);
    }
    const tileMesh = instanced(tileGeometry, mats.tiles, tileMatrices);
    tileMatrices.forEach((_, i) => {
      const seed = Math.sin(i * 12.9898 + side * 78.233) * 43758.5453;
      const jitter = (seed - Math.floor(seed) - 0.5) * 0.035;
      const color = tileBase.clone().offsetHSL(0, 0, jitter);
      tileMesh.setColorAt(i, color);
      if (side === 1) tileColors.push(color);
    });
    tileMesh.instanceColor!.needsUpdate = true;
    tiles.add(tileMesh);

    if (side === 1) {
      frontTiles = {mesh: tileMesh, base: tileMatrices, rows: tileRows, patch, rowCount};
      frontBattens = {mesh: battenMesh, base: battenMatrices, rows: battenRows};
      const roofWindow = group('window');
      const wx = tilesStart + TILE_W * 13.5, ws = spanStart + 0.06 + ROW * 6.5 + 0.13;
      roofWindow.add(mesh(box(0.98, 0.07, 1.42), mats.window, wx, 0.1, along(ws)));
      roofWindow.add(mesh(box(0.84, 0.02, 1.26), glassMat, wx, 0.14, along(ws), false));
      layers.set('window', {key: 'window', object: roofWindow, materials: [mats.window]});
      anchors.push({id: 'window', parent: roofWindow, local: new Vector3(wx + 0.5, 0.12, along(ws)), side: 'right', leader: 36});
      // Anchors sit on the stepped cut, one per layer, spread up the slope.
      anchors.push({id: 'rafters', parent: rafters, local: new Vector3(X0 + 0.04, -0.12, along(0.5)), side: 'left', leader: 48});
      anchors.push({id: 'insulation', parent: insulation, local: new Vector3(X0 + 0.3, -0.02, along(1.25)), side: 'left', leader: 56});
      anchors.push({id: 'membrane', parent: membrane, local: new Vector3(membraneStart + 0.2, 0.015, along(2.0)), side: 'left', leader: 64});
      anchors.push({id: 'battens', parent: battens, local: new Vector3(battensStart + 0.25, 0.08, along(2.7)), side: 'left', leader: 72});
      anchors.push({id: 'tiles', parent: tiles, local: new Vector3(tilesStart + 0.6, 0.13, along(3.35)), side: 'left', leader: 80});
      anchors.push({id: 'patch', parent: tiles, local: new Vector3(tilesStart + TILE_W * 18.6, 0.13, along(spanStart + ROW * 3.8)), side: 'right', leader: 40});
    }
  }
  for (const key of ['rafters', 'insulation', 'vapour', 'membrane', 'counter', 'battens', 'tiles'] as const) {
    register(key, slopeLayers[key]!, mats[key]);
  }
  // Ridge caps over the tiled part of the ridge.
  const ridgeY = H + rise + 0.09;
  const ridgeGeometry = geometry(new CylinderGeometry(0.14, 0.14, 0.42, 14, 1, false, 0, Math.PI));
  ridgeGeometry.rotateZ(Math.PI / 2);
  const ridgeMatrices: Matrix4[] = [];
  for (let x = X0 + STEP.tiles + 0.21; x < X1; x += 0.4) ridgeMatrices.push(matrixAt(x, ridgeY, 0));
  const ridge = instanced(ridgeGeometry, mats.ridge, ridgeMatrices);
  root.add(ridge);
  register('ridge', ridge, mats.ridge);

  // Fascia board (kroonlijst) and zinc half-round gutter along the front eaves.
  const eave = new Vector3(0, H, D / 2).add(new Vector3(0, Math.sin(PITCH), -Math.cos(PITCH)).multiplyScalar(-OVERHANG));
  const fascia = new Group();
  fascia.add(mesh(box(W + 0.06, 0.2, 0.03), mats.fascia, 0, eave.y - 0.02, eave.z + 0.02));
  root.add(fascia);
  register('fascia', fascia, mats.fascia);
  anchors.push({id: 'fascia', parent: fascia, local: new Vector3(X1 - 0.4, eave.y - 0.04, eave.z + 0.05), side: 'right', leader: 48});
  const gutterGeometry = geometry(new CylinderGeometry(0.09, 0.09, W + 0.2, 18, 1, true, Math.PI, Math.PI));
  gutterGeometry.rotateZ(Math.PI / 2);
  const gutter = new Group();
  gutter.add(mesh(gutterGeometry, mats.gutter, 0, eave.y - 0.06, eave.z + 0.12));
  gutter.add(mesh(geometry(new CylinderGeometry(0.04, 0.04, eave.y - 0.3, 10)), mats.gutter, X1 - 0.12, (eave.y - 0.3) / 2 + 0.24, eave.z + 0.12));
  root.add(gutter);
  register('gutter', gutter, mats.gutter);

  /* ---------- Flat-roof annex (EPDM) ---------- */
  const AX0 = X1, AX1 = X1 + 2.8, AZ0 = -0.6, AZ1 = D / 2, AH = 2.6;
  const aw = AX1 - AX0, ad = AZ1 - AZ0, acx = (AX0 + AX1) / 2, acz = (AZ0 + AZ1) / 2;
  const annexWall = brickMaterial(aw, AH - 0.24);
  root.add(mesh(box(aw + 0.35, 0.24, ad + 0.35), slab, acx, 0.12, acz, false));
  root.add(mesh(box(aw, AH - 0.24, ad), annexWall, acx, 0.24 + (AH - 0.24) / 2, acz));
  // Large glazed front.
  root.add(mesh(box(2.0, 1.9, 0.06), darkMat, acx, 1.27, AZ1 + 0.01, false));
  root.add(mesh(box(1.86, 1.76, 0.04), glassMat, acx, 1.27, AZ1 + 0.03, false));
  const annexLayers: Partial<Record<LayerKey, Group>> = {};
  const annexGroup = (key: LayerKey) => {const g = new Group(); g.position.y = AH; root.add(g); annexLayers[key] = g; return g};
  const annexDeck = annexGroup('annexDeck');
  const deckMat = material(PALETTE.timberDark, 0.85);
  annexDeck.add(mesh(box(aw + 0.1, 0.08, ad + 0.1), deckMat, acx, 0.04, acz));
  register('annexDeck', annexDeck, deckMat);
  const annexInsulation = annexGroup('annexInsulation');
  const boardMat = material(PALETTE.wool, 0.9);
  const boards: Matrix4[] = [];
  for (let i = 0; i < 3; i++) for (let k = 0; k < 2; k++) boards.push(matrixAt(AX0 + 0.05 + (i + 0.5) * (aw / 3), 0.15, AZ0 + 0.05 + (k + 0.5) * ((ad - 0.1) / 2)));
  annexInsulation.add(instanced(box(aw / 3 - 0.03, 0.14, (ad - 0.1) / 2 - 0.03), boardMat, boards));
  register('annexInsulation', annexInsulation, boardMat);
  anchors.push({id: 'annexInsulation', parent: annexInsulation, local: new Vector3(AX1, 0.15, AZ1 - 0.3), side: 'right', leader: 44});
  const annexMembrane = annexGroup('annexMembrane');
  const epdmMat = material(PALETTE.epdm, 0.68), edgeMat = material(PALETTE.zinc, 0.4, 0.5);
  // The EPDM sheet's origin sits on its left edge so scaling x reads as unrolling.
  const epdmGeometry = box(aw + 0.1, 0.014, ad + 0.1);
  epdmGeometry.translate((aw + 0.1) / 2, 0, 0);
  const epdmSheet = mesh(epdmGeometry, epdmMat, AX0 - 0.05, 0.23, acz);
  annexMembrane.add(epdmSheet);
  // Upstands and aluminium roof edge.
  annexMembrane.add(mesh(box(aw + 0.14, 0.14, 0.05), edgeMat, acx, 0.29, AZ1 + 0.07));
  annexMembrane.add(mesh(box(0.05, 0.14, ad + 0.14), edgeMat, AX1 + 0.07, 0.29, acz));
  annexMembrane.add(mesh(box(aw + 0.14, 0.14, 0.05), edgeMat, acx, 0.29, AZ0 - 0.07));
  annexMembrane.add(mesh(geometry(new CylinderGeometry(0.06, 0.06, 0.05, 12)), edgeMat, AX1 - 0.25, 0.25, AZ0 + 0.25));
  register('annexMembrane', annexMembrane, epdmMat, edgeMat);
  anchors.push({id: 'epdm', parent: annexMembrane, local: new Vector3(AX1 - 0.2, 0.26, AZ0 + 0.3), side: 'right', leader: 44});

  /* ---------- Shed with old corrugated (fibre-cement) sheets ---------- */
  const SX0 = -6.4, SX1 = -4.6, SZ0 = -3.4, SZ1 = -1.4, SH_FRONT = 2.1, SH_BACK = 1.8;
  const sw = SX1 - SX0, sd = SZ1 - SZ0, scx = (SX0 + SX1) / 2, scz = (SZ0 + SZ1) / 2;
  root.add(mesh(box(sw + 0.3, 0.16, sd + 0.3), slab, scx, 0.08, scz, false));
  // Shed body: trapezoid profile (higher at the front) extruded along x.
  const shedShape = new Shape();
  shedShape.moveTo(SZ0, 0.16); shedShape.lineTo(SZ1, 0.16); shedShape.lineTo(SZ1, SH_FRONT); shedShape.lineTo(SZ0, SH_BACK); shedShape.closePath();
  const shedBody = new Mesh(boxUV(geometry(new ExtrudeGeometry(shedShape, {depth: sw, bevelEnabled: false}))), brickMaterial(1, 1));
  shedBody.rotation.y = -Math.PI / 2; shedBody.position.x = SX1;
  shedBody.castShadow = true; shedBody.receiveShadow = true;
  root.add(shedBody);
  const shedPitch = -Math.atan2(SH_FRONT - SH_BACK, sd);
  const shedRoof = new Group();
  shedRoof.position.set(scx, (SH_FRONT + SH_BACK) / 2 + 0.02, scz);
  shedRoof.rotation.x = shedPitch;
  root.add(shedRoof);
  const shedDeckMat = material(PALETTE.dark, 0.55, 0.15);
  const shedDeck = new Group();
  shedDeck.add(mesh(box(sw + 0.3, 0.05, sd + 0.35), shedDeckMat, 0, 0, 0));
  shedRoof.add(shedDeck);
  register('shedDeck', shedDeck, shedDeckMat);
  anchors.push({id: 'shedDeck', parent: shedDeck, local: new Vector3(sw / 2 + 0.1, 0.04, 0.2), side: 'right', leader: 40});
  // Corrugated sheet geometry: a sine-profiled plane.
  const sheetGeometry = geometry(new PlaneGeometry(0.72, 1.18, 36, 1));
  const pos = sheetGeometry.attributes.position;
  for (let i = 0; i < pos.count; i++) pos.setZ(i, Math.sin((pos.getX(i) / 0.72) * Math.PI * 2 * 5) * 0.022);
  sheetGeometry.rotateX(-Math.PI / 2);
  sheetGeometry.computeVertexNormals();
  const sheetMat = material(PALETTE.fibreCement, 0.92, 0, {side: DoubleSide});
  const sheetBase: Matrix4[] = [], sheetStack: Matrix4[] = [];
  const roofMatrix = new Matrix4().compose(shedRoof.position, new Quaternion().setFromEuler(shedRoof.rotation), new Vector3(1, 1, 1));
  const inverseRoof = roofMatrix.clone().invert();
  // Stack on a pallet in front of the shed; expressed in shed-roof space so the mesh stays one InstancedMesh.
  const pallet = mesh(box(0.95, 0.14, 1.35), deckMat, scx + 0.1, 0.07, SZ1 + 1.15);
  root.add(pallet);
  let n = 0;
  for (let row = 0; row < 2; row++) for (let col = 0; col < 3; col++) {
    sheetBase.push(matrixAt(-sw / 2 + 0.34 + col * 0.62, 0.05, -sd / 2 + 0.55 + row * 1.0));
    const world = matrixAt(scx + 0.1, 0.17 + n * 0.045, SZ1 + 1.15, 0, n % 2 ? 0.03 : -0.03);
    sheetStack.push(inverseRoof.clone().multiply(world));
    n++;
  }
  const sheets = instanced(sheetGeometry, sheetMat, sheetBase);
  shedRoof.add(sheets);
  register('sheets', sheets, sheetMat);
  // Shown only in the asbestos view, when the sheets are stacked on the pallet.
  anchors.push({id: 'sheets', parent: root, local: new Vector3(scx - 0.35, 0.4, SZ1 + 1.15), side: 'left', leader: 44});

  return {
    root, layers, anchors, frontTiles, frontBattens, slopeLayers, annexLayers, tileColors, epdmSheet,
    sheets: {mesh: sheets, base: sheetBase, stack: sheetStack},
    dispose: () => {
      for (const item of disposables) item.dispose();
      root.traverse(object => {if (object instanceof InstancedMesh) object.dispose()});
    },
  };
}

/** Model-space bounds, used to frame the camera. */
export const MODEL = {W, D, H, X0, X1, PITCH, SLOPE};
