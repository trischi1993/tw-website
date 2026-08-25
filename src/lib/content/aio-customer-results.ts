import {
  AIO_CUSTOMER_RESULTS,
  AIO_CUSTOMER_RESULT_KEYS,
} from '../../../shared/aio-customer-results.mjs';
import type {
  AioCustomerResultCardCopy,
  AioCustomerResultKey,
  AioCustomerResultsContent,
  AioGrowthStageCopy,
  AioResultProofCopy,
} from './types';

export const DEFAULT_AIO_CUSTOMER_RESULTS =
  AIO_CUSTOMER_RESULTS as AioCustomerResultsContent;

export const AIO_CUSTOMER_KEYS =
  AIO_CUSTOMER_RESULT_KEYS as AioCustomerResultKey[];

const text = (value: unknown, fallback: string) =>
  typeof value === 'string' ? value : fallback;

function proof(raw: any, fallback: AioResultProofCopy): AioResultProofCopy {
  return {
    badge: text(raw?.badge, fallback.badge),
    value: text(raw?.value, fallback.value),
    description: text(raw?.description, fallback.description),
  };
}

function card(
  raw: any,
  fallback: AioCustomerResultCardCopy,
): AioCustomerResultCardCopy {
  return {
    source: text(raw?.source, fallback.source),
    value: text(raw?.value, fallback.value),
    label: text(raw?.label, fallback.label),
    badges: Array.isArray(raw?.badges)
      ? raw.badges.filter((badge: unknown): badge is string => typeof badge === 'string')
      : fallback.badges,
  };
}

function growthStage(raw: any, fallback: AioGrowthStageCopy): AioGrowthStageCopy {
  return {
    label: text(raw?.label, fallback.label),
    heading: text(raw?.heading, fallback.heading),
    text: text(raw?.text, fallback.text),
    signal: text(raw?.signal, fallback.signal),
  };
}

/**
 * Legt unvollstaendige Sanity-Daten defensiv auf den vollstaendigen aktuellen
 * Live-Stand. Dadurch bleiben neue Felder beim ersten Rollout und waehrend
 * Draft-Bearbeitungen immer renderbar.
 */
export function mapAioCustomerResults(raw: any): AioCustomerResultsContent {
  const fallback = DEFAULT_AIO_CUSTOMER_RESULTS;

  return {
    eyebrow: text(raw?.eyebrow, fallback.eyebrow),
    heading: text(raw?.heading, fallback.heading),
    intro: text(raw?.intro, fallback.intro),
    caseLabel: text(raw?.caseLabel, fallback.caseLabel),
    caseIdentity: text(raw?.caseIdentity, fallback.caseIdentity),
    caseHeadline: text(raw?.caseHeadline, fallback.caseHeadline),
    durationBadge: text(raw?.durationBadge, fallback.durationBadge),
    proofFollowers: proof(raw?.proofFollowers, fallback.proofFollowers),
    proofViews: proof(raw?.proofViews, fallback.proofViews),
    proofLeads: proof(raw?.proofLeads, fallback.proofLeads),
    comparisonValue: text(raw?.comparisonValue, fallback.comparisonValue),
    comparisonText: text(raw?.comparisonText, fallback.comparisonText),
    beforeLabel: text(raw?.beforeLabel, fallback.beforeLabel),
    afterLabel: text(raw?.afterLabel, fallback.afterLabel),
    moreHeading: text(raw?.moreHeading, fallback.moreHeading),
    scrollLabel: text(raw?.scrollLabel, fallback.scrollLabel),
    customers: Object.fromEntries(
      AIO_CUSTOMER_KEYS.map((key) => [
        key,
        card(raw?.customers?.[key], fallback.customers[key]),
      ]),
    ) as AioCustomerResultsContent['customers'],
    closingIntro: text(raw?.closingIntro, fallback.closingIntro),
    closingHeading: text(raw?.closingHeading, fallback.closingHeading),
    closingHighlight: text(raw?.closingHighlight, fallback.closingHighlight),
    closingSource: text(raw?.closingSource, fallback.closingSource),
    closingText: text(raw?.closingText, fallback.closingText),
    closingCta: text(raw?.closingCta, fallback.closingCta),
    growthSystem: {
      heading: text(raw?.growthSystem?.heading, fallback.growthSystem.heading),
      status: text(raw?.growthSystem?.status, fallback.growthSystem.status),
      reach: growthStage(raw?.growthSystem?.reach, fallback.growthSystem.reach),
      community: growthStage(
        raw?.growthSystem?.community,
        fallback.growthSystem.community,
      ),
      customers: growthStage(
        raw?.growthSystem?.customers,
        fallback.growthSystem.customers,
      ),
    },
  };
}
