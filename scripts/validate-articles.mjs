#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

const categoriesPath = path.join(ROOT, "content", "categories.json");
const articlesDir = path.join(ROOT, "content", "articles");

const DAY_MS = 24 * 60 * 60 * 1000;
const START_DATE = "2026-03-25";

const errors = [];
const warnings = [];

function addError(message) {
  errors.push(message);
}

function addWarning(message) {
  warnings.push(message);
}

function safeReadJson(filePath) {
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw);
  } catch (error) {
    addError(`${filePath}: invalid JSON (${error.message})`);
    return null;
  }
}

function toIsoDateUTC(date) {
  return new Date(date).toISOString().slice(0, 10);
}

function parseIsoDate(dateStr) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return null;
  const date = new Date(`${dateStr}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

if (!fs.existsSync(categoriesPath)) {
  addError(`Missing categories file: ${categoriesPath}`);
}

if (!fs.existsSync(articlesDir)) {
  addError(`Missing articles directory: ${articlesDir}`);
}

if (errors.length > 0) {
  for (const error of errors) console.error(`ERROR: ${error}`);
  process.exit(1);
}

const categories = safeReadJson(categoriesPath);
if (!Array.isArray(categories)) {
  addError(`${categoriesPath}: expected JSON array`);
}

const categoryIds = new Set((categories || []).map((c) => c.id));

const fileNames = fs
  .readdirSync(articlesDir)
  .filter((fileName) => fileName.endsWith(".json"))
  .sort();

if (fileNames.length === 0) {
  addError("No article files found");
}

const requiredFields = [
  "slug",
  "title",
  "description",
  "category",
  "tags",
  "publishDate",
  "heroEmoji",
  "content",
  "relatedSlugs",
];

const articles = [];
const slugToFile = new Map();
const idToFile = new Map();

for (const fileName of fileNames) {
  const filePath = path.join(articlesDir, fileName);
  const match = fileName.match(/^(\d{3})-(.+)\.json$/);

  if (!match) {
    addError(`${fileName}: invalid file name format (expected 3-digit-id-slug.json)`);
    continue;
  }

  const id = Number(match[1]);
  const slugFromName = match[2];
  const article = safeReadJson(filePath);

  if (!article || typeof article !== "object" || Array.isArray(article)) {
    addError(`${fileName}: expected JSON object`);
    continue;
  }

  for (const field of requiredFields) {
    if (!(field in article)) {
      addError(`${fileName}: missing required field "${field}"`);
    }
  }

  if (typeof article.slug !== "string" || article.slug.trim() === "") {
    addError(`${fileName}: invalid slug`);
  } else if (article.slug !== slugFromName) {
    addError(`${fileName}: slug mismatch (file slug "${slugFromName}" != JSON slug "${article.slug}")`);
  }

  if (idToFile.has(id)) {
    addError(`${fileName}: duplicate article id ${id} also in ${idToFile.get(id)}`);
  } else {
    idToFile.set(id, fileName);
  }

  if (typeof article.slug === "string" && article.slug.trim() !== "") {
    if (slugToFile.has(article.slug)) {
      addError(`${fileName}: duplicate slug "${article.slug}" also in ${slugToFile.get(article.slug)}`);
    } else {
      slugToFile.set(article.slug, fileName);
    }
  }

  if (typeof article.title !== "string" || article.title.trim() === "") {
    addError(`${fileName}: invalid title`);
  }

  if (typeof article.description !== "string" || article.description.trim() === "") {
    addError(`${fileName}: invalid description`);
  }

  if (!categoryIds.has(article.category)) {
    addError(`${fileName}: unknown category "${article.category}"`);
  }

  if (!Array.isArray(article.tags) || article.tags.length === 0) {
    addError(`${fileName}: tags must be a non-empty array`);
  } else if (article.tags.some((tag) => typeof tag !== "string" || tag.trim() === "")) {
    addError(`${fileName}: all tags must be non-empty strings`);
  }

  const publishDate = parseIsoDate(article.publishDate);
  if (!publishDate) {
    addError(`${fileName}: publishDate must be ISO date YYYY-MM-DD`);
  }

  if (typeof article.heroEmoji !== "string" || article.heroEmoji.trim() === "") {
    addError(`${fileName}: invalid heroEmoji`);
  }

  if (typeof article.content !== "string" || article.content.trim() === "") {
    addError(`${fileName}: invalid content`);
  } else {
    if (!article.content.includes("<h2>")) {
      addWarning(`${fileName}: content has no <h2> headings`);
    }
    if (!article.content.includes("<p>")) {
      addWarning(`${fileName}: content has no <p> paragraphs`);
    }
  }

  if (!Array.isArray(article.relatedSlugs)) {
    addError(`${fileName}: relatedSlugs must be an array`);
  } else if (
    article.relatedSlugs.some(
      (relatedSlug) => typeof relatedSlug !== "string" || relatedSlug.trim() === ""
    )
  ) {
    addError(`${fileName}: relatedSlugs entries must be non-empty strings`);
  }

  articles.push({
    id,
    fileName,
    slug: article.slug,
    publishDate: article.publishDate,
    relatedSlugs: Array.isArray(article.relatedSlugs) ? article.relatedSlugs : [],
  });
}

for (const article of articles) {
  for (const relatedSlug of article.relatedSlugs) {
    if (!slugToFile.has(relatedSlug)) {
      addError(`${article.fileName}: related slug "${relatedSlug}" does not exist`);
    }
  }
}

if (articles.length > 0) {
  const ids = articles.map((article) => article.id);
  const minId = Math.min(...ids);
  const maxId = Math.max(...ids);

  if (minId !== 1) {
    addError(`ID coverage must start at 1, found minimum id ${minId}`);
  }

  for (let id = minId; id <= maxId; id += 1) {
    if (!idToFile.has(id)) {
      addError(`Missing article id ${id} (expected file ${String(id).padStart(3, "0")}-*.json)`);
    }
  }

  const start = parseIsoDate(START_DATE);
  if (!start) {
    addError(`Internal validator error: invalid START_DATE ${START_DATE}`);
  } else {
    for (const article of articles) {
      const expected = toIsoDateUTC(start.getTime() + (article.id - 1) * DAY_MS);
      if (article.publishDate !== expected) {
        addError(
          `${article.fileName}: publishDate ${article.publishDate} does not match expected ${expected} for id ${article.id}`
        );
      }
    }
  }
}

if (warnings.length > 0) {
  for (const warning of warnings) {
    console.warn(`WARN: ${warning}`);
  }
}

if (errors.length > 0) {
  for (const error of errors) {
    console.error(`ERROR: ${error}`);
  }
  console.error(`\nValidation failed with ${errors.length} error(s) and ${warnings.length} warning(s).`);
  process.exit(1);
}

console.log(
  `Validation passed: ${articles.length} article file(s), ${fileNames.length} JSON file(s), ${warnings.length} warning(s).`
);

