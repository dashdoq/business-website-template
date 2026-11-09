import {renderToString} from 'react-dom/server';
import {renderPage} from '../app/render-page';
import {languageFromPath, pageFromPath} from '../app/seo-data';

export function render(path: string) {
  const id = pageFromPath(path);
  if (!id) throw new Error('Unknown page: ' + path);
  return renderToString(renderPage(id, languageFromPath(path)));
}
export function renderNotFound(language: 'nl' | 'fr') {
  return renderToString(renderPage(null, language));
}
