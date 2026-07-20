/**
 * Wiederverwendbarer String-Input als Reihe kleiner Segmented-Buttons statt
 * Radio/Dropdown. Einmal ins Template, jede Section/jedes Text-Element erbt ihn.
 * Look 1:1 an flowtricks/remarkable (PreviewSelect): kleine Buttons
 * (`fontSize 1`, `padding 2`, `radius 2`), `Flex` mit `gap 1` und `wrap` -
 * dicht, wenig Scrollen.
 *
 *  - Optionen aus `options.list`; jedes Item darf `description` tragen → Tooltip
 *    pro Option (Beschreibung im Tooltip statt als Fließtext unter dem Feld).
 *  - DEFAULT-SELECTED: ist das Feld noch leer (kein expliziter Wert), wird der
 *    `initialValue` des Schemas als ausgewählt angezeigt - der effektive Default
 *    ist sofort sichtbar (matcht das, was das Frontend für „unset" rendert).
 *  - Auswahl per Klick (set/unset). Erneuter Klick auf den EXPLIZIT gesetzten
 *    Wert hebt ihn auf.
 *  - Hover über eine Option zeigt die Wirkung sofort in der Vorschau (hover-
 *    bridge → comlink → Island-Flip) - für Section-Controls (Farbton/Abstände/
 *    Ausrichtung) UND Per-Element-Controls (Größe/Farbe/Umbruch/Abstand unten:
 *    der Flip trifft das Element über data-el-path). Felder ohne visuelle Wirkung
 *    (level = nur SEO-Tag) sind ein No-op (fail-open); dort greift der Klick.
 *
 * Fällt die Optionsliste aus, rendert der Standard-Input (nie ein unbenutzbares Feld).
 */
import { useEffect, useRef, type MouseEvent } from 'react';
import { set, unset, type StringInputProps } from 'sanity';
import { Box, Button, Flex, Text, Tooltip } from '@sanity/ui';
import { sendHover, endHover, commitHover, warmHoverBridge } from './hover-bridge';

export interface SegmentedOption {
  title: string;
  value: string;
  description?: string;
}

export function SegmentedInput(props: StringInputProps) {
  const { value, onChange, schemaType, path, readOnly } = props;
  const options = (schemaType.options?.list ?? []) as SegmentedOption[];
  const lastHover = useRef<string | null>(null);

  // Hover-Kanal vorwärmen, damit der erste Hover sofort sitzt (siehe hover-bridge).
  useEffect(() => {
    warmHoverBridge();
  }, []);

  const usable =
    options.length > 0 &&
    options.every((o) => o && typeof o === 'object' && typeof o.value === 'string');
  if (!usable) return props.renderDefault(props);

  // Leeres Feld → Schema-Default als ausgewählt zeigen (remarkable-Muster).
  const defaultValue = typeof schemaType.initialValue === 'string' ? schemaType.initialValue : undefined;
  const active = value ?? defaultValue;

  const pick = (v: string) => {
    if (readOnly) return;
    const unsetting = v === value;
    onChange(unsetting ? unset() : set(v));
    // Beim SETZEN zeigt der Hover-Flip bereits v → sticky machen, damit der Wert
    // sofort steht und nicht bis zur Live-Query (bei unset-Feldern ~2-3 s, s.
    // hover-bridge.commitHover) auf den alten zurückspringt. Beim Zurücksetzen
    // NICHT sticky (der Default-Look ist ohne Token-Map nicht bekannt) → Mouse-out
    // revertiert normal, die Live-Query korrigiert.
    if (!unsetting) commitHover();
  };

  const onMouseOver = (e: MouseEvent<HTMLElement>) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>('[data-seg-value]');
    const v = el?.getAttribute('data-seg-value');
    if (v && v !== lastHover.current) {
      lastHover.current = v;
      sendHover(path, v);
    }
  };

  const stopHover = () => {
    if (lastHover.current !== null) {
      lastHover.current = null;
      endHover();
    }
  };

  return (
    <Flex gap={1} wrap="wrap" onMouseOver={onMouseOver} onMouseLeave={stopHover}>
      {options.map((opt) => {
        const selected = opt.value === active;
        return (
          <Tooltip
            key={opt.value}
            disabled={!opt.description}
            placement="top"
            portal
            content={
              <Box padding={2} style={{ maxWidth: 260 }}>
                <Text size={1}>{opt.description}</Text>
              </Box>
            }
          >
            <Box data-seg-value={opt.value}>
              <Button
                text={opt.title}
                fontSize={1}
                padding={2}
                radius={2}
                mode={selected ? 'default' : 'ghost'}
                tone={selected ? 'primary' : 'default'}
                disabled={readOnly}
                onClick={() => pick(opt.value)}
              />
            </Box>
          </Tooltip>
        );
      })}
    </Flex>
  );
}
