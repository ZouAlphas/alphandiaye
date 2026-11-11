/* Animation jour / nuit : un soleil (ou une lune) apparaît sous le bouton de thème,
   son halo s'ouvre et la nouvelle couleur envahit la page en cercle depuis ce point.
   Léger : une seule couche, aucune image, désactivé si l'utilisateur limite les animations. */
(function () {
  if (window.themeSwitch) return;
  const RM = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const DROP = 46; /* décalage vertical de l'astre sous le bouton */

  const css = `
.theme-fx{position:fixed;inset:0;z-index:2147483000;pointer-events:none;overflow:hidden;view-transition-name:theme-fx;}
.tfx-glow,.tfx-icon,.tfx-star{position:absolute;left:0;top:0;will-change:transform,opacity;}
.tfx-glow{width:560px;height:560px;border-radius:50%;}
.theme-fx[data-mode="light"] .tfx-glow{background:radial-gradient(circle,rgba(255,200,70,.7) 0%,rgba(255,200,70,.25) 35%,rgba(255,206,84,0) 62%);}
.theme-fx[data-mode="dark"] .tfx-glow{background:radial-gradient(circle,rgba(150,180,255,.38) 0%,rgba(150,180,255,.12) 35%,rgba(150,180,255,0) 62%);}
.tfx-icon{width:64px;height:64px;}
.tfx-icon svg{width:100%;height:100%;display:block;overflow:visible;}
.tfx-star{width:4px;height:4px;border-radius:50%;background:#E6EEFF;box-shadow:0 0 6px 1px rgba(200,215,255,.8);}
::view-transition-group(theme-fx),::view-transition-new(theme-fx){animation:none;}
::view-transition-old(theme-fx){display:none;}`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  const SUN = '<svg viewBox="-32 -32 64 64"><g stroke="#F6A609" stroke-width="3.2" stroke-linecap="round">' +
    [0, 45, 90, 135, 180, 225, 270, 315].map(a => `<line x1="0" y1="-21" x2="0" y2="-28" transform="rotate(${a})"/>`).join('') +
    '</g><circle r="14" fill="#FFC93C" stroke="#F6A609" stroke-width="2"/></svg>';
  const MOON = '<svg viewBox="-32 -32 64 64"><path d="M9 -20A21 21 0 1 0 20 9 16 16 0 0 1 9 -20Z" fill="#E9EEFA" stroke="#B9C6E8" stroke-width="1.5" stroke-linejoin="round"/>' +
    '<circle cx="-6" cy="4" r="2.6" fill="#CBD5EE"/><circle cx="1" cy="12" r="1.8" fill="#CBD5EE"/><circle cx="-10" cy="-6" r="1.5" fill="#CBD5EE"/></svg>';

  function layer(x, y, mode) {
    const d = document.createElement('div');
    d.className = 'theme-fx'; d.dataset.mode = mode; d.setAttribute('aria-hidden', 'true');
    const cy = y + DROP;
    const glow = document.createElement('div'); glow.className = 'tfx-glow';
    const icon = document.createElement('div'); icon.className = 'tfx-icon'; icon.innerHTML = mode === 'light' ? SUN : MOON;
    d.append(glow, icon);
    const at = (dx, dy, extra) => `translate(${x + dx}px,${cy + dy}px) translate(-50%,-50%) ${extra || ''}`;
    const T = 1100, E = 'cubic-bezier(.22,.61,.36,1)';
    glow.animate([
      { transform: at(0, 0, 'scale(.15)'), opacity: 0 },
      { transform: at(0, 0, 'scale(.75)'), opacity: 1, offset: .35 },
      { transform: at(0, 0, 'scale(1.25)'), opacity: 0 }
    ], { duration: T, easing: 'ease-out', fill: 'forwards' });
    icon.animate([
      { transform: at(0, -DROP, 'scale(.25) rotate(-60deg)'), opacity: 0 },
      { transform: at(0, 0, 'scale(1.08) rotate(0deg)'), opacity: 1, offset: .38 },
      { transform: at(0, 0, 'scale(1) rotate(12deg)'), opacity: 1, offset: .72 },
      { transform: at(0, 6, 'scale(.85) rotate(20deg)'), opacity: 0 }
    ], { duration: T, easing: E, fill: 'forwards' }).finished.finally(() => d.remove());
    if (mode === 'dark') {
      [[-70, -8], [-42, 38], [-96, 30], [-20, 62], [-64, 74]].forEach(([dx, dy], i) => {
        const s = document.createElement('span'); s.className = 'tfx-star'; d.appendChild(s);
        s.animate([
          { transform: at(dx, dy, 'scale(0)'), opacity: 0 },
          { transform: at(dx, dy, 'scale(1)'), opacity: 1, offset: .5 },
          { transform: at(dx, dy, 'scale(.4)'), opacity: 0 }
        ], { duration: 900, delay: 180 + i * 60, easing: 'ease-out', fill: 'both' });
      });
    }
    return d;
  }

  /* btn : bouton cliqué · next : 'light' | 'dark' · apply : fonction qui applique le thème */
  window.themeSwitch = function (btn, next, apply) {
    if (RM || !btn) { apply(next); return; }
    const r = btn.getBoundingClientRect();
    const x = r.left + r.width / 2, y = r.top + r.height / 2;
    const root = document.documentElement;
    if (!document.startViewTransition) {
      apply(next); document.body.appendChild(layer(x, y, next)); return;
    }
    const cy = y + DROP;
    const end = Math.hypot(Math.max(x, innerWidth - x), Math.max(cy, innerHeight - cy));
    root.classList.add('vt');
    const t = document.startViewTransition(() => { apply(next); document.body.appendChild(layer(x, y, next)); });
    t.ready.then(() => root.animate(
      { clipPath: [`circle(0px at ${x}px ${cy}px)`, `circle(${end}px at ${x}px ${cy}px)`] },
      { duration: 700, delay: 120, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'both', pseudoElement: '::view-transition-new(root)' }
    )).catch(() => { });
    t.finished.finally(() => root.classList.remove('vt'));
  };
})();
