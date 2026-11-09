'use client';
import {useEffect, useId, useRef, useState} from 'react';
import {ChevronDown, Menu, Phone, ArrowRight} from 'lucide-react';
import {Sheet, SheetContent, SheetTitle, SheetDescription} from '@/components/ui/sheet';
import {UI} from '../content/common';
import {COMPANY} from '../content/home';
import {SERVICES} from '../content/services';
import {SERVICE_IDS} from '../content/service-ids';
import {TOOLS} from '../content/tools';
import {TOOL_IDS} from '../tool-routing';
import {SERVICE_PAGE, pageKind, pagePath, type PageId, type SiteLanguage} from '../seo-data';

type Props = {id: PageId | null; language: SiteLanguage};

export function LanguageSwitch({id, language}: Props) {
  const ui = UI[language];
  return (
    <nav className="lang-switch" aria-label={ui.languageLabel}>
      {(['nl', 'fr'] as const).map(lang => (
        <a key={lang} href={pagePath(id ?? 'home', lang)} hrefLang={lang + '-BE'} lang={lang} aria-current={lang === language ? 'true' : undefined}>
          {lang.toUpperCase()}
        </a>
      ))}
    </nav>
  );
}

function ServicesMenu({id, language}: Props) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const root = useRef<HTMLLIElement>(null);
  const ui = UI[language];
  const active = id !== null && pageKind(id) === 'service';
  useEffect(() => {
    if (!open) return;
    const close = (event: Event) => {
      if (event instanceof KeyboardEvent ? event.key === 'Escape' : !root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', close);
    return () => {document.removeEventListener('pointerdown', close); document.removeEventListener('keydown', close)};
  }, [open]);
  return (
    <li className="nav-dropdown" ref={root} onBlur={event => {if (!root.current?.contains(event.relatedTarget as Node)) setOpen(false)}}>
      <button type="button" className="nav-dropdown__toggle" aria-expanded={open} aria-controls={panelId} data-active={active || undefined} onClick={() => setOpen(!open)}>
        {ui.nav.services} <ChevronDown size={16} aria-hidden="true" />
      </button>
      <ul id={panelId} className="nav-dropdown__panel" hidden={!open}>
        {SERVICE_IDS.map(service => {
          const page = SERVICE_PAGE[service];
          return (
            <li key={service}>
              <a href={pagePath(page, language)} aria-current={id === page ? 'page' : undefined}>
                <strong>{SERVICES[service].copy[language].name}</strong>
                <span>{SERVICES[service].copy[language].short}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </li>
  );
}

export function SiteHeader({id, language}: Props) {
  const ui = UI[language];
  const [menuOpen, setMenuOpen] = useState(false);
  const current = (page: PageId) => (id === page ? 'page' : undefined);
  const toolActive = id !== null && pageKind(id) === 'tool';
  return (
    <header className="site-header">
      <div className="container">
        <a className="brand" href={pagePath('home', language)} aria-label={ui.homeLabel}>
          <img src="/images/logo-240.png" width={240} height={116} alt="INGBELG" />
          <span className="brand-note">{language === 'nl' ? <>Dakwerken &amp;<br />renovatie</> : <>Toiture &amp;<br />rénovation</>}</span>
        </a>
        <nav className="primary-nav" aria-label={ui.mainNav}>
          <ul>
            <ServicesMenu id={id} language={language} />
            <li><a href={pagePath('projects', language)} aria-current={current('projects')}>{ui.nav.projects}</a></li>
            <li><a href={pagePath('renculator', language)} aria-current={toolActive ? 'page' : undefined}>{ui.nav.tools}</a></li>
            <li><a href={pagePath('contact', language)} aria-current={current('contact')}>{ui.nav.contact}</a></li>
          </ul>
        </nav>
        <div className="header-actions">
          <a className="header-phone" href={COMPANY.phoneHref}><Phone size={16} aria-hidden="true" />{COMPANY.phone}</a>
          <LanguageSwitch id={id} language={language} />
          <a className="btn btn-primary header-cta" href={pagePath('contact', language) + '#aanvraag'}>{ui.cta}</a>
          <button type="button" className="icon-button menu-toggle" aria-label={ui.openMenu} aria-expanded={menuOpen} onClick={() => setMenuOpen(true)}>
            <Menu size={22} aria-hidden="true" />
          </button>
        </div>
      </div>
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent className="menu-sheet">
          <SheetTitle>{ui.menuTitle}</SheetTitle>
          <SheetDescription className="muted">{ui.menuDescription}</SheetDescription>
          <nav aria-label={ui.mainNav}>
            <ul>
              <li><a href={pagePath('home', language)} aria-current={current('home')}>{language === 'nl' ? 'Home' : 'Accueil'}<ArrowRight size={18} aria-hidden="true" /></a></li>
              <li>
                <a href={pagePath('home', language) + '#diensten'}>{ui.nav.services}<ArrowRight size={18} aria-hidden="true" /></a>
                <ul className="menu-sub">
                  {SERVICE_IDS.map(service => <li key={service}><a href={pagePath(SERVICE_PAGE[service], language)} aria-current={current(SERVICE_PAGE[service])}>{SERVICES[service].copy[language].name}</a></li>)}
                </ul>
              </li>
              <li><a href={pagePath('projects', language)} aria-current={current('projects')}>{ui.nav.projects}<ArrowRight size={18} aria-hidden="true" /></a></li>
              <li>
                <a href={pagePath('renculator', language)}>{ui.nav.tools}<ArrowRight size={18} aria-hidden="true" /></a>
                <ul className="menu-sub">
                  {TOOL_IDS.map(tool => <li key={tool}><a href={pagePath(tool, language)} aria-current={current(tool)}>{TOOLS[tool][language].name} · {TOOLS[tool][language].kicker}</a></li>)}
                </ul>
              </li>
              <li><a href={pagePath('contact', language)} aria-current={current('contact')}>{ui.nav.contact}<ArrowRight size={18} aria-hidden="true" /></a></li>
            </ul>
          </nav>
          <a className="btn btn-primary" href={pagePath('contact', language) + '#aanvraag'}>{ui.cta}</a>
          <a className="btn btn-secondary" href={COMPANY.phoneHref}><Phone size={18} aria-hidden="true" />{COMPANY.phone}</a>
        </SheetContent>
      </Sheet>
    </header>
  );
}
