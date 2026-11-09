'use client';
import {createContext, useContext} from 'react';
export type Language = 'nl' | 'fr';
export const LanguageContext = createContext<Language>('nl');

/** Option labels shared by the calculators. Keys are the stable English ids stored in calculation state. */
const messages: Record<string, Record<Language, string>> = {
  'Close': {nl: 'Sluiten', fr: 'Fermer'},
  'Roof renovation': {nl: 'Dakrenovatie', fr: 'Rénovation de toiture'},
  'Complete roof replacement': {nl: 'Volledige dakvervanging', fr: 'Remplacement complet de toiture'},
  'Flat roof': {nl: 'Plat dak', fr: 'Toiture plate'},
  'Pitched roof': {nl: 'Hellend dak', fr: 'Toiture inclinée'},
  'Interior renovation': {nl: 'Binnenrenovatie', fr: 'Rénovation intérieure'},
  'Exterior renovation': {nl: 'Buitenrenovatie', fr: 'Rénovation extérieure'},
  'Complete renovation': {nl: 'Totaalrenovatie', fr: 'Rénovation complète'},
  'Insulation': {nl: 'Isolatie', fr: 'Isolation'},
  'Bathroom': {nl: 'Badkamer', fr: 'Salle de bains'},
  'Kitchen': {nl: 'Keuken', fr: 'Cuisine'},
  'Other': {nl: 'Andere', fr: 'Autre'},
  'Good': {nl: 'Goed', fr: 'Bon'},
  'Moderate': {nl: 'Gemiddeld', fr: 'Moyen'},
  'Major renovation': {nl: 'Grondige renovatie', fr: 'Rénovation importante'},
  'Essential': {nl: 'Basis', fr: 'Essentiel'},
  'Standard': {nl: 'Standaard', fr: 'Standard'},
  'Premium': {nl: 'Premium', fr: 'Premium'},
  'Roof insulation': {nl: 'Dakisolatie', fr: 'Isolation de toiture'},
  'Scaffolding': {nl: 'Stelling', fr: 'Échafaudage'},
  'Demolition': {nl: 'Afbraak', fr: 'Démolition'},
  'Waste removal': {nl: 'Afvalafvoer', fr: 'Évacuation des déchets'},
  'Solar preparation': {nl: 'Voorbereiding zonnepanelen', fr: 'Préparation solaire'},
  'Roof windows': {nl: 'Dakramen', fr: 'Fenêtres de toit'},
  'Chimney work': {nl: 'Schoorsteenwerken', fr: 'Travaux de cheminée'},
  'None': {nl: 'Geen', fr: 'Aucune'},
};
export function translate(text: string, language: Language): string {return messages[text]?.[language] ?? text}
export function useTranslation() {const language = useContext(LanguageContext); return (text: string) => translate(text, language)}
