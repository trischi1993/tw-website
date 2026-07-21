import type {
  HomeContent,
  SitePage,
  SiteSettings,
  SiteImage,
  ServiceCategory,
} from '../src/lib/content/types';

/* ---------------------------------------------------------------------------
   Typen für shared/site-content.mjs (die zentrale Inhaltsquelle).

   `img` ist der Callback des Konsumenten: seed.ts liefert lokale SiteImages,
   make-seed.mjs Sanity-Upload-Referenzen. Typisiert ist hier der seed.ts-Pfad
   (SiteImage); make-seed ist reines JS und ignoriert die Deklaration.
   --------------------------------------------------------------------------- */

/** SiteSettings plus Header-CTA (Glow-Button „0 € Angebot" in der Navbar). */
export type SeedSiteSettings = SiteSettings & {
  headerCta: { label: string; href: string };
};

/** Service-Eintrag mit Seed-Zusatzfeldern (slug/order für make-seed). */
export interface SeedService {
  id: string;
  slug: string;
  name: string;
  formName: string;
  category: ServiceCategory;
  description: string;
  order: number | null;
  image?: SiteImage;
}

/** Testimonial-Eintrag mit Seed-Zusatzfeldern. */
export interface SeedTestimonial {
  id: string;
  slug: string;
  name: string;
  role?: string;
  text: string;
  order: number | null;
  image?: SiteImage;
}

export interface SeedContent {
  siteSettings: SeedSiteSettings;
  home: HomeContent;
  pages: SitePage[];
  services: SeedService[];
  testimonials: SeedTestimonial[];
}

export function buildContent(opts: {
  img: (path: string, alt: string, caption?: string) => SiteImage;
}): SeedContent;
