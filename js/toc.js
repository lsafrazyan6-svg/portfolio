/* Оглавление кейса: подсветка текущего раздела, подпрокрутка панели на десктопе,
   на мобиле — плашка с первыми пунктами и кнопкой «Показать всё». */
(() => {
  const links = [...document.querySelectorAll(".toc a[href^='#']")];
  const box = document.querySelector(".toc-box");
  if (!box || !links.length) return;
  const clip = box.querySelector(".toc-clip");
  const btn = box.querySelector(".toc-more");
  const label = btn.querySelector("span");
  const mq = window.matchMedia("(max-width: 820px)");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  let open = false;
  const collapsed = () => { const li = clip.querySelector("li"); return Math.round((li ? li.getBoundingClientRect().height : 48) * 3); };
  const layout = () => {
    if (!mq.matches) { clip.style.maxHeight = ""; box.classList.remove("is-open"); return; }
    clip.style.maxHeight = (open ? clip.scrollHeight : collapsed()) + "px";
  };
  const set = (v) => {
    open = v;
    box.classList.toggle("is-open", v);
    btn.setAttribute("aria-expanded", String(v));
    label.textContent = v ? "Свернуть" : "Показать всё";
    layout();
  };
  btn.addEventListener("click", () => set(!open));
  const onMq = () => { set(false); layout(); };
  (mq.addEventListener ? mq.addEventListener("change", onMq) : mq.addListener(onMq));
  window.addEventListener("resize", layout);
  layout();
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
    const first = [...map.keys()].find((t) => visible.has(t));
    if (first) setActive(map.get(first));
  }, { rootMargin: "-100px 0px -45% 0px", threshold: 0 });
  map.forEach((_, t) => io.observe(t));
})();
