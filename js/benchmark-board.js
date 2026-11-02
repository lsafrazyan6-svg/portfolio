/* Pan/zoom board: pointer dragging, two-finger pinch, wheel and keyboard. */
(() => {
  const root = document.querySelector('[data-benchmark-board]');
  if (!root) return;
  const viewport = root.querySelector('.benchmark-viewport');
  const img = root.querySelector('.benchmark-content');
  const output = root.querySelector('output');
  const pointers = new Map();
  let scale = 1, x = 0, y = 0, fitScale = 1, last = null;
  const bounds = () => viewport.getBoundingClientRect();
  const local = e => { const r = bounds(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  const paint = () => {
    img.style.transform = `translate(${x}px,${y}px) scale(${scale})`;
    output.value = `${Math.round(scale * 100)}%`;
    root.querySelector('[data-board-out]').disabled = scale <= fitScale * .5 + .0001;
    root.querySelector('[data-board-in]').disabled = scale >= 2;
  };
  const zoom = (next, point) => {
    const value = Math.min(2, Math.max(fitScale * .5, next));
    const k = value / scale;
    x = point.x - (point.x - x) * k;
    y = point.y - (point.y - y) * k;
    scale = value; paint();
  };
  const center = () => ({ x: viewport.clientWidth / 2, y: viewport.clientHeight / 2 });
  const fit = () => {
    if (!img.naturalWidth) return;
    fitScale = Math.min((viewport.clientWidth - 64) / img.naturalWidth, (viewport.clientHeight - 64) / img.naturalHeight);
    scale = fitScale; x = (viewport.clientWidth - img.naturalWidth * scale) / 2;
    y = (viewport.clientHeight - img.naturalHeight * scale) / 2; paint();
  };
  const gesture = () => {
    const ps = [...pointers.values()];
    if (!ps.length) return null;
    if (ps.length === 1) return { point: ps[0], distance: 0 };
    return { point: { x: (ps[0].x + ps[1].x) / 2, y: (ps[0].y + ps[1].y) / 2 }, distance: Math.hypot(ps[1].x - ps[0].x, ps[1].y - ps[0].y) };
  };
  viewport.addEventListener('pointerdown', e => {
    if (e.button !== 0) return;
    viewport.focus({ preventScroll: true }); viewport.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, local(e)); last = gesture(); viewport.classList.add('is-panning');
  });
  viewport.addEventListener('pointermove', e => {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, local(e)); const next = gesture();
    if (last && next) {
      x += next.point.x - last.point.x; y += next.point.y - last.point.y;
      if (next.distance && last.distance) zoom(scale * next.distance / last.distance, next.point);
      else paint();
    }
    last = next;
  });
  const release = e => { pointers.delete(e.pointerId); last = gesture(); if (!pointers.size) viewport.classList.remove('is-panning'); };
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(name => viewport.addEventListener(name, release));
  viewport.addEventListener('wheel', e => {
    e.preventDefault();
    zoom(scale * Math.exp(-e.deltaY * (e.deltaMode === 1 ? .04 : .002)), local(e));
  }, { passive: false });
  viewport.addEventListener('dblclick', e => zoom(scale * 1.6, local(e)));
  viewport.addEventListener('keydown', e => {
    if (['+', '=', '-', '0', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) e.preventDefault();
    if (e.key === '+' || e.key === '=') zoom(scale * 1.3, center());
    if (e.key === '-') zoom(scale / 1.3, center());
    if (e.key === '0') fit();
    if (e.key === 'ArrowLeft') x += 40;
    if (e.key === 'ArrowRight') x -= 40;
    if (e.key === 'ArrowUp') y += 40;
    if (e.key === 'ArrowDown') y -= 40;
    paint();
  });
  root.querySelector('[data-board-in]').addEventListener('click', () => zoom(scale * 1.4, center()));
  root.querySelector('[data-board-out]').addEventListener('click', () => zoom(scale / 1.4, center()));
  root.querySelector('[data-board-fit]').addEventListener('click', fit);
  img.addEventListener('load', fit);
  if (img.complete) fit();
  new ResizeObserver(fit).observe(viewport);
})();
