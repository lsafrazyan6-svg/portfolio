/* Оглавление кейса: окно фиксированной высоты, внутри листается; дымки сверху/снизу
   показывают, что есть ещё; активный пункт (IntersectionObserver) подпрокручивается в окно. */
(() => {
  const clip = document.querySelector(".toc-clip");
  const win = document.querySelector(".toc-win");
  const links = [...document.querySelectorAll(".toc a[href^='#']")];
  if (!clip || !win || !links.length) return;
  const edges = () => {
    const max = clip.scrollHeight - clip.clientHeight;
    win.classList.toggle("has-top", clip.scrollTop > 2);
    win.classList.toggle("has-bottom", max > 2 && clip.scrollTop < max - 2);
  };
  clip.addEventListener("scroll", edges, { passive: true });
  window.addEventListener("resize", edges);
  edges();
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  const map = new Map();
  links.forEach((a) => { const t = document.getElementById(a.getAttribute("href").slice(1)); if (t) map.set(t, a); });
  let current = null;
  const setActive = (a) => {
    if (a === current) return;
    if (current) { current.classList.remove("is-active"); current.removeAttribute("aria-current"); }
    current = a; a.classList.add("is-active"); a.setAttribute("aria-current", "true");
    const cr = clip.getBoundingClientRect(), ar = a.getBoundingClientRect();
    if (ar.top < cr.top || ar.bottom > cr.bottom) clip.scrollTo({ top: clip.scrollTop + ar.top - cr.top - (cr.height - ar.height) / 2, behavior: reduce.matches ? "auto" : "smooth" });
  };
  const visible = new Set();
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { e.isIntersecting ? visible.add(e.target) : visible.delete(e.target); });
    const first = [...map.keys()].find((t) => visible.has(t));
    if (first) setActive(map.get(first));
  }, { rootMargin: "-100px 0px -45% 0px", threshold: 0 });
  map.forEach((_, t) => io.observe(t));
})();
