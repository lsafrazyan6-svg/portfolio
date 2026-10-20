/* Лайтбокс для картинок кейса: клик/тап, Esc, фон, крестик, стрелки, свайп. Без библиотек. */
(() => {
  const imgs = [...document.querySelectorAll(".article img:not([data-no-zoom]), .resume-photo")];
  if (!imgs.length) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  let index = 0, lastFocus = null, root = null;
  const el = (tag, cls, attrs = {}) => { const n = document.createElement(tag); n.className = cls; Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v)); return n; };

  imgs.forEach((img, i) => {
    img.classList.add("zoomable");
    img.tabIndex = 0;
    img.setAttribute("role", "button");
    img.setAttribute("aria-label", "Открыть крупно: " + img.alt);
    img.addEventListener("click", () => open(i));
    img.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(i); } });
  });

  const build = () => {
    root = el("div", "lb", { role: "dialog", "aria-modal": "true", "aria-label": "Просмотр изображения" });
    root.innerHTML = '<button class="lb-btn lb-close" type="button" aria-label="Закрыть"><svg class="icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg></button><button class="lb-btn lb-prev" type="button" aria-label="Предыдущая картинка"><svg class="icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg></button><button class="lb-btn lb-next" type="button" aria-label="Следующая картинка"><svg class="icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg></button><figure class="lb-fig"><img class="lb-img" alt=""><figcaption class="lb-cap"></figcaption></figure>';
    document.body.appendChild(root);
    root.addEventListener("click", (e) => { if (e.target === root || (e.target.classList.contains("lb-fig") && !zoomed)) close(); });
    root.querySelector(".lb-close").addEventListener("click", close);
    root.querySelector(".lb-prev").addEventListener("click", () => step(-1));
    root.querySelector(".lb-next").addEventListener("click", () => step(1));
    let x0 = null, y0 = 0;
    root.addEventListener("touchstart", (e) => { x0 = e.touches.length === 1 && (!window.visualViewport || window.visualViewport.scale <= 1.01) ? e.touches[0].clientX : null; y0 = e.touches[0].clientY; }, { passive: true });
    root.addEventListener("touchend", (e) => {
      if (x0 === null || zoomed) return;
      const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) step(dx < 0 ? 1 : -1);
      x0 = null;
    }, { passive: true });
    const bigImg = root.querySelector(".lb-img");
    bigImg.addEventListener("dblclick", (e) => { e.preventDefault(); setZoom(!zoomed); });
    let lastTap = 0, tx = 0, ty = 0;
    bigImg.addEventListener("touchend", (e) => {
      if (e.changedTouches.length !== 1 || e.touches.length) return;
      const t = e.changedTouches[0], now = Date.now();
      if (now - lastTap < 320 && Math.abs(t.clientX - tx) < 30 && Math.abs(t.clientY - ty) < 30) { e.preventDefault(); lastTap = 0; setZoom(!zoomed); }
      else { lastTap = now; tx = t.clientX; ty = t.clientY; }
    });
  };
  let zoomed = false;
  const setZoom = (on) => {
    zoomed = on;
    if (!root) return;
    root.classList.toggle("is-zoomed", on);
    const big = root.querySelector(".lb-img");
    if (on) { const w = big.naturalWidth || 2400; big.style.width = w + "px"; const fig = root.querySelector(".lb-fig"); fig.scrollLeft = (fig.scrollWidth - fig.clientWidth) / 2; fig.scrollTop = 0; }
    else big.style.width = "";
  };
  const show = () => {
    const src = imgs[index];
    const big = root.querySelector(".lb-img");
    setZoom(false); big.style.width = ""; big.src = src.dataset.full || src.currentSrc || src.src; big.alt = src.alt;
    root.querySelector(".lb-cap").textContent = src.alt;
    root.querySelector(".lb-prev").hidden = root.querySelector(".lb-next").hidden = imgs.length < 2;
  };
  const step = (d) => { index = (index + d + imgs.length) % imgs.length; show(); };
  function open(i) {
    if (!root) build();
    lastFocus = document.activeElement; index = i; show();
    root.classList.remove("is-open"); root.style.display = "flex";
    document.body.style.overflow = "hidden"; document.documentElement.style.overscrollBehavior = "none";
    if (reduce.matches) root.classList.add("is-open"); else requestAnimationFrame(() => root.classList.add("is-open"));
    root.querySelector(".lb-close").focus();
    document.addEventListener("keydown", onKey);
  }
  function close() {
    document.removeEventListener("keydown", onKey);
    root.classList.remove("is-open");
    const done = () => { root.style.display = "none"; };
    if (reduce.matches) done(); else setTimeout(done, 200);
    document.body.style.overflow = ""; document.documentElement.style.overscrollBehavior = ""; setZoom(false);
    if (lastFocus) lastFocus.focus();
  }
  function onKey(e) {
    if (e.key === "Escape") { e.preventDefault(); close(); }
    else if (e.key === "ArrowLeft") step(-1);
    else if (e.key === "ArrowRight") step(1);
    else if (e.key === "Tab") {
      const f = [...root.querySelectorAll("button")].filter((b) => !b.hidden);
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      else if (!root.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
    }
  }
})();
