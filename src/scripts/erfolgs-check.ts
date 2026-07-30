import {
  ERFOLGS_CHECK_AREAS,
  ERFOLGS_CHECK_GAPS,
  ERFOLGS_CHECK_ICONS,
  ERFOLGS_CHECK_MULTI_TITLES,
  ERFOLGS_CHECK_QUESTIONS,
  ERFOLGS_CHECK_RECOMMENDATIONS,
  ERFOLGS_CHECK_SPECIFIC_TITLES,
  type ErfolgsCheckCta,
} from '../data/erfolgs-check';
import arrowIcon from '../assets/images/icon-arrow-white.svg';
import { BP, EASE, FINE_POINTER, gsap, onMouseProgress } from './motion/util';

const LEAD_ENDPOINT = '/api/erfolgs-check-lead';
const SHEETS_URL =
  'https://script.google.com/macros/s/AKfycbybkuQCkrBe3k1d3C0EK344P-PAwjVz0_H9bxFpkP4k-oMxyjrcsTSLG-ToaWEkkA7IbA/exec';
const MAX_SCORE = ERFOLGS_CHECK_QUESTIONS.length * 3;
const ARROW_ICON_SRC = typeof arrowIcon === 'string' ? arrowIcon : arrowIcon.src;
const LEAD_MSG_REQUIRED = 'Bitte fülle dieses Feld aus.';
const LEAD_MSG_EMAIL = 'Bitte gib eine gültige E-Mail-Adresse ein.';
const LEAD_MSG_GDPR = 'Bitte akzeptiere die Datenschutzerklärung.';

let leadValidationErrorId = 0;
type Html2PdfModule = typeof import('html2pdf.js');
let html2PdfModulePromise: Promise<Html2PdfModule> | null = null;

function loadHtml2Pdf() {
  if (!html2PdfModulePromise) {
    html2PdfModulePromise = import('html2pdf.js').catch((error) => {
      html2PdfModulePromise = null;
      throw error;
    });
  }
  return html2PdfModulePromise;
}

async function loadHtml2PdfWithRetry() {
  try {
    return await loadHtml2Pdf();
  } catch {
    await new Promise((resolve) => window.setTimeout(resolve, 350));
    return loadHtml2Pdf();
  }
}

interface AreaScore {
  points: number;
  max: number;
  percentage: number;
}

interface ResultProfile {
  total: number;
  percentage: number;
  levelIndex: number;
  areaScores: AreaScore[];
  weakestAreaIndex: number;
  weakAreaIndexes: number[];
  allPerfect: boolean;
  title: string;
  text: string;
}

function leadFieldWrap(field: HTMLElement) {
  return (
    field.closest<HTMLElement>('.success-check__field-grid label, .success-check__consent') ??
    field
  );
}

function clearLeadErrors(form: HTMLFormElement) {
  form.querySelectorAll('.success-check__field-error').forEach((element) => element.remove());
  form
    .querySelectorAll<HTMLElement>('[data-check-validation-error]')
    .forEach((control) => {
      const errorId = control.dataset.checkValidationError;
      const describedBy = (control.getAttribute('aria-describedby') ?? '')
        .split(/\s+/)
        .filter((id) => id && id !== errorId);

      if (describedBy.length) control.setAttribute('aria-describedby', describedBy.join(' '));
      else control.removeAttribute('aria-describedby');

      control.removeAttribute('aria-invalid');
      delete control.dataset.checkValidationError;
    });
}

function addLeadError(anchor: HTMLElement, message: string, controls: HTMLElement[]) {
  const error = document.createElement('p');
  error.className = 'success-check__field-error';
  error.id = `success-check-field-error-${++leadValidationErrorId}`;
  error.setAttribute('role', 'alert');
  error.textContent = message;

  if (anchor.classList.contains('success-check__consent')) anchor.after(error);
  else anchor.append(error);

  controls.forEach((control) => {
    const describedBy = new Set(
      (control.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean),
    );
    describedBy.add(error.id);
    control.setAttribute('aria-describedby', [...describedBy].join(' '));
    control.setAttribute('aria-invalid', 'true');
    control.dataset.checkValidationError = error.id;
  });
}

function validateLeadForm(form: HTMLFormElement) {
  clearLeadErrors(form);

  form
    .querySelectorAll<HTMLInputElement>('input[required]:not(:disabled)')
    .forEach((field) => {
      const anchor = leadFieldWrap(field);
      if (field.type === 'checkbox') {
        if (!field.checked) addLeadError(anchor, LEAD_MSG_GDPR, [field]);
        return;
      }
      if (!field.value.trim()) {
        addLeadError(anchor, LEAD_MSG_REQUIRED, [field]);
      } else if (field.type === 'email' && field.validity.typeMismatch) {
        addLeadError(anchor, LEAD_MSG_EMAIL, [field]);
      }
    });

  const firstError = form.querySelector<HTMLElement>('.success-check__field-error');
  if (!firstError) return true;

  const firstInvalid = form.querySelector<HTMLElement>('[aria-invalid="true"]');
  firstInvalid?.focus({ preventScroll: true });
  leadFieldWrap(firstInvalid ?? firstError).scrollIntoView({
    behavior: 'smooth',
    block: 'center',
  });
  return false;
}

function calculateResult(answers: number[]): ResultProfile {
  const total = answers.reduce((sum, answer, questionIndex) => {
    return sum + ERFOLGS_CHECK_QUESTIONS[questionIndex].options[answer].points;
  }, 0);
  const percentage = Math.round((total / MAX_SCORE) * 100);

  const areaScores = ERFOLGS_CHECK_AREAS.map((_, areaIndex) => {
    const questionIndexes = ERFOLGS_CHECK_QUESTIONS.flatMap((question, questionIndex) =>
      question.area === areaIndex ? [questionIndex] : [],
    );
    const points = questionIndexes.reduce((sum, questionIndex) => {
      return (
        sum +
        ERFOLGS_CHECK_QUESTIONS[questionIndex].options[answers[questionIndex]].points
      );
    }, 0);
    const max = questionIndexes.length * 3;
    return { points, max, percentage: Math.round((points / max) * 100) };
  });

  const allPerfect = total === MAX_SCORE;
  const weakestAreaIndex = areaScores.reduce(
    (weakest, score, index) =>
      score.percentage < areaScores[weakest].percentage ? index : weakest,
    0,
  );
  const levelIndex = total <= 27 ? 0 : total <= 45 ? 1 : 2;
  const sortedScores = [...areaScores].sort((a, b) => a.percentage - b.percentage);
  const multiWeak =
    !allPerfect &&
    sortedScores[1].percentage <= 50 &&
    sortedScores[1].percentage - sortedScores[0].percentage < 15;
  const heading = allPerfect
    ? {
        title: 'Starke Basis – jetzt geht es ums Skalieren',
        text: 'Du weißt, was du tust. Vision, Profil, Konsistenz und erste Ergebnisse sitzen bereits. Jetzt geht es darum, dein System zu verfeinern, die letzten Potenziale zu heben und Instagram dauerhaft als verlässlichen Wachstumskanal zu etablieren.',
      }
    : multiWeak
      ? ERFOLGS_CHECK_MULTI_TITLES[levelIndex]
      : ERFOLGS_CHECK_SPECIFIC_TITLES[weakestAreaIndex];

  const minPercentage = Math.min(...areaScores.map((score) => score.percentage));
  let weakAreaIndexes = areaScores
    .map((score, index) => ({ index, percentage: score.percentage }))
    .filter((score) => score.percentage <= Math.min(minPercentage + 14, 67))
    .sort((a, b) => a.percentage - b.percentage)
    .map((score) => score.index);

  if (weakAreaIndexes.length === 0) weakAreaIndexes = [weakestAreaIndex];

  return {
    total,
    percentage,
    levelIndex,
    areaScores,
    weakestAreaIndex,
    weakAreaIndexes,
    allPerfect,
    title: heading.title,
    text: heading.text,
  };
}

function gapFeedback(areaIndex: number, answers: number[]) {
  return ERFOLGS_CHECK_QUESTIONS.flatMap((question, questionIndex) => {
    if (question.area !== areaIndex) return [];
    const feedback = ERFOLGS_CHECK_GAPS[questionIndex]?.[answers[questionIndex]];
    return feedback ? [feedback] : [];
  });
}

function escapeHtml(value: string) {
  return value.replace(
    /[&<>'"]/g,
    (character) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character] ??
      character,
  );
}

function glowButtonContent(label: string, labelAttributes = '') {
  return `
    <span class="btn-glow__circle" aria-hidden="true" data-check-glow-circle></span>
    <span class="btn-glow__wrapper">
      <span class="btn-glow__content">
        <span class="btn-glow__label"${labelAttributes}>${label}</span>
        <span class="btn-arrows" aria-hidden="true">
          <img src="${ARROW_ICON_SRC}" alt="" data-check-icon-1>
          <img src="${ARROW_ICON_SRC}" alt="" data-check-icon-2>
        </span>
      </span>
    </span>`;
}

function sendToSheets(data: Record<string, string | number>) {
  // Unabhängiger Statistikkanal des ursprünglichen Erfolgs-Checks. Die
  // öffentliche Apps-Script-Web-App schreibt die Werte in „Ausfüllungen“ und
  // aktualisiert damit das bestehende Dashboard.
  void fetch(SHEETS_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).catch(() => {
    // Die Statistik darf weder Lead-Übermittlung noch Ergebnisanzeige
    // blockieren, wenn Google vorübergehend nicht erreichbar ist.
  });
}

function resultLink(cta: ErfolgsCheckCta, primary = false) {
  const external = /^https?:\/\//.test(cta.href);
  const attributes = `href="${cta.href}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}`;
  return primary
    ? `<a class="btn-glow success-check__result-primary" ${attributes} data-check-glow>${glowButtonContent(cta.label)}</a>`
    : `<a class="button success-check__result-secondary" ${attributes} data-check-underline>
        <span class="success-check__button-underline"><span class="link-underline__label">${cta.label}</span><span class="link-underline__line" aria-hidden="true"></span></span>
        <span aria-hidden="true">→</span>
      </a>`;
}

function pdfFilename(name: string) {
  const firstName = name
    .trim()
    .split(/\s+/)[0]
    ?.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9-]/g, '');
  return `Instagram-Erfolgsprofil${firstName ? `-${firstName}` : ''}.pdf`;
}

function downloadPdfBlob(blob: Blob, filename: string) {
  const isIosWebKit =
    /iP(?:ad|hone|od)/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  // iOS/WebKit behandelt application/pdf-Blob-Links teilweise als Navigation
  // statt als Download. Als Binärdatei mit .pdf-Dateinamen landet das Profil
  // zuverlässig im Download-Ordner der Dateien-App.
  const downloadBlob = isIosWebKit
    ? new Blob([blob], { type: 'application/octet-stream' })
    : blob;
  const objectUrl = window.URL.createObjectURL(downloadBlob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = filename;
  link.rel = 'noopener';
  link.hidden = true;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => window.URL.revokeObjectURL(objectUrl), 60_000);
}

function materialiseUppercaseForPdf(root: HTMLElement) {
  // html2canvas berechnet Textbereiche anhand des ursprünglichen Textknotens.
  // Bei CSS-uppercase wird „ß“ jedoch zu „SS“ und damit ein Zeichen länger –
  // das kann den Export mit einem Range-Fehler abbrechen. Für die PDF-Kopie
  // schreiben wir die betroffenen kurzen Labels deshalb direkt groß.
  const uppercaseElements = root.querySelectorAll<HTMLElement>(
    [
      '.success-check__compact-title span',
      '.success-check__kicker',
      '.success-check__score span',
      '.success-check__scores > h3',
      '.success-check__potential-box > h3',
      '.success-check__gap-group h4',
    ].join(','),
  );

  uppercaseElements.forEach((element) => {
    element.textContent = element.textContent?.toLocaleUpperCase('de-DE') ?? '';
    element.style.textTransform = 'none';
  });
}

function preparePdfClone<T extends HTMLElement>(source: T) {
  const clone = source.cloneNode(true) as T;
  clone.removeAttribute('id');
  clone.removeAttribute('tabindex');
  clone.removeAttribute('aria-labelledby');
  clone.querySelectorAll('[id]').forEach((element) => element.removeAttribute('id'));
  clone.querySelectorAll('[tabindex]').forEach((element) => element.removeAttribute('tabindex'));
  clone
    .querySelectorAll('[aria-labelledby]')
    .forEach((element) => element.removeAttribute('aria-labelledby'));
  materialiseUppercaseForPdf(clone);
  return clone;
}

function normalisePdfCtas(root: HTMLElement) {
  root
    .querySelectorAll<HTMLAnchorElement>(
      '.success-check__result-primary, .success-check__result-secondary',
    )
    .forEach((link) => {
      const glowLabel = link.querySelector<HTMLElement>('.btn-glow__label');
      const label = (glowLabel?.textContent ?? link.textContent ?? '').replace(/→\s*$/, '').trim();
      const labelElement = document.createElement('span');
      labelElement.className = 'success-check__pdf-cta-label';
      labelElement.textContent = label;
      const arrow = document.createElement('span');
      arrow.className = 'success-check__pdf-cta-arrow';
      arrow.setAttribute('aria-hidden', 'true');
      arrow.innerHTML =
        '<svg viewBox="0 0 20 20" focusable="false"><path d="M3 10h13M11.5 5.5 16 10l-4.5 4.5"></path></svg>';
      link.replaceChildren(labelElement, arrow);
      link.removeAttribute('data-check-glow');
      link.removeAttribute('style');
      // Die Website-Glow-Klasse bringt einen animierten 1-Pixel-Rand mit.
      // html2canvas kann diesen am rechten Rand als schwarzen Strich abbilden.
      // Im PDF übernimmt success-check__pdf-cta die vollständige Gestaltung.
      link.classList.remove('btn-glow');
      link.classList.add('success-check__pdf-cta');
    });
}

interface PdfPageLayout {
  page: HTMLElement;
  body: HTMLElement;
  card: HTMLElement;
  pageNumber: HTMLElement;
}

function createPdfPage(pdfDocument: HTMLElement): PdfPageLayout {
  const page = document.createElement('section');
  page.className = 'success-check__pdf-page';

  const title = document.createElement('p');
  title.className = 'success-check__pdf-page-header';
  title.textContent = 'Instagram Erfolgs-Check by Tristan Weithaler';

  const body = document.createElement('div');
  body.className = 'success-check__pdf-page-body';
  const card = document.createElement('article');
  card.className = 'success-check__result-card success-check__result-card--pdf';
  body.append(card);

  const footer = document.createElement('footer');
  footer.className = 'success-check__pdf-page-footer';
  const site = document.createElement('span');
  site.textContent = 'tristanweithaler.com';
  const pageNumber = document.createElement('span');
  footer.append(site, pageNumber);

  page.append(title, body, footer);
  pdfDocument.append(page);
  return { page, body, card, pageNumber };
}

function pdfPageFits(layout: PdfPageLayout) {
  return (
    layout.card.getBoundingClientRect().height <=
    layout.body.getBoundingClientRect().height + 0.5
  );
}

function appendPdfBlock(layout: PdfPageLayout, block: HTMLElement) {
  layout.card.append(block);
  if (pdfPageFits(layout)) return true;
  block.remove();
  return false;
}

function requiredPdfElement<T extends HTMLElement>(root: HTMLElement, selector: string) {
  const element = root.querySelector<T>(selector);
  if (!element) throw new Error(`PDF element missing: ${selector}`);
  return element;
}

function createPdfPotentialBox(source: HTMLElement, continuation = false) {
  const box = source.cloneNode(false) as HTMLElement;
  box.classList.add('success-check__potential-box--pdf');
  box.removeAttribute('id');
  const heading = requiredPdfElement<HTMLElement>(source, ':scope > h3').cloneNode(
    true,
  ) as HTMLElement;
  if (continuation) heading.textContent = 'Wachstumspotenziale · Fortsetzung';
  box.append(heading);
  materialiseUppercaseForPdf(box);
  return box;
}

function pdfResultBlocks(resultCard: HTMLElement) {
  // Das PDF wird aus allen aktuellen, direkten Bausteinen des sichtbaren
  // Ergebnisprofils aufgebaut. Neue Ergebnisbereiche oder geänderte Inhalte
  // werden dadurch automatisch übernommen; nur ausdrücklich markierte
  // Bedienelemente wie Download und Neustart bleiben außen vor.
  return Array.from(resultCard.children).filter(
    (element): element is HTMLElement =>
      element instanceof HTMLElement && !element.matches('[data-check-pdf-exclude]'),
  );
}

async function downloadResultPdf(
  resultCard: HTMLElement,
  name: string,
) {
  // Die Bibliothek wird erst nach der Ergebnisanzeige im Hintergrund vorgeladen.
  // Falls dieser Abruf kurz scheitert, versucht der Klick ihn einmal erneut.
  const { default: html2pdf } = await loadHtml2PdfWithRetry();
  await document.fonts?.ready;

  const pdfShell = document.createElement('div');
  pdfShell.className = 'success-check__pdf-shell';
  const pdfDocument = document.createElement('div');
  pdfDocument.className = 'success-check__pdf-document';
  pdfShell.append(pdfDocument);
  document.body.append(pdfShell);

  try {
    const pages: PdfPageLayout[] = [];
    const addPage = () => {
      const page = createPdfPage(pdfDocument);
      pages.push(page);
      return page;
    };

    let currentPage = addPage();
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    );

    const sourceBlocks = pdfResultBlocks(resultCard);
    if (sourceBlocks.length === 0) throw new Error('PDF result profile is empty.');

    for (const source of sourceBlocks) {
      if (source.matches('.success-check__potential-box')) {
        const gapGroups = Array.from(
          source.querySelectorAll<HTMLElement>(':scope > .success-check__gap-group'),
        );

        // Lange Wachstumspotenziale dürfen gruppenweise umbrechen. Alle
        // anderen – auch künftig ergänzte – Ergebnisblöcke werden weiter unten
        // automatisch als vollständige Kopie des sichtbaren Profils eingefügt.
        if (gapGroups.length > 0) {
          let potentialBox: HTMLElement | null = null;
          let groupsOnCurrentPage = 0;
          let continuation = false;

          for (const sourceGroup of gapGroups) {
            if (!potentialBox) {
              potentialBox = createPdfPotentialBox(source, continuation);
              currentPage.card.append(potentialBox);
            }

            const group = preparePdfClone(sourceGroup);
            potentialBox.append(group);
            if (pdfPageFits(currentPage)) {
              groupsOnCurrentPage += 1;
              continue;
            }

            group.remove();
            if (groupsOnCurrentPage === 0) potentialBox.remove();
            continuation = continuation || groupsOnCurrentPage > 0;
            currentPage = addPage();
            potentialBox = createPdfPotentialBox(source, continuation);
            currentPage.card.append(potentialBox);
            potentialBox.append(group);
            groupsOnCurrentPage = 1;
            if (!pdfPageFits(currentPage)) {
              throw new Error('PDF feedback group does not fit on one page.');
            }
          }
          continue;
        }
      }

      const block = preparePdfClone(source);
      normalisePdfCtas(block);
      if (appendPdfBlock(currentPage, block)) continue;

      currentPage = addPage();
      if (source.matches('.success-check__recommendation')) {
        currentPage.page.classList.add('success-check__pdf-page--recommendation-only');
      }
      if (!appendPdfBlock(currentPage, block)) {
        throw new Error(`PDF block does not fit on one page: ${source.className}`);
      }
    }

    pages.forEach((page, index) => {
      page.pageNumber.textContent = `Seite ${index + 1} / ${pages.length}`;
    });

    // Relative Links funktionieren in einer heruntergeladenen Datei nicht
    // zuverlässig. Im PDF deshalb immer vollständige Website-Adressen ablegen.
    const canonicalHref = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href;
    const publicBaseUrl = canonicalHref
      ? new URL('/', canonicalHref)
      : new URL('/', window.location.origin);
    pdfDocument.querySelectorAll<HTMLAnchorElement>('a[href]').forEach((link) => {
      const href = link.getAttribute('href');
      if (href) link.href = new URL(href, publicBaseUrl).href;
    });

    const filename = pdfFilename(name);
    const pdfBlob = await html2pdf()
      .set({
        filename,
        enableLinks: true,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          backgroundColor: '#0c0c0c',
          logging: false,
          windowWidth: 794,
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait',
          compress: true,
        },
      })
      .from(pdfDocument)
      .outputPdf('blob');
    downloadPdfBlob(pdfBlob, filename);
  } finally {
    pdfShell.remove();
  }
}

function initialiseCheck(root: HTMLElement) {
  const hero = root.querySelector<HTMLElement>('[data-check-hero]');
  const compactTitle = root.querySelector<HTMLElement>('[data-check-compact]');
  const progressWrap = root.querySelector<HTMLElement>('[data-check-progress]');
  const progressLabel = root.querySelector<HTMLElement>('[data-check-progress-label]');
  const progressMotivation = root.querySelector<HTMLElement>(
    '[data-check-progress-motivation]',
  );
  const progressValue = root.querySelector<HTMLElement>('[data-check-progress-value]');
  const progressTrack = root.querySelector<HTMLElement>('[data-check-progress-track]');
  const stageContainer = root.querySelector<HTMLElement>('[data-check-stage]');
  if (
    !hero ||
    !compactTitle ||
    !progressWrap ||
    !progressLabel ||
    !progressMotivation ||
    !progressValue ||
    !progressTrack ||
    !stageContainer
  ) {
    return;
  }

  // Feste Aliase nach dem Guard: TypeScript behält die Null-Prüfung damit auch
  // in den verschachtelten Render-Funktionen bei.
  const heroElement = hero;
  const compactElement = compactTitle;
  const progressElement = progressWrap;
  const progressLabelElement = progressLabel;
  const progressMotivationElement = progressMotivation;
  const progressValueElement = progressValue;
  const progressTrackElement = progressTrack;
  const stageElement = stageContainer;
  const startMarkup = stageElement.innerHTML;
  const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
  const checkParams = new URLSearchParams(window.location.search);
  // Nur der ausdrücklich aufgerufene Test-Link darf lokal echte Systeme.io-Leads
  // erzeugen. Der normale Localhost bleibt weiterhin ein sicherer UI-Vorschau-Modus.
  const systemeTestEnabled =
    isLocalhost && checkParams.get('systeme-test') === '1';
  const localPreview = isLocalhost && !systemeTestEnabled;
  const localLeadPreview = localPreview && checkParams.get('lead-preview') === '1';
  let currentQuestion = 0;
  let answers = Array<number>(ERFOLGS_CHECK_QUESTIONS.length).fill(-1);
  let leadName = '';
  let leadEmail = '';
  let sheetsResultSent = false;

  function enhanceGlowButtons() {
    const usePointerGlow = window.matchMedia(`${BP.main} and ${FINE_POINTER}`).matches;

    stageElement.querySelectorAll<HTMLElement>('[data-check-glow]').forEach((button) => {
      if (button.dataset.checkGlowReady === 'true') return;
      button.dataset.checkGlowReady = 'true';

      const firstIcon = button.querySelector<HTMLElement>('[data-check-icon-1]');
      const secondIcon = button.querySelector<HTMLElement>('[data-check-icon-2]');
      if (firstIcon && secondIcon) {
        gsap.set(firstIcon, { x: 0, xPercent: -131 });
        gsap.set(secondIcon, { x: 0, xPercent: 0 });
        button.addEventListener('mouseenter', () => {
          gsap.to(secondIcon, { xPercent: 131, duration: 0.4, ease: EASE.outSine });
          gsap.to(firstIcon, { xPercent: 0, duration: 0.4, ease: EASE.outSine });
        });
        button.addEventListener('mouseleave', () => {
          gsap.to(secondIcon, { xPercent: 0, duration: 0.4, ease: EASE.outSine });
          gsap.to(firstIcon, { xPercent: -131, duration: 0.4, ease: EASE.outSine });
        });
      }

      const circle = button.querySelector<HTMLElement>('[data-check-glow-circle]');
      if (!circle || !usePointerGlow) return;
      const xTo = gsap.quickTo(circle, 'xPercent', { duration: 0.5, ease: 'power2.out' });
      const yTo = gsap.quickTo(circle, 'yPercent', { duration: 0.5, ease: 'power2.out' });
      onMouseProgress(
        button,
        (x, y) => {
          xTo(-50 + 100 * x);
          yTo(-50 + 100 * y);
        },
        () => {
          xTo(0);
          yTo(0);
        },
      );
    });

    stageElement.querySelectorAll<HTMLElement>('[data-check-underline]').forEach((button) => {
      if (button.dataset.checkUnderlineReady === 'true') return;
      button.dataset.checkUnderlineReady = 'true';

      const line = button.querySelector<HTMLElement>('.link-underline__line');
      if (!line || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      button.addEventListener('mouseenter', () => {
        gsap.set(line, { x: 0, xPercent: -101 });
        gsap.to(line, {
          xPercent: 0,
          duration: 0.3,
          ease: EASE.outSine,
          overwrite: 'auto',
        });
      });
      button.addEventListener('mouseleave', () => {
        gsap.to(line, {
          xPercent: 101,
          duration: 0.2,
          ease: EASE.outSine,
          overwrite: 'auto',
        });
      });
    });
  }

  function animateStartPreview() {
    const preview = stageElement.querySelector<HTMLElement>('[data-check-start-preview]');
    if (!preview || preview.dataset.checkPreviewReady === 'true') return;

    const scoreText = preview.querySelector<HTMLElement>('[data-check-preview-score]');
    const scoreRing = preview.querySelector<SVGCircleElement>('[data-check-preview-score-ring]');
    const bars = Array.from(
      preview.querySelectorAll<HTMLElement>('.success-check__start-preview-metric em'),
    );
    if (!scoreText || !scoreRing || bars.length === 0) return;

    preview.dataset.checkPreviewReady = 'true';
    const scoreTarget = Number(scoreText.dataset.previewValue ?? 73);
    const scoreDurationMs = 3000;
    const scoreDurationSeconds = scoreDurationMs / 1000;
    const useNativeMobileAnimation = window.matchMedia(
      '(max-width: 767px), (hover: none), (pointer: coarse)',
    ).matches;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    if (useNativeMobileAnimation) {
      scoreText.textContent = '0%';
      preview.style.setProperty('--preview-ring-target', String(100 - scoreTarget));
      scoreRing.style.strokeDashoffset = '100';
      bars.forEach((bar) => {
        bar.style.transform = 'scaleX(0)';
      });
    } else {
      scoreText.textContent = '0%';
      gsap.set(scoreRing, { strokeDashoffset: 100 });
      gsap.set(bars, { scaleX: 0 });
    }

    const animateNativeCounter = () => {
      const startedAt = performance.now();
      let lastValue = -1;

      const updateCounter = (timestamp: number) => {
        const progress = Math.min((timestamp - startedAt) / scoreDurationMs, 1);
        const easedProgress = 0.5 - Math.cos(Math.PI * progress) / 2;
        const nextValue = Math.round(scoreTarget * easedProgress);

        if (nextValue !== lastValue) {
          scoreText.textContent = `${nextValue}%`;
          lastValue = nextValue;
        }

        if (progress < 1) {
          window.requestAnimationFrame(updateCounter);
        } else {
          scoreText.textContent = `${scoreTarget}%`;
        }
      };

      window.requestAnimationFrame(updateCounter);
    };

    const play = () => {
      if (preview.dataset.checkPreviewAnimated === 'true') return;
      preview.dataset.checkPreviewAnimated = 'true';

      if (useNativeMobileAnimation) {
        window.setTimeout(() => {
          preview.classList.add('is-native-preview-animated');
          animateNativeCounter();
        }, 80);
        return;
      }

      const counter = { value: 0 };
      let lastRenderedValue = -1;
      const timeline = gsap.timeline({ defaults: { ease: 'sine.inOut' } });
      timeline.to(
        counter,
        {
          value: scoreTarget,
          duration: scoreDurationSeconds,
          onUpdate: () => {
            const nextValue = Math.round(counter.value);
            if (nextValue === lastRenderedValue) return;
            scoreText.textContent = `${nextValue}%`;
            lastRenderedValue = nextValue;
          },
          onComplete: () => {
            scoreText.textContent = `${scoreTarget}%`;
          },
        },
        0,
      );
      timeline.to(
        scoreRing,
        { strokeDashoffset: 100 - scoreTarget, duration: scoreDurationSeconds },
        0,
      );
      bars.forEach((bar, index) => {
        timeline.to(
          bar,
          { scaleX: 1, duration: 0.8, ease: 'power2.inOut' },
          0.25 + index * 0.9,
        );
      });
    };

    if (!('IntersectionObserver' in window)) {
      play();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        play();
        observer.disconnect();
      },
      { threshold: 0.35 },
    );
    observer.observe(preview);
  }

  function focusStage() {
    window.requestAnimationFrame(() => {
      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches;
      const hasFinePointer = window.matchMedia(FINE_POINTER).matches;
      root.scrollIntoView({
        // Auf Touch-Geräten erzeugt der lange Smooth-Scroll zusammen mit dem
        // neu gerenderten, unterschiedlich hohen Fragenblock sichtbares
        // Ruckeln. Dort direkt zum Anfang springen und nur die neue Karte
        // weich einblenden; Desktop behält den bisherigen Smooth-Scroll.
        behavior: prefersReducedMotion || !hasFinePointer ? 'instant' : 'smooth',
        block: 'start',
      });
      stageElement
        .querySelector<HTMLElement>('[data-check-heading]')
        ?.focus({ preventScroll: true });
    });
  }

  function animateUnlockList() {
    const panel = stageElement.querySelector<HTMLElement>('[data-check-unlock-panel]');
    if (!panel) return;

    const reveal = () => panel.classList.add('is-visible');
    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      !('IntersectionObserver' in window)
    ) {
      reveal();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        reveal();
        observer.disconnect();
      },
      { threshold: 0.35 },
    );
    observer.observe(panel);
  }

  function setChrome(label: string, percentage: number, motivation = '') {
    heroElement.hidden = true;
    // Der kompakte Markenblock bleibt auf der Webseite verborgen, damit er
    // nicht mit der Fortschrittsanzeige konkurriert. Beim PDF-Export wird seine
    // Kopie weiterhin gezielt eingeblendet.
    compactElement.hidden = true;
    progressElement.hidden = false;
    progressLabelElement.textContent = label;
    progressMotivationElement.textContent = motivation;
    progressMotivationElement.hidden = !motivation;
    progressValueElement.textContent = `${percentage}%`;
    progressElement.style.setProperty('--check-progress', `${percentage}%`);
    progressTrackElement.setAttribute('aria-valuenow', String(percentage));
  }

  function renderQuestion() {
    const question = ERFOLGS_CHECK_QUESTIONS[currentQuestion];
    const area = ERFOLGS_CHECK_AREAS[question.area];
    const selectedAnswer = answers[currentQuestion];
    const progress = Math.round(
      ((currentQuestion + 1) / ERFOLGS_CHECK_QUESTIONS.length) * 100,
    );
    const motivation =
      progress <= 44
        ? 'Gleich weißt du mehr über deinen Account'
        : progress <= 78
          ? 'Über die Hälfte geschafft – weiter so!'
          : 'Nicht mehr lange bis zu deinem Ergebnis';
    setChrome(
      `Frage ${currentQuestion + 1} von ${ERFOLGS_CHECK_QUESTIONS.length}`,
      progress,
      motivation,
    );

    stageElement.innerHTML = `
      <div class="success-check__question-stage">
        <div class="success-check__area-banner">
          <span class="success-check__area-icon">${ERFOLGS_CHECK_ICONS[question.area]}</span>
          <div><strong>${area.name}</strong><span>${area.description}</span></div>
        </div>
        <div class="success-check__question-card">
          <p class="success-check__question-number">Frage ${currentQuestion + 1}</p>
          <h2 id="success-check-question" tabindex="-1" data-check-heading>${question.question}</h2>
          <p class="success-check__hint">${question.hint}</p>
          <div class="success-check__options" role="radiogroup" aria-labelledby="success-check-question">
            ${question.options
              .map(
                (option, optionIndex) => `
                  <label class="success-check__option${selectedAnswer === optionIndex ? ' is-selected' : ''}">
                    <input type="radio" name="question-${currentQuestion}" value="${optionIndex}" data-check-answer${selectedAnswer === optionIndex ? ' checked' : ''}>
                    <span class="success-check__radio" aria-hidden="true"></span>
                    <span>${option.text}</span>
                  </label>`,
              )
              .join('')}
          </div>
          <div class="success-check__navigation">
            <button class="button success-check__back-button" type="button" data-check-back data-check-underline${currentQuestion === 0 ? ' disabled' : ''}>
              <span aria-hidden="true">←</span>
              <span class="success-check__button-underline"><span class="link-underline__label">Zurück</span><span class="link-underline__line" aria-hidden="true"></span></span>
            </button>
            <button class="btn-glow success-check__next-button" type="button" data-check-next data-check-glow${selectedAnswer < 0 ? ' disabled' : ''}>
              ${glowButtonContent(
                currentQuestion === ERFOLGS_CHECK_QUESTIONS.length - 1
                  ? 'Auswertung starten'
                  : 'Weiter',
              )}
            </button>
          </div>
        </div>
      </div>`;
    enhanceGlowButtons();
    focusStage();
  }

  function renderLead() {
    const result = calculateResult(answers);
    setChrome('Auswertung abgeschlossen', 100);
    stageElement.innerHTML = `
      <div class="success-check__lead-card">
        <div class="success-check__lead-copy">
          <span class="success-check__complete-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="m6 12.5 4 4L18.5 8"></path></svg>
          </span>
          <p class="success-check__kicker">Geschafft – jetzt wird es spannend</p>
          <h2 tabindex="-1" data-check-heading>Dein persönliches Ergebnis ist bereit.</h2>
          <p>Letzter Schritt: Trag kurz deinen Namen und deine E-Mail-Adresse ein und schalte dein Ergebnisprofil kostenlos frei.</p>
        </div>

        <div class="success-check__lead-preview">
          <div class="success-check__lead-preview-profile" aria-hidden="true">
            <div class="success-check__lead-preview-score" style="--preview-score:${result.percentage}%">
              <div><strong>${result.percentage}%</strong><span>Gesamt-Score</span></div>
            </div>
            <div class="success-check__lead-preview-content">
              <span>Dein persönliches Ergebnis</span>
              <strong>${result.title}</strong>
              <div class="success-check__lead-preview-areas">
                ${ERFOLGS_CHECK_AREAS.map(
                  (area, index) =>
                    `<div><span>${area.short}</span><i style="width:${result.areaScores[index].percentage}%"></i></div>`,
                ).join('')}
              </div>
            </div>
          </div>
          <div class="success-check__unlock-panel" data-check-unlock-panel>
            <h3>Das schaltest du jetzt frei</h3>
            <ul class="success-check__unlock-list" role="list">
              <li style="--unlock-delay:0.17s;--unlock-shake-delay:0s">
                <span class="success-check__unlock-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="5" y="10" width="14" height="11" rx="2"></rect><path d="M8 10V7a4 4 0 0 1 8 0v3"></path></svg></span>
                <span>Dein persönlicher Gesamt-Score</span>
              </li>
              <li style="--unlock-delay:0.29s;--unlock-shake-delay:0.38s">
                <span class="success-check__unlock-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="5" y="10" width="14" height="11" rx="2"></rect><path d="M8 10V7a4 4 0 0 1 8 0v3"></path></svg></span>
                <span>Alle 6 Bereiche übersichtlich bewertet</span>
              </li>
              <li style="--unlock-delay:0.41s;--unlock-shake-delay:0.76s">
                <span class="success-check__unlock-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="5" y="10" width="14" height="11" rx="2"></rect><path d="M8 10V7a4 4 0 0 1 8 0v3"></path></svg></span>
                <span>Deine größten Wachstumspotenziale</span>
              </li>
              <li style="--unlock-delay:0.53s;--unlock-shake-delay:1.14s">
                <span class="success-check__unlock-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="5" y="10" width="14" height="11" rx="2"></rect><path d="M8 10V7a4 4 0 0 1 8 0v3"></path></svg></span>
                <span>Konkrete Tipps und Empfehlungen</span>
              </li>
              <li style="--unlock-delay:0.65s;--unlock-shake-delay:1.52s">
                <span class="success-check__unlock-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="5" y="10" width="14" height="11" rx="2"></rect><path d="M8 10V7a4 4 0 0 1 8 0v3"></path></svg></span>
                <span>Dein vollständiges Ergebnisprofil als PDF</span>
              </li>
            </ul>
          </div>
        </div>

        <form class="success-check__lead-form" data-check-lead-form novalidate>
          <label class="success-check__honeypot" aria-hidden="true">
            Website
            <input type="text" name="Website" tabindex="-1" autocomplete="off">
          </label>
          <div class="success-check__field-grid">
            <label>
              <span>Dein Name</span>
              <input type="text" name="Name" autocomplete="given-name" placeholder="Name" required>
            </label>
            <label>
              <span>Deine E-Mail-Adresse</span>
              <input type="email" name="E-Mail" autocomplete="email" inputmode="email" placeholder="name@beispiel.de" required>
            </label>
          </div>

          <label class="success-check__consent">
            <input type="checkbox" name="GDPR" value="Akzeptiert" required>
            <span class="success-check__checkbox" aria-hidden="true">
              <svg viewBox="0 0 12 10"><path d="M1 5.5 4.2 8.5 11 1.5"></path></svg>
            </span>
            <span>Ich stimme der <a href="/datenschutz/" target="_blank" rel="noopener noreferrer">Datenschutzerklärung</a> sowie der Verarbeitung meiner Angaben zur Auswertung und Kontaktaufnahme zu.</span>
          </label>

          ${localPreview ? '<p class="success-check__local-note">Localhost-Vorschau: Deine Kontaktdaten werden nicht an das Lead-System versendet. Quiz-Ergebnis, Name und E-Mail werden zum Testen in Google Sheets protokolliert.</p>' : ''}

          <p class="success-check__form-error" role="alert" data-check-form-error hidden></p>
          <div class="success-check__lead-actions">
            <button class="button success-check__back-button" type="button" data-check-lead-back data-check-underline>
              <span aria-hidden="true">←</span>
              <span class="success-check__button-underline"><span class="link-underline__label">Letzte Antwort prüfen</span><span class="link-underline__line" aria-hidden="true"></span></span>
            </button>
            <button class="btn-glow success-check__primary-button" type="submit" data-check-submit data-check-glow>
              ${glowButtonContent('Ergebnisprofil anzeigen', ' data-check-submit-label')}
            </button>
          </div>
        </form>
      </div>`;
    enhanceGlowButtons();
    animateUnlockList();
    focusStage();
  }

  function renderResult() {
    const result = calculateResult(answers);
    const recommendation = ERFOLGS_CHECK_RECOMMENDATIONS[result.levelIndex];

    if (!sheetsResultSent) {
      sheetsResultSent = true;
      sendToSheets({
        datum: new Date().toLocaleDateString('de-AT'),
        uhrzeit: new Date().toLocaleTimeString('de-AT', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        gesamt_score: result.percentage,
        gesamt_punkte: result.total,
        level:
          result.levelIndex === 0
            ? 'Anfänger (0-50%)'
            : result.levelIndex === 1
              ? 'Aktiv (51-84%)'
              : 'Skalieren (85-100%)',
        schwächster_bereich: result.allPerfect
          ? 'Alle gleich'
          : ERFOLGS_CHECK_AREAS[result.weakestAreaIndex].short,
        vision_ziele: result.areaScores[0].percentage,
        profil_positionierung: result.areaScores[1].percentage,
        strategie_content: result.areaScores[2].percentage,
        content_produktion: result.areaScores[3].percentage,
        analyse_optimierung: result.areaScores[4].percentage,
        angebote_monetarisierung: result.areaScores[5].percentage,
        empfehlung: result.allPerfect
          ? '1:1 Coaching'
          : recommendation.primary.label.substring(0, 40),
        name: leadName,
        email: leadEmail,
      });
    }

    setChrome('Dein Ergebnisprofil', 100);

    const potentialHtml = result.allPerfect
      ? `
        <section class="success-check__potential-box">
          <h3>Dein Wachstumspotenzial: Skalieren</h3>
          <ul>
            <li>Respekt! Du hast eine starke Basis in allen 6 Bereichen – das ist die Ausnahme.</li>
            <li>Jetzt geht es um mehr Reichweite, Community, Automation und planbaren Umsatz.</li>
            <li>Genau dabei unterstützt dich Tristan sehr gezielt in seinen 1:1 Coachings.</li>
          </ul>
        </section>`
      : `
        <section class="success-check__potential-box">
          <h3>${
            result.weakAreaIndexes.length === 1
              ? 'Dein größtes Wachstumspotenzial'
              : 'Deine größten Wachstumspotenziale'
          }</h3>
          ${result.weakAreaIndexes
            .map((areaIndex) => {
              const gaps = gapFeedback(areaIndex, answers);
              if (gaps.length === 0) return '';
              return `
                <div class="success-check__gap-group">
                  <h4>${ERFOLGS_CHECK_AREAS[areaIndex].short}</h4>
                  <ul>${gaps.map((gap) => `<li>${gap}</li>`).join('')}</ul>
                </div>`;
            })
            .join('')}
        </section>`;

    stageElement.innerHTML = `
      <article class="success-check__result-card">
        <div class="success-check__download" data-check-pdf-exclude>
          <button
            class="button success-check__download-button"
            type="button"
            data-check-download
            aria-label="Ergebnisprofil als PDF herunterladen"
            title="Ergebnisprofil als PDF herunterladen"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 3v12m0 0 4-4m-4 4-4-4M5 20h14"></path>
            </svg>
            <span data-check-download-label>PDF</span>
          </button>
          <p class="success-check__download-status" role="status" data-check-download-status hidden></p>
        </div>

        <div class="success-check__result-intro">
          <p class="success-check__kicker">${
            leadName
              ? `${escapeHtml(leadName)}, hier ist dein Ergebnis`
              : 'Hier ist dein Ergebnis'
          }</p>
          <div class="success-check__score" aria-label="Gesamt-Score ${result.percentage} Prozent">
            <svg class="success-check__score-ring" viewBox="0 0 120 120" aria-hidden="true">
              <circle class="success-check__score-ring-track" cx="60" cy="60" r="57" pathLength="100"></circle>
              <circle class="success-check__score-ring-value" cx="60" cy="60" r="57" pathLength="100" stroke-dasharray="${result.percentage} ${100 - result.percentage}" stroke-dashoffset="0" transform="rotate(-90 60 60)"></circle>
            </svg>
            <div><strong>${result.percentage}%</strong><span>Gesamt-Score</span></div>
          </div>
          <h2 tabindex="-1" data-check-heading>${result.title}</h2>
          <p>${result.text}</p>
        </div>

        <div class="success-check__divider"></div>
        <section class="success-check__scores" aria-labelledby="area-score-title">
          <h3 id="area-score-title">Dein Ergebnis nach Bereich</h3>
          <div class="success-check__score-grid">
            ${ERFOLGS_CHECK_AREAS.map((area, index) => {
              const score = result.areaScores[index];
              return `
                <div class="success-check__score-card">
                  <span class="success-check__area-icon">${ERFOLGS_CHECK_ICONS[index]}</span>
                  <strong>${area.short}</strong>
                  <div class="success-check__score-track" aria-hidden="true"><span style="width:${score.percentage}%"></span></div>
                  <span>${score.percentage}% · ${score.points}/${score.max} Punkte</span>
                </div>`;
            }).join('')}
          </div>
        </section>

        ${potentialHtml}

        <section class="success-check__recommendation" aria-labelledby="recommendation-title">
          <p class="success-check__kicker">Deine individuelle Empfehlung</p>
          <h3 id="recommendation-title">Der passende nächste Schritt für dich</h3>
          ${resultLink(recommendation.primary, true)}
          <div class="success-check__or"><span>oder</span></div>
          ${resultLink(recommendation.secondary)}
          <p class="success-check__recommendation-note">${recommendation.note}</p>
        </section>

        <button class="success-check__restart" type="button" data-check-restart data-check-pdf-exclude>Check neu starten</button>
      </article>`;
    enhanceGlowButtons();
    focusStage();
    window.setTimeout(() => {
      void loadHtml2Pdf().catch(() => {
        // Ein fehlgeschlagener Vorab-Abruf bleibt unsichtbar. Beim Klick wird
        // der Download-Baustein über loadHtml2PdfWithRetry erneut angefordert.
      });
    }, 0);
  }

  stageElement.addEventListener('input', (event) => {
    const input = (event.target as HTMLElement).closest<HTMLInputElement>('[data-check-answer]');
    if (!input) return;
    answers[currentQuestion] = Number(input.value);
    stageElement.querySelectorAll('.success-check__option').forEach((option) => {
      option.classList.toggle('is-selected', option.contains(input));
    });
    const next = stageElement.querySelector<HTMLButtonElement>('[data-check-next]');
    if (next) next.disabled = false;
  });

  stageElement.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    const downloadButton = target.closest<HTMLButtonElement>('[data-check-download]');
    if (downloadButton) {
      const resultCard = stageElement.querySelector<HTMLElement>('.success-check__result-card');
      const label = downloadButton.querySelector<HTMLElement>('[data-check-download-label]');
      const status = stageElement.querySelector<HTMLElement>('[data-check-download-status]');
      if (!resultCard || downloadButton.disabled) return;

      downloadButton.disabled = true;
      downloadButton.setAttribute('aria-busy', 'true');
      downloadButton.setAttribute('aria-label', 'PDF wird erstellt');
      if (label) label.textContent = 'PDF …';
      if (status) status.hidden = true;

      void downloadResultPdf(resultCard, leadName)
        .then(() => {
          if (status) {
            status.dataset.state = 'success';
            status.textContent =
              'PDF-Download gestartet – du findest die Datei in deinen Downloads.';
            status.hidden = false;
            window.setTimeout(() => {
              status.hidden = true;
            }, 6000);
          }
        })
        .catch((error) => {
          console.error('Erfolgs-Check PDF export failed', error);
          if (status) {
            status.dataset.state = 'error';
            status.textContent = 'PDF-Download nicht möglich – bitte erneut versuchen.';
            status.hidden = false;
            window.setTimeout(() => {
              status.hidden = true;
            }, 5000);
          }
        })
        .finally(() => {
          downloadButton.disabled = false;
          downloadButton.removeAttribute('aria-busy');
          downloadButton.setAttribute('aria-label', 'Ergebnisprofil als PDF herunterladen');
          if (label) label.textContent = 'PDF';
        });
      return;
    }
    if (target.closest('[data-check-start]')) {
      currentQuestion = 0;
      renderQuestion();
      return;
    }
    if (target.closest('[data-check-back]') && currentQuestion > 0) {
      currentQuestion -= 1;
      renderQuestion();
      return;
    }
    if (target.closest('[data-check-next]') && answers[currentQuestion] >= 0) {
      if (currentQuestion < ERFOLGS_CHECK_QUESTIONS.length - 1) {
        currentQuestion += 1;
        renderQuestion();
      } else {
        renderLead();
      }
      return;
    }
    if (target.closest('[data-check-lead-back]')) {
      currentQuestion = ERFOLGS_CHECK_QUESTIONS.length - 1;
      renderQuestion();
      return;
    }
    if (target.closest('[data-check-restart]')) {
      currentQuestion = 0;
      answers = Array<number>(ERFOLGS_CHECK_QUESTIONS.length).fill(-1);
      leadName = '';
      leadEmail = '';
      sheetsResultSent = false;
      heroElement.hidden = false;
      compactElement.hidden = true;
      progressElement.hidden = true;
      stageElement.innerHTML = startMarkup;
      enhanceGlowButtons();
      animateStartPreview();
      root.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  stageElement.addEventListener('submit', async (event) => {
    const form = event.target as HTMLFormElement;
    if (!form.matches('[data-check-lead-form]')) return;
    event.preventDefault();
    if (!validateLeadForm(form)) return;

    const formData = new FormData(form);
    const name = String(formData.get('Name') ?? '').trim();
    const email = String(formData.get('E-Mail') ?? '').trim();

    const button = form.querySelector<HTMLButtonElement>('[data-check-submit]');
    const label = form.querySelector<HTMLElement>('[data-check-submit-label]');
    const error = form.querySelector<HTMLElement>('[data-check-form-error]');
    if (button) button.disabled = true;
    if (label) label.textContent = 'Wird ausgewertet …';
    if (error) error.hidden = true;

    try {
      if (localPreview) {
        // Der lokale Vorschlag soll vollständig testbar sein, ohne Test-Leads
        // im produktiven Systeme.io-Konto zu erzeugen.
        await new Promise((resolve) => window.setTimeout(resolve, 250));
      } else {
        const response = await fetch(LEAD_ENDPOINT, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            email,
            consent: formData.get('GDPR') === 'Akzeptiert',
            website: String(formData.get('Website') ?? ''),
          }),
        });
        const responseBody = (await response.json().catch(() => null)) as {
          ok?: boolean;
        } | null;
        if (!response.ok || responseBody?.ok !== true) {
          throw new Error(`Lead endpoint responded ${response.status}`);
        }
      }
      leadName = name;
      leadEmail = email;
      renderResult();
    } catch {
      if (error) {
        error.textContent =
          'Das Absenden hat gerade nicht funktioniert. Bitte prüfe deine Verbindung und versuche es noch einmal.';
        error.hidden = false;
        error.focus();
      }
    } finally {
      if (button) button.disabled = false;
      if (label) label.textContent = 'Ergebnisprofil anzeigen';
    }
  });

  if (localLeadPreview) {
    answers.fill(1);
    renderLead();
  } else {
    enhanceGlowButtons();
    animateStartPreview();
  }
}

document.querySelectorAll<HTMLElement>('[data-erfolgs-check]').forEach(initialiseCheck);
