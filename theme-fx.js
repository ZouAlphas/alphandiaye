/* Animation jour / nuit : un soleil ardent (ou une lune) apparaît sous le bouton de thème,
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
.theme-fx[data-mode="light"] .tfx-glow{background:radial-gradient(circle,rgba(255,236,170,.9) 0%,rgba(255,170,40,.45) 22%,rgba(255,110,20,.15) 42%,rgba(255,110,20,0) 62%);}
.tfx-ring{position:absolute;left:0;top:0;width:150px;height:150px;border-radius:50%;border:3px solid rgba(255,170,40,.75);box-shadow:0 0 18px 4px rgba(255,140,30,.45),inset 0 0 14px rgba(255,200,80,.5);will-change:transform,opacity;}
.theme-fx[data-mode="dark"] .tfx-glow{background:radial-gradient(circle,rgba(150,180,255,.38) 0%,rgba(150,180,255,.12) 35%,rgba(150,180,255,0) 62%);}
.tfx-icon{width:64px;height:64px;}
.theme-fx[data-mode="light"] .tfx-icon{width:78px;height:78px;}
.tfx-icon svg{width:100%;height:100%;display:block;overflow:visible;}
.tfx-star{width:4px;height:4px;border-radius:50%;background:#E6EEFF;box-shadow:0 0 6px 1px rgba(200,215,255,.8);}
::view-transition-group(theme-fx),::view-transition-new(theme-fx){animation:none;}
::view-transition-old(theme-fx){display:none;}`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  function flame(n, r1, r2, seed) {
    let d = '';
    for (let i = 0; i <= n * 2; i++) {
      const a = (i / (n * 2)) * Math.PI * 2;
      const wob = Math.sin(i * 1.7 + seed) * 0.12 + Math.cos(i * 0.9 + seed * 2) * 0.08;
      const r = i % 2 ? r2 * (1 + wob) : r1 * (1 + wob / 3);
      d += (i ? 'L' : 'M') + (Math.cos(a + (i % 2 ? .09 : 0)) * r).toFixed(1) + ' ' + (Math.sin(a + (i % 2 ? .09 : 0)) * r).toFixed(1);
    }
    return d + 'Z';
  }
  const SUN = '<svg viewBox="-32 -32 64 64"><defs>' +
    '<radialGradient id="tfxCore"><stop offset="0" stop-color="#FFFDF2"/><stop offset=".45" stop-color="#FFE7A1"/><stop offset=".8" stop-color="#FFB12E"/><stop offset="1" stop-color="#F26B0F"/></radialGradient>' +
    '<radialGradient id="tfxFire"><stop offset=".55" stop-color="#FFD25A"/><stop offset=".8" stop-color="#FF8A1C"/><stop offset="1" stop-color="#E8430B" stop-opacity="0"/></radialGradient></defs>' +
    '<g class="tfx-c1"><path d="' + flame(14, 17, 30, 1.3) + '" fill="url(#tfxFire)" opacity=".8"/></g>' +
    '<g class="tfx-c2"><path d="' + flame(10, 16, 25, 4.1) + '" fill="url(#tfxFire)"/></g>' +
    '<circle r="16" fill="url(#tfxCore)"/><circle r="16" fill="none" stroke="#FFF6D6" stroke-opacity=".75" stroke-width="1"/></svg>';
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
    if (mode === 'light') {
      const ring = document.createElement('span'); ring.className = 'tfx-ring'; d.appendChild(ring);
      ring.animate([
        { transform: at(0, 0, 'scale(.2)'), opacity: 0 },
        { transform: at(0, 0, 'scale(.35)'), opacity: 1, offset: .3 },
        { transform: at(0, 0, 'scale(1.6)'), opacity: 0 }
      ], { duration: 800, delay: 260, easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'both' });
      const c1 = icon.querySelector('.tfx-c1'), c2 = icon.querySelector('.tfx-c2');
      c1 && c1.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(140deg)' }], { duration: T, fill: 'forwards' });
      c2 && c2.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(-180deg)' }], { duration: T, fill: 'forwards' });
    }
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
