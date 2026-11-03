/* Ручной слайдер: кнопки, стрелки клавиатуры и свайп; без автопрокрутки и увеличения при наведении. */
(() => {
  const section = document.querySelector('.concepts');
  if (!section) return;
  const works = [
    ['assets/concepts/reading-full.webp', 'Читалка'],
    ['assets/concepts/login-full.webp', 'Книжный дневник · Вход'],
    ['assets/concepts/formula-full.webp', 'Формула-1 · Поиск попутчика'],
    ['assets/concepts/travel-full.webp', 'Дневник путешествий']
  ];
  const picture = section.querySelector('.concept-image');
  const caption = section.querySelector('.concept-caption');
  const counter = section.querySelector('.concept-counter');
  const open = section.querySelector('.concept-open');
  const dialog = document.querySelector('.concept-dialog');
  const big = dialog.querySelector('.concept-dialog-image');
  let index = 0, start = null, swiped = false;
  const show = n => {
    index = (n + works.length) % works.length;
    const [src, title] = works[index];
    picture.src = src; picture.alt = title;
    caption.textContent = title; counter.textContent = `${index + 1} / ${works.length}`;
    open.setAttribute('aria-label', `Открыть крупно: ${title}`);
    if (dialog.open) { big.src = src; big.alt = title; dialog.querySelector('.concept-dialog-caption').textContent = title; }
  };
  section.querySelectorAll('[data-step]').forEach(b => b.addEventListener('click', () => show(index + Number(b.dataset.step))));
  section.addEventListener('keydown', e => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); show(index + (e.key === 'ArrowRight' ? 1 : -1)); } });
  const slide = section.querySelector('.concept-slide');
  slide.addEventListener('pointerdown', e => { start = { x: e.clientX, y: e.clientY }; swiped = false; });
  slide.addEventListener('pointerup', e => {
    if (!start) return;
    const dx = e.clientX - start.x, dy = e.clientY - start.y;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) { swiped = true; show(index + (dx < 0 ? 1 : -1)); }
    start = null;
  });
  slide.addEventListener('pointercancel', () => { start = null; });
  open.addEventListener('click', e => {
    if (swiped) { e.preventDefault(); swiped = false; return; }
    big.src = works[index][0]; big.alt = works[index][1]; dialog.querySelector('.concept-dialog-caption').textContent = works[index][1];
    dialog.showModal(); document.body.style.overflow = 'hidden';
  });
  dialog.querySelector('.concept-dialog-close').addEventListener('click', () => dialog.close());
  dialog.querySelectorAll('[data-step]').forEach(b => b.addEventListener('click', () => show(index + Number(b.dataset.step))));
  dialog.addEventListener('keydown', e => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); show(index + (e.key === 'ArrowRight' ? 1 : -1)); } });
  dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => { document.body.style.overflow = ''; open.focus({ preventScroll: true }); });
})();
