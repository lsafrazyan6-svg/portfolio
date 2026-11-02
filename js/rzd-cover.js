(() => {
  const video = document.querySelector('.rzd-cover-video');
  if (!video) return;

  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let visible = false;

  const update = () => {
    if (!visible || document.hidden || motion.matches) {
      video.pause();
      return;
    }
    if (!video.getAttribute('src')) video.src = video.dataset.src;
    video.play().catch(() => {});
  };

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    update();
  }, { threshold: 0.15 }).observe(video);

  motion.addEventListener('change', update);
  document.addEventListener('visibilitychange', update);
})();
