(() => {
  const mobile = matchMedia('(max-width: 800px)');
  const certificateGroups = [
    ['189:546', ['189:491', '189:492']],
    ['189:560', ['189:566', '189:567']],
  ];
  const main = document.querySelector('main');
  const findNode = id => document.querySelector(`[data-node-id="${id}"]`);
  function placeCertificates() {
    certificateGroups.forEach(([parentId, ids]) => {
      const parent = findNode(parentId);
      if (mobile.matches) parent.style.position = 'relative';
      ids.forEach(id => (mobile.matches ? parent : main).append(findNode(id)));
    });
  }
  mobile.addEventListener('change', placeCertificates);
  placeCertificates();
  const track = document.getElementById('concept-track');
  track.scrollLeft = Math.max(0, (2424 - innerWidth) / 2);
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const carousel = track.closest('section');
  let dragging = null;
  let autoplay;
  let visible = false;
  let hovering = false;
  function advance(direction) {
    const maximum = track.scrollWidth - track.clientWidth;
    const origin = track.getBoundingClientRect().left;
    const positions = [...new Set([0, ...[...track.children].map(card => Math.min(maximum, Math.round(card.getBoundingClientRect().left - origin + track.scrollLeft))), maximum])].sort((a, b) => a - b);
    const target = direction > 0
      ? positions.find(position => position > track.scrollLeft + 10) ?? 0
      : positions.reverse().find(position => position < track.scrollLeft - 10) ?? maximum;
    track.scrollTo({left: target, behavior: reducedMotion.matches ? 'instant' : 'smooth'});
  }
  function stopAutoplay() { clearTimeout(autoplay); }
  function startAutoplay() {
    stopAutoplay();
    if (!visible || hovering || dragging || document.hidden || reducedMotion.matches || carousel.querySelector(':focus-visible')) return;
    autoplay = setTimeout(() => { advance(1); startAutoplay(); }, 4000);
  }
  document.querySelectorAll('[data-direction]').forEach(button => {
    button.addEventListener('click', () => { advance(Number(button.dataset.direction)); startAutoplay(); });
  });
  carousel.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') { hovering = true; stopAutoplay(); } });
  carousel.addEventListener('pointerleave', () => { hovering = false; startAutoplay(); });
  carousel.addEventListener('focusin', stopAutoplay);
  carousel.addEventListener('focusout', () => setTimeout(startAutoplay, 0));
  track.addEventListener('pointerdown', event => {
    stopAutoplay();
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    dragging = {x: event.clientX, scroll: track.scrollLeft};
    track.setPointerCapture(event.pointerId);
    track.classList.add('is-dragging');
  });
  track.addEventListener('pointermove', event => {
    if (dragging) track.scrollLeft = dragging.scroll + dragging.x - event.clientX;
  });
  function endDrag() { dragging = null; track.classList.remove('is-dragging'); startAutoplay(); }
  track.addEventListener('pointerup', endDrag);
  track.addEventListener('pointercancel', endDrag);
  track.addEventListener('lostpointercapture', endDrag);
  track.addEventListener('dragstart', event => event.preventDefault());
  track.addEventListener('wheel', () => { stopAutoplay(); autoplay = setTimeout(startAutoplay, 4000); }, {passive: true});
  track.tabIndex = 0;
  track.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); advance(event.key === 'ArrowRight' ? 1 : -1); }
  });
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; startAutoplay(); }, {threshold: .2}).observe(track);
  document.addEventListener('visibilitychange', startAutoplay);
  reducedMotion.addEventListener('change', startAutoplay);
  const themeButton = document.getElementById('theme-toggle');
  themeButton.addEventListener('click', () => {
    const dark = document.documentElement.dataset.theme !== 'dark';
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    themeButton.setAttribute('aria-pressed', String(dark));
    themeButton.setAttribute('aria-label', dark ? 'Включить светлую тему' : 'Включить тёмную тему');
  });
  document.addEventListener('keydown', event => {
    if (event.key.toLowerCase() === 't' && !event.metaKey && !event.ctrlKey && !event.altKey && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) {
      document.querySelector('.home-telegram').click();
    }
  });
})();
