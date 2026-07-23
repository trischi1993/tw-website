/* ---------------------------------------------------------------------------
   Modal-Logik (CtaModal.astro + AioModal.astro, global-chrome.md §8 / AIO §19):

   - Öffnen über [data-modal-open="cta"|"aio"] (delegiert) + ?openModal=true.
   - Schließen: X ([data-modal-close]), ESC, Klick auf den Scroll-Hintergrund.
     Fade wie im Original: display → 10ms → opacity 1; zu: opacity 0 → 500ms.
   - A11y: Body-Scroll-Lock, `inert` auf dem Seitenrest, Fokus-Trap,
     Fokus-Rückgabe.
   - CTA-Formular: bedingte Radio-Logik (Service-Typ → Unternehmens-Typ →
     Multiselect), Choices.js-JS LAZY beim ersten Öffnen, Hidden-Sync
     `Coaching-Bereiche`, eigene Inline-Fehlermeldungen (#E05C5C).
   - Submit: fetch POST an Form.Taxi, Erfolg/Fehler inline
     (.w-form-done/-fail-Äquivalente).
   --------------------------------------------------------------------------- */

// Choices-Stylesheet STATISCH importieren, nur das JS bleibt lazy. Ein
// dynamischer CSS-Import bricht in Produktion: `inlineStylesheets: 'always'`
// inlined das CSS beim Build in den <head> jeder Seite und verwirft die
// Asset-Datei, der gebaute Chunk referenziert sie aber weiter (__vite__mapDeps)
// → 404 beim ersten Modal-Öffnen → die Import-Promise wirft → Choices
// initialisiert nie und das rohe <select multiple> bleibt stehen. Statisch
// landet das CSS im selben Inline-<head> wie bisher (null Mehrgewicht), ohne
// Laufzeit-Referenz.
import 'choices.js/public/assets/styles/choices.min.css';

type ModalKey = 'cta' | 'aio';

const FADE_OUT_MS = 500;

const modals = new Map<ModalKey, HTMLElement>();
document.querySelectorAll<HTMLElement>('[data-modal]').forEach((el) => {
  modals.set(el.dataset.modal as ModalKey, el);
});

let openModalEl: HTMLElement | null = null;
let lastFocused: HTMLElement | null = null;
let hideTimer: number | undefined;

/* --- Öffnen / Schließen ---------------------------------------------------- */

function siblings(modal: HTMLElement): HTMLElement[] {
  // Oberster Vorfahre des Modals direkt unter <body> (für `inert` am Rest).
  let top: HTMLElement = modal;
  while (top.parentElement && top.parentElement !== document.body) top = top.parentElement;
  return (Array.from(document.body.children) as HTMLElement[]).filter((el) => el !== top);
}

function openModal(key: ModalKey) {
  const modal = modals.get(key);
  if (!modal || modal === openModalEl) return;
  if (openModalEl) closeModal(true);
  window.clearTimeout(hideTimer);

  lastFocused = document.activeElement as HTMLElement;
  openModalEl = modal;
  modal.removeAttribute('hidden');
  window.setTimeout(() => modal.classList.add('is-visible'), 10);
  document.body.classList.add('no-scroll');
  siblings(modal).forEach((el) => el.setAttribute('inert', ''));
  modal.querySelector<HTMLElement>('[data-modal-close]')?.focus();

  if (key === 'cta') void ensureChoices(modal);
}

function closeModal(instant = false) {
  const modal = openModalEl;
  if (!modal) return;
  openModalEl = null;
  modal.classList.remove('is-visible');
  siblings(modal).forEach((el) => el.removeAttribute('inert'));
  document.body.classList.remove('no-scroll');
  const finish = () => modal.setAttribute('hidden', '');
  if (instant) finish();
  else hideTimer = window.setTimeout(finish, FADE_OUT_MS);
  lastFocused?.focus();
}

document.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  const opener = target.closest<HTMLElement>('[data-modal-open]');
  if (opener) {
    e.preventDefault();
    openModal(opener.dataset.modalOpen as ModalKey);
    return;
  }
  if (target.closest('[data-modal-close]')) {
    closeModal();
    return;
  }
  // Klick auf die freie Fläche des Scroll-Containers (nicht auf den Inhalt).
  if (openModalEl && target.matches('[data-modal-backdrop]')) closeModal();
});

window.addEventListener('keydown', (e) => {
  if (!openModalEl) return;
  if (e.key === 'Escape') {
    closeModal();
    return;
  }
  if (e.key === 'Tab') {
    const stops = Array.from(
      openModalEl.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((el) => el.getClientRects().length > 0);
    if (stops.length === 0) return;
    const first = stops[0];
    const last = stops[stops.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
});

/* --- CTA: bedingte Radio-Logik --------------------------------------------- */

const ctaForm = document.querySelector<HTMLFormElement>('[data-cta-form]');

function setupConditionals(form: HTMLFormElement) {
  const specificBlock = form.querySelector<HTMLElement>('#isSpecificCoaching');
  const personalBlock = form.querySelector<HTMLElement>('#isPersonalBrand');
  const businessBlock = form.querySelector<HTMLElement>('#isUnternehmen');
  const serviceRadios = form.querySelectorAll<HTMLInputElement>('input[name="Service-Typ"]');
  const typeRadios = form.querySelectorAll<HTMLInputElement>('input[name="Unternehmens-Typ"]');

  const sync = () => {
    const service = form.querySelector<HTMLInputElement>('input[name="Service-Typ"]:checked');
    const specific = service?.dataset.target === 'isSpecificCoaching';
    specificBlock?.toggleAttribute('hidden', !specific);
    // Unsichtbare Pflicht-Radios dürfen den Submit nicht blockieren →
    // nur aktiv/required, wenn „Spezifische Coachings" gewählt ist.
    typeRadios.forEach((r) => {
      r.disabled = !specific;
      r.required = specific;
    });
    const type = form.querySelector<HTMLInputElement>('input[name="Unternehmens-Typ"]:checked');
    const showPersonal = specific && type?.dataset.target === 'isPersonalBrand';
    const showBusiness = specific && type?.dataset.target === 'isUnternehmen';
    personalBlock?.toggleAttribute('hidden', !showPersonal);
    businessBlock?.toggleAttribute('hidden', !showBusiness);
  };

  serviceRadios.forEach((r) => r.addEventListener('change', sync));
  typeRadios.forEach((r) => r.addEventListener('change', sync));
  sync();
}

if (ctaForm) setupConditionals(ctaForm);

/* --- CTA: Choices.js (lazy beim ersten Öffnen) ----------------------------- */

let choicesReady = false;

async function ensureChoices(modal: HTMLElement) {
  if (choicesReady) return;
  choicesReady = true;
  const selects = modal.querySelectorAll<HTMLSelectElement>('select[data-choices]');
  if (selects.length === 0) return;
  const { default: Choices } = await import('choices.js');
  selects.forEach((select) => {
    new Choices(select, {
      searchEnabled: true,
      removeItemButton: true,
      shouldSort: false,
      duplicateItemsAllowed: false,
      allowHTML: true,
      placeholderValue: select.dataset.placeholder ?? 'Coaching-Bereiche wählen…',
      searchPlaceholderValue: 'Suchen…',
      itemSelectText: 'Klicke zum Auswählen',
      noResultsText: 'Keine Treffer',
      noChoicesText: 'Keine Optionen verfügbar',
    });
  });
}

/* --- Validierung (eigene Inline-Fehler, Texte aus global-chrome.md §8) ----- */

const MSG_REQUIRED = 'Bitte fülle dieses Feld aus.';
const MSG_EMAIL = 'Bitte gib eine gültige E-Mail-Adresse ein.';
const MSG_RADIO = 'Bitte wähle eine Option aus.';
const MSG_GDPR = 'Bitte akzeptiere die Datenschutzerklärung.';

function fieldWrap(el: HTMLElement): HTMLElement {
  return el.closest<HTMLElement>('.modal__field, fieldset') ?? el;
}

let validationErrorId = 0;

function clearErrors(form: HTMLFormElement) {
  form.querySelectorAll('.modal-field-error').forEach((el) => el.remove());
  form.querySelectorAll<HTMLElement>('[data-validation-error]').forEach((control) => {
    const errorId = control.dataset.validationError;
    const describedBy = (control.getAttribute('aria-describedby') ?? '')
      .split(/\s+/)
      .filter((id) => id && id !== errorId);

    if (describedBy.length) control.setAttribute('aria-describedby', describedBy.join(' '));
    else control.removeAttribute('aria-describedby');

    control.removeAttribute('aria-invalid');
    delete control.dataset.validationError;
  });
}

function addError(anchor: HTMLElement, message: string, controls: HTMLElement[]) {
  const p = document.createElement('p');
  p.className = 'modal-field-error';
  p.id = `modal-field-error-${++validationErrorId}`;
  p.setAttribute('role', 'alert');
  p.textContent = message;
  anchor.appendChild(p);

  controls.forEach((control) => {
    const describedBy = new Set(
      (control.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean),
    );
    describedBy.add(p.id);
    control.setAttribute('aria-describedby', [...describedBy].join(' '));
    control.setAttribute('aria-invalid', 'true');
    control.dataset.validationError = p.id;
  });
}

function validate(form: HTMLFormElement): boolean {
  clearErrors(form);

  const radioGroups = new Set<string>();
  form
    .querySelectorAll<HTMLInputElement>('input[type="radio"][required]:not(:disabled)')
    .forEach((r) => radioGroups.add(r.name));
  radioGroups.forEach((name) => {
    const checked = form.querySelector(`input[name="${name}"]:checked`);
    if (!checked) {
      const radios = Array.from(
        form.querySelectorAll<HTMLInputElement>(`input[name="${name}"]`),
      );
      const first = radios[0];
      if (first) addError(fieldWrap(first), MSG_RADIO, radios);
    }
  });

  form
    .querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
      'input[required]:not([type="radio"]):not(:disabled), textarea[required]:not(:disabled)',
    )
    .forEach((field) => {
      if (field instanceof HTMLInputElement && field.type === 'checkbox') {
        if (!field.checked) addError(fieldWrap(field), MSG_GDPR, [field]);
        return;
      }
      if (!field.value.trim()) {
        addError(fieldWrap(field), MSG_REQUIRED, [field]);
      } else if (field instanceof HTMLInputElement && field.validity.typeMismatch) {
        addError(fieldWrap(field), MSG_EMAIL, [field]);
      }
    });

  const firstError = form.querySelector('.modal-field-error');
  if (firstError) {
    const firstInvalid = form.querySelector<HTMLElement>('[aria-invalid="true"]');
    firstInvalid?.focus({ preventScroll: true });
    fieldWrap(firstInvalid ?? (firstError.parentElement as HTMLElement)).scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
    return false;
  }
  return true;
}

/* --- Submit (fetch → Form.Taxi) -------------------------------------------- */

function wireSubmit(form: HTMLFormElement) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validate(form)) return;

    // Gewählte Coaching-Bereiche (sichtbares Multiselect) → Hidden-Feld.
    // Sichtbarkeit NUR über die eigenen Conditional-Blöcke bestimmen:
    // Choices.js setzt `hidden` auf das originale <select> SELBST
    // (WrappedElement.conceal) - ein pauschales closest('[hidden]') träfe
    // deshalb jedes initialisierte Select und das Feld käme bei Form.Taxi
    // immer leer an.
    const syncInput = form.querySelector<HTMLInputElement>('[data-choices-sync]');
    if (syncInput) {
      const visibleSelect = Array.from(
        form.querySelectorAll<HTMLSelectElement>('select[data-choices]'),
      ).find((sel) => !sel.closest('[data-conditional][hidden]'));
      syncInput.value = visibleSelect
        ? Array.from(visibleSelect.selectedOptions).map((o) => o.value).join(', ')
        : '';
    }

    const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');
    const label = button?.querySelector<HTMLElement>('[data-submit-label]');
    const idleText = label?.textContent ?? 'Senden';
    if (button) button.disabled = true;
    if (label) label.textContent = button?.dataset.wait ?? 'Bitte warten...';

    const root = form.closest<HTMLElement>('[data-modal]');
    const success = root?.querySelector<HTMLElement>('[data-form-success]');
    const fail = root?.querySelector<HTMLElement>('[data-form-fail]');
    fail?.setAttribute('hidden', '');

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) throw new Error(`Form endpoint responded ${res.status}`);
      form.setAttribute('hidden', '');
      // Die Modal-Hauptüberschrift ist ein Geschwister des Formulars (nicht in
      // ihm) und würde sonst über der Danke-Meldung stehen bleiben. Nach dem
      // Absenden soll nur noch die Erfolgsmeldung (eigenes „Vielen Dank!") zu
      // sehen sein.
      root?.querySelector('.modal__heading')?.setAttribute('hidden', '');
      if (success) {
        success.removeAttribute('hidden');
        success.focus();
      }
    } catch {
      if (fail) {
        fail.removeAttribute('hidden');
        fail.focus();
      }
    } finally {
      if (button) button.disabled = false;
      if (label) label.textContent = idleText;
    }
  });
}

document
  .querySelectorAll<HTMLFormElement>('[data-cta-form], [data-aio-form]')
  .forEach(wireSubmit);

// ?openModal=true öffnet das Anfrage-Modal direkt (Original-Verhalten).
// MUSS am Dateiende stehen: openModal() ruft ensureChoices(), das die
// Modul-Variable `choicesReady` liest. Früher lief dieser Block VOR deren
// `let`-Initialisierung → TDZ-ReferenceError, der Choices.js abbrach und das
// Multiselect als rohes <select> stehen ließ.
if (new URLSearchParams(window.location.search).get('openModal') === 'true') {
  openModal('cta');
}
