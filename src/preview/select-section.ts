/**
 * Selektiert einen Abschnitt auf dem Canvas anhand seines `_key` - das Muster
 * aus flowtricks/remarkable (canvasSelect.ts), auf unser `data-section-key`
 * angepasst.
 *
 * Eine optimistische Mutation braucht ein, zwei Frames bis sie gemalt ist, also
 * pollen wir kurz nach dem Element und spielen dann eine Hover→Klick-Geste
 * darauf ab - dieselbe Geste wie ein echter Klick. Das zeigt Sanitys
 * Overlay-Ring und richtet die Selektion (auch die der InsertPalette) auf das
 * frische Element. Reines DOM; nur im Vorschau-Build importiert.
 *
 * Das synthetische mouseover/enter schiebt das Element auf den internen
 * Hover-Stack des Overlay-Controllers; weil der echte Cursor nie eintrat, feuert
 * der Browser kein passendes mouseleave. Wir feuern es selbst direkt nach dem
 * Klick, damit der Phantom-Eintrag wieder herausfällt - die Selektion (rides
 * `element/click`) bleibt davon unberührt.
 */
export function selectElementByKey(key: string): void {
  let tries = 0;

  const tick = () => {
    const suffix = `[_key=="${key}"]`;
    const el = Array.from(
      document.querySelectorAll<HTMLElement>('[data-el-path], [data-section-key]'),
    ).find(
      (node) =>
        node.getAttribute('data-el-path')?.endsWith(suffix) ||
        node.getAttribute('data-section-key') === key,
    );
    if (el) {
      el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      const rect = el.getBoundingClientRect();
      const base: MouseEventInit = {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: rect.left + Math.min(rect.width / 2, 40),
        clientY: rect.top + Math.min(rect.height / 2, 20),
      };
      el.dispatchEvent(new MouseEvent('mouseover', base));
      el.dispatchEvent(new MouseEvent('mouseenter', { ...base, bubbles: false }));
      el.dispatchEvent(new MouseEvent('mousemove', base));
      el.dispatchEvent(new MouseEvent('mousedown', base));
      el.dispatchEvent(new MouseEvent('mouseup', base));
      el.dispatchEvent(new MouseEvent('click', base));
      el.dispatchEvent(new MouseEvent('mouseleave', base));
      return;
    }
    if (tries++ < 40) requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
}

export const selectSectionByKey = selectElementByKey;
