(() => {
  const root = document.documentElement;
  const button = document.getElementById("theme-toggle");
  let audioContext;
  const syncButton = () => {
    const dark = root.dataset.theme === "dark";
    button.setAttribute("aria-pressed", String(dark));
    button.setAttribute("aria-label", dark ? "Включить светлую тему" : "Включить тёмную тему");
    button.title = dark ? "Светлая тема" : "Тёмная тема";
  };
  const playClick = () => {
    // A short, locally generated switch click; no sound file or network request.
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      audioContext ||= new AudioContext();
      const play = () => {
        const now = audioContext.currentTime;
        const buffer = audioContext.createBuffer(1, Math.ceil(audioContext.sampleRate * .065), audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) {
          const t = i / audioContext.sampleRate;
          const pulse = Math.exp(-t * 150) + (t > .018 ? .5 * Math.exp(-(t - .018) * 180) : 0);
          data[i] = (Math.random() * 2 - 1) * pulse;
        }
        const source = audioContext.createBufferSource();
        const filter = audioContext.createBiquadFilter();
        const volume = audioContext.createGain();
        source.buffer = buffer;
        filter.type = "bandpass";
        filter.frequency.value = 2100;
        filter.Q.value = .65;
        volume.gain.value = .28;
        source.connect(filter);
        filter.connect(volume);
        volume.connect(audioContext.destination);
        source.onended = () => { source.disconnect(); filter.disconnect(); volume.disconnect(); };
        source.start(now);
      };
      if (audioContext.state === "suspended") audioContext.resume().then(play).catch(() => {});
      else play();
    } catch {}
  };
  button.addEventListener("click", () => {
    playClick();
    const theme = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    try { localStorage.setItem("portfolio-theme", theme); } catch {}
    syncButton();
  });
  window.addEventListener("storage", (event) => {
    if (event.key !== "portfolio-theme") return;
    const theme = event.newValue === "dark" ? "dark" : "light";
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    syncButton();
  });
  syncButton();
})();
