'use client';
import {UI} from '../content/common';
import {COMPANY} from '../content/home';
import {SERVICES} from '../content/services';
import {SERVICE_IDS} from '../content/service-ids';
import {TOOLS} from '../content/tools';
import {TOOL_IDS} from '../tool-routing';
import {openCookieSettings} from '../consent-storage';
import {SERVICE_PAGE, pagePath, type SiteLanguage} from '../seo-data';
import {useComfort} from './comfort';

export function SiteFooter({language}: {language: SiteLanguage}) {
  const ui = UI[language];
  const {setSettingsOpen} = useComfort();
  return (
    <footer className="site-footer on-dark">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <img src="/images/logo-240.png" width={240} height={116} alt="INGBELG" loading="lazy" decoding="async" />
            <p>{ui.footerTagline}</p>
          </div>
          <nav aria-labelledby="footer-services">
            <h2 id="footer-services">{ui.footerServices}</h2>
            <ul>{SERVICE_IDS.map(service => <li key={service}><a href={pagePath(SERVICE_PAGE[service], language)}>{SERVICES[service].copy[language].name}</a></li>)}
              <li><a href={pagePath('projects', language)}>{ui.nav.projects}</a></li></ul>
          </nav>
          <nav aria-labelledby="footer-tools">
            <h2 id="footer-tools">{ui.footerTools}</h2>
            <ul>{TOOL_IDS.map(tool => <li key={tool}><a href={pagePath(tool, language)}>{TOOLS[tool][language].name}</a></li>)}</ul>
          </nav>
          <div>
            <h2>{ui.footerContact}</h2>
            <address>
              <span>{COMPANY.name}</span>
              <span>{COMPANY.street}</span>
              <span>{COMPANY.postalCode} {COMPANY.town}</span>
            </address>
            <ul>
              <li><a href={COMPANY.phoneHref}>{COMPANY.phone}</a></li>
              <li><a href={'mailto:' + COMPANY.email}>{COMPANY.email}</a></li>
              <li><a href={COMPANY.whatsapp} target="_blank" rel="noopener">WhatsApp <span className="sr-only">{ui.opensNewTab}</span></a></li>
              <li><a href={COMPANY.maps} target="_blank" rel="noopener">{ui.route} <span className="sr-only">{ui.opensNewTab}</span></a></li>
            </ul>
          </div>
          <nav aria-labelledby="footer-info">
            <h2 id="footer-info">{ui.footerInfo}</h2>
            <ul>
              <li><a href={pagePath('contact', language)}>{ui.nav.contact}</a></li>
              <li><a href={pagePath('privacy', language)}>{ui.privacy}</a></li>
              <li><a href={pagePath('cookies', language)}>{ui.cookies}</a></li>
              <li><a href={pagePath('accessibility', language)}>{ui.accessibility}</a></li>
              <li><button type="button" onClick={openCookieSettings}>{ui.cookiePrefs}</button></li>
              <li><button type="button" onClick={() => setSettingsOpen(true)}>{ui.displaySettings}</button></li>
            </ul>
          </nav>
        </div>
        <div className="footer-bottom">
          <span>© {COMPANY.name} · {COMPANY.town}</span>
          <p>{ui.ratingNote}</p>
        </div>
      </div>
    </footer>
  );
}
