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
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let rendered = null, animation = 0, frameTime = 0;
  const draw = time => {
    const dt = Math.min(40, frameTime ? time - frameTime : 16.7);
    frameTime = time;
    const alpha = 1 - Math.exp(-dt / 55);
    rendered.x += (x - rendered.x) * alpha;
    rendered.y += (y - rendered.y) * alpha;
    rendered.scale += (scale - rendered.scale) * alpha;
    const settled = Math.abs(rendered.x-x) < .1 && Math.abs(rendered.y-y) < .1 && Math.abs(rendered.scale-scale) < .00005;
    if (settled) rendered = {x,y,scale};
    img.style.transform = `translate(${rendered.x}px,${rendered.y}px) scale(${rendered.scale})`;
    if (!settled) animation = requestAnimationFrame(draw);
    else { animation = 0; frameTime = 0; }
  };
  const paint = () => {
    if (!rendered || pointers.size || reduceMotion.matches) {
      if (animation) cancelAnimationFrame(animation);
      animation = 0; frameTime = 0; rendered = {x,y,scale};
      img.style.transform = `translate(${x}px,${y}px) scale(${scale})`;
    } else if (!animation) animation = requestAnimationFrame(draw);
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
  const contentWidth = Number(img.getAttribute('width'));
  const contentHeight = Number(img.getAttribute('height'));
  const fit = () => {
    if (!img.naturalWidth) return;
    fitScale = Math.min((viewport.clientWidth - 64) / contentWidth, (viewport.clientHeight - 64) / contentHeight);
    scale = fitScale; x = (viewport.clientWidth - contentWidth * scale) / 2;
    y = (viewport.clientHeight - contentHeight * scale) / 2; paint();
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
    const pixels = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? viewport.clientHeight : 1);
    zoom(scale * Math.exp(-Math.max(-120, Math.min(120, pixels)) * .0015), local(e));
  }, { passive: false });
  let safariScale = null;
  viewport.addEventListener('gesturestart', e => { e.preventDefault(); safariScale = scale; }, {passive:false});
  viewport.addEventListener('gesturechange', e => {
    e.preventDefault();
    if (safariScale && pointers.size < 2) zoom(safariScale * e.scale, Number.isFinite(e.clientX) ? local(e) : center());
  }, {passive:false});
  viewport.addEventListener('gestureend', () => { safariScale = null; });
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
