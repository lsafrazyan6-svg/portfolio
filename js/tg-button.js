// Кнопка «Написать в тг»: полутоновые точки по краям и перезапуск анимации клика.
// Сетка и формулы — из makeDots() на холсте Design (Tg-button-halftone.dc.html):
// 6 колонок с каждой стороны, шаг 6px, нечётные ряды со сдвигом 3px, размер и
// прозрачность убывают к центру. Рядов 7 при высоте 40px; на кнопке выше рядов
// добавляется столько, сколько помещается, и сетка центрируется по высоте.
(() => {
  const buttons = document.querySelectorAll("a.write.tg-fx");
  if (!buttons.length) return;

  // Темп ускорен 25.10.2026 по её слову: задержки с холста масштабируются под новые длительности
  const BR = 2 / 3.6, TW = 1.7 / 3, FL = 2.6 / 4.8; // breathe 2s, twinkle 1.7s, float 2.6s

  const makeDots = (height) => {
    const rows = Math.max(7, Math.floor((height - 4) / 6) + 1);
    const top0 = (height - (rows - 1) * 6) / 2;
    const out = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < 6; c++) {
        const x = 3 + c * 6 + (r % 2 ? 3 : 0);
        const t = Math.min(x / 38, 1);
        const s = Math.max(0.8, 4.8 * Math.pow(1 - t, 1.2));
        const o = Math.min(1, 0.2 + 0.75 * (1 - t));
        out.push({
          col: "c" + c,
          pos: (x - s / 2).toFixed(2),
          top: (top0 + r * 6 - s / 2).toFixed(2),
          s: s.toFixed(2),
          o: o.toFixed(2),
          delay: Math.round(c * 50 * 0.9 / 1.4), // клик .9s (было 1.4s)
          tw: Math.round(-((r * 7 + c * 13) % 17) * 175 * TW),
          tw2: Math.round(-((r * 11 + c * 5) % 17) * 175 * TW),
          br: Math.round(-(3600 - c * 330 - r * 85) * BR),
          fl: Math.round(-((r * 400 + c * 225) % 4800) * FL),
          fl2: Math.round(-((r * 305 + c * 545) % 4800) * FL),
        });
      }
    }
    return out;
  };

  const dotHtml = (d, side) => {
    const edge = side === "L" ? "left" : "right";
    const fl = side === "L" ? d.fl : d.fl2;
    const tw = side === "L" ? d.tw : d.tw2;
    return `<i class="dot ${side} ${d.col}" style="${edge}:${d.pos}px;top:${d.top}px;width:${d.s}px;height:${d.s}px;opacity:${d.o};animation-delay:${d.delay}ms">` +
      `<s class="fl" style="animation-delay:${fl}ms"><b class="tw" style="animation-delay:${d.br}ms,${tw}ms"></b></s></i>`;
  };

  buttons.forEach((btn) => {
    const label = btn.querySelector(":scope > span:not(.keys)");
    if (label) label.classList.add("lbl");

    const dots = document.createElement("span");
    dots.className = "dots";
    dots.setAttribute("aria-hidden", "true");
    const flash = document.createElement("span");
    flash.className = "flash";
    flash.setAttribute("aria-hidden", "true");
    btn.append(dots, flash); // в конец: подпись остаётся первым span (селекторы режима «Правки» не меняются)

    let built = 0;
    const build = () => {
      const h = Math.round(btn.clientHeight);
      if (!h || h === built) return; // кнопка скрыта или высота не изменилась
      built = h;
      const list = makeDots(h);
      dots.innerHTML = list.map((d) => dotHtml(d, "L")).join("") + list.map((d) => dotHtml(d, "R")).join("");
    };
    build();
    if ("ResizeObserver" in window) new ResizeObserver(build).observe(btn);

    // Клик: чередуем fx-a / fx-b — у них разные имена анимаций, поэтому каждая перезапускается
    let n = 0;
    btn.addEventListener("click", () => {
      n += 1;
      btn.classList.remove("fx-a", "fx-b");
      btn.classList.add(n % 2 ? "fx-a" : "fx-b");
    });
  });
})();
