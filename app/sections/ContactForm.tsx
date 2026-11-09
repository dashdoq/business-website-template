'use client';
import {useEffect, useId, useState, type FormEvent} from 'react';
import {Layers3, Mail, X} from 'lucide-react';
import {UI} from '../content/common';
import {COMPANY} from '../content/home';
import {SERVICES} from '../content/services';
import {SERVICE_IDS, type ServiceId} from '../content/service-ids';
import {pagePath, type SiteLanguage} from '../seo-data';

/** Session-only hand-off from a calculator to the contact form. Cleared when removed or when the tab closes. */
export const SUMMARY_KEY = 'ingbelg-project-summary';
export function handOffSummary(summary: string, language: SiteLanguage) {
  try {sessionStorage.setItem(SUMMARY_KEY, summary)} catch {/* storage blocked: the visitor can still describe the project */}
  location.href = pagePath('contact', language) + '#aanvraag';
}

export function ContactForm({language, service, headingLevel = 3}: {language: SiteLanguage; service?: ServiceId; headingLevel?: 2 | 3}) {
  const ui = UI[language], f = ui.form;
  const formId = useId();
  const [contact, setContact] = useState({name: '', email: '', phone: '', town: '', service: service ?? '', message: ''});
  const [summary, setSummary] = useState('');
  const [prepared, setPrepared] = useState(false), [copied, setCopied] = useState(false);
  useEffect(() => {try {setSummary(sessionStorage.getItem(SUMMARY_KEY) ?? '')} catch {/* ignore */}}, []);
  const update = (key: keyof typeof contact) => (event: {target: {value: string}}) => setContact(current => ({...current, [key]: event.target.value}));
  const serviceName = contact.service ? SERVICES[contact.service as ServiceId].copy[language].name : f.serviceAny;
  const body = () => `${f.greeting}\n\n${f.intro}\n\n${f.labels.name}: ${contact.name}\n${f.labels.email}: ${contact.email}\n${f.labels.phone}: ${contact.phone}\n${f.labels.town}: ${contact.town}\n${f.labels.service}: ${serviceName}\n\n${contact.message}${summary ? '\n\n' + summary : ''}`;
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPrepared(true);
    window.location.href = `mailto:${COMPANY.email}?subject=${encodeURIComponent(f.subject + contact.town)}&body=${encodeURIComponent(body())}`;
  };
  const copy = async () => {try {await navigator.clipboard.writeText(body()); setCopied(true)} catch {setCopied(false)}};
  const removeSummary = () => {setSummary(''); try {sessionStorage.removeItem(SUMMARY_KEY)} catch {/* ignore */}};
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  const id = (name: string) => formId + name;
  return (
    <div className="form-card" id="aanvraag">
      <Heading>{f.title}</Heading>
      <p className="form-note">{f.required}</p>
      <form onSubmit={submit} noValidate={false}>
        <div className="field-grid">
          <label className="field" htmlFor={id('name')}><span>{f.name} *</span><input id={id('name')} name="name" autoComplete="name" required maxLength={100} placeholder={f.namePlaceholder} value={contact.name} onChange={update('name')} /></label>
          <label className="field" htmlFor={id('email')}><span>{f.email} *</span><input id={id('email')} type="email" name="email" autoComplete="email" required maxLength={150} placeholder={language === 'nl' ? 'naam@voorbeeld.be' : 'nom@exemple.be'} value={contact.email} onChange={update('email')} /></label>
          <label className="field" htmlFor={id('phone')}><span>{f.phone}</span><input id={id('phone')} type="tel" name="phone" autoComplete="tel" maxLength={30} placeholder="+32 …" value={contact.phone} onChange={update('phone')} /></label>
          <label className="field" htmlFor={id('town')}><span>{f.town} *</span><input id={id('town')} name="town" autoComplete="address-level2" required maxLength={100} placeholder={f.townPlaceholder} value={contact.town} onChange={update('town')} /></label>
        </div>
        <label className="field" htmlFor={id('service')}><span>{f.service}</span>
          <select id={id('service')} name="service" value={contact.service} onChange={update('service')}>
            <option value="">{f.serviceAny}</option>
            {SERVICE_IDS.map(item => <option key={item} value={item}>{SERVICES[item].copy[language].name}</option>)}
          </select>
        </label>
        <label className="field" htmlFor={id('message')}><span>{f.message} *</span><textarea id={id('message')} name="message" rows={4} required maxLength={3000} placeholder={f.messagePlaceholder} value={contact.message} onChange={update('message')} /></label>
        {summary && <div className="estimate-summary">
          <header><strong><Layers3 size={16} aria-hidden="true" style={{display: 'inline', marginRight: 8, verticalAlign: '-2px'}} />{f.summary}</strong><button type="button" className="icon-button" aria-label={f.removeSummary} onClick={removeSummary}><X size={16} aria-hidden="true" /></button></header>
          <p>{summary}</p>
        </div>}
        <button className="btn btn-primary btn-block" type="submit">{f.submit}<Mail size={18} aria-hidden="true" /></button>
        <p className="form-note">{f.note}</p>
        {prepared && <div className="email-status" role="status">
          <span>{f.prepared} <a href={'mailto:' + COMPANY.email}>{COMPANY.email}</a>.</span>
          <button type="button" className="text-button" onClick={copy}>{copied ? f.copied : f.copy}</button>
        </div>}
        <a className="form-note" href={pagePath('privacy', language)}>{f.privacy}</a>
      </form>
    </div>
  );
}

/** Phone first, in large type: most people with a leaking roof would rather call. */
export function DirectContact({language}: {language: SiteLanguage}) {
  const ui = UI[language];
  return (
    <>
      <a className="phone-big" href={COMPANY.phoneHref}>{COMPANY.phone}</a>
      <ul className="contact-links" role="list">
        <li><a href={COMPANY.whatsapp} target="_blank" rel="noopener">{ui.whatsappText} via WhatsApp<span className="sr-only"> {ui.opensNewTab}</span></a></li>
        <li><a href={'mailto:' + COMPANY.email}>{COMPANY.email}</a></li>
      </ul>
      <address className="contact-address">{COMPANY.address}. <a href={COMPANY.maps} target="_blank" rel="noopener">{ui.route}<span className="sr-only"> {ui.opensNewTab}</span></a></address>
    </>
  );
}

/** Dark closing band with direct contact options and the request form. */
export function ContactBand({language, service}: {language: SiteLanguage; service?: ServiceId}) {
  const ui = UI[language];
  return (
    <section className="contact-band on-dark" aria-labelledby="contact-band-title">
      <div className="container contact-band__grid">
        <div>
          <h2 id="contact-band-title">{ui.band.title}</h2>
          <p className="lead">{ui.band.text}</p>
          <DirectContact language={language} />
        </div>
        <ContactForm language={language} service={service} />
      </div>
    </section>
  );
}
