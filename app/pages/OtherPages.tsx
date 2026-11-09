import {Clock3, ExternalLink, Mail, MapPin, MessageCircle, Phone} from 'lucide-react';
import {Breadcrumbs, Shell} from '../layout/Shell';
import {ContactBand, ContactForm} from '../sections/ContactForm';
import {FaqList, TOOL_ICONS, ToolList, WorkGrid} from '../sections/Blocks';
import {UI} from '../content/common';
import {COMPANY, HOME_FAQ} from '../content/home';
import {SERVICES} from '../content/services';
import {SERVICE_IDS} from '../content/service-ids';
import {TOOLS} from '../content/tools';
import {PREMIUM_SOURCES} from '../premium-calculation';
import {TOOL_IDS, type ToolId} from '../tool-routing';
import {PremculatorTool, WijculatorTool} from '../zotte-tools';
import {RenculatorTool} from '../tools/Renculator';
import {SERVICE_PAGE, pageCopy, pagePath, type SiteLanguage} from '../seo-data';

export function ToolPage({tool, language}: {tool: ToolId; language: SiteLanguage}) {
  const copy = pageCopy(tool, language), content = TOOLS[tool][language];
  const l = (nl: string, fr: string) => (language === 'nl' ? nl : fr);
  return (
    <Shell id={tool} language={language}>
      <div className="container page-head">
        <Breadcrumbs id={tool} language={language} />
        <h1>{copy.h1}</h1>
        <p className="lead">{content.intro}</p>
      </div>
      <section className="section" aria-label={content.name}>
        <div className="container">
          <nav className="tool-tabs" aria-label={l('Kies een calculator', 'Choisir un calculateur')}>
            {TOOL_IDS.map(id => {
              const Icon = TOOL_ICONS[id];
              return <a key={id} href={pagePath(id, language)} aria-current={id === tool ? 'page' : undefined}><Icon size={18} aria-hidden="true" />{TOOLS[id][language].name}</a>;
            })}
          </nav>
          <div className="tool-panel">
            {tool === 'renculator' && <RenculatorTool language={language} />}
            {tool === 'premculator' && <><div className="zotte-panel-heading"><div><span className="zotte-kicker">{content.kicker}</span><h2>Premculator</h2></div></div><PremculatorTool language={language} /></>}
            {tool === 'wijculator' && <><div className="zotte-panel-heading"><div><span className="zotte-kicker"><Clock3 size={16} aria-hidden="true" />{content.kicker}</span><h2>Wijculator</h2></div></div><WijculatorTool language={language} /></>}
          </div>
          <p className="zotte-privacy">{l('Je berekeningen blijven in je browser. Een link naar deze pagina bevat geen ingevulde gegevens.', 'Vos calculs restent dans votre navigateur. Un lien vers cette page ne contient aucune donnée saisie.')}</p>
        </div>
      </section>
      <section className="section" aria-labelledby="how-title">
        <div className="container split">
          <h2 id="how-title">{content.howTitle}</h2>
          <div className="how-list">
            {content.how.map(paragraph => <p key={paragraph.slice(0, 24)}>{paragraph}</p>)}
            {tool === 'premculator' && <>
              <h3 style={{marginTop: 16}}>{l('Officiële bronnen', 'Sources officielles')}</h3>
              <ul className="source-list" role="list">
                {([['income', l('Voorwaarden en inkomensgrenzen eigenaar-bewoner', 'Conditions et seuils de revenus propriétaire occupant')], ['roof', l('Mijn VerbouwPremie voor het dak', 'Mijn VerbouwPremie pour la toiture')], ['wall', l('Buitenmuur', 'Mur extérieur')], ['floor', l('Vloer', 'Sol')], ['windows', l('Ramen en deuren', 'Fenêtres et portes')], ['simulator', l('Officiële simulator', 'Simulateur officiel')]] as const).map(([key, label]) => (
                  <li key={key}><a className="text-link" href={PREMIUM_SOURCES[key]} target="_blank" rel="noopener">{label}</a> <ExternalLink size={14} aria-hidden="true" style={{display: 'inline', verticalAlign: '-1px'}} /><span className="sr-only">{UI[language].opensNewTab}</span></li>
                ))}
              </ul>
              <p className="zotte-note">{l('Regels gecontroleerd op 15 oktober 2026.', 'Règles vérifiées le 15 octobre 2026.')}</p>
            </>}
          </div>
        </div>
      </section>
      <section className="section" aria-labelledby="more-tools-title">
        <div className="container">
          <div className="section-head"><h2 id="more-tools-title">{l('Andere ZotteTools', 'Autres ZotteTools')}</h2></div>
          <ToolList language={language} tools={TOOL_IDS.filter(id => id !== tool)} />
        </div>
      </section>
      <ContactBand language={language} />
    </Shell>
  );
}

export function GalleryPage({language}: {language: SiteLanguage}) {
  const copy = pageCopy('projects', language);
  const l = (nl: string, fr: string) => (language === 'nl' ? nl : fr);
  return (
    <Shell id="projects" language={language}>
      <div className="container page-head">
        <Breadcrumbs id="projects" language={language} />
        <h1>{copy.h1}</h1>
        <p className="lead">{l('Een selectie uit de INGBELG-galerij: hellende daken, platte daken en details van dichtbij. Klik op een foto om ze groter te bekijken.', 'Une sélection de la galerie INGBELG : toitures inclinées, toitures plates et détails de près. Cliquez sur une photo pour l’agrandir.')}</p>
      </div>
      <section className="section" aria-label={copy.h1}>
        <div className="container"><WorkGrid language={language} variant="all" headingLevel={2} /></div>
      </section>
      <section className="section" aria-labelledby="services-title">
        <div className="container">
          <h2 id="services-title" className="h3" style={{marginBottom: 20}}>{l('Bekijk onze diensten', 'Découvrez nos services')}</h2>
          <ul className="related-links" role="list">
            {SERVICE_IDS.map(id => <li key={id}><a href={pagePath(SERVICE_PAGE[id], language)}>{SERVICES[id].copy[language].name}</a></li>)}
          </ul>
        </div>
      </section>
      <ContactBand language={language} />
    </Shell>
  );
}

export function ContactPage({language}: {language: SiteLanguage}) {
  const ui = UI[language], copy = pageCopy('contact', language);
  const l = (nl: string, fr: string) => (language === 'nl' ? nl : fr);
  return (
    <Shell id="contact" language={language}>
      <div className="container page-head">
        <Breadcrumbs id="contact" language={language} />
        <h1>{copy.h1}</h1>
        <p className="lead">{l('Beschrijf je project en vraag een plaatsbezoek aan. Liever meteen praten? Bel of stuur een WhatsApp-bericht.', 'Décrivez votre projet et demandez une visite. Vous préférez parler directement ? Appelez-nous ou envoyez un message WhatsApp.')}</p>
      </div>
      <section className="section">
        <div className="container contact-page-grid">
          <div>
            <h2 className="h3">{COMPANY.name}</h2>
            <ul className="nap" role="list">
              <li><Phone size={20} aria-hidden="true" /><div><a href={COMPANY.phoneHref}>{COMPANY.phone}</a><span>{ui.callText}</span></div></li>
              <li><MessageCircle size={20} aria-hidden="true" /><div><a href={COMPANY.whatsapp} target="_blank" rel="noopener">WhatsApp<span className="sr-only"> {ui.opensNewTab}</span></a><span>{ui.whatsappText}</span></div></li>
              <li><Mail size={20} aria-hidden="true" /><div><a href={'mailto:' + COMPANY.email}>{COMPANY.email}</a><span>{ui.mailText}</span></div></li>
              <li><MapPin size={20} aria-hidden="true" /><div><span style={{color: 'var(--ink)'}}>{COMPANY.address}</span><a href={COMPANY.maps} target="_blank" rel="noopener" style={{fontWeight: 400}}>{ui.route}<span className="sr-only"> {ui.opensNewTab}</span></a></div></li>
            </ul>
            <div style={{marginTop: 48}}>
              <h2 className="h3" style={{marginBottom: 8}}>{l('Hoe verloopt een aanvraag?', 'Comment se passe une demande ?')}</h2>
              <FaqList items={HOME_FAQ[language].slice(2)} />
            </div>
          </div>
          <ContactForm language={language} headingLevel={2} />
        </div>
      </section>
    </Shell>
  );
}

export function NotFoundPage({language}: {language: SiteLanguage}) {
  const ui = UI[language].notFound;
  return (
    <Shell id={null} language={language}>
      <div className="container not-found">
        <h1 style={{marginBottom: 20}}>{ui.title}</h1>
        <p className="lead">{ui.text}</p>
        <ul className="related-links" role="list" style={{marginTop: 32}}>
          <li><a href={pagePath('home', language)}>{ui.home}</a></li>
          {SERVICE_IDS.map(id => <li key={id}><a href={pagePath(SERVICE_PAGE[id], language)}>{SERVICES[id].copy[language].name}</a></li>)}
          <li><a href={pagePath('contact', language)}>{UI[language].nav.contact}</a></li>
        </ul>
      </div>
    </Shell>
  );
}
