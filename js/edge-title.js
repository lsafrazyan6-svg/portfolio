/* Название кейса: «каскад от краёв» (stagger-from-edges).
   Буквы появляются волной от краёв каждой строки к середине: 620 мс, шаг 22 мс, cubic-bezier(.22,1,.36,1).
   Тайминги и кривая — в css/case.css (.case-h1). */
(() => {
  const el = document.getElementById("case-title");
  if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const STEP = 22;
  const text = el.textContent.trim();
  el.setAttribute("aria-label", text);
  el.textContent = "";
  const chars = [];
  // делим только по обычным пробелам: слова, склеенные неразрывным пробелом (typo-nbsp.js), остаются вместе
  text.split(/[ \t\n\r]+/).forEach((word, wi) => {
    if (wi) el.append(" ");
    const w = document.createElement("span");
    w.className = "w";
    w.setAttribute("aria-hidden", "true");
    for (const c of word) {
      const ch = document.createElement("span");
      ch.className = "ch";
      ch.textContent = c;
      w.append(ch);
      chars.push(ch);
    }
    el.append(w);
  });
  el.classList.add("is-split");
  const run = () => {
    // Разбиваем буквы по строкам и считаем задержку от ближайшего края строки.
    const lines = new Map();
    chars.forEach((ch) => {
      const top = Math.round(ch.offsetTop);
      if (!lines.has(top)) lines.set(top, []);
      lines.get(top).push(ch);
    });
    lines.forEach((line) => {
      const n = line.length;
      line.forEach((ch, i) => ch.style.setProperty("--d", Math.min(i, n - 1 - i) * STEP + "ms"));
    });
    el.classList.add("is-ready");
  };
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(() => requestAnimationFrame(run));
})();
