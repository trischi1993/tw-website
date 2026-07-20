import { useEffect, useState } from 'react';
import { useClient } from 'sanity';
import { usePresentationNavigate, usePresentationParams } from 'sanity/presentation';
import { Box, Button, Card, Flex, Label, Spinner, Stack, Text } from '@sanity/ui';
import { HomeIcon } from '@sanity/icons/Home';
import { DocumentIcon } from '@sanity/icons/Document';
import type { ComponentType } from 'react';

/**
 * Seiten-Wechsler für das Presentation-Tool (linke Spalte / „Navigator").
 *
 * Problem ohne diese Komponente: In Presentation kommt man nur über die
 * Website-Navigation in der Vorschau oder über die „Auf diesen Seiten
 * verwendet"-Hinweise auf andere Seiten – beides unintuitiv und nicht für
 * alle Seiten vorhanden. Hier gibt es stattdessen eine feste Liste ALLER
 * bearbeitbaren Seiten. Klick → Vorschau springt auf die Seite UND das
 * Formular rechts öffnet sofort das passende Dokument (ohne den Umweg über
 * die mainDocuments-Auflösung abzuwarten).
 *
 * Die feste Seite (Startseite) ist ein Singleton mit bekannter ID; die
 * „Weiteren Seiten" werden live aus dem Dataset geladen (inkl. Entwürfe, damit
 * neu angelegte Seiten sofort auftauchen).
 */

type PageLink = {
  key: string;
  title: string;
  href: string;
  doc: { type: string; id: string };
  icon: ComponentType;
};

// Startseiten je Sprache, feste IDs, Reihenfolge wie in der Studio-Navigation.
const FIXED_PAGES: PageLink[] = [
  { key: 'homePage-de', title: 'Startseite · DE', href: '/', doc: { type: 'homePage', id: 'homePage-de' }, icon: HomeIcon },
  { key: 'homePage-en', title: 'Startseite · EN', href: '/en/', doc: { type: 'homePage', id: 'homePage-en' }, icon: HomeIcon },
];

const PAGES_QUERY = `*[_type == "page" && defined(slug.current)]{ _id, title, "slug": slug.current, language } | order(language asc, title asc)`;

// drafts.<id> → <id>: Panes werden über die veröffentlichte ID adressiert
// (zeigt automatisch den Entwurf, falls vorhanden).
const publishedId = (id: string) => id.replace(/^drafts\./, '');

// Endende Slashes vereinheitlichen, damit der Abgleich mit der aktuellen
// Vorschau-URL unabhängig von trailingSlash funktioniert.
const normalizePath = (path?: string) => (path ? path.replace(/\/+$/, '') || '/' : '');

export default function PagesNavigator() {
  const client = useClient({ apiVersion: '2025-02-19' });
  const navigate = usePresentationNavigate();
  const params = usePresentationParams();
  const currentPath = normalizePath(params?.preview);

  const [pages, setPages] = useState<PageLink[] | null>(null);

  useEffect(() => {
    let active = true;

    const load = () =>
      client
        .withConfig({ perspective: 'drafts' })
        .fetch<Array<{ _id: string; title?: string; slug?: string; language?: string }>>(PAGES_QUERY)
        .then((rows) => {
          if (!active) return;
          setPages(
            rows.map((row) => {
              const lang = (row.language || 'de').toUpperCase();
              const href = row.language === 'en' ? `/en/${row.slug}/` : `/${row.slug}/`;
              return {
                key: row._id,
                title: `${row.title || row.slug || 'Seite'} · ${lang}`,
                href,
                doc: { type: 'page', id: publishedId(row._id) },
                icon: DocumentIcon,
              };
            }),
          );
        })
        .catch(() => {
          if (active) setPages([]);
        });

    load();

    // Live: neu angelegte oder umbenannte Seiten ohne Studio-Reload übernehmen.
    const subscription = client
      .listen(PAGES_QUERY, {}, { visibility: 'query' })
      .subscribe(() => load());

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [client]);

  const renderItem = (page: PageLink) => {
    const selected = currentPath === normalizePath(page.href);
    return (
      <Button
        key={page.key}
        mode="bleed"
        tone={selected ? 'primary' : 'default'}
        selected={selected}
        justify="flex-start"
        padding={3}
        radius={2}
        icon={page.icon}
        text={page.title}
        onClick={() => navigate(page.href, page.doc)}
      />
    );
  };

  return (
    <Card height="fill" tone="transparent" borderRight>
      <Stack space={4} padding={3}>
        <Stack space={2}>
          <Box paddingX={2} paddingTop={2}>
            <Label size={0} muted>
              Seiten
            </Label>
          </Box>
          <Stack space={1}>{FIXED_PAGES.map(renderItem)}</Stack>
        </Stack>

        <Stack space={2}>
          <Box paddingX={2}>
            <Label size={0} muted>
              Weitere Seiten
            </Label>
          </Box>
          {pages === null ? (
            <Flex padding={4} justify="center">
              <Spinner muted />
            </Flex>
          ) : pages.length === 0 ? (
            <Box padding={3}>
              <Text size={1} muted>
                Noch keine weiteren Seiten.
              </Text>
            </Box>
          ) : (
            <Stack space={1}>{pages.map(renderItem)}</Stack>
          )}
        </Stack>
      </Stack>
    </Card>
  );
}
