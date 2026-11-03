/* Нативная прокрутка для свайпа; автодвижение останавливается вне экрана и при взаимодействии. */
(() => {
  const section = document.querySelector('.concepts');
  if (!section) return;
  const viewport = section.querySelector('.concepts-viewport');
  const track = section.querySelector('.concepts-track');
  const original = section.querySelector('.concepts-set');
  const cards = [...original.querySelectorAll('.concept-card')];
  const toggle = section.querySelector('.concepts-toggle');
  const dialog = document.querySelector('.concept-dialog');
  const image = dialog.querySelector('.concept-dialog-image');
  const caption = dialog.querySelector('.concept-dialog-caption');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const clone = original.cloneNode(true);
  clone.setAttribute('aria-hidden', 'true');
  clone.querySelectorAll('button').forEach(b => b.tabIndex = -1);
  clone.querySelectorAll('img').forEach(i => { i.alt = ''; });
  track.append(clone);
  let period = original.getBoundingClientRect().width + 24;
  let position = 0, previous = 0, frame = 0, visible = false, hover = false;
  let touching = false, focused = false, paused = reduce.matches, resumeAt = 0;
  let current = 0, lastFocus = null;
  const label = () => { toggle.textContent = paused ? 'Продолжить' : 'Пауза'; toggle.setAttribute('aria-label', paused ? 'Продолжить движение ленты' : 'Приостановить движение ленты'); };
  const canMove = () => visible && !document.hidden && !paused && !reduce.matches && !hover && !touching && !focused && !dialog.open && performance.now() > resumeAt;
  const tick = now => {
    frame = 0;
    if (canMove()) {
      position = (position + Math.min(now - previous, 64) * .022) % period;
      viewport.scrollLeft = position;
    } else position = viewport.scrollLeft;
    previous = now;
    if (visible && !document.hidden) frame = requestAnimationFrame(tick);
  };
  const start = () => { if (!frame && visible && !document.hidden) { previous = performance.now(); frame = requestAnimationFrame(tick); } };
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) track.querySelectorAll('img').forEach(i => { i.loading = 'eager'; }); start(); }, { threshold: .05 }).observe(viewport);
  new ResizeObserver(() => { period = original.getBoundingClientRect().width + 24; position = viewport.scrollLeft; }).observe(original);
  document.addEventListener('visibilitychange', start);
  viewport.addEventListener('mouseenter', () => { hover = true; });
  viewport.addEventListener('mouseleave', () => { hover = false; });
  viewport.addEventListener('focusin', () => { focused = true; });
  viewport.addEventListener('focusout', e => { focused = viewport.contains(e.relatedTarget); });
  viewport.addEventListener('pointerdown', () => { touching = true; });
  window.addEventListener('pointerup', () => { touching = false; resumeAt = performance.now() + 2500; });
  window.addEventListener('pointercancel', () => { touching = false; resumeAt = performance.now() + 2500; });
  viewport.addEventListener('wheel', () => { resumeAt = performance.now() + 3000; }, { passive: true });
  viewport.addEventListener('keydown', e => {
    if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
    e.preventDefault(); resumeAt = performance.now() + 5000;
    viewport.scrollBy({ left: (e.key === 'ArrowRight' ? 1 : -1) * (cards[0].offsetWidth + 24), behavior: reduce.matches ? 'instant' : 'smooth' });
  });
  toggle.addEventListener('click', () => { paused = !paused; label(); });
  reduce.addEventListener('change', () => { paused = reduce.matches; label(); });
  label(); toggle.hidden = reduce.matches;
  reduce.addEventListener('change', () => { toggle.hidden = reduce.matches; });
  const show = n => {
    current = (n + cards.length) % cards.length;
    const src = cards[current].querySelector('img');
    image.src = src.src; image.alt = src.alt;
    caption.textContent = src.alt;
  };
  track.addEventListener('click', e => {
    const card = e.target.closest('.concept-card');
    if (!card) return;
    lastFocus = card; show(Number(card.dataset.concept));
    dialog.showModal(); document.body.style.overflow = 'hidden';
  });
  dialog.querySelector('.concept-dialog-close').addEventListener('click', () => dialog.close());
  dialog.querySelector('[data-step="-1"]').addEventListener('click', () => show(current - 1));
  dialog.querySelector('[data-step="1"]').addEventListener('click', () => show(current + 1));
  dialog.addEventListener('keydown', e => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); show(current + (e.key === 'ArrowRight' ? 1 : -1)); } });
  dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => { document.body.style.overflow = ''; resumeAt = performance.now() + 2500; if (lastFocus) lastFocus.focus({ preventScroll: true }); });
})();
