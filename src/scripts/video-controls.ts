/* Direkte HTML5-Video-Steuerung ohne GSAP. Das sichtbare AIO-Hero-Video
   bleibt damit vom ersten Paint an bedienbar, ohne das deutlich groessere
   Widget-/Motion-Paket in der kritischen Startphase laden zu muessen. */

function syncMuteIcons(controls: HTMLElement, muted: boolean): void {
  controls.querySelectorAll<SVGElement>('[data-icon]').forEach((icon) => {
    const isMutedIcon = icon.getAttribute('data-icon') === 'muted';
    icon.style.display = isMutedIcon === muted ? '' : 'none';
  });
}

function handleVideoAction(btn: HTMLElement): void {
  const controls = btn.closest<HTMLElement>('[data-video-controls]');
  const video = controls?.parentElement?.querySelector<HTMLVideoElement>('[data-video-player] video');
  if (!controls || !video) return;

  if (btn.dataset.action === 'toggle-mute') {
    const nowMuted = !video.muted;
    video.muted = nowMuted;
    controls.dataset.muted = nowMuted ? '1' : '0';
    syncMuteIcons(controls, nowMuted);
    void video.play().catch(() => undefined);
  } else if (btn.dataset.action === 'replay') {
    video.muted = false;
    video.currentTime = 0;
    controls.dataset.muted = '0';
    syncMuteIcons(controls, false);
    void video.play().catch(() => undefined);
  }
}

document.addEventListener('click', (event) => {
  const target = event.target as Element | null;
  const action = target?.closest<HTMLElement>('[data-video-controls] [data-action]');
  if (action) handleVideoAction(action);
});

export {};
