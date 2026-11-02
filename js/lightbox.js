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
    root.innerHTML = '<button class="lb-btn lb-close" type="button" aria-label="Закрыть"><svg class="icon i24" data-icon="sf:xmark" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 640 640" fill="currentColor"><path fill-rule="evenodd" d="M122.18,536.88 C117.05,535.93 112.63,533.34 108.41,528.82 C104.37,524.49 102.57,519.73 102.60,513.53 C102.65,502.57 98.19,507.54 194.61,410.99 C243.78,361.76 284.00,321.04 284.00,320.50 C284.00,319.96 243.78,279.24 194.61,230.01 C121.45,156.75 105.00,139.79 103.98,136.59 C98.00,117.77 113.75,99.72 132.50,103.91 C136.83,104.88 139.20,106.24 143.67,110.32 C146.79,113.17 187.63,153.82 234.42,200.66 L319.50,285.82 L409.00,196.52 C458.23,147.40 499.92,106.51 501.65,105.64 C506.49,103.20 512.32,102.64 518.17,104.04 C522.47,105.07 524.54,106.38 529.12,110.96 C533.90,115.74 534.97,117.49 536.04,122.30 C537.95,130.84 536.23,137.29 530.20,144.16 C527.62,147.10 488.81,186.18 443.96,231.01 C399.11,275.83 360.70,314.40 358.61,316.73 L354.80,320.97 L439.65,405.81 C486.32,452.48 526.83,493.21 529.68,496.33 C536.22,503.49 538.03,509.83 536.06,518.64 C535.00,523.37 533.87,525.23 529.15,530.05 C524.26,535.02 522.74,535.96 517.90,536.94 C512.20,538.10 505.41,537.28 500.62,534.86 C499.46,534.27 458.37,493.71 409.32,444.72 L320.15,355.66 L316.50,358.86 C314.50,360.63 274.34,400.59 227.26,447.66 C163.72,511.20 140.61,533.71 137.58,535.01 C132.26,537.29 127.52,537.86 122.18,536.88 Z"/></svg></button><button class="lb-btn lb-prev" type="button" aria-label="Предыдущая картинка"><svg class="icon i24" data-icon="sf:chevron.left" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 640 640" fill="currentColor"><path fill-rule="evenodd" d="M410.94,576.11 C404.31,573.94 403.73,573.46 375.00,545.99 C364.27,535.73 348.30,520.65 339.50,512.48 C330.70,504.31 322.38,496.41 321.00,494.92 C319.62,493.44 310.85,485.10 301.50,476.39 C292.15,467.68 283.36,459.42 281.96,458.03 C280.57,456.64 271.59,448.07 262.01,439.00 C252.43,429.93 243.45,421.34 242.05,419.93 C240.65,418.51 235.90,414.04 231.50,409.98 C227.10,405.92 216.07,395.57 207.00,386.96 C197.93,378.36 186.22,367.33 181.00,362.46 C160.11,342.98 151.45,333.68 150.20,329.38 C147.64,320.60 149.45,309.72 154.40,304.13 C155.56,302.83 163.25,295.43 171.50,287.70 C179.75,279.96 191.68,268.65 198.01,262.56 C204.34,256.48 216.49,244.97 225.01,237.00 C233.52,229.03 241.64,221.38 243.05,220.00 C244.46,218.62 253.21,210.30 262.51,201.50 C271.80,192.70 280.77,184.13 282.45,182.45 C284.13,180.77 293.15,172.26 302.50,163.54 C311.85,154.82 321.10,146.07 323.06,144.09 C327.03,140.08 336.25,131.34 349.00,119.50 C353.68,115.16 366.05,103.43 376.50,93.43 C402.23,68.81 405.17,66.40 411.23,64.95 C417.55,63.43 426.77,64.33 431.96,66.98 C436.45,69.27 442.44,75.10 444.83,79.50 C445.94,81.55 446.46,85.05 446.48,90.58 C446.50,98.11 446.26,99.05 443.00,104.27 C440.76,107.85 433.34,115.59 422.45,125.69 C413.07,134.39 403.62,143.30 401.45,145.50 C395.25,151.78 375.00,171.09 357.50,187.41 C339.95,203.77 328.27,214.84 323.56,219.56 C321.88,221.24 313.55,229.12 305.06,237.06 C285.64,255.21 284.96,255.86 262.82,277.00 C243.43,295.52 236.78,301.84 224.49,313.36 L216.88,320.50 L231.19,333.99 C239.06,341.41 251.35,353.14 258.50,360.04 C269.69,370.86 285.72,386.00 311.91,410.50 C315.44,413.80 319.71,417.89 321.41,419.58 C323.11,421.28 332.60,430.25 342.50,439.53 C352.40,448.80 364.55,460.27 369.50,465.01 C374.45,469.75 383.68,478.55 390.00,484.55 C396.32,490.56 402.18,496.24 403.00,497.17 C403.82,498.09 412.38,506.11 422.00,514.99 C442.07,533.49 446.15,538.89 446.79,547.83 C447.34,555.33 445.80,560.65 441.49,566.18 C436.38,572.74 429.36,576.25 420.57,576.64 C416.68,576.81 412.35,576.57 410.94,576.11 Z"/></svg></button><button class="lb-btn lb-next" type="button" aria-label="Следующая картинка"><svg class="icon i24" data-icon="sf:chevron.right" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 640 640" fill="currentColor"><path fill-rule="evenodd" d="M209.00,574.99 C203.34,572.99 197.56,567.74 194.16,561.51 C191.77,557.13 191.88,542.67 194.35,538.13 C196.07,534.95 204.04,526.74 219.64,512.05 C238.43,494.36 245.47,487.66 256.50,476.99 C263.10,470.61 275.70,458.67 284.50,450.46 C293.30,442.25 301.66,434.40 303.07,433.02 C306.69,429.47 318.89,417.91 329.52,407.95 C345.45,393.02 376.34,363.66 381.55,358.50 C386.88,353.22 410.79,330.77 417.40,324.84 C420.41,322.14 421.08,320.97 420.37,319.69 C419.86,318.78 415.41,314.37 410.47,309.89 C405.54,305.40 396.55,296.94 390.50,291.08 C378.51,279.46 353.50,255.72 323.00,226.99 C278.36,184.95 266.91,174.10 255.50,163.03 C248.90,156.62 236.30,144.66 227.50,136.44 C204.43,114.89 196.53,106.90 194.40,102.97 C191.86,98.30 191.74,83.93 194.19,79.43 C202.94,63.39 223.75,59.19 238.00,70.57 C240.47,72.55 247.90,79.42 254.50,85.84 C261.10,92.25 273.92,104.43 283.00,112.91 C292.07,121.38 300.90,129.71 302.62,131.41 C307.10,135.85 319.07,147.26 329.52,157.05 C342.09,168.83 375.65,200.69 380.49,205.43 C386.90,211.71 402.42,226.45 417.43,240.50 C425.07,247.65 433.86,255.97 436.97,259.00 C440.08,262.02 449.56,271.02 458.03,279.00 C489.09,308.24 489.96,309.36 489.96,320.50 C489.96,331.59 487.75,334.43 457.02,363.07 C448.51,371.01 439.73,379.31 437.52,381.53 C435.31,383.75 426.30,392.27 417.50,400.47 C408.70,408.67 392.51,423.95 381.52,434.44 C345.31,468.99 339.66,474.36 323.07,490.00 C314.03,498.53 302.11,509.77 296.59,515.00 C291.07,520.23 282.26,528.53 277.02,533.45 C271.79,538.38 262.32,547.44 256.00,553.59 C249.68,559.74 242.14,566.83 239.27,569.34 C230.68,576.84 219.94,578.85 209.00,574.99 Z"/></svg></button><figure class="lb-fig"><img class="lb-img" alt=""><figcaption class="lb-cap"></figcaption></figure>';
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
