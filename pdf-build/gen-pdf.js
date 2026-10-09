import { readFileSync, writeFileSync } from 'fs';
import { marked, Renderer } from 'marked';
import puppeteer from 'puppeteer-core';

const DOCS = [
  ['00', '00-overview.md'],
  ['01', '01-requirements.md'],
  ['02', '02-architecture.md'],
  ['03', '03-ui-ux.md'],
  ['04', '04-deployment.md'],
  ['05', '05-roadmap.md'],
];

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// ---------- Markdown -> HTML ----------
const toc = []; // {num, title, subs:[{id,title}]}

function renderMd(num, text) {
  const r = new Renderer();
  r.heading = function ({ tokens, depth }) {
    const html = this.parser.parseInline(tokens);
    const plain = tokens.map((t) => t.raw ?? t.text ?? '').join('').replace(/`/g, '');
    const id = `d${num}-` + slug(plain);
    if (depth === 1) toc.find((e) => e.num === num).title = plain.replace(/^ProjectBoard —\s*/, '');
    if (depth === 2) toc.find((e) => e.num === num).subs.push({ id, title: plain.replace(/^\d+\.\d+\s*/, '') });
    return `<h${depth} id="${id}">${html}</h${depth}>`;
  };
  r.link = function ({ href, title, tokens }) {
    const inner = this.parser.parseInline(tokens);
    if (/^\d{2}-[a-z-]+\.md$/.test(href)) href = `#doc-${href.slice(0, 2)}`;
    if (href === '#') return `<span class="deadlink">${inner}</span>`;
    return `<a href="${href}" ${title ? `title="${title}"` : ''}>${inner}</a>`;
  };
  marked.use({ renderer: r });
  let html = marked.parse(text);

  // Replace the mermaid block in the architecture doc with a hand-built diagram
  if (num === '02') {
    const diagram = `
    <div class="arch-diagram">
      <div class="layer">
        <div class="node primary">Browser</div>
        <div class="arrow">&#8594;</div>
        <div class="node">Reverse Proxy<br><small>TLS termination</small></div>
        <div class="arrow">&#8594;</div>
        <div class="node primary">App Server<br><small>Next.js + tRPC</small></div>
      </div>
      <div class="layer">
        <div class="node db">PostgreSQL 15+<br><small>system of record</small></div>
        <div class="node opt">Redis<br><small>rate limiting · optional</small></div>
        <div class="node opt">S3 Storage<br><small>avatars &amp; attachments · optional</small></div>
        <div class="node opt">SMTP<br><small>email · optional</small></div>
        <div class="node opt">OAuth / OIDC<br><small>identity providers · optional</small></div>
      </div>
      <div class="layer">
        <div class="node ext">External systems &#8594; REST API <code>/api/v1</code> + webhooks</div>
      </div>
    </div>`;
    html = html.replace(/<pre><code class="language-mermaid">[\s\S]*?<\/code><\/pre>/, diagram);
  }
  html = html.replace(/<table>(\s*<thead>\s*<tr>\s*<th>ID<\/th>)/g, '<table class="req"$1');
  return html;
}

const sections = [];
for (const [num, file] of DOCS) {
  toc.push({ num, title: file, subs: [] });
  const md = readFileSync(`../docs/${file}`, 'utf8');
  sections.push({ num, html: renderMd(num, md) });
}

// ---------- HTML document ----------
const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

const tocHtml = toc
  .filter((e) => e.title !== '00-overview.md')
  .map(
    (e) => `
    <div class="toc-row">
      <a class="toc-main" href="#doc-${e.num}"><span class="toc-num">${e.num}</span>${e.title}</a>
    </div>
    ${e.subs
      .map(
        (s) => `<div class="toc-sub"><a href="#${s.id}">${s.title}</a></div>`
      )
      .join('')}`
  )
  .join('');

const body = sections
  .map(
    ({ num, html }) => `
  <section class="doc" id="doc-${num}">
    <div class="divider"><span class="divider-num">${num}</span></div>
    ${html}
  </section>`
  )
  .join('\n');

const pagedPolyfill = readFileSync('./node_modules/pagedjs/dist/paged.polyfill.js', 'utf8');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
<script>${pagedPolyfill}</script>
<style>
:root {
  --ink: #0f172a; --ink-2: #334155; --muted: #64748b; --faint: #94a3b8;
  --accent: #1d4ed8; --accent-soft: #eff6ff;
  --line: #e2e8f0; --bg-soft: #f8fafc;
}
@page {
  size: A4;
  margin: 20mm 18mm 18mm 18mm;
  @bottom-left { content: "ProjectBoard — Proposal & Requirements"; font-family: Inter; font-size: 7.5pt; color: #94a3b8; }
  @bottom-right { content: counter(page); font-family: Inter; font-size: 8pt; font-weight: 600; color: #475569; }
}
@page cover { margin: 0; @bottom-left { content: none; } @bottom-right { content: none; } }
@page toc { @bottom-left { content: "ProjectBoard — Proposal & Requirements"; font-family: Inter; font-size: 7.5pt; color: #94a3b8; } }

* { box-sizing: border-box; }
html { font-size: 10pt; }
body { font-family: Inter, "Segoe UI", system-ui, sans-serif; color: var(--ink); line-height: 1.55; margin: 0; }
h1, h2, h3 { letter-spacing: -0.02em; color: var(--ink); }
h1 { font-size: 23pt; font-weight: 800; margin: 0 0 4pt; line-height: 1.15; }
h2 { font-size: 14pt; font-weight: 700; margin: 18pt 0 8pt; padding-bottom: 5pt; border-bottom: 1.5px solid var(--ink); page-break-after: avoid; }
h3 { font-size: 11pt; font-weight: 700; margin: 12pt 0 5pt; page-break-after: avoid; }
p { margin: 5pt 0; }
a { color: var(--accent); text-decoration: none; }
strong { font-weight: 650; }
ul, ol { margin: 5pt 0 7pt; padding-left: 16pt; }
li { margin: 2.5pt 0; }
blockquote { margin: 8pt 0; padding: 7pt 11pt; background: var(--bg-soft); border-left: 3px solid var(--accent); color: var(--ink-2); font-size: 9pt; border-radius: 0 6px 6px 0; }
hr { border: none; border-top: 1px solid var(--line); margin: 12pt 0; }
code { font-family: "JetBrains Mono", Consolas, monospace; font-size: 8pt; background: var(--bg-soft); padding: 1px 4px; border-radius: 4px; }
pre { font-family: "JetBrains Mono", Consolas, monospace; font-size: 7.6pt; line-height: 1.5; background: #0f172a; color: #e2e8f0; padding: 11pt 13pt; border-radius: 8px; white-space: pre-wrap; page-break-inside: avoid; }
pre code { background: none; color: inherit; padding: 0; font-size: inherit; }
table { width: 100%; border-collapse: collapse; margin: 8pt 0 12pt; font-size: 8.6pt; page-break-inside: auto; }
thead { display: table-header-group; }
th { text-align: left; font-size: 7.2pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: var(--muted); padding: 5pt 7pt; border-bottom: 2px solid var(--ink); }
td { padding: 5pt 7pt; border-bottom: 1px solid var(--line); vertical-align: top; }
tr { page-break-inside: avoid; }
tr:nth-child(even) td { background: #fcfdfe; }
code.deadlink { color: var(--ink-2); }

/* ---------- Cover ---------- */
.cover { page: cover; width: 210mm; height: 296.5mm; position: relative; padding: 26mm 22mm; display: flex; flex-direction: column; }
.cover .brandline { display: flex; align-items: center; gap: 8px; }
.cover .mark { width: 26px; height: 26px; border-radius: 7px; background: linear-gradient(135deg, #1d4ed8, #7c3aed); }
.cover .brand { font-weight: 700; font-size: 11pt; letter-spacing: -0.01em; }
.cover .hero { margin-top: 58mm; }
.cover .kicker { font-size: 9pt; font-weight: 700; letter-spacing: 0.22em; text-transform: uppercase; color: var(--accent); margin-bottom: 10pt; }
.cover h1.title { font-size: 42pt; font-weight: 800; letter-spacing: -0.035em; line-height: 1.02; margin: 0; }
.cover .sub { font-size: 13.5pt; color: var(--ink-2); margin-top: 10pt; max-width: 130mm; line-height: 1.5; }
.cover .rule { width: 34mm; height: 3px; background: linear-gradient(90deg, #1d4ed8, #7c3aed); border-radius: 2px; margin-top: 16pt; }
.cover .meta { margin-top: auto; border-top: 1px solid var(--line); padding-top: 10pt; display: flex; gap: 24mm; font-size: 8.5pt; color: var(--muted); }
.cover .meta b { display: block; font-size: 9.5pt; color: var(--ink); font-weight: 650; margin-top: 2pt; }
.cover .band { position: absolute; left: 0; right: 0; bottom: 0; height: 7mm; background: linear-gradient(90deg, #1d4ed8, #7c3aed, #db2777); }

/* ---------- Table of contents ---------- */
.tocpage { page: toc; page-break-before: page; }
.tocpage h1 { font-size: 26pt; margin-bottom: 4pt; }
.toc-note { color: var(--muted); font-size: 9pt; margin-bottom: 14pt; }
.toc-row { margin-top: 9pt; }
a.toc-main { display: flex; align-items: baseline; gap: 8pt; font-weight: 700; font-size: 11.5pt; color: var(--ink); }
.toc-num { font-size: 8.5pt; font-weight: 800; color: var(--accent); min-width: 16pt; }
.toc-sub { margin-left: 24pt; font-size: 9pt; }
.toc-sub a { color: var(--ink-2); display: flex; }
a.toc-main::after, .toc-sub a::after { content: target-counter(attr(href), page); margin-left: auto; padding-left: 8pt; font-weight: 600; color: var(--ink-2); font-size: 8.5pt; }
table.req td:first-child { white-space: nowrap; font-weight: 600; color: var(--ink-2); }

/* ---------- Sections ---------- */
.doc { page-break-before: page; }
.divider { display: flex; align-items: center; gap: 10pt; margin-bottom: 10pt; }
.divider-num { font-size: 9pt; font-weight: 800; color: #fff; background: linear-gradient(135deg, #1d4ed8, #7c3aed); padding: 3pt 8pt; border-radius: 6px; letter-spacing: 0.05em; }
.divider::after { content: ""; flex: 1; border-top: 1px solid var(--line); }
.doc h1:first-of-type { margin-bottom: 2pt; }

/* ---------- Architecture diagram ---------- */
.arch-diagram { display: flex; flex-direction: column; gap: 7pt; margin: 10pt 0 14pt; padding: 12pt; background: var(--bg-soft); border: 1px solid var(--line); border-radius: 10px; page-break-inside: avoid; }
.arch-diagram .layer { display: flex; align-items: center; gap: 6pt; flex-wrap: wrap; }
.arch-diagram .node { background: #fff; border: 1px solid var(--line); border-radius: 8px; padding: 6pt 10pt; font-size: 8.4pt; font-weight: 600; text-align: center; box-shadow: 0 1px 2px rgba(15,23,42,.05); }
.arch-diagram .node small { font-weight: 500; color: var(--muted); font-size: 7.2pt; }
.arch-diagram .node.primary { border-color: #1d4ed8; background: var(--accent-soft); }
.arch-diagram .node.db { border-color: #0f172a; }
.arch-diagram .node.opt { border-style: dashed; color: var(--ink-2); }
.arch-diagram .node.ext { font-weight: 500; color: var(--ink-2); }
.arch-diagram .arrow { color: var(--faint); font-size: 12pt; }

h1, h2, h3 { page-break-after: avoid; }
</style>
</head>
<body>

<div class="cover">
  <div class="brandline"><div class="mark"></div><div class="brand">ProjectBoard</div></div>
  <div class="hero">
    <div class="kicker">Product Proposal &amp; Requirements</div>
    <h1 class="title">Visual project management,<br>self-hosted and white-label.</h1>
    <div class="sub">A modern Kanban-style workspace for teams — boards, cards, and collaboration that runs entirely on your infrastructure.</div>
    <div class="rule"></div>
  </div>
  <div class="meta">
    <div>Prepared for<b>[Client name]</b></div>
    <div>Prepared by<b>[Your company]</b></div>
    <div>Version<b>1.0 — ${today}</b></div>
  </div>
  <div class="band"></div>
</div>

<div class="tocpage">
  <h1>Contents</h1>
  <div class="toc-note">ProjectBoard is a placeholder product name, to be replaced with the client's brand.</div>
  ${tocHtml}
</div>

${body}

</body>
</html>`;

writeFileSync('document.html', html);

// ---------- Render to PDF ----------
const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  protocolTimeout: 300000,
  args: ['--no-sandbox', '--disable-gpu', '--force-color-profile=srgb', '--font-render-hinting=none'],
});
const page = await browser.newPage();
page.on('console', (m) => { if (m.type() === 'error') console.error('PAGE:', m.text()); });
page.on('pageerror', (e) => console.error('PAGEERROR:', e.message));
await page.goto('file:///' + process.cwd().replace(/\\/g, '/') + '/document.html', { waitUntil: 'load', timeout: 60000 });
// paged.js may already have finished rendering by now — just wait for pages to exist
await page.waitForFunction('document.querySelectorAll(".pagedjs_page").length > 0', { timeout: 90000, polling: 500 });
await page.evaluate(() => Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 10000))]));
await new Promise((r) => setTimeout(r, 1000));
await page.pdf({
  path: '../ProjectBoard-Proposal.pdf',
  format: 'A4',
  printBackground: true,
  preferCSSPageSize: true,
  margin: { top: 0, right: 0, bottom: 0, left: 0 },
});
await browser.close();
console.log('PDF written to ../ProjectBoard-Proposal.pdf');
