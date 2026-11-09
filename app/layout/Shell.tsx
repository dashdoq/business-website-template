'use client';
import type {ReactNode} from 'react';
import {MessageCircle, Phone} from 'lucide-react';
import {Dialog, DialogContent, DialogTitle, DialogDescription} from '@/components/ui/dialog';
import {LanguageContext} from '../i18n';
import {CookieControls} from '../cookie-controls';
import {UI} from '../content/common';
import {COMPANY} from '../content/home';
import {pageCopy, pagePath, type PageId, type SiteLanguage} from '../seo-data';
import {ComfortProvider, useComfort} from './comfort';
import {SiteHeader} from './SiteHeader';
import {SiteFooter} from './SiteFooter';

function DisplaySettings({language}: {language: SiteLanguage}) {
  const ui = UI[language].settings;
  const {reduced, paused, contrast, setComfort, settingsOpen, setSettingsOpen} = useComfort();
  const row = (key: 'reduced' | 'paused' | 'contrast', label: string, value: boolean, help?: string) => (
    <div className="setting">
      <label>{label}<input className="switch" type="checkbox" role="switch" checked={value} onChange={event => setComfort({[key]: event.target.checked})} /></label>
      {help && <p>{help}</p>}
    </div>
  );
  return (
    <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
      <DialogContent>
        <DialogTitle>{ui.title}</DialogTitle>
        <DialogDescription className="muted">{ui.description}</DialogDescription>
        {row('reduced', ui.reduced, reduced, ui.reducedHelp)}
        {row('paused', ui.paused, paused)}
        {row('contrast', ui.contrast, contrast)}
        <p className="form-note" style={{marginTop: 16}}>{ui.storage}</p>
      </DialogContent>
    </Dialog>
  );
}

function ActionBar({language}: {language: SiteLanguage}) {
  const ui = UI[language];
  return (
    <nav className="action-bar" aria-label={ui.footerContact}>
      <a className="btn btn-secondary" href={COMPANY.phoneHref}><Phone size={18} aria-hidden="true" />{ui.call}</a>
      <a className="btn btn-secondary" href={COMPANY.whatsapp} target="_blank" rel="noopener"><MessageCircle size={18} aria-hidden="true" />WhatsApp</a>
      <a className="btn btn-primary" href={pagePath('contact', language) + '#aanvraag'}>{ui.ctaShort}</a>
    </nav>
  );
}

export function Breadcrumbs({id, language}: {id: PageId; language: SiteLanguage}) {
  const ui = UI[language];
  return (
    <nav className="breadcrumbs" aria-label={ui.breadcrumb}>
      <ol>
        <li><a href={pagePath('home', language)}>INGBELG</a></li>
        <li aria-current="page">{pageCopy(id, language).crumb}</li>
      </ol>
    </nav>
  );
}

/** Shared page frame: header, main landmark, footer, mobile action bar, consent and display settings. */
export function Shell({id, language, children}: {id: PageId | null; language: SiteLanguage; children: ReactNode}) {
  return (
    <LanguageContext.Provider value={language}>
      <ComfortProvider>
        <a className="skip-link" href="#main">{UI[language].skip}</a>
        <SiteHeader id={id} language={language} />
        <main id="main" tabIndex={-1}>{children}</main>
        <SiteFooter language={language} />
        <ActionBar language={language} />
        <CookieControls language={language} />
        <DisplaySettings language={language} />
      </ComfortProvider>
    </LanguageContext.Provider>
  );
}
