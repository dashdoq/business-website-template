'use client';
import {useEffect, useId, useState} from 'react';
import {Plus, RotateCcw, Ruler} from 'lucide-react';
import {calculateEstimate, defaultEstimate, euros, extraOptions, projectTypes, type EstimateConfig} from '../project-data';
import {translate, type Language} from '../i18n';
import {handOffSummary} from '../sections/ContactForm';

function Choice({label, value, options, onChange, language}: {label: string; value: string; options: readonly string[]; onChange: (value: string) => void; language: Language}) {
  const id = useId();
  return (
    <label className="zotte-field" htmlFor={id}>
      <span>{label}</span>
      <select id={id} value={value} onChange={event => onChange(event.target.value)}>
        {options.map(option => <option key={option} value={option}>{translate(option, language)}</option>)}
      </select>
    </label>
  );
}

/** Illustrative construction budget. Calculation lives in project-data.ts and is unchanged. */
export function RenculatorTool({language}: {language: Language}) {
  const l = (nl: string, fr: string) => (language === 'nl' ? nl : fr);
  const t = (text: string) => translate(text, language);
  const [config, setConfig] = useState<EstimateConfig>(defaultEstimate);
  const range = calculateEstimate(config);
  const areaId = useId();

  // Optional WebMCP hook for browsers/agents that expose document.modelContext.
  useEffect(() => {
    const context = (document as Document & {modelContext?: {registerTool?: (tool: unknown, options: unknown) => unknown}}).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    try {
      Promise.resolve(context.registerTool({
        name: 'configure_project_estimate', title: 'Configure project estimate',
        description: 'Apply a project type and surface to the Renculator estimate on this page. This does not request a quote or send personal information.',
        inputSchema: {type: 'object', properties: {type: {type: 'string', enum: [...projectTypes]}, area: {type: 'number', minimum: 5, maximum: 1000}}, required: ['type', 'area'], additionalProperties: false},
        annotations: {readOnlyHint: false, untrustedContentHint: false},
        execute(input: unknown) {
          const a = input as {type?: unknown; area?: unknown};
          if (!a || !projectTypes.includes(a.type as never) || typeof a.area !== 'number' || !Number.isFinite(a.area) || a.area < 5 || a.area > 1000) throw new Error('Choose a listed project type and an area from 5 to 1000 m².');
          const next = {...defaultEstimate, type: a.type as string, area: a.area};
          setConfig(next);
          return {status: 'configured', estimate: calculateEstimate(next), currency: 'EUR', basis: 'Illustrative planning allowance, excluding VAT'};
        },
      }, {signal: lifecycle.signal})).catch(() => {});
    } catch {/* unsupported */}
    return () => lifecycle.abort();
  }, []);

  const summary = () => `Renculator · ${t(config.type)} · ${config.area} m² · ${t(config.condition)} · ${t(config.finish)}\n${l('Opties', 'Options')}: ${config.extras.map(t).join(', ') || t('None')}\n${range ? `${l('Indicatieve budgetvork', 'Fourchette indicative')}: ${euros(range.low)}–${euros(range.high)}. ${l('Exclusief btw, geen offerte.', 'Hors TVA, pas un devis.')}` : l('Graag dit project beoordelen tijdens een plaatsbezoek.', 'Merci d’évaluer ce projet lors d’une visite.')}`;

  return (
    <>
      <div className="zotte-panel-heading">
        <div><span className="zotte-kicker"><Ruler size={16} aria-hidden="true" />{l('Bouwcalculator', 'Calculateur de travaux')}</span><h2>Renculator</h2></div>
      </div>
      <div className="zotte-two-columns">
        <div className="zotte-form-column">
          <Choice label={l('Type project', 'Type de projet')} value={config.type} options={projectTypes} language={language} onChange={type => setConfig({...config, type})} />
          <div className="zotte-area">
            <label className="zotte-field" htmlFor={areaId}><span>{l('Oppervlakte', 'Surface')}</span></label>
            <div>
              <input type="range" min={5} max={1000} step={5} value={config.area} aria-label={l('Oppervlakte in m² (schuifregelaar)', 'Surface en m² (curseur)')} onChange={event => setConfig({...config, area: Number(event.target.value)})} />
              <span className="unit"><input id={areaId} type="number" inputMode="numeric" min={5} max={1000} value={config.area} onChange={event => setConfig({...config, area: Math.max(5, Math.min(1000, Number(event.target.value) || 5))})} /><span>m²</span></span>
            </div>
          </div>
          <div className="zotte-field-grid">
            <Choice label={l('Huidige staat', 'État actuel')} value={config.condition} options={['Good', 'Moderate', 'Major renovation']} language={language} onChange={condition => setConfig({...config, condition})} />
            <Choice label={l('Afwerkingsniveau', 'Niveau de finition')} value={config.finish} options={['Essential', 'Standard', 'Premium']} language={language} onChange={finish => setConfig({...config, finish})} />
          </div>
          <fieldset className="zotte-extras">
            <legend>{l('Opnemen in je plan', 'Inclure dans votre projet')}</legend>
            {extraOptions.map(option => (
              <label key={option} className="zotte-check">
                <input type="checkbox" checked={config.extras.includes(option)} onChange={event => setConfig({...config, extras: event.target.checked ? [...config.extras, option] : config.extras.filter(item => item !== option)})} />
                <span>{t(option)}</span>
              </label>
            ))}
          </fieldset>
          <button type="button" className="reset-estimate" onClick={() => setConfig(defaultEstimate)}><RotateCcw size={14} aria-hidden="true" />{l('Keuzes herstellen', 'Réinitialiser les choix')}</button>
        </div>
        <div className="zotte-results-column">
          <div className="zotte-result" aria-live="polite">
            <span className="zotte-kicker">{l('Indicatieve budgetvork', 'Fourchette budgétaire indicative')}</span>
            <strong>{range ? `${euros(range.low)} – ${euros(range.high)}` : l('Te beoordelen ter plaatse', 'À évaluer sur place')}</strong>
            <small>{l('Exclusief btw · geen offerte', 'Hors TVA · pas un devis')}</small>
          </div>
          <p className="zotte-note">{l('Gebruikt illustratieve bedragen, niet de prijslijst van INGBELG. De uiteindelijke prijs hangt af van inspectie, materialen, bereikbaarheid en technische omstandigheden. Dakramen en schoorsteenwerken rekenen met één stuk. Premies en btw worden niet berekend.', 'Utilise des montants illustratifs, pas la liste de prix d’INGBELG. Le prix final dépend de l’inspection, des matériaux, de l’accès et des conditions techniques. Les fenêtres de toit et la cheminée comptent une pièce. Les primes et la TVA ne sont pas calculées.')}</p>
          <button type="button" className="btn btn-primary" onClick={() => handOffSummary(summary(), language)}>{l('Vraag een precieze offerte', 'Demander un devis précis')}<Plus size={18} aria-hidden="true" /></button>
        </div>
      </div>
    </>
  );
}
