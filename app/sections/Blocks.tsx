'use client';
import {useState} from 'react';
import {ArrowRight, BadgeEuro, ChevronLeft, ChevronRight, Ruler, Users} from 'lucide-react';
import {Dialog, DialogContent, DialogTitle, DialogDescription} from '@/components/ui/dialog';
import {UI} from '../content/common';
import {COMPANY, REVIEW} from '../content/home';
import {PROJECTS, srcSet, type Project} from '../content/projects';
import {TOOLS} from '../content/tools';
import type {Faq} from '../content/services';
import {TOOL_IDS, type ToolId} from '../tool-routing';
import {pagePath, type SiteLanguage} from '../seo-data';

export const TOOL_ICONS = {renculator: Ruler, premculator: BadgeEuro, wijculator: Users};

export function FaqList({items}: {items: Faq[]}) {
  return (
    <div className="faq">
      {items.map(item => (
        <details key={item.q}>
          <summary>{item.q}</summary>
          <p>{item.a}</p>
        </details>
      ))}
    </div>
  );
}

export function ToolCards({language, tools = [...TOOL_IDS], headingLevel = 3}: {language: SiteLanguage; tools?: ToolId[]; headingLevel?: 2 | 3}) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  return (
    <div className={`card-grid ${tools.length > 2 ? 'card-grid--3' : ''}`}>
      {tools.map(tool => {
        const copy = TOOLS[tool][language], Icon = TOOL_ICONS[tool];
        return (
          <a key={tool} className="card tool-card" href={pagePath(tool, language)}>
            <span className="label"><Icon size={16} aria-hidden="true" />{copy.kicker}</span>
            <Heading>{copy.name}</Heading>
            <p>{copy.card}</p>
            <span className="link-arrow">{language === 'nl' ? 'Open calculator' : 'Ouvrir le calculateur'}<ArrowRight size={16} aria-hidden="true" /></span>
          </a>
        );
      })}
    </div>
  );
}

export function Rating({language}: {language: SiteLanguage}) {
  const ui = UI[language];
  return (
    <a className="rating" href={COMPANY.maps} target="_blank" rel="noopener">
      <span className="rating-mark" aria-hidden="true">G</span>
      <span>
        <span className="rating-stars" role="img" aria-label={ui.ratingStars}>★★★★★</span>
        <small>{ui.rating} · {ui.reviews} <span className="sr-only">{ui.opensNewTab}</span></small>
      </span>
    </a>
  );
}

export function ReviewQuote({language}: {language: SiteLanguage}) {
  return (
    <figure className="review">
      <p className="eyebrow">{language === 'nl' ? 'Wat klanten zeggen' : 'Ce que disent nos clients'}</p>
      <div>
        <blockquote lang={REVIEW.quoteLang}><p>{REVIEW.quote}</p></blockquote>
        {language === 'fr' && <p className="translation">{REVIEW.translation.fr}</p>}
        <footer style={{marginTop: 24}}>
          <figcaption className="label"><b style={{color: 'var(--ink)', fontWeight: 500}}>{REVIEW.author}</b> · {REVIEW.source[language]}</figcaption>
          <Rating language={language} />
        </footer>
      </div>
    </figure>
  );
}

function ProjectImage({project, language, sizes, eager = false}: {project: Project; language: SiteLanguage; sizes: string; eager?: boolean}) {
  return <img src={project.image} srcSet={srcSet(project.image)} sizes={sizes} width={project.width} height={project.height}
    alt={project.copy[language].alt} loading={eager ? 'eager' : 'lazy'} decoding="async" />;
}

/** Project photos with a keyboard-accessible lightbox. */
export function WorkGrid({language, projects = PROJECTS, variant = 'all', headingLevel = 3}: {language: SiteLanguage; projects?: Project[]; variant?: 'home' | 'all' | 'related'; headingLevel?: 2 | 3}) {
  const [index, setIndex] = useState<number | null>(null);
  const step = (delta: number) => setIndex(current => current === null ? null : (current + delta + projects.length) % projects.length);
  const open = index === null ? null : projects[index];
  const Caption = headingLevel === 2 ? 'h2' : 'h3';
  const sizes = variant === 'related' ? '(min-width: 760px) 33vw, 100vw' : '(min-width: 1100px) 50vw, (min-width: 760px) 50vw, 100vw';
  return (
    <>
      <ul className={variant === 'related' ? 'related-photos' : `work-grid work-grid--${variant}`} role="list">
        {projects.map((project, i) => (
          <li key={project.id} className="work-item">
            <figure>
              <button type="button" onClick={() => setIndex(i)} aria-label={(language === 'nl' ? 'Vergroot foto: ' : 'Agrandir la photo : ') + project.copy[language].title}>
                <div className="frame"><ProjectImage project={project} language={language} sizes={sizes} /></div>
              </button>
              <figcaption><Caption className="h3" style={{fontSize: '1.125rem'}}>{project.copy[language].title}</Caption><span className="label">{project.copy[language].tag}</span></figcaption>
            </figure>
          </li>
        ))}
      </ul>
      <Dialog open={open !== null} onOpenChange={next => {if (!next) setIndex(null)}}>
        {open && <DialogContent variant="media" className="lightbox">
          <figure>
            <ProjectImage project={open} language={language} sizes="(min-width: 1200px) 1200px, 100vw" eager />
            <figcaption>
              <span><DialogTitle className="h3" style={{fontSize: '1.375rem', margin: 0, padding: 0}}>{open.copy[language].title}</DialogTitle><DialogDescription className="muted">{open.copy[language].alt}</DialogDescription></span>
              <span className="lightbox-nav">
                <button type="button" className="icon-button" onClick={() => step(-1)} aria-label={language === 'nl' ? 'Vorige foto' : 'Photo précédente'}><ChevronLeft size={20} aria-hidden="true" /></button>
                <span aria-live="polite">{(index ?? 0) + 1} / {projects.length}</span>
                <button type="button" className="icon-button" onClick={() => step(1)} aria-label={language === 'nl' ? 'Volgende foto' : 'Photo suivante'}><ChevronRight size={20} aria-hidden="true" /></button>
              </span>
            </figcaption>
          </figure>
        </DialogContent>}
      </Dialog>
    </>
  );
}
