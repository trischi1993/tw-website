import type { FieldProps } from 'sanity';
import { set, unset, useClient, useFormValue, getPublishedId, getValueAtPath } from 'sanity';
import { Box, Flex, Text, Tooltip } from '@sanity/ui';
import { HelpCircleIcon } from '@sanity/icons/HelpCircle';
import { RestoreIcon } from '@sanity/icons/Restore';

/**
 * Globale Feld-Komponente (Studio `form.components.field`). Drei Dinge fürs
 * kompakte remarkable-Gefühl:
 *
 *  1. Feld-Titel klein rendern (`Text size={1}`) statt Default - dichter.
 *  2. Beschreibung als „?"-Icon-Tooltip neben dem Titel statt als grauer
 *     Fließtext unter dem Titel (spart eine Textzeile pro Feld).
 *  3. Restore-Icon neben dem „?": setzt das Feld auf den zuletzt PUBLIZIERTEN
 *     Wert zurück (nicht „leeren"). Erscheint nur bei primitiven Feldern, die
 *     vom publizierten Stand abweichen (`props.changed`). Objekte/Arrays werden
 *     nie zurückgesetzt (das würde ganze Blöcke löschen).
 *
 * Perf: der publizierte Wert wird LAZY beim Klick geholt (useClient-Fetch), NICHT
 * über ein per-Feld-`useEditState` - das würde bei jedem Tastenanschlag alle
 * Felder neu rendern und den Live-Editing-Flow stören. `changed` liefert Sanity
 * bereits ohne Zusatz-Abo.
 *
 * `renderDefault` behält die komplette Feld-Chrome (Validierung, Pflicht-Stern,
 * Presence, Feld-Aktionen); wir reichern nur den Titel an und unterdrücken die
 * Fließtext-Beschreibung. Sanity rendert `title` als Children eines `<Text>`
 * (verifiziert) → ReactNode zur Laufzeit sicher; TS-Typ ist `string`, daher Cast.
 */
export function DescriptionTooltipField(props: FieldProps) {
  const { title, description, schemaType, inputProps, changed, path } = props;

  const client = useClient({ apiVersion: '2024-10-01' });
  const docId = useFormValue(['_id']) as string | undefined;
  const docType = useFormValue(['_type']) as string | undefined;

  const isPrimitive =
    schemaType.jsonType === 'string' ||
    schemaType.jsonType === 'number' ||
    schemaType.jsonType === 'boolean';
  const canRevert = isPrimitive && !inputProps.readOnly && !!changed;

  // Nichts anzureichern → Default (kein Wrapper-Overhead für simple Felder).
  if (!description && !canRevert) return props.renderDefault(props);

  const handleRestore = async () => {
    // Publizierten Stand holen und genau dieses Feld darauf zurücksetzen.
    // Kein publizierter Wert (nie veröffentlicht) → unset (der einzig sinnvolle
    // „vorherige" Zustand).
    try {
      if (!docId) return;
      const published = await client.getDocument(getPublishedId(docId));
      const value = published ? getValueAtPath(published, path) : undefined;
      inputProps.onChange(value === undefined ? unset() : set(value));
    } catch {
      /* fail-safe: im Zweifel nichts tun */
    }
  };

  const iconStyle = {
    display: 'inline-flex',
    cursor: 'pointer',
    opacity: 0.5,
    border: 0,
    background: 'none',
    padding: 0,
    color: 'inherit',
  } as const;

  const titleNode = (
    <Flex as="span" align="center" gap={2}>
      <Text as="span" size={1} weight="semibold">
        {title}
      </Text>
      {description && (
        <Tooltip
          content={
            <Box padding={2} style={{ maxWidth: 280 }}>
              <Text size={1}>{description}</Text>
            </Box>
          }
          placement="top"
          fallbackPlacements={['bottom']}
          portal
        >
          <span aria-label={description} tabIndex={0} style={{ ...iconStyle, cursor: 'help' }}>
            <HelpCircleIcon />
          </span>
        </Tooltip>
      )}
      {canRevert && (
        // Deutlicher Abstand zum „?"-Icon (klebt sonst daran).
        <button
          type="button"
          onClick={handleRestore}
          aria-label="Auf zuletzt veröffentlichten Wert zurücksetzen"
          title="Auf zuletzt veröffentlichten Wert zurücksetzen"
          style={{ ...iconStyle, marginLeft: 8 }}
        >
          <RestoreIcon />
        </button>
      )}
    </Flex>
  );

  return props.renderDefault({
    ...props,
    title: titleNode as unknown as string,
    description: undefined,
  });
}
