(() => {
  const clock = document.getElementById('home-clock');
  if (!clock) return;
  const format = new Intl.DateTimeFormat('ru-RU', {
    timeZone: 'Europe/Moscow', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
  });
  const update = () => {
    const now = new Date();
    clock.textContent = format.format(now);
    clock.dateTime = now.toISOString();
  };
  update();
  setInterval(update, 1000);
})();
