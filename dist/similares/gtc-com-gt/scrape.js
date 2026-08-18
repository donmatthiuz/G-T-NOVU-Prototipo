#!/usr/bin/env node
/**
 * Scraper de estilo visual — G&T Continental (gtc.com.gt)
 * ---------------------------------------------------------
 * Descarga el HTML, todas las hojas de estilo (CSS) enlazadas y los
 * estilos inline, y de ahí extrae paleta de color y familias
 * tipográficas usadas — como referencia visual para NOVU (banco que
 * respalda el proyecto, ver referencias/figma_app.md).
 *
 * Solo usa librerías nativas de Node (https/fs) — cero dependencias.
 *
 * Uso: node scrape.js [URL]
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const START_URL = process.argv[2] || 'https://www.gtc.com.gt/';
const OUT_DIR = __dirname;
const CSS_DIR = path.join(OUT_DIR, 'css');

function fetch(url, redirectsLeft = 5) {
  return new Promise((resolve, reject) => {
    https
      .get(
        url,
        {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36',
          },
        },
        (res) => {
          if ([301, 302, 307, 308].includes(res.statusCode) && res.headers.location) {
            if (redirectsLeft <= 0) return reject(new Error('Too many redirects'));
            const next = new URL(res.headers.location, url).toString();
            res.resume();
            return resolve(fetch(next, redirectsLeft - 1));
          }
          const chunks = [];
          res.on('data', (c) => chunks.push(c));
          res.on('end', () =>
            resolve({ url, status: res.statusCode, body: Buffer.concat(chunks).toString('utf8') })
          );
        }
      )
      .on('error', reject);
  });
}

function extractStylesheetLinks(html, baseUrl) {
  const links = [];
  const re = /<link[^>]+rel=["']stylesheet["'][^>]*>/gi;
  let m;
  while ((m = re.exec(html))) {
    const hrefMatch = /href=["']([^"']+)["']/i.exec(m[0]);
    if (hrefMatch) links.push(new URL(hrefMatch[1], baseUrl).toString());
  }
  return [...new Set(links)];
}

function extractInlineStyles(html) {
  const styles = [];
  const re = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let m;
  while ((m = re.exec(html))) styles.push(m[1]);
  return styles;
}

function extractColors(css) {
  const hex = css.match(/#(?:[0-9a-fA-F]{3}){1,2}\b/g) || [];
  const rgb = css.match(/rgba?\([^)]+\)/g) || [];
  return [...new Set([...hex.map((h) => h.toLowerCase()), ...rgb])];
}

function extractFonts(css) {
  const fams = css.match(/font-family\s*:\s*[^;{}]+/gi) || [];
  const cleaned = fams.map((f) =>
    f
      .replace(/font-family\s*:\s*/i, '')
      .replace(/["']/g, '')
      .trim()
  );
  return [...new Set(cleaned)];
}

async function main() {
  fs.mkdirSync(CSS_DIR, { recursive: true });

  console.log(`Descargando ${START_URL} ...`);
  const page = await fetch(START_URL);
  fs.writeFileSync(path.join(OUT_DIR, 'index.html'), page.body);
  console.log(`  → index.html (${page.body.length} bytes, status ${page.status}, url final: ${page.url})`);

  const cssLinks = extractStylesheetLinks(page.body, page.url);
  const inlineStyles = extractInlineStyles(page.body);
  let allCss = inlineStyles.join('\n');

  console.log(`Encontradas ${cssLinks.length} hojas de estilo enlazadas.`);
  for (const [i, link] of cssLinks.entries()) {
    try {
      const res = await fetch(link);
      const filename = `style-${i + 1}.css`;
      fs.writeFileSync(path.join(CSS_DIR, filename), res.body);
      allCss += '\n' + res.body;
      console.log(`  → css/${filename}  (${link})`);
    } catch (e) {
      console.log(`  ✗ no se pudo descargar ${link}: ${e.message}`);
    }
  }

  const colors = extractColors(allCss);
  const fonts = extractFonts(allCss);

  const summary = `# Referencia visual — G&T Continental (${page.url})

Scrapeado el ${new Date().toISOString()} con \`scrape.js\`.

## Archivos
- \`index.html\` — HTML crudo de la página
- \`css/\` — hojas de estilo descargadas (${cssLinks.length})
- \`screenshot.png\` — captura visual de la página (si se generó)

## Paleta de color detectada (${colors.length} valores)

${colors.map((c) => `- \`${c}\``).join('\n')}

## Tipografías detectadas (${fonts.length} declaraciones)

${fonts.map((f) => `- \`${f}\``).join('\n')}
`;

  fs.writeFileSync(path.join(OUT_DIR, 'SUMMARY.md'), summary);
  console.log(`\nListo. ${colors.length} colores y ${fonts.length} font-family detectados.`);
  console.log('Ver SUMMARY.md para el resumen.');
}

main().catch((e) => {
  console.error('FAIL', e);
  process.exit(1);
});
