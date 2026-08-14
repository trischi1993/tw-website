const mobileBenefitsQuery = window.matchMedia('(max-width: 767px)');
const benefitSelector = '[data-ebook-mobile-benefit]';

document.querySelectorAll<HTMLElement>('.ebook-trust').forEach((trust) => {
  if (!mobileBenefitsQuery.matches || !('IntersectionObserver' in window)) {
    trust.classList.add('is-in-view');
    return;
  }

  new IntersectionObserver(
    ([entry]) => trust.classList.toggle('is-in-view', Boolean(entry?.isIntersecting)),
    { rootMargin: '120px 0px', threshold: 0 },
  ).observe(trust);
});

const clearActiveBenefit = () => {
  document.querySelectorAll<HTMLElement>(benefitSelector).forEach((benefit) => {
    benefit.classList.remove('is-mobile-active');
  });
};

document.addEventListener('click', (event) => {
  if (!mobileBenefitsQuery.matches || !(event.target instanceof Element)) return;

  const benefit = event.target.closest<HTMLElement>(benefitSelector);
  const wasActive = benefit?.classList.contains('is-mobile-active') ?? false;

  clearActiveBenefit();
  if (benefit && !wasActive) benefit.classList.add('is-mobile-active');
});

export {};
