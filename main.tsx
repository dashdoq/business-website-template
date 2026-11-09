import {createRoot, hydrateRoot} from 'react-dom/client';
import {renderPage} from './app/render-page';
import {languageFromPath, pageFromPath} from './app/seo-data';
import './app/globals.css';

const root = document.getElementById('root')!;
// The 404 page is pre-rendered with data-page="404" so it hydrates as itself on any unknown URL.
const id = root.dataset.page === '404' ? null : pageFromPath(location.pathname);
const page = renderPage(id, languageFromPath(location.pathname));
if (root.hasChildNodes()) hydrateRoot(root, page); else createRoot(root).render(page);
