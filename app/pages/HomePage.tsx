'use client';
import {useEffect, useRef, useState} from 'react';
import {Phone} from 'lucide-react';
import {Shell} from '../layout/Shell';
import {RoofStage, posterFor, posterSrcSet} from '../scene/RoofStage';
import type {SceneFocus} from '../scene/roof-scene';
import {ContactBand} from '../sections/ContactForm';
import {FaqList, Rating, ReviewQuote, ToolList, WorkGrid} from '../sections/Blocks';
import {UI} from '../content/common';
import {COMPANY, HOME, HOME_FAQ, PROCESS} from '../content/home';
import {projectById} from '../content/projects';
import {SERVICES} from '../content/services';
import {SERVICE_IDS} from '../content/service-ids';
import {SERVICE_PAGE, pageCopy, pagePath, type SiteLanguage} from '../seo-data';

/**
 * Picks the service crossing the middle of the viewport; the section heading maps to the overview (-1).
 * Only on wide screens, where the roof stage is sticky beside the list.
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
  const services = useRef<HTMLElement>(null);
  const focus = useScrollFocus(services);
  const heroPhoto = projectById('work-02');
  return (
    <Shell id="home" language={language}>
      <section className="container hero" aria-labelledby="hero-title">
        <div>
          <h1 id="hero-title">{copy.h1}</h1>
          <p className="lead">{home.lead}</p>
          <div className="btn-row">
            <a className="btn btn-primary" href={pagePath('contact', language) + '#aanvraag'}>{ui.cta}</a>
            <a className="btn btn-secondary" href={COMPANY.phoneHref}><Phone size={18} aria-hidden="true" />{COMPANY.phone}</a>
          </div>
          <Rating language={language} />
        </div>
        <figure className="hero-photo">
          <img src="/images/hero-1200.webp" srcSet="/images/hero-800.webp 800w, /images/hero-1200.webp 1200w" sizes="(min-width: 900px) 50vw, 100vw" width={1200} height={990}
            alt={heroPhoto.copy[language].alt} fetchPriority="high" decoding="async" />
          <figcaption>{home.heroCaption}</figcaption>
        </figure>
      </section>

      <section className="container section services" id="diensten" ref={services} aria-labelledby="services-title">
        <div className="services-head" data-focus="-1">
          <h2 id="services-title">{home.servicesTitle}</h2>
          <p className="lead" style={{marginTop: 12}}>{home.servicesText}</p>
        </div>
        <div className="services-visual">
          <RoofStage language={language} focus={focus}
            alt={language === 'nl' ? 'Doorsnede van een dak met kepers, isolatie, onderdak, panlatten en dakpannen, naast een aanbouw met plat dak.' : 'Coupe d’une toiture avec chevrons, isolation, sous-toiture, liteaux et tuiles, à côté d’une extension à toit plat.'} />
        </div>
        <ul className="service-list" role="list">
          {SERVICE_IDS.map((id, index) => {
            const service = SERVICES[id].copy[language];
            return (
              <li key={id} className={`service-item${focus === index ? ' is-active' : ''}`} data-focus={index}>
                <img className="service-item__poster" src={posterFor(index as SceneFocus, language)} srcSet={posterSrcSet(posterFor(index as SceneFocus, language))}
                  sizes="(min-width: 560px) 520px, calc(100vw - 40px)" width={1380} height={1200} alt="" loading="lazy" decoding="async" />
                <h3>{service.name}</h3>
                <p>{service.summary}</p>
                <a className="text-link" href={pagePath(SERVICE_PAGE[id], language)}>{ui.readMore} {service.name.toLowerCase()}</a>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="section band" aria-labelledby="process-title">
        <div className="container">
          <div className="section-head"><h2 id="process-title">{home.processTitle}</h2><p>{home.processText}</p></div>
          <ol className="process-steps" role="list">
            {PROCESS[language].map(step => <li key={step.title}><h3>{step.title}</h3><p>{step.text}</p></li>)}
          </ol>
        </div>
      </section>

      <section className="section" aria-labelledby="work-title">
        <div className="container">
          <div className="head-row">
            <h2 id="work-title">{home.workTitle}</h2>
            <a className="text-link" href={pagePath('projects', language)}>{home.workLink}</a>
          </div>
          <WorkGrid language={language} projects={['work-06', 'work-01', 'work-13'].map(projectById)} variant="home" />
        </div>
      </section>

      <section className="section band" aria-labelledby="review-title">
        <div className="container">
          <h2 id="review-title" className="sr-only">{home.reviewTitle}</h2>
          <ReviewQuote language={language} />
        </div>
      </section>

      <section className="section" aria-labelledby="tools-title">
        <div className="container">
          <div className="section-head"><h2 id="tools-title">{home.toolsTitle}</h2><p>{home.toolsText}</p></div>
          <ToolList language={language} />
        </div>
      </section>

      <section className="section band" aria-labelledby="faq-title">
        <div className="container split">
          <h2 id="faq-title">{home.faqTitle}</h2>
          <FaqList items={HOME_FAQ[language]} />
        </div>
      </section>

      <ContactBand language={language} />
    </Shell>
  );
}
