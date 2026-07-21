import type { SectionText } from '../../lib/content/types';
import { sectionShellProps } from '../../lib/content/sections';
import EyebrowElement from './EyebrowElement';
import HeadingElement from './HeadingElement';
import ParagraphElement from './ParagraphElement';
import CtaElement from './CtaElement';
import type { EditAttr } from './SectionsList';

/**
 * Text-Abschnitt: eine `content`-Liste aus Blöcken (Überzeile / Überschrift /
 * Absatz / CTA), in Reihenfolge gerendert. Jeder Block ist im Canvas anklickbar und
 * einzeln steuerbar; die Section liefert nur die Hülle (Farbton, Ausrichtung,
 * Abstände, volle Höhe) via sectionShellProps. Trägt eine `id`, wenn ein Anker
 * gesetzt ist (#-Sprunglinks). Statisch in Prod (null React-JS), hydriert nur in
 * der Live-Vorschau-Island.
 */
export default function TextSection({
  section,
  edit,
}: {
  section: SectionText;
  edit?: EditAttr;
}) {
  const { _key, anchor, content = [] } = section;
  const shell = sectionShellProps(section);
  const path = `sections[_key=="${_key}"]`;

  return (
    <section
      id={anchor || undefined}
      className={shell.className}
      style={shell.style}
      data-section-key={edit ? _key : undefined}
      {...edit?.(path)}
    >
      <div className="container">
        <div className="section__content">
          {content.map((el) => {
            const elPath = `${path}.content[_key=="${el._key}"]`;
            switch (el._type) {
              case 'textEyebrow':
                return <EyebrowElement key={el._key} eyebrow={el} edit={edit} path={elPath} />;
              case 'textHeading':
                return <HeadingElement key={el._key} heading={el} edit={edit} path={elPath} />;
              case 'textParagraph':
                return <ParagraphElement key={el._key} paragraph={el} edit={edit} path={elPath} />;
              case 'cta':
                return <CtaElement key={el._key} cta={el} edit={edit} path={elPath} />;
              default:
                return null;
            }
          })}
        </div>
      </div>
    </section>
  );
}
