/* Раздел «Решение»: ползунок «до/после» с приближением к изменению + стопка карточек.
   При выборе карточки в один кадр стартуют: смена стопки, зум сцены, проезд ползунка
   и свечение рамок. Без библиотек. */
(() => {
  const root = document.getElementById("solution");
  if (!root) return;
  const frame = root.querySelector(".sol-frame");
  const handle = frame.querySelector(".cmp-handle");
  const stack = root.querySelector(".sol-stack");
  const cards = [...stack.querySelectorAll(".sol-card")];
  const btnPrev = root.querySelector(".sol-prev");
  const btnNext = root.querySelector(".sol-next");
  const btnFull = root.querySelector(".sol-full");
  const cur = root.querySelector(".sol-cur");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  const css = getComputedStyle(root);
  const DUR = parseFloat(css.getPropertyValue("--sol-dur")) || 1000;
  const EASE = css.getPropertyValue("--sol-ease").trim() || "cubic-bezier(.22,1,.36,1)";
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const num = (prop) => parseFloat(getComputedStyle(frame).getPropertyValue(prop)) || 0;

  /* ---- Иконки: ?icons=lucide2 или ?icons=frames — варианты для сравнения ---- */
  const svg = (d) => '<svg class="sol-ico" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + d + "</svg>";
  const ICONS = {
    lucide2: { // Lucide sparkles / pencil-line / eraser (lucide-static 0.468.0)
      add: '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/>',
      mod: '<path d="M12 20h9"/><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z"/><path d="m15 5 3 3"/>',
      del: '<path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"/><path d="M22 21H7"/><path d="m5 11 9 9"/>'
    },
    frames: { // свои значки в языке рамок раздела
      add: '<path d="M10.5 13.5h-6a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v6" stroke-dasharray="1 3"/><rect x="10.5" y="10.5" width="11" height="11" rx="2"/><path d="M16 13.5v5M13.5 16h5"/>',
      mod: '<rect x="2.5" y="2.5" width="8" height="8" rx="2"/><rect x="13.5" y="13.5" width="8" height="8" rx="2"/><path d="M13.5 6.5h2a2 2 0 0 1 2 2V11"/><path d="m15 8.5 2.5 2.5 2.5-2.5"/>',
      del: '<path d="M10.5 13.5h-6a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v6"/><rect x="10.5" y="10.5" width="11" height="11" rx="2" stroke-dasharray="1 3"/><path d="M13.5 16h5"/>'
    }
  };
  const set = ICONS[new URLSearchParams(location.search).get("icons")];
  if (set) cards.forEach((c) => { const i = c.querySelector(".sol-ico"); if (i) i.outerHTML = svg(set[c.dataset.type]); });

  /* ---- Ползунок ---- */
  let pos = 50, posAnim = null;
  const setPos = (v) => {
    pos = clamp(v, 0, 100);
    frame.style.setProperty("--pos", pos + "%");
    handle.setAttribute("aria-valuenow", String(Math.round(pos)));
  };
  const stopPos = () => {
    if (!posAnim) return;
    const v = num("--pos");
    posAnim.cancel(); posAnim = null; setPos(v);
  };
  // Проезд через место изменения. Если ползунок стоит не в начале проезда — сначала
  // быстро доезжает до него в той же анимации, без скачка картинки.
  const sweep = (from, to) => {
    stopPos();
    const start = pos;
    setPos(to);
    if (reduce.matches) return;
    const dist = Math.abs(start - from);
    const kf = dist > 2
      ? [{ "--pos": start + "%", easing: "cubic-bezier(.45,0,.55,1)" }, { "--pos": from + "%", offset: +(0.3 * dist / 100).toFixed(3), easing: EASE }, { "--pos": to + "%" }]
      : [{ "--pos": from + "%", easing: EASE }, { "--pos": to + "%" }];
    try {
      posAnim = frame.animate(kf, { duration: DUR });
      posAnim.onfinish = () => { posAnim = null; };
    } catch { posAnim = null; }
  };

  /* ---- Зум сцены ---- */
  let zoomed = false;
  // Переключатель: в приближении — «Весь экран», на общем виде — «Приблизить»
  const syncFull = () => {
    frame.classList.toggle("is-zoomed", zoomed);
    btnFull.setAttribute("aria-label", zoomed ? "Весь экран" : "Приблизить");
    btnFull.setAttribute("aria-pressed", String(!zoomed));
  };
  const setZoom = (s, fx, fy) => {
    frame.classList.toggle("is-instant", reduce.matches);
    const tx = clamp(50 - s * fx, (1 - s) * 100, 0);
    const ty = clamp(50 - s * fy, (1 - s) * 100, 0);
    frame.style.setProperty("--s", String(s));
    frame.style.setProperty("--tx", tx + "%");
    frame.style.setProperty("--ty", ty + "%");
    zoomed = s > 1.001;
    syncFull();
  };
  const zoomOut = () => setZoom(1, 50, 50);

  /* ---- Стопка ---- */
  let active = 0;
  // Высота стопки = высота текста активной карточки (остальные подстраиваются под неё)
  let maxCardH = 0;
  const natural = (c) => {
    const cs = getComputedStyle(c);
    return c.querySelector(".sol-card-in").scrollHeight + parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom) + parseFloat(cs.borderTopWidth) + parseFloat(cs.borderBottomWidth);
  };
  const sizeCards = () => {
    maxCardH = Math.max(...cards.map(natural));
    stack.style.setProperty("--stack-h", Math.ceil(maxCardH) + "px");
    stack.style.setProperty("--card-h", Math.ceil(natural(cards[active])) + "px");
  };
  const layout = () => cards.forEach((c, i) => { c.dataset.d = String(clamp(i - active, -1, 3)); });
  const pulse = () => { frame.classList.remove("is-pulse"); void frame.offsetWidth; frame.classList.add("is-pulse"); };

  const select = (i, { focus = false, toggle = false } = {}) => {
    i = clamp(i, 0, cards.length - 1);
    if (toggle && i === active && zoomed) { zoomOut(); return; }
    active = i;
    const c = cards[i];
    cards.forEach((t, k) => { const on = k === i; t.setAttribute("aria-selected", on); t.tabIndex = on ? 0 : -1; });
    frame.setAttribute("aria-labelledby", c.id);
    frame.dataset.active = String(i + 1);
    cur.textContent = String(i + 1);
    btnPrev.disabled = i === 0;
    btnNext.disabled = i === cards.length - 1;
    // всё ниже — в один кадр
    layout();
    sizeCards();
    setZoom(+c.dataset.scale, +c.dataset.fx, +c.dataset.fy);
    sweep(+c.dataset.from, +c.dataset.to);
    pulse();
    if (focus) c.focus({ preventScroll: true });
  };

  cards.forEach((c, i) => {
    c.addEventListener("click", () => select(i, { toggle: true }));
    c.addEventListener("keydown", (e) => {
      let n = null;
      if (e.key === "ArrowRight") n = active + 1;
      if (e.key === "ArrowLeft") n = active - 1;
      if (e.key === "Home") n = 0;
      if (e.key === "End") n = cards.length - 1;
      if (n !== null) { e.preventDefault(); if (n >= 0 && n < cards.length && n !== active) select(n, { focus: true }); }
    });
  });
  btnPrev.addEventListener("click", () => select(active - 1));
  btnNext.addEventListener("click", () => select(active + 1));
  btnFull.addEventListener("click", () => {
    if (zoomed) { stopPos(); zoomOut(); } else select(active);
  });

  /* ---- Свайп стопки: передняя карточка едет за мышью/пальцем с сопротивлением.
     Мышь — по вертикали (вверх — следующая); палец — по горизонтали (влево — следующая),
     чтобы вертикальный жест оставался прокруткой страницы. ---- */
  const axisY = () => getComputedStyle(stack).getPropertyValue("--axis").trim() === "y";
  const isSide = () => getComputedStyle(stack).getPropertyValue("--side").trim() === "1";
  let sw = null, suppressClick = false;
  stack.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    const vert = axisY() && e.pointerType !== "touch";
    sw = { id: e.pointerId, x: e.clientX, y: e.clientY, t: e.timeStamp, d: 0, v: 0, on: false, vert };
  });
  stack.addEventListener("pointermove", (e) => {
    if (!sw || e.pointerId !== sw.id) return;
    const dx = e.clientX - sw.x, dy = e.clientY - sw.y;
    const main = sw.vert ? dy : dx, cross = sw.vert ? dx : dy;
    if (!sw.on) {
      if (Math.abs(main) < 8 || Math.abs(main) < Math.abs(cross)) return;
      sw.on = true;
      try { stack.setPointerCapture(e.pointerId); } catch {}
      stack.classList.add("is-dragging");
      cards[active].classList.add("is-dragging");
    }
    const can = main < 0 ? active < cards.length - 1 : active > 0;
    const eff = main * (can ? 0.6 : 0.2);
    sw.d = main; sw.v = main / Math.max(1, e.timeStamp - sw.t);
    const ax = sw.vert ? "--drag-y" : "--drag-x";
    cards[active].style.setProperty(ax, eff + "px");
    const size = sw.vert ? stack.clientHeight : stack.clientWidth;
    stack.style.setProperty("--p", main < 0 && can ? String(clamp(-eff / (size * 0.4), 0, 1)) : "0");
  });
  const swEnd = (e) => {
    if (!sw || e.pointerId !== sw.id) return;
    const s = sw; sw = null;
    if (!s.on) return;
    suppressClick = true; setTimeout(() => { suppressClick = false; }, 0);
    const front = cards[active];
    stack.classList.remove("is-dragging");
    front.classList.remove("is-dragging");
    front.style.setProperty("--drag-x", "0px");
    front.style.setProperty("--drag-y", "0px");
    stack.style.setProperty("--p", "0");
    const size = s.vert ? stack.clientHeight : stack.clientWidth;
    const far = Math.abs(s.d) > Math.min(72, size * 0.22) || Math.abs(s.v) > 0.5;
    if (e.type === "pointerup" && far) {
      const n = active + (s.d < 0 ? 1 : -1);
      if (n >= 0 && n < cards.length) select(n);
    }
  };
  stack.addEventListener("pointerup", swEnd);
  stack.addEventListener("pointercancel", swEnd);
  stack.addEventListener("click", (e) => { if (suppressClick) { e.stopPropagation(); e.preventDefault(); } }, true);

  /* ---- Ручное перетаскивание ползунка: анимация замирает там, где была ---- */
  const freeze = () => {
    stopPos();
    const s = num("--s"), tx = num("--tx"), ty = num("--ty");
    frame.classList.add("is-drag");
    frame.style.setProperty("--s", String(s));
    frame.style.setProperty("--tx", tx + "%");
    frame.style.setProperty("--ty", ty + "%");
    zoomed = s > 1.001; syncFull();
  };
  const fromEvent = (e) => {
    const r = frame.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    setPos((x - num("--tx")) / num("--s"));
  };
  let drag = null;
  frame.addEventListener("pointerdown", (e) => {
    if (e.button !== 0 || e.target.closest(".sol-full")) return;
    drag = { id: e.pointerId, x: e.clientX, y: e.clientY, on: false };
    // мышь и ручка — сразу; палец по картинке — только после горизонтального движения,
    // чтобы вертикальная прокрутка страницы не дёргала ползунок
    if (e.pointerType === "mouse" || e.target.closest(".cmp-handle")) start(e);
  });
  const start = (e) => {
    drag.on = true; freeze();
    try { frame.setPointerCapture(e.pointerId); } catch {}
    fromEvent(e); handle.focus({ preventScroll: true });
  };
  frame.addEventListener("pointermove", (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    if (!drag.on) {
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (Math.abs(dx) > 6 && Math.abs(dx) > Math.abs(dy)) start(e);
      return;
    }
    fromEvent(e);
  });
  const end = (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    // короткий тап пальцем — переставить ползунок, как в верхнем сравнении
    if (!drag.on && e.type === "pointerup") { drag.on = true; freeze(); fromEvent(e); }
    drag = null;
    frame.classList.remove("is-drag");
    try { frame.releasePointerCapture(e.pointerId); } catch {}
  };
  frame.addEventListener("pointerup", end);
  frame.addEventListener("pointercancel", end);
  handle.addEventListener("keydown", (e) => {
    const k = { ArrowLeft: pos - 2, ArrowRight: pos + 2, Home: 0, End: 100 }[e.key];
    if (k === undefined) return;
    e.preventDefault(); stopPos(); setPos(k);
  });

  /* ---- Размер кадра: всё вместе (кадр + стопка + счётчик) должно помещаться в окно.
     Меряем высоту шапки, стопки и счётчика — кадр берёт остаток по высоте (в CSS). ---- */
  const ctrl = root.querySelector(".sol-ctrl");
  const hdr = document.querySelector(".hdr");
  const fit = () => {
    sizeCards();
    const gap = parseFloat(getComputedStyle(root.querySelector(".sol-body")).rowGap) || 16;
    // сбоку от экрана стопка не отнимает высоту у кадра
    // под экраном берём самую высокую карточку, чтобы кадр не менял размер при переключении
    const reserve = (hdr ? hdr.offsetHeight : 0) + (isSide() ? 24 : maxCardH + parseFloat(getComputedStyle(stack).paddingBottom) + ctrl.offsetHeight + gap * 2 + 8);
    root.style.setProperty("--sol-reserve", Math.round(reserve) + "px");
  };
  fit();
  window.addEventListener("resize", fit);
  // смена темы и подгрузка шрифта могут менять высоту текста
  new MutationObserver(fit).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  if (document.fonts) document.fonts.ready.then(fit);

  /* ---- Покой: карточка 1 активна, без приближения, ползунок посередине ---- */
  layout();
  setPos(50);
})();
