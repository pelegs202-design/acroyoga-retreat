#!/usr/bin/env node

/**
 * build-blog.mjs — Static blog generator for Acroyoga Retreat
 *
 * Reads JSON article data + HTML templates, produces:
 *   - blog/{slug}/index.html  for each article
 *   - blog/index.html          listing page
 *   - sitemap.xml
 *   - robots.txt
 *
 * Usage:  node build-blog.mjs
 * Requirements: Node.js 18+ (built-in fs/path only)
 */

import fs from 'fs';
import path from 'path';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const BASE_URL = 'https://acroyoga-retreat.vercel.app';
const WORDS_PER_MINUTE = 200;
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Read a file as UTF-8, crash with a clear message if missing. */
function readFile(relPath) {
  const abs = path.join(ROOT, relPath);
  if (!fs.existsSync(abs)) {
    throw new Error(`Missing required file: ${abs}`);
  }
  return fs.readFileSync(abs, 'utf-8');
}

/** Parse a JSON file. */
function readJson(relPath) {
  return JSON.parse(readFile(relPath));
}

/** Replace all `{{key}}` placeholders in a template string. */
function replacePlaceholders(template, vars) {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    // Replace every occurrence of {{key}}
    result = result.replaceAll(`{{${key}}}`, value ?? '');
  }
  return result;
}

/** Strip HTML tags from a string. */
function stripHtml(html) {
  return html.replace(/<[^>]*>/g, '');
}

/** Calculate reading time in minutes (rounded up). */
function calcReadingTime(htmlContent) {
  const text = stripHtml(htmlContent).trim();
  if (!text) return 1;
  const words = text.split(/\s+/).length;
  return Math.ceil(words / WORDS_PER_MINUTE);
}

/** Format a date as YYYY-MM-DD (for sitemap). */
function isoDate(dateStr) {
  return new Date(dateStr).toISOString().split('T')[0];
}

/** Escape a string for safe embedding in XML. */
function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** Escape a string for safe embedding in JSON strings inside HTML. */
function escapeJsonString(str) {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

/** Ensure a directory exists, creating it recursively if needed. */
function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

// ---------------------------------------------------------------------------
// Load templates & data
// ---------------------------------------------------------------------------

console.log('Loading templates...');

const partials = {
  head: readFile('templates/partials/head.html'),
  nav: readFile('templates/partials/nav.html'),
  footer: readFile('templates/partials/footer.html'),
  ctaBanner: readFile('templates/partials/cta-banner.html'),
};

const articleTemplate = readFile('templates/article.html');
const blogIndexTemplate = readFile('templates/blog-index.html');

console.log('Loading data...');

const categories = readJson('content/categories.json');
const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c]));

// Read all article JSON files
const articlesDir = path.join(ROOT, 'content', 'articles');
const articleFiles = fs.readdirSync(articlesDir).filter((f) => f.endsWith('.json'));
const articles = articleFiles.map((f) => readJson(path.join('content', 'articles', f)));

// Build a slug -> article lookup
const articleBySlug = Object.fromEntries(articles.map((a) => [a.slug, a]));

console.log(`Found ${articles.length} articles in ${articleFiles.length} files.`);

// ---------------------------------------------------------------------------
// Clean output directory
// ---------------------------------------------------------------------------

const blogDir = path.join(ROOT, 'blog');
if (fs.existsSync(blogDir)) {
  fs.rmSync(blogDir, { recursive: true, force: true });
}
ensureDir(blogDir);

console.log('Cleaned blog/ directory.');

// ---------------------------------------------------------------------------
// Generate article pages
// ---------------------------------------------------------------------------

/**
 * Build JSON-LD BlogPosting structured data for an article.
 */
function buildJsonLd(article, readingTime) {
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.description,
    datePublished: article.publishDate,
    url: `${BASE_URL}/blog/${article.slug}/`,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${BASE_URL}/blog/${article.slug}/`,
    },
    wordCount: stripHtml(article.content).split(/\s+/).length,
    timeRequired: `PT${readingTime}M`,
    publisher: {
      '@type': 'Organization',
      name: 'Acroyoga Retreat',
      url: BASE_URL,
    },
  };
  return `<script type="application/ld+json">\n${JSON.stringify(ld, null, 2)}\n</script>`;
}

/**
 * Build breadcrumb HTML for an article.
 */
function buildBreadcrumb(article, category) {
  return `<nav aria-label="breadcrumb" class="breadcrumb">
  <ol itemscope itemtype="https://schema.org/BreadcrumbList">
    <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
      <a itemprop="item" href="/"><span itemprop="name">Home</span></a>
      <meta itemprop="position" content="1" />
    </li>
    <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
      <a itemprop="item" href="/blog/"><span itemprop="name">Blog</span></a>
      <meta itemprop="position" content="2" />
    </li>
    <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
      <span itemprop="name">${escapeXml(article.title)}</span>
      <meta itemprop="position" content="3" />
    </li>
  </ol>
</nav>`;
}

/**
 * Build related-articles HTML cards (up to 3).
 */
function buildRelatedArticles(article) {
  if (!article.relatedSlugs || article.relatedSlugs.length === 0) {
    return '';
  }

  const related = article.relatedSlugs
    .map((slug) => articleBySlug[slug])
    .filter(Boolean)
    .slice(0, 3);

  if (related.length === 0) return '';

  const cards = related
    .map((rel) => {
      const cat = categoryMap[rel.category] || { hebrew: '', emoji: '', color: '' };
      const rt = calcReadingTime(rel.content);
      return `    <a href="/blog/${rel.slug}/" class="related-card">
      <span class="related-card__emoji">${rel.heroEmoji}</span>
      <span class="related-card__category" style="color:${cat.color}">${cat.emoji} ${cat.hebrew}</span>
      <h3 class="related-card__title">${escapeXml(rel.title)}</h3>
      <p class="related-card__description">${escapeXml(rel.description)}</p>
      <span class="related-card__meta">${rt} min read</span>
    </a>`;
    })
    .join('\n');

  return `<section class="related-articles">
  <h2>Related Articles</h2>
  <div class="related-articles__grid">
${cards}
  </div>
</section>`;
}

/**
 * Assemble a full article page from templates + data.
 */
function buildArticlePage(article) {
  const category = categoryMap[article.category] || {
    id: article.category,
    hebrew: article.category,
    emoji: '',
    color: '',
  };
  const readingTime = calcReadingTime(article.content);
  const canonicalUrl = `${BASE_URL}/blog/${article.slug}/`;
  const jsonLd = buildJsonLd(article, readingTime);
  const breadcrumb = buildBreadcrumb(article, category);
  const relatedArticles = buildRelatedArticles(article);

  // 1. Build the <head> partial with page-level placeholders
  const head = replacePlaceholders(partials.head, {
    pageTitle: `${article.title} | Acroyoga Retreat Blog`,
    pageDescription: article.description,
    canonicalUrl,
    jsonLd,
  });

  // 2. Assemble the full page from the article template
  let page = articleTemplate;

  // Insert partials
  page = page.replaceAll('{{head}}', head);
  page = page.replaceAll('{{nav}}', partials.nav);
  page = page.replaceAll('{{footer}}', partials.footer);
  page = page.replaceAll('{{ctaBanner}}', partials.ctaBanner);

  // Insert article-specific data
  page = replacePlaceholders(page, {
    title: article.title,
    description: article.description,
    content: article.content,
    category: article.category,
    categoryHebrew: category.hebrew,
    categoryEmoji: category.emoji,
    publishDate: article.publishDate,
    readingTime: String(readingTime),
    heroEmoji: article.heroEmoji,
    slug: article.slug,
    canonicalUrl,
    relatedArticles,
    breadcrumb,
  });

  return page;
}

console.log('Generating article pages...');

for (const article of articles) {
  const html = buildArticlePage(article);
  const dir = path.join(blogDir, article.slug);
  ensureDir(dir);
  fs.writeFileSync(path.join(dir, 'index.html'), html, 'utf-8');
  console.log(`  -> blog/${article.slug}/index.html`);
}

// ---------------------------------------------------------------------------
// Generate blog index page
// ---------------------------------------------------------------------------

console.log('Generating blog index...');

// Sort articles by publishDate descending (newest first)
const sortedArticles = [...articles].sort(
  (a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
);

function buildArticleCard(article) {
  const category = categoryMap[article.category] || {
    hebrew: article.category,
    emoji: '',
    color: '',
  };
  const readingTime = calcReadingTime(article.content);

  return `  <a href="/blog/${article.slug}/" class="article-card" data-category="${article.category}">
    <span class="article-card__emoji">${article.heroEmoji}</span>
    <div class="article-card__body">
      <span class="article-card__category" style="color:${category.color}">${category.emoji} ${category.hebrew}</span>
      <h2 class="article-card__title">${escapeXml(article.title)}</h2>
      <p class="article-card__description">${escapeXml(article.description)}</p>
      <div class="article-card__meta">
        <time datetime="${article.publishDate}">${article.publishDate}</time>
        <span>${readingTime} min read</span>
      </div>
    </div>
  </a>`;
}

const articleCards = sortedArticles.map(buildArticleCard).join('\n');
const categoriesJson = JSON.stringify(categories);

// Build the head partial for the index page
const indexHead = replacePlaceholders(partials.head, {
  pageTitle: 'Blog | Acroyoga Retreat',
  pageDescription: 'Articles, guides and tips about acroyoga, retreats, and partner acrobatics.',
  canonicalUrl: `${BASE_URL}/blog/`,
  jsonLd: '',
});

let indexPage = blogIndexTemplate;
indexPage = indexPage.replaceAll('{{head}}', indexHead);
indexPage = indexPage.replaceAll('{{nav}}', partials.nav);
indexPage = indexPage.replaceAll('{{footer}}', partials.footer);
indexPage = indexPage.replaceAll('{{ctaBanner}}', partials.ctaBanner);
indexPage = replacePlaceholders(indexPage, {
  articleCards,
  categoriesJson,
});

fs.writeFileSync(path.join(blogDir, 'index.html'), indexPage, 'utf-8');
console.log('  -> blog/index.html');

// ---------------------------------------------------------------------------
// Generate sitemap.xml
// ---------------------------------------------------------------------------

console.log('Generating sitemap.xml...');

const today = new Date().toISOString().split('T')[0];

const sitemapEntries = [
  `  <url>\n    <loc>${BASE_URL}/</loc>\n    <lastmod>${today}</lastmod>\n    <priority>1.0</priority>\n  </url>`,
  `  <url>\n    <loc>${BASE_URL}/blog/</loc>\n    <lastmod>${today}</lastmod>\n    <priority>0.8</priority>\n  </url>`,
];

for (const article of sortedArticles) {
  const lastmod = isoDate(article.publishDate);
  sitemapEntries.push(
    `  <url>\n    <loc>${BASE_URL}/blog/${article.slug}/</loc>\n    <lastmod>${lastmod}</lastmod>\n    <priority>0.6</priority>\n  </url>`
  );
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries.join('\n')}
</urlset>
`;

fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemap, 'utf-8');
console.log('  -> sitemap.xml');

// ---------------------------------------------------------------------------
// Generate robots.txt
// ---------------------------------------------------------------------------

console.log('Generating robots.txt...');

const robotsTxt = `User-agent: *
Allow: /
Sitemap: ${BASE_URL}/sitemap.xml
`;

fs.writeFileSync(path.join(ROOT, 'robots.txt'), robotsTxt, 'utf-8');
console.log('  -> robots.txt');

// ---------------------------------------------------------------------------
// Done
// ---------------------------------------------------------------------------

console.log(`\nBuild complete! Generated ${articles.length} article pages + index + sitemap + robots.txt`);
