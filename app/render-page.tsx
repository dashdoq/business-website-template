import {HomePage} from './pages/HomePage';
import {ServicePage} from './pages/ServicePage';
import {ContactPage, GalleryPage, NotFoundPage, ToolPage} from './pages/OtherPages';
import {PolicyPage} from './pages/PolicyPage';
import {pageKind, type PageId, type SiteLanguage} from './seo-data';
import type {ServiceId} from './content/service-ids';
import type {ToolId} from './tool-routing';

/** Maps a catalog page to its component. Shared by the client entry and the pre-renderer. */
export function renderPage(id: PageId | null, language: SiteLanguage) {
  if (id === null) return <NotFoundPage language={language} />;
  switch (pageKind(id)) {
    case 'home': return <HomePage language={language} />;
    case 'service': return <ServicePage id={id as ServiceId} language={language} />;
    case 'tool': return <ToolPage tool={id as ToolId} language={language} />;
    case 'gallery': return <GalleryPage language={language} />;
    case 'contact': return <ContactPage language={language} />;
    case 'policy': return <PolicyPage kind={id as 'privacy' | 'cookies' | 'accessibility'} language={language} />;
  }
}
