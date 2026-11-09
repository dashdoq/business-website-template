import {ArrowRight, Check, Phone} from 'lucide-react';
import {Breadcrumbs, Shell} from '../layout/Shell';
import {posterFor, POSTER_SIZE} from '../scene/RoofStage';
import type {SceneFocus} from '../scene/roof-scene';
import {ContactBand} from '../sections/ContactForm';
import {FaqList, ToolCards, WorkGrid} from '../sections/Blocks';
import {UI} from '../content/common';
import {COMPANY, PROCESS} from '../content/home';
import {projectById} from '../content/projects';
import {SERVICES} from '../content/services';
import {SERVICE_IDS, type ServiceId} from '../content/service-ids';
import {SERVICE_PAGE, pageCopy, pagePath, type SiteLanguage} from '../seo-data';

const T = {
  nl: {service: 'Dienst', approach: 'Waar we op letten', scope: 'Wat we doen', process: 'Hoe we werken', projects: 'Uit onze realisaties', tools: 'Plan vooraf met ZotteTools', faq: 'Veelgestelde vragen', related: 'Andere diensten', tip: 'Goed om te weten'},
  fr: {service: 'Service', approach: 'Ce à quoi nous veillons', scope: 'Ce que nous faisons', process: 'Notre méthode', projects: 'Quelques réalisations', tools: 'Préparez avec ZotteTools', faq: 'Questions fréquentes', related: 'Autres services', tip: 'Bon à savoir'},
};

export function ServicePage({id, language}: {id: ServiceId; language: SiteLanguage}) {
  const ui = UI[language], t = T[language];
  const page = SERVICE_PAGE[id], copy = pageCopy(page, language), service = SERVICES[id], content = service.copy[language];
  const index = SERVICE_IDS.indexOf(id);
  return (
    <Shell id={page} language={language}>
      <div className="container page-head page-head--split">
        <div>
          <Breadcrumbs id={page} language={language} />
          <p className="eyebrow">0{index + 1} — {t.service}</p>
          <h1>{copy.h1}</h1>
          <p className="lead">{content.lead}</p>
          <div className="btn-row">
            <a className="btn btn-primary" href={pagePath('contact', language) + '#aanvraag'}>{ui.cta}<ArrowRight size={18} aria-hidden="true" /></a>
            <a className="btn btn-secondary" href={COMPANY.phoneHref}><Phone size={18} aria-hidden="true" />{COMPANY.phone}</a>
          </div>
        </div>
        <figure className="page-head__visual">
          <img src={posterFor(index as SceneFocus, language)} width={POSTER_SIZE.width} height={POSTER_SIZE.height} fetchPriority="high" decoding="async"
            alt={`${content.layersTitle}: ${content.layers.map(layer => layer.name.toLowerCase()).join(', ')}.`} />
        </figure>
      </div>

      <section className="section" aria-labelledby="approach-title">
        <div className="container split">
          <div><p className="eyebrow">{content.short}</p><h2 id="approach-title">{t.approach}</h2></div>
          <div className="prose">{content.intro.map(paragraph => <p key={paragraph.slice(0, 24)} className="lead">{paragraph}</p>)}</div>
        </div>
      </section>

      <section className="section" aria-labelledby="scope-title">
        <div className="container">
          <div className="section-head"><h2 id="scope-title">{t.scope}</h2></div>
          <ul className="scope-list" role="list">
            {content.scope.map((item, i) => <li key={item.title}><span className="label">0{i + 1}</span><h3>{item.title}</h3><p>{item.text}</p></li>)}
          </ul>
        </div>
      </section>

      <section className="section" aria-labelledby="layers-title">
        <div className="container split">
          <div>
            <h2 id="layers-title">{content.layersTitle}</h2>
            <aside className="tip" style={{marginTop: 32}} aria-label={t.tip}>
              <span className="label">{content.tip.category}</span>
              <h3>{content.tip.title}</h3>
              <p>{content.tip.text}</p>
            </aside>
          </div>
          <div>
            <ol className="layer-list" role="list">
              {content.layers.map(layer => <li key={layer.name}><strong>{layer.name}</strong><span>{layer.text}</span></li>)}
            </ol>
            <h3 style={{margin: '48px 0 16px'}}>{content.signsTitle}</h3>
            <ul className="check-list" role="list">
              {content.signs.map(sign => <li key={sign}><Check size={18} aria-hidden="true" /><span>{sign}</span></li>)}
            </ul>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="process-title">
        <div className="container">
          <div className="section-head"><h2 id="process-title">{t.process}</h2></div>
          <ol className="process-steps" role="list">
            {PROCESS[language].map((step, i) => <li key={step.title}><span className="label">0{i + 1}</span><h3>{step.title}</h3><p>{step.text}</p></li>)}
          </ol>
        </div>
      </section>

      <section className="section" aria-labelledby="projects-title">
        <div className="container">
          <div className="section-head">
            <h2 id="projects-title">{t.projects}</h2>
            <a className="link-arrow" href={pagePath('projects', language)}>{ui.nav.projects}<ArrowRight size={16} aria-hidden="true" /></a>
          </div>
          <WorkGrid language={language} projects={service.projects.map(projectById)} variant="related" />
        </div>
      </section>

      <section className="section" aria-labelledby="tools-title">
        <div className="container">
          <div className="section-head"><h2 id="tools-title">{t.tools}</h2></div>
          <ToolCards language={language} tools={service.tools} />
        </div>
      </section>

      <section className="section" aria-labelledby="faq-title">
        <div className="container split">
          <h2 id="faq-title">{t.faq}</h2>
          <FaqList items={content.faq} />
        </div>
      </section>

      <section className="section" aria-labelledby="related-title">
        <div className="container">
          <h2 id="related-title" className="h3" style={{marginBottom: 20}}>{t.related}</h2>
          <ul className="related-links" role="list">
            {SERVICE_IDS.filter(other => other !== id).map(other => (
              <li key={other}><a href={pagePath(SERVICE_PAGE[other], language)}>{SERVICES[other].copy[language].name}</a></li>
            ))}
          </ul>
        </div>
      </section>

      <ContactBand language={language} service={id} />
    </Shell>
  );
}
