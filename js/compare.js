/* Сравнение «до/после»: вкладки-страницы и ползунок. Без библиотек. */
(() => {
  const root = document.getElementById("compare");
  if (!root) return;
  const frame = root.querySelector(".cmp-frame");
  const handle = root.querySelector(".cmp-handle");
  const before = root.querySelector(".cmp-before");
  const after = root.querySelector(".cmp-after");
  const tabs = [...root.querySelectorAll(".cmp-tab")];
  const names = { tickets: "Выбор билета", bonus: "РЖД Бонус", passengers: "Данные пассажира", success: "Успешная оплата" };
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  const src = (slug, k) => "../assets/compare/" + slug + "-" + k + ".jpg";
  const apply = (slug) => { before.src = src(slug, "before"); after.src = src(slug, "after"); };
  let pos = 50;
  const set = (v) => {
    pos = Math.min(100, Math.max(0, v));
    frame.style.setProperty("--pos", pos + "%");
    handle.setAttribute("aria-valuenow", String(Math.round(pos)));
  };
  set(50);
  const fromEvent = (e) => { const r = frame.getBoundingClientRect(); set(((e.clientX - r.left) / r.width) * 100); };
  let dragging = false;
  frame.addEventListener("pointerdown", (e) => {
    dragging = true; frame.setPointerCapture(e.pointerId); frame.classList.add("is-drag"); fromEvent(e); handle.focus({ preventScroll: true });
  });
  frame.addEventListener("pointermove", (e) => { if (dragging) fromEvent(e); });
  const end = (e) => { if (!dragging) return; dragging = false; frame.classList.remove("is-drag"); try { frame.releasePointerCapture(e.pointerId); } catch {} };
  frame.addEventListener("pointerup", end);
  frame.addEventListener("pointercancel", end);
  handle.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") { e.preventDefault(); set(pos - 2); }
    else if (e.key === "ArrowRight") { e.preventDefault(); set(pos + 2); }
    else if (e.key === "Home") { e.preventDefault(); set(0); }
    else if (e.key === "End") { e.preventDefault(); set(100); }
  });
  const preload = (slug) => { ["before", "after"].forEach((k) => { const i = new Image(); i.src = src(slug, k); }); };
  const select = (tab, focus) => {
    const slug = tab.dataset.slug;
    tabs.forEach((t) => { const on = t === tab; t.setAttribute("aria-selected", on); t.tabIndex = on ? 0 : -1; });
    frame.setAttribute("aria-labelledby", tab.id);
    set(50);
    const swap = () => {
      apply(slug);
      before.alt = "Оригинал РЖД: " + names[slug]; after.alt = "Редизайн: " + names[slug];
      frame.classList.remove("is-swap");
    };
    if (reduce.matches) swap();
    else { frame.classList.add("is-swap"); setTimeout(swap, 180); }
    if (focus) tab.focus();
  };
  tabs.forEach((t, i) => {
    t.addEventListener("click", () => select(t, false));
    t.addEventListener("keydown", (e) => {
      let n = null;
      if (e.key === "ArrowRight") n = tabs[(i + 1) % tabs.length];
      if (e.key === "ArrowLeft") n = tabs[(i - 1 + tabs.length) % tabs.length];
      if (e.key === "Home") n = tabs[0];
      if (e.key === "End") n = tabs[tabs.length - 1];
      if (n) { e.preventDefault(); select(n, true); }
    });
    t.addEventListener("pointerenter", () => preload(t.dataset.slug), { once: true });
  });
})();
