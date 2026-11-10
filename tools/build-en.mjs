#!/usr/bin/env node
/* Régénère toutes les pages anglaises (/en/…) et le sitemap à partir des pages françaises.
   À relancer après toute modification faite hors de l'admin :
     npm install --no-save jsdom && node tools/build-en.mjs
   (L'admin régénère lui-même en/index.html à chaque publication.) */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import vm from 'node:vm';

const require = createRequire(import.meta.url);
let JSDOM;
try { ({ JSDOM } = require('jsdom')); }
catch { console.error('jsdom est requis : npm install --no-save jsdom'); process.exit(1); }

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://alphandiaye.online';
globalThis.DOMParser = new JSDOM('').window.DOMParser;
vm.runInThisContext(readFileSync(join(root, 'admin/build-en.js'), 'utf8'));
const { buildEnHome, buildEnProject } = globalThis.BuildEn;

const write = (rel, html) => { const f = join(root, rel); mkdirSync(dirname(f), { recursive: true }); writeFileSync(f, html); console.log('écrit', rel); };

write('en/index.html', buildEnHome(readFileSync(join(root, 'index.html'), 'utf8')));

const home = readFileSync(join(root, 'index.html'), 'utf8');
const slugs = readdirSync(join(root, 'projets')).filter(s => existsSync(join(root, 'projets', s, 'index.html')));
for (const slug of slugs) write(`en/projets/${slug}/index.html`, buildEnProject(readFileSync(join(root, 'projets', slug, 'index.html'), 'utf8'), slug));

/* Sitemap : chaque page avec ses deux langues (seules les fiches liées depuis l'accueil y figurent) */
const today = new Date().toISOString().slice(0, 10);
const paths = ['/', ...slugs.filter(s => home.includes(`/projets/${s}/`)).map(s => `/projets/${s}/`)];
const entry = (p, lang) => `  <url><loc>${SITE}${lang === 'en' ? '/en' : ''}${p}</loc><lastmod>${today}</lastmod>` +
  `<xhtml:link rel="alternate" hreflang="fr" href="${SITE}${p}"/><xhtml:link rel="alternate" hreflang="en" href="${SITE}/en${p}"/>` +
  `<priority>${p === '/' ? (lang === 'en' ? '0.9' : '1.0') : '0.7'}</priority></url>`;
writeFileSync(join(root, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n` +
  paths.flatMap(p => [entry(p, 'fr'), entry(p, 'en')]).join('\n') + `\n</urlset>\n`);
console.log('écrit sitemap.xml');
