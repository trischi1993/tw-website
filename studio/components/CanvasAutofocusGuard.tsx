import { useEffect } from 'react';
import { warmHoverBridge } from './inputs/hover-bridge';

function isFieldElement(value: unknown): boolean {
  const element = value as HTMLElement | null;
  if (!element?.tagName) return false;
  const tag = element.tagName.toUpperCase();
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  return !!(
    element.isContentEditable ||
    element.closest?.('[contenteditable="true"], [role="textbox"]')
  );
}

/** Keep a canvas click from programmatically focusing the matching Studio field. */
export function CanvasAutofocusGuard() {
  useEffect(() => {
    warmHoverBridge();
    let armedUntil = 0;
    let studioPointerAt = 0;

    const onCanvasSelect = () => {
      armedUntil = Date.now() + 1200;
    };
    const onStudioPointer = () => {
      studioPointerAt = Date.now();
    };

    window.addEventListener('upgreight:canvas-select', onCanvasSelect);
    window.addEventListener('pointerdown', onStudioPointer, true);

    const nativeFocus = HTMLElement.prototype.focus;
    HTMLElement.prototype.focus = function (options?: FocusOptions): void {
      const now = Date.now();
      if (now <= armedUntil && now - studioPointerAt > 250 && isFieldElement(this)) return;
      nativeFocus.call(this, options);
    };

    return () => {
      HTMLElement.prototype.focus = nativeFocus;
      window.removeEventListener('upgreight:canvas-select', onCanvasSelect);
      window.removeEventListener('pointerdown', onStudioPointer, true);
    };
  }, []);

  return null;
}
