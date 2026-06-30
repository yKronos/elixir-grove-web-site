import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const cleanedPath = process.argv[2] || "C:\\Users\\Charles Edward\\Downloads\\fra_cleaned.csv";
const perfumesPath = process.argv[3] || "C:\\Users\\Charles Edward\\Downloads\\fra_perfumes.csv";
const outputPath = path.join(projectRoot, "javascript", "product-data.js");
const dataPath = path.join(projectRoot, "public", "data", "fragrances.json");

function parseCsv(text, delimiter) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        field += character;
      }
    } else if (character === '"') {
      quoted = true;
    } else if (character === delimiter) {
      row.push(field);
      field = "";
    } else if (character === "\n") {
      row.push(field.replace(/\r$/, ""));
      if (row.some((value) => value.length)) rows.push(row);
      row = [];
      field = "";
    } else {
      field += character;
    }
  }

  if (field.length || row.length) {
    row.push(field.replace(/\r$/, ""));
    rows.push(row);
  }

  const headers = rows.shift().map((header) => header.replace(/^\uFEFF/, "").trim());
  return rows.map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] || ""])));
}

function fragranceId(url) {
  return url.match(/-(\d+)\.html(?:\?.*)?$/i)?.[1] || null;
}

function titleCase(value) {
  return value
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\p{L}/gu, (character) => character.toUpperCase());
}

function normalizeGender(value) {
  const normalized = value.toLowerCase();
  if (normalized.includes("unisex") || normalized.includes("women and men")) return "Unisex";
  if (normalized.includes("women") || normalized.includes("female")) return "Women";
  if (normalized.includes("men") || normalized.includes("male")) return "Men";
  return "Unisex";
}

function parseList(value) {
  const normalized = value.trim().toLowerCase();
  if (!normalized || normalized === "unknown") return [];
  return normalized
    .split(",")
    .map((item) => titleCase(item))
    .filter(Boolean);
}

function parseRating(value) {
  const rating = Number.parseFloat(value.replace(",", "."));
  return Number.isFinite(rating) ? rating : null;
}

function parseCount(value) {
  const count = Number.parseInt(value.replace(/[^\d]/g, ""), 10);
  return Number.isFinite(count) ? count : 0;
}

function compactDescription(value) {
  return value
    .replace(/([\p{L}\d])by(?=[\p{Lu}\d])/gu, "$1 by ")
    .replace(/([\p{L}\d])is a (?=[\p{Lu}])/gu, "$1 is a ")
    .replace(/([\p{L}\d])was launched/gu, "$1 was launched")
    .replace(/([.!?])(?=[\p{Lu}])/gu, "$1 ")
    .replace(/\s+/g, " ")
    .replace(/\s+([,.!?;:])/g, "$1")
    .trim();
}

const [cleanedBytes, perfumeBytes] = await Promise.all([
  readFile(cleanedPath),
  readFile(perfumesPath)
]);

const cleanedRows = parseCsv(new TextDecoder("windows-1252").decode(cleanedBytes), ";");
const perfumeRows = parseCsv(new TextDecoder("utf-8").decode(perfumeBytes), ",");
const detailsById = new Map();

for (const row of perfumeRows) {
  const id = fragranceId(row.url);
  if (!id || detailsById.has(id)) continue;
  detailsById.set(id, {
    description: compactDescription(row.Description || ""),
    ratingValue: parseRating(row["Rating Value"] || ""),
    ratingCount: parseCount(row["Rating Count"] || "")
  });
}

const products = cleanedRows.flatMap((row) => {
  const sourceUrl = row.url.trim();
  const sourceId = fragranceId(sourceUrl);
  if (!sourceId) return [];

  const accords = [1, 2, 3, 4, 5]
    .map((index) => row[`mainaccord${index}`]?.trim())
    .filter(Boolean)
    .map(titleCase);
  const details = detailsById.get(sourceId) || {};
  const name = titleCase(row.Perfume);
  const brand = titleCase(row.Brand);
  const notes = {
    top: parseList(row.Top),
    middle: parseList(row.Middle),
    base: parseList(row.Base)
  };
  const perfumers = [row.Perfumer1, row.Perfumer2]
    .map((value) => value?.trim())
    .filter((value) => value && value.toLowerCase() !== "unknown");
  const ratingValue = details.ratingValue ?? parseRating(row["Rating Value"] || "");
  const ratingCount = details.ratingCount ?? parseCount(row["Rating Count"] || "");
  const gender = normalizeGender(row.Gender);
  const country = titleCase(row.Country || "");
  const year = Number.parseInt(row.Year, 10) || null;
  const category = accords[0] || "Unclassified";

  return [{
    id: `fra-${sourceId}`,
    sourceId,
    sourceUrl,
    brand,
    name,
    type: "Fragrance",
    category,
    family: category,
    gender,
    longevity: "Not specified",
    country,
    year,
    ratingValue,
    ratingCount,
    accords,
    notes,
    perfumers: perfumers.map(titleCase),
    description: details.description || "",
    searchText: [brand, name, country, gender, ...accords, ...notes.top, ...notes.middle, ...notes.base, ...perfumers]
      .join(" ")
      .toLowerCase()
  }];
});

const payload = {
  source: {
    name: "fra_cleaned.csv + fra_perfumes.csv",
    origin: "User-provided Kaggle exports derived from Fragrantica",
    importedAt: new Date().toISOString(),
    structuredRows: cleanedRows.length,
    detailRows: perfumeRows.length,
    matchedDescriptions: products.filter((product) => product.description).length,
    notes: "The structured 24k catalog is authoritative; the larger file enriches matching fragrance IDs."
  },
  products
};

await mkdir(path.dirname(dataPath), { recursive: true });
await Promise.all([
  writeFile(outputPath, `window.ELIXIR_CATALOG = ${JSON.stringify(payload)};\n`, "utf8"),
  writeFile(dataPath, JSON.stringify(payload), "utf8")
]);

console.log(JSON.stringify({
  outputPath,
  dataPath,
  products: products.length,
  descriptions: payload.source.matchedDescriptions,
  brands: new Set(products.map((product) => product.brand)).size,
  accords: new Set(products.flatMap((product) => product.accords)).size
}, null, 2));
