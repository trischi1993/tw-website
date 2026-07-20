import type { ComponentType } from 'react';
import { CATEGORY_COLOR, type BlockCategory } from '../../schemas/blocks';

/**
 * Wickelt das Icon eines Block-Typs und setzt einen kleinen farbigen Punkt
 * (grün = Section, orange = Component) als Kategorie-Signal. Erscheint überall,
 * wo Sanity `schemaType.icon` rendert - insbesondere im nativen Insert-Menü des
 * „Abschnitte“-Arrays (options.insertMenu).
 */
export function categoryIcon(Base: ComponentType, category: BlockCategory): ComponentType {
  return function CategoryIcon() {
    return (
      <span style={{ position: 'relative', display: 'inline-flex' }}>
        <Base />
        <span
          aria-hidden
          style={{
            position: 'absolute',
            right: -2,
            bottom: -2,
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: CATEGORY_COLOR[category],
            boxShadow: '0 0 0 1.5px var(--card-bg-color, transparent)',
          }}
        />
      </span>
    );
  };
}
