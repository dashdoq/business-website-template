import '../app/globals.css';
import {RoofScene, type SceneFocus} from '../app/scene/roof-scene';
import {LABELS} from '../app/scene/RoofStage';
import type {AnchorId} from '../app/scene/roof-model';

const params = new URLSearchParams(location.search);
const focus = Number(params.get('focus') ?? -1) as SceneFocus;
const language = params.get('lang') === 'fr' ? 'fr' : 'nl';
const labelRoot = document.getElementById('labels')!;
if (params.get('labels') === '1') {
  for (const id of Object.keys(LABELS) as AnchorId[]) {
    const span = document.createElement('span');
    span.className = 'annotation'; span.dataset.anchor = id;
    const text = document.createElement('span');
    text.textContent = LABELS[id][language];
    span.append(document.createElement('i'), text);
    labelRoot.append(span);
  }
}
await document.fonts.ready;
const scene = new RoofScene({
  canvas: document.getElementById('canvas') as HTMLCanvasElement, labels: labelRoot, focus, still: true, reduced: true,
  onReady: () => setTimeout(() => {document.body.dataset.ready = '1'}, 100),
});
scene.resize(1380, 1200);
scene.setActive(true);
