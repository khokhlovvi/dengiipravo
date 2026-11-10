// Отрисовывает каждую страницу в готовый HTML, чтобы поисковики и браузер видели текст без JS
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const client = path.join(root, 'dist/client');
const server = path.join(root, 'dist/server/entry-server.js');
const { render, pages, site } = await import(pathToFileURL(server).href);
const template = await readFile(path.join(client, 'index.html'), 'utf8');

const esc = s => s.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
const org = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: site.name,
  legalName: site.legal.fullName,
  taxID: site.legal.inn,
  address: { '@type': 'PostalAddress', addressLocality: 'Москва', addressCountry: 'RU' },
  url: site.url,
  telephone: '+7 926 860-49-29',
  email: site.email,
  image: `${site.url}/og.jpg`,
  description: pages['/'].description,
  areaServed: 'RU',
};

const out = { '/': 'index.html', '/solutions': 'solutions/index.html', '/privacy': 'privacy/index.html', '/404': '404.html' };
for (const [route, file] of Object.entries(out)) {
  const { title, description } = pages[route];
  const canonical = route === '/404' ? '' : `${site.url}${route === '/' ? '/' : route}`;
  const head = [
    canonical && `<link rel="canonical" href="${canonical}" />`,
    route === '/404' && '<meta name="robots" content="noindex" />',
    `<meta property="og:type" content="website" />`,
    `<meta property="og:locale" content="ru_RU" />`,
    `<meta property="og:site_name" content="${esc(site.name)}" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
    canonical && `<meta property="og:url" content="${canonical}" />`,
    `<meta property="og:image" content="${site.url}/og.jpg" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    route === '/' && `<script type="application/ld+json">${JSON.stringify(org)}</script>`,
  ].filter(Boolean).join('\n    ');
  const html = template
    .replace(/<title>.*?<\/title>/s, `<title>${esc(title)}</title>`)
    .replace(/<meta name="description" content=".*?" \/>/, `<meta name="description" content="${esc(description)}" />`)
    .replace('<!--head-->', head)
    .replace('<!--app-->', render(route));
  const dest = path.join(client, file);
  await mkdir(path.dirname(dest), { recursive: true });
  await writeFile(dest, html);
  console.log(`prerendered ${route} → ${file}`);
}

const today = new Date().toISOString().slice(0, 10);
const urls = ['/', '/solutions', '/privacy'].map(r => `  <url><loc>${site.url}${r}</loc><lastmod>${today}</lastmod></url>`).join('\n');
await writeFile(path.join(client, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
await writeFile(path.join(client, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${site.url}/sitemap.xml\n`);
await rm(path.join(root, 'dist/server'), { recursive: true, force: true });
console.log('sitemap.xml, robots.txt');
