/* Анимации перенесены с dmvdsgn.com: падающие эмодзи по клику на имя (физика, перетаскивание), клавиша T открывает Telegram. */
(() => {
  const nameLink = document.getElementById("name");
  const contactUrl = document.getElementById("write").href;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const emojiCanvas = document.createElement("canvas");
  emojiCanvas.className = "emoji-canvas";
  emojiCanvas.setAttribute("aria-hidden", "true");
  document.body.appendChild(emojiCanvas);
  const emojiContext = emojiCanvas.getContext("2d");
  const emojiPool = ["🍀", "😋", "😎", "🖥", "⌨️", "🚀", "🫠"];
  const emojiBodies = [];
  const emojiRadius = 22.5;
  let emojiWidth = window.innerWidth;
  let emojiHeight = window.innerHeight;
  let previousFrame = performance.now();
  let draggedEmoji = null;
  let draggedPointer = null;
  let previousPointerX = 0;
  let previousPointerY = 0;
  let previousPointerTime = 0;

  const resizeEmojiCanvas = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    emojiWidth = window.innerWidth;
    emojiHeight = window.innerHeight;
    emojiCanvas.width = Math.round(emojiWidth * ratio);
    emojiCanvas.height = Math.round(emojiHeight * ratio);
    emojiContext.setTransform(ratio, 0, 0, ratio, 0, 0);
    emojiBodies.forEach((body) => {
      body.x = Math.min(Math.max(body.x, emojiRadius), emojiWidth - emojiRadius);
      body.y = Math.min(body.y, emojiHeight - emojiRadius);
    });
  };

  const resolveEmojiCollisions = () => {
    for (let firstIndex = 0; firstIndex < emojiBodies.length; firstIndex += 1) {
      for (let secondIndex = firstIndex + 1; secondIndex < emojiBodies.length; secondIndex += 1) {
        const first = emojiBodies[firstIndex];
        const second = emojiBodies[secondIndex];
        if (first.dragging || second.dragging) continue;
        const dx = second.x - first.x;
        const dy = second.y - first.y;
        const distance = Math.hypot(dx, dy) || 0.01;
        const minimumDistance = emojiRadius * 1.72;
        if (distance >= minimumDistance) continue;
        const nx = dx / distance;
        const ny = dy / distance;
        const overlap = (minimumDistance - distance) / 2;
        first.x -= nx * overlap;
        first.y -= ny * overlap;
        second.x += nx * overlap;
        second.y += ny * overlap;
        const relativeSpeed = (second.vx - first.vx) * nx + (second.vy - first.vy) * ny;
        if (relativeSpeed >= 0) continue;
        const impulse = -relativeSpeed * 0.36;
        first.vx -= impulse * nx;
        first.vy -= impulse * ny;
        second.vx += impulse * nx;
        second.vy += impulse * ny;
      }
    }
  };

  const animateEmojis = (time) => {
    const delta = Math.min((time - previousFrame) / 1000, 0.032);
    previousFrame = time;
    emojiContext.clearRect(0, 0, emojiWidth, emojiHeight);
    emojiBodies.forEach((body) => {
      if (body.dragging) return;
      body.vy += 1150 * delta;
      body.x += body.vx * delta;
      body.y += body.vy * delta;
      body.angle += body.spin * delta;
      if (body.x < emojiRadius || body.x > emojiWidth - emojiRadius) {
        body.x = Math.min(Math.max(body.x, emojiRadius), emojiWidth - emojiRadius);
        body.vx *= -0.62;
      }
      if (body.y > emojiHeight - emojiRadius) {
        body.y = emojiHeight - emojiRadius;
        body.vy = Math.abs(body.vy) > 55 ? -body.vy * 0.28 : 0;
        body.vx *= 0.93;
        body.spin *= 0.9;
      }
    });
    resolveEmojiCollisions();
    emojiContext.font = "40px 'Apple Color Emoji','Segoe UI Emoji',sans-serif";
    emojiContext.textAlign = "center";
    emojiContext.textBaseline = "middle";
    emojiBodies.forEach((body) => {
      emojiContext.save();
      emojiContext.translate(body.x, body.y);
      emojiContext.rotate(body.angle);
      emojiContext.fillText(body.emoji, 0, 0);
      emojiContext.restore();
    });
    requestAnimationFrame(animateEmojis);
  };

  resizeEmojiCanvas();
  window.addEventListener("resize", resizeEmojiCanvas);
  requestAnimationFrame(animateEmojis);

  const findEmojiAt = (x, y) => {
    for (let index = emojiBodies.length - 1; index >= 0; index -= 1) {
      const body = emojiBodies[index];
      if (Math.hypot(body.x - x, body.y - y) <= emojiRadius * 1.15) return body;
    }
    return null;
  };

  document.addEventListener("pointerdown", (event) => {
    const body = findEmojiAt(event.clientX, event.clientY);
    if (!body) return;
    event.preventDefault();
    event.stopPropagation();
    draggedEmoji = body;
    draggedPointer = event.pointerId;
    body.dragging = true;
    body.vx = 0;
    body.vy = 0;
    previousPointerX = event.clientX;
    previousPointerY = event.clientY;
    previousPointerTime = performance.now();
    document.body.style.cursor = "grabbing";
  }, true);

  document.addEventListener("pointermove", (event) => {
    if (!draggedEmoji || event.pointerId !== draggedPointer) {
      document.body.style.cursor = findEmojiAt(event.clientX, event.clientY) ? "grab" : "";
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    const now = performance.now();
    const elapsed = Math.max((now - previousPointerTime) / 1000, 0.016);
    draggedEmoji.x = Math.min(Math.max(event.clientX, emojiRadius), emojiWidth - emojiRadius);
    draggedEmoji.y = Math.min(Math.max(event.clientY, emojiRadius), emojiHeight - emojiRadius);
    draggedEmoji.vx = Math.max(Math.min((event.clientX - previousPointerX) / elapsed, 900), -900);
    draggedEmoji.vy = Math.max(Math.min((event.clientY - previousPointerY) / elapsed, 900), -900);
    previousPointerX = event.clientX;
    previousPointerY = event.clientY;
    previousPointerTime = now;
  }, true);

  const releaseEmoji = (event) => {
    if (!draggedEmoji || event.pointerId !== draggedPointer) return;
    event.preventDefault();
    event.stopPropagation();
    draggedEmoji.dragging = false;
    draggedEmoji = null;
    draggedPointer = null;
    document.body.style.cursor = "";
  };
  document.addEventListener("pointerup", releaseEmoji, true);
  document.addEventListener("pointercancel", releaseEmoji, true);

  nameLink.addEventListener("click", () => {
    if (reducedMotion.matches) return;
    const origin = nameLink.getBoundingClientRect();
    if (emojiBodies.length >= 25) emojiBodies.shift();
    emojiBodies.push({
      emoji: emojiPool[Math.floor(Math.random() * emojiPool.length)],
      x: origin.left + origin.width / 2,
      y: origin.bottom + emojiRadius,
      vx: 90 + Math.random() * 170,
      vy: -260 - Math.random() * 180,
      angle: 0,
      spin: (Math.random() - 0.5) * 8,
    });
  });
  document.addEventListener("keydown", (event) => {
    if (event.code !== "KeyT" || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey || event.repeat) return;
    const t = event.target;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    if (document.querySelector(".lb.is-open")) return;
    window.open(contactUrl, "_blank", "noopener,noreferrer");
  });
})();
