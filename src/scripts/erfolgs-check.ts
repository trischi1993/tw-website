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

const FORM_ACTION = 'https://form.taxi/s/vvg9bvd4';
const MAX_SCORE = ERFOLGS_CHECK_QUESTIONS.length * 3;
const ARROW_ICON_SRC = typeof arrowIcon === 'string' ? arrowIcon : arrowIcon.src;

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

function resultLink(cta: ErfolgsCheckCta, primary = false) {
  const external = /^https?:\/\//.test(cta.href);
  const attributes = `href="${cta.href}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}`;
  return primary
    ? `<a class="btn-glow success-check__result-primary" ${attributes} data-check-glow>${glowButtonContent(cta.label)}</a>`
    : `<a class="button success-check__result-secondary" ${attributes}>${cta.label}<span aria-hidden="true">→</span></a>`;
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
  const localPreview = ['localhost', '127.0.0.1'].includes(window.location.hostname);
  let currentQuestion = 0;
  let answers = Array<number>(ERFOLGS_CHECK_QUESTIONS.length).fill(-1);
  let leadName = '';

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
  }

  function focusStage() {
    window.requestAnimationFrame(() => {
      root.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
          ? 'auto'
          : 'smooth',
        block: 'start',
      });
      stageElement
        .querySelector<HTMLElement>('[data-check-heading]')
        ?.focus({ preventScroll: true });
    });
  }

  function setChrome(label: string, percentage: number, motivation = '') {
    heroElement.hidden = true;
    compactElement.hidden = false;
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
            <button class="button success-check__back-button" type="button" data-check-back${currentQuestion === 0 ? ' disabled' : ''}>
              <span aria-hidden="true">←</span> Zurück
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
          <p class="success-check__kicker">Deine Auswertung ist fertig</p>
          <h2 tabindex="-1" data-check-heading>Dein persönliches Ergebnis ist bereit.</h2>
          <p>Wohin dürfen wir dein Ergebnis zuordnen? Danach siehst du sofort deinen Gesamt-Score, alle 6 Bereichswerte und deine individuellen Wachstumspotenziale.</p>
        </div>

        <div class="success-check__lead-preview" aria-hidden="true">
          <div class="success-check__lead-preview-profile">
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
          <span class="success-check__lock">
            <svg viewBox="0 0 24 24"><rect x="5" y="10" width="14" height="11" rx="2"></rect><path d="M8 10V7a4 4 0 0 1 8 0v3"></path></svg>
          </span>
        </div>

        <form class="success-check__lead-form" method="POST" action="${FORM_ACTION}" data-check-lead-form>
          <input type="hidden" name="Formular" value="Instagram-Erfolgs-Check">
          <div class="success-check__field-grid">
            <label>
              <span>Dein Name</span>
              <input type="text" name="Name" autocomplete="name" placeholder="Vor- und Nachname" required>
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
            <span>Ich habe die <a href="/datenschutz/" target="_blank" rel="noopener noreferrer">Datenschutzerklärung</a> gelesen und bin mit der Verarbeitung meiner Angaben zur Auswertung und Kontaktaufnahme einverstanden.</span>
          </label>

          ${localPreview ? '<p class="success-check__local-note">Localhost-Vorschau: Deine Testeingaben werden nicht versendet.</p>' : ''}

          <p class="success-check__form-error" role="alert" data-check-form-error hidden></p>
          <div class="success-check__lead-actions">
            <button class="button success-check__back-button" type="button" data-check-lead-back>
              <span aria-hidden="true">←</span> Letzte Antwort prüfen
            </button>
            <button class="btn-glow success-check__primary-button" type="submit" data-check-submit data-check-glow>
              ${glowButtonContent('Ergebnisprofil anzeigen', ' data-check-submit-label')}
            </button>
          </div>
          <p class="success-check__privacy-note">
            <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2"></rect><path d="M8 10V7a4 4 0 0 1 8 0v3"></path></svg>
            Deine Daten werden sicher übertragen und nicht an Dritte verkauft.
          </p>
        </form>
      </div>`;
    enhanceGlowButtons();
    focusStage();
  }

  function renderResult() {
    const result = calculateResult(answers);
    const recommendation = ERFOLGS_CHECK_RECOMMENDATIONS[result.levelIndex];
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
        <div class="success-check__result-intro">
          <p class="success-check__kicker">${
            leadName
              ? `${escapeHtml(leadName)}, hier ist dein Ergebnis`
              : 'Hier ist dein Ergebnis'
          }</p>
          <div class="success-check__score" style="--score:${result.percentage}%" aria-label="Gesamt-Score ${result.percentage} Prozent">
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

        <button class="success-check__restart" type="button" data-check-restart>Check neu starten</button>
      </article>`;
    enhanceGlowButtons();
    focusStage();
  }

  stageElement.addEventListener('change', (event) => {
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
      heroElement.hidden = false;
      compactElement.hidden = true;
      progressElement.hidden = true;
      stageElement.innerHTML = startMarkup;
      enhanceGlowButtons();
      root.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  stageElement.addEventListener('submit', async (event) => {
    const form = event.target as HTMLFormElement;
    if (!form.matches('[data-check-lead-form]')) return;
    event.preventDefault();

    const result = calculateResult(answers);
    const formData = new FormData(form);
    formData.append('Gesamt-Score', `${result.percentage}%`);
    formData.append('Gesamt-Punkte', `${result.total}/${MAX_SCORE}`);
    formData.append(
      'Ergebnis-Stufe',
      result.levelIndex === 0 ? 'Fundament' : result.levelIndex === 1 ? 'Aktiv' : 'Skalieren',
    );
    formData.append(
      'Schwächster-Bereich',
      ERFOLGS_CHECK_AREAS[result.weakestAreaIndex].short,
    );
    result.areaScores.forEach((score, index) => {
      formData.append(
        `Bereich-${index + 1}-${ERFOLGS_CHECK_AREAS[index].short}`,
        `${score.percentage}% (${score.points}/${score.max} Punkte)`,
      );
    });
    formData.append(
      'Antworten',
      ERFOLGS_CHECK_QUESTIONS.map(
        (question, index) => `${index + 1}. ${question.options[answers[index]].text}`,
      ).join('\n'),
    );
    formData.append('Quelle', window.location.href);

    const button = form.querySelector<HTMLButtonElement>('[data-check-submit]');
    const label = form.querySelector<HTMLElement>('[data-check-submit-label]');
    const error = form.querySelector<HTMLElement>('[data-check-form-error]');
    if (button) button.disabled = true;
    if (label) label.textContent = 'Wird ausgewertet …';
    if (error) error.hidden = true;

    try {
      if (localPreview) {
        // Der lokale Vorschlag soll vollständig testbar sein, ohne Test-Leads
        // im produktiven Form.taxi-Eingang zu erzeugen.
        await new Promise((resolve) => window.setTimeout(resolve, 250));
      } else {
        const response = await fetch(form.action, {
          method: 'POST',
          body: formData,
          headers: { Accept: 'application/json' },
        });
        if (!response.ok) throw new Error(`Form endpoint responded ${response.status}`);
      }
      leadName = String(formData.get('Name') ?? '').trim();
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

  enhanceGlowButtons();
}

document.querySelectorAll<HTMLElement>('[data-erfolgs-check]').forEach(initialiseCheck);
