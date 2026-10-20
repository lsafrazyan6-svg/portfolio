/* Оглавление кейса: на десктопе всегда открыто, на мобиле свёрнуто; подсветка текущего раздела и подпрокрутка панели. */
(() => {
  const box = document.querySelector(".toc-details");
  const links = [...document.querySelectorAll(".toc a[href^='#']")];
  if (!box || !links.length) return;
  const mq = window.matchMedia("(max-width: 820px)");
  const sync = () => { box.open = !mq.matches; };
  sync();
  (mq.addEventListener ? mq.addEventListener("change", sync) : mq.addListener(sync));
  const map = new Map();
  links.forEach((a) => { const t = document.getElementById(a.getAttribute("href").slice(1)); if (t) map.set(t, a); });
  let current = null;
  const setActive = (a) => {
    if (a === current) return;
    if (current) { current.classList.remove("is-active"); current.removeAttribute("aria-current"); }
    current = a; a.classList.add("is-active"); a.setAttribute("aria-current", "true");
    const panel = a.closest(".intro");
    if (panel && !mq.matches && panel.scrollHeight > panel.clientHeight) {
      const pr = panel.getBoundingClientRect(), ar = a.getBoundingClientRect();
      if (ar.top < pr.top + 8 || ar.bottom > pr.bottom - 8) panel.scrollTop += ar.top - pr.top - pr.height / 2 + ar.height / 2;
    }
  };
  const visible = new Set();
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { e.isIntersecting ? visible.add(e.target) : visible.delete(e.target); });
    const order = [...map.keys()];
    const first = order.find((t) => visible.has(t));
    if (first) setActive(map.get(first));
  }, { rootMargin: "-100px 0px -45% 0px", threshold: 0 });
  map.forEach((_, t) => io.observe(t));
})();
