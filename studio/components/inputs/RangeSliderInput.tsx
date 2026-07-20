/**
 * Kompakter Zahlen-Regler (Phase B, remarkable-Angleichung). Ersetzt das nackte
 * Number-Feld durch einen nativen Range-Slider mit Wert-Anzeige + optionalem
 * „Auto“-Reset - für token-nahe Freiform-Werte, die bewusst KEIN Token sind:
 * die Lese-Breite (max-width in `ch`, Measure). Mandat erlaubt `ch` frei
 * (relative Zeilenlänge, kein Token-Bruch).
 *
 * Optionen kommen aus `schemaType.options`: { min, max, step, suffix,
 * allowUnset, unsetLabel }. Geschrieben wird beim LOSLASSEN (nicht pro Tick),
 * damit ein Drag nicht dutzende Patches auslöst; die Live-Vorschau aktualisiert
 * dann über usePresentationQuery. Fehlen min/max, rendert der Standard-Input -
 * nie ein unbenutzbares Feld. Die on-Canvas-Resizer-Variante (buttery, pro
 * Pixel) kommt in Phase c; dieser Input bleibt der Studio-Formular-Weg.
 */
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { set, unset, type NumberInputProps } from 'sanity';
import { Button, Card, Flex, Text } from '@sanity/ui';

interface RangeOptions {
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  allowUnset?: boolean;
  unsetLabel?: string;
}

export function RangeSliderInput(props: NumberInputProps) {
  const { value, onChange, schemaType, readOnly, elementProps } = props;
  const o = (schemaType.options ?? {}) as RangeOptions;

  // Ohne saubere Bounds: Standard-Input (fail-safe).
  const hasBounds = typeof o.min === 'number' && typeof o.max === 'number';

  const min = o.min ?? 0;
  const max = o.max ?? 100;
  const step = o.step ?? 1;
  const suffix = o.suffix ?? '';
  const allowUnset = o.allowUnset ?? false;
  const unsetLabel = o.unsetLabel ?? 'Auto';

  const [drag, setDrag] = useState<number | null>(null);
  const dragRef = useRef<number | null>(null);

  // Externer Commit (Wert wechselt) → lokalen Drag-Zustand verwerfen.
  useEffect(() => {
    setDrag(null);
    dragRef.current = null;
  }, [value]);

  const commit = useCallback(() => {
    const n = dragRef.current;
    if (typeof n === 'number') onChange(set(n));
  }, [onChange]);

  const onInput = useCallback((e: FormEvent<HTMLInputElement>) => {
    const n = Number(e.currentTarget.value);
    if (Number.isNaN(n)) return;
    dragRef.current = n;
    setDrag(n);
  }, []);

  // Loslassen kann neben dem Thumb passieren → einmaliger window-pointerup.
  const onPointerDown = useCallback(() => {
    const up = () => {
      commit();
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointerup', up);
  }, [commit]);

  if (!hasBounds) return props.renderDefault(props);

  const current = drag ?? (typeof value === 'number' ? value : undefined);
  const thumb = current ?? Math.round((min + max) / 2);
  const isSet = typeof current === 'number';

  return (
    <Card padding={3} radius={2} border tone="transparent">
      <Flex align="center" justify="space-between" style={{ marginBottom: 8 }}>
        <Text size={1} weight="semibold" muted={!isSet}>
          {isSet ? `${current}${suffix}` : unsetLabel}
        </Text>
        {allowUnset && isSet && !readOnly && (
          <Button
            text={unsetLabel}
            mode="bleed"
            fontSize={1}
            padding={2}
            onClick={() => onChange(unset())}
          />
        )}
      </Flex>
      <input
        {...(elementProps as React.InputHTMLAttributes<HTMLInputElement>)}
        type="range"
        min={min}
        max={max}
        step={step}
        value={thumb}
        disabled={readOnly}
        onInput={onInput}
        onPointerDown={onPointerDown}
        onKeyUp={commit}
        style={{ width: '100%', accentColor: 'var(--card-focus-ring-color)' }}
      />
      <Flex justify="space-between" style={{ marginTop: 4 }}>
        <Text size={0} muted>{`${min}${suffix}`}</Text>
        <Text size={0} muted>{`${max}${suffix}`}</Text>
      </Flex>
    </Card>
  );
}
