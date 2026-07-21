import type { SiteSettings, HomeContent, SitePage, ServiceItem, TestimonialItem } from './types';
import { buildContent } from '../../../shared/site-content';
import { img } from './images';

/* ===========================================================================
   SEED (einsprachig Deutsch) - der komplette Site-Inhalt ohne Sanity.

   Die Inhalte leben in EINER Quelle: shared/site-content.mjs (alle Texte
   wörtlich aus docs/webflow-spec). Hier wird sie nur mit der lokalen
   Bild-Registry (images.ts) instanziiert; studio/scripts/make-seed.mjs
   instanziiert dieselbe Quelle mit Sanity-Upload-Referenzen - gleiche Texte,
   gleiche _key, damit der Umstieg auf Sanity byte-stabil bleibt.
   =========================================================================== */

const content = buildContent({ img });

export const siteSettings: SiteSettings = content.siteSettings;
export const home: HomeContent = content.home;
export const pages: SitePage[] = content.pages;

/** CMS-Collections (in den Sections bereits eingebettet; hier zusätzlich
 *  einzeln für Konsumenten wie das Anfrage-Modal). */
export const services: ServiceItem[] = content.services;
export const testimonials: TestimonialItem[] = content.testimonials;
