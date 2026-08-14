const mobileBenefitsQuery = window.matchMedia('(max-width: 767px)');
const benefitSelector = '[data-ebook-mobile-benefit]';

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
