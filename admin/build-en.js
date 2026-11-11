/* ═══════════════════════════════════════════════════════════════
   Génération des pages anglaises (/en/…) à partir des pages françaises.

   - Accueil : le texte anglais vient du bloc <script id="i18n-en"> de index.html.
   - Fiches projet : le texte anglais vient des balises lang="en" de chaque fiche.

   Ce fichier est utilisé à deux endroits :
     1. l'admin (navigateur) régénère en/index.html à chaque publication ;
     2. tools/build-en.mjs (Node) régénère toutes les pages anglaises d'un coup.
   ═══════════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';
  const SITE = 'https://alphandiaye.online';
  const ARIA_EN = {
    'Changer de thème': 'Change theme', 'Changer le thème': 'Change theme', 'Ouvrir le menu': 'Open menu',
    'Votre nom': 'Your name', 'Votre email': 'Your email', 'Sujet': 'Subject', 'Votre message': 'Your message',
    'Retour en haut': 'Back to top', 'Écrire sur WhatsApp': 'Message on WhatsApp'
  };
  const JSONLD_EN = {
    'Consultant ERP Odoo & transformation digitale': 'Odoo ERP consultant & digital transformation',
    'Migration ERP': 'ERP migration', 'Gestion de projet': 'Project management',
    'Transformation digitale': 'Digital transformation', 'Optimisation des processus': 'Process optimisation',
    'Formation des utilisateurs': 'User training', 'Identité visuelle': 'Visual identity'
  };

  const parse = html => new DOMParser().parseFromString(html, 'text/html');
  const out = doc => '<!DOCTYPE html>\n' + doc.documentElement.outerHTML + '\n';
  const meta = (doc, sel, val) => { const m = doc.querySelector(sel); if (m && val) m.setAttribute('content', val); };

  /* Chemins relatifs (images/…, cv/…) → absolus, pour que la page fonctionne depuis /en/ */
  function absolutize(doc) {
    doc.querySelectorAll('[src],[href]').forEach(el => ['src', 'href'].forEach(a => {
      const v = el.getAttribute(a);
      if (v && /^(images|cv|docs|vendor|fonts|projets)\//.test(v)) el.setAttribute(a, '/' + v);
    }));
  }
  function hreflang(doc, frPath) {
    doc.querySelectorAll('link[rel="alternate"][hreflang]').forEach(l => { if (l.previousSibling && l.previousSibling.nodeType === 3) l.previousSibling.remove(); l.remove(); });
    const canon = doc.querySelector('link[rel="canonical"]');
    if (!canon) return;
    canon.setAttribute('href', SITE + '/en' + frPath);
    [['x-default', frPath], ['en', '/en' + frPath], ['fr', frPath]].forEach(([l, p]) => {
      const k = doc.createElement('link'); k.setAttribute('rel', 'alternate'); k.setAttribute('hreflang', l); k.setAttribute('href', SITE + p);
      canon.after(k);
    });
  }
  function social(doc, title, desc, frPath) {
    meta(doc, 'meta[name="description"]', desc);
    meta(doc, 'meta[property="og:title"]', title);
    meta(doc, 'meta[property="og:description"]', desc);
    meta(doc, 'meta[name="twitter:title"]', title);
    meta(doc, 'meta[name="twitter:description"]', desc);
    meta(doc, 'meta[property="og:url"]', SITE + '/en' + frPath);
    meta(doc, 'meta[property="og:locale"]', 'en_US');
    meta(doc, 'meta[property="og:locale:alternate"]', 'fr_FR');
    const alt = doc.querySelector('meta[property="og:image:alt"]');
    if (alt) alt.setAttribute('content', 'Alpha Ndiaye, Odoo ERP consultant, Odoo 19 certified, Dakar, Senegal');
  }
  function jsonld(doc, fn) {
    doc.querySelectorAll('script[type="application/ld+json"]').forEach(s => {
      try { const d = JSON.parse(s.textContent); fn(d); s.textContent = JSON.stringify(d); } catch (e) { /* bloc laissé tel quel */ }
    });
  }

  /* ── Accueil ── */
  function buildEnHome(html) {
    const doc = parse(html);
    let d = {};
    const dict = doc.getElementById('i18n-en');
    try { d = JSON.parse(dict.textContent); } catch (e) { }
    doc.querySelectorAll('[data-i18n]').forEach(el => { const k = el.getAttribute('data-i18n'); if (d[k]) el.innerHTML = d[k]; });
    doc.querySelectorAll('[data-i18n-ph]').forEach(el => { const k = el.getAttribute('data-i18n-ph'); if (d[k]) el.setAttribute('placeholder', d[k]); });
    doc.querySelectorAll('[aria-label],[title]').forEach(el => ['aria-label', 'title'].forEach(a => {
      const fr = el.getAttribute(a); if (!fr) return;
      const k = a === 'aria-label' && el.getAttribute('data-i18n-aria');
      const m = fr.match(/^Site web de (.+) \(nouvel onglet\)$/);
      el.setAttribute(a, k && d[k] ? d[k] : m ? m[1] + ' website (opens in a new tab)' : (ARIA_EN[fr] || fr));
    }));
    doc.querySelectorAll('[data-aria-fr]').forEach(el => el.removeAttribute('data-aria-fr'));
    doc.querySelectorAll('[data-i18n-title]').forEach(el => { const t = d[el.getAttribute('data-i18n-title')]; if (t) { el.setAttribute('data-title', t); el.setAttribute('aria-label', 'Play video: ' + t); } });
    doc.querySelectorAll('a[data-cv]').forEach(a => a.setAttribute('href', '/cv/CV_Alpha_Ndiaye_EN.pdf'));
    absolutize(doc);
    doc.querySelectorAll('a[href^="/projets/"]').forEach(a => a.setAttribute('href', '/en' + a.getAttribute('href')));
    doc.querySelectorAll('.lang-btn[data-lang]').forEach(a => {
      const on = a.getAttribute('data-lang') === 'en';
      a.classList.toggle('on', on);
      on ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current');
    });
    doc.documentElement.setAttribute('lang', 'en');
    const title = d['meta.title'] || doc.title, desc = d['meta.desc'];
    doc.title = title;
    social(doc, title.split(' | ')[0], desc, '/');
    hreflang(doc, '/');
    jsonld(doc, data => (data['@graph'] || []).forEach(n => {
      if (n['@type'] === 'Person') {
        if (JSONLD_EN[n.jobTitle]) n.jobTitle = JSONLD_EN[n.jobTitle];
        if (desc) n.description = desc;
        if (Array.isArray(n.knowsAbout)) n.knowsAbout = n.knowsAbout.map(x => JSONLD_EN[x] || x);
      }
      if (n['@type'] === 'ProfilePage') { n.url = SITE + '/en/'; n.inLanguage = 'en'; }
    }));
    if (dict) dict.remove();
    return out(doc);
  }

  /* ── Fiche projet ── */
  function buildEnProject(html, slug) {
    const doc = parse(html), frPath = '/projets/' + slug + '/';
    doc.querySelectorAll('body [lang="fr"]').forEach(el => el.remove());
    doc.documentElement.setAttribute('lang', 'en');
    doc.querySelectorAll('a[href]').forEach(a => {
      const h = a.getAttribute('href');
      if (a.closest('.lang-sw')) return;
      if (h === '/' || h.startsWith('/#') || h.startsWith('/projets/')) a.setAttribute('href', '/en' + h);
    });
    doc.querySelectorAll('.lang-btn[data-lang]').forEach(a => {
      const on = a.getAttribute('data-lang') === 'en';
      a.classList.toggle('on', on);
      on ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current');
    });
    const h1 = (doc.querySelector('h1') || {}).textContent || doc.title;
    const para = [...doc.querySelectorAll('main section p')].map(p => p.textContent.trim()).find(t => t.length > 40) || '';
    let desc = para;
    if (desc.length > 158) { desc = desc.slice(0, 157); desc = desc.slice(0, desc.lastIndexOf(' ')).replace(/[,;:.]$/, '') + '…'; }
    const title = h1.trim() + ' | Alpha Ndiaye, Odoo consultant';
    doc.title = title;
    social(doc, h1.trim() + ' · Alpha Ndiaye', desc, frPath);
    hreflang(doc, frPath);
    jsonld(doc, data => (data['@graph'] || []).forEach(n => {
      if (n['@type'] === 'CreativeWork') { n.name = h1.trim(); n.description = desc; n.url = SITE + '/en' + frPath; n.inLanguage = 'en'; delete n.keywords; }
      if (n['@type'] === 'BreadcrumbList') (n.itemListElement || []).forEach(it => {
        if (typeof it.item === 'string') it.item = it.item.replace(SITE + '/', SITE + '/en/');
        if (it.name === 'Réalisations') it.name = 'Projects';
        if (it.position === (n.itemListElement || []).length) it.name = h1.trim();
      });
    }));
    return out(doc);
  }

  root.BuildEn = { buildEnHome, buildEnProject };
})(typeof window !== 'undefined' ? window : globalThis);
