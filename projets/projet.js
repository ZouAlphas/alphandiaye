/* Script commun aux fiches projet : thème, menu mobile, barre de navigation. */
(function () {
  const root = document.documentElement;
  function applyTheme(t) {
    root.setAttribute('data-theme', t);
    try { localStorage.setItem('theme', t); } catch (e) { }
    const sun = document.getElementById('icon-sun'), moon = document.getElementById('icon-moon');
    if (sun) sun.style.display = t === 'light' ? 'block' : 'none';
    if (moon) moon.style.display = t === 'dark' ? 'block' : 'none';
  }
  window.toggleTheme = function () {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.classList.add('vt'); applyTheme(next); setTimeout(() => root.classList.remove('vt'), 60);
  };
  window.toggleMobile = () => document.getElementById('mobile-menu').classList.toggle('open');
  window.closeMobile = () => document.getElementById('mobile-menu').classList.remove('open');
  applyTheme(root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');
  const nav = document.getElementById('nav');
  const state = () => nav.classList.toggle('scrolled', scrollY > 12);
  addEventListener('scroll', state, { passive: true }); state();
  addEventListener('keydown', e => { if (e.key === 'Escape') closeMobile(); });
  /* Vidéos : le lecteur Google Drive n'est chargé qu'au clic */
  document.querySelectorAll('.video-facade[data-video]').forEach(f => f.addEventListener('click', () => {
    if (f.querySelector('iframe')) return;
    const fr = document.createElement('iframe');
    fr.src = 'https://drive.google.com/file/d/' + f.dataset.video + '/preview';
    fr.allow = 'autoplay; fullscreen'; fr.allowFullscreen = true; fr.title = (f.querySelector('img') || {}).alt || 'Vidéo';
    f.replaceChildren(fr); f.style.cursor = 'auto';
    if (typeof track === 'function') track('video_play');
  }));
})();
