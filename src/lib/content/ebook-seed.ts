import { buildEbookContent } from '../../../shared/ebook-content.mjs';
import { img } from './images';
import type { EbookContent } from './types';

/**
 * Vollständiger lokaler Fallback. Solange das Sanity-Singleton noch nicht
 * existiert (oder Sanity nicht konfiguriert ist), bleibt die aktuelle Seite
 * dadurch unverändert buildbar und auslieferbar.
 */
export const ebook = buildEbookContent({ img }) as unknown as EbookContent;
