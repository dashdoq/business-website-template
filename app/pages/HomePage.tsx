'use client';
import {useEffect, useRef, useState} from 'react';
import {ArrowRight, Phone} from 'lucide-react';
import {Shell} from '../layout/Shell';
import {RoofStage, posterFor, posterSrcSet} from '../scene/RoofStage';
import type {SceneFocus} from '../scene/roof-scene';
import {ContactBand} from '../sections/ContactForm';
import {FaqList, Rating, ReviewQuote, ToolCards, WorkGrid} from '../sections/Blocks';
import {UI} from '../content/common';
import {COMPANY, HOME, HOME_FAQ, PROCESS} from '../content/home';
import {PROJECTS} from '../content/projects';
import {SERVICES} from '../content/services';
import {SERVICE_IDS} from '../content/service-ids';
import {SERVICE_PAGE, pageCopy, pagePath, type SiteLanguage} from '../seo-data';

/**
 * Picks the service step crossing the middle of the viewport; the hero maps to the overview (-1).
 * Only on wide screens, where the roof stage is sticky beside the steps.
 */
function useScrollFocus(container: React.RefObject<HTMLElement | null>) {
  const [focus, setFocus] = useState<SceneFocus>(-1);
  useEffect(() => {
    const root = container.current;
    if (!root || !matchMedia('(min-width: 1100px)').matches) return;
    const targets = Array.from(root.querySelectorAll<HTMLElement>('[data-focus]'));
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) setFocus(Number((entry.target as HTMLElement).dataset.focus) as SceneFocus);
    }, {rootMargin: '-48% 0px -48% 0px'});
    targets.forEach(target => observer.observe(target));
    return () => observer.disconnect();
  }, [container]);
  return focus;
}

export function HomePage({language}: {language: SiteLanguage}) {
  const ui = UI[language], home = HOME[language], copy = pageCopy('home', language);
  const stage = useRef<HTMLDivElement>(null);
  const focus = useScrollFocus(stage);
  const caption = focus === -1 ? ui.scene.caption : SERVICES[SERVICE_IDS[focus]].copy[language].short;
  return (
    <Shell id="home" language={language}>
      <div className="container home-stage" ref={stage}>
        <section className="hero" aria-labelledby="hero-title" data-focus="-1">
          <p className="eyebrow">{home.eyebrow}</p>
          <h1 id="hero-title">{copy.h1}. <span className="hero-tagline">{home.tagline}</span></h1>
          <p className="lead">{home.lead}</p>
          <div className="btn-row">
            <a className="btn btn-primary" href={pagePath('contact', language) + '#aanvraag'}>{ui.cta}<ArrowRight size={18} aria-hidden="true" /></a>
            <a className="btn btn-secondary" href={COMPANY.phoneHref}><Phone size={18} aria-hidden="true" />{COMPANY.phone}</a>
          </div>
          <div className="trust-row">
            <Rating language={language} />
            <span className="label">{COMPANY.street}, {COMPANY.town}</span>
          </div>
        </section>
        <div className="home-visual">
          <RoofStage language={language} focus={focus} caption={caption} eager
            alt={language === 'nl' ? 'Doorsnede van een dak met kepers, isolatie, onderdak, panlatten en dakpannen, naast een aanbouw met plat dak.' : 'Coupe d’une toiture avec chevrons, isolation, sous-toiture, liteaux et tuiles, à côté d’une extension à toit plat.'} />
        </div>
        <div className="services-intro" id="diensten" data-focus="-1">
          <p className="eyebrow">{home.servicesEyebrow}</p>
          <h2>{home.servicesTitle}</h2>
          <p>{home.servicesText}</p>
        </div>
        <ol className="service-steps" role="list">
          {SERVICE_IDS.map((id, index) => {
            const service = SERVICES[id].copy[language];
            return (
              <li key={id} className={`service-step${focus === index ? ' is-active' : ''}`} data-focus={index}>
                <p className="label"><span className="step-marker" aria-hidden="true" /><b>0{index + 1}</b>{service.short}</p>
                <img className="service-step__poster" src={posterFor(index as SceneFocus, language)} srcSet={posterSrcSet(posterFor(index as SceneFocus, language))} sizes="(min-width: 560px) 520px, calc(100vw - 32px)" width={1380} height={1200} alt="" loading="lazy" decoding="async" />
                <h3>{service.name}</h3>
                <p>{service.summary}</p>
                <ul className="service-tags" role="list">{service.scope.map(item => <li key={item.title}>{item.title}</li>)}</ul>
                <a className="link-arrow" href={pagePath(SERVICE_PAGE[id], language)}>{ui.readMore} {service.name.toLowerCase()}<ArrowRight size={16} aria-hidden="true" /></a>
              </li>
            );
          })}
        </ol>
      </div>

      <section className="section" aria-labelledby="process-title">
        <div className="container">
          <div className="section-head">
            <div><p className="eyebrow">{home.processEyebrow}</p><h2 id="process-title">{home.processTitle}</h2></div>
            <p className="lead">{home.processText}</p>
          </div>
          <ol className="process-steps" role="list">
            {PROCESS[language].map((step, index) => (
              <li key={step.title}><span className="label">0{index + 1}</span><h3>{step.title}</h3><p>{step.text}</p></li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section" aria-labelledby="work-title">
        <div className="container">
          <div className="section-head">
            <div><p className="eyebrow">{home.workEyebrow}</p><h2 id="work-title">{home.workTitle}</h2></div>
            <a className="link-arrow" href={pagePath('projects', language)}>{home.workLink}<ArrowRight size={16} aria-hidden="true" /></a>
          </div>
          <WorkGrid language={language} projects={PROJECTS.slice(0, 3)} variant="home" />
        </div>
      </section>

      <section className="section" aria-label={home.reviewEyebrow}>
        <div className="container"><ReviewQuote language={language} /></div>
      </section>

      <section className="section" aria-labelledby="tools-title">
        <div className="container">
          <div className="section-head">
            <div><p className="eyebrow">{home.toolsEyebrow}</p><h2 id="tools-title">{home.toolsTitle}</h2></div>
            <p className="lead">{home.toolsText}</p>
          </div>
          <ToolCards language={language} />
        </div>
      </section>

      <section className="section" aria-labelledby="faq-title">
        <div className="container split">
          <div><p className="eyebrow">{home.faqEyebrow}</p><h2 id="faq-title">{home.faqTitle}</h2></div>
          <FaqList items={HOME_FAQ[language]} />
        </div>
      </section>

      <ContactBand language={language} />
    </Shell>
  );
}
